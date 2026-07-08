// Serverless funkcia: bezpečne stiahne RSS kanál na strane servera
// a vráti ho appke. Vďaka tomu nie je potrebná verejná CORS proxy.
//
// Volanie z appky:  /api/feed?url=<RSS adresa>
// (presmerovanie /api/feed -> táto funkcia je nastavené v netlify.toml)

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
  return ALLOWED_DOMAINS.some(
    (d) => hostname === d || hostname.endsWith('.' + d)
  );
}

exports.handler = async (event) => {
  const target = event.queryStringParameters && event.queryStringParameters.url;

  if (!target) {
    return { statusCode: 400, body: 'Chýba parameter ?url=' };
  }

  let host;
  try {
    host = new URL(target).hostname;
  } catch (e) {
    return { statusCode: 400, body: 'Neplatná URL' };
  }

  if (!isAllowed(host)) {
    return { statusCode: 403, body: 'Doména nie je povolená: ' + host };
  }

  try {
    const res = await fetch(target, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; MarketingRadar/1.0; +https://netlify.app)',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    });

    const body = await res.text();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        // krátka cache (15 min) — šetrí požiadavky, novinky ostávajú aktuálne
        'Cache-Control': 'public, max-age=900',
      },
      body,
    };
  } catch (e) {
    return { statusCode: 502, body: 'Chyba sťahovania: ' + e.message };
  }
};
