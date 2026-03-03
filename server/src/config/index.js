require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT) || 4000,
  env: process.env.NODE_ENV || 'development',

  api: {
    newsApiKey: process.env.NEWS_API_KEY || '',
    openWeatherKey: process.env.OPENWEATHER_API_KEY || '',
    alphaVantageKey: process.env.ALPHA_VANTAGE_KEY || '',
    aqicnKey: process.env.AQICN_API_KEY || '',
    mapboxToken: process.env.MAPBOX_TOKEN || '',
  },

  redis: {
    url: process.env.REDIS_URL || '',
  },

  database: {
    url: process.env.DATABASE_URL || '',
  },

  polling: {
    stock: parseInt(process.env.STOCK_POLL_INTERVAL) || 15000,
    news: parseInt(process.env.NEWS_POLL_INTERVAL) || 30000,
    weather: parseInt(process.env.WEATHER_POLL_INTERVAL) || 300000,
    oil: parseInt(process.env.OIL_POLL_INTERVAL) || 60000,
    currency: parseInt(process.env.CURRENCY_POLL_INTERVAL) || 30000,
    conflict: parseInt(process.env.CONFLICT_POLL_INTERVAL) || 120000,
    infra: parseInt(process.env.INFRA_POLL_INTERVAL) || 60000,
    gold: parseInt(process.env.GOLD_POLL_INTERVAL) || 10000,
    silver: parseInt(process.env.SILVER_POLL_INTERVAL) || 10000,
    aqi: parseInt(process.env.AQI_POLL_INTERVAL) || 300000,
  },

  thresholds: {
    oilSpikePercent: 3,
    niftyVolatilityPercent: 2,
    usdInrStressLevel: 87,
    marketCrashPercent: -3,
    aqiDangerLevel: 300,
    tempHeatwaveC: 45,
  },
};
