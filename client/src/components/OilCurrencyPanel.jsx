import { motion } from 'framer-motion';
import { Fuel, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

export default function OilCurrencyPanel({ oil, currency }) {
  return (
    <div className="glass-panel rounded-lg p-3 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Fuel className="w-4 h-4 text-pulse-accent drop-shadow-[0_0_4px_rgba(6,182,212,.4)]" />
        <h2 className="text-sm font-bold tracking-wider text-pulse-accent uppercase text-glow-cyan">Oil & Forex</h2>
      </div>

      {/* Oil Prices */}
      {oil && (
        <div className="mb-3">
          <div className="text-[10px] text-pulse-text-muted font-mono mb-1.5 uppercase tracking-wider">Crude Oil</div>
          <div className="grid grid-cols-2 gap-2">
            <PriceCard label="BRENT" price={oil.brent?.price} change={oil.brent?.change24h} prefix="$" delay={0} />
            <PriceCard label="WTI" price={oil.wti?.price} change={oil.wti?.change24h} prefix="$" delay={0.08} />
          </div>
        </div>
      )}

      {/* Currency Rates */}
      {currency && (
        <div className="flex-1">
          <div className="text-[10px] text-pulse-text-muted font-mono mb-1.5 uppercase tracking-wider">Exchange Rates</div>
          <div className="space-y-1.5">
            {currency.pairs?.map((pair, i) => (
              <motion.div
                key={pair.pair}
                className={`p-2 rounded border transition-all ${
                  pair.pair === 'USD/INR'
                    ? 'border-pulse-accent/20 bg-pulse-accent/5 hover:border-pulse-accent/30'
                    : 'border-pulse-border/20 bg-pulse-surface-2/30 hover:border-pulse-border/40'
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.25 }}
                whileHover={{ x: 2, transition: { duration: 0.1 } }}
                layout
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3 h-3 text-pulse-accent" />
                    <span className="text-[10px] font-mono font-bold text-pulse-text">{pair.pair}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-pulse-text tabular-nums">
                      ₹{pair.rate?.toFixed(4)}
                    </div>
                    {pair.change !== 0 && (
                      <div className={`text-[9px] font-mono flex items-center gap-0.5 justify-end ${
                        pair.change >= 0 ? 'text-pulse-green' : 'text-pulse-red'
                      }`}>
                        {pair.change >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                        {pair.change >= 0 ? '+' : ''}{pair.change?.toFixed(4)}%
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PriceCard({ label, price, change, prefix = '', delay = 0 }) {
  const isPositive = change >= 0;
  const breathe = Math.abs(change) > 2 ? 'breathe-red' : '';
  return (
    <motion.div
      className={`p-2 rounded border relative overflow-hidden ${
        Math.abs(change) > 2
          ? 'border-pulse-red/30 bg-pulse-red/5'
          : 'border-pulse-border/20 bg-pulse-surface-2/30 hover:border-pulse-border/40'
      } ${breathe}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.12 } }}
    >
      {/* subtle top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-[1.5px] ${
        Math.abs(change) > 2
          ? 'bg-gradient-to-r from-transparent via-pulse-red/40 to-transparent'
          : 'bg-gradient-to-r from-transparent via-pulse-accent/20 to-transparent'
      }`} />
      <div className="text-[10px] text-pulse-text-muted font-mono">{label}</div>
      <div className="text-base font-bold font-mono text-pulse-text tabular-nums">
        {prefix}{price?.toFixed(2)}
      </div>
      <div className={`text-[10px] font-mono flex items-center gap-0.5 ${isPositive ? 'text-pulse-green' : 'text-pulse-red'}`}>
        {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
        {isPositive ? '+' : ''}{change?.toFixed(2)}% 24h
      </div>
    </motion.div>
  );
}
