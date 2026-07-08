# 🌍 Nasadenie appky Marketing Radar ako online web

Appka funguje v troch režimoch a **sama si vyberie** ten najlepší dostupný:

1. **Lokálne** – otvoríš `index.html` dvojklikom (ťahá dáta cez verejnú proxy).
2. **Online cez vlastnú serverless funkciu** – po nasadení na Netlify sťahuje RSS vlastný server (najspoľahlivejšie).
3. **Záloha** – ak by vlastná funkcia nešla, automaticky použije verejnú proxy.

Nižšie sú dva spôsoby, ako dostať appku online. **Odporúčam spôsob A.**

---

## ✅ Spôsob A – Netlify (odporúčané, zadarmo, aj s vlastnou funkciou)

Netlify je bezplatný hosting. Po nasadení dostaneš verejnú adresu, napr.
`https://marketing-radar.netlify.app`, ktorú môžeš zdieľať alebo napojiť na vlastnú doménu.

### Postup cez Netlify CLI (spoľahlivo nasadí aj serverless funkciu)
> Vyžaduje jednorazovo nainštalovaný Node.js z [nodejs.org](https://nodejs.org) (LTS verzia).

1. Nainštaluj Netlify CLI (stačí raz), v termináli / PowerShelli:
   ```
   npm install -g netlify-cli
   ```
2. Prejdi do priečinka s appkou:
   ```
   cd "C:\Users\Weřonik\Desktop\Veronika projekt"
   ```
3. Prihlás sa (otvorí sa prehliadač – účet Netlify si vytvoríš zadarmo cez GitHub/Google/e-mail):
   ```
   netlify login
   ```
4. Nasaď rovno do produkcie:
   ```
   netlify deploy --prod
   ```
   - Pri prvom spustení potvrď vytvorenie novej stránky (**Create & configure a new site**).
   - **Publish directory** nechaj `.` (bodka).
   - Na konci vypíše **Website URL** – to je tvoja adresa. Hotovo. 🎉

Pri každej ďalšej zmene stačí znova spustiť `netlify deploy --prod`.

### Alternatíva bez CLI – drag & drop
1. Otvor [app.netlify.com/drop](https://app.netlify.com/drop).
2. Presuň tam **celý priečinok** „Veronika projekt".
3. Dostaneš URL okamžite.
> Poznámka: drag & drop niekedy nenasadí serverless funkciu. Nevadí – appka sa
> automaticky prepne na záložnú verejnú proxy a funguje ďalej. Pre plnú funkciu
> (vlastný server) použi radšej CLI postup vyššie.

---

## ✅ Spôsob B – Vercel / Cloudflare Pages / GitHub Pages
Appka je obyčajný statický web, takže ju vieš nahrať kamkoľvek:

- **GitHub Pages / Cloudflare Pages / akýkoľvek statický hosting** – nahraj `index.html`.
  Serverless funkcia sa nepoužije, ale appka pobeží cez záložnú verejnú proxy.
- **Vercel** – funguje tiež; serverless funkciu by bolo treba prepísať do formátu Vercelu
  (rád dorobím, ak zvolíš Vercel).

---

## 🌐 Vlastná doména
Po nasadení na Netlify: **Site settings → Domain management → Add a custom domain**.
Zadáš svoju doménu a Netlify ťa prevedie nastavením (vrátane HTTPS zadarmo).

---

## 🔧 Keď pridáš nový zdroj
Ak v `index.html` (sekcia `SOURCES`) pridáš web s novým RSS, dopíš jeho **doménu** aj do
zoznamu `ALLOWED_DOMAINS` v súbore `netlify/functions/feed.js` – inak ju serverless
funkcia z bezpečnostných dôvodov odmietne stiahnuť.

---

## 📁 Čo ktorý súbor robí
| Súbor | Účel |
|---|---|
| `index.html` | Celá appka (vzhľad + logika sťahovania, filtrovania, zoskupovania). |
| `netlify/functions/feed.js` | Serverless funkcia – sťahuje RSS na strane servera. |
| `netlify.toml` | Konfigurácia Netlify (kde je web a funkcia, pekná adresa `/api/feed`). |
| `package.json` | Určuje verziu Node pre serverless funkciu. |
| `NAVOD.md` | Používateľský návod k appke. |
| `NASADENIE.md` | Tento návod na zverejnenie online. |
