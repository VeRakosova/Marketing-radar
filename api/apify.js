// Vercel serverless funkcia: načíta výsledky scrapovania z Apify a vráti ich appke.
// Vercel ju automaticky sprístupní na /api/apify.
//
// Nastav v Vercel (Project → Settings → Environment Variables):
//   APIFY_TOKEN      = tvoj API token z Apify (Settings → Integrations)
//   APIFY_ACTOR_ID   = id aktéra v tvare "username~actor-name" (napr. "apify~rss-scraper")
//
// Funkcia číta dataset z POSLEDNÉHO ÚSPEŠNÉHO behu daného aktéra. Odporúčaný postup:
// aktéra si na Apify naplánuješ (Schedules) napr. každú hodinu a táto funkcia už len
// prečíta jeho najnovšie výsledky (rýchle, neblokuje, nespotrebúva zbytočne kredity).

const TOKEN = process.env.APIFY_TOKEN;
const ACTOR = process.env.APIFY_ACTOR_ID;

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

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=600');

  // ak nie je nič nakonfigurované, vráť prázdno — appka pokojne beží ďalej len s RSS
  if (!TOKEN || !ACTOR) {
    res.status(200).json([]);
    return;
  }

  try {
    const url =
      `https://api.apify.com/v2/acts/${encodeURIComponent(ACTOR)}/runs/last/dataset/items` +
      `?token=${TOKEN}&status=SUCCEEDED&clean=true&format=json`;

    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!r.ok) {
      res.status(200).json([]);
      return;
    }

    const data = await r.json();
    if (!Array.isArray(data)) {
      res.status(200).json([]);
      return;
    }

    const items = data.map(normalize).filter((x) => x.title && x.url);
    res.status(200).json(items);
  } catch (e) {
    res.status(200).json([]);
  }
};
