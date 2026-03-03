<p align="center">
  <img src="https://img.shields.io/badge/BharatPulse-v1.0-06b6d4?style=for-the-badge&labelColor=0a0e17" alt="Version" />
  <img src="https://img.shields.io/badge/Node.js-22+-339933?style=for-the-badge&logo=node.js&logoColor=white&labelColor=0a0e17" alt="Node" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white&labelColor=0a0e17" alt="React" />
  <img src="https://img.shields.io/badge/Socket.IO-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white&labelColor=0a0e17" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/Tailwind-4.2-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white&labelColor=0a0e17" alt="Tailwind" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge&labelColor=0a0e17" alt="License" />
</p>

<h1 align="center">🇮🇳 BharatPulse</h1>
<h3 align="center">Live Intelligence. Real Impact.</h3>

<p align="center">
  A real-time national intelligence dashboard for India — tracking markets, conflicts, infrastructure, weather, live news, precious metals, and active war zones from a single command-center interface.
</p>

---

## Overview

**BharatPulse** is a full-stack, WebSocket-powered intelligence dashboard that aggregates and visualizes India-centric data streams in real time. Built with a dark, cinematic command-center aesthetic, it provides situational awareness across 12+ data domains — from NIFTY/SENSEX movements to global conflict theaters, from live YouTube news channels to second-by-second war bulletins.

The system runs entirely on **simulated high-fidelity data** — no API keys are required to demo. Plug in real API keys to connect to live data sources anytime.

---

## Features

| Module | Description |
|:-------|:------------|
| **Global Map** | Interactive SVG map of India with geo-projected markers for conflicts, shipping lanes, weather stations, ports, airports, oil facilities, and economic zones |
| **Live Stocks** | NIFTY 50, SENSEX, and top 10 Indian stocks with real-time price tickers and sparkline charts |
| **News Feed** | Multi-source categorized news (politics, economy, defense, tech, sports) with breaking alert badges |
| **Live TV** | Embedded YouTube live streams — NDTV, India Today, Times Now, Republic TV, CNN-News18 — with dynamic video ID resolution |
| **Impact Engine** | Rule-based India Stability Index (0–100) with risk gauges across economy, security, infrastructure, and diplomatic factors |
| **Gold & Silver** | Live precious metal prices (INR/10g) with movement reasons, trend sparks, and market context |
| **War Room** | Real-time war intelligence feed across 8 active conflict theaters — updated every 5 seconds with severity scoring, casualty estimates, India impact analysis, and OSINT verification status |
| **Weather & AQI** | Temperature, conditions, and air quality for major Indian cities |
| **Oil & Currency** | Brent crude, WTI, and INR exchange rates against USD, EUR, GBP, JPY, CNY |
| **Infrastructure** | Status of major ports, airports, highways, power grid, and internet backbone |
| **Conflicts** | Global conflict zones with India-specific geopolitical impact assessment |
| **Alerts** | Threshold-based intelligent notifications with toast popups and priority queuing |

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     CLIENT (React)                       │
│  Vite 7 · React 19 · Tailwind CSS 4 · Framer Motion     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ StockPanel│ │ WarPanel │ │ MapPanel │ │ LiveTV   │    │
│  │ NewsFeed │ │ GoldPanel│ │ Impact   │ │ Weather  │    │
│  │ Conflicts│ │ Silver   │ │ OilFX    │ │ Infra    │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
│              useSocket() — socket.io-client              │
└──────────────────┬───────────────────────────────────────┘
                   │ WebSocket (real-time)
                   │ REST API (fallback)
┌──────────────────▼───────────────────────────────────────┐
│                    SERVER (Node.js)                       │
│  Express 5 · Socket.IO 4 · Winston Logger                │
│  ┌──────────────────────────────────────────────────┐    │
│  │              Socket Dispatcher                    │    │
│  │   Emits on connect · Broadcasts deltas on tick   │    │
│  └──────────┬───────────────────────────────────────┘    │
│  ┌──────────▼───────────────────────────────────────┐    │
│  │              11 Data Services                     │    │
│  │  stock · news · weather · oil/currency · conflict │    │
│  │  infra · shipping · map · gold · silver · war     │    │
│  └──────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────┐    │
│  │  Impact Engine · Cache Layer · Delta Diffing      │    │
│  └──────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────┐    │
│  │  Live TV Service (YouTube scraper, 5-min refresh) │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Backend
| Technology | Purpose |
|:-----------|:--------|
| **Node.js** | Runtime |
| **Express 5** | REST API framework |
| **Socket.IO 4** | Real-time WebSocket layer |
| **Winston** | Structured logging |
| **Axios** | HTTP client for external APIs |
| **node-cron** | Scheduled tasks |
| **dotenv** | Environment configuration |

### Frontend
| Technology | Purpose |
|:-----------|:--------|
| **React 19** | UI framework |
| **Vite 7** | Build tool and dev server |
| **Tailwind CSS 4** | Utility-first styling (v4 plugin mode) |
| **Framer Motion** | Cinematic animations and transitions |
| **Recharts** | Sparkline charts and data visualization |
| **Lucide React** | Consistent icon library |
| **Socket.IO Client** | WebSocket consumer |
| **date-fns** | Date formatting utilities |

---

## Quick Start

### Prerequisites

- **Node.js 18+** (22+ recommended)
- **npm 9+**

### 1. Clone the Repository

```bash
git clone https://github.com/saisuchindra/BharatPulse.git
cd BharatPulse
```

### 2. Start the Backend

```bash
cd server
npm install
npm start
```

The server starts at **http://localhost:4000**. Verify with:

```bash
curl http://localhost:4000/api/stocks
```

### 3. Start the Frontend

```bash
cd client
npm install
npm run dev
```

The dashboard opens at **http://localhost:5173**.

### 4. Open the Dashboard

Navigate to **http://localhost:5173** in your browser. All 12+ data streams connect automatically via WebSocket.

---

## Project Structure

```
BharatPulse/
├── server/
│   ├── index.js                          # Express + Socket.IO entry point
│   ├── package.json
│   └── src/
│       ├── config/
│       │   └── index.js                  # Environment & polling configuration
│       ├── engine/
│       │   └── impactEngine.js           # India Stability Index calculator
│       ├── middleware/
│       │   └── socketDispatcher.js       # WebSocket event hub & broadcast scheduler
│       ├── routes/
│       │   └── api.js                    # REST API endpoints (/api/*)
│       ├── services/
│       │   ├── stockService.js           # NIFTY, SENSEX, top stocks
│       │   ├── newsService.js            # Multi-source news aggregation
│       │   ├── weatherService.js         # Weather & AQI for Indian cities
│       │   ├── oilCurrencyService.js     # Brent, WTI, INR exchange rates
│       │   ├── conflictService.js        # Global conflict zones
│       │   ├── infraService.js           # Ports, airports, power grid
│       │   ├── shippingService.js        # Maritime shipping lanes
│       │   ├── mapService.js             # Geo-projected map markers
│       │   ├── preciousMetalService.js   # Gold & Silver with movement reasons
│       │   ├── warNewsService.js         # 8-theater war intelligence feed
│       │   └── livetvService.js          # Dynamic YouTube live stream resolver
│       └── utils/
│           ├── cache.js                  # In-memory data cache
│           ├── delta.js                  # State diffing for efficient updates
│           └── logger.js                 # Winston logger setup
│
├── client/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx                      # React entry point
│       ├── App.jsx                       # Router, layout, view compositions
│       ├── index.css                     # Tailwind v4 + design system tokens
│       ├── hooks/
│       │   ├── useSocket.js              # WebSocket state management hook
│       │   └── useWorldClock.js          # Multi-timezone clock hook
│       └── components/
│           ├── TopBar.jsx                # Header bar with clock & connection status
│           ├── SplashScreen.jsx          # Cinematic boot sequence
│           ├── StockPanel.jsx            # Live equity ticker
│           ├── NewsFeed.jsx              # Categorized news stream
│           ├── LiveTV.jsx                # YouTube live embed player
│           ├── MapPanel.jsx              # India geo-projected SVG map
│           ├── ImpactEngine.jsx          # Stability index dashboard
│           ├── WeatherPanel.jsx          # Weather & AQI cards
│           ├── OilCurrencyPanel.jsx      # Crude oil & forex rates
│           ├── InfraPanel.jsx            # Infrastructure status grid
│           ├── ConflictPanel.jsx         # Conflict zone tracker
│           ├── GoldPanel.jsx             # Gold price with reasons
│           ├── SilverPanel.jsx           # Silver price with reasons
│           ├── WarPanel.jsx              # Real-time war intelligence feed
│           └── AlertPanel.jsx            # Notification system
│
├── .gitignore
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/stocks` | NIFTY, SENSEX, top 10 stocks |
| `GET` | `/api/news` | Categorized news headlines |
| `GET` | `/api/weather` | Weather & AQI for major cities |
| `GET` | `/api/oil` | Brent & WTI crude oil prices |
| `GET` | `/api/currency` | INR exchange rates (USD, EUR, GBP, JPY, CNY) |
| `GET` | `/api/conflicts` | Active global conflict zones |
| `GET` | `/api/infra` | Infrastructure status (ports, airports, grid) |
| `GET` | `/api/shipping` | Maritime shipping lane data |
| `GET` | `/api/map` | Geo-projected map marker data |
| `GET` | `/api/impact` | India Stability Index & risk factors |
| `GET` | `/api/gold` | Gold price, trend, movement reason |
| `GET` | `/api/silver` | Silver price, trend, movement reason |
| `GET` | `/api/war` | War bulletins across 8 conflict theaters |
| `GET` | `/api/livetv` | Live YouTube stream URLs for 5 channels |

---

## WebSocket Events

All data streams are pushed to connected clients in real time via Socket.IO:

| Event | Interval | Payload |
|:------|:---------|:--------|
| `stocks` | 15s | Market data with price history |
| `news` | 30s | Latest headlines by category |
| `weather` | 5min | City weather & AQI readings |
| `oil` | 60s | Crude oil prices |
| `currency` | 30s | Forex rates |
| `conflicts` | 2min | Conflict zone updates |
| `infra` | 60s | Infrastructure health |
| `shipping` | 60s | Shipping lane status |
| `map` | 60s | Map marker positions |
| `impact` | 30s | Stability index recalculation |
| `gold` | 10s | Gold price + reason |
| `silver` | 10s | Silver price + reason |
| `war` | 5s | War bulletins (1–3 per tick) |
| `livetv` | 5min | Refreshed YouTube live stream IDs |
| `alerts` | Event-driven | Threshold breach notifications |

---

## War Room — Conflict Theaters

The War Room tracks 8 active conflict zones with second-by-second intelligence bulletins:

| Theater | Region | Severity |
|:--------|:-------|:---------|
| **Iran–Israel–US War** | Middle East / Persian Gulf | 🔴 CRITICAL (9/10) |
| **Russia–Ukraine** | Eastern Europe | 🔴 HIGH (8/10) |
| **Israel–Palestine** | Gaza / West Bank | 🔴 HIGH (8/10) |
| **Red Sea / Houthi** | Yemen / Bab el-Mandeb | 🟠 HIGH (7/10) |
| **Myanmar Civil War** | Southeast Asia | 🟡 MEDIUM (6/10) |
| **Sudan Crisis** | East Africa | 🟡 MEDIUM (6/10) |
| **South China Sea** | Indo-Pacific | 🟡 MEDIUM (5/10) |
| **India–China LAC** | Ladakh / Arunachal | 🟡 MEDIUM (5/10) |

Each bulletin includes: headline, body, source, severity, verification status (CONFIRMED / DEVELOPING / UNVERIFIED), casualty estimates, India impact analysis, and tags.

---

## Design System

BharatPulse uses a custom dark command-center theme:

| Token | Value | Usage |
|:------|:------|:------|
| `--pulse-bg` | `#0a0e17` | Page background |
| `--pulse-surface` | `#111827` | Card surfaces |
| `--pulse-surface-2` | `#1f2937` | Elevated surfaces |
| `--pulse-accent` | `#06b6d4` | Primary accent (cyan) |
| `--pulse-green` | `#10b981` | Positive / online |
| `--pulse-red` | `#ef4444` | Negative / critical |
| `--pulse-gold` | `#f59e0b` | Gold / warnings |

**Effects**: Glass morphism panels, animated grid background, scan-line overlay, breathing glow animations, staggered entry transitions.

**Typography**: JetBrains Mono (monospace) throughout for a terminal/command-center feel.

---

## Configuration

Create a `server/.env` file to customize:

```env
# Server
PORT=4000
NODE_ENV=development

# API Keys (optional — simulated data works without these)
NEWS_API_KEY=
OPENWEATHER_API_KEY=
ALPHA_VANTAGE_KEY=
AQICN_API_KEY=
MAPBOX_TOKEN=

# Polling Intervals (ms)
STOCK_POLL_INTERVAL=15000
NEWS_POLL_INTERVAL=30000
WEATHER_POLL_INTERVAL=300000
OIL_POLL_INTERVAL=60000
CURRENCY_POLL_INTERVAL=30000
CONFLICT_POLL_INTERVAL=120000
INFRA_POLL_INTERVAL=60000
GOLD_POLL_INTERVAL=10000
SILVER_POLL_INTERVAL=10000
```

> **Note:** The system ships with high-fidelity simulated data for all modules. No API keys are required to run the full demo.

---

## Views

| View | Layout | Panels |
|:-----|:-------|:-------|
| **Dashboard** | 12-column grid, 6 rows | Map, Impact Engine, Stocks, News, Oil/FX, Gold/Silver, Conflicts, Infrastructure |
| **War Room** | 2/3 + 1/3 split | War Panel (main), Conflicts + Impact Engine (sidebar) |
| **Markets** | 4-column grid | Stocks, Oil/Currency, Gold, Silver |
| **News** | 2/3 + 1/3 split | News Feed, Live TV |
| **Live TV** | Full panel | 5-channel YouTube live embed |
| **Impact** | 4-column grid | Impact Engine, Conflicts, Oil/FX, Gold/Silver |
| **Map** | Full screen | SVG India map with multi-layer markers |
| **Weather** | Full panel | City weather cards + AQI |
| **Infrastructure** | Full panel | Port, airport, highway, grid, internet status |
| **Conflicts** | Full panel | Global conflict zone tracker |
| **Metals** | 2-column grid | Gold + Silver full panels |

---

## Scripts

### Server
```bash
npm start       # Start production server
npm run dev     # Start development server
```

### Client
```bash
npm run dev     # Start Vite dev server with HMR
npm run build   # Production build to dist/
npm run preview # Preview production build
npm run lint    # ESLint check
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License**.

---

<p align="center">
  <strong>BharatPulse</strong> — Live Intelligence. Real Impact.<br/>
  Built with ❤️ for India.
</p>
