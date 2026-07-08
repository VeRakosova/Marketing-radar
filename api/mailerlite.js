// Vercel serverless funkcia: z vybraných noviniek vytvorí v MailerLite kampaň.
// Vercel ju automaticky sprístupní na /api/mailerlite.
// Volanie z appky:  POST /api/mailerlite   telo: { items: [...] }
//
// Nastav v Vercel (Project → Settings → Environment Variables):
//   MAILERLITE_API_KEY     = API kľúč z MailerLite (Integrations → API)
//   MAILERLITE_FROM_EMAIL  = overená odosielateľská e-mailová adresa v MailerLite
//   MAILERLITE_FROM_NAME   = (voliteľné) meno odosielateľa, napr. "Marketing Radar"
//   MAILERLITE_GROUP_ID    = (voliteľné) id skupiny príjemcov (potrebné pri auto-odoslaní)
//   MAILERLITE_AUTOSEND    = (voliteľné) "true" = kampaň sa rovno odošle; inak ostane KONCEPT
//
// Bezpečné predvolené správanie: vytvorí sa iba KONCEPT kampane. Ty si ju v MailerLite
// skontroluješ a odošleš ručne. Automatické odoslanie zapneš len cez MAILERLITE_AUTOSEND=true.

const KEY = process.env.MAILERLITE_API_KEY;
const FROM = process.env.MAILERLITE_FROM_EMAIL;
const FROM_NAME = process.env.MAILERLITE_FROM_NAME || 'Marketing Radar';
const GROUP = process.env.MAILERLITE_GROUP_ID;
const AUTOSEND = String(process.env.MAILERLITE_AUTOSEND).toLowerCase() === 'true';

const BASE = 'https://connect.mailerlite.com/api';

function esc(s) {
  return String(s || '').replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])
  );
}

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric' });
}

function buildHtml(items) {
  const rows = items
    .map((it) => {
      const plats = Array.isArray(it.platforms) ? it.platforms.join(', ') : '';
      const srcs = Array.isArray(it.sources) ? it.sources.join(', ') : '';
      const meta = [plats, fmtDate(it.date)].filter(Boolean).join(' • ');
      return `
      <tr><td style="padding:0 0 20px">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e8f1;border-radius:12px">
          <tr><td style="padding:16px 18px">
            ${meta ? `<div style="font-size:12px;color:#8a93a6;margin-bottom:6px">${esc(meta)}</div>` : ''}
            <a href="${esc(it.link)}" style="font-size:17px;font-weight:700;color:#141824;text-decoration:none;line-height:1.35">${esc(it.title)}</a>
            ${it.desc ? `<div style="font-size:14px;color:#5c6373;margin-top:8px;line-height:1.5">${esc(String(it.desc).slice(0, 260))}</div>` : ''}
            ${srcs ? `<div style="font-size:12px;color:#8a93a6;margin-top:10px">Zdroj: ${esc(srcs)}</div>` : ''}
            <div style="margin-top:12px"><a href="${esc(it.link)}" style="font-size:13px;font-weight:600;color:#5b6cff;text-decoration:none">Čítať celý článok →</a></div>
          </td></tr>
        </table>
      </td></tr>`;
    })
    .join('');

  return `<!DOCTYPE html><html><body style="margin:0;background:#f5f6fb;font-family:Arial,Helvetica,sans-serif">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6fb"><tr><td align="center" style="padding:24px 12px">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
        <tr><td style="padding:0 0 18px">
          <div style="font-size:22px;font-weight:800;color:#141824">📡 VyBOOSTované novinky</div>
          <div style="font-size:13px;color:#5c6373;margin-top:4px">Vybrané novinky a zmeny z reklamných systémov</div>
        </td></tr>
        ${rows}
        <tr><td style="padding:8px 0 0;font-size:12px;color:#98a0b3">Vygenerované z aplikácie VyBOOSTované novinky.</td></tr>
      </table>
    </td></tr></table>
  </body></html>`;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Použi metódu POST.' });
    return;
  }
  if (!KEY || !FROM) {
    res.status(500).json({ error: 'Chýba MAILERLITE_API_KEY alebo MAILERLITE_FROM_EMAIL v premenných prostredia.' });
    return;
  }

  let items;
  try {
    const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    items = b.items;
  } catch (e) {
    res.status(400).json({ error: 'Neplatné dáta v požiadavke.' });
    return;
  }
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Neboli vybrané žiadne novinky.' });
    return;
  }

  const subject = `VyBOOSTované novinky — ${items.length} vybraných noviniek (${new Date().toLocaleDateString('sk-SK')})`;
  const headers = {
    Authorization: `Bearer ${KEY}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  try {
    // 1) vytvor kampaň (koncept)
    const body = {
      name: subject,
      type: 'regular',
      emails: [{ subject, from_name: FROM_NAME, from: FROM, content: buildHtml(items) }],
    };
    if (GROUP) body.groups = [GROUP];

    const cRes = await fetch(`${BASE}/campaigns`, { method: 'POST', headers, body: JSON.stringify(body) });
    const cData = await cRes.json().catch(() => ({}));
    if (!cRes.ok) {
      res.status(cRes.status).json({ error: 'MailerLite: ' + (cData.message || JSON.stringify(cData.errors || cData) || cRes.status) });
      return;
    }
    const id = cData.data && cData.data.id;

    // 2) voliteľne rovno odošli (len ak je zapnutá aj cieľová skupina)
    if (AUTOSEND && id && GROUP) {
      const sRes = await fetch(`${BASE}/campaigns/${id}/schedule`, {
        method: 'POST', headers, body: JSON.stringify({ delivery: 'instant' }),
      });
      const sData = await sRes.json().catch(() => ({}));
      if (!sRes.ok) {
        res.status(200).json({ ok: true, draft: true, id, warning: 'Koncept vytvorený, odoslanie zlyhalo: ' + (sData.message || sRes.status) });
        return;
      }
      res.status(200).json({ ok: true, sent: true, id });
      return;
    }

    res.status(200).json({ ok: true, draft: true, id });
  } catch (e) {
    res.status(502).json({ error: 'Chyba pri komunikácii s MailerLite: ' + e.message });
  }
};
