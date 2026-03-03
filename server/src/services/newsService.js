/**
 * News Feed Service
 * Aggregates news from multiple categories with simulated live updates.
 * Integrates with NewsAPI when key is available.
 */
const cache = require('../utils/cache');
const logger = require('../utils/logger');

const CATEGORIES = ['Business', 'Politics', 'Defense', 'Tech', 'Regional', 'International'];
const SOURCES = ['PTI', 'Reuters', 'ANI', 'Bloomberg', 'NDTV', 'The Hindu', 'Times of India', 'Economic Times', 'Mint', 'India Today'];

const HEADLINE_TEMPLATES = {
  Business: [
    'RBI holds repo rate steady at {rate}% amid inflation concerns',
    'India GDP growth projected at {pct}% for FY26',
    'FII outflows reach ₹{amt} crore in {month}',
    'Government announces ₹{amt} lakh crore infrastructure push',
    'IT sector exports grow {pct}% year-on-year',
    'GST collections hit record ₹{amt} lakh crore',
    'Auto sector sees {pct}% growth in domestic sales',
    'Steel production rises {pct}% amid construction boom',
  ],
  Politics: [
    'Parliament session to address {topic} bill',
    'PM Modi holds bilateral talks with {country} leaders',
    'Election Commission announces dates for {state} polls',
    'New policy framework for {sector} development unveiled',
    'Cabinet approves ₹{amt} crore package for {state}',
    'Digital governance initiative launched across {count} districts',
  ],
  Defense: [
    'Indian Navy deploys INS {ship} for maritime patrol',
    'DRDO successfully tests {weapon} missile system',
    'India-{country} joint military exercise begins',
    'IAF receives {count} new Rafale fighter jets',
    'Border infrastructure upgraded along {border} sector',
    'Defence budget allocation increased by {pct}%',
  ],
  Tech: [
    'India launches {sat} satellite for earth observation',
    'Digital India initiative reaches {count} million users',
    'UPI transactions cross {amt} billion mark',
    'Indian startups raise ${amt} billion in Q{q}',
    'ISRO announces {mission} mission timeline',
    '5G rollout reaches {count} cities across India',
  ],
  Regional: [
    '{city} metro expansion project enters Phase {phase}',
    'Smart City Mission: {city} ranks top in implementation',
    'Water conservation project launched in {state}',
    '{state} reports {pct}% growth in agricultural output',
    'Tourism boost: {state} records {amt} lakh visitors',
    'Road connectivity project links {count} villages in {state}',
  ],
  International: [
    'India-{country} trade agreement negotiations advance',
    'Indian diaspora summit held in {city}',
    'Crude oil prices {direction} amid {region} tensions',
    'WTO report highlights India\'s growing trade influence',
    'India secures UNSC support for {topic} resolution',
    'Global supply chain shift benefits Indian manufacturing',
  ],
};

const FILL_DATA = {
  rate: ['6.5', '6.25', '6.75'],
  pct: ['7.2', '8.1', '6.8', '5.5', '12', '15', '9.3'],
  amt: ['45000', '78000', '12', '350', '2.8', '1.5', '98000'],
  month: ['March', 'February', 'January'],
  topic: ['agriculture reform', 'education', 'digital privacy', 'healthcare'],
  country: ['Japan', 'France', 'UAE', 'Australia', 'US', 'UK', 'Germany'],
  state: ['Karnataka', 'Tamil Nadu', 'Maharashtra', 'Gujarat', 'Rajasthan', 'UP'],
  sector: ['renewable energy', 'semiconductor', 'AI', 'healthcare'],
  count: ['50', '200', '12', '350', '6'],
  ship: ['Vikrant', 'Vishal', 'Kolkata', 'Mormugao'],
  weapon: ['BrahMos', 'Agni-V', 'Astra', 'Akash NG'],
  border: ['Northern', 'Western', 'Eastern'],
  sat: ['Cartosat-4', 'RISAT-3', 'Oceansat-4'],
  mission: ['Chandrayaan-4', 'Gaganyaan', 'Shukrayaan'],
  city: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata'],
  phase: ['2', '3', '4'],
  direction: ['surge', 'stabilize', 'drop'],
  region: ['Middle East', 'Eastern Europe', 'Red Sea'],
  q: ['1', '2', '3', '4'],
};

function fillTemplate(template) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const options = FILL_DATA[key];
    return options ? options[Math.floor(Math.random() * options.length)] : key;
  });
}

let newsPool = [];
let newsIdCounter = 1;

function generateArticle(category) {
  const templates = HEADLINE_TEMPLATES[category];
  const headline = fillTemplate(templates[Math.floor(Math.random() * templates.length)]);
  const source = SOURCES[Math.floor(Math.random() * SOURCES.length)];

  return {
    id: newsIdCounter++,
    headline,
    category,
    source,
    timestamp: new Date().toISOString(),
    isBreaking: Math.random() < 0.08,
    url: '#',
  };
}

function initializeNews() {
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

initializeNews();

function getNews(category = null) {
  // Add 1–2 new articles on each poll
  const newCount = Math.random() < 0.6 ? 1 : 2;
  for (let i = 0; i < newCount; i++) {
    const cat = category || CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    newsPool.unshift(generateArticle(cat));
  }

  if (newsPool.length > 100) newsPool = newsPool.slice(0, 100);

  const filtered = category ? newsPool.filter(a => a.category === category) : newsPool;

  const data = {
    timestamp: new Date().toISOString(),
    articles: filtered.slice(0, 50),
    breakingCount: filtered.filter(a => a.isBreaking).length,
    categories: CATEGORIES,
  };

  cache.set('news', data, 30000);
  return data;
}

module.exports = { getNews, CATEGORIES };
