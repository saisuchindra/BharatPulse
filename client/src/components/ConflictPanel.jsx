import { motion } from 'framer-motion';
import { Crosshair, Shield } from 'lucide-react';

const SEVERITY_COLORS = {
  CRITICAL: { bg: 'bg-pulse-red/10', border: 'border-pulse-red/30', text: 'text-pulse-red', dot: 'bg-pulse-red', breathe: 'breathe-red' },
  HIGH: { bg: 'bg-pulse-red/5', border: 'border-pulse-red/20', text: 'text-pulse-red', dot: 'bg-pulse-red', breathe: '' },
  MEDIUM: { bg: 'bg-pulse-yellow/5', border: 'border-pulse-yellow/20', text: 'text-pulse-yellow', dot: 'bg-pulse-yellow', breathe: '' },
  LOW: { bg: 'bg-pulse-green/5', border: 'border-pulse-green/20', text: 'text-pulse-green', dot: 'bg-pulse-green', breathe: '' },
};

export default function ConflictPanel({ data }) {
  if (!data) return null;

  const { conflicts, totalActive, criticalCount, overallThreatLevel } = data;

  return (
    <div className="glass-panel rounded-lg p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-pulse-accent drop-shadow-[0_0_4px_rgba(6,182,212,.4)]" />
          <h2 className="text-sm font-bold tracking-wider text-pulse-accent uppercase text-glow-cyan">Conflicts</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-pulse-text-muted">{totalActive} Active</span>
          <motion.span
            className={`text-[10px] px-2 py-0.5 rounded font-mono ${
              overallThreatLevel === 'CRITICAL' ? 'bg-pulse-red/20 text-pulse-red breathe-red' :
              overallThreatLevel === 'ELEVATED' ? 'bg-pulse-yellow/20 text-pulse-yellow breathe-yellow' :
              'bg-pulse-green/20 text-pulse-green'
            }`}
            key={overallThreatLevel}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {overallThreatLevel}
          </motion.span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5">
        {conflicts?.map((conflict, i) => {
          const colors = SEVERITY_COLORS[conflict.severity] || SEVERITY_COLORS.LOW;
          return (
            <motion.div
              key={conflict.id}
              className={`p-2 rounded border ${colors.bg} ${colors.border} ${colors.breathe} hover:brightness-110 transition-all`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              whileHover={{ x: 3, transition: { duration: 0.1 } }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${colors.dot} ${conflict.severity === 'CRITICAL' ? 'animate-blink-live' : ''}`} />
                  <span className="text-[10px] font-mono font-bold text-pulse-text">{conflict.name}</span>
                </div>
                <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono ${colors.text}`}>
                  {conflict.severity}
                </span>
              </div>
              <div className="text-[9px] text-pulse-text-muted font-mono">{conflict.region}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[9px] text-pulse-text-dim font-mono">
                  Escalation: {conflict.escalationLevel}/10
                </span>
                <div className="flex gap-0.5">
                  {[...Array(10)].map((_, j) => (
                    <motion.div
                      key={j}
                      className={`w-1.5 h-3 rounded-sm ${
                        j < conflict.escalationLevel
                          ? conflict.escalationLevel >= 8 ? 'bg-pulse-red' : conflict.escalationLevel >= 5 ? 'bg-pulse-yellow' : 'bg-pulse-green'
                          : 'bg-pulse-surface-2'
                      }`}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: i * 0.05 + j * 0.03, duration: 0.2 }}
                      style={{ originY: 1 }}
                    />
                  ))}
                </div>
              </div>
              <div className="text-[8px] text-pulse-accent/70 font-mono mt-1">
                India Impact: {conflict.impactOnIndia}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
