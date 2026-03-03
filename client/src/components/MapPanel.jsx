import { motion, AnimatePresence } from 'framer-motion';
import { Globe, AlertTriangle, Ship, Anchor, Plane, Fuel, Building, Cloud } from 'lucide-react';
import { useState, useMemo } from 'react';

/* ── Region-focused projection ────────────────────────────────────────────
   Map is zoomed to South Asia / Indian Ocean region instead of the whole
   world, so India is large and markers are clearly visible.
   Lon range : 40°E  → 120°E  (80°)
   Lat range : -5°S  → 45°N   (50°)
   ViewBox   : 0 0 800 500                                                */
const LON_MIN = 40, LON_MAX = 120, LAT_MIN = -5, LAT_MAX = 45;
const VW = 800, VH = 500;
const project = (lat, lon) => ({
  x: ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * VW,
  y: ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * VH,
});

/* Simplified India border outline (real lat/lon → projected) */
const INDIA_POINTS = [
  [35.5,74.3],[34.0,77.5],[32.0,77.0],[30.5,79.5],[28.5,88.0],[27.0,89.0],
  [28.0,92.0],[27.5,96.5],[28.2,97.3],[26.0,95.0],[24.5,94.5],[22.0,93.5],
  [21.5,92.5],[22.3,90.5],[21.5,88.8],[22.0,87.5],[19.8,86.0],[17.5,83.2],
  [15.5,80.2],[13.5,80.3],[11.0,79.8],[8.1,77.5],[8.5,77.0],[10.0,76.3],
  [11.5,75.7],[12.8,74.8],[14.5,74.0],[15.5,73.8],[17.0,73.2],[19.0,72.8],
  [21.0,72.5],[22.5,69.5],[23.5,68.5],[24.5,68.7],[25.5,70.5],[26.5,70.0],
  [28.5,68.2],[30.5,71.0],[32.0,74.8],[34.5,74.0],
];
const INDIA_PATH = 'M' + INDIA_POINTS.map(([lat,lon]) => {
  const p = project(lat, lon); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
}).join(' L') + ' Z';

/* Simplified Sri Lanka */
const SRI_LANKA = [
  [9.8,80.0],[8.0,81.5],[6.0,80.8],[6.5,79.8],[7.8,79.7],
];
const SRI_LANKA_PATH = 'M' + SRI_LANKA.map(([lat,lon]) => {
  const p = project(lat, lon); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
}).join(' L') + ' Z';

/* Simplified Pakistan */
const PAKISTAN = [
  [35.5,74.3],[36.5,71.5],[37.0,71.5],[35.5,69.5],[33.5,69.5],
  [31.0,66.5],[29.0,66.5],[25.5,62.0],[24.5,67.0],[24.5,68.7],
  [23.5,68.5],[28.5,68.2],[30.5,71.0],[32.0,74.8],[34.5,74.0],
];
const PAKISTAN_PATH = 'M' + PAKISTAN.map(([lat,lon]) => {
  const p = project(lat, lon); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
}).join(' L') + ' Z';

/* Region labels */
const REGION_LABELS = [
  { lat: 23, lon: 79, label: 'INDIA' },
  { lat: 30, lon: 66, label: 'PAKISTAN' },
  { lat: 28, lon: 84, label: 'NEPAL' },
  { lat: 7.5, lon: 80.5, label: 'SRI LANKA' },
  { lat: 15, lon: 100, label: 'MYANMAR' },
  { lat: 35, lon: 53, label: 'IRAN' },
  { lat: 23, lon: 54, label: 'OMAN' },
  { lat: 15, lon: 50, label: 'YEMEN' },
  { lat: 15, lon: 65, label: 'ARABIAN SEA' },
  { lat: 5, lon: 88, label: 'BAY OF BENGAL' },
  { lat: -2, lon: 72, label: 'INDIAN OCEAN' },
];

const LAYER_CONFIG = {
  conflict: { label: 'Conflicts', icon: AlertTriangle, color: '#ef4444' },
  shipping: { label: 'Shipping', icon: Ship, color: '#06b6d4' },
  weather: { label: 'Weather', icon: Cloud, color: '#f59e0b' },
  port: { label: 'Ports', icon: Anchor, color: '#8b5cf6' },
  airport: { label: 'Airports', icon: Plane, color: '#3b82f6' },
  economic: { label: 'Economic', icon: Building, color: '#10b981' },
  oil: { label: 'Oil Zones', icon: Fuel, color: '#f97316' },
};

const SEVERITY_COLORS = {
  CRITICAL: '#dc2626',
  HIGH: '#ef4444',
  ELEVATED: '#f59e0b',
  WARNING: '#f59e0b',
  MODERATE: '#06b6d4',
  MEDIUM: '#06b6d4',
  LOW: '#10b981',
  NORMAL: '#10b981',
  INFO: '#64748b',
};

export default function MapPanel({ data }) {
  const [activeLayers, setActiveLayers] = useState(new Set(['conflict', 'shipping', 'oil', 'port', 'airport', 'economic']));
  const [selectedMarker, setSelectedMarker] = useState(null);

  const filteredMarkers = useMemo(() => {
    if (!data?.markers) return [];
    return data.markers.filter(m => activeLayers.has(m.type));
  }, [data, activeLayers]);

  const toggleLayer = (layer) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  };

  /* Centre of India for radar sweep */
  const indiaCenter = project(22.5, 79);

  if (!data) return <MapSkeleton />;

  return (
    <div className="glass-panel rounded-lg p-3 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-pulse-accent drop-shadow-[0_0_4px_rgba(6,182,212,.4)]" />
          <h2 className="text-sm font-bold tracking-wider text-pulse-accent uppercase text-glow-cyan">Strategic Intelligence Map</h2>
        </div>
        <span className="text-[10px] text-pulse-text-muted font-mono">
          {filteredMarkers.length} active markers
        </span>
      </div>

      {/* Layer Toggle */}
      <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
        {Object.entries(LAYER_CONFIG).map(([key, config]) => {
          const Icon = config.icon;
          const active = activeLayers.has(key);
          return (
            <motion.button
              key={key}
              onClick={() => toggleLayer(key)}
              className={`flex items-center gap-1 text-[9px] px-2 py-1 rounded font-mono whitespace-nowrap transition-all ${
                active
                  ? 'bg-pulse-accent/15 text-pulse-accent border border-pulse-accent/30'
                  : 'bg-pulse-surface-2 text-pulse-text-muted border border-transparent hover:text-pulse-text'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-2.5 h-2.5" />
              {config.label}
            </motion.button>
          );
        })}
      </div>

      {/* Map Visualization */}
      <div className="flex-1 relative bg-pulse-bg rounded overflow-hidden border border-pulse-border/30 min-h-[300px]">
        <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="mapGlow" cx="50%" cy="45%" r="40%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#0a0e17" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="indiaGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="4" result="blurred" />
              <feMerge>
                <feMergeNode in="blurred" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <pattern id="scanPattern" width="6" height="6" patternUnits="userSpaceOnUse">
              <rect width="6" height="6" fill="transparent" />
              <line x1="0" y1="6" x2="6" y2="0" stroke="rgba(6,182,212,0.04)" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Background */}
          <rect width={VW} height={VH} fill="#060a12" />
          <rect width={VW} height={VH} fill="url(#scanPattern)" />
          <circle cx={indiaCenter.x} cy={indiaCenter.y} r="220" fill="url(#mapGlow)" />

          {/* Grid lines with coordinate labels */}
          {[0, 5, 10, 15, 20, 25, 30, 35, 40].map(lat => {
            const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * VH;
            return (
              <g key={`lat-${lat}`}>
                <line x1="0" y1={y} x2={VW} y2={y} stroke="#1e293b" strokeWidth="0.4" opacity="0.3" />
                <text x="4" y={y - 2} fill="#334155" fontSize="6" fontFamily="monospace">{lat}°N</text>
              </g>
            );
          })}
          {[45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115].map(lon => {
            const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * VW;
            return (
              <g key={`lon-${lon}`}>
                <line x1={x} y1="0" x2={x} y2={VH} stroke="#1e293b" strokeWidth="0.4" opacity="0.3" />
                <text x={x + 2} y={VH - 4} fill="#334155" fontSize="6" fontFamily="monospace">{lon}°E</text>
              </g>
            );
          })}

          {/* Pakistan outline */}
          <path d={PAKISTAN_PATH} fill="#0d1520" stroke="#1e293b" strokeWidth="0.8" opacity="0.6" />

          {/* India outline — animated dash draw */}
          <path d={INDIA_PATH} fill="#0a1628" stroke="#06b6d4" strokeWidth="1.8" opacity="0.7"
            strokeDasharray="2000" strokeDashoffset="2000" filter="url(#softGlow)">
            <animate attributeName="stroke-dashoffset" from="2000" to="0" dur="2.5s" fill="freeze" />
          </path>
          {/* India fill glow — breathing */}
          <path d={INDIA_PATH} fill="url(#indiaGlow)" stroke="none">
            <animate attributeName="opacity" values="0.3;0.7;0.3" dur="4s" repeatCount="indefinite" />
          </path>

          {/* Sri Lanka */}
          <path d={SRI_LANKA_PATH} fill="#0a1628" stroke="#06b6d4" strokeWidth="0.8" opacity="0.4" />

          {/* Region labels */}
          {REGION_LABELS.map(r => {
            const p = project(r.lat, r.lon);
            const isIndia = r.label === 'INDIA';
            return (
              <text key={r.label} x={p.x} y={p.y} fill={isIndia ? '#06b6d4' : '#334155'}
                fontSize={isIndia ? '14' : '7'} fontFamily="monospace" textAnchor="middle"
                fontWeight={isIndia ? 'bold' : 'normal'}
                opacity={isIndia ? 0.4 : 0.5}
                letterSpacing={isIndia ? '4' : '1'}
              >
                {r.label}
              </text>
            );
          })}

          {/* Shipping route lines — animated dashes */}
          {filteredMarkers
            .filter(m => m.type === 'shipping')
            .map((route, i, arr) => {
              if (i === 0) return null;
              const prev = arr[i - 1];
              const p1 = project(prev.lat, prev.lon);
              const p2 = project(route.lat, route.lon);
              return (
                <line key={`route-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke="#06b6d4" strokeWidth="1" strokeDasharray="8 5" opacity="0.4">
                  <animate attributeName="stroke-dashoffset" from="0" to="-26" dur="2s" repeatCount="indefinite" />
                </line>
              );
            })}

          {/* Markers */}
          {filteredMarkers.map((marker) => {
            const { x, y } = project(marker.lat, marker.lon);
            const color = SEVERITY_COLORS[marker.severity] || '#64748b';
            const layerColor = LAYER_CONFIG[marker.type]?.color || '#64748b';
            const isCritical = marker.severity === 'CRITICAL' || marker.severity === 'HIGH';

            return (
              <g key={marker.id} onClick={() => setSelectedMarker(marker)}
                className="cursor-pointer" style={{ transition: 'transform .15s' }}>
                {/* Pulse rings for critical/high */}
                {isCritical && (
                  <>
                    <circle cx={x} cy={y} r="6" fill="none" stroke={color} strokeWidth="1.5" opacity="0">
                      <animate attributeName="r" from="6" to="22" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={x} cy={y} r="6" fill="none" stroke={color} strokeWidth="0.8" opacity="0">
                      <animate attributeName="r" from="6" to="18" dur="2s" begin="0.6s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.35" to="0" dur="2s" begin="0.6s" repeatCount="indefinite" />
                    </circle>
                  </>
                )}

                {/* Marker dot */}
                <circle cx={x} cy={y} r={isCritical ? '7' : '5'} fill={color}
                  stroke={layerColor} strokeWidth="1.5" filter="url(#glow)" opacity="0.9">
                  <animate attributeName="r" values={isCritical ? '6;8;6' : '4.5;5.5;4.5'} dur="3s" repeatCount="indefinite" />
                </circle>

                {/* Inner dot */}
                <circle cx={x} cy={y} r="2" fill="#fff" opacity="0.7" />

                {/* Label */}
                <text x={x + (isCritical ? 11 : 9)} y={y + 3} fill="#94a3b8" fontSize="8" fontFamily="monospace"
                  style={{ textShadow: '0 0 4px #0a0e17' }}>
                  {marker.name?.length > 20 ? marker.name.substring(0, 20) + '…' : marker.name}
                </text>
              </g>
            );
          })}

          {/* Radar sweep centred on India */}
          <g opacity="0.08">
            <line x1={indiaCenter.x} y1={indiaCenter.y} x2={indiaCenter.x + 120} y2={indiaCenter.y}
              stroke="#06b6d4" strokeWidth="1.5">
              <animateTransform attributeName="transform" type="rotate"
                from={`0 ${indiaCenter.x} ${indiaCenter.y}`} to={`360 ${indiaCenter.x} ${indiaCenter.y}`}
                dur="10s" repeatCount="indefinite" />
            </line>
          </g>
        </svg>

        {/* Marker Detail Popup */}
        <AnimatePresence>
          {selectedMarker && (
            <motion.div
              className="absolute bottom-2 left-2 right-2 p-3 rounded-lg bg-pulse-surface/95 border border-pulse-accent/20 backdrop-blur-xl border-glow-cyan"
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[selectedMarker.severity] }} />
                    <span className="text-xs font-mono font-bold text-pulse-text">{selectedMarker.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono" style={{
                      backgroundColor: `${SEVERITY_COLORS[selectedMarker.severity]}20`,
                      color: SEVERITY_COLORS[selectedMarker.severity]
                    }}>
                      {selectedMarker.severity}
                    </span>
                    <span className="text-[8px] px-1 py-0.5 rounded bg-pulse-surface-2 text-pulse-text-muted font-mono">
                      {selectedMarker.type}
                    </span>
                  </div>
                  <div className="text-[10px] text-pulse-text-muted font-mono space-y-0.5">
                    <div className="text-pulse-text-dim">
                      {selectedMarker.lat?.toFixed(2)}°N, {selectedMarker.lon?.toFixed(2)}°E
                    </div>
                    {Object.entries(selectedMarker.details || {}).map(([key, val]) => (
                      <div key={key}><span className="text-pulse-accent/60">{key}:</span> {String(val)}</div>
                    ))}
                  </div>
                </div>
                <button onClick={() => setSelectedMarker(null)}
                  className="text-pulse-text-muted hover:text-pulse-text text-xs ml-2 p-1 hover:bg-pulse-surface-2 rounded">
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <div className="absolute top-2 right-2 text-[9px] font-mono space-y-1 bg-pulse-bg/80 backdrop-blur-sm rounded p-2 border border-pulse-border/30">
          <div className="text-pulse-accent/60 text-[8px] mb-1 tracking-wider">THREAT LEVEL</div>
          {Object.entries(SEVERITY_COLORS).slice(0, 5).map(([level, color]) => (
            <div key={level} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: color }} />
              <span className="text-pulse-text-dim">{level}</span>
            </div>
          ))}
        </div>

        {/* Coordinates HUD */}
        <div className="absolute bottom-2 right-2 text-[8px] font-mono text-pulse-text-muted/50">
          {LON_MIN}°E–{LON_MAX}°E / {LAT_MIN}°–{LAT_MAX}°N
        </div>
      </div>
    </div>
  );
}

function MapSkeleton() {
  return (
    <div className="glass-panel rounded-lg p-3 h-full">
      <div className="h-4 skeleton-shimmer rounded w-48 mb-3" />
      <div className="flex gap-1 mb-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-5 skeleton-shimmer rounded w-16" />
        ))}
      </div>
      <div className="flex-1 skeleton-shimmer rounded min-h-[300px]" />
    </div>
  );
}
