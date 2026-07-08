# Marketing Radar 📡

Webová stránka, ktorá **naživo** sťahuje najnovšie novinky, zmeny a aktualizácie z reklamných platforiem
(Google Ads, Google Search, Meta Ads, TikTok, Microsoft Ads, Sklik, LinkedIn a ďalšie) a prehľadne ich
rozdeľuje **podľa mesiacov** a **podľa zdrojov**. Rovnakú novinku z viacerých webov automaticky **zoskupí do jednej položky**.

## Ako to spustiť
Nič sa neinštaluje. Stačí:

1. Otvoriť súbor **`index.html`** dvojklikom (otvorí sa v prehliadači — Chrome, Edge, Firefox…).
2. Novinky sa načítajú automaticky. Tlačidlom **↻ Obnoviť** stiahneš najnovší stav.

> Potrebné je pripojenie na internet — dáta sa ťahajú priamo z RSS kanálov jednotlivých webov.

## Čo stránka vie
- **Vždy aktuálne** — pri každom otvorení/obnovení sťahuje najnovšie články priamo od zdroja.
- **Rozdelenie podľa mesiacov** — najnovší mesiac je hore.
- **Filtre** — podľa reklamnej platformy (Google Ads, Meta, TikTok…) aj podľa zdroja (SEJ, SEL, HubSpot…).
- **Vyhľadávanie** — full-textové v titulkoch aj popisoch.
- **„Len zmeny“** — zobrazí len oznámenia o nových funkciách, spusteniach a zmenách.
- **Deduplikácia** — ak tú istú novinku napíše viac webov, zobrazí sa raz a pod ňou odkazy na všetky zdroje.

## Zdroje (weby)
- Search Engine Journal
- Search Engine Land
- Search Engine Roundtable
- HubSpot (Marketing blog)
- Social Media Today
- PPC Land (špecializované na Google/Meta/Microsoft/TikTok Ads)
- Sklik / Seznam blog

## Ako pridať / zmeniť zdroj alebo platformu
Otvor `index.html` v textovom editore a uprav na začiatku `<script>` sekcie:

- **`SOURCES`** — zoznam webov a ich RSS adries (`feeds`).
- **`PLATFORMS`** — reklamné platformy a kľúčové slová (`kw`), podľa ktorých sa novinky filtrujú a označujú.

Príklad pridania zdroja:
```js
{ name:'PPC Land', short:'PPCL', color:'#00b894', feeds:['https://ppc.land/rss/'] },
```

## Poznámka k sťahovaniu
Prehliadače z bezpečnostných dôvodov nedovolia stránke priamo čítať cudzie weby, preto sa použije
verejná „CORS proxy“ (allorigins / codetabs / corsproxy). Ak by jeden zdroj chvíľu nešiel, appka
automaticky skúsi ďalšiu proxy. Toto je bežné a bezpečné pre verejné RSS kanály.

## Chcete plnohodnotnú aplikáciu (vlastný server, história, e-mail upozornenia)?
Táto verzia beží celá v prehliadači bez inštalácie. Ak by ste chceli:
- ukladať históriu noviniek do databázy,
- posielať denný/týždenný súhrn na e-mail,
- alebo nasadiť to online na vlastnú doménu,

dá sa to dorobiť ako Node.js verzia — stačí povedať.
