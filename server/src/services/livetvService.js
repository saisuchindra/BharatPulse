/**
 * Live TV Service – dynamically resolves current YouTube live-stream video IDs
 * for major Indian news channels.  Re-fetches every 5 minutes so embeds never
 * point at expired streams.
 */
const https = require('https');

const CHANNELS = [
  { id: 'ndtv',       name: 'NDTV 24x7',   handle: 'NDTV',          channelId: 'UCZFMm1mMw0F81Z37aaEzTUA' },
  { id: 'indiatoday', name: 'India Today',  handle: 'IndiaToday',    channelId: 'UCYPvAwZP8pZhSMW8qs7cVCw' },
  { id: 'timesnow',   name: 'Times Now',    handle: 'TimesNow',      channelId: 'UC6RJ7-PaXg6TIH2BzZfTV7w' },
  { id: 'republic',   name: 'Republic TV',  handle: 'republicworld', channelId: 'UCwqusr8YDwM-3mEYTDeJHzw' },
  { id: 'cnn18',      name: 'CNN-News18',   handle: 'CNNnews18',     channelId: 'UCef1-8eOpJgud7szVPlZQAQ' },
];

let cache = [];          // [{id, name, videoId, channelId, isLive, updatedAt}]
let refreshTimer = null;

/* ────── HTTP helper – follows up to 5 redirects ────── */
function httpGet(url, depth = 0) {
  return new Promise((resolve, reject) => {
    if (depth > 5) return reject(new Error('too many redirects'));
    const req = https.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let loc = res.headers.location;
        if (loc.startsWith('/')) loc = 'https://www.youtube.com' + loc;
        res.resume();
        return resolve(httpGet(loc, depth + 1));
      }
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve(body));
    });
    req.on('error', reject);
    req.setTimeout(12000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

/* ────── Resolve the current live videoId for one channel ────── */
async function resolveLiveId(channel) {
  try {
    const html = await httpGet(`https://www.youtube.com/@${channel.handle}/live`);
    const vidMatch = html.match(/"videoId"\s*:\s*"([a-zA-Z0-9_-]{11})"/);
    const isLive = html.includes('"isLive":true') || html.includes('"isLiveContent":true');
    return {
      id: channel.id,
      name: channel.name,
      channelId: channel.channelId,
      videoId: vidMatch ? vidMatch[1] : null,
      isLive: isLive && !!vidMatch,
      updatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error(`[LiveTV] Failed to resolve ${channel.name}: ${err.message}`);
    // Return stale cache entry if available
    const stale = cache.find((c) => c.id === channel.id);
    return stale || {
      id: channel.id,
      name: channel.name,
      channelId: channel.channelId,
      videoId: null,
      isLive: false,
      updatedAt: new Date().toISOString(),
    };
  }
}

/* ────── Refresh all channels ────── */
async function refreshAll() {
  const results = [];
  for (const ch of CHANNELS) {
    results.push(await resolveLiveId(ch));
  }
  cache = results;
  const liveCount = results.filter((r) => r.isLive).length;
  console.log(`[LiveTV] Refreshed – ${liveCount}/${results.length} channels live`);
  return cache;
}

/* ────── Public API ────── */
function getLiveTvData() {
  return cache.length ? cache : CHANNELS.map((ch) => ({
    id: ch.id,
    name: ch.name,
    channelId: ch.channelId,
    videoId: null,
    isLive: false,
    updatedAt: null,
  }));
}

function startAutoRefresh(intervalMs = 5 * 60 * 1000) {
  // Initial fetch
  refreshAll();
  // Periodic refresh
  refreshTimer = setInterval(refreshAll, intervalMs);
  return refreshTimer;
}

function stopAutoRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);
}

module.exports = { getLiveTvData, refreshAll, startAutoRefresh, stopAutoRefresh };
