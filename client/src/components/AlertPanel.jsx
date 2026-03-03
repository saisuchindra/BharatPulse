import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, Fuel, TrendingDown, DollarSign, Zap, Cloud, Ship, X } from 'lucide-react';
import { useState } from 'react';

const ALERT_ICONS = {
  OIL_SPIKE: Fuel,
  MARKET_VOLATILITY: TrendingDown,
  CURRENCY_STRESS: DollarSign,
  CONFLICT_ESCALATION: AlertTriangle,
  STABILITY_CRITICAL: AlertTriangle,
  WEATHER: Cloud,
  INFRASTRUCTURE: Zap,
  SHIPPING: Ship,
};

export default function AlertPanel({ alerts }) {
  const [showPanel, setShowPanel] = useState(false);

  const criticalCount = alerts?.filter(a => a.severity === 'critical').length || 0;

  return (
    <>
      {/* Alert Bell */}
      <motion.button
        onClick={() => setShowPanel(!showPanel)}
        className={`relative p-2 rounded-lg border transition-colors ${
          criticalCount > 0
            ? 'bg-pulse-red/5 border-pulse-red/20 breathe-red'
            : 'bg-pulse-surface border-pulse-border hover:border-pulse-border-glow'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Bell className={`w-4 h-4 ${criticalCount > 0 ? 'text-pulse-red' : 'text-pulse-text-dim'}`} />
        {criticalCount > 0 && (
          <motion.span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pulse-red text-[9px] text-white flex items-center justify-center font-mono"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            {criticalCount}
          </motion.span>
        )}
      </motion.button>

      {/* Alert Panel Overlay */}
      <AnimatePresence>
        {showPanel && (
          <>
            {/* backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPanel(false)}
            />
            <motion.div
              className="fixed top-0 right-0 h-full w-80 bg-pulse-surface/95 backdrop-blur-md border-l border-pulse-accent/10 z-50 shadow-2xl border-glow-cyan"
              initial={{ x: 320, opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="p-3 border-b border-pulse-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-pulse-accent" />
                  <h3 className="text-sm font-bold text-pulse-accent font-mono text-glow-cyan">ALERT LOG</h3>
                  {criticalCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-pulse-red/20 text-pulse-red font-mono breathe-red">
                      {criticalCount} CRITICAL
                    </span>
                  )}
                </div>
                <motion.button
                  onClick={() => setShowPanel(false)}
                  className="text-pulse-text-muted hover:text-pulse-text"
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="p-2 overflow-y-auto h-[calc(100%-48px)]">
                {alerts?.length === 0 && (
                  <div className="text-center py-8 text-pulse-text-muted text-xs font-mono">
                    No alerts recorded
                  </div>
                )}
                <AnimatePresence>
                  {alerts?.map((alert, i) => {
                    const Icon = ALERT_ICONS[alert.type] || AlertTriangle;
                    return (
                      <motion.div
                        key={`${alert.type}-${alert.timestamp}-${i}`}
                        className={`p-2 mb-1 rounded border transition-all ${
                          alert.severity === 'critical'
                            ? 'border-pulse-red/30 bg-pulse-red/5 hover:bg-pulse-red/8'
                            : 'border-pulse-yellow/30 bg-pulse-yellow/5 hover:bg-pulse-yellow/8'
                        }`}
                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ delay: i * 0.04, duration: 0.2 }}
                      >
                        <div className="flex items-start gap-2">
                          <Icon className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${
                            alert.severity === 'critical' ? 'text-pulse-red' : 'text-pulse-yellow'
                          }`} />
                          <div>
                            <div className="text-[10px] font-mono font-bold text-pulse-text-dim">
                              {alert.type?.replace(/_/g, ' ')}
                            </div>
                            <div className="text-[10px] font-mono text-pulse-text-dim mt-0.5">
                              {alert.message}
                            </div>
                            <div className="text-[8px] text-pulse-text-muted mt-1">
                              {new Date(alert.timestamp).toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {alerts?.slice(0, 3).map((alert, i) => (
            <motion.div
              key={`toast-${alert.type}-${alert.timestamp}-${i}`}
              className={`p-3 rounded-lg border shadow-lg max-w-xs backdrop-blur-md ${
                alert.severity === 'critical'
                  ? 'border-pulse-red/40 bg-pulse-surface/90 breathe-red'
                  : 'border-pulse-yellow/40 bg-pulse-surface/90 breathe-yellow'
              }`}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${
                  alert.severity === 'critical' ? 'text-pulse-red' : 'text-pulse-yellow'
                }`} />
                <span className="text-[10px] font-mono text-pulse-text">{alert.message}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
