// Serverless funkcia: načíta výsledky scrapovania z Apify a vráti ich appke.
// Volanie z appky:  /api/apify   (presmerovanie nastavené v netlify.toml)
//
// Nastav v Netlify (Site settings -> Environment variables):
//   APIFY_TOKEN      = tvoj API token z Apify (Settings -> Integrations)
//   APIFY_ACTOR_ID   = id aktéra v tvare "username~actor-name" (napr. "apify~rss-scraper")
//
// Funkcia číta dataset z POSLEDNÉHO ÚSPEŠNÉHO behu daného aktéra. Odporúčaný postup:
// aktéra si na Apify naplánuješ (Schedules) napr. každú hodinu a táto funkcia už len
// prečíta jeho najnovšie výsledky (rýchle, neblokuje, nespotrebúva zbytočne kredity).

const TOKEN = process.env.APIFY_TOKEN;
const ACTOR = process.env.APIFY_ACTOR_ID;

function json(statusCode, body, maxAge) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': `public, max-age=${maxAge || 600}`,
    },
    body: JSON.stringify(body),
  };
}

// Z ľubovoľného objektu z datasetu vytiahne titulok / odkaz / dátum / popis.
function normalize(d) {
  const pick = (...keys) => {
    for (const k of keys) {
      if (d && d[k] != null && String(d[k]).trim() !== '') return String(d[k]).trim();
    }
    return '';
  };
  return {
    title: pick('title', 'name', 'headline', 'heading'),
    url: pick('url', 'link', 'href', 'loadedUrl', 'pageUrl'),
    date: pick('date', 'pubDate', 'publishedAt', 'published', 'datePublished', 'dateModified', 'time'),
    description: pick('description', 'text', 'summary', 'content', 'excerpt', 'perex').slice(0, 800),
  };
}

exports.handler = async () => {
  // ak nie je nič nakonfigurované, vráť prázdno — appka pokojne beží ďalej len s RSS
  if (!TOKEN || !ACTOR) return json(200, []);

  try {
    const url =
      `https://api.apify.com/v2/acts/${encodeURIComponent(ACTOR)}/runs/last/dataset/items` +
      `?token=${TOKEN}&status=SUCCEEDED&clean=true&format=json`;

    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return json(200, []);

    const data = await res.json();
    if (!Array.isArray(data)) return json(200, []);

    const items = data.map(normalize).filter((x) => x.title && x.url);
    return json(200, items);
  } catch (e) {
    return json(200, []);
  }
};
