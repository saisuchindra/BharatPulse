/**
 * Stock Market Data Service
 * Simulates real-time NIFTY, SENSEX, and top Indian stocks.
 * When API key is available, integrates with real market data APIs.
 */
const cache = require('../utils/cache');
const logger = require('../utils/logger');

const STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Banking' },
  { symbol: 'INFY', name: 'Infosys', sector: 'IT' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', sector: 'Banking' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', sector: 'FMCG' },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', sector: 'Telecom' },
  { symbol: 'ITC', name: 'ITC Limited', sector: 'FMCG' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Banking' },
];

const BASE_PRICES = {
  NIFTY: 24850,
  SENSEX: 81200,
  RELIANCE: 2945,
  TCS: 4120,
  HDFCBANK: 1785,
  INFY: 1890,
  ICICIBANK: 1265,
  HINDUNILVR: 2580,
  SBIN: 815,
  BHARTIARTL: 1720,
  ITC: 465,
  KOTAKBANK: 1890,
};

let currentPrices = {};
let previousPrices = {};

function initPrices() {
  for (const [sym, base] of Object.entries(BASE_PRICES)) {
    const variation = base * (Math.random() * 0.02 - 0.01);
    currentPrices[sym] = parseFloat((base + variation).toFixed(2));
    previousPrices[sym] = base;
  }
}

initPrices();

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
  return totalMin >= 555 && totalMin <= 930; // 9:15 AM - 3:30 PM IST
}

function getStockData() {
  tickPrices();

  const marketOpen = isMarketOpen();
  const indices = ['NIFTY', 'SENSEX'].map(sym => {
    const change = currentPrices[sym] - BASE_PRICES[sym];
    const changePct = (change / BASE_PRICES[sym]) * 100;
    return {
      symbol: sym,
      price: currentPrices[sym],
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePct.toFixed(2)),
      previousClose: BASE_PRICES[sym],
      high: parseFloat((currentPrices[sym] * 1.005).toFixed(2)),
      low: parseFloat((currentPrices[sym] * 0.995).toFixed(2)),
    };
  });

  const stocks = STOCKS.map(s => {
    const change = currentPrices[s.symbol] - BASE_PRICES[s.symbol];
    const changePct = (change / BASE_PRICES[s.symbol]) * 100;
    return {
      ...s,
      price: currentPrices[s.symbol],
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePct.toFixed(2)),
      previousClose: BASE_PRICES[s.symbol],
      volume: Math.floor(Math.random() * 5000000 + 1000000),
    };
  });

  const gainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const losers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);

  const volatility = Math.abs(indices[0].changePercent) > 1.5 ? 'HIGH' :
    Math.abs(indices[0].changePercent) > 0.7 ? 'MODERATE' : 'LOW';

  const data = {
    timestamp: new Date().toISOString(),
    marketOpen,
    indices,
    stocks,
    gainers,
    losers,
    volatility,
  };

  cache.set('stocks', data, 15000);
  return data;
}

function getVolatilityPercent() {
  const nifty = currentPrices.NIFTY;
  const base = BASE_PRICES.NIFTY;
  return Math.abs(((nifty - base) / base) * 100);
}

module.exports = { getStockData, isMarketOpen, getVolatilityPercent, currentPrices, BASE_PRICES };
