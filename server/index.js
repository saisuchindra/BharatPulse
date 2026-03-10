/**
 * BharatPulse Server
 * Live Intelligence. Real Impact.
 */
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const config = require('./src/config');
const logger = require('./src/utils/logger');
const apiRoutes = require('./src/routes/api');
const { setupWebSocket } = require('./src/middleware/socketDispatcher');
const { startAutoRefresh } = require('./src/services/livetvService');

const app = express();
const server = http.createServer(app);

// CORS configuration
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173']
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(express.json());

// API routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    service: 'BharatPulse Intelligence Server',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
  });
});

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Initialize WebSocket dispatcher
setupWebSocket(io);

// Start Live TV auto-refresh (fetches current YouTube live stream IDs every 5 min)
startAutoRefresh();

// Start server
server.listen(config.port, () => {
  logger.info(`
  ╔══════════════════════════════════════════╗
  ║     BHARAT PULSE INTELLIGENCE SERVER     ║
  ║     Live Intelligence. Real Impact.      ║
  ╠══════════════════════════════════════════╣
  ║  Status:  ONLINE                         ║
  ║  Port:    ${String(config.port).padEnd(33)}║
  ║  Mode:    ${String(config.env).padEnd(33)}║
  ║  WS:      Active                         ║
  ╚══════════════════════════════════════════╝
  `);
});

module.exports = { app, server, io };
