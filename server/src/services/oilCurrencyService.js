/**
 * Oil & Currency Service
 * Tracks crude oil prices and USD/INR exchange rate.
 */
const cache = require('../utils/cache');

let oilState = {
  brent: 82.45,
  wti: 78.30,
  brentPrev24h: 82.45,
  wtiPrev24h: 78.30,
};

let currencyState = {
  usdInr: 83.42,
  eurInr: 90.15,
  gbpInr: 105.80,
  jpyInr: 0.556,
  usdInrPrev: 83.42,
};

function tickOil() {
  const brentChange = oilState.brent * (Math.random() * 0.004 - 0.002);
  const wtiChange = oilState.wti * (Math.random() * 0.004 - 0.002);
  oilState.brent = parseFloat((oilState.brent + brentChange).toFixed(2));
  oilState.wti = parseFloat((oilState.wti + wtiChange).toFixed(2));
}

function tickCurrency() {
  currencyState.usdInrPrev = currencyState.usdInr;
  const change = currencyState.usdInr * (Math.random() * 0.001 - 0.0005);
  currencyState.usdInr = parseFloat((currencyState.usdInr + change).toFixed(4));

  const eurChange = currencyState.eurInr * (Math.random() * 0.001 - 0.0005);
  currencyState.eurInr = parseFloat((currencyState.eurInr + eurChange).toFixed(4));

  const gbpChange = currencyState.gbpInr * (Math.random() * 0.001 - 0.0005);
  currencyState.gbpInr = parseFloat((currencyState.gbpInr + gbpChange).toFixed(4));

  const jpyChange = currencyState.jpyInr * (Math.random() * 0.002 - 0.001);
  currencyState.jpyInr = parseFloat((currencyState.jpyInr + jpyChange).toFixed(4));
}

function getOilData() {
  tickOil();
  const brentChange24h = ((oilState.brent - oilState.brentPrev24h) / oilState.brentPrev24h) * 100;
  const wtiChange24h = ((oilState.wti - oilState.wtiPrev24h) / oilState.wtiPrev24h) * 100;

  return {
    timestamp: new Date().toISOString(),
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
