import { motion } from 'framer-motion';
import { Activity, Wifi, WifiOff, Shield } from 'lucide-react';
import { useWorldClock } from '../hooks/useWorldClock';

export default function TopBar({ connected }) {
  const clocks = useWorldClock();

  return (
    <motion.header
      className="w-full bg-pulse-surface/90 backdrop-blur-md border-b border-pulse-border px-4 py-2 relative z-30"
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pulse-accent/25 to-pulse-accent/5 border border-pulse-accent/30 flex items-center justify-center breathe-cyan">
              <Shield className="w-5 h-5 text-pulse-accent drop-shadow-[0_0_6px_rgba(6,182,212,.5)]" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-pulse-green rounded-full animate-blink-live ring-2 ring-pulse-surface" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider">
              <span className="text-pulse-accent text-glow-cyan">BHARAT</span>
              <span className="text-pulse-text">PULSE</span>
            </h1>
            <p className="text-[9px] text-pulse-text-muted tracking-[0.2em] uppercase -mt-1">
              Live Intelligence • Real Impact
            </p>
          </div>
        </motion.div>

        {/* World Clock Strip */}
        <div className="hidden lg:flex items-center gap-1">
          {clocks.map((clock, i) => (
            <motion.div
              key={clock.name}
              className={`px-3 py-1 rounded text-center min-w-[100px] transition-colors ${
                clock.primary
                  ? 'bg-pulse-accent/10 border border-pulse-accent/30 border-glow-cyan'
                  : 'bg-pulse-surface-2/80 border border-pulse-border/30 hover:border-pulse-border'
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.06, duration: 0.3 }}
            >
              <div className="flex items-center justify-center gap-1">
                <span className="text-[10px] text-pulse-text-muted">{clock.label}</span>
                {clock.marketOpen ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-pulse-green animate-blink-live" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-pulse-red/40" />
                )}
              </div>
              <motion.div
                className={`text-sm font-mono font-bold tabular-nums ${clock.primary ? 'text-pulse-accent' : 'text-pulse-text'}`}
                key={clock.time}
                initial={{ opacity: 0.6, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {clock.time}
              </motion.div>
              <div className="text-[8px] text-pulse-text-muted">
                {clock.marketOpen ? (
                  <span className="text-pulse-green">{clock.marketName} OPEN</span>
                ) : (
                  <span>Opens {clock.nextOpenCountdown}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Connection Status */}
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            connected
              ? 'bg-pulse-green/5 border-pulse-green/20 breathe-green'
              : 'bg-pulse-red/5 border-pulse-red/20 breathe-red'
          }`}>
            {connected ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-pulse-green" />
                <span className="text-xs text-pulse-green font-mono font-bold">LIVE</span>
                <span className="w-2 h-2 rounded-full bg-pulse-green animate-blink-live" />
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-pulse-red" />
                <span className="text-xs text-pulse-red font-mono">OFFLINE</span>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}
