/**
 * Shipping & Trade Routes Service
 * Tracks major shipping routes relevant to India.
 */

const SHIPPING_ROUTES = [
  {
    id: 'route-1',
    name: 'Strait of Hormuz',
    description: 'Critical oil transit chokepoint',
    coordinates: [[56.3, 26.6], [56.5, 26.2], [56.8, 26.5]],
    status: 'Active',
    riskLevel: 'ELEVATED',
    vesselTraffic: 'Heavy',
    impactOnIndia: 'Major - 60% of India\'s oil imports transit here',
    lat: 26.5,
    lon: 56.5,
  },
  {
    id: 'route-2',
    name: 'Suez Canal',
    description: 'Europe-Asia trade route',
    coordinates: [[32.3, 30.0], [32.35, 30.5], [32.4, 31.0]],
    status: 'Active',
    riskLevel: 'MODERATE',
    vesselTraffic: 'Moderate',
    impactOnIndia: 'High - Key trade route with Europe',
    lat: 30.5,
    lon: 32.35,
  },
  {
    id: 'route-3',
    name: 'Bab el-Mandeb Strait',
    description: 'Red Sea chokepoint under Houthi threat',
    coordinates: [[43.3, 12.5], [43.4, 12.8], [43.2, 13.0]],
    status: 'Disrupted',
    riskLevel: 'HIGH',
    vesselTraffic: 'Reduced',
    impactOnIndia: 'Significant - Rerouting adds 10-15 days to shipments',
    lat: 12.8,
    lon: 43.4,
  },
  {
    id: 'route-4',
    name: 'Strait of Malacca',
    description: 'Primary route for East Asian trade',
    coordinates: [[100.0, 2.5], [102.0, 1.5], [104.0, 1.3]],
    status: 'Active',
    riskLevel: 'LOW',
    vesselTraffic: 'Heavy',
    impactOnIndia: 'High - Trade with ASEAN and East Asia',
    lat: 2.0,
    lon: 101.5,
  },
  {
    id: 'route-5',
    name: 'Cape of Good Hope',
    description: 'Alternative to Suez Canal for large vessels',
    coordinates: [[18.5, -34.35], [18.0, -34.8], [17.5, -34.4]],
    status: 'Active',
    riskLevel: 'LOW',
    vesselTraffic: 'Increasing',
    impactOnIndia: 'Moderate - Longer route alternative',
    lat: -34.35,
    lon: 18.5,
  },
];

let shippingState = [...SHIPPING_ROUTES];

function tickShipping() {
  shippingState.forEach(route => {
    if (Math.random() < 0.05) {
      const levels = ['LOW', 'MODERATE', 'ELEVATED', 'HIGH'];
      const current = levels.indexOf(route.riskLevel);
      const delta = Math.random() < 0.5 ? 1 : -1;
      const newIdx = Math.max(0, Math.min(levels.length - 1, current + delta));
      route.riskLevel = levels[newIdx];
    }
  });
}

function getShippingData() {
  tickShipping();

  const disrupted = shippingState.filter(r => r.status === 'Disrupted' || r.riskLevel === 'HIGH').length;

  return {
    timestamp: new Date().toISOString(),
    routes: shippingState,
    disruptedCount: disrupted,
    totalRoutes: shippingState.length,
  };
}

module.exports = { getShippingData };
