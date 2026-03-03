import { motion } from 'framer-motion';
import { Cloud, Thermometer, Wind, Eye, Droplets, AlertTriangle } from 'lucide-react';

function AqiBadge({ aqi, category }) {
  let color = 'text-pulse-green bg-pulse-green/10';
  if (aqi > 300) color = 'text-pulse-red bg-pulse-red/20 animate-blink-live';
  else if (aqi > 200) color = 'text-pulse-red bg-pulse-red/10';
  else if (aqi > 150) color = 'text-pulse-orange bg-pulse-orange/10';
  else if (aqi > 100) color = 'text-pulse-yellow bg-pulse-yellow/10';

  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${color}`}>
      AQI {aqi}
    </span>
  );
}

export default function WeatherPanel({ data }) {
  if (!data) return <WeatherSkeleton />;

  const { cities, alerts } = data;

  return (
    <div className="glass-panel rounded-lg p-3 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-pulse-accent drop-shadow-[0_0_4px_rgba(6,182,212,.4)]" />
          <h2 className="text-sm font-bold tracking-wider text-pulse-accent uppercase text-glow-cyan">Weather & AQI</h2>
        </div>
        {alerts?.length > 0 && (
          <motion.span
            className="text-[10px] px-2 py-0.5 rounded bg-pulse-red/20 text-pulse-red font-mono animate-blink-live breathe-red"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            {alerts.length} ALERTS
          </motion.span>
        )}
      </div>

      {/* Alerts */}
      {alerts?.length > 0 && (
        <div className="mb-2 space-y-1">
          {alerts.slice(0, 3).map((alert, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-1.5 p-1.5 rounded bg-pulse-red/5 border border-pulse-red/20"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <AlertTriangle className="w-3 h-3 text-pulse-red flex-shrink-0 animate-pulse-glow" />
              <span className="text-[9px] text-pulse-red font-mono">{alert.city}: {alert.message}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* City Grid */}
      <div className="flex-1 overflow-y-auto space-y-1.5">
        {cities?.map((city, i) => (
          <motion.div
            key={city.name}
            className="p-2 rounded bg-pulse-surface-2/50 border border-pulse-border/20 hover:border-pulse-accent/15 transition-all hover:bg-pulse-surface-2/70"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            whileHover={{ x: 2, transition: { duration: 0.1 } }}
          >
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="text-xs font-mono font-bold text-pulse-text">{city.name}</span>
                <span className="text-[9px] text-pulse-text-muted ml-1">{city.state}</span>
              </div>
              <AqiBadge aqi={city.aqi} category={city.aqiCategory} />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-pulse-orange" />
                <span className="text-[10px] font-mono text-pulse-text">{city.temp}°C</span>
              </div>
              <div className="flex items-center gap-1">
                <Droplets className="w-3 h-3 text-pulse-accent" />
                <span className="text-[10px] font-mono text-pulse-text-dim">{city.humidity}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Wind className="w-3 h-3 text-pulse-text-muted" />
                <span className="text-[10px] font-mono text-pulse-text-dim">{city.windSpeed} km/h</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-pulse-text-muted" />
                <span className="text-[10px] font-mono text-pulse-text-dim">{city.visibility} km</span>
              </div>
            </div>
            <div className="text-[9px] text-pulse-text-muted font-mono mt-1">{city.condition}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function WeatherSkeleton() {
  return (
    <div className="glass-panel rounded-lg p-3 h-full">
      <div className="h-4 skeleton-shimmer rounded w-32 mb-3" />
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-16 skeleton-shimmer rounded mb-1.5" />
      ))}
    </div>
  );
}
