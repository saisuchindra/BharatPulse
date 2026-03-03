/**
 * Infrastructure & Traffic Service
 * Tracks ports, airports, traffic, power grid, internet outages.
 */
const cache = require('../utils/cache');

const PORTS = [
  { name: 'Jawaharlal Nehru Port (JNPT)', city: 'Mumbai', lat: 18.95, lon: 72.95, type: 'port' },
  { name: 'Mundra Port', city: 'Kutch', lat: 22.75, lon: 69.72, type: 'port' },
  { name: 'Chennai Port', city: 'Chennai', lat: 13.1, lon: 80.3, type: 'port' },
  { name: 'Visakhapatnam Port', city: 'Vizag', lat: 17.69, lon: 83.29, type: 'port' },
  { name: 'Kandla Port', city: 'Kandla', lat: 23.03, lon: 70.22, type: 'port' },
];

const AIRPORTS = [
  { name: 'Indira Gandhi Intl', city: 'Delhi', code: 'DEL', lat: 28.5562, lon: 77.1, type: 'airport' },
  { name: 'Chhatrapati Shivaji Intl', city: 'Mumbai', code: 'BOM', lat: 19.0896, lon: 72.8656, type: 'airport' },
  { name: 'Kempegowda Intl', city: 'Bangalore', code: 'BLR', lat: 13.1986, lon: 77.7066, type: 'airport' },
  { name: 'Rajiv Gandhi Intl', city: 'Hyderabad', code: 'HYD', lat: 17.2403, lon: 78.4294, type: 'airport' },
  { name: 'Chennai Intl', city: 'Chennai', code: 'MAA', lat: 12.994, lon: 80.1709, type: 'airport' },
  { name: 'Netaji Subhas Chandra Bose Intl', city: 'Kolkata', code: 'CCU', lat: 22.6547, lon: 88.4467, type: 'airport' },
];

const TRAFFIC_CORRIDORS = [
  'NH-48 (Delhi-Jaipur)', 'NH-44 (Delhi-Agra)', 'Mumbai-Pune Expressway',
  'Outer Ring Road (Bangalore)', 'Eastern Express Highway (Mumbai)',
  'NH-75 (Bangalore-Mangalore)', 'Chennai-Bangalore Highway',
];

const STATUSES = ['Normal', 'Congested', 'Delayed', 'Disrupted', 'Closed'];
const POWER_STATES = ['UP', 'Bihar', 'Maharashtra', 'Tamil Nadu', 'Punjab', 'Odisha'];

let infraState = {
  ports: {},
  airports: {},
  traffic: [],
  powerGrid: [],
  internet: [],
};

function initInfra() {
  PORTS.forEach(p => {
    infraState.ports[p.name] = {
      ...p,
      congestionLevel: Math.random() < 0.3 ? 'High' : Math.random() < 0.6 ? 'Moderate' : 'Low',
      waitTimeHours: Math.floor(Math.random() * 48),
      vesselCount: Math.floor(Math.random() * 30 + 5),
      status: 'Operational',
    };
  });

  AIRPORTS.forEach(a => {
    infraState.airports[a.code] = {
      ...a,
      delayMinutes: Math.floor(Math.random() * 60),
      status: Math.random() < 0.15 ? 'Delays Reported' : 'On Schedule',
      flightsActive: Math.floor(Math.random() * 50 + 10),
      visibility: Math.random() < 0.1 ? 'Poor' : 'Good',
    };
  });

  infraState.traffic = TRAFFIC_CORRIDORS.map(corridor => ({
    corridor,
    status: STATUSES[Math.floor(Math.random() * 3)],
    avgSpeedKmh: Math.floor(Math.random() * 60 + 20),
    incidents: Math.floor(Math.random() * 3),
  }));

  infraState.powerGrid = POWER_STATES.map(state => ({
    state,
    status: Math.random() < 0.1 ? 'Outage Reported' : 'Normal',
    demandMW: Math.floor(Math.random() * 5000 + 1000),
    supplyMW: Math.floor(Math.random() * 5000 + 1000),
    deficitPercent: parseFloat((Math.random() * 5).toFixed(1)),
  }));

  infraState.internet = [
    { provider: 'Jio', status: 'Operational', latencyMs: Math.floor(Math.random() * 30 + 10) },
    { provider: 'Airtel', status: 'Operational', latencyMs: Math.floor(Math.random() * 30 + 10) },
    { provider: 'BSNL', status: Math.random() < 0.15 ? 'Partial Outage' : 'Operational', latencyMs: Math.floor(Math.random() * 50 + 20) },
    { provider: 'Vi', status: 'Operational', latencyMs: Math.floor(Math.random() * 40 + 15) },
  ];
}

initInfra();

function tickInfra() {
  // Update ports
  Object.values(infraState.ports).forEach(p => {
    if (Math.random() < 0.1) {
      p.vesselCount = Math.max(1, p.vesselCount + Math.floor(Math.random() * 5 - 2));
      p.congestionLevel = p.vesselCount > 25 ? 'High' : p.vesselCount > 15 ? 'Moderate' : 'Low';
    }
  });

  // Update airports
  Object.values(infraState.airports).forEach(a => {
    if (Math.random() < 0.15) {
      a.delayMinutes = Math.max(0, a.delayMinutes + Math.floor(Math.random() * 20 - 10));
      a.status = a.delayMinutes > 30 ? 'Delays Reported' : 'On Schedule';
    }
  });

  // Update traffic
  infraState.traffic.forEach(t => {
    if (Math.random() < 0.1) {
      t.status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
      t.avgSpeedKmh = Math.max(5, t.avgSpeedKmh + Math.floor(Math.random() * 20 - 10));
    }
  });

  // Update power grid
  infraState.powerGrid.forEach(p => {
    if (Math.random() < 0.05) {
      p.status = Math.random() < 0.2 ? 'Outage Reported' : 'Normal';
      p.deficitPercent = parseFloat((Math.random() * 8).toFixed(1));
    }
  });
}

function getInfraData() {
  tickInfra();

  const disruptions = [];
  Object.values(infraState.ports).forEach(p => {
    if (p.congestionLevel === 'High') disruptions.push({ type: 'PORT_CONGESTION', location: p.name, severity: 'warning' });
  });
  Object.values(infraState.airports).forEach(a => {
    if (a.delayMinutes > 45) disruptions.push({ type: 'AIRPORT_DELAY', location: `${a.code} - ${a.city}`, severity: 'warning', delay: a.delayMinutes });
  });
  infraState.traffic.forEach(t => {
    if (t.status === 'Disrupted' || t.status === 'Closed') disruptions.push({ type: 'TRAFFIC', location: t.corridor, severity: t.status === 'Closed' ? 'critical' : 'warning' });
  });
  infraState.powerGrid.forEach(p => {
    if (p.status === 'Outage Reported') disruptions.push({ type: 'POWER_OUTAGE', location: p.state, severity: 'critical' });
  });

  const data = {
    timestamp: new Date().toISOString(),
    ports: Object.values(infraState.ports),
    airports: Object.values(infraState.airports),
    traffic: infraState.traffic,
    powerGrid: infraState.powerGrid,
    internet: infraState.internet,
    disruptions,
    totalDisruptions: disruptions.length,
  };

  cache.set('infra', data, 60000);
  return data;
}

module.exports = { getInfraData };
