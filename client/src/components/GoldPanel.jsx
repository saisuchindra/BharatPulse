import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, MessageCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

/* ── Mini sparkline ─────────────────────────────────────────────── */
function Sparkline({ history = [], color = '#eab308', width = 140, height = 40 }) {
  if (history.length < 2) return null;
  const prices = history.map(h => h.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const points = prices.map((p, i) =>
    `${(i / (prices.length - 1)) * width},${height - ((p - min) / range) * (height - 4) - 2}`
  ).join(' ');
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id="gold-spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill="url(#gold-spark-fill)"
      />
    </svg>
  );
}

/* ── Animated number ────────────────────────────────────────────── */
function AnimatedPrice({ value, prefix = '$', decimals = 2 }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const [flash, setFlash] = useState('');

  useEffect(() => {
    if (value === prevRef.current) return;
    setFlash(value > prevRef.current ? 'flash-up' : 'flash-down');
    const timeout = setTimeout(() => setFlash(''), 600);

    // animate number
    const start = prevRef.current;
    const diff = value - start;
    const steps = 12;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setDisplay(start + diff * (step / steps));
      if (step >= steps) clearInterval(interval);
    }, 25);

    prevRef.current = value;
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, [value]);

  return (
    <span className={`tabular-nums transition-colors duration-300 ${flash}`}>
      {prefix}{display?.toFixed(decimals)}
    </span>
  );
}

/* ── Gold coin SVG icon ─────────────────────────────────────────── */
function GoldIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#eab308" opacity="0.15" stroke="#eab308" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="7" fill="none" stroke="#eab308" strokeWidth="0.8" opacity="0.4" />
      <text x="12" y="16" textAnchor="middle" fill="#eab308" fontSize="10" fontWeight="bold" fontFamily="monospace">Au</text>
    </svg>
  );
}

export default function GoldPanel({ data }) {
  if (!data) return <GoldSkeleton />;

  const isUp = data.direction === 'up';
  const accentColor = isUp ? '#22c55e' : '#ef4444';
  const bgAccent = isUp ? 'border-pulse-green/20 bg-pulse-green/5' : 'border-pulse-red/20 bg-pulse-red/5';
  const breatheClass = isUp ? 'breathe-green' : 'breathe-red';

  return (
    <motion.div
      className="glass-panel rounded-lg p-2.5 h-full flex flex-col overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <GoldIcon size={16} />
          <h2 className="text-xs font-bold tracking-wider text-yellow-400 uppercase font-mono"
            style={{ textShadow: '0 0 8px rgba(234,179,8,0.3)' }}>
            GOLD
          </h2>
          <span className={`text-[8px] px-1 py-0.5 rounded font-mono ${
            isUp ? 'bg-pulse-green/15 text-pulse-green' : 'bg-pulse-red/15 text-pulse-red'
          }`}>
            {isUp ? '▲' : '▼'}
          </span>
        </div>
        <span className="text-[8px] text-pulse-text-muted font-mono">XAU</span>
      </div>

      {/* Price row */}
      <div className={`p-2 rounded border ${bgAccent} ${breatheClass} mb-1.5`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold font-mono text-pulse-text leading-tight">
              <AnimatedPrice value={data.usdOz} prefix="$" decimals={2} />
            </div>
            <div className={`text-[9px] font-mono flex items-center gap-0.5 ${isUp ? 'text-pulse-green' : 'text-pulse-red'}`}>
              {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {data.change24h >= 0 ? '+' : ''}{data.change24h?.toFixed(2)} ({data.changePct?.toFixed(3)}%)
            </div>
          </div>
          <div className="text-right">
            <div className="text-[8px] text-pulse-text-muted font-mono">INR/10g</div>
            <div className="text-xs font-bold font-mono text-yellow-400 tabular-nums">
              ₹{data.inr10g?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
        <div className="mt-1.5">
          <Sparkline history={data.history} color={accentColor} width={200} height={28} />
        </div>
      </div>

      {/* Reason — fills remaining space */}
      <AnimatePresence mode="wait">
        <motion.div
          key={data.reason}
          className={`p-2 rounded border flex items-start gap-1.5 flex-1 min-h-0 ${
            isUp ? 'border-pulse-green/20 bg-pulse-green/5' : 'border-pulse-red/20 bg-pulse-red/5'
          }`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
        >
          <MessageCircle className={`w-3 h-3 flex-shrink-0 mt-0.5 ${isUp ? 'text-pulse-green' : 'text-pulse-red'}`} />
          <div className="min-w-0">
            <div className={`text-[8px] font-mono font-bold ${isUp ? 'text-pulse-green' : 'text-pulse-red'}`}>
              {isUp ? '▲ WHY RISING' : '▼ WHY FALLING'}
            </div>
            <div className="text-[9px] font-mono text-pulse-text-dim leading-snug">
              {data.reason}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function GoldSkeleton() {
  return (
    <div className="glass-panel rounded-lg p-2.5 h-full">
      <div className="h-3 skeleton-shimmer rounded w-20 mb-2" />
      <div className="h-16 skeleton-shimmer rounded mb-2" />
      <div className="h-12 skeleton-shimmer rounded" />
    </div>
  );
}
