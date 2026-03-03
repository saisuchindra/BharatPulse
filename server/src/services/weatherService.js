/**
 * Weather & AQI Service
 * Provides weather data and air quality index for major Indian cities.
 */
const cache = require('../utils/cache');

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

const WEATHER_CONDITIONS = [
  'Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain',
  'Thunderstorm', 'Haze', 'Fog', 'Sunny', 'Overcast',
];

function randomInRange(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1));
}

let weatherState = {};

function initWeather() {
  CITIES.forEach(city => {
    const baseTemp = city.lat < 15 ? 32 : city.lat < 20 ? 30 : city.lat < 25 ? 28 : 26;
    weatherState[city.name] = {
      temp: baseTemp + randomInRange(-3, 3),
      humidity: randomInRange(40, 85),
      windSpeed: randomInRange(5, 25),
      condition: WEATHER_CONDITIONS[Math.floor(Math.random() * WEATHER_CONDITIONS.length)],
      aqi: Math.floor(Math.random() * 300 + 50),
      aqiCategory: '',
      feelsLike: 0,
      visibility: randomInRange(2, 10),
      uvIndex: randomInRange(3, 11),
    };
    updateDerived(city.name);
  });
}

function updateDerived(name) {
  const w = weatherState[name];
  w.feelsLike = parseFloat((w.temp + (w.humidity > 60 ? 2 : -1)).toFixed(1));
  if (w.aqi <= 50) w.aqiCategory = 'Good';
  else if (w.aqi <= 100) w.aqiCategory = 'Moderate';
  else if (w.aqi <= 150) w.aqiCategory = 'Unhealthy for Sensitive Groups';
  else if (w.aqi <= 200) w.aqiCategory = 'Unhealthy';
  else if (w.aqi <= 300) w.aqiCategory = 'Very Unhealthy';
  else w.aqiCategory = 'Hazardous';
}

initWeather();

function tickWeather() {
  CITIES.forEach(city => {
    const w = weatherState[city.name];
    w.temp = parseFloat((w.temp + randomInRange(-0.5, 0.5)).toFixed(1));
    w.humidity = Math.max(20, Math.min(100, w.humidity + randomInRange(-2, 2)));
    w.windSpeed = Math.max(0, parseFloat((w.windSpeed + randomInRange(-1, 1)).toFixed(1)));
    w.aqi = Math.max(10, Math.min(500, w.aqi + Math.floor(Math.random() * 10 - 5)));
    if (Math.random() < 0.05) {
      w.condition = WEATHER_CONDITIONS[Math.floor(Math.random() * WEATHER_CONDITIONS.length)];
    }
    w.visibility = Math.max(0.5, parseFloat((w.visibility + randomInRange(-0.3, 0.3)).toFixed(1)));
    updateDerived(city.name);
  });
}

function getWeatherData() {
  tickWeather();

  const alerts = [];
  CITIES.forEach(city => {
    const w = weatherState[city.name];
    if (w.temp > 44) alerts.push({ city: city.name, type: 'HEATWAVE', message: `Extreme heat: ${w.temp}°C`, severity: 'critical' });
    if (w.aqi > 300) alerts.push({ city: city.name, type: 'AQI_HAZARDOUS', message: `Hazardous AQI: ${w.aqi}`, severity: 'critical' });
    if (w.aqi > 200) alerts.push({ city: city.name, type: 'AQI_SEVERE', message: `Very unhealthy AQI: ${w.aqi}`, severity: 'warning' });
    if (w.condition === 'Thunderstorm') alerts.push({ city: city.name, type: 'STORM', message: 'Thunderstorm warning', severity: 'warning' });
    if (w.condition === 'Heavy Rain') alerts.push({ city: city.name, type: 'HEAVY_RAIN', message: 'Heavy rainfall alert', severity: 'warning' });
  });

  const data = {
    timestamp: new Date().toISOString(),
    cities: CITIES.map(city => ({
      ...city,
      ...weatherState[city.name],
    })),
    alerts,
  };

  cache.set('weather', data, 300000);
  return data;
}

module.exports = { getWeatherData, CITIES };
