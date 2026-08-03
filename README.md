# Kanbuk Website-Template

**Der technische Motor für Websites Wiener Kleinbetriebe.**

Dieses Repo ist **kein Design-Template**. Es legt fest, *wie* eine Seite gebaut sein
muss – Meta-Tags, Responsiveness, Sicherheit, DSGVO, Ladezeit, Recht. Es legt **nicht**
fest, wie sie aussieht.

**Das Design kommt aus [Claude Design](https://claude.ai/design).** Dort entsteht die
komplette Website visuell, mit allen Unterseiten und echten Inhalten. Der Motor setzt
sie technisch sauber um.

> Der Motor liefert die Mechanik, das Design den Lack.

Technik: **Astro**, rein statischer Build. Kein CMS, keine Datenbank, keine Cookies,
kein Tracking, kein Cookie-Banner.

---

## Der Ablauf

### 1 · Design bauen — *du, in Claude Design*

Neues Projekt anlegen, den Text aus [`vorlagen/design-briefing.md`](vorlagen/design-briefing.md)
einfügen, Lead-Daten dazugeben (Website-Link, Fotos, Speisekarte, Öffnungszeiten).
Gestalten, bis es passt. **Projekt-Link kopieren.**

Um Technik kümmerst du dich dort nicht – feste Pixel, Desktop-Layout, CDN-Schriften
sind egal. Das wird beim Portieren umgebaut.

> **Die Demo kann schon Schritt 1 sein:** Das Claude-Design-Projekt lässt sich
> dem Kunden direkt als Verkaufs-Demo zeigen (Vollbild-Vorschau, vor Ort oder
> per Bildschirmteilung) – 5–10 min Aufwand statt einer Stunde. Schritt 2 folgt
> dann erst bei Kauf oder ernsthaftem Interesse. **Schickbarer Link ohne Port:**
> In Claude Design „Export → Project archive" (gratis, sofort, alle Seiten),
> dann `npm run demo -- --datei "<Archiv.zip>" --kunde "<Name>"` – verpackt das
> Design als echte Mehrseiten-Demo (Kanbuk-Leiste, unsichtbar für Google,
> Handy-Hinweis, Sicht-Check je Seite) und macht sie per Vercel teilbar.
> (Der „Standalone HTML"-Export geht auch, kostet aber Claude-Kontingent.) Funktioniert im Template-Ordner UND in jedem
> frischen Kundenordner (sogar ohne `npm install`) – die Demo landet immer
> außerhalb in `kanbuk-demos/`, das Projekt bleibt sauber. Wer lieber gleich die echte Web-Vorschau
> will, macht Schritt 2 sofort. Alles ist vorgesehen.

### 2 · Technisch umsetzen — *Claude Code, ~30–45 min*

```bash
# Das Template liegt in der GitHub-Organisation Kanbuk – zieht es je um, nur diese Zeile anpassen.
npx degit Kanbuk/kanbuk-website-template kanbuk-kunden/<kunde>
cd kanbuk-kunden/<kunde>
npm install
```

**Ohne Terminal geht es auch:** leeren Kundenordner in VS Code öffnen, Claude Code
starten und schreiben: „Hol dir das Template von Kanbuk/kanbuk-website-template und
setze dann dieses Design um: <Claude-Design-Link>" – Claude erledigt den Rest und
stellt am Anfang einmal gebündelt die nötigen Fragen (Kundendaten, Zusätze).

Dann (bzw. im Terminal-Weg: Ordner in VS Code öffnen, Claude Code starten):

```
/port https://claude.ai/design/p/<projekt-id>
```

Ergebnis: **die fertige Seite** – echte Unterseiten, vollständig responsiv, SEO,
sicher, cookiefrei. Nur ohne Zugänge. Dann `/deploy` für die Vorschau-Domain.

> **Gilt für jedes Geschäftsmodell:** `demo`/`live` sind technische Modi, keine
> Vertriebsstufen. Beim Demo-Verkauf ist die Vorschau die Verkaufs-Demo; beim
> Direktkauf ist sie die **Abnahme-Vorschau** vor der Freigabe. Und weil jedes
> Kundenprojekt ein eigenständiges Repo ist, lässt es sich bei einem Vollkauf
> komplett übertragen (Repo, Hosting, Domain auf Konten des Kunden).
> Grenzen des Motors: Shop, Buchungssystem und Blog baut der jeweilige
> Projekt-Chat bei Bedarf auf dem Motor auf (CLAUDE.md 7a).
>
> **Selbst pflegen geht** – das stand hier lange als Grenze und stimmt nicht
> mehr: Für Betriebe, deren Bestand sich wöchentlich ändert (Fahrzeuge,
> Immobilien, Kurse, Zimmer), liegt ein Redaktions-Baustein bei
> (`redaktion/`, CLAUDE.md 6c). Er ist standardmäßig AUS und soll es bleiben:
> Bei einer Seite, die sich zweimal im Jahr ändert, sind zwei Anrufe billiger
> als ein System, das gewartet werden will.

### 3 · Kunde bucht (bzw. gibt frei) — *~15 min*

`STAND.md` im Kundenordner öffnen – dort steht, was noch offen ist. Der Kern:

1. `mode: 'live'` in `content.config.ts` (Header/Sitemap stellt der Build automatisch um)
2. Echte **Rechtstexte** (UID, Firmenbuch – Impressumspflicht) + offene Punkte aus `STAND.md`
3. `RESEND_API_KEY` + `CONTACT_FROM` setzen, Domain verbinden

```bash
npm run check -- --live   # muss grün sein
npx vercel --prod
```

> **Das ist die Kurzfassung, nicht die Liste.** Hier stand „nur noch drei Dinge" –
> hatte der Betrieb schon eine Website oder soll das Formular von einer eigenen
> Versand-Unterdomain senden, kommen Weiterleitungen, DNS-Einträge und die
> Region des Versanddienstes dazu. **Den vollständigen Ablauf hat der
> `/deploy`-Skill** (Weg B); der Projekt-Chat arbeitet ihn ab. Die 15 Minuten
> oben gelten für den einfachen Fall ohne Vorgänger-Website.

---

## Was der Motor mitbringt

| Bereich | Inhalt |
| --- | --- |
| **SEO** | Meta je Seite (Titel, Description, Canonical, OG), JSON-LD `LocalBusiness` mit maschinenlesbaren Öffnungszeiten, Sitemap, `hreflang` |
| **Responsiveness** | Fluide Token-Skala (350–1440 px). **Wo das Design einen Wert nennt, gewinnt der Wert** – die Skala greift, wo es schweigt (CLAUDE.md Abschnitt 4) |
| **Verhalten** | Tabs, Filter, Slider, Akkordeon, Lightbox, Mobilmenü, Vorher/Nachher, Dialog, Assistent – branchenneutral, unstyled |
| **Katalog** | Viele gleichartige Einträge (Fahrzeuge, Immobilien, Kurse, Zimmer) mit **eigener Adresse je Eintrag** samt Produkt-Schema, dazu Filter, Preisregler und Merkliste. Der größte SEO-Hebel bei einem Händler |
| **Bildzeichen** | Die vollständige Lucide-Bibliothek liegt im Repo – Symbole werden nie selbst gezeichnet |
| **Formulare** | Beliebig viele (Kontakt, Reservierung, Termin, Angebot) aus der Config, Honeypot, Resend, gestaltete Bestätigungsmail |
| **Selbst pflegen** | Optionaler Redaktions-Baustein für Betriebe mit wöchentlich wechselndem Bestand – standardmäßig aus |
| **Recht** | Impressum + Datenschutz (passen sich automatisch an), cookiefrei ab Werk |
| **Ausbau** | Pixel/Tracking und Maps/YouTube sind **vorbereitet** – siehe unten |
| **Weiterleitungen** | Alte Adressen → neue, rettet das Google-Ranking bei Vorgänger-Websites |
| **demo/live** | Ein Wort schaltet Balken, `tel:`, Indexierung, Sitemap, Header (das Formular bleibt in der Vorschau sichtbar, verschickt aber nichts) |
| **Sechs Tore** | `check`, `sicht`, `interaktion`, `browser`, `abgleich` – dazu `altgeraet` zum Ansehen. Keines darf übersprungen werden |

Verbindliche Regeln: **[CLAUDE.md](CLAUDE.md)** – inklusive Umrechnungstabelle
(Design-Pixel → Token) und Portier-Rezept.

---

## Später ausbauen (Pixel, Maps, …)

**Ab Werk ist die Seite cookiefrei und braucht keinen Banner.** Das ist Absicht: kein
Banner heißt bessere Bedienung und mehr Anfragen.

Will ein Kunde später **Meta-Pixel, Google Ads oder Analytics**, ist das ein
Config-Eintrag – kein Neubau. Der Motor bringt die Anschlüsse fertig mit:

```ts
dienste: [
  { id: 'meta-pixel', name: 'Meta-Pixel', anbieter: 'Meta Platforms Ireland Ltd.',
    kategorie: 'marketing', zweck: 'Messung von Werbeerfolgen',
    datenschutzUrl: 'https://www.facebook.com/privacy/policy/',
    setztCookies: true, skript: '…' },
],
```

Automatisch passiert dann: Einwilligungs-Banner erscheint, das Skript bleibt **bis zum
Ja des Besuchers geparkt** (Opt-in, DSGVO), und die Datenschutzerklärung nennt den
Dienst samt Widerruf. Das Design des Banners kommt aus Claude Design.

**Google Maps / YouTube / Instagram:** kein fester `<iframe>` (der lädt sofort und setzt
Cookies). Zwei Wege: statisches Kartenbild + Link (`npm run karte`, der Standard) oder
die **2-Klick-Einbettung** `<Einbettung>` – der Rahmen entsteht erst beim Klick.

Details: [CLAUDE.md, Abschnitt 7a](CLAUDE.md).

---

## Befehle

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Vorschau lokal (http://localhost:4321) |
| `npm run check` | **Das Prüf-Tor** – baut und prüft den Standard |
| `npm run check -- --live` | zusätzlich die Live-Pflichten |
| `npm run schrift -- --familie "<Name>"` | Google-Schrift lokal einbetten |
| `npm run karte -- --adresse "…"` | Statisches Kartenbild statt Maps-Rahmen |
| `npm run og -- --bild fotos/hero.jpg` | WhatsApp-/Social-Vorschaubild aus einem echten Foto |
| `npm run sicht` | **Sichtprüfung im echten Browser**: Screenshots 350/430/768/1440, Überlauf-/Abschneide-/Tippflächen-Messung, Text-Dump + Bögen |
| `npm run interaktion` | **Bedien-Prüfung** – fährt jeden Baustein real (Tabs, Menü, Akkordeon …); sagt am Ende, was auf dieser Seite NICHT vorkam |
| `npm run browser` | **Browser-Prüfung** – hält den Build gegen `browser-untergrenze.json` |
| `npm run abgleich` | **Design-Prüfung** – hält die gebaute Seite gegen die `.dc.html` |
| `npm run altgeraet` | Zeigt in Bildern, wie die Seite auf einem alten Browser **aussieht** |
| `npm run icons` | Symbol-Bibliothek neu holen (liegt schon im Repo – nur bei Versionswechsel) |
| `npm run maillogo` | Logo der Bestätigungsmail als PNG (SVG zeigen Mailprogramme nicht) |
| `npm run inhalte` | Gepflegte Inhalte und Bilder vom Redaktionsdienst holen (optional) |
| `npm run maske` | Eingabemaske für den Betrieb aus der Feldliste erzeugen (optional) |
| `npm run bogen -- --fotos` | Kontaktbögen: alle Fotos/Screenshots auf wenigen Übersichtsbildern |
| `npm run holen -- --url <…> --ziel fotos/x.jpg` | Datei herunterladen UND auf Unversehrtheit prüfen |
| `npm run preisliste` | `daten/preisliste.json` (aus Claude Design) validieren → typsichere `daten/preisliste.ts` |
| `npm run demo -- --datei <archiv.zip> --kunde "…"` | Design-Projekt-Archiv als schickbare Verkaufs-Demo hosten (ohne Port) |
| `npm run platzhalter -- --name "…"` | Textlose Platzhalter + OG-Bild + Favicon (nach `fotos/`) |
| `npm run stock -- --thema "…"` | Stock-Platzhalter (braucht `PEXELS_API_KEY` in `.env`) |

---

## Aufbau

```
content.config.ts        Motor-Schnittstelle: Betrieb, Design-Tokens, Seiten, Recht
STAND.md                 Gedächtnis des Projekts: Phase, Lücken-Inventar, Verlauf
fotos/                   >>> HIER kommen alle Bilder rein <<<  (siehe fotos/README.md)
src/
  styles/global.css      Token-Fundament (fluide Skala) – KEINE Design-Entscheidungen
  styles/fonts.css       lokale Schriften (pro Kunde via npm run schrift)
  lib/verhalten/         Verhaltens-Bausteine: Mechanik ohne Aussehen
  lib/theme.ts           Design-Tokens → CSS-Variablen (die Nahtstelle)
  layouts/BaseLayout     Meta, JSON-LD, hreflang, demo/live
  components/            Motor: DemoBar, Navigation, Formular
                         + die portierten Sektionen des Kunden
  pages/                 eine Datei je Unterseite
api/                    Formular-Endpunkt (Vercel)
scripts/                 check, schrift, karte, platzhalter, stock
vorlagen/                Design-Briefing für Claude Design
```

**Die Referenz-Seite** (`src/pages/index.astro`) zeigt die Bauweise und macht den
Standard vorführbar. Beim Kunden wird sie ersetzt.

---

## Deploy

**Vercel**: `npx vercel` für die Vorschau, `npx vercel --prod` für live.
`vercel.json` erzeugt der Build **automatisch** aus dem `mode` – dort ist nichts
von Hand zu ändern. Marken-Adresse anbinden mit
`npx vercel domains add <kunde>.kanbuk.com <projekt>` (Projekt-Domain, nie `alias set`).

Der Motor zielt bewusst **nur auf Vercel**. Frühere Unterstützung für Cloudflare
Pages / Netlify (zweiter Formular-Endpunkt, `_headers`, `_redirects`) ist
entfernt: nie genutzt, aber mitzupflegen – und dabei still kaputtgegangen.
Bei einem Host-Wechsel aus der Versionsgeschichte zurückholen.

Ein Klon ist **eigenständig – technisch garantiert**: `degit` kopiert nur Dateien,
ohne Git-Historie und ohne Verweis zurück. Ein Kundenprojekt ist also **kein Fork und
kein Branch** des Templates – auf GitHub ist nirgends sichtbar, dass es aus diesem
Template entstanden ist. Das private Kunden-Repo (entsteht bei Buchung über `/deploy`)
ist ein komplett unabhängiges Repository. Es gibt auch keine Updates vom Template
zurück in Kundenprojekte – das Template ist nur der Startpunkt.

---

## Besucherzahlen

Die Frage kommt von jedem Kunden. **Der Motor bringt dafür heute nichts mit.**

> Hier stand eine Anleitung mit dem Config-Feld `besucherzaehlung: 'vercel'`,
> das „automatisch den passenden Absatz in der Datenschutzerklärung ergänzt".
> **Dieses Feld gibt es nicht mehr** – es wurde entfernt, weil es einen Absatz
> über eine Reichweitenmessung schrieb, die gar nicht stattfand. Die Anleitung
> blieb stehen. Wer ihr folgte, schaltete beim Hoster die Messung scharf, trug
> ein Feld ein, das die Typprüfung ablehnt – und hatte am Ende eine
> Datenschutzerklärung, die von der Messung nichts weiß.

Soll ein Kunde Zahlen sehen, ist das ein **Ausbau** und läuft über die
Anschlüsse aus CLAUDE.md Abschnitt 7a: Dienst in `content.config.ts → dienste`
eintragen, dann erscheint er von selbst in der Datenschutzerklärung, und der
Einwilligungs-Banner kommt dazu.

**Vorher mit dem Kunden klären, was er wirklich will:** Ein Banner kostet
Bedienbarkeit und Anfragen, und die meisten Kleinbetriebe brauchen keine
Kampagnen-Auswertung. Die Zahl der Anfragen im Postfach ist oft die Kennzahl,
um die es wirklich geht.

---

## Wenn die Firma umbenennt (White-Label)

Das Kanbuk-Branding steckt an genau diesen Stellen – bei einer Umbenennung nur
diese anpassen:

| Stelle | Was |
| --- | --- |
| `src/components/DemoBar.astro` | Wortmarke, Zeichen (SVG) und Markenfarben des Vorschau-Balkens |
| `scripts/check.mjs` | `istTemplate`-Vergleich: `pkg.name === 'kanbuk-website-template'` |
| `package.json` | Template-Name + Konvention `kanbuk-<kunde>` beim Port |
| `src/lib/verhalten/einwilligung.ts` | localStorage-Schlüssel `kanbuk-einwilligung` |
| `astro.config.ts` / `scripts/karte.mjs` | interner Integrationsname / User-Agent (rein technisch) |
