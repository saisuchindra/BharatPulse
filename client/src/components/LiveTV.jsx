import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tv, Maximize2, Minimize2, AlertCircle, RefreshCw } from 'lucide-react';

/* Fallback channels (used before backend responds) */
const FALLBACK = [
  { id: 'ndtv',       name: 'NDTV 24x7',  channelId: 'UCZFMm1mMw0F81Z37aaEzTUA', videoId: null, isLive: false },
  { id: 'indiatoday', name: 'India Today', channelId: 'UCYPvAwZP8pZhSMW8qs7cVCw', videoId: null, isLive: false },
  { id: 'timesnow',   name: 'Times Now',   channelId: 'UC6RJ7-PaXg6TIH2BzZfTV7w', videoId: null, isLive: false },
  { id: 'republic',   name: 'Republic TV', channelId: 'UCwqusr8YDwM-3mEYTDeJHzw', videoId: null, isLive: false },
  { id: 'cnn18',      name: 'CNN-News18',  channelId: 'UCef1-8eOpJgud7szVPlZQAQ', videoId: null, isLive: false },
];

export default function LiveTV({ channels: channelsProp }) {
  const channels = useMemo(() => {
    if (Array.isArray(channelsProp) && channelsProp.length) return channelsProp;
    return FALLBACK;
  }, [channelsProp]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    if (activeIdx >= channels.length) setActiveIdx(0);
  }, [channels, activeIdx]);

  const active = channels[activeIdx] || channels[0];

  const embedUrl = useMemo(() => {
    if (active.videoId) {
      return `https://www.youtube.com/embed/${active.videoId}?autoplay=1&mute=1&rel=0&modestbranding=1`;
    }
    if (active.channelId) {
      return `https://www.youtube.com/embed/live_stream?channel=${active.channelId}&autoplay=1&mute=1`;
    }
    return null;
  }, [active.videoId, active.channelId]);

  const toggleFullscreen = () => {
    const el = document.getElementById('live-tv-player');
    if (!isFullscreen) {
      el?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <motion.div
      className="glass-panel rounded-lg p-3 h-full flex flex-col"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-pulse-accent drop-shadow-[0_0_4px_var(--color-pulse-accent)]" />
          <h2 className="text-sm font-bold tracking-wider text-pulse-accent uppercase text-glow-cyan">Live TV</h2>
          <span className="text-[10px] px-2 py-0.5 rounded bg-pulse-red/20 text-pulse-red font-mono breathe-red">
            ● LIVE
          </span>
        </div>
        <div className="flex items-center gap-1">
          <motion.button
            onClick={() => setIframeKey((k) => k + 1)}
            className="p-1 rounded hover:bg-pulse-surface-2 text-pulse-text-muted hover:text-pulse-text transition-colors"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            title="Reload player"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </motion.button>
          <motion.button
            onClick={toggleFullscreen}
            className="p-1 rounded hover:bg-pulse-surface-2 text-pulse-text-muted hover:text-pulse-text transition-colors"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </motion.button>
        </div>
      </div>

      {/* Channel Tabs */}
      <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
        {channels.map((ch, i) => (
          <motion.button
            key={ch.id}
            onClick={() => setActiveIdx(i)}
            className={`relative text-[10px] px-2.5 py-1 rounded font-mono whitespace-nowrap transition-all ${
              activeIdx === i
                ? 'text-pulse-accent border border-pulse-accent/30'
                : 'bg-pulse-surface-2 text-pulse-text-muted hover:text-pulse-text border border-transparent'
            }`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {activeIdx === i && (
              <motion.div
                className="absolute inset-0 rounded bg-pulse-accent/20"
                layoutId="channel-active"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              {ch.name}
              {ch.isLive && (
                <span className="w-1.5 h-1.5 bg-pulse-green rounded-full animate-pulse inline-block" />
              )}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Video Player */}
      <div id="live-tv-player" className="flex-1 rounded overflow-hidden bg-black relative min-h-[200px] border border-pulse-border/20">
        <AnimatePresence mode="wait">
          {embedUrl ? (
            <motion.div
              key={`${active.id}-${iframeKey}`}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <iframe
                src={embedUrl}
                title={active.name}
                className="w-full h-full absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          ) : (
            <motion.div
              key="no-stream"
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-pulse-text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AlertCircle className="w-8 h-8 text-pulse-yellow" />
              <span className="text-xs font-mono">Stream loading…</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Channel Info */}
      <motion.div
        className="mt-2 flex items-center justify-between"
        key={active.id}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
      >
        <span className="text-[10px] text-pulse-text-muted font-mono">
          NOW: <span className="text-pulse-accent">{active.name}</span>
          {active.isLive && <span className="text-pulse-green ml-1">● LIVE</span>}
        </span>
        <span className="text-[10px] text-pulse-text-muted font-mono">
          YouTube Live — Auto-refreshed
        </span>
      </motion.div>
    </motion.div>
  );
}
