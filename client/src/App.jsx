import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from './hooks/useSocket';
import SplashScreen from './components/SplashScreen';
import TopBar from './components/TopBar';
import StockPanel from './components/StockPanel';
import NewsFeed from './components/NewsFeed';
import LiveTV from './components/LiveTV';
import ImpactEngine from './components/ImpactEngine';
import WeatherPanel from './components/WeatherPanel';
import OilCurrencyPanel from './components/OilCurrencyPanel';
import InfraPanel from './components/InfraPanel';
import MapPanel from './components/MapPanel';
import ConflictPanel from './components/ConflictPanel';
import GoldPanel from './components/GoldPanel';
import SilverPanel from './components/SilverPanel';
import WarPanel from './components/WarPanel';
import AlertPanel from './components/AlertPanel';
import {
  LayoutDashboard, Map, BarChart3, Newspaper, Tv, Shield,
  Cloud, Zap, Crosshair, ChevronLeft, ChevronRight, Activity, Gem, Siren
} from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'markets', label: 'Markets', icon: BarChart3 },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'tv', label: 'Live TV', icon: Tv },
  { id: 'impact', label: 'Impact', icon: Shield },
  { id: 'weather', label: 'Weather', icon: Cloud },
  { id: 'infra', label: 'Infra', icon: Zap },
  { id: 'conflicts', label: 'Conflicts', icon: Crosshair },
  { id: 'metals', label: 'Metals', icon: Gem },
  { id: 'war', label: 'War Room', icon: Siren },
];

const DATA_STREAMS = [
  { key: 'stocks', label: 'MKT' },
  { key: 'news', label: 'NEWS' },
  { key: 'weather', label: 'WX' },
  { key: 'oil', label: 'OIL' },
  { key: 'currency', label: 'FX' },
  { key: 'conflicts', label: 'GEO' },
  { key: 'infra', label: 'INFRA' },
  { key: 'shipping', label: 'SHIP' },
  { key: 'map', label: 'MAP' },
  { key: 'impact', label: 'IDX' },
  { key: 'gold', label: 'AU' },
  { key: 'silver', label: 'AG' },
  { key: 'war', label: 'WAR' },
];

export default function App() {
  const { connected, data } = useSocket();
  const [booted, setBooted] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [now, setNow] = useState(new Date());

  const handleBootComplete = useCallback(() => setBooted(true), []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!booted) return <SplashScreen onComplete={handleBootComplete} />;

  return (
    <div className="h-screen w-screen flex flex-col bg-pulse-bg overflow-hidden">
      {/* subtle scan-line overlay */}
      <div className="scan-line" />
      {/* animated grid background */}
      <div className="fixed inset-0 animated-grid opacity-30 pointer-events-none z-0" />

      {/* Top Bar */}
      <TopBar connected={connected} />

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Sidebar Navigation */}
        <motion.nav
          className="flex-shrink-0 bg-pulse-surface/90 backdrop-blur-md border-r border-pulse-border flex flex-col relative z-20"
          animate={{ width: sidebarCollapsed ? 48 : 176 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className="flex-1 py-2 space-y-0.5">
            {TABS.map((tab, i) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`sidebar-btn w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors relative overflow-hidden ${
                    active
                      ? 'text-pulse-accent'
                      : 'text-pulse-text-muted hover:text-pulse-text hover:bg-pulse-surface-2'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {/* active indicator bar */}
                  {active && (
                    <motion.div
                      className="absolute right-0 top-0 w-[2px] h-full bg-pulse-accent"
                      layoutId="sidebar-indicator"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  {/* active bg glow */}
                  {active && (
                    <motion.div
                      className="absolute inset-0 bg-pulse-accent/8"
                      layoutId="sidebar-bg"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-4 h-4 flex-shrink-0 relative z-10 ${active ? 'drop-shadow-[0_0_6px_rgba(6,182,212,.5)]' : ''}`} />
                  {!sidebarCollapsed && (
                    <span className="text-[11px] font-mono tracking-wider relative z-10">{tab.label}</span>
                  )}
                  {/* tooltip when collapsed */}
                  {sidebarCollapsed && <span className="sidebar-tip">{tab.label}</span>}
                </motion.button>
              );
            })}
          </div>

          {/* Sidebar Toggle */}
          <motion.button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 border-t border-pulse-border text-pulse-text-muted hover:text-pulse-accent transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={{ rotate: sidebarCollapsed ? 0 : 180 }}
              transition={{ duration: 0.3 }}
              className="mx-auto w-fit"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          </motion.button>

          {/* Alert Button */}
          <div className="p-2 border-t border-pulse-border flex justify-center">
            <AlertPanel alerts={data.alerts} />
          </div>
        </motion.nav>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden p-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="h-full"
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -8 }}
              transition={{ duration: 0.25, ease: [.25,.46,.45,.94] }}
            >
              {activeTab === 'dashboard' && <DashboardView data={data} />}
              {activeTab === 'map' && <MapPanel data={data.map} />}
              {activeTab === 'markets' && <MarketsView data={data} />}
              {activeTab === 'news' && <NewsView data={data} />}
              {activeTab === 'tv' && <LiveTV channels={data.livetv} />}
              {activeTab === 'impact' && <ImpactView data={data} />}
              {activeTab === 'weather' && <WeatherPanel data={data.weather} />}
              {activeTab === 'infra' && <InfraPanel data={data.infra} />}
              {activeTab === 'conflicts' && <ConflictPanel data={data.conflicts} />}
              {activeTab === 'metals' && <MetalsView data={data} />}
              {activeTab === 'war' && <WarView data={data} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Bottom Status Bar — enhanced */}
      <footer className="h-7 bg-pulse-surface/90 backdrop-blur-md border-t border-pulse-border flex items-center justify-between px-4 relative z-20">
        <div className="flex items-center gap-3 text-[9px] font-mono text-pulse-text-muted">
          <span className="text-pulse-accent font-bold tracking-wider">BHARAT PULSE v1.0</span>
          <span className="text-pulse-border">│</span>
          {/* data stream dots */}
          <div className="flex items-center gap-1.5">
            {DATA_STREAMS.map(s => (
              <div key={s.key} className="flex items-center gap-0.5 group relative" title={s.label}>
                <span className={`w-1.5 h-1.5 rounded-full transition-colors ${data[s.key] ? 'bg-pulse-green animate-pulse-glow' : 'bg-pulse-text-muted/30'}`} />
                <span className="hidden sm:inline text-[8px]">{s.label}</span>
              </div>
            ))}
          </div>
          <span className="text-pulse-border">│</span>
          <Activity className="w-3 h-3 text-pulse-accent animate-pulse-glow" />
          <span>ALERTS: {data.alerts?.length || 0}</span>
        </div>
        <div className="flex items-center gap-3 text-[9px] font-mono text-pulse-text-muted">
          <span>{now.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
          <span className="text-pulse-border">│</span>
          <span className="tabular-nums">{now.toLocaleTimeString('en-IN', { hour12: false })}</span>
          <span className="text-pulse-border">│</span>
          <span className={`flex items-center gap-1 ${connected ? 'text-pulse-green' : 'text-pulse-red'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-pulse-green animate-blink-live' : 'bg-pulse-red'}`} />
            {connected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </footer>
    </div>
  );
}

/* ========== View Layouts ========== */

function DashboardView({ data }) {
  return (
    <div className="h-full grid grid-cols-12 grid-rows-6 gap-2 overflow-hidden">
      {/* Row 1: Map | Impact | Stocks */}
      <div className="col-span-6 row-span-3">
        <MapPanel data={data.map} />
      </div>
      <div className="col-span-3 row-span-3">
        <ImpactEngine data={data.impact} />
      </div>
      <div className="col-span-3 row-span-3">
        <StockPanel data={data.stocks} />
      </div>

      {/* Row 2: News | Oil & FX | Gold | Silver | Conflicts | Infra */}
      <div className="col-span-3 row-span-3">
        <NewsFeed data={data.news} />
      </div>
      <div className="col-span-2 row-span-3">
        <OilCurrencyPanel oil={data.oil} currency={data.currency} />
      </div>
      <div className="col-span-2 row-span-3">
        <div className="h-full flex flex-col gap-2">
          <div className="flex-1 min-h-0"><GoldPanel data={data.gold} /></div>
          <div className="flex-1 min-h-0"><SilverPanel data={data.silver} /></div>
        </div>
      </div>
      <div className="col-span-2 row-span-3">
        <ConflictPanel data={data.conflicts} />
      </div>
      <div className="col-span-3 row-span-3">
        <InfraPanel data={data.infra} />
      </div>
    </div>
  );
}

function MarketsView({ data }) {
  return (
    <div className="h-full grid grid-cols-4 gap-2">
      <div className="col-span-2">
        <StockPanel data={data.stocks} />
      </div>
      <div className="col-span-1">
        <OilCurrencyPanel oil={data.oil} currency={data.currency} />
      </div>
      <div className="col-span-1 grid grid-rows-2 gap-2">
        <GoldPanel data={data.gold} />
        <SilverPanel data={data.silver} />
      </div>
    </div>
  );
}

function NewsView({ data }) {
  return (
    <div className="h-full grid grid-cols-3 gap-2">
      <div className="col-span-2">
        <NewsFeed data={data.news} />
      </div>
      <div className="col-span-1">
        <LiveTV channels={data.livetv} />
      </div>
    </div>
  );
}

function ImpactView({ data }) {
  return (
    <div className="h-full grid grid-cols-4 gap-2">
      <div className="col-span-1">
        <ImpactEngine data={data.impact} />
      </div>
      <div className="col-span-1">
        <ConflictPanel data={data.conflicts} />
      </div>
      <div className="col-span-1">
        <OilCurrencyPanel oil={data.oil} currency={data.currency} />
      </div>
      <div className="col-span-1 grid grid-rows-2 gap-2">
        <GoldPanel data={data.gold} />
        <SilverPanel data={data.silver} />
      </div>
    </div>
  );
}

function MetalsView({ data }) {
  return (
    <div className="h-full grid grid-cols-2 gap-2">
      <GoldPanel data={data.gold} />
      <SilverPanel data={data.silver} />
    </div>
  );
}

function WarView({ data }) {
  return (
    <div className="h-full grid grid-cols-3 gap-2">
      <div className="col-span-2">
        <WarPanel data={data.war} />
      </div>
      <div className="col-span-1 grid grid-rows-2 gap-2">
        <ConflictPanel data={data.conflicts} />
        <ImpactEngine data={data.impact} />
      </div>
    </div>
  );
}
