/**
 * Precious Metal Service — Gold & Silver
 * Simulates live prices with realistic volatility and generates
 * human-readable reasons for every price movement.
 */

/* ── Reason pools ──────────────────────────────────────────────────── */

const GOLD_UP_REASONS = [
  'US Federal Reserve signaled potential interest rate cuts',
  'Rising geopolitical tensions in the Middle East',
  'US Dollar weakened against major currencies',
  'Global equity markets sold off sharply',
  'Central banks increased gold reserve purchases',
  'Inflation data came in higher than expected',
  'Safe-haven demand surged on banking sector fears',
  'India and China ramped up gold imports ahead of festival season',
  'Bond yields dropped, making gold more attractive',
  'Escalating trade war fears between US and China',
  'Russia-Ukraine conflict intensified, boosting safe-haven demand',
  'Global debt levels hit all-time highs, investors flock to gold',
  'Weaker-than-expected US jobs report raised recession concerns',
  'Oil prices surged, pushing inflation expectations higher',
  'ETF inflows into gold-backed funds hit monthly highs',
];

const GOLD_DOWN_REASONS = [
  'US Dollar strengthened on hawkish Fed commentary',
  'Strong US economic data reduced safe-haven appeal',
  'Federal Reserve raised interest rates by 25 basis points',
  'Bond yields surged to multi-year highs',
  'Risk-on sentiment returned as equity markets rallied',
  'Profit-taking after gold hit resistance levels',
  'India raised import duty on gold, dampening demand',
  'Crypto rally diverted investment from precious metals',
  'China reported weaker-than-expected gold demand',
  'Positive ceasefire talks eased geopolitical concerns',
  'Real yields turned positive, reducing gold attractiveness',
  'Strong US Dollar index broke above key resistance',
  'Central banks slowed gold purchasing for the quarter',
  'Technical sell-off triggered after breaking support level',
  'Global risk appetite improved on better PMI data',
];

const SILVER_UP_REASONS = [
  'Industrial demand for silver in solar panels surged',
  'Gold rally pulled silver prices higher in sympathy',
  'Silver supply deficit widened as mine output dropped',
  'EV sector growth boosted industrial silver demand',
  'India electronics manufacturing expansion increased silver imports',
  'Silver ETF holdings rose to 6-month highs',
  'Safe-haven buying spilled over from gold to silver',
  'Mexico and Peru reported lower silver mine production',
  'Green energy push increased silver demand for photovoltaics',
  'Gold-to-silver ratio compression trade activated',
  '5G infrastructure rollout accelerated silver consumption',
  'Inflation hedge demand spread to silver markets',
  'Weaker Dollar made silver cheaper for international buyers',
  'Technical breakout above 200-day moving average',
  'Semiconductor shortage increased silver recycling premium',
];

const SILVER_DOWN_REASONS = [
  'Stronger US Dollar weighed on silver prices',
  'Industrial slowdown in China reduced silver demand',
  'Rising bond yields made non-yielding silver less attractive',
  'Profit-taking hit silver after recent rally to multi-week highs',
  'Risk-on sentiment shifted money from metals to equities',
  'Fed hawkish stance crushed precious metals across the board',
  'Silver ETF outflows exceeded $200M for the week',
  'Global manufacturing PMI contracted, hurting industrial demand',
  'Solar industry subsidy cuts in EU reduced panel demand',
  'Mexico increased silver export output by 8%',
  'Technical selling triggered below key support at $28',
  'Gold-to-silver ratio widened, signaling silver underperformance',
  'India silver imports dropped on high domestic prices',
  'Recession fears reduced industrial consumption outlook',
  'Liquidation in commodity funds hit silver positions',
];

/* ── Helpers ───────────────────────────────────────────────────────── */

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const jitter = (base, pct) => base + base * (Math.random() * 2 - 1) * (pct / 100);
const round2 = (n) => Math.round(n * 100) / 100;

/* ── State ─────────────────────────────────────────────────────────── */

// Gold — prices in USD/oz and INR/10g
let goldState = {
  usdOz: 2350 + Math.random() * 100,   // ~$2350-2450
  inr10g: 72500 + Math.random() * 2000, // ~₹72,500-74,500
  change24h: 0,
  changePct: 0,
  high24h: 0,
  low24h: 0,
  reason: pick(GOLD_UP_REASONS),
  direction: 'up',
  history: [],
  timestamp: new Date().toISOString(),
};

// Silver — prices in USD/oz and INR/kg
let silverState = {
  usdOz: 28 + Math.random() * 3,       // ~$28-31
  inrKg: 84000 + Math.random() * 4000,  // ~₹84,000-88,000
  change24h: 0,
  changePct: 0,
  high24h: 0,
  low24h: 0,
  reason: pick(SILVER_UP_REASONS),
  direction: 'up',
  history: [],
  timestamp: new Date().toISOString(),
};

// Initialize 24h range
goldState.high24h = goldState.usdOz + 15;
goldState.low24h = goldState.usdOz - 20;
silverState.high24h = silverState.usdOz + 0.6;
silverState.low24h = silverState.usdOz - 0.8;

/* ── Price history seed (last ~30 data points) ─────────────────────── */
for (let i = 30; i >= 1; i--) {
  const t = Date.now() - i * 15000;
  goldState.history.push({ t, price: jitter(goldState.usdOz, 0.5) });
  silverState.history.push({ t, price: jitter(silverState.usdOz, 0.8) });
}

/* ── Tick ───────────────────────────────────────────────────────────── */

function tickGold() {
  const prev = goldState.usdOz;
  const move = jitter(0, 100) * 0.003; // small % move
  goldState.usdOz = round2(goldState.usdOz + goldState.usdOz * (move / 100));
  const inrMultiplier = 83.5 + Math.random() * 0.5; // approx USD→INR
  goldState.inr10g = round2((goldState.usdOz / 31.1035) * 10 * inrMultiplier);

  goldState.change24h = round2(goldState.usdOz - prev);
  goldState.changePct = round2(((goldState.usdOz - prev) / prev) * 100 * 100) / 100;

  if (goldState.usdOz > goldState.high24h) goldState.high24h = round2(goldState.usdOz);
  if (goldState.usdOz < goldState.low24h) goldState.low24h = round2(goldState.usdOz);

  goldState.direction = goldState.change24h >= 0 ? 'up' : 'down';
  goldState.reason = goldState.direction === 'up' ? pick(GOLD_UP_REASONS) : pick(GOLD_DOWN_REASONS);
  goldState.timestamp = new Date().toISOString();

  goldState.history.push({ t: Date.now(), price: goldState.usdOz });
  if (goldState.history.length > 60) goldState.history.shift();
}

function tickSilver() {
  const prev = silverState.usdOz;
  const move = jitter(0, 100) * 0.005; // silver is more volatile
  silverState.usdOz = round2(silverState.usdOz + silverState.usdOz * (move / 100));
  const inrMultiplier = 83.5 + Math.random() * 0.5;
  silverState.inrKg = round2((silverState.usdOz / 31.1035) * 1000 * inrMultiplier);

  silverState.change24h = round2(silverState.usdOz - prev);
  silverState.changePct = round2(((silverState.usdOz - prev) / prev) * 100 * 100) / 100;

  if (silverState.usdOz > silverState.high24h) silverState.high24h = round2(silverState.usdOz);
  if (silverState.usdOz < silverState.low24h) silverState.low24h = round2(silverState.usdOz);

  silverState.direction = silverState.change24h >= 0 ? 'up' : 'down';
  silverState.reason = silverState.direction === 'up' ? pick(SILVER_UP_REASONS) : pick(SILVER_DOWN_REASONS);
  silverState.timestamp = new Date().toISOString();

  silverState.history.push({ t: Date.now(), price: silverState.usdOz });
  if (silverState.history.length > 60) silverState.history.shift();
}

/* ── Auto-tick ────────────────────────────────────────────────────── */
setInterval(tickGold, 10000);
setInterval(tickSilver, 10000);

/* ── Public API ───────────────────────────────────────────────────── */

function getGoldData() {
  return { ...goldState, metal: 'GOLD' };
}

function getSilverData() {
  return { ...silverState, metal: 'SILVER' };
}

module.exports = { getGoldData, getSilverData };
