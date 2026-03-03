import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

export function useSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [data, setData] = useState({
    stocks: null,
    news: null,
    weather: null,
    oil: null,
    currency: null,
    conflicts: null,
    shipping: null,
    infra: null,
    map: null,
    gold: null,
    silver: null,
    livetv: null,
    war: null,
    impact: null,
    alerts: [],
  });

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    const events = ['stocks', 'news', 'weather', 'oil', 'currency', 'conflicts', 'shipping', 'infra', 'map', 'gold', 'silver', 'livetv', 'war', 'impact'];

    events.forEach(event => {
      socket.on(event, (payload) => {
        setData(prev => ({ ...prev, [event]: payload }));
      });
    });

    socket.on('alerts', (newAlerts) => {
      setData(prev => ({
        ...prev,
        alerts: [...newAlerts, ...prev.alerts].slice(0, 50),
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const requestRefresh = useCallback((module) => {
    if (socketRef.current) {
      socketRef.current.emit('request:refresh', module);
    }
  }, []);

  return { connected, data, requestRefresh };
}
