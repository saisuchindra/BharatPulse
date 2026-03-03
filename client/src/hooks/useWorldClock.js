import { useState, useEffect, useCallback } from 'react';

const CITIES = [
  { name: 'IST', label: 'India', tz: 'Asia/Kolkata', primary: true },
  { name: 'NYC', label: 'New York', tz: 'America/New_York', primary: false },
  { name: 'LDN', label: 'London', tz: 'Europe/London', primary: false },
  { name: 'TYO', label: 'Tokyo', tz: 'Asia/Tokyo', primary: false },
  { name: 'DXB', label: 'Dubai', tz: 'Asia/Dubai', primary: false },
];

const MARKET_HOURS = {
  'Asia/Kolkata': { open: [9, 15], close: [15, 30], name: 'NSE/BSE' },
  'America/New_York': { open: [9, 30], close: [16, 0], name: 'NYSE' },
  'Europe/London': { open: [8, 0], close: [16, 30], name: 'LSE' },
  'Asia/Tokyo': { open: [9, 0], close: [15, 0], name: 'TSE' },
  'Asia/Dubai': { open: [10, 0], close: [14, 0], name: 'DFM' },
};

export function useWorldClock() {
  const [clocks, setClocks] = useState([]);

  const updateClocks = useCallback(() => {
    const now = new Date();
    const updated = CITIES.map(city => {
      const timeStr = now.toLocaleTimeString('en-US', {
        timeZone: city.tz,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      const dateStr = now.toLocaleDateString('en-US', {
        timeZone: city.tz,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      const tzNow = new Date(now.toLocaleString('en-US', { timeZone: city.tz }));
      const hours = tzNow.getHours();
      const minutes = tzNow.getMinutes();
      const day = tzNow.getDay();
      const market = MARKET_HOURS[city.tz];
      const totalMin = hours * 60 + minutes;
      const openMin = market.open[0] * 60 + market.open[1];
      const closeMin = market.close[0] * 60 + market.close[1];
      const isWeekday = day > 0 && day < 6;
      const marketOpen = isWeekday && totalMin >= openMin && totalMin < closeMin;

      let nextOpenCountdown = '';
      if (!marketOpen) {
        let targetDate = new Date(tzNow);
        if (totalMin >= closeMin || !isWeekday) {
          targetDate.setDate(targetDate.getDate() + (isWeekday && totalMin >= closeMin ? 1 : (8 - day) % 7 || 7));
        }
        targetDate.setHours(market.open[0], market.open[1], 0, 0);
        const diff = targetDate - tzNow;
        if (diff > 0) {
          const h = Math.floor(diff / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          nextOpenCountdown = `${h}h ${m}m`;
        }
      }

      return {
        ...city,
        time: timeStr,
        date: dateStr,
        marketOpen,
        marketName: market.name,
        nextOpenCountdown,
      };
    });
    setClocks(updated);
  }, []);

  useEffect(() => {
    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, [updateClocks]);

  return clocks;
}
