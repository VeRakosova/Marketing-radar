# 🔌 Napojenie Apify a MailerLite (na Vercel)

Tieto dve funkcie bežia **na serveri** — fungujú až **po nasadení online** (Vercel) a potrebujú tvoje
API kľúče. Kľúče sa zadávajú ako **premenné prostredia vo Vercel**, nikdy nie do kódu a nikam do chatu.

> Nasadenie appky: pozri `NASADENIE.md`. Premenné pridáš v **Project → Settings → Environment Variables**.
> Po pridaní/zmene premenných daj **Deployments → … → Redeploy** (aby sa načítali).

---

## 1) Apify (scrapovanie webov bez RSS)

Apify spustí „aktéra" (scraper), ktorý stiahne novinky z webu, čo nemá RSS. Naša funkcia
[`api/apify.js`](api/apify.js) prečíta výsledky **posledného úspešného behu** aktéra.

**Postup:**
1. Vytvor si účet na [apify.com](https://apify.com).
2. Vyber alebo vytvor aktéra, ktorý scrapuje požadovaný web (napr. **Web Scraper**, **Website Content Crawler**). Nastav mu, čo má sťahovať (URL, výber článkov).
3. Aktéra **naplánuj** (Schedules) napr. každú hodinu — tým sa výsledky pravidelne obnovujú.
4. Vo Vercel (Project → Settings → Environment Variables) pridaj:

| Premenná | Hodnota |
|---|---|
| `APIFY_TOKEN` | API token z Apify (Settings → Integrations → API) |
| `APIFY_ACTOR_ID` | id aktéra v tvare `username~nazov-aktera` (napr. `apify~website-content-crawler`) |

Appka potom pri „↻ Obnoviť" automaticky pridá aj Apify výsledky (zdroj **Apify (scraper)**).
Ak premenné nenastavíš, appka funguje ďalej len s RSS.

> Poznámka: aktér vracia rôzne polia — funkcia si sama nájde `title`, `url`, `date` a popis
> (`description`/`text`/`perex`…). Ak by tvoj aktér používal iné názvy polí, uprav funkciu `normalize` v `api/apify.js`.

---

## 2) MailerLite (odoslanie vybraných noviniek)

V appke zaškrtneš relevantné novinky a klikneš **„✉️ Odoslať do MailerLite"**. Funkcia
[`api/mailerlite.js`](api/mailerlite.js) z nich vytvorí newsletter.

**Bezpečné predvolené správanie:** vytvorí sa iba **KONCEPT kampane**. Skontroluješ ho v MailerLite a
odošleš ručne. Automatické odoslanie sa zapne len úmyselne (`MAILERLITE_AUTOSEND=true`).

**Postup:**
1. Účet na [mailerlite.com](https://www.mailerlite.com), over si odosielateľskú e-mailovú adresu
   (Settings → Sender / Domains).
2. Vytvor API kľúč (Integrations → API → Generate new token).
3. (Pre auto-odoslanie) zisti si **id skupiny** príjemcov (Subscribers → Groups).
4. Vo Vercel pridaj premenné:

| Premenná | Povinné | Hodnota |
|---|---|---|
| `MAILERLITE_API_KEY` | áno | API token z MailerLite |
| `MAILERLITE_FROM_EMAIL` | áno | overená odosielateľská adresa |
| `MAILERLITE_FROM_NAME` | nie | meno odosielateľa (napr. `Marketing Radar`) |
| `MAILERLITE_GROUP_ID` | nie* | id skupiny príjemcov (*povinné pri auto-odoslaní) |
| `MAILERLITE_AUTOSEND` | nie | `true` = rovno odoslať; inak ostane koncept |

Po odoslaní nájdeš kampaň v MailerLite v sekcii **Campaigns** (koncept, alebo odoslaná pri `AUTOSEND=true`).

---

## Ako to celé beží
1. **Zdroje** — RSS (SK/CZ + globálne) **+ Apify** pre weby bez RSS.
2. **Výber** — v appke ručne zaškrtneš relevantné novinky (spodná lišta ukazuje počet).
3. **Odoslanie** — tlačidlom sa z výberu vytvorí kampaň v MailerLite (koncept / odoslanie).

## Bezpečnosť
- API kľúče drž **len** v premenných prostredia Vercel. Nikdy ich nedávaj do `index.html`,
  do repozitára ani nikomu do správ.
- Ak by si kľúč omylom zverejnila, v Apify/MailerLite ho zneplatni a vygeneruj nový.
