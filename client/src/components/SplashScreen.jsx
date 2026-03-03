import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';

const BOOT_LINES = [
  'BHARAT PULSE INTELLIGENCE SYSTEM',
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  '> Initialising secure data channels...',
  '> Connecting to market data feeds......OK',
  '> Loading geospatial intelligence......OK',
  '> Syncing weather & AQI sensors........OK',
  '> Calibrating conflict monitors........OK',
  '> Oil & forex feeds online.............OK',
  '> Infrastructure telemetry active......OK',
  '> Launching impact-analysis engine.....OK',
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  '> SYSTEM READY — ENTERING DASHBOARD',
];

export default function SplashScreen({ onComplete }) {
  const [lines, setLines] = useState([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setLines(prev => [...prev, BOOT_LINES[i]]);
        setProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setDone(true), 400);
        setTimeout(() => onComplete(), 1100);
      }
    }, 180);
    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <AnimatePresence>
      {!done ? (
        <motion.div
          className="fixed inset-0 z-[100] bg-pulse-bg flex flex-col items-center justify-center"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* grid backdrop */}
          <div className="absolute inset-0 animated-grid opacity-40" />

          {/* logo + shield */}
          <motion.div
            className="relative mb-6"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pulse-accent/20 to-pulse-accent/5 border border-pulse-accent/30 flex items-center justify-center breathe-cyan">
              <Shield className="w-10 h-10 text-pulse-accent" />
            </div>
            {/* spinning ring */}
            <svg className="absolute -inset-3 animate-spin" style={{ animationDuration: '6s' }} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(6,182,212,.15)" strokeWidth="1" />
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(6,182,212,.6)" strokeWidth="1.5"
                      strokeDasharray="40 250" strokeLinecap="round" />
            </svg>
          </motion.div>

          {/* title */}
          <motion.h1
            className="text-2xl font-bold tracking-[.25em] text-pulse-accent text-glow-cyan mb-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            BHARAT PULSE
          </motion.h1>
          <motion.p
            className="text-[10px] text-pulse-text-muted mb-6 tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            NATIONAL INTELLIGENCE DASHBOARD
          </motion.p>

          {/* terminal */}
          <motion.div
            className="w-[520px] max-w-[90vw] glass-panel rounded-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {/* title bar */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-pulse-border bg-pulse-surface-2/80">
              <span className="w-2 h-2 rounded-full bg-pulse-red/70" />
              <span className="w-2 h-2 rounded-full bg-pulse-yellow/70" />
              <span className="w-2 h-2 rounded-full bg-pulse-green/70" />
              <span className="ml-2 text-[9px] text-pulse-text-muted">boot-sequence.log</span>
            </div>
            {/* log lines */}
            <div ref={containerRef} className="h-48 overflow-y-auto p-3 font-mono text-[10px] leading-relaxed">
              {lines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className={
                    line.includes('OK') ? 'text-pulse-green' :
                    line.includes('━') ? 'text-pulse-accent/40' :
                    line.includes('SYSTEM READY') ? 'text-pulse-accent font-bold text-glow-cyan' :
                    i === 0 ? 'text-pulse-accent font-bold' :
                    'text-pulse-text-dim'
                  }
                >
                  {line}
                </motion.div>
              ))}
              {/* blinking cursor */}
              {!done && (
                <span className="inline-block w-1.5 h-3 bg-pulse-accent animate-blink-live ml-0.5 align-middle" />
              )}
            </div>
          </motion.div>

          {/* progress bar */}
          <div className="w-[520px] max-w-[90vw] mt-3 flex items-center gap-3">
            <div className="flex-1 h-1 rounded-full bg-pulse-border overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-pulse-accent to-pulse-green rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[10px] text-pulse-text-muted font-mono w-10 text-right">{progress}%</span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
