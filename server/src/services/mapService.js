/**
 * Map Data Aggregation Service
 * Combines all geospatial data for the global map module.
 */
const { getConflictData } = require('./conflictService');
const { getShippingData } = require('./shippingService');
const { getWeatherData } = require('./weatherService');
const { getInfraData } = require('./infraService');

const ECONOMIC_HUBS = [
  { name: 'Mumbai Financial District', lat: 18.93, lon: 72.83, type: 'economic', category: 'Financial Hub' },
  { name: 'Bangalore Tech Corridor', lat: 12.97, lon: 77.59, type: 'economic', category: 'IT Hub' },
  { name: 'Hyderabad HITEC City', lat: 17.44, lon: 78.38, type: 'economic', category: 'IT Hub' },
  { name: 'Gujarat GIFT City', lat: 23.15, lon: 72.68, type: 'economic', category: 'Financial Hub' },
  { name: 'Chennai Industrial Zone', lat: 13.0, lon: 80.22, type: 'economic', category: 'Manufacturing Hub' },
  { name: 'Delhi NCR Corridor', lat: 28.57, lon: 77.32, type: 'economic', category: 'Business Hub' },
  { name: 'Pune IT Park', lat: 18.56, lon: 73.92, type: 'economic', category: 'IT Hub' },
];

const OIL_ZONES = [
  { name: 'Persian Gulf', lat: 27.0, lon: 51.0, type: 'oil', production: 'Major', status: 'Active' },
  { name: 'Bombay High', lat: 19.35, lon: 71.37, type: 'oil', production: 'Domestic', status: 'Active' },
  { name: 'Krishna-Godavari Basin', lat: 16.0, lon: 82.0, type: 'oil', production: 'Domestic', status: 'Active' },
  { name: 'Assam Oil Fields', lat: 26.5, lon: 94.0, type: 'oil', production: 'Domestic', status: 'Active' },
  { name: 'Saudi Arabia', lat: 24.0, lon: 45.0, type: 'oil', production: 'Major', status: 'Active' },
  { name: 'Iraq', lat: 33.0, lon: 44.0, type: 'oil', production: 'Major', status: 'Active' },
  { name: 'UAE', lat: 24.5, lon: 54.5, type: 'oil', production: 'Major', status: 'Active' },
  { name: 'Russia Urals', lat: 55.0, lon: 60.0, type: 'oil', production: 'Major', status: 'Active' },
];

function getMapData() {
  const conflicts = getConflictData();
  const shipping = getShippingData();
  const weather = getWeatherData();
  const infra = getInfraData();

  const markers = [];

  // Conflict markers
  conflicts.conflicts.forEach(c => {
    markers.push({
      id: c.id,
      type: 'conflict',
      lat: c.lat,
      lon: c.lon,
      name: c.name,
      severity: c.severity,
      details: { region: c.region, status: c.status, escalationLevel: c.escalationLevel, impactOnIndia: c.impactOnIndia },
    });
  });

  // Shipping route markers
  shipping.routes.forEach(r => {
    markers.push({
      id: r.id,
      type: 'shipping',
      lat: r.lat,
      lon: r.lon,
      name: r.name,
      severity: r.riskLevel,
      details: { status: r.status, vesselTraffic: r.vesselTraffic, impactOnIndia: r.impactOnIndia },
    });
  });

  // Weather alert markers
  weather.alerts.forEach((a, i) => {
    const city = weather.cities.find(c => c.name === a.city);
    if (city) {
      markers.push({
        id: `weather-alert-${i}`,
        type: 'weather',
        lat: city.lat,
        lon: city.lon,
        name: `${a.city} - ${a.type}`,
        severity: a.severity === 'critical' ? 'CRITICAL' : 'WARNING',
        details: { message: a.message, type: a.type },
      });
    }
  });

  // Infrastructure markers
  infra.ports.forEach(p => {
    markers.push({
      id: `port-${p.name}`,
      type: 'port',
      lat: p.lat,
      lon: p.lon,
      name: p.name,
      severity: p.congestionLevel === 'High' ? 'HIGH' : 'LOW',
      details: { congestion: p.congestionLevel, vessels: p.vesselCount, waitTime: p.waitTimeHours },
    });
  });

  infra.airports.forEach(a => {
    markers.push({
      id: `airport-${a.code}`,
      type: 'airport',
      lat: a.lat,
      lon: a.lon,
      name: `${a.code} - ${a.city}`,
      severity: a.delayMinutes > 30 ? 'WARNING' : 'LOW',
      details: { status: a.status, delay: a.delayMinutes, flights: a.flightsActive },
    });
  });

  // Economic hubs
  ECONOMIC_HUBS.forEach(e => {
    markers.push({
      id: `eco-${e.name}`,
      type: 'economic',
      lat: e.lat,
      lon: e.lon,
      name: e.name,
      severity: 'INFO',
      details: { category: e.category },
    });
  });

  // Oil zones
  OIL_ZONES.forEach(o => {
    markers.push({
      id: `oil-${o.name}`,
      type: 'oil',
      lat: o.lat,
      lon: o.lon,
      name: o.name,
      severity: 'INFO',
      details: { production: o.production, status: o.status },
    });
  });

  return {
    timestamp: new Date().toISOString(),
    markers,
    layers: ['conflict', 'shipping', 'weather', 'port', 'airport', 'economic', 'oil'],
  };
}

module.exports = { getMapData };
