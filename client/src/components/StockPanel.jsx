import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react';

/* ── Animated number that counts up/down on change ── */
function AnimatedNumber({ value, decimals = 2, prefix = '', className = '' }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    if (value == null) return;
    const prev = prevRef.current ?? value;
    const diff = value - prev;
    if (diff !== 0) {
      setFlash(diff > 0 ? 'up' : 'down');
      const steps = 12;
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setDisplay(prev + (diff * step) / steps);
        if (step >= steps) {
          clearInterval(interval);
          setDisplay(value);
          setTimeout(() => setFlash(null), 500);
        }
      }, 25);
      prevRef.current = value;
      return () => clearInterval(interval);
    }
    prevRef.current = value;
  }, [value]);

  return (
    <span className={`${className} ${flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''}`}>
      {prefix}{(display ?? 0).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
  );
}

function PriceChange({ value, size = 'sm' }) {
  const isPositive = value >= 0;
  const textSize = size === 'lg' ? 'text-base' : 'text-xs';
  return (
    <span className={`flex items-center gap-0.5 font-mono ${textSize} ${isPositive ? 'text-pulse-green' : 'text-pulse-red'}`}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {isPositive ? '+' : ''}{value?.toFixed(2)}%
    </span>
  );
}

export default function StockPanel({ data }) {
  if (!data) return <StockSkeleton />;

  const { indices, stocks, gainers, losers, marketOpen, volatility } = data;

  return (
    <div className="glass-panel rounded-lg p-3 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-pulse-accent drop-shadow-[0_0_4px_rgba(6,182,212,.4)]" />
          <h2 className="text-sm font-bold tracking-wider text-pulse-accent uppercase text-glow-cyan">Markets</h2>
        </div>
        <div className="flex items-center gap-2">
          <motion.span
            className={`text-[10px] px-2 py-0.5 rounded font-mono ${
              volatility === 'HIGH' ? 'bg-pulse-red/20 text-pulse-red' :
              volatility === 'MODERATE' ? 'bg-pulse-yellow/20 text-pulse-yellow' :
              'bg-pulse-green/20 text-pulse-green'
            }`}
            key={volatility}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
          >
            VOL: {volatility}
          </motion.span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
            marketOpen ? 'bg-pulse-green/20 text-pulse-green' : 'bg-pulse-red/20 text-pulse-red'
          }`}>
            {marketOpen ? '● MARKET OPEN' : '○ MARKET CLOSED'}
          </span>
        </div>
      </div>

      {/* Indices */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {indices?.map((idx, i) => (
          <motion.div
            key={idx.symbol}
            className={`p-2.5 rounded-lg border relative overflow-hidden ${
              idx.changePercent >= 0
                ? 'border-pulse-green/20 bg-pulse-green/5'
                : 'border-pulse-red/20 bg-pulse-red/5'
            } ${idx.changePercent >= 0 ? 'breathe-green' : 'breathe-red'}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.4, ease: 'easeOut' }}
            whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
          >
            {/* subtle gradient accent at top */}
            <div className={`absolute top-0 left-0 right-0 h-[2px] ${idx.changePercent >= 0 ? 'bg-gradient-to-r from-transparent via-pulse-green/50 to-transparent' : 'bg-gradient-to-r from-transparent via-pulse-red/50 to-transparent'}`} />
            <div className="text-[10px] text-pulse-text-muted font-mono">{idx.symbol}</div>
            <div className="text-lg font-bold font-mono text-pulse-text">
              <AnimatedNumber value={idx.price} />
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono ${idx.change >= 0 ? 'text-pulse-green' : 'text-pulse-red'}`}>
                {idx.change >= 0 ? '+' : ''}{idx.change?.toFixed(2)}
              </span>
              <PriceChange value={idx.changePercent} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stock List */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-pulse-text-muted text-[10px] border-b border-pulse-border">
              <th className="text-left py-1 font-normal">SYMBOL</th>
              <th className="text-right py-1 font-normal">PRICE</th>
              <th className="text-right py-1 font-normal">CHG%</th>
              <th className="text-right py-1 font-normal hidden sm:table-cell">VOL</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {stocks?.map((stock, i) => (
                <motion.tr
                  key={stock.symbol}
                  className="border-b border-pulse-border/30 hover:bg-pulse-surface-2/50 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  layout
                >
                  <td className="py-1.5">
                    <div className="font-mono font-bold text-pulse-text">{stock.symbol}</div>
                    <div className="text-[9px] text-pulse-text-muted">{stock.sector}</div>
                  </td>
                  <td className="text-right font-mono text-pulse-text">
                    <AnimatedNumber value={stock.price} prefix="₹" />
                  </td>
                  <td className="text-right">
                    <PriceChange value={stock.changePercent} />
                  </td>
                  <td className="text-right text-pulse-text-muted font-mono hidden sm:table-cell">
                    {(stock.volume / 1000000).toFixed(1)}M
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Ticker Strip */}
      <div className="mt-2 overflow-hidden border-t border-pulse-border pt-2">
        <div className="flex whitespace-nowrap ticker-scroll">
          {[...(stocks || []), ...(stocks || [])].map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1 mr-4 text-[10px] font-mono">
              <span className="text-pulse-text-dim">{s.symbol}</span>
              <span className={s.changePercent >= 0 ? 'text-pulse-green' : 'text-pulse-red'}>
                {s.changePercent >= 0 ? '▲' : '▼'} {Math.abs(s.changePercent).toFixed(2)}%
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function StockSkeleton() {
  return (
    <div className="glass-panel rounded-lg p-3 h-full">
      <div className="h-4 skeleton-shimmer rounded w-24 mb-3" />
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="h-20 skeleton-shimmer rounded" />
        <div className="h-20 skeleton-shimmer rounded" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-8 skeleton-shimmer rounded mb-1" />
      ))}
    </div>
  );
}
