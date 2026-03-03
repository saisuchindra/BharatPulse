import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Shield, Fuel, TrendingDown, DollarSign, Ship, AlertTriangle } from 'lucide-react';

/* ── Animated counter ── */
function Counter({ value, className }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  useEffect(() => {
    if (value == null) return;
    const from = prevRef.current;
    const diff = value - from;
    if (diff === 0) return;
    let step = 0;
    const steps = 20;
    const iv = setInterval(() => {
      step++;
      setDisplay(Math.round(from + (diff * step) / steps));
      if (step >= steps) { clearInterval(iv); setDisplay(value); }
    }, 30);
    prevRef.current = value;
    return () => clearInterval(iv);
  }, [value]);
  return <span className={className}>{display}</span>;
}

function GaugeBar({ label, value, max = 100, icon: Icon, status, delay = 0 }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const color =
    status === 'CRITICAL' ? 'from-pulse-red to-pulse-red/70' :
    status === 'ELEVATED' ? 'from-pulse-yellow to-pulse-yellow/70' :
    'from-pulse-green to-pulse-green/70';
  const breathe =
    status === 'CRITICAL' ? 'breathe-red' :
    status === 'ELEVATED' ? 'breathe-yellow' :
    'breathe-green';
  const textColor =
    status === 'CRITICAL' ? 'text-pulse-red' :
    status === 'ELEVATED' ? 'text-pulse-yellow' :
    'text-pulse-green';

  return (
    <motion.div
      className="space-y-1"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className={`w-3.5 h-3.5 ${textColor}`} />
          <span className="text-[10px] font-mono text-pulse-text-dim uppercase">{label}</span>
        </div>
        <span className={`text-[10px] font-mono font-bold ${textColor}`}>
          {value}
        </span>
      </div>
      <div className={`h-1.5 bg-pulse-surface-2 rounded-full overflow-hidden ${breathe}`}>
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay }}
        />
      </div>
    </motion.div>
  );
}

export default function ImpactEngine({ data }) {
  if (!data) return <ImpactSkeleton />;

  const { stabilityIndex, overallStatus, factors, riskScore } = data;

  const statusColor =
    overallStatus === 'STABLE' ? 'text-pulse-green' :
    overallStatus === 'ELEVATED' ? 'text-pulse-yellow' :
    'text-pulse-red';

  const statusBg =
    overallStatus === 'STABLE' ? 'bg-pulse-green/10 border-pulse-green/30' :
    overallStatus === 'ELEVATED' ? 'bg-pulse-yellow/10 border-pulse-yellow/30' :
    'bg-pulse-red/10 border-pulse-red/30';

  const statusBreathe =
    overallStatus === 'STABLE' ? 'breathe-green' :
    overallStatus === 'ELEVATED' ? 'breathe-yellow' :
    'breathe-red';

  const ringColor =
    overallStatus === 'STABLE' ? '#10b981' :
    overallStatus === 'ELEVATED' ? '#f59e0b' :
    '#ef4444';

  return (
    <div className="glass-panel rounded-lg p-3 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-pulse-accent drop-shadow-[0_0_4px_rgba(6,182,212,.4)]" />
          <h2 className="text-sm font-bold tracking-wider text-pulse-accent uppercase text-glow-cyan">India Impact</h2>
        </div>
        <motion.span
          className={`text-[10px] px-2 py-0.5 rounded font-mono border ${statusBg} ${statusColor} ${statusBreathe}`}
          key={overallStatus}
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {overallStatus}
        </motion.span>
      </div>

      {/* Stability Index Ring — dual ring */}
      <div className="flex justify-center mb-3">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full" viewBox="0 0 120 120">
            {/* outer track */}
            <circle cx="60" cy="60" r="52" fill="none" stroke="#1e293b" strokeWidth="6" />
            {/* animated outer ring */}
            <motion.circle
              cx="60" cy="60" r="52" fill="none"
              stroke={ringColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 52}
              initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - stabilityIndex / 100) }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              style={{ filter: `drop-shadow(0 0 8px ${ringColor}50)`, transform: 'rotate(-90deg)', transformOrigin: '60px 60px' }}
            />
            {/* inner decorative ring — spins slowly */}
            <circle cx="60" cy="60" r="42" fill="none" stroke={ringColor} strokeWidth="1" opacity="0.15"
              strokeDasharray="6 8">
              <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="30s" repeatCount="indefinite" />
            </circle>
            {/* pulsing center glow */}
            <circle cx="60" cy="60" r="30" fill={ringColor} opacity="0.04">
              <animate attributeName="r" values="26;32;26" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.03;0.08;0.03" dur="3s" repeatCount="indefinite" />
            </circle>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Counter value={stabilityIndex} className={`text-2xl font-bold font-mono ${statusColor}`} />
            <span className="text-[8px] text-pulse-text-muted font-mono tracking-wider">STABILITY</span>
          </div>
        </div>
      </div>

      {/* Factor Gauges */}
      <div className="space-y-2.5 flex-1">
        <GaugeBar label="Oil Impact" value={factors.oil.score} icon={Fuel} status={factors.oil.status} delay={0.1} />
        <GaugeBar label="Market Volatility" value={factors.market.score} icon={TrendingDown} status={factors.market.status} delay={0.2} />
        <GaugeBar label="Currency Stress" value={factors.currency.score} icon={DollarSign} status={factors.currency.status} delay={0.3} />
        <GaugeBar label="Geopolitical Risk" value={factors.geopolitical.score} icon={AlertTriangle} status={factors.geopolitical.status} delay={0.4} />
        <GaugeBar label="Trade Disruption" value={factors.trade.score} icon={Ship} status={factors.trade.status} delay={0.5} />
      </div>

      {/* Factor Details */}
      <div className="mt-3 border-t border-pulse-border pt-2 space-y-1">
        {Object.values(factors).map((f, i) => (
          <motion.div
            key={f.name}
            className="flex items-center justify-between text-[9px] font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 + i * 0.05 }}
          >
            <span className="text-pulse-text-muted">{f.name}</span>
            <span className="text-pulse-text-dim">{f.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ImpactSkeleton() {
  return (
    <div className="glass-panel rounded-lg p-3 h-full">
      <div className="h-4 skeleton-shimmer rounded w-24 mb-3" />
      <div className="flex justify-center mb-3">
        <div className="w-28 h-28 rounded-full skeleton-shimmer" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-6 skeleton-shimmer rounded mb-2" />
      ))}
    </div>
  );
}
