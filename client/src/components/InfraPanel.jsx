import { motion } from 'framer-motion';
import { Anchor, Plane, Car, Zap, Wifi, AlertTriangle } from 'lucide-react';

const TYPE_ICONS = {
  port: Anchor,
  airport: Plane,
  traffic: Car,
  power: Zap,
  internet: Wifi,
};

export default function InfraPanel({ data }) {
  if (!data) return <InfraSkeleton />;

  const { ports, airports, traffic, powerGrid, internet, disruptions, totalDisruptions } = data;

  return (
    <div className="glass-panel rounded-lg p-3 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-pulse-accent drop-shadow-[0_0_4px_rgba(6,182,212,.4)]" />
          <h2 className="text-sm font-bold tracking-wider text-pulse-accent uppercase text-glow-cyan">Infrastructure</h2>
        </div>
        {totalDisruptions > 0 && (
          <motion.span
            className="text-[10px] px-2 py-0.5 rounded bg-pulse-yellow/20 text-pulse-yellow font-mono breathe-yellow"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            {totalDisruptions} DISRUPTIONS
          </motion.span>
        )}
      </div>

      {/* Disruption Alerts */}
      {disruptions?.length > 0 && (
        <div className="mb-2 space-y-1 max-h-24 overflow-y-auto">
          {disruptions.slice(0, 4).map((d, i) => (
            <motion.div
              key={i}
              className={`flex items-center gap-1.5 p-1 rounded text-[9px] font-mono ${
                d.severity === 'critical' ? 'bg-pulse-red/10 text-pulse-red' : 'bg-pulse-yellow/10 text-pulse-yellow'
              }`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <AlertTriangle className="w-3 h-3 flex-shrink-0 animate-pulse-glow" />
              <span>{d.type}: {d.location}</span>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3">
        {/* Ports */}
        <Section title="PORTS" icon={Anchor} delay={0}>
          {ports?.map((p, i) => (
            <motion.div
              key={p.name}
              className="flex items-center justify-between py-1 border-b border-pulse-border/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03, duration: 0.2 }}
            >
              <span className="text-[10px] font-mono text-pulse-text-dim truncate max-w-[120px]">{p.city}</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-pulse-text-muted">{p.vesselCount} ships</span>
                <CongestionBadge level={p.congestionLevel} />
              </div>
            </motion.div>
          ))}
        </Section>

        {/* Airports */}
        <Section title="AIRPORTS" icon={Plane} delay={0.1}>
          {airports?.map((a, i) => (
            <motion.div
              key={a.code}
              className="flex items-center justify-between py-1 border-b border-pulse-border/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.03, duration: 0.2 }}
            >
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono font-bold text-pulse-text">{a.code}</span>
                <span className="text-[9px] text-pulse-text-muted">{a.city}</span>
              </div>
              <div className="flex items-center gap-2">
                {a.delayMinutes > 0 && (
                  <span className={`text-[9px] font-mono ${a.delayMinutes > 30 ? 'text-pulse-red' : 'text-pulse-yellow'}`}>
                    +{a.delayMinutes}m delay
                  </span>
                )}
                <StatusBadge status={a.status} />
              </div>
            </motion.div>
          ))}
        </Section>

        {/* Power Grid */}
        <Section title="POWER GRID" icon={Zap} delay={0.2}>
          {powerGrid?.map((p, i) => (
            <motion.div
              key={p.state}
              className="flex items-center justify-between py-1 border-b border-pulse-border/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.03, duration: 0.2 }}
            >
              <span className="text-[10px] font-mono text-pulse-text-dim">{p.state}</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-pulse-text-muted">-{p.deficitPercent}%</span>
                <StatusBadge status={p.status} />
              </div>
            </motion.div>
          ))}
        </Section>

        {/* Internet */}
        <Section title="INTERNET" icon={Wifi} delay={0.3}>
          {internet?.map((p, i) => (
            <motion.div
              key={p.provider}
              className="flex items-center justify-between py-1 border-b border-pulse-border/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.03, duration: 0.2 }}
            >
              <span className="text-[10px] font-mono text-pulse-text-dim">{p.provider}</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-pulse-text-muted">{p.latencyMs}ms</span>
                <StatusBadge status={p.status} />
              </div>
            </motion.div>
          ))}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3 text-pulse-text-muted" />
        <span className="text-[9px] font-mono text-pulse-text-muted tracking-wider">{title}</span>
      </div>
      {children}
    </motion.div>
  );
}

function CongestionBadge({ level }) {
  const color = level === 'High' ? 'text-pulse-red bg-pulse-red/10' :
    level === 'Moderate' ? 'text-pulse-yellow bg-pulse-yellow/10' :
    'text-pulse-green bg-pulse-green/10';
  return <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono ${color}`}>{level}</span>;
}

function StatusBadge({ status }) {
  const isNormal = status === 'Normal' || status === 'Operational' || status === 'On Schedule';
  return (
    <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono ${
      isNormal ? 'text-pulse-green bg-pulse-green/10' : 'text-pulse-red bg-pulse-red/10'
    }`}>
      {status}
    </span>
  );
}

function InfraSkeleton() {
  return (
    <div className="glass-panel rounded-lg p-3 h-full">
      <div className="h-4 skeleton-shimmer rounded w-32 mb-3" />
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-8 skeleton-shimmer rounded mb-1" />
      ))}
    </div>
  );
}
