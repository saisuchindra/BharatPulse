/**
 * Oil & Currency Service
 * Fetches real currency rates from Frankfurter API (free, no key).
 * Fetches oil prices from Yahoo Finance commodity quotes (free, no key).
 * Falls back to simulated data if APIs are unavailable.
 */
const axios = require('axios');
const cache = require('../utils/cache');
const logger = require('../utils/logger');

let oilState = {
  brent: 82.45, wti: 78.30,
  brentPrev24h: 82.45, wtiPrev24h: 78.30,
};

let currencyState = {
  usdInr: 83.42, eurInr: 90.15, gbpInr: 105.80, jpyInr: 0.556,
  usdInrPrev: 83.42,
};

let usingRealCurrency = false;
let usingRealOil = false;

// ── Fetch real currency from Frankfurter API (free, no key) ──
async function fetchRealCurrency() {
  try {
    const res = await axios.get('https://api.frankfurter.app/latest?from=INR&to=USD,EUR,GBP,JPY', { timeout: 8000 });
    if (res.data?.rates) {
      const rates = res.data.rates;
      // Frankfurter gives INR -> X, we want X -> INR (invert)
      const prevUsd = currencyState.usdInr;
      currencyState.usdInr = rates.USD ? parseFloat((1 / rates.USD).toFixed(4)) : currencyState.usdInr;
      currencyState.eurInr = rates.EUR ? parseFloat((1 / rates.EUR).toFixed(4)) : currencyState.eurInr;
      currencyState.gbpInr = rates.GBP ? parseFloat((1 / rates.GBP).toFixed(4)) : currencyState.gbpInr;
      currencyState.jpyInr = rates.JPY ? parseFloat((1 / rates.JPY).toFixed(4)) : currencyState.jpyInr;
      currencyState.usdInrPrev = prevUsd;
      usingRealCurrency = true;
      logger.info(`[Currency] ✓ Real rates from Frankfurter: USD/INR=${currencyState.usdInr}`);
    }
  } catch (err) {
    logger.warn(`[Currency] Frankfurter failed, using simulated: ${err.message}`);
  }
}

// ── Fetch real oil from Yahoo Finance (free, no key) ──
async function fetchRealOil() {
  try {
    const fetchQuote = async (symbol) => {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=1d`;
      const res = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 8000,
      });
      const meta = res.data?.chart?.result?.[0]?.meta;
      if (!meta) return null;
      return {
        price: parseFloat((meta.regularMarketPrice || 0).toFixed(2)),
        previousClose: parseFloat((meta.chartPreviousClose || meta.previousClose || 0).toFixed(2)),
      };
    };

    const [brent, wti] = await Promise.all([
      fetchQuote('BZ=F'),  // Brent Crude
      fetchQuote('CL=F'),  // WTI Crude
    ]);

    if (brent) {
      oilState.brentPrev24h = brent.previousClose || oilState.brentPrev24h;
      oilState.brent = brent.price;
    }
    if (wti) {
      oilState.wtiPrev24h = wti.previousClose || oilState.wtiPrev24h;
      oilState.wti = wti.price;
    }

    if (brent || wti) {
      usingRealOil = true;
      logger.info(`[Oil] ✓ Real prices from Yahoo: Brent=$${oilState.brent}, WTI=$${oilState.wti}`);
    }
  } catch (err) {
    logger.warn(`[Oil] Yahoo Finance oil fetch failed, using simulated: ${err.message}`);
  }
}

// Fetch on startup + periodic refresh
fetchRealCurrency();
fetchRealOil();
setInterval(fetchRealCurrency, 60000);   // Every 1 min
setInterval(fetchRealOil, 60000);         // Every 1 min

// ── Simulated ticks (fallback when real data unavailable) ──
function tickOil() {
  if (usingRealOil) return;
  const brentChange = oilState.brent * (Math.random() * 0.004 - 0.002);
  const wtiChange = oilState.wti * (Math.random() * 0.004 - 0.002);
  oilState.brent = parseFloat((oilState.brent + brentChange).toFixed(2));
  oilState.wti = parseFloat((oilState.wti + wtiChange).toFixed(2));
}

function tickCurrency() {
  if (usingRealCurrency) return;
  currencyState.usdInrPrev = currencyState.usdInr;
  const change = currencyState.usdInr * (Math.random() * 0.001 - 0.0005);
  currencyState.usdInr = parseFloat((currencyState.usdInr + change).toFixed(4));
  currencyState.eurInr = parseFloat((currencyState.eurInr + currencyState.eurInr * (Math.random() * 0.001 - 0.0005)).toFixed(4));
  currencyState.gbpInr = parseFloat((currencyState.gbpInr + currencyState.gbpInr * (Math.random() * 0.001 - 0.0005)).toFixed(4));
  currencyState.jpyInr = parseFloat((currencyState.jpyInr + currencyState.jpyInr * (Math.random() * 0.002 - 0.001)).toFixed(4));
}

function getOilData() {
  tickOil();
  const brentChange24h = ((oilState.brent - oilState.brentPrev24h) / oilState.brentPrev24h) * 100;
  const wtiChange24h = ((oilState.wti - oilState.wtiPrev24h) / oilState.wtiPrev24h) * 100;

  return {
    timestamp: new Date().toISOString(),
    liveSource: usingRealOil ? 'Yahoo Finance' : 'Simulated',
    brent: { price: oilState.brent, change24h: parseFloat(brentChange24h.toFixed(2)) },
    wti: { price: oilState.wti, change24h: parseFloat(wtiChange24h.toFixed(2)) },
    unit: 'USD/barrel',
  };
}

function getCurrencyData() {
  tickCurrency();
  const usdChange = ((currencyState.usdInr - currencyState.usdInrPrev) / currencyState.usdInrPrev) * 100;

  return {
    timestamp: new Date().toISOString(),
    liveSource: usingRealCurrency ? 'Frankfurter API' : 'Simulated',
    pairs: [
      { pair: 'USD/INR', rate: currencyState.usdInr, change: parseFloat(usdChange.toFixed(4)) },
      { pair: 'EUR/INR', rate: currencyState.eurInr, change: 0 },
      { pair: 'GBP/INR', rate: currencyState.gbpInr, change: 0 },
      { pair: 'JPY/INR', rate: currencyState.jpyInr, change: 0 },
    ],
  };
}

function getOilChangePercent24h() {
  return Math.abs(((oilState.brent - oilState.brentPrev24h) / oilState.brentPrev24h) * 100);
}

function getUsdInr() {
  return currencyState.usdInr;
}

module.exports = { getOilData, getCurrencyData, getOilChangePercent24h, getUsdInr, oilState, currencyState };
