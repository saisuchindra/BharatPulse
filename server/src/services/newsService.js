/**
 * News Feed Service
 * Fetches real news from RSS feeds of major Indian news sources (free, no key).
 * Falls back to template-generated headlines if RSS fails.
 */
const axios = require('axios');
const cache = require('../utils/cache');
const logger = require('../utils/logger');

const CATEGORIES = ['Business', 'Politics', 'Defense', 'Tech', 'Regional', 'International'];

// ── RSS Feeds (all free, no key needed) ──
const RSS_FEEDS = [
  { url: 'https://economictimes.indiatimes.com/rssfeedstopstories.cms', source: 'Economic Times', category: 'Business' },
  { url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms', source: 'ET Markets', category: 'Business' },
  { url: 'https://feeds.feedburner.com/ndtvprofit-latest', source: 'NDTV Profit', category: 'Business' },
  { url: 'https://timesofindia.indiatimes.com/rssfeeds/1221656.cms', source: 'Times of India', category: 'Politics' },
  { url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms', source: 'TOI India', category: 'Politics' },
  { url: 'https://www.thehindu.com/news/national/feeder/default.rss', source: 'The Hindu', category: 'Politics' },
  { url: 'https://feeds.feedburner.com/ndtvnews-top-stories', source: 'NDTV', category: 'International' },
  { url: 'https://timesofindia.indiatimes.com/rssfeeds/4719148.cms', source: 'TOI Tech', category: 'Tech' },
  { url: 'https://www.thehindu.com/sci-tech/technology/feeder/default.rss', source: 'The Hindu Tech', category: 'Tech' },
  { url: 'https://timesofindia.indiatimes.com/rssfeeds/4719161.cms', source: 'TOI World', category: 'International' },
  { url: 'https://timesofindia.indiatimes.com/rssfeeds/784865811.cms', source: 'TOI Defence', category: 'Defense' },
  { url: 'https://www.thehindu.com/news/cities/feeder/default.rss', source: 'The Hindu Cities', category: 'Regional' },
];

let newsPool = [];
let newsIdCounter = 1;
let usingRealData = false;

// ── Parse RSS XML manually (simple parser without dependency) ──
function parseRssXml(xml, source, category) {
  const articles = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/) || [])[1] || (item.match(/<title>(.*?)<\/title>/) || [])[1] || '';
    const link = (item.match(/<link>(.*?)<\/link>/) || [])[1] || '#';
    const pubDate = (item.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || '';

    if (title && title.length > 10) {
      articles.push({
        id: newsIdCounter++,
        headline: title.replace(/<[^>]*>/g, '').trim(),
        category,
        source,
        timestamp: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        isBreaking: false,
        url: link,
      });
    }
  }
  return articles;
}

// ── Fetch real news from RSS feeds ──
async function fetchRealNews() {
  const allArticles = [];

  const fetchPromises = RSS_FEEDS.map(async (feed) => {
    try {
      const res = await axios.get(feed.url, {
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/rss+xml, application/xml, text/xml' },
        responseType: 'text',
      });
      const articles = parseRssXml(res.data, feed.source, feed.category);
      return articles.slice(0, 10); // Max 10 per feed
    } catch (err) {
      return [];
    }
  });

  const results = await Promise.all(fetchPromises);
  results.forEach(articles => allArticles.push(...articles));

  if (allArticles.length > 0) {
    // Sort by date, newest first
    allArticles.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Mark the top 3 most recent as breaking
    allArticles.slice(0, 3).forEach(a => { a.isBreaking = true; });

    newsPool = allArticles.slice(0, 100);
    usingRealData = true;
    logger.info(`[News] ✓ Fetched ${allArticles.length} real articles from ${RSS_FEEDS.length} RSS feeds`);
  } else {
    logger.warn('[News] All RSS feeds failed, using generated headlines');
    if (newsPool.length === 0) initFallbackNews();
  }
}

// ── Fallback: template-generated headlines ──
const SOURCES = ['PTI', 'Reuters', 'ANI', 'Bloomberg', 'NDTV', 'The Hindu', 'Times of India', 'Economic Times', 'Mint', 'India Today'];

const HEADLINE_TEMPLATES = {
  Business: [
    'RBI holds repo rate steady at {rate}% amid inflation concerns',
    'India GDP growth projected at {pct}% for FY26',
    'FII outflows reach ₹{amt} crore in {month}',
    'IT sector exports grow {pct}% year-on-year',
    'GST collections hit record ₹{amt} lakh crore',
  ],
  Politics: [
    'Parliament session to address {topic} bill',
    'PM Modi holds bilateral talks with {country} leaders',
    'Election Commission announces dates for {state} polls',
    'New policy framework for {sector} development unveiled',
  ],
  Defense: [
    'Indian Navy deploys INS {ship} for maritime patrol',
    'DRDO successfully tests {weapon} missile system',
    'India-{country} joint military exercise begins',
    'IAF receives {count} new Rafale fighter jets',
  ],
  Tech: [
    'India launches {sat} satellite for earth observation',
    'UPI transactions cross {amt} billion mark',
    'Indian startups raise ${amt} billion in Q{q}',
    'ISRO announces {mission} mission timeline',
  ],
  Regional: [
    '{city} metro expansion project enters Phase {phase}',
    'Smart City Mission: {city} ranks top in implementation',
    'Water conservation project launched in {state}',
  ],
  International: [
    'India-{country} trade agreement negotiations advance',
    'Crude oil prices {direction} amid {region} tensions',
    'Global supply chain shift benefits Indian manufacturing',
  ],
};

const FILL_DATA = {
  rate: ['6.5', '6.25', '6.75'], pct: ['7.2', '8.1', '6.8', '5.5'],
  amt: ['45000', '78000', '12', '350', '2.8'], month: ['March', 'February'],
  topic: ['agriculture reform', 'education', 'digital privacy'],
  country: ['Japan', 'France', 'UAE', 'Australia', 'US'],
  state: ['Karnataka', 'Tamil Nadu', 'Maharashtra', 'Gujarat'],
  sector: ['renewable energy', 'semiconductor', 'AI'],
  count: ['50', '200', '12'], ship: ['Vikrant', 'Vishal', 'Kolkata'],
  weapon: ['BrahMos', 'Agni-V', 'Astra'], sat: ['Cartosat-4', 'RISAT-3'],
  mission: ['Chandrayaan-4', 'Gaganyaan'], city: ['Mumbai', 'Delhi', 'Bangalore'],
  phase: ['2', '3', '4'], direction: ['surge', 'stabilize', 'drop'],
  region: ['Middle East', 'Eastern Europe'], q: ['1', '2', '3', '4'],
};

function fillTemplate(template) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const options = FILL_DATA[key];
    return options ? options[Math.floor(Math.random() * options.length)] : key;
  });
}

function generateArticle(category) {
  const templates = HEADLINE_TEMPLATES[category];
  return {
    id: newsIdCounter++,
    headline: fillTemplate(templates[Math.floor(Math.random() * templates.length)]),
    category,
    source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
    timestamp: new Date().toISOString(),
    isBreaking: Math.random() < 0.08,
    url: '#',
  };
}

function initFallbackNews() {
  newsPool = [];
  for (const cat of CATEGORIES) {
    for (let i = 0; i < 5; i++) {
      const article = generateArticle(cat);
      article.timestamp = new Date(Date.now() - Math.random() * 3600000).toISOString();
      newsPool.push(article);
    }
  }
  newsPool.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Initial fetch + refresh every 2 minutes
fetchRealNews();
setInterval(fetchRealNews, 120000);

function getNews(category = null) {
  if (newsPool.length === 0) initFallbackNews();

  // If using fallback, add new generated articles on each call
  if (!usingRealData) {
    const newCount = Math.random() < 0.6 ? 1 : 2;
    for (let i = 0; i < newCount; i++) {
      const cat = category || CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      newsPool.unshift(generateArticle(cat));
    }
    if (newsPool.length > 100) newsPool = newsPool.slice(0, 100);
  }

  const filtered = category ? newsPool.filter(a => a.category === category) : newsPool;

  const data = {
    timestamp: new Date().toISOString(),
    liveSource: usingRealData ? 'RSS Feeds' : 'Generated',
    articles: filtered.slice(0, 50),
    breakingCount: filtered.filter(a => a.isBreaking).length,
    categories: CATEGORIES,
  };

  cache.set('news', data, 30000);
  return data;
}

module.exports = { getNews, CATEGORIES };
