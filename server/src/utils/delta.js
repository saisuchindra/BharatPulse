/**
 * Delta update utility: compares previous and current state,
 * returns only changed fields. Used to minimize WebSocket payload.
 */
function computeDelta(prev, curr) {
  if (!prev) return curr;
  if (typeof curr !== 'object' || curr === null) return curr;
  if (Array.isArray(curr)) {
    if (JSON.stringify(prev) !== JSON.stringify(curr)) return curr;
    return null;
  }

  const delta = {};
  let hasChange = false;

  for (const key of Object.keys(curr)) {
    if (JSON.stringify(prev[key]) !== JSON.stringify(curr[key])) {
      delta[key] = curr[key];
      hasChange = true;
    }
  }

  return hasChange ? delta : null;
}

/**
 * Rate limiter for API calls per service.
 */
class RateLimiter {
  constructor() {
    this.calls = new Map();
  }

  canCall(serviceKey, minIntervalMs) {
    const last = this.calls.get(serviceKey) || 0;
    const now = Date.now();
    if (now - last < minIntervalMs) return false;
    this.calls.set(serviceKey, now);
    return true;
  }
}

module.exports = { computeDelta, RateLimiter: new RateLimiter() };
