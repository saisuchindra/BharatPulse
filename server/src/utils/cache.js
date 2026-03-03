/**
 * In-memory cache with TTL support.
 * Falls back gracefully when Redis is unavailable.
 */
class CacheManager {
  constructor() {
    this.store = new Map();
    this.ttls = new Map();
  }

  set(key, value, ttlMs = 60000) {
    this.store.set(key, value);
    if (this.ttls.has(key)) clearTimeout(this.ttls.get(key));
    const timer = setTimeout(() => {
      this.store.delete(key);
      this.ttls.delete(key);
    }, ttlMs);
    this.ttls.set(key, timer);
  }

  get(key) {
    return this.store.get(key) || null;
  }

  has(key) {
    return this.store.has(key);
  }

  delete(key) {
    this.store.delete(key);
    if (this.ttls.has(key)) {
      clearTimeout(this.ttls.get(key));
      this.ttls.delete(key);
    }
  }

  clear() {
    for (const timer of this.ttls.values()) clearTimeout(timer);
    this.store.clear();
    this.ttls.clear();
  }
}

module.exports = new CacheManager();
