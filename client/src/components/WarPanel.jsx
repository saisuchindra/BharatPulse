import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Siren, AlertTriangle, Radio, Shield, MapPin, Clock, ChevronDown,
  ChevronUp, Filter, Crosshair, Flame, Zap, Globe, Flag
} from 'lucide-react';

/* ═══════ severity color map ═══════ */
const SEV = {
  CRITICAL: { bg: 'bg-red-500/15', border: 'border-red-500/40', text: 'text-red-400', dot: 'bg-red-500', breathe: 'breathe-red' },
  HIGH:     { bg: 'bg-orange-500/15', border: 'border-orange-500/40', text: 'text-orange-400', dot: 'bg-orange-500', breathe: 'breathe-orange' },
  MEDIUM:   { bg: 'bg-yellow-500/15', border: 'border-yellow-500/40', text: 'text-yellow-400', dot: 'bg-yellow-400', breathe: '' },
  LOW:      { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', dot: 'bg-blue-400', breathe: '' },
};

const THEATER_ICONS = {
  'iran-israel': Flame,
  'russia-ukraine': Crosshair,
  'israel-palestine': AlertTriangle,
  'red-sea': Globe,
  'myanmar': Flag,
  'south-china-sea': Globe,
  'india-china-lac': Shield,
  'sudan': AlertTriangle,
};

/* ═══════ Scrolling ticker bar ═══════ */
function BreakingTicker({ items }) {
  if (!items.length) return null;
  const text = items.map(b => `🔴 ${b.headline}`).join('    ●    ');
  return (
    <div className="overflow-hidden bg-red-500/10 border-y border-red-500/30 py-1 relative">
      <motion.div
        className="whitespace-nowrap text-[10px] font-mono font-bold text-red-400"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: Math.max(30, items.length * 8), repeat: Infinity, ease: 'linear' }}
      >
        {text}    ●    {text}
      </motion.div>
    </div>
  );
}

/* ═══════ Single bulletin card ═══════ */
function BulletinCard({ b, isNew }) {
  const [expanded, setExpanded] = useState(false);
  const s = SEV[b.severity] || SEV.MEDIUM;
  const Icon = THEATER_ICONS[b.theaterId] || Crosshair;
  const age = useMemo(() => {
    const sec = Math.floor((Date.now() - new Date(b.timestamp).getTime()) / 1000);
    if (sec < 60) return `${sec}s ago`;
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    return `${Math.floor(sec / 3600)}h ago`;
  }, [b.timestamp]);

  return (
    <motion.div
      layout
      initial={isNew ? { opacity: 0, x: -30, scale: 0.95 } : false}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 30, scale: 0.95 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
      className={`rounded border ${s.border} ${s.bg} ${b.isBreaking ? s.breathe : ''} relative overflow-hidden`}
    >
      {/* BREAKING flash bar */}
      {b.isBreaking && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-2.5 flex gap-2"
      >
        {/* Severity icon */}
        <div className={`flex-shrink-0 mt-0.5 ${s.text}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>

        <div className="flex-1 min-w-0">
          {/* meta row */}
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className={`text-[8px] px-1 py-0.5 rounded font-mono font-bold ${s.bg} ${s.text} ${s.border} border`}>
              {b.severity}
            </span>
            {b.isBreaking && (
              <span className="text-[8px] px-1 py-0.5 rounded bg-red-500/20 text-red-400 font-mono font-bold animate-pulse">
                ⚡ BREAKING
              </span>
            )}
            <span className="text-[8px] text-pulse-text-muted font-mono">{b.theater}</span>
            <span className="text-[8px] text-pulse-text-muted font-mono">·</span>
            <span className="text-[8px] text-pulse-text-muted font-mono">{b.region}</span>
            <span className="ml-auto text-[8px] text-pulse-text-muted font-mono flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
              {age}
            </span>
          </div>

          {/* headline */}
          <p className={`text-[11px] font-mono leading-snug ${b.isBreaking ? 'text-red-300 font-bold' : 'text-pulse-text'}`}>
            {b.headline}
          </p>

          {/* expand indicator */}
          <div className="flex items-center justify-between mt-1">
            <span className="text-[8px] font-mono text-pulse-text-muted flex items-center gap-1">
              <Radio className="w-2.5 h-2.5" /> {b.source}
              <span className={`ml-1 px-1 rounded text-[7px] font-bold ${
                b.verification === 'CONFIRMED' ? 'bg-pulse-green/15 text-pulse-green' :
                b.verification === 'DEVELOPING' ? 'bg-yellow-500/15 text-yellow-400' :
                'bg-pulse-text-muted/10 text-pulse-text-muted'
              }`}>{b.verification}</span>
            </span>
            {expanded ? <ChevronUp className="w-3 h-3 text-pulse-text-muted" /> : <ChevronDown className="w-3 h-3 text-pulse-text-muted" />}
          </div>
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-2.5 pb-2.5 space-y-1.5 border-t border-pulse-border/20 pt-2">
              <p className="text-[10px] font-mono text-pulse-text-dim leading-relaxed">{b.body}</p>

              <div className="grid grid-cols-2 gap-1.5">
                <div className="rounded bg-pulse-surface-2/50 p-1.5">
                  <div className="text-[7px] text-pulse-text-muted font-mono mb-0.5">CASUALTIES</div>
                  <div className="text-[10px] font-mono text-red-400 font-bold">{b.casualtyEstimate}</div>
                </div>
                <div className="rounded bg-pulse-surface-2/50 p-1.5">
                  <div className="text-[7px] text-pulse-text-muted font-mono mb-0.5">SEVERITY</div>
                  <div className="flex items-center gap-1">
                    <div className="flex-1 h-1.5 bg-pulse-bg rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${s.dot}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${b.severityScore * 10}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <span className={`text-[9px] font-mono font-bold ${s.text}`}>{b.severityScore}/10</span>
                  </div>
                </div>
              </div>

              <div className="rounded bg-pulse-accent/5 border border-pulse-accent/20 p-1.5">
                <div className="text-[7px] text-pulse-accent font-mono font-bold mb-0.5 flex items-center gap-1">
                  <Flag className="w-2.5 h-2.5" /> INDIA IMPACT
                </div>
                <div className="text-[9px] font-mono text-pulse-text-dim">{b.indiaImpact}</div>
              </div>

              <div className="flex flex-wrap gap-1">
                {b.tags.map(t => (
                  <span key={t} className="text-[7px] px-1 py-0.5 rounded bg-pulse-surface-2 text-pulse-text-muted font-mono">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════ Theater filter pills ═══════ */
function TheaterFilters({ theaters, active, onToggle }) {
  return (
    <div className="flex flex-wrap gap-1 mb-2">
      <button
        onClick={() => onToggle(null)}
        className={`text-[8px] px-1.5 py-0.5 rounded font-mono transition-all ${
          active === null
            ? 'bg-pulse-accent/20 text-pulse-accent border border-pulse-accent/30'
            : 'bg-pulse-surface-2 text-pulse-text-muted border border-transparent hover:text-pulse-text'
        }`}
      >
        ALL
      </button>
      {theaters.map(t => (
        <button
          key={t.id}
          onClick={() => onToggle(t.id)}
          className={`text-[8px] px-1.5 py-0.5 rounded font-mono transition-all ${
            active === t.id
              ? 'bg-pulse-accent/20 text-pulse-accent border border-pulse-accent/30'
              : 'bg-pulse-surface-2 text-pulse-text-muted border border-transparent hover:text-pulse-text'
          }`}
        >
          {t.name.split('–')[0].split('/')[0].trim().toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/* ═══════ MAIN WAR PANEL ═══════ */
export default function WarPanel({ data }) {
  const [theaterFilter, setTheaterFilter] = useState(null);
  const [severityFilter, setSeverityFilter] = useState(null);
  const scrollRef = useRef(null);
  const prevCountRef = useRef(0);
  const [newIds, setNewIds] = useState(new Set());

  const bulletins = data?.bulletins || [];
  const theaters = data?.theaters || [];
  const breakingItems = bulletins.filter(b => b.isBreaking);

  // Track newly arrived bulletins for animation
  useEffect(() => {
    if (bulletins.length > prevCountRef.current) {
      const newOnes = new Set(bulletins.slice(0, bulletins.length - prevCountRef.current).map(b => b.id));
      setNewIds(newOnes);
      // Auto-scroll to top on new items
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      const timer = setTimeout(() => setNewIds(new Set()), 2000);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = bulletins.length;
  }, [bulletins.length]);

  const filtered = useMemo(() => {
    let list = bulletins;
    if (theaterFilter) list = list.filter(b => b.theaterId === theaterFilter);
    if (severityFilter) list = list.filter(b => b.severity === severityFilter);
    return list;
  }, [bulletins, theaterFilter, severityFilter]);

  if (!data) return <WarSkeleton />;

  return (
    <motion.div
      className="glass-panel rounded-lg h-full flex flex-col overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Siren className="w-4 h-4 text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)] animate-pulse" />
            <h2 className="text-sm font-bold tracking-wider text-red-400 uppercase font-mono"
              style={{ textShadow: '0 0 10px rgba(239,68,68,0.3)' }}>
              WAR ROOM
            </h2>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-mono breathe-red font-bold">
              ● LIVE INTEL
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-mono text-pulse-text-muted">
              {data.breakingCount} BREAKING
            </span>
            <span className="text-[8px] font-mono text-red-400 font-bold">
              {data.criticalCount} CRITICAL
            </span>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex gap-2 mb-2">
          {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => {
            const s = SEV[sev];
            const count = bulletins.filter(b => b.severity === sev).length;
            const isActive = severityFilter === sev;
            return (
              <button
                key={sev}
                onClick={() => setSeverityFilter(isActive ? null : sev)}
                className={`flex-1 rounded p-1.5 text-center border transition-all ${
                  isActive ? `${s.border} ${s.bg}` : 'border-pulse-border/20 bg-pulse-surface-2/30 hover:bg-pulse-surface-2/50'
                }`}
              >
                <div className={`text-lg font-bold font-mono ${s.text}`}>{count}</div>
                <div className="text-[7px] text-pulse-text-muted font-mono">{sev}</div>
              </button>
            );
          })}
        </div>

        {/* Theater filters */}
        <TheaterFilters theaters={theaters} active={theaterFilter} onToggle={setTheaterFilter} />
      </div>

      {/* Breaking ticker */}
      <BreakingTicker items={breakingItems.slice(0, 8)} />

      {/* Bulletin feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0 px-3 py-2 space-y-1.5 scrollbar-thin">
        <AnimatePresence initial={false}>
          {filtered.map(b => (
            <BulletinCard key={b.id} b={b} isNew={newIds.has(b.id)} />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-pulse-text-muted text-xs font-mono">
            No bulletins match current filters
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-pulse-border/20 flex items-center justify-between">
        <span className="text-[8px] font-mono text-pulse-text-muted flex items-center gap-1">
          <Zap className="w-2.5 h-2.5 text-red-400" />
          {filtered.length} bulletins • {theaters.length} theaters • Updated every 5s
        </span>
        <span className="text-[8px] font-mono text-pulse-text-muted">
          OSINT • Reuters • AP • ANI
        </span>
      </div>
    </motion.div>
  );
}

function WarSkeleton() {
  return (
    <div className="glass-panel rounded-lg p-3 h-full">
      <div className="h-4 skeleton-shimmer rounded w-32 mb-3" />
      <div className="flex gap-2 mb-3">
        {[1,2,3,4].map(i => <div key={i} className="flex-1 h-14 skeleton-shimmer rounded" />)}
      </div>
      <div className="h-6 skeleton-shimmer rounded mb-3" />
      <div className="space-y-2">
        {[1,2,3,4,5].map(i => <div key={i} className="h-20 skeleton-shimmer rounded" />)}
      </div>
    </div>
  );
}
