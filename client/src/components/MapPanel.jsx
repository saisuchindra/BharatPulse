import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, AlertTriangle, Ship, Anchor, Plane, Fuel, Building, Cloud, ZoomIn, ZoomOut, Crosshair,
} from 'lucide-react';
import { useState, useMemo, useCallback, memo } from 'react';
import {
  ComposableMap, Geographies, Geography, Marker, Line, ZoomableGroup,
} from 'react-simple-maps';

/* ── Free world topojson from Natural Earth (110m — lightweight) ── */
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

/* ── Layer config ── */
const LAYER_CONFIG = {
  conflict: { label: 'Conflicts', icon: AlertTriangle, color: '#ef4444' },
  shipping: { label: 'Shipping', icon: Ship, color: '#06b6d4' },
  weather:  { label: 'Weather',  icon: Cloud, color: '#f59e0b' },
  port:     { label: 'Ports',    icon: Anchor, color: '#8b5cf6' },
  airport:  { label: 'Airports', icon: Plane, color: '#3b82f6' },
  economic: { label: 'Economic', icon: Building, color: '#10b981' },
  oil:      { label: 'Oil Zones', icon: Fuel, color: '#f97316' },
};

const SEVERITY_COLORS = {
  CRITICAL: '#dc2626',
  HIGH:     '#ef4444',
  ELEVATED: '#f59e0b',
  WARNING:  '#f59e0b',
  MODERATE: '#06b6d4',
  MEDIUM:   '#06b6d4',
  LOW:      '#10b981',
  NORMAL:   '#10b981',
  INFO:     '#64748b',
};

/* ── Preset views ── */
const VIEWS = {
  world:  { coordinates: [40, 15], zoom: 1 },
  india:  { coordinates: [79, 22], zoom: 3.5 },
  middle: { coordinates: [48, 28], zoom: 3 },
  europe: { coordinates: [30, 50], zoom: 3 },
};

/* ── Marker size helper ── */
function markerRadius(severity, zoom) {
  const base = severity === 'CRITICAL' || severity === 'HIGH' ? 5 : 3.5;
  return Math.max(2, base / Math.sqrt(zoom));
}

/* ── Memoised geography layer ── */
const WorldGeographies = memo(function WorldGeographies() {
  return (
    <Geographies geography={GEO_URL}>
      {({ geographies }) =>
        geographies.map((geo) => {
          const name = geo.properties?.name || '';
          const isIndia = name === 'India';
          return (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill={isIndia ? '#0e2340' : '#0d1520'}
              stroke={isIndia ? '#06b6d4' : '#1e3a5f'}
              strokeWidth={isIndia ? 0.8 : 0.3}
              style={{
                default: { outline: 'none' },
                hover:   { outline: 'none', fill: isIndia ? '#133058' : '#152035' },
                pressed: { outline: 'none' },
              }}
            />
          );
        })
      }
    </Geographies>
  );
});

export default function MapPanel({ data }) {
  const [activeLayers, setActiveLayers] = useState(
    new Set(['conflict', 'shipping', 'oil', 'port', 'airport', 'economic']),
  );
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [position, setPosition] = useState(VIEWS.india);

  const filteredMarkers = useMemo(() => {
    if (!data?.markers) return [];
    return data.markers.filter((m) => activeLayers.has(m.type));
  }, [data, activeLayers]);

  /* ── Shipping lines (pairs of consecutive shipping markers) ── */
  const shippingLines = useMemo(() => {
    if (!activeLayers.has('shipping')) return [];
    const pts = filteredMarkers.filter((m) => m.type === 'shipping');
    const lines = [];
    for (let i = 1; i < pts.length; i++) {
      lines.push({ from: [pts[i - 1].lon, pts[i - 1].lat], to: [pts[i].lon, pts[i].lat], id: `sl-${i}` });
    }
    return lines;
  }, [filteredMarkers, activeLayers]);

  const toggleLayer = useCallback((layer) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  }, []);

  const handleZoomIn  = () => setPosition((p) => ({ ...p, zoom: Math.min(p.zoom * 1.5, 12) }));
  const handleZoomOut = () => setPosition((p) => ({ ...p, zoom: Math.max(p.zoom / 1.5, 1) }));
  const handleMoveEnd = (pos) => setPosition(pos);
  const goTo = (view) => setPosition(VIEWS[view]);

  if (!data) return <MapSkeleton />;

  return (
    <div className="glass-panel rounded-lg p-3 h-full flex flex-col">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-pulse-accent drop-shadow-[0_0_4px_rgba(6,182,212,.4)]" />
          <h2 className="text-sm font-bold tracking-wider text-pulse-accent uppercase text-glow-cyan">
            Strategic Intelligence Map
          </h2>
        </div>
        <span className="text-[10px] text-pulse-text-muted font-mono">
          {filteredMarkers.length} active markers
        </span>
      </div>

      {/* ── Layer Toggles ── */}
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

      {/* ── Map ── */}
      <div className="flex-1 relative bg-[#060a12] rounded overflow-hidden border border-pulse-border/30 min-h-[300px]">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 150, center: [0, 20] }}
          style={{ width: '100%', height: '100%', background: '#060a12' }}
        >
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            onMoveEnd={handleMoveEnd}
            minZoom={1}
            maxZoom={12}
            translateExtent={[[-200, -200], [1200, 800]]}
          >
            {/* Country polygons */}
            <WorldGeographies />

            {/* Shipping route lines */}
            {shippingLines.map((line) => (
              <Line
                key={line.id}
                from={line.from}
                to={line.to}
                stroke="#06b6d4"
                strokeWidth={1 / Math.sqrt(position.zoom)}
                strokeLinecap="round"
                strokeDasharray="6 4"
                strokeOpacity={0.45}
              />
            ))}

            {/* Markers */}
            {filteredMarkers.map((m) => {
              const color = SEVERITY_COLORS[m.severity] || '#64748b';
              const layerColor = LAYER_CONFIG[m.type]?.color || '#64748b';
              const r = markerRadius(m.severity, position.zoom);
              const isCritical = m.severity === 'CRITICAL' || m.severity === 'HIGH';

              return (
                <Marker key={m.id} coordinates={[m.lon, m.lat]}>
                  <g onClick={() => setSelectedMarker(m)} className="cursor-pointer">
                    {/* Pulse ring for critical */}
                    {isCritical && (
                      <circle r={r * 2.8} fill="none" stroke={color} strokeWidth={0.6 / Math.sqrt(position.zoom)}>
                        <animate attributeName="r" from={r * 1.2} to={r * 3.5} dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    {/* Outer ring */}
                    <circle r={r} fill={color} stroke={layerColor} strokeWidth={0.5 / Math.sqrt(position.zoom)} opacity="0.9">
                      <animate attributeName="r" values={`${r * 0.85};${r * 1.15};${r * 0.85}`} dur="3s" repeatCount="indefinite" />
                    </circle>
                    {/* Inner dot */}
                    <circle r={r * 0.35} fill="#fff" opacity="0.75" />
                    {/* Label (visible when zoomed in) */}
                    {position.zoom >= 2 && (
                      <text
                        x={r + 3 / Math.sqrt(position.zoom)}
                        y={1.5}
                        fill="#94a3b8"
                        fontSize={`${Math.max(5, 8 / Math.sqrt(position.zoom))}px`}
                        fontFamily="monospace"
                        style={{ textShadow: '0 0 4px #060a12', pointerEvents: 'none' }}
                      >
                        {m.name?.length > 22 ? m.name.substring(0, 22) + '…' : m.name}
                      </text>
                    )}
                  </g>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>

        {/* ── Zoom Controls ── */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <button onClick={handleZoomIn}
            className="w-7 h-7 flex items-center justify-center rounded bg-pulse-surface/80 border border-pulse-border/40 text-pulse-text-muted hover:text-pulse-accent hover:border-pulse-accent/40 backdrop-blur-sm transition-colors"
            title="Zoom in">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleZoomOut}
            className="w-7 h-7 flex items-center justify-center rounded bg-pulse-surface/80 border border-pulse-border/40 text-pulse-text-muted hover:text-pulse-accent hover:border-pulse-accent/40 backdrop-blur-sm transition-colors"
            title="Zoom out">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Preset View Buttons ── */}
        <div className="absolute top-2 left-11 flex gap-1">
          {[
            { key: 'world',  label: '🌍 World' },
            { key: 'india',  label: '🇮🇳 India' },
            { key: 'middle', label: '🛢️ Middle East' },
            { key: 'europe', label: '🇪🇺 Europe' },
          ].map((v) => (
            <button
              key={v.key}
              onClick={() => goTo(v.key)}
              className="text-[9px] font-mono px-2 py-1 rounded bg-pulse-surface/80 border border-pulse-border/40 text-pulse-text-muted hover:text-pulse-accent hover:border-pulse-accent/40 backdrop-blur-sm transition-colors whitespace-nowrap"
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* ── Marker Detail Popup ── */}
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
                      color: SEVERITY_COLORS[selectedMarker.severity],
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
                      <div key={key}>
                        <span className="text-pulse-accent/60">{key}:</span> {String(val)}
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMarker(null)}
                  className="text-pulse-text-muted hover:text-pulse-text text-xs ml-2 p-1 hover:bg-pulse-surface-2 rounded"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Legend ── */}
        <div className="absolute top-2 right-2 text-[9px] font-mono space-y-1 bg-pulse-bg/80 backdrop-blur-sm rounded p-2 border border-pulse-border/30">
          <div className="text-pulse-accent/60 text-[8px] mb-1 tracking-wider">THREAT LEVEL</div>
          {['CRITICAL', 'HIGH', 'ELEVATED', 'MODERATE', 'LOW'].map((level) => (
            <div key={level} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: SEVERITY_COLORS[level] }} />
              <span className="text-pulse-text-dim">{level}</span>
            </div>
          ))}
        </div>

        {/* ── Zoom indicator ── */}
        <div className="absolute bottom-2 right-2 text-[8px] font-mono text-pulse-text-muted/50 flex items-center gap-1">
          <Crosshair className="w-2.5 h-2.5" />
          {position.coordinates[0].toFixed(1)}°E, {position.coordinates[1].toFixed(1)}°N · {position.zoom.toFixed(1)}×
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
