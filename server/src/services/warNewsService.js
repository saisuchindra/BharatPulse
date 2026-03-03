/**
 * War News Intelligence Service
 * Generates hyper-realistic, second-by-second war bulletins covering
 * every major active conflict zone with India-impact analysis.
 *
 * Each tick produces a new bulletin with:
 *   - headline, body, source, severity, conflict zone, timestamp
 *   - casualty / displacement estimates
 *   - India impact angle
 *   - verification status
 */

/* ═══════════════ CONFLICT THEATERS ═══════════════ */
const THEATERS = [
  {
    id: 'iran-israel',
    name: 'Iran–Israel–US War',
    region: 'Middle East',
    tags: ['oil', 'strait-of-hormuz', 'missile', 'nuclear'],
    indiaAngle: 'Oil supply, 9M Indian diaspora in Gulf, shipping disruption',
    severityBase: 9,
  },
  {
    id: 'russia-ukraine',
    name: 'Russia–Ukraine War',
    region: 'Eastern Europe',
    tags: ['energy', 'grain', 'sanctions', 'NATO'],
    indiaAngle: 'Fertilizer & wheat imports, defence spares, energy prices',
    severityBase: 8,
  },
  {
    id: 'israel-palestine',
    name: 'Israel–Palestine (Gaza)',
    region: 'Middle East',
    tags: ['humanitarian', 'ceasefire', 'UN'],
    indiaAngle: 'Diaspora safety, diplomatic balancing, oil route proximity',
    severityBase: 8,
  },
  {
    id: 'red-sea',
    name: 'Red Sea / Houthi Attacks',
    region: 'Red Sea / Yemen',
    tags: ['shipping', 'Suez', 'trade'],
    indiaAngle: 'Shipping costs +300%, Suez rerouting, export delays',
    severityBase: 7,
  },
  {
    id: 'myanmar',
    name: 'Myanmar Civil War',
    region: 'Southeast Asia',
    tags: ['refugees', 'border', 'junta'],
    indiaAngle: 'Northeast border security, Manipur refugee influx',
    severityBase: 6,
  },
  {
    id: 'south-china-sea',
    name: 'South China Sea Tensions',
    region: 'Indo-Pacific',
    tags: ['navy', 'Taiwan', 'QUAD'],
    indiaAngle: 'Trade route security, QUAD alliance, naval deployments',
    severityBase: 5,
  },
  {
    id: 'india-china-lac',
    name: 'India–China LAC',
    region: 'Ladakh / Arunachal',
    tags: ['LAC', 'PLA', 'Galwan'],
    indiaAngle: 'Direct national security, defence budget, troop deployment',
    severityBase: 5,
  },
  {
    id: 'sudan',
    name: 'Sudan Civil War',
    region: 'East Africa',
    tags: ['humanitarian', 'famine', 'RSF'],
    indiaAngle: 'Indian nationals evacuation, UNSC diplomacy',
    severityBase: 6,
  },
];

/* ═══════════════ HEADLINE TEMPLATES PER THEATER ═══════════════ */
const HEADLINES = {
  'iran-israel': [
    'BREAKING: Israeli jets strike {target} deep inside Iran — multiple explosions reported',
    'Pentagon confirms {n} US cruise missiles launched at Iranian nuclear facility near {city}',
    'Iran fires {n} ballistic missiles at Israel — Iron Dome intercepts most, {n2} impact in {city}',
    'Strait of Hormuz partially blocked — {n} tankers stranded, oil jumps ${price}/bbl',
    'IRGC retaliates: Drone swarm targets US carrier group in Gulf of Oman',
    'Emergency UN Security Council session called as Iran vows "decisive response"',
    'Indian Navy deploys warships to Arabian Sea to protect shipping lanes',
    'US deploys B-2 bombers to Diego Garcia — Indian Ocean build-up accelerates',
    'Iran shoots down US surveillance drone over Strait of Hormuz',
    'Massive cyberattack hits Iranian power grid — suspected Israeli/US operation',
    'Hezbollah launches {n} rockets into northern Israel in solidarity with Tehran',
    'India evacuates {n} nationals from Dubai, Abu Dhabi on special Air India flights',
    'Oil prices surge to ${price}/bbl — highest since 2008 as Hormuz shipping halted',
    'Iranian Revolutionary Guard seizes {n} commercial vessels in Persian Gulf',
    'Israel activates full Iron Dome, Arrow-3 systems as Iran launches second wave',
    'Pentagon: "{n} US service members wounded in Iranian missile strike on Al Dhafra base"',
    'India-Iran Chabahar port operations suspended amid escalating airstrikes',
    'CIA intercepts suggest Iran accelerating nuclear weapon assembly',
    'Turkish airspace closed to military overflights — NATO emergency consultations',
    'Crude oil futures hit ${price} — India faces ₹15/L petrol hike if sustained',
  ],
  'russia-ukraine': [
    'Russia launches massive {n}-drone strike on Kyiv — power grid severely damaged',
    'Ukrainian forces recapture {city} in surprise counter-offensive',
    'NATO emergency summit as Russian hypersonic missile hits target near Polish border',
    'Russia threatens tactical nuclear response if Ukraine strikes deeper into territory',
    'Black Sea grain corridor suspended — wheat futures surge {n}%',
    'Indian refinery imports of Russian crude reach record {n}M barrels/month',
    'Zelensky appeals to India PM for mediation — New Delhi maintains "diplomatic channels"',
    'Russia cuts natural gas to Europe — EU declares energy emergency',
    'Wagner-linked forces advance in {city} — fierce urban combat reported',
    'Ukraine deploys long-range ATACMS missiles — strikes Russian airbase in Crimea',
    'Putin signs decree for partial military mobilisation — {n} additional troops',
    'Satellite images show massive Russian troop movement near {city}',
    'UN reports {n}+ civilian casualties in latest Kharkiv bombardment',
    'India abstains on UNSC resolution condemning Russian escalation',
    'European gas prices spike {n}% — India LNG imports surge in cost',
  ],
  'israel-palestine': [
    'IDF begins new operation in {city} — heavy airstrikes across northern Gaza',
    'Gaza health ministry reports {n} killed in latest 24 hours of bombardment',
    'Humanitarian corridor opens briefly — {n} aid trucks enter southern Gaza',
    'Ceasefire talks collapse in Cairo — Hamas rejects latest terms',
    'ICJ issues emergency ruling ordering Israel to prevent genocide in Gaza',
    'India sends {n} tonnes of humanitarian aid to Gaza through Egypt',
    'UN agencies warn of imminent famine in Gaza — {n}M at catastrophic hunger levels',
    'Israel-Lebanon border: Hezbollah exchanges heavy fire with IDF',
    'UNRWA suspends operations in northern Gaza — staff safety concerns',
    'West Bank raids intensify — {n} arrested in overnight operation',
  ],
  'red-sea': [
    'Houthi anti-ship missile damages {name} tanker in Bab al-Mandeb strait',
    'US/UK launch joint strike on Houthi positions in Yemen — {n} targets hit',
    'Major shipping lines reroute via Cape of Good Hope — {n} days added to voyage',
    'Indian Navy\'s INS {name} escorts {n} merchant vessels through Red Sea corridor',
    'Suez Canal traffic drops {n}% — shipping insurance premiums quadruple',
    'Houthi spokesperson: "All ships linked to Israel, US, UK are legitimate targets"',
    'India-bound container ship struck by Houthi drone — crew safe, ship damaged',
    'Freight rates from Europe to India up {n}% since Houthi attacks began',
    'Pentagon deploys additional destroyer to Red Sea — Houthis unfazed',
    'Egyptian economy suffers as Suez Canal revenues plunge {n}%',
  ],
  'myanmar': [
    'Resistance forces capture {city} — junta loses control of key border crossing',
    'Myanmar military launches airstrikes on civilian areas in {region}',
    '{n} refugees cross into India\'s Mizoram — relief camps overwhelmed',
    'India tightens border security as Myanmar conflict spills over',
    'EAO alliance captures major military base near Chinese border',
    'UN reports {n}+ civilian deaths in Myanmar since February 2021 coup',
    'India suspends Free Movement Regime along Myanmar border',
    'Junta imposes martial law in {city} — internet blackout reported',
  ],
  'south-china-sea': [
    'Chinese coast guard ships surround Philippine vessel near {reef}',
    'US Navy conducts freedom of navigation patrol through Taiwan Strait',
    'China deploys aircraft carrier Fujian to South China Sea — regional alarm',
    'QUAD nations announce joint naval exercise in Indo-Pacific',
    'India deploys P-8I Poseidon aircraft to Andaman & Nicobar forward base',
    'Taiwan reports {n} PLA aircraft in ADIZ — highest incursion this year',
    'Philippines invokes MDT with US after South China Sea confrontation',
    'India-Vietnam defence pact strengthened amid China aggression',
  ],
  'india-china-lac': [
    'Satellite imagery reveals new Chinese structures at LAC near {sector}',
    'Indian Army deploys additional brigade to eastern Ladakh',
    'China-India Corps Commander talks end without breakthrough',
    'PLA conducts live-fire exercise {n}km from Indian positions in Ladakh',
    'India activates Rafale squadron at Ambala for LAC readiness',
    'Border Roads Organisation completes strategic road to Daulat Beg Oldi',
    'Arunachal Pradesh: India builds permanent forward posts near McMahon Line',
    'India tests BrahMos missile capable of reaching Chinese positions across LAC',
  ],
  'sudan': [
    'RSF forces advance on El Fasher — UN warns of "potential genocide" in Darfur',
    '{n}+ killed in artillery exchange in Khartoum — hospitals overwhelmed',
    'India evacuates {n} nationals from Port Sudan via INS warship',
    'Sudan famine: {n}M face acute hunger — worst crisis in decades',
    'SAF airstrikes hit RSF positions in Omdurman — civilian casualties feared',
    'UN humanitarian aid cut off as fighting blocks access to {region}',
    'African Union calls for ceasefire — both sides reject mediation',
    'Indian medical team deployed to Port Sudan for diaspora assistance',
  ],
};

/* ═══════════════ BODY TEMPLATES ═══════════════ */
const BODY_TEMPLATES = [
  'Military sources confirm the strike hit {detail}. {n} casualties reported so far. Emergency responders on scene. The escalation marks a significant {adj} in the conflict.',
  'Intelligence agencies report {detail}. Satellite imagery corroborates ground reports. The UN Secretary-General has called for immediate de-escalation.',
  'Multiple verified sources indicate {detail}. Defence analysts say this represents a major shift in the conflict dynamics. India\'s Ministry of External Affairs is monitoring the situation closely.',
  'Ground reporters confirm {detail}. Social media footage, verified by OSINT analysts, shows {visual}. Regional powers have been alerted.',
  'The latest development follows {detail}. Strategic analysts warn this could trigger a wider regional escalation. Global markets reacting to the uncertainty.',
  'BREAKING UPDATE: {detail}. Diplomatic channels active between major powers. India has activated its crisis management team for the region.',
];

const DETAILS = [
  'a military command centre, destroying key communications infrastructure',
  'a major ammunition depot, with secondary explosions continuing for hours',
  'troop concentrations along the frontline, causing significant disruption',
  'critical infrastructure including power stations and bridges',
  'defensive positions, breaching the forward line of defence',
  'a strategic airfield, destroying several aircraft on the ground',
  'a naval facility, damaging multiple vessels in port',
  'supply routes essential for ongoing military operations',
  'radar installations and air defence batteries',
  'a government building in the capital, raising fears of leadership targeting',
];

const VISUALS = [
  'heavy smoke rising from multiple points in the target area',
  'large-scale military vehicle movements on major highways',
  'civilians fleeing in packed vehicles along evacuation corridors',
  'anti-aircraft fire illuminating the night sky over the city',
  'rescue teams pulling survivors from collapsed structures',
  'military aircraft conducting low-altitude sorties',
];

const SOURCES = [
  'Reuters', 'AP', 'AFP', 'Al Jazeera', 'BBC', 'OSINT analysts',
  'Pentagon spokesperson', 'IDF spokesperson', 'IRGC statement',
  'Ukrainian General Staff', 'Russian MOD', 'Indian MEA',
  'UN OCHA', 'CENTCOM', 'NATO HQ', 'Indian Navy PRO',
  'Xinhua', 'ANI', 'PTI', 'NDTV', 'India Today',
];

const VERIFICATION = ['CONFIRMED', 'CONFIRMED', 'CONFIRMED', 'DEVELOPING', 'DEVELOPING', 'UNVERIFIED'];

/* ═══════════════ HELPERS ═══════════════ */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const CITIES = {
  'iran-israel': ['Tehran', 'Isfahan', 'Natanz', 'Bandar Abbas', 'Bushehr', 'Shiraz', 'Haifa', 'Tel Aviv', 'Eilat'],
  'russia-ukraine': ['Kyiv', 'Kharkiv', 'Odessa', 'Zaporizhzhia', 'Bakhmut', 'Donetsk', 'Sevastopol', 'Mykolaiv'],
  'israel-palestine': ['Gaza City', 'Rafah', 'Khan Younis', 'Jabalia', 'Deir al-Balah', 'Nuseirat'],
  'red-sea': ['Hodeidah', 'Sanaa', 'Aden', 'Mocha'],
  'myanmar': ['Mandalay', 'Myitkyina', 'Lashio', 'Sagaing', 'Chin State'],
  'south-china-sea': ['Scarborough Shoal', 'Spratly Islands', 'Paracel Islands', 'Second Thomas Shoal'],
  'india-china-lac': ['Depsang Plains', 'Hot Springs', 'Demchok', 'Chumar', 'Tawang'],
  'sudan': ['Khartoum', 'El Fasher', 'Omdurman', 'Port Sudan', 'Wad Madani'],
};

const SHIP_NAMES = ['Maersk Hangzhou', 'MSC Palatium', 'CMA CGM Unity', 'OOCL Horizon', 'Evergreen Fortune'];
const INS_NAMES = ['Vikrant', 'Kolkata', 'Chennai', 'Visakhapatnam', 'Imphal', 'Shivalik'];
const TARGETS = ['air defence network', 'missile launch sites', 'command bunker', 'naval port', 'radar array', 'fuel storage depot'];
const SECTORS = ['Depsang', 'Hot Springs', 'Gogra', 'Galwan', 'Pangong', 'Demchok'];
const REEFS = ['Scarborough Shoal', 'Second Thomas Shoal', 'Mischief Reef', 'Whitsun Reef'];

function fillTemplate(template, theaterId) {
  const cities = CITIES[theaterId] || ['the capital'];
  return template
    .replace(/\{city\}/g, pick(cities))
    .replace(/\{target\}/g, pick(TARGETS))
    .replace(/\{n2\}/g, String(rand(1, 8)))
    .replace(/\{n\}/g, String(rand(3, 200)))
    .replace(/\{price\}/g, String(rand(105, 180)))
    .replace(/\{name\}/g, pick([...SHIP_NAMES, ...INS_NAMES]))
    .replace(/\{region\}/g, pick(cities))
    .replace(/\{reef\}/g, pick(REEFS))
    .replace(/\{sector\}/g, pick(SECTORS))
    .replace(/\{detail\}/g, pick(DETAILS))
    .replace(/\{adj\}/g, pick(['escalation', 'turning point', 'provocation', 'development']))
    .replace(/\{visual\}/g, pick(VISUALS));
}

/* ═══════════════ STATE ═══════════════ */
let bulletins = [];
const MAX_BULLETINS = 150;
let bulletinId = 0;

/* ═══════════════ GENERATE ONE BULLETIN ═══════════════ */
function generateBulletin() {
  const theater = pick(THEATERS);
  const headlineTemplates = HEADLINES[theater.id] || HEADLINES['iran-israel'];
  const headline = fillTemplate(pick(headlineTemplates), theater.id);
  const bodyTemplate = pick(BODY_TEMPLATES);
  const body = fillTemplate(bodyTemplate, theater.id);

  const severityJitter = rand(-1, 1);
  const sev = Math.max(1, Math.min(10, theater.severityBase + severityJitter));
  const severity = sev >= 9 ? 'CRITICAL' : sev >= 7 ? 'HIGH' : sev >= 5 ? 'MEDIUM' : 'LOW';

  const bulletin = {
    id: `war-${++bulletinId}`,
    timestamp: new Date().toISOString(),
    theater: theater.name,
    theaterId: theater.id,
    region: theater.region,
    headline,
    body,
    source: pick(SOURCES),
    severity,
    severityScore: sev,
    indiaImpact: theater.indiaAngle,
    verification: pick(VERIFICATION),
    tags: theater.tags,
    casualtyEstimate: sev >= 7 ? `${rand(5, 500)}+ reported` : sev >= 5 ? `${rand(1, 50)} reported` : 'Minimal',
    isBreaking: sev >= 8 && Math.random() > 0.4,
  };

  bulletins.unshift(bulletin);
  if (bulletins.length > MAX_BULLETINS) bulletins = bulletins.slice(0, MAX_BULLETINS);
  return bulletin;
}

/* ═══════════════ TICK — runs every 5 seconds ═══════════════ */
function tick() {
  // Generate 1-3 bulletins per tick for a dense news feed
  const count = rand(1, 3);
  for (let i = 0; i < count; i++) {
    generateBulletin();
  }
}

// Auto-start ticking
setInterval(tick, 5000);
// Seed with initial batch
for (let i = 0; i < 20; i++) generateBulletin();

/* ═══════════════ PUBLIC API ═══════════════ */
function getWarNews() {
  return {
    timestamp: new Date().toISOString(),
    totalBulletins: bulletins.length,
    breakingCount: bulletins.filter(b => b.isBreaking).length,
    criticalCount: bulletins.filter(b => b.severity === 'CRITICAL').length,
    theaters: THEATERS.map(t => ({
      id: t.id,
      name: t.name,
      region: t.region,
      severityBase: t.severityBase,
      indiaAngle: t.indiaAngle,
    })),
    bulletins: bulletins.slice(0, 80),
  };
}

function getLatestBulletins(count = 20) {
  return bulletins.slice(0, count);
}

module.exports = { getWarNews, getLatestBulletins };
