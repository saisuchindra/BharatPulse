/**
 * Conflict & Geopolitical Service
 * Fetches real conflict data from GDELT (free, no key needed).
 * Falls back to curated conflict zones if API is unavailable.
 */
const axios = require('axios');
const cache = require('../utils/cache');
const logger = require('../utils/logger');

// ── Curated conflict zones (fallback + base data enriched by real APIs) ──
const BASE_CONFLICTS = [
  {
    id: 'conflict-1', name: 'Russia-Ukraine Conflict', region: 'Eastern Europe',
    lat: 48.3794, lon: 31.1656, severity: 'HIGH', status: 'Active',
    impactOnIndia: 'Energy prices, fertilizer supply, wheat imports',
    oilRegion: false, escalationLevel: 7,
  },
  {
    id: 'conflict-2', name: 'Israel-Palestine Conflict', region: 'Middle East',
    lat: 31.5, lon: 34.75, severity: 'HIGH', status: 'Active',
    impactOnIndia: 'Oil prices, diaspora safety, shipping routes',
    oilRegion: true, escalationLevel: 8,
  },
  {
    id: 'conflict-3', name: 'Red Sea / Houthi Disruption', region: 'Red Sea',
    lat: 14.5, lon: 42.5, severity: 'MEDIUM', status: 'Active',
    impactOnIndia: 'Shipping costs, trade delays, oil transport',
    oilRegion: true, escalationLevel: 6,
  },
  {
    id: 'conflict-4', name: 'Myanmar Civil Conflict', region: 'Southeast Asia',
    lat: 19.763, lon: 96.0785, severity: 'MEDIUM', status: 'Active',
    impactOnIndia: 'Northeast border security, refugee influx',
    oilRegion: false, escalationLevel: 5,
  },
  {
    id: 'conflict-5', name: 'South China Sea Tensions', region: 'Indo-Pacific',
    lat: 16.0, lon: 114.0, severity: 'MEDIUM', status: 'Monitoring',
    impactOnIndia: 'Trade routes, strategic balance, QUAD dynamics',
    oilRegion: false, escalationLevel: 4,
  },
  {
    id: 'conflict-6', name: 'China-India LAC Tensions', region: 'South Asia',
    lat: 34.5, lon: 78.0, severity: 'LOW', status: 'Monitoring',
    impactOnIndia: 'Direct border security, defense spending',
    oilRegion: false, escalationLevel: 3,
  },
];

let ACTIVE_CONFLICTS = JSON.parse(JSON.stringify(BASE_CONFLICTS));
let usingRealGdelt = false;

// ── Country-to-conflict mapping for enrichment ──
const COUNTRY_CONFLICT_MAP = {
  'Ukraine': 'conflict-1', 'Russia': 'conflict-1',
  'Israel': 'conflict-2', 'Palestine': 'conflict-2', 'Gaza': 'conflict-2',
  'Yemen': 'conflict-3', 'Saudi Arabia': 'conflict-3',
  'Myanmar': 'conflict-4', 'Burma': 'conflict-4',
  'Philippines': 'conflict-5', 'China': 'conflict-5',
  'India': 'conflict-6',
  'Sudan': 'conflict-7', 'Iran': 'conflict-8',
};

const INDIA_IMPACT_MAP = {
  'Ukraine': 'Energy prices, fertilizer & wheat supply chain disruption',
  'Russia': 'Energy prices, defense spares, sanctions navigation',
  'Israel': 'Oil prices, 9M Indian diaspora in Gulf at risk',
  'Palestine': 'Diplomatic balancing, oil route proximity',
  'Yemen': 'Shipping costs +300%, Suez rerouting, export delays',
  'Myanmar': 'Northeast border security, Manipur refugee influx',
  'Philippines': 'Indo-Pacific trade route security',
  'China': 'LAC border security, trade relations, QUAD dynamics',
  'Sudan': 'Indian nationals evacuation, UNSC diplomacy',
  'Iran': 'Oil supply via Strait of Hormuz, Chabahar port',
};

// ── GDELT API (Completely free, no key needed) ──
async function fetchGdelt() {
  try {
    // Fetch recent conflict/military-related events
    const queries = [
      'conflict+war+military',
      'India+defense+border',
      'missile+strike+attack',
      'Ukraine+Russia+war',
      'Israel+Gaza+conflict',
      'Yemen+Houthi+Red Sea',
    ];

    const query = queries[Math.floor(Math.random() * queries.length)];
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=ArtList&maxrecords=30&format=json&timespan=1d`;

    const res = await axios.get(url, { timeout: 12000 });

    if (res.data?.articles && res.data.articles.length > 0) {
      const gdeltEvents = res.data.articles.map((a, i) => ({
        id: `gdelt-${Date.now()}-${i}`,
        title: a.title || '',
        url: a.url || '',
        source: a.domain || a.source || 'GDELT',
        publishDate: a.seendate || new Date().toISOString(),
        language: a.language || 'English',
        sourcecountry: a.sourcecountry || '',
      }));

      // Enrich conflict zones based on mentions
      enrichFromGdelt(gdeltEvents);
      usingRealGdelt = true;
      logger.info(`[Conflicts] ✓ GDELT: ${gdeltEvents.length} geopolitical articles fetched`);
      return gdeltEvents;
    }
  } catch (err) {
    logger.warn(`[Conflicts] GDELT fetch failed: ${err.message}`);
  }
  return [];
}

function enrichFromGdelt(articles) {
  // Count mentions of conflict zones in GDELT headlines
  const mentionCount = {};
  articles.forEach(a => {
    const title = (a.title || '').toLowerCase();
    if (title.includes('ukraine') || title.includes('russia')) mentionCount['conflict-1'] = (mentionCount['conflict-1'] || 0) + 1;
    if (title.includes('israel') || title.includes('gaza') || title.includes('palestine')) mentionCount['conflict-2'] = (mentionCount['conflict-2'] || 0) + 1;
    if (title.includes('houthi') || title.includes('red sea') || title.includes('yemen')) mentionCount['conflict-3'] = (mentionCount['conflict-3'] || 0) + 1;
    if (title.includes('myanmar') || title.includes('burma')) mentionCount['conflict-4'] = (mentionCount['conflict-4'] || 0) + 1;
    if (title.includes('south china sea') || title.includes('taiwan')) mentionCount['conflict-5'] = (mentionCount['conflict-5'] || 0) + 1;
    if (title.includes('india') && (title.includes('china') || title.includes('lac') || title.includes('border'))) mentionCount['conflict-6'] = (mentionCount['conflict-6'] || 0) + 1;
    if (title.includes('sudan')) {
      // Add Sudan dynamically
      if (!ACTIVE_CONFLICTS.find(c => c.id === 'conflict-7')) {
        ACTIVE_CONFLICTS.push({
          id: 'conflict-7', name: 'Sudan Civil War', region: 'East Africa',
          lat: 15.5007, lon: 32.5599, severity: 'HIGH', status: 'Active',
          impactOnIndia: 'Indian nationals evacuation, UNSC diplomacy',
          oilRegion: false, escalationLevel: 6,
        });
      }
      mentionCount['conflict-7'] = (mentionCount['conflict-7'] || 0) + 1;
    }
    if (title.includes('iran') && (title.includes('attack') || title.includes('strike') || title.includes('nuclear'))) {
      if (!ACTIVE_CONFLICTS.find(c => c.id === 'conflict-8')) {
        ACTIVE_CONFLICTS.push({
          id: 'conflict-8', name: 'Iran Tensions', region: 'Middle East',
          lat: 32.4279, lon: 53.6880, severity: 'HIGH', status: 'Active',
          impactOnIndia: 'Oil supply via Hormuz, Chabahar port, diaspora safety',
          oilRegion: true, escalationLevel: 7,
        });
      }
      mentionCount['conflict-8'] = (mentionCount['conflict-8'] || 0) + 1;
    }
  });

  // Adjust escalation based on media attention (more mentions = more escalation)
  ACTIVE_CONFLICTS.forEach(c => {
    const mentions = mentionCount[c.id] || 0;
    if (mentions > 10) c.escalationLevel = Math.min(10, c.escalationLevel + 1);
    else if (mentions > 5) c.escalationLevel = Math.min(10, c.escalationLevel);
    // Reduce escalation slightly if zero mentions (de-escalation signal)
    else if (mentions === 0 && Math.random() < 0.1) c.escalationLevel = Math.max(1, c.escalationLevel - 1);

    if (c.escalationLevel >= 8) c.severity = 'CRITICAL';
    else if (c.escalationLevel >= 6) c.severity = 'HIGH';
    else if (c.escalationLevel >= 4) c.severity = 'MEDIUM';
    else c.severity = 'LOW';

    c.mediaMentions = mentions;
  });
}

// ── Simulated tick (fallback) ──
function tickConflicts() {
  if (usingRealGdelt) return; // Skip sim when real data available
  ACTIVE_CONFLICTS.forEach(c => {
    const delta = Math.random() < 0.1 ? (Math.random() < 0.5 ? 1 : -1) : 0;
    c.escalationLevel = Math.max(1, Math.min(10, c.escalationLevel + delta));
    if (c.escalationLevel >= 8) c.severity = 'CRITICAL';
    else if (c.escalationLevel >= 6) c.severity = 'HIGH';
    else if (c.escalationLevel >= 4) c.severity = 'MEDIUM';
    else c.severity = 'LOW';
  });
}

// ── Fetch on startup + periodic refresh ──
fetchGdelt();
setInterval(fetchGdelt, 600000);   // GDELT: every 10 min (rate-limit friendly)

function getConflictData() {
  tickConflicts();

  const oilRegionEscalation = ACTIVE_CONFLICTS
    .filter(c => c.oilRegion)
    .reduce((max, c) => Math.max(max, c.escalationLevel), 0);

  const data = {
    timestamp: new Date().toISOString(),
    liveSource: usingRealGdelt ? 'GDELT' : 'Simulated',
    conflicts: ACTIVE_CONFLICTS,
    totalActive: ACTIVE_CONFLICTS.filter(c => c.status === 'Active').length,
    criticalCount: ACTIVE_CONFLICTS.filter(c => c.severity === 'CRITICAL').length,
    oilRegionEscalation,
    overallThreatLevel: oilRegionEscalation >= 8 ? 'CRITICAL' :
      oilRegionEscalation >= 6 ? 'ELEVATED' : 'MODERATE',
  };

  cache.set('conflicts', data, 120000);
  return data;
}

function getOilRegionEscalation() {
  return ACTIVE_CONFLICTS.filter(c => c.oilRegion)
    .reduce((max, c) => Math.max(max, c.escalationLevel), 0);
}

module.exports = { getConflictData, getOilRegionEscalation };
