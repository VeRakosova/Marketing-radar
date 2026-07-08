// Vercel serverless funkcia: bezpečne stiahne RSS kanál na strane servera.
// Vercel ju automaticky sprístupní na /api/feed  (podľa názvu súboru).
//
// Volanie z appky:  /api/feed?url=<RSS adresa>

// Povolené domény — zabraňuje zneužitiu funkcie ako otvorenej proxy.
// Ak v index.html pridáš nový zdroj, dopíš sem jeho doménu.
const ALLOWED_DOMAINS = [
  'searchenginejournal.com',
  'searchengineland.com',
  'seroundtable.com',
  'hubspot.com',
  'socialmediatoday.com',
  'fb.com',
  'ppc.land',
  'seznam.cz',
  'mediaguru.cz',
  'marketingovenoviny.cz',
  'ecommercebridge.cz',
  'digichef.cz',
];

function isAllowed(hostname) {
  return ALLOWED_DOMAINS.some((d) => hostname === d || hostname.endsWith('.' + d));
}

module.exports = async (req, res) => {
  const target = req.query && req.query.url;

  if (!target) {
    res.status(400).send('Chýba parameter ?url=');
    return;
  }

  let host;
  try {
    host = new URL(target).hostname;
  } catch (e) {
    res.status(400).send('Neplatná URL');
    return;
  }

  if (!isAllowed(host)) {
    res.status(403).send('Doména nie je povolená: ' + host);
    return;
  }

  try {
    const r = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MarketingRadar/1.0; +https://vercel.app)',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    });
    const body = await r.text();

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=900'); // 15 min
    res.status(200).send(body);
  } catch (e) {
    res.status(502).send('Chyba sťahovania: ' + e.message);
  }
};
