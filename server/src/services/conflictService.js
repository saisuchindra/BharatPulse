/**
 * Conflict & Geopolitical Service
 * Tracks global conflicts with focus on India impact.
 */
const cache = require('../utils/cache');

const ACTIVE_CONFLICTS = [
  {
    id: 'conflict-1',
    name: 'Russia-Ukraine Conflict',
    region: 'Eastern Europe',
    lat: 48.3794,
    lon: 31.1656,
    severity: 'HIGH',
    status: 'Active',
    impactOnIndia: 'Energy prices, fertilizer supply, wheat imports',
    oilRegion: false,
    escalationLevel: 7,
  },
  {
    id: 'conflict-2',
    name: 'Israel-Palestine Conflict',
    region: 'Middle East',
    lat: 31.5,
    lon: 34.75,
    severity: 'HIGH',
    status: 'Active',
    impactOnIndia: 'Oil prices, diaspora safety, shipping routes',
    oilRegion: true,
    escalationLevel: 8,
  },
  {
    id: 'conflict-3',
    name: 'Red Sea / Houthi Disruption',
    region: 'Red Sea',
    lat: 14.5,
    lon: 42.5,
    severity: 'MEDIUM',
    status: 'Active',
    impactOnIndia: 'Shipping costs, trade delays, oil transport',
    oilRegion: true,
    escalationLevel: 6,
  },
  {
    id: 'conflict-4',
    name: 'Myanmar Civil Conflict',
    region: 'Southeast Asia',
    lat: 19.763,
    lon: 96.0785,
    severity: 'MEDIUM',
    status: 'Active',
    impactOnIndia: 'Northeast border security, refugee influx',
    oilRegion: false,
    escalationLevel: 5,
  },
  {
    id: 'conflict-5',
    name: 'South China Sea Tensions',
    region: 'Indo-Pacific',
    lat: 16.0,
    lon: 114.0,
    severity: 'MEDIUM',
    status: 'Monitoring',
    impactOnIndia: 'Trade routes, strategic balance, QUAD dynamics',
    oilRegion: false,
    escalationLevel: 4,
  },
  {
    id: 'conflict-6',
    name: 'China-India LAC Tensions',
    region: 'South Asia',
    lat: 34.5,
    lon: 78.0,
    severity: 'LOW',
    status: 'Monitoring',
    impactOnIndia: 'Direct border security, defense spending',
    oilRegion: false,
    escalationLevel: 3,
  },
];

function tickConflicts() {
  ACTIVE_CONFLICTS.forEach(c => {
    const delta = Math.random() < 0.1 ? (Math.random() < 0.5 ? 1 : -1) : 0;
    c.escalationLevel = Math.max(1, Math.min(10, c.escalationLevel + delta));
    if (c.escalationLevel >= 8) c.severity = 'CRITICAL';
    else if (c.escalationLevel >= 6) c.severity = 'HIGH';
    else if (c.escalationLevel >= 4) c.severity = 'MEDIUM';
    else c.severity = 'LOW';
  });
}

function getConflictData() {
  tickConflicts();

  const oilRegionEscalation = ACTIVE_CONFLICTS
    .filter(c => c.oilRegion)
    .reduce((max, c) => Math.max(max, c.escalationLevel), 0);

  const data = {
    timestamp: new Date().toISOString(),
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
