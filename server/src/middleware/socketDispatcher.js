/**
 * WebSocket Event Dispatcher
 * Broadcasts real-time updates to connected clients using delta updates.
 */
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
const { computeStabilityIndex, getAlerts } = require('../engine/impactEngine');
const { computeDelta } = require('../utils/delta');
const config = require('../config');
const logger = require('../utils/logger');

let previousState = {};

function setupWebSocket(io) {
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Send initial full state on connect
    socket.emit('stocks', getStockData());
    socket.emit('news', getNews());
    socket.emit('weather', getWeatherData());
    socket.emit('oil', getOilData());
    socket.emit('currency', getCurrencyData());
    socket.emit('conflicts', getConflictData());
    socket.emit('shipping', getShippingData());
    socket.emit('infra', getInfraData());
    socket.emit('map', getMapData());
    socket.emit('gold', getGoldData());
    socket.emit('silver', getSilverData());
    socket.emit('livetv', getLiveTvData());
    socket.emit('war', getWarNews());
    socket.emit('impact', computeStabilityIndex());

    socket.on('request:refresh', (module) => {
      logger.debug(`Client ${socket.id} requested refresh: ${module}`);
      switch (module) {
        case 'stocks': socket.emit('stocks', getStockData()); break;
        case 'news': socket.emit('news', getNews()); break;
        case 'weather': socket.emit('weather', getWeatherData()); break;
        case 'oil': socket.emit('oil', getOilData()); break;
        case 'currency': socket.emit('currency', getCurrencyData()); break;
        case 'conflicts': socket.emit('conflicts', getConflictData()); break;
        case 'shipping': socket.emit('shipping', getShippingData()); break;
        case 'infra': socket.emit('infra', getInfraData()); break;
        case 'map': socket.emit('map', getMapData()); break;
        case 'impact': socket.emit('impact', computeStabilityIndex()); break;
        case 'gold': socket.emit('gold', getGoldData()); break;
        case 'silver': socket.emit('silver', getSilverData()); break;
        case 'livetv': socket.emit('livetv', getLiveTvData()); break;
        case 'war': socket.emit('war', getWarNews()); break;
        default: socket.emit('error', { message: 'Unknown module' });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  // Scheduled broadcasts with delta updates
  function broadcastDelta(eventName, dataFn, intervalMs) {
    setInterval(() => {
      const data = dataFn();
      const delta = computeDelta(previousState[eventName], data);
      previousState[eventName] = data;

      if (delta) {
        io.emit(eventName, data); // Send full data for simplicity; delta logic can be enhanced
      }
    }, intervalMs);
  }

  // Set up polling intervals for each data stream
  broadcastDelta('stocks', getStockData, config.polling.stock);
  broadcastDelta('news', getNews, config.polling.news);
  broadcastDelta('weather', getWeatherData, config.polling.weather);
  broadcastDelta('oil', getOilData, config.polling.oil);
  broadcastDelta('currency', getCurrencyData, config.polling.currency);
  broadcastDelta('conflicts', getConflictData, config.polling.conflict);
  broadcastDelta('infra', getInfraData, config.polling.infra);
  broadcastDelta('gold', getGoldData, config.polling.gold);
  broadcastDelta('silver', getSilverData, config.polling.silver);

  // Impact engine runs slightly slower
  setInterval(() => {
    const impact = computeStabilityIndex();
    io.emit('impact', impact);

    // Broadcast alerts
    const alerts = getAlerts();
    if (alerts.length > 0) {
      io.emit('alerts', alerts);
    }
  }, 20000);

  // Map data aggregated (less frequent)
  broadcastDelta('map', getMapData, 30000);

  // War news — every 5 seconds for real-time feel
  broadcastDelta('war', getWarNews, 5000);

  // Live TV channel IDs refresh (every 5 min)
  broadcastDelta('livetv', getLiveTvData, 5 * 60 * 1000);

  logger.info('WebSocket dispatcher initialized with polling intervals');
}

module.exports = { setupWebSocket };
