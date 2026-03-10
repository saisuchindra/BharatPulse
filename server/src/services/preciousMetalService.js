/**
 * Precious Metal Service — Gold & Silver
 * Fetches real gold/silver prices from Yahoo Finance (free, no key).
 * Falls back to simulated prices with realistic volatility.
 */
const axios = require('axios');
const logger = require('../utils/logger');

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
  'Central banks slowed gold purchasing for the quarter',
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
  'Green energy push increased silver demand for photovoltaics',
  '5G infrastructure rollout accelerated silver consumption',
  'Semiconductor shortage increased silver recycling premium',
];

const SILVER_DOWN_REASONS = [
  'Stronger US Dollar weighed on silver prices',
  'Industrial slowdown in China reduced silver demand',
  'Rising bond yields made non-yielding silver less attractive',
  'Profit-taking hit silver after recent rally to multi-week highs',
  'Risk-on sentiment shifted money from metals to equities',
  'Silver ETF outflows exceeded $200M for the week',
  'Global manufacturing PMI contracted, hurting industrial demand',
  'Solar industry subsidy cuts in EU reduced panel demand',
  'India silver imports dropped on high domestic prices',
  'Liquidation in commodity funds hit silver positions',
];

/* ── Helpers ───────────────────────────────────────────────────────── */

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const jitter = (base, pct) => base + base * (Math.random() * 2 - 1) * (pct / 100);
const round2 = (n) => Math.round(n * 100) / 100;

/* ── State ─────────────────────────────────────────────────────────── */

let goldState = {
  usdOz: 2350 + Math.random() * 100,
  inr10g: 72500 + Math.random() * 2000,
  change24h: 0, changePct: 0,
  high24h: 0, low24h: 0,
  reason: pick(GOLD_UP_REASONS), direction: 'up',
  history: [], timestamp: new Date().toISOString(),
};

let silverState = {
  usdOz: 28 + Math.random() * 3,
  inrKg: 84000 + Math.random() * 4000,
  change24h: 0, changePct: 0,
  high24h: 0, low24h: 0,
  reason: pick(SILVER_UP_REASONS), direction: 'up',
  history: [], timestamp: new Date().toISOString(),
};

let usingRealGold = false;
let usingRealSilver = false;
let goldPrevClose = goldState.usdOz;
let silverPrevClose = silverState.usdOz;

goldState.high24h = goldState.usdOz + 15;
goldState.low24h = goldState.usdOz - 20;
silverState.high24h = silverState.usdOz + 0.6;
silverState.low24h = silverState.usdOz - 0.8;

// Seed history
for (let i = 30; i >= 1; i--) {
  const t = Date.now() - i * 15000;
  goldState.history.push({ t, price: jitter(goldState.usdOz, 0.5) });
  silverState.history.push({ t, price: jitter(silverState.usdOz, 0.8) });
}

/* ── Yahoo Finance fetcher (free, no key) ──────────────────────────── */

async function fetchRealMetals() {
  try {
    const fetchQuote = async (symbol) => {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=5m`;
      const res = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 8000,
      });
      const meta = res.data?.chart?.result?.[0]?.meta;
      if (!meta) return null;
      return {
        price: parseFloat((meta.regularMarketPrice || 0).toFixed(2)),
        previousClose: parseFloat((meta.chartPreviousClose || meta.previousClose || 0).toFixed(2)),
        high: parseFloat((meta.regularMarketDayHigh || 0).toFixed(2)),
        low: parseFloat((meta.regularMarketDayLow || 0).toFixed(2)),
      };
    };

    const [goldData, silverData] = await Promise.all([
      fetchQuote('GC=F'),  // Gold Futures
      fetchQuote('SI=F'),  // Silver Futures
    ]);

    const inrRate = 83.5; // Approximate USD to INR

    if (goldData && goldData.price > 0) {
      goldPrevClose = goldData.previousClose || goldPrevClose;
      goldState.usdOz = goldData.price;
      goldState.inr10g = round2((goldData.price / 31.1035) * 10 * inrRate);
      goldState.change24h = round2(goldData.price - goldPrevClose);
      goldState.changePct = round2(((goldData.price - goldPrevClose) / goldPrevClose) * 100);
      if (goldData.high > 0) goldState.high24h = goldData.high;
      if (goldData.low > 0) goldState.low24h = goldData.low;
      goldState.direction = goldState.change24h >= 0 ? 'up' : 'down';
      goldState.reason = goldState.direction === 'up' ? pick(GOLD_UP_REASONS) : pick(GOLD_DOWN_REASONS);
      goldState.timestamp = new Date().toISOString();
      goldState.history.push({ t: Date.now(), price: goldState.usdOz });
      if (goldState.history.length > 60) goldState.history.shift();
      usingRealGold = true;
      logger.info(`[Gold] ✓ Real price from Yahoo: $${goldState.usdOz}/oz`);
    }

    if (silverData && silverData.price > 0) {
      silverPrevClose = silverData.previousClose || silverPrevClose;
      silverState.usdOz = silverData.price;
      silverState.inrKg = round2((silverData.price / 31.1035) * 1000 * inrRate);
      silverState.change24h = round2(silverData.price - silverPrevClose);
      silverState.changePct = round2(((silverData.price - silverPrevClose) / silverPrevClose) * 100);
      if (silverData.high > 0) silverState.high24h = silverData.high;
      if (silverData.low > 0) silverState.low24h = silverData.low;
      silverState.direction = silverState.change24h >= 0 ? 'up' : 'down';
      silverState.reason = silverState.direction === 'up' ? pick(SILVER_UP_REASONS) : pick(SILVER_DOWN_REASONS);
      silverState.timestamp = new Date().toISOString();
      silverState.history.push({ t: Date.now(), price: silverState.usdOz });
      if (silverState.history.length > 60) silverState.history.shift();
      usingRealSilver = true;
      logger.info(`[Silver] ✓ Real price from Yahoo: $${silverState.usdOz}/oz`);
    }
  } catch (err) {
    logger.warn(`[Metals] Yahoo Finance fetch failed: ${err.message}`);
  }
}

// Fetch on startup + every 30 seconds
fetchRealMetals();
setInterval(fetchRealMetals, 30000);

/* ── Simulated ticks (fallback) ────────────────────────────────────── */

function tickGold() {
  if (usingRealGold) return; // Skip simulation when real data is available
  const prev = goldState.usdOz;
  const move = jitter(0, 100) * 0.003;
  goldState.usdOz = round2(goldState.usdOz + goldState.usdOz * (move / 100));
  const inrMultiplier = 83.5 + Math.random() * 0.5;
  goldState.inr10g = round2((goldState.usdOz / 31.1035) * 10 * inrMultiplier);
  goldState.change24h = round2(goldState.usdOz - prev);
  goldState.changePct = round2(((goldState.usdOz - prev) / prev) * 100);
  if (goldState.usdOz > goldState.high24h) goldState.high24h = round2(goldState.usdOz);
  if (goldState.usdOz < goldState.low24h) goldState.low24h = round2(goldState.usdOz);
  goldState.direction = goldState.change24h >= 0 ? 'up' : 'down';
  goldState.reason = goldState.direction === 'up' ? pick(GOLD_UP_REASONS) : pick(GOLD_DOWN_REASONS);
  goldState.timestamp = new Date().toISOString();
  goldState.history.push({ t: Date.now(), price: goldState.usdOz });
  if (goldState.history.length > 60) goldState.history.shift();
}

function tickSilver() {
  if (usingRealSilver) return;
  const prev = silverState.usdOz;
  const move = jitter(0, 100) * 0.005;
  silverState.usdOz = round2(silverState.usdOz + silverState.usdOz * (move / 100));
  const inrMultiplier = 83.5 + Math.random() * 0.5;
  silverState.inrKg = round2((silverState.usdOz / 31.1035) * 1000 * inrMultiplier);
  silverState.change24h = round2(silverState.usdOz - prev);
  silverState.changePct = round2(((silverState.usdOz - prev) / prev) * 100);
  if (silverState.usdOz > silverState.high24h) silverState.high24h = round2(silverState.usdOz);
  if (silverState.usdOz < silverState.low24h) silverState.low24h = round2(silverState.usdOz);
  silverState.direction = silverState.change24h >= 0 ? 'up' : 'down';
  silverState.reason = silverState.direction === 'up' ? pick(SILVER_UP_REASONS) : pick(SILVER_DOWN_REASONS);
  silverState.timestamp = new Date().toISOString();
  silverState.history.push({ t: Date.now(), price: silverState.usdOz });
  if (silverState.history.length > 60) silverState.history.shift();
}

setInterval(tickGold, 10000);
setInterval(tickSilver, 10000);

/* ── Public API ───────────────────────────────────────────────────── */

function getGoldData() {
  return { ...goldState, metal: 'GOLD', liveSource: usingRealGold ? 'Yahoo Finance' : 'Simulated' };
}

function getSilverData() {
  return { ...silverState, metal: 'SILVER', liveSource: usingRealSilver ? 'Yahoo Finance' : 'Simulated' };
}

module.exports = { getGoldData, getSilverData };
