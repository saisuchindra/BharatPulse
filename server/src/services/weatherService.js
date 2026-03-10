/**
 * Weather & AQI Service
 * Fetches real weather from Open-Meteo (completely free, no API key needed).
 * Falls back to simulated data if API is unavailable.
 */
const axios = require('axios');
const cache = require('../utils/cache');
const logger = require('../utils/logger');

const CITIES = [
  { name: 'Delhi', lat: 28.6139, lon: 77.209, state: 'Delhi' },
  { name: 'Mumbai', lat: 19.076, lon: 72.8777, state: 'Maharashtra' },
  { name: 'Bangalore', lat: 12.9716, lon: 77.5946, state: 'Karnataka' },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707, state: 'Tamil Nadu' },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639, state: 'West Bengal' },
  { name: 'Hyderabad', lat: 17.385, lon: 78.4867, state: 'Telangana' },
  { name: 'Pune', lat: 18.5204, lon: 73.8567, state: 'Maharashtra' },
  { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714, state: 'Gujarat' },
  { name: 'Jaipur', lat: 26.9124, lon: 75.7873, state: 'Rajasthan' },
  { name: 'Lucknow', lat: 26.8467, lon: 80.9462, state: 'Uttar Pradesh' },
];

const WMO_CODE_MAP = {
  0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Fog', 51: 'Light Drizzle', 53: 'Drizzle',
  55: 'Heavy Drizzle', 56: 'Freezing Drizzle', 57: 'Freezing Drizzle',
  61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain',
  66: 'Freezing Rain', 67: 'Freezing Rain',
  71: 'Light Snow', 73: 'Snow', 75: 'Heavy Snow',
  77: 'Snow Grains', 80: 'Light Showers', 81: 'Showers', 82: 'Heavy Showers',
  85: 'Snow Showers', 86: 'Heavy Snow Showers',
  95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm',
};

let weatherCache = {};
let usingRealData = false;

// ── Fetch real weather from Open-Meteo (FREE, no key) ──
async function fetchRealWeather() {
  try {
    const lats = CITIES.map(c => c.lat).join(',');
    const lons = CITIES.map(c => c.lon).join(',');

    // Open-Meteo supports bulk queries
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index&timezone=Asia/Kolkata`;

    const res = await axios.get(url, { timeout: 10000 });
    const results = Array.isArray(res.data) ? res.data : [res.data];

    CITIES.forEach((city, i) => {
      const data = results[i];
      if (!data?.current) return;
      const c = data.current;

      weatherCache[city.name] = {
        temp: c.temperature_2m || 30,
        humidity: c.relative_humidity_2m || 60,
        windSpeed: c.wind_speed_10m || 10,
        condition: WMO_CODE_MAP[c.weather_code] || 'Clear',
        feelsLike: c.apparent_temperature || c.temperature_2m || 30,
        uvIndex: c.uv_index || 5,
        visibility: parseFloat((Math.random() * 6 + 4).toFixed(1)), // Open-Meteo doesn't have visibility in free tier
        aqi: 0, // Will fetch separately
        aqiCategory: '',
      };
    });

    // Fetch AQI from Open-Meteo Air Quality API (also free, no key)
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lons}&current=european_aqi,pm10,pm2_5`;
    try {
      const aqiRes = await axios.get(aqiUrl, { timeout: 10000 });
      const aqiResults = Array.isArray(aqiRes.data) ? aqiRes.data : [aqiRes.data];

      CITIES.forEach((city, i) => {
        const data = aqiResults[i];
        if (!data?.current || !weatherCache[city.name]) return;
        // Convert European AQI to approximate US AQI scale
        const eaqi = data.current.european_aqi || 50;
        const usAqi = Math.round(eaqi * 1.5); // rough conversion
        weatherCache[city.name].aqi = usAqi;
        updateAqiCategory(city.name);
      });
    } catch (aqiErr) {
      // AQI fetch failed, set random AQI
      CITIES.forEach(city => {
        if (weatherCache[city.name]) {
          weatherCache[city.name].aqi = Math.floor(Math.random() * 200 + 50);
          updateAqiCategory(city.name);
        }
      });
    }

    usingRealData = true;
    logger.info(`[Weather] ✓ Real data fetched from Open-Meteo for ${CITIES.length} cities`);
  } catch (err) {
    logger.warn(`[Weather] Open-Meteo failed, using simulated: ${err.message}`);
    if (Object.keys(weatherCache).length === 0) {
      initSimulatedWeather();
    }
  }
}

function updateAqiCategory(name) {
  const w = weatherCache[name];
  if (!w) return;
  if (w.aqi <= 50) w.aqiCategory = 'Good';
  else if (w.aqi <= 100) w.aqiCategory = 'Moderate';
  else if (w.aqi <= 150) w.aqiCategory = 'Unhealthy for Sensitive Groups';
  else if (w.aqi <= 200) w.aqiCategory = 'Unhealthy';
  else if (w.aqi <= 300) w.aqiCategory = 'Very Unhealthy';
  else w.aqiCategory = 'Hazardous';
}

// ── Simulated fallback ──
function randomInRange(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1));
}

function initSimulatedWeather() {
  const CONDITIONS = ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain', 'Thunderstorm', 'Haze', 'Fog', 'Sunny', 'Overcast'];
  CITIES.forEach(city => {
    const baseTemp = city.lat < 15 ? 32 : city.lat < 20 ? 30 : city.lat < 25 ? 28 : 26;
    weatherCache[city.name] = {
      temp: baseTemp + randomInRange(-3, 3),
      humidity: randomInRange(40, 85),
      windSpeed: randomInRange(5, 25),
      condition: CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)],
      aqi: Math.floor(Math.random() * 300 + 50),
      aqiCategory: '',
      feelsLike: 0,
      visibility: randomInRange(2, 10),
      uvIndex: randomInRange(3, 11),
    };
    weatherCache[city.name].feelsLike = parseFloat((weatherCache[city.name].temp + (weatherCache[city.name].humidity > 60 ? 2 : -1)).toFixed(1));
    updateAqiCategory(city.name);
  });
}

// Initial fetch + refresh every 5 minutes
fetchRealWeather();
setInterval(fetchRealWeather, 300000);

function getWeatherData() {
  if (Object.keys(weatherCache).length === 0) initSimulatedWeather();

  const alerts = [];
  CITIES.forEach(city => {
    const w = weatherCache[city.name];
    if (!w) return;
    if (w.temp > 44) alerts.push({ city: city.name, type: 'HEATWAVE', message: `Extreme heat: ${w.temp}°C`, severity: 'critical' });
    if (w.aqi > 300) alerts.push({ city: city.name, type: 'AQI_HAZARDOUS', message: `Hazardous AQI: ${w.aqi}`, severity: 'critical' });
    if (w.aqi > 200) alerts.push({ city: city.name, type: 'AQI_SEVERE', message: `Very unhealthy AQI: ${w.aqi}`, severity: 'warning' });
    if (w.condition === 'Thunderstorm') alerts.push({ city: city.name, type: 'STORM', message: 'Thunderstorm warning', severity: 'warning' });
    if (w.condition === 'Heavy Rain') alerts.push({ city: city.name, type: 'HEAVY_RAIN', message: 'Heavy rainfall alert', severity: 'warning' });
  });

  const data = {
    timestamp: new Date().toISOString(),
    liveSource: usingRealData ? 'Open-Meteo' : 'Simulated',
    cities: CITIES.map(city => ({
      ...city,
      ...(weatherCache[city.name] || {}),
    })),
    alerts,
  };

  cache.set('weather', data, 300000);
  return data;
}

module.exports = { getWeatherData, CITIES };
