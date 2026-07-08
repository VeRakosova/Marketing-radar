# 🌍 Nasadenie appky Marketing Radar na Vercel

Appka je statický web (`index.html`) + serverless funkcie v priečinku `api/`
(`/api/feed`, `/api/apify`, `/api/mailerlite`). Vercel toto zvládne bez ďalšej konfigurácie.

> Pozn.: súbory sú v GitHub repozitári vnorené v priečinku **`Veronika projekt`**, preto pri
> importe nastav **Root Directory** na `Veronika projekt` (viď nižšie).

---

## ✅ Nasadenie z GitHubu (odporúčané)

1. Prihlás sa na **[vercel.com](https://vercel.com)** (najlepšie účtom GitHub).
2. **Add New… → Project**.
3. Vyber repozitár **`Marketing-radar`** → **Import**.
4. V nastaveniach importu:
   - **Framework Preset:** `Other` (je to statický web).
   - **Root Directory:** klikni **Edit** a vyber / napíš `Veronika projekt`.
     *(Toto je dôležité — inak Vercel nenájde `index.html` ani priečinok `api/`.)*
5. Rozbaľ **Environment Variables** a pridaj kľúče pre Apify a MailerLite (viď `NAPOJENIE.md`).
   Môžeš ich pridať aj neskôr v *Project → Settings → Environment Variables*.
6. **Deploy**. Na konci dostaneš verejnú adresu, napr. `https://marketing-radar.vercel.app`.

Odteraz sa každou zmenou v GitHube (nový commit / nahraný súbor) web **automaticky prenasadí**.

---

## 🔁 Ako to funguje na Vercel
| Časť | Kde |
|---|---|
| Web (frontend) | `index.html` v koreni (Root Directory) — Vercel ho servíruje na `/` |
| Sťahovanie RSS | `api/feed.js` → dostupné na `/api/feed` |
| Apify scraper | `api/apify.js` → `/api/apify` |
| Odoslanie do MailerLite | `api/mailerlite.js` → `/api/mailerlite` |

Vercel funkcie z priečinka `api/` sprístupní automaticky podľa názvu súboru — netreba žiadne
presmerovania ani konfiguračný súbor.

---

## 🌐 Vlastná doména
Vo Vercel: **Project → Settings → Domains → Add**. Zadáš doménu a Vercel ťa prevedie
nastavením DNS (vrátane HTTPS zadarmo).

---

## 🔧 Keď pridáš nový RSS zdroj
Ak v `index.html` (sekcia `SOURCES`) pridáš web s novým RSS, dopíš jeho **doménu** aj do
zoznamu `ALLOWED_DOMAINS` v súbore `api/feed.js` — inak ju funkcia z bezpečnostných dôvodov
odmietne stiahnuť.

---

## 📁 Čo ktorý súbor robí
| Súbor | Účel |
|---|---|
| `index.html` | Celá appka (vzhľad + logika sťahovania, filtrovania, zoskupovania, výberu a odoslania). |
| `api/feed.js` | Serverless funkcia – sťahuje RSS na strane servera. |
| `api/apify.js` | Serverless funkcia – načíta výsledky z Apify scrapera. |
| `api/mailerlite.js` | Serverless funkcia – z vybraných noviniek vytvorí kampaň v MailerLite. |
| `NAPOJENIE.md` | Návod na napojenie Apify a MailerLite (premenné prostredia). |
| `NAVOD.md` | Používateľský návod k appke. |
