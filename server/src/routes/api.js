/**
 * API Routes
 * REST endpoints for initial data load and fallback.
 */
const express = require('express');
const router = express.Router();

const { getStockData } = require('../services/stockService');
const { getNews } = require('../services/newsService');
const { getWeatherData } = require('../services/weatherService');
const { getOilData, getCurrencyData } = require('../services/oilCurrencyService');
const { getConflictData } = require('../services/conflictService');
const { getShippingData } = require('../services/shippingService');
const { getInfraData } = require('../services/infraService');
const { getMapData } = require('../services/mapService');
const { getGoldData, getSilverData } = require('../services/preciousMetalService');
const { getLiveTvData } = require('../services/livetvService');
const { getWarNews } = require('../services/warNewsService');
const { computeStabilityIndex, getImpactHistory, getAlerts } = require('../engine/impactEngine');

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'online', timestamp: new Date().toISOString(), service: 'BharatPulse' });
});

// Stock data
router.get('/stocks', (req, res) => {
  res.json(getStockData());
});

// News feed
router.get('/news', (req, res) => {
  const { category } = req.query;
  res.json(getNews(category || null));
});

// Weather & AQI
router.get('/weather', (req, res) => {
  res.json(getWeatherData());
});

// Oil prices
router.get('/oil', (req, res) => {
  res.json(getOilData());
});

// Currency rates
router.get('/currency', (req, res) => {
  res.json(getCurrencyData());
});

// Conflicts
router.get('/conflicts', (req, res) => {
  res.json(getConflictData());
});

// Shipping routes
router.get('/shipping', (req, res) => {
  res.json(getShippingData());
});

// Infrastructure
router.get('/infra', (req, res) => {
  res.json(getInfraData());
});

// Map data (aggregated)
router.get('/map', (req, res) => {
  res.json(getMapData());
});

// India Impact Engine
router.get('/impact', (req, res) => {
  res.json(computeStabilityIndex());
});

// Impact history
router.get('/impact/history', (req, res) => {
  res.json(getImpactHistory());
});

// Gold prices
router.get('/gold', (req, res) => {
  res.json(getGoldData());
});

// Silver prices
router.get('/silver', (req, res) => {
  res.json(getSilverData());
});

// Live TV channels (dynamic YouTube live-stream IDs)
router.get('/livetv', (req, res) => {
  res.json(getLiveTvData());
});

// War news bulletins
router.get('/war', (req, res) => {
  res.json(getWarNews());
});

// Alerts
router.get('/alerts', (req, res) => {
  res.json(getAlerts());
});

module.exports = router;
