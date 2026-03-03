import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, AlertTriangle, Clock, Filter } from 'lucide-react';

export default function NewsFeed({ data }) {
  const [activeCategory, setActiveCategory] = useState(null);

  if (!data) return <NewsSkeleton />;

  const { articles, categories, breakingCount } = data;
  const filtered = activeCategory
    ? articles.filter(a => a.category === activeCategory)
    : articles;

  return (
    <div className="glass-panel rounded-lg p-3 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-pulse-accent drop-shadow-[0_0_4px_rgba(6,182,212,.4)]" />
          <h2 className="text-sm font-bold tracking-wider text-pulse-accent uppercase text-glow-cyan">Live Feed</h2>
          {breakingCount > 0 && (
            <motion.span
              className="text-[10px] px-2 py-0.5 rounded bg-pulse-red/20 text-pulse-red font-mono animate-blink-live breathe-red"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              {breakingCount} BREAKING
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-pulse-green animate-blink-live" />
          <span className="text-[10px] text-pulse-text-muted font-mono">AUTO-REFRESH</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
        <motion.button
          onClick={() => setActiveCategory(null)}
          className={`text-[10px] px-2 py-0.5 rounded font-mono whitespace-nowrap transition-colors ${
            !activeCategory ? 'bg-pulse-accent/20 text-pulse-accent' : 'bg-pulse-surface-2 text-pulse-text-muted hover:text-pulse-text'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ALL
        </motion.button>
        {categories?.map(cat => (
          <motion.button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-[10px] px-2 py-0.5 rounded font-mono whitespace-nowrap transition-colors ${
              activeCategory === cat ? 'bg-pulse-accent/20 text-pulse-accent' : 'bg-pulse-surface-2 text-pulse-text-muted hover:text-pulse-text'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {cat.toUpperCase()}
          </motion.button>
        ))}
      </div>

      {/* News List */}
      <div className="flex-1 overflow-y-auto space-y-1">
        <AnimatePresence mode="popLayout">
          {filtered?.map((article, i) => (
            <motion.div
              key={article.id}
              className={`p-2 rounded border transition-colors cursor-default ${
                article.isBreaking
                  ? 'border-pulse-red/30 bg-pulse-red/5 hover:bg-pulse-red/8'
                  : 'border-pulse-border/30 bg-pulse-surface-2/30 hover:bg-pulse-surface-2/60 hover:border-pulse-border/50'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, transition: { duration: 0.15 } }}
              transition={{ delay: i * 0.03, duration: 0.25 }}
              layout
              whileHover={{ x: 3, transition: { duration: 0.1 } }}
            >
              <div className="flex items-start gap-2">
                {article.isBreaking && (
                  <AlertTriangle className="w-3 h-3 text-pulse-red mt-0.5 flex-shrink-0 animate-blink-live" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs leading-relaxed ${article.isBreaking ? 'text-pulse-text font-semibold' : 'text-pulse-text-dim'}`}>
                    {article.headline}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-pulse-accent font-mono">{article.source}</span>
                    <span className="text-[9px] text-pulse-text-muted">•</span>
                    <span className="text-[9px] px-1.5 py-0 rounded bg-pulse-surface-2 text-pulse-text-muted font-mono">
                      {article.category}
                    </span>
                    <span className="text-[9px] text-pulse-text-muted flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(article.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function NewsSkeleton() {
  return (
    <div className="glass-panel rounded-lg p-3 h-full">
      <div className="h-4 skeleton-shimmer rounded w-24 mb-3" />
      <div className="flex gap-1 mb-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-5 skeleton-shimmer rounded w-16" />
        ))}
      </div>
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-14 skeleton-shimmer rounded mb-1" />
      ))}
    </div>
  );
}
