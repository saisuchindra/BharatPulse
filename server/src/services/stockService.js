/**
 * Stock Market Data Service
 * Fetches real-time NIFTY, SENSEX, and top Indian stocks from Yahoo Finance (free, no key).
 * Falls back to simulated data if API is unavailable.
 */
const axios = require('axios');
const cache = require('../utils/cache');
const logger = require('../utils/logger');

const STOCKS = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', sector: 'Energy', displaySymbol: 'RELIANCE' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', sector: 'IT', displaySymbol: 'TCS' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', sector: 'Banking', displaySymbol: 'HDFCBANK' },
  { symbol: 'INFY.NS', name: 'Infosys', sector: 'IT', displaySymbol: 'INFY' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', sector: 'Banking', displaySymbol: 'ICICIBANK' },
  { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever', sector: 'FMCG', displaySymbol: 'HINDUNILVR' },
  { symbol: 'SBIN.NS', name: 'State Bank of India', sector: 'Banking', displaySymbol: 'SBIN' },
  { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel', sector: 'Telecom', displaySymbol: 'BHARTIARTL' },
  { symbol: 'ITC.NS', name: 'ITC Limited', sector: 'FMCG', displaySymbol: 'ITC' },
  { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank', sector: 'Banking', displaySymbol: 'KOTAKBANK' },
];

const INDICES = [
  { symbol: '^NSEI', displaySymbol: 'NIFTY' },
  { symbol: '^BSESN', displaySymbol: 'SENSEX' },
];

// ── Fallback simulated prices ──
const BASE_PRICES = {
  NIFTY: 24850, SENSEX: 81200, RELIANCE: 2945, TCS: 4120,
  HDFCBANK: 1785, INFY: 1890, ICICIBANK: 1265, HINDUNILVR: 2580,
  SBIN: 815, BHARTIARTL: 1720, ITC: 465, KOTAKBANK: 1890,
};

let currentPrices = {};
let previousPrices = {};
let lastRealFetch = null;
let usingRealData = false;

function initPrices() {
  for (const [sym, base] of Object.entries(BASE_PRICES)) {
    const variation = base * (Math.random() * 0.02 - 0.01);
    currentPrices[sym] = parseFloat((base + variation).toFixed(2));
    previousPrices[sym] = base;
  }
}
initPrices();

// ── Yahoo Finance fetcher (free, no key needed) ──
async function fetchYahooQuote(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=5m`;
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 8000,
    });
    const result = res.data?.chart?.result?.[0];
    if (!result) return null;
    const meta = result.meta;
    return {
      price: parseFloat((meta.regularMarketPrice || 0).toFixed(2)),
      previousClose: parseFloat((meta.chartPreviousClose || meta.previousClose || 0).toFixed(2)),
      high: parseFloat((meta.regularMarketDayHigh || meta.regularMarketPrice * 1.005).toFixed(2)),
      low: parseFloat((meta.regularMarketDayLow || meta.regularMarketPrice * 0.995).toFixed(2)),
      volume: meta.regularMarketVolume || 0,
    };
  } catch (err) {
    return null;
  }
}

async function fetchRealData() {
  try {
    const indexPromises = INDICES.map(async (idx) => {
      const data = await fetchYahooQuote(idx.symbol);
      if (!data) return null;
      const change = data.price - data.previousClose;
      const changePct = (change / data.previousClose) * 100;
      currentPrices[idx.displaySymbol] = data.price;
      previousPrices[idx.displaySymbol] = data.previousClose;
      return {
        symbol: idx.displaySymbol,
        price: data.price,
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePct.toFixed(2)),
        previousClose: data.previousClose,
        high: data.high,
        low: data.low,
      };
    });

    const stockPromises = STOCKS.map(async (s) => {
      const data = await fetchYahooQuote(s.symbol);
      if (!data) return null;
      const change = data.price - data.previousClose;
      const changePct = (change / data.previousClose) * 100;
      currentPrices[s.displaySymbol] = data.price;
      previousPrices[s.displaySymbol] = data.previousClose;
      return {
        symbol: s.displaySymbol,
        name: s.name,
        sector: s.sector,
        price: data.price,
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePct.toFixed(2)),
        previousClose: data.previousClose,
        volume: data.volume,
      };
    });

    const [indicesResults, stocksResults] = await Promise.all([
      Promise.all(indexPromises),
      Promise.all(stockPromises),
    ]);

    const validIndices = indicesResults.filter(Boolean);
    const validStocks = stocksResults.filter(Boolean);

    if (validIndices.length > 0 && validStocks.length > 0) {
      lastRealFetch = { indices: validIndices, stocks: validStocks };
      usingRealData = true;
      logger.info(`[Stocks] ✓ Real data: ${validIndices.length} indices, ${validStocks.length} stocks from Yahoo Finance`);
      return lastRealFetch;
    }
  } catch (err) {
    logger.warn(`[Stocks] Yahoo Finance failed, using simulated: ${err.message}`);
  }
  return null;
}

// Fetch real data every 30s
setInterval(fetchRealData, 30000);
fetchRealData();

// ── Simulated tick (fallback) ──
function tickPrices() {
  previousPrices = { ...currentPrices };
  for (const sym of Object.keys(currentPrices)) {
    const volatility = sym === 'NIFTY' || sym === 'SENSEX' ? 0.0008 : 0.0015;
    const change = currentPrices[sym] * (Math.random() * volatility * 2 - volatility);
    currentPrices[sym] = parseFloat((currentPrices[sym] + change).toFixed(2));
  }
}

function isMarketOpen() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);
  const hours = ist.getUTCHours();
  const minutes = ist.getUTCMinutes();
  const day = ist.getUTCDay();
  if (day === 0 || day === 6) return false;
  const totalMin = hours * 60 + minutes;
  return totalMin >= 555 && totalMin <= 930;
}

function getStockData() {
  const marketOpen = isMarketOpen();
  let indices, stocks;

  if (usingRealData && lastRealFetch) {
    indices = lastRealFetch.indices;
    stocks = lastRealFetch.stocks;
  } else {
    tickPrices();
    indices = ['NIFTY', 'SENSEX'].map(sym => {
      const change = currentPrices[sym] - BASE_PRICES[sym];
      const changePct = (change / BASE_PRICES[sym]) * 100;
      return {
        symbol: sym, price: currentPrices[sym],
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePct.toFixed(2)),
        previousClose: BASE_PRICES[sym],
        high: parseFloat((currentPrices[sym] * 1.005).toFixed(2)),
        low: parseFloat((currentPrices[sym] * 0.995).toFixed(2)),
      };
    });
    stocks = STOCKS.map(s => {
      const change = currentPrices[s.displaySymbol] - BASE_PRICES[s.displaySymbol];
      const changePct = (change / BASE_PRICES[s.displaySymbol]) * 100;
      return {
        symbol: s.displaySymbol, name: s.name, sector: s.sector,
        price: currentPrices[s.displaySymbol],
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePct.toFixed(2)),
        previousClose: BASE_PRICES[s.displaySymbol],
        volume: Math.floor(Math.random() * 5000000 + 1000000),
      };
    });
  }

  const gainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const losers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);

  const niftyChange = indices.find(i => i.symbol === 'NIFTY')?.changePercent || 0;
  const volatility = Math.abs(niftyChange) > 1.5 ? 'HIGH' :
    Math.abs(niftyChange) > 0.7 ? 'MODERATE' : 'LOW';

  const data = {
    timestamp: new Date().toISOString(),
    marketOpen,
    liveSource: usingRealData ? 'Yahoo Finance' : 'Simulated',
    indices, stocks, gainers, losers, volatility,
  };

  cache.set('stocks', data, 15000);
  return data;
}

function getVolatilityPercent() {
  const nifty = currentPrices.NIFTY;
  const base = previousPrices.NIFTY || BASE_PRICES.NIFTY;
  return Math.abs(((nifty - base) / base) * 100);
}

module.exports = { getStockData, isMarketOpen, getVolatilityPercent, currentPrices, BASE_PRICES };
