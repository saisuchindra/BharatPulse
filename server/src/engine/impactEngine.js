/**
 * India Impact Engine
 * Core innovation: Rule-based real-time impact calculation.
 * Computes India Stability Index (0-100) from multiple data streams.
 */
const config = require('../config');
const { getOilChangePercent24h, getUsdInr } = require('../services/oilCurrencyService');
const { getVolatilityPercent } = require('../services/stockService');
const { getOilRegionEscalation } = require('../services/conflictService');
const logger = require('../utils/logger');

// Weights for each factor (total = 1.0)
const WEIGHTS = {
  oil: 0.25,
  market: 0.20,
  currency: 0.20,
  geopolitical: 0.20,
  trade: 0.15,
};

let impactHistory = [];
let alertQueue = [];

function calculateOilImpact() {
  const changePercent = getOilChangePercent24h();
  let score = 0;

  if (changePercent > 5) score = 90;
  else if (changePercent > 3) score = 70;
  else if (changePercent > 2) score = 50;
  else if (changePercent > 1) score = 30;
  else score = 10;

  return {
    name: 'Oil Impact',
    score,
    value: `${changePercent.toFixed(2)}% 24h change`,
    status: score > 70 ? 'CRITICAL' : score > 50 ? 'ELEVATED' : 'STABLE',
  };
}

function calculateMarketImpact() {
  const volatility = getVolatilityPercent();
  let score = 0;

  if (volatility > 3) score = 90;
  else if (volatility > 2) score = 70;
  else if (volatility > 1) score = 50;
  else if (volatility > 0.5) score = 30;
  else score = 10;

  return {
    name: 'Market Volatility',
    score,
    value: `${volatility.toFixed(2)}% NIFTY swing`,
    status: score > 70 ? 'CRITICAL' : score > 50 ? 'ELEVATED' : 'STABLE',
  };
}

function calculateCurrencyImpact() {
  const usdInr = getUsdInr();
  const stressLevel = config.thresholds.usdInrStressLevel;
  let score = 0;

  if (usdInr > stressLevel + 2) score = 90;
  else if (usdInr > stressLevel) score = 70;
  else if (usdInr > stressLevel - 2) score = 50;
  else if (usdInr > stressLevel - 4) score = 30;
  else score = 10;

  return {
    name: 'Currency Stress',
    score,
    value: `₹${usdInr.toFixed(2)} / USD`,
    status: score > 70 ? 'CRITICAL' : score > 50 ? 'ELEVATED' : 'STABLE',
  };
}

function calculateGeopoliticalImpact() {
  const escalation = getOilRegionEscalation();
  let score = escalation * 10;
  score = Math.min(100, Math.max(0, score));

  return {
    name: 'Geopolitical Risk',
    score,
    value: `Escalation Level: ${escalation}/10`,
    status: score > 70 ? 'CRITICAL' : score > 50 ? 'ELEVATED' : 'STABLE',
  };
}

function calculateTradeImpact() {
  // Composite of shipping disruptions
  const escalation = getOilRegionEscalation();
  let score = Math.min(100, escalation * 8 + Math.random() * 10);

  return {
    name: 'Trade Disruption',
    score: Math.round(score),
    value: `Risk Factor: ${(score / 10).toFixed(1)}/10`,
    status: score > 70 ? 'CRITICAL' : score > 50 ? 'ELEVATED' : 'STABLE',
  };
}

function computeStabilityIndex() {
  const oil = calculateOilImpact();
  const market = calculateMarketImpact();
  const currency = calculateCurrencyImpact();
  const geopolitical = calculateGeopoliticalImpact();
  const trade = calculateTradeImpact();

  const weightedScore =
    oil.score * WEIGHTS.oil +
    market.score * WEIGHTS.market +
    currency.score * WEIGHTS.currency +
    geopolitical.score * WEIGHTS.geopolitical +
    trade.score * WEIGHTS.trade;

  // Stability = 100 - risk score (higher = more stable)
  const stabilityIndex = Math.round(Math.max(0, Math.min(100, 100 - weightedScore)));

  let overallStatus;
  if (stabilityIndex >= 70) overallStatus = 'STABLE';
  else if (stabilityIndex >= 40) overallStatus = 'ELEVATED';
  else overallStatus = 'CRITICAL';

  const result = {
    timestamp: new Date().toISOString(),
    stabilityIndex,
    overallStatus,
    factors: {
      oil,
      market,
      currency,
      geopolitical,
      trade,
    },
    riskScore: Math.round(weightedScore),
  };

  // Check for alerts
  checkAlertThresholds(result);

  // Store in history
  impactHistory.push({ timestamp: result.timestamp, index: stabilityIndex, status: overallStatus });
  if (impactHistory.length > 100) impactHistory = impactHistory.slice(-100);

  return result;
}

function checkAlertThresholds(data) {
  const { factors, stabilityIndex } = data;

  if (factors.oil.score > 70) {
    alertQueue.push({
      type: 'OIL_SPIKE',
      severity: 'critical',
      message: `Oil price spike detected: ${factors.oil.value}`,
      timestamp: new Date().toISOString(),
    });
  }

  if (factors.market.score > 70) {
    alertQueue.push({
      type: 'MARKET_VOLATILITY',
      severity: 'critical',
      message: `High market volatility: ${factors.market.value}`,
      timestamp: new Date().toISOString(),
    });
  }

  if (factors.currency.score > 70) {
    alertQueue.push({
      type: 'CURRENCY_STRESS',
      severity: 'critical',
      message: `Rupee under stress: ${factors.currency.value}`,
      timestamp: new Date().toISOString(),
    });
  }

  if (factors.geopolitical.score > 70) {
    alertQueue.push({
      type: 'CONFLICT_ESCALATION',
      severity: 'critical',
      message: `Geopolitical escalation in oil-producing region`,
      timestamp: new Date().toISOString(),
    });
  }

  if (stabilityIndex < 40) {
    alertQueue.push({
      type: 'STABILITY_CRITICAL',
      severity: 'critical',
      message: `India Stability Index dropped to ${stabilityIndex}/100`,
      timestamp: new Date().toISOString(),
    });
  }
}

function getAlerts() {
  const alerts = [...alertQueue];
  alertQueue = [];
  return alerts;
}

function getImpactHistory() {
  return impactHistory;
}

module.exports = { computeStabilityIndex, getAlerts, getImpactHistory };
