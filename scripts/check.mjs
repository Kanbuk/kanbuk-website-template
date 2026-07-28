/**
 * =============================================================================
 *  DAS PRÜF-TOR
 * =============================================================================
 *  Macht aus dem Regelwerk einen Motor: Ein Vorsatz kann gebrochen werden,
 *  ein rotes Skript nicht.
 *
 *  Prüft die FERTIG GEBAUTE Seite (dist/) – nicht den Quelltext. Damit fällt
 *  auf, was wirklich beim Besucher ankommt.
 *
 *      npm run check          (baut immer zuerst, dann prüft)
 *      npm run check -- --live   zusätzlich die Live-Pflichten
 *
 *  Rot = die Seite darf nicht raus.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const WURZEL = process.cwd();
const DIST = join(WURZEL, 'dist');
const CONFIG = join(WURZEL, 'content.config.ts');
const nurLive = process.argv.includes('--live');

/** Läuft der Check im Template selbst? Dann sind die Referenzdaten Absicht.
    Der /port-Skill trägt beim Kunden einen eigenen Namen ein -> ab dann streng. */
const pkg = existsSync(join(WURZEL, 'package.json'))
  ? JSON.parse(readFileSync(join(WURZEL, 'package.json'), 'utf-8'))
  : {};
const istTemplate = pkg.name === 'kanbuk-website-template';

const probleme = [];
const warnungen = [];
const fehler = (t) => probleme.push(t);
const warnung = (t) => warnungen.push(t);

// ---------------------------------------------------------------------------
//  Dateien einsammeln
// ---------------------------------------------------------------------------
function alleDateien(dir, treffer = []) {
  if (!existsSync(dir)) return treffer;
  for (const eintrag of readdirSync(dir)) {
    const p = join(dir, eintrag);
    if (statSync(p).isDirectory()) alleDateien(p, treffer);
    else treffer.push(p);
  }
  return treffer;
}

if (!existsSync(DIST)) {
  console.error('✗ dist/ fehlt. Bitte zuerst "npm run build" ausführen.');
  process.exit(1);
}

const dateien = alleDateien(DIST);
const htmlDateien = dateien.filter((f) => extname(f) === '.html');
const kurz = (f) => relative(DIST, f).replace(/\\/g, '/');

if (htmlDateien.length === 0) {
  console.error('✗ Keine HTML-Seiten in dist/ gefunden.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
//  1. KEINE EXTERNEN REQUESTS
//     Externe Schriften/Skripte/Bilder = fremde Server, Cookies, DSGVO-Problem
//     und langsamer. Alles muss lokal liegen.
// ---------------------------------------------------------------------------
const configTextFrueh = existsSync(CONFIG) ? readFileSync(CONFIG, 'utf-8') : '';
/** Die eigene Domain ist kein „fremder Server“ – canonical/hreflang zeigen absichtlich dorthin. */
const eigeneDomain = configTextFrueh.match(/domain:\s*['"]https?:\/\/([^'"/]+)/)?.[1];

const ERLAUBTE_HOSTS = [
  'schema.org', // JSON-LD-Kontext, wird nie geladen
  'www.w3.org', // SVG-Namensraum
  ...(eigeneDomain ? [eigeneDomain] : []),
];

/** rel-Werte, die nur VERWEISEN statt zu laden – die dürfen absolut sein. */
const NUR_VERWEIS = /\brel=["'](?:canonical|alternate|me|author|license|prev|next)["']/i;

for (const f of htmlDateien) {
  const html = readFileSync(f, 'utf-8');

  // Ladende Attribute mit externer URL (src/href in link/script/img/iframe)
  const ladend = html.matchAll(
    /<(?:link|script|img|iframe|source|video|audio)\b[^>]*?\b(?:src|href)=["'](https?:\/\/[^"']+)["'][^>]*>/gi,
  );
  for (const m of ladend) {
    if (NUR_VERWEIS.test(m[0])) continue; // canonical/hreflang laden nichts
    const host = new URL(m[1]).host;
    if (!ERLAUBTE_HOSTS.includes(host)) {
      fehler(`${kurz(f)}: lädt von einem fremden Server -> ${host}\n    ${m[1].slice(0, 90)}`);
    }
  }

  // @import und url() in eingebettetem CSS
  for (const m of html.matchAll(/@import\s+(?:url\()?["']?(https?:\/\/[^"')]+)/gi)) {
    fehler(`${kurz(f)}: CSS @import von extern -> ${m[1].slice(0, 90)}`);
  }
  for (const m of html.matchAll(/url\((["']?)(https?:\/\/[^"')]+)\1\)/gi)) {
    const host = new URL(m[2]).host;
    if (!ERLAUBTE_HOSTS.includes(host)) {
      fehler(`${kurz(f)}: CSS lädt von extern -> ${host}`);
    }
  }
}

/* CSS- UND JS-DATEIEN – bis 2026-07-27 der größte blinde Fleck.
   Geprüft wurde fast nur das HTML. Astro lagert aber ab einer gewissen Größe
   den allermeisten Stil in eigene .css-Dateien aus (bei einem echten Kunden-
   design rund 80 % davon) und bündelt alles Verhalten in .js – beides war für
   die Regeln unsichtbar. Ergebnis: Das zentrale Verkaufsargument „cookiefrei,
   kein Tracking, keine fremden Server" war nur auf dem HTML durchgesetzt, und
   feste Pixelbreiten fielen ausgerechnet dort nicht auf, wo die meisten davon
   stehen. */
const trackingMusterGlobal = /google-analytics|googletagmanager|gtag\(|fbq\(|_paq\.push|hotjar|clarity\.ms|matomo|plausible\.io|segment\.(?:io|com)|mixpanel|amplitude|tiktok.*pixel|snap.*pixel|linkedin.*insight/i;

/**
 * Feste Breite über 400px – der häufigste Portier-Fehler.
 *
 * Das `(?<!\()` ist der eigentliche Kniff: In `@media (min-width: 800px)` und
 * im `sizes`-Attribut eines Bildes (`sizes="(min-width: 800px) 50vw, 100vw"`)
 * steht `min-width` in RUNDEN KLAMMERN. Das ist keine feste Breite, sondern
 * genau die Umschaltstelle, die eine Seite erst responsiv macht. Ohne diese
 * Ausnahme meldete die Regel als Fehler, was CLAUDE.md Abschnitt 4
 * ausdrücklich vorschreibt – ein Wachhund, der den Briefträger durchlässt und
 * den Hausherrn beißt.
 *
 * `max-width` bleibt ebenfalls erlaubt: es begrenzt nur nach oben.
 *
 * Der Bindestrich in der Ausnahmeliste ist nicht schmückend: Ohne ihn fand der
 * Ausdruck das `width` MITTEN IN `min-width` – die Klammer stand dann zwei
 * Zeichen zu weit links, und die Ausnahme lief ins Leere. Genau so ist es beim
 * ersten Versuch passiert.
 */
const FESTE_BREITE = /(?<![-(\w])(?:min-)?width:\s*(\d{3,})px/gi;

for (const f of dateien.filter((f) => extname(f) === '.css')) {
  const css = readFileSync(f, 'utf-8');
  const name = kurz(f);
  for (const m of css.matchAll(/(?:@import\s+(?:url\()?|url\()\s*["']?(https?:\/\/[^"')]+)/gi)) {
    fehler(`${name}: lädt von extern -> ${m[1].slice(0, 90)}`);
  }
  // Feste Breiten – hier liegt der Großteil des Stils eines echten Designs.
  const breiten = new Set();
  for (const m of css.matchAll(FESTE_BREITE)) {
    if (Number(m[1]) > 400) breiten.add(m[1]);
  }
  if (breiten.size > 0) {
    fehler(
      `${name}: feste Breite(n) ${[...breiten].join('px, ')}px im ausgelieferten CSS – am Handy bricht das.\n` +
        `    Auf die Token-Skala umstellen (CLAUDE.md Abschnitt 4) oder min()/clamp() verwenden.`,
    );
  }
}

for (const f of dateien.filter((f) => extname(f) === '.js')) {
  const js = readFileSync(f, 'utf-8');
  const name = kurz(f);
  if (trackingMusterGlobal.test(js)) {
    fehler(
      `${name}: Tracking-Code im ausgelieferten JavaScript.\n` +
        `    Tracking darf nur über content.config.ts -> dienste laufen (dann bleibt es bis zur Einwilligung geparkt).`,
    );
  }
  if (/document\.cookie\s*=/.test(js)) {
    fehler(`${name}: setzt ein Cookie im JavaScript – die Seite muss cookiefrei bleiben (sonst Banner-Pflicht).`);
  }
  /* Fremde Server, die erst zur Laufzeit angefragt werden. Der eigene Host und
     bekannte Nicht-Ladeadressen (schema.org als JSON-LD-Kontext, w3.org als
     SVG-Namensraum) sind erlaubt; Kartenlinks stehen als href im HTML, nicht hier. */
  for (const m of js.matchAll(/["'`](https?:\/\/[^"'`\s]+)["'`]/g)) {
    let host;
    try { host = new URL(m[1]).host; } catch { continue; }
    if (ERLAUBTE_HOSTS.includes(host)) continue;
    // Google Maps taucht als Ziel der 2-Klick-Einbettung auf – die lädt erst
    // nach ausdrücklichem Klick und ist genau dafür gebaut.
    if (/^(www\.)?google\.[a-z.]+$/.test(host) && /maps/.test(m[1])) continue;
    fehler(
      `${name}: JavaScript spricht einen fremden Server an -> ${host}\n` +
        `    Externe Requests sind verboten (DSGVO + Ladezeit). Über <Einbettung> oder dienste lösen.`,
    );
  }
}

// ---------------------------------------------------------------------------
//  2. KEINE COOKIES, KEIN TRACKING, KEINE LIVE-MAPS
// ---------------------------------------------------------------------------
/**
 * Sind zustimmungspflichtige Dienste aktiv?
 *
 * Bewusst aus dem FERTIGEN BUILD abgeleitet, nicht aus dem Quelltext: Ein
 * Muster auf content.config.ts würde auch in Kommentaren und Typdefinitionen
 * anschlagen (Beispiel-Code!) und Fehlalarme erzeugen. Was gebaut wurde, lügt nicht.
 */
const hatDienste = htmlDateien.some((f) =>
  /<script[^>]+data-einwilligung=/i.test(readFileSync(f, 'utf-8')),
);

for (const f of htmlDateien) {
  const html = readFileSync(f, 'utf-8');
  const name = kurz(f);

  // <iframe> darf NIE fest im HTML stehen: er lädt sofort und setzt Cookies.
  // Erlaubt ist nur die 2-Klick-Einbettung – dort entsteht er erst beim Klick.
  if (/<iframe\b/i.test(html)) {
    fehler(
      `${name}: fest eingebauter <iframe> – lädt sofort und setzt Cookies.\n` +
        `    Anfahrt: "npm run karte" (statisches Bild). Muss es ein Rahmen sein: <Einbettung> (2-Klick).`,
    );
  }

  if (/document\.cookie\s*=/i.test(html)) {
    fehler(`${name}: setzt ein Cookie – die Seite muss cookiefrei bleiben (sonst Banner-Pflicht)`);
  }

  /* PDF-Links müssen halten, was ihr Text verspricht.
     Ein <a href="…​.pdf"> OHNE download-Attribut lädt nichts herunter – der
     Browser ÖFFNET das PDF (der Motor liefert es bewusst mit
     Content-Disposition: inline aus). Steht daneben trotzdem
     „herunterladen", verspricht die Seite etwas anderes, als sie tut.
     Für eine Speisekarte ist Öffnen ohnehin der richtige Weg: Niemand will
     die Karte im Downloads-Ordner sammeln, man will kurz hineinschauen.
     Soll wirklich heruntergeladen werden (Preisliste zum Aufheben, Formular
     zum Ausfüllen), gehört download ans <a> – dann passt der Text wieder. */
  for (const m of html.matchAll(/<a\b([^>]*href=["'][^"']*\.pdf[^"']*["'][^>]*)>([\s\S]{0,600}?)<\/a>/gi)) {
    const [, attrs, inhalt] = m;
    const text = inhalt.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const verspricht = /herunterladen|download|runterladen|speichern/i.test(text);
    const laedtWirklich = /\bdownload\b/i.test(attrs);
    if (verspricht && !laedtWirklich) {
      fehler(
        `${name}: PDF-Link sagt „${text.slice(0, 44)}", lädt aber nichts herunter – der Browser öffnet die Datei.\n` +
          `    Text auf „öffnen"/„ansehen" ändern (empfohlen) ODER download ans <a> setzen, wenn es wirklich ein Download sein soll.`,
      );
    }
  }

  /* Kartenlizenz: Wer ein Bild aus `npm run karte` einbindet, MUSS
     „Kartendaten © OpenStreetMap-Mitwirkende" sichtbar danebenstellen – das
     ist Bedingung der ODbL, nicht Höflichkeit. Ohne den Hinweis nutzt der
     Kunde fremde Kartendaten unlizenziert auf seiner Geschäftsseite. Bisher
     stand die Pflicht nur als Konsolen-Hinweis im Werkzeug. */
  if (/karte[.\w-]*\.(webp|jpe?g|png|avif)/i.test(html) && !/OpenStreetMap/i.test(html)) {
    fehler(
      `${name}: Kartenbild ohne Lizenzhinweis.
` +
        `    „Kartendaten © OpenStreetMap-Mitwirkende" muss sichtbar daneben stehen (ODbL-Pflicht).`,
    );
  }

  // Die EU-Streitbeilegungsplattform wurde am 20.07.2025 eingestellt
  // (VO (EU) 2024/3228). Ein Link darauf ist ein toter Pflicht-Link und
  // laut WKO zu entfernen – er darf nie wieder in ein Impressum rutschen.
  if (/ec\.europa\.eu\/consumers\/odr/i.test(html)) {
    fehler(
      `${name}: Link auf die eingestellte EU-Streitbeilegungsplattform (ec.europa.eu/consumers/odr).\n` +
        `    Die Plattform wurde am 20.07.2025 abgeschaltet – den Verweis ersatzlos entfernen.`,
    );
  }

  // Tracking-Code: nur erlaubt, wenn er als type="text/plain" geparkt ist
  // (dann führt der Browser ihn NICHT aus – erst nach der Einwilligung).
  const trackingMuster = /google-analytics|googletagmanager|gtag\(|fbq\(|_paq\.push|hotjar|clarity\.ms/i;
  if (trackingMuster.test(html)) {
    const skripte = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
    for (const [, attrs, inhalt] of skripte) {
      if (!trackingMuster.test(attrs + inhalt)) continue;
      const geparkt = /type=["']text\/plain["']/i.test(attrs) && /data-einwilligung=/i.test(attrs);
      if (!geparkt) {
        fehler(
          `${name}: Tracking-Code läuft OHNE Einwilligung.\n` +
            `    Muss als <script type="text/plain" data-einwilligung="marketing"> geparkt werden` +
            ` (content.config.ts -> dienste).`,
        );
        break;
      }
    }
  }

  // Wenn Dienste konfiguriert sind, MUSS der Banner da sein.
  if (hatDienste && !/data-einwilligung-banner/.test(html)) {
    fehler(`${name}: Dienste sind konfiguriert, aber der Einwilligungs-Banner fehlt`);
  }
}

// ---------------------------------------------------------------------------
//  2b. RECHTSSEITEN – die beiden einzigen Seiten, die in Österreich zwingend sind
//
//  Sie waren bis 2026-07-27 die EINZIGEN Seiten, die niemand kontrolliert hat:
//  Ein Build ohne Impressum und ohne Datenschutzerklärung lief grün durch, auch
//  mit --live. Beim Portieren passiert genau das leicht – das Design liefert
//  eine eigene Fußzeile, die Rechtslinks fallen dabei weg, und niemandem fällt
//  es auf, weil die Seite ja funktioniert. Haftbar ist dann der Kunde
//  (§ 5 ECG, § 25 MedienG), nicht das Werkzeug.
// ---------------------------------------------------------------------------
{
  const seiteDa = (name) =>
    htmlDateien.some((f) => kurz(f) === `${name}/index.html` || kurz(f) === `${name}.html`);

  for (const pflicht of ['impressum', 'datenschutz']) {
    if (!seiteDa(pflicht)) {
      fehler(
        `Die Seite /${pflicht} fehlt im Build – in Österreich ist sie Pflicht (§ 5 ECG, § 25 MedienG).\n` +
          `    Vorlage: src/pages/${pflicht}.astro aus dem Motor.`,
      );
    }
  }

  // Erreichbar heißt: von jeder normalen Seite aus verlinkt. Ausgenommen ist
  // NUR die 404-Seite – sie ist eine technische Hilfsseite ohne Fußzeile
  // (nachgemessen: sowohl Template als auch Klon liefern dort keine
  // Rechtslinks; das als Fehler zu werten würde jeden Build rot machen).
  for (const f of htmlDateien) {
    const name = kurz(f);
    if (name === '404.html') continue;
    const html = readFileSync(f, 'utf-8');
    for (const pflicht of ['impressum', 'datenschutz']) {
      if (!new RegExp(`href=["']/${pflicht}/?["']`).test(html)) {
        fehler(
          `${name}: kein Link auf /${pflicht} – die Rechtsseiten müssen von JEDER Seite erreichbar sein.\n` +
            `    Gehört in die Fußzeile des Kunden-Designs.`,
        );
      }
    }
  }
}

// Dienste ohne Datenschutz-Angaben = rechtlich unvollständig.
if (hatDienste) {
  const ds = htmlDateien.find((f) => kurz(f).startsWith('datenschutz'));
  if (!ds) {
    fehler('Dienste sind konfiguriert, aber es gibt keine Datenschutzseite');
  } else {
    const html = readFileSync(ds, 'utf-8');
    if (!/data-einwilligung-widerruf/.test(html)) {
      fehler('datenschutz: Widerruf-Knopf fehlt – der Widerruf muss so einfach sein wie die Zustimmung (DSGVO)');
    }
    // Nur die PAUSCHALE Behauptung ist falsch. Sätze wie „ohne Ihre Einwilligung
    // werden keine Cookies gesetzt" sind korrekt und rechtlich sogar wichtig –
    // deshalb hier gezielt auf die Aussage prüfen, nicht auf zwei Wörter.
    const pauschal = [
      /Keine Cookies,\s*kein Tracking/i,
      /verwendet\s*(?:<strong>)?\s*keine Cookies/i,
      /(?:benötigt|braucht)[^.]{0,40}keinen Cookie-Banner/i,
    ];
    if (pauschal.some((m) => m.test(html))) {
      fehler(
        'datenschutz: behauptet pauschal „keine Cookies / kein Banner nötig", obwohl Dienste aktiv sind – falsche Angabe',
      );
    }
  }
}

// ---------------------------------------------------------------------------
//  3. META JE SEITE – der ganze Grund für echte Unterseiten
// ---------------------------------------------------------------------------
const titelGesehen = new Map();
const descGesehen = new Map();

for (const f of htmlDateien) {
  const html = readFileSync(f, 'utf-8');
  const name = kurz(f);

  const titel = html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim();
  const desc = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1]?.trim();
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i)?.[1];
  const ogBild = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i)?.[1];

  if (!titel) fehler(`${name}: <title> fehlt`);
  else if (titel.length > 65) warnung(`${name}: <title> ist ${titel.length} Zeichen lang (Google zeigt ~60)`);

  if (!desc) fehler(`${name}: <meta name="description"> fehlt`);
  else if (desc.length < 70) warnung(`${name}: Description ist kurz (${desc.length} Zeichen, gut sind 120–160)`);
  else if (desc.length > 170) warnung(`${name}: Description ist ${desc.length} Zeichen lang (Google kürzt ab ~160)`);

  if (!canonical) fehler(`${name}: <link rel="canonical"> fehlt`);
  if (!ogBild) fehler(`${name}: og:image fehlt (sonst zeigt WhatsApp keine Vorschau)`);
  else {
    // Das Tag allein reicht nicht – die DATEI muss auch existieren.
    const ogPfad = ogBild.replace(/^https?:\/\/[^/]+/, '');
    if (ogPfad.startsWith('/') && !existsSync(join(DIST, ogPfad.slice(1)))) {
      fehler(`${name}: og:image zeigt auf ${ogPfad}, aber die Datei fehlt im Build`);
    }
    /* … und der SERVERNAME muss stimmen. Diese Prüfung schnitt ihn früher
       einfach weg und sah deshalb nicht, dass die Vorschau ihr Bild von einer
       Domain anforderte, die es noch gar nicht gibt (die künftige Kunden-
       domain). Ergebnis: WhatsApp zeigte beim Verschicken der Demo eine graue
       Zeile ohne Foto – auf dem einzigen Weg, über den verkauft wird.
       Der Host muss zu canonical passen; das Feld `vorschauDomain` in der
       Config setzt beides im demo-Modus auf die echte Vorschau-Adresse. */
    const ogHost = ogBild.match(/^https?:\/\/([^/]+)/)?.[1];
    const canonicalHost = canonical?.match(/^https?:\/\/([^/]+)/)?.[1];
    if (ogHost && canonicalHost && ogHost !== canonicalHost) {
      fehler(
        `${name}: og:image liegt auf ${ogHost}, die Seite bezeichnet sich aber als ${canonicalHost}.\n` +
          `    WhatsApp holt das Vorschaubild vom falschen Server – Link ohne Bild.`,
      );
    }
  }

  // Favicon/Apple-Icon: verlinkte Dateien müssen existieren.
  for (const m of html.matchAll(/<link\s+rel=["'](?:icon|apple-touch-icon)["']\s+href=["'](\/[^"']+)["']/gi)) {
    if (!existsSync(join(DIST, m[1].slice(1)))) {
      fehler(`${name}: verlinkt ${m[1]}, aber die Datei fehlt im Build`);
    }
  }

  // hreflang-Ziele müssen als Seiten existieren – sonst zeigt die
  // Mehrsprachigkeits-Auszeichnung ins Leere (SEO-Schaden statt Nutzen).
  for (const m of html.matchAll(/<link\s+rel=["']alternate["']\s+hreflang=["'][^"']+["']\s+href=["']([^"']+)["']/gi)) {
    const pfadTeil = m[1].replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '') || '/';
    const kandidaten =
      pfadTeil === '/'
        ? [join(DIST, 'index.html')]
        : [join(DIST, pfadTeil.slice(1), 'index.html'), join(DIST, `${pfadTeil.slice(1)}.html`)];
    if (!kandidaten.some((k) => existsSync(k))) {
      fehler(
        `${name}: hreflang verweist auf ${pfadTeil}, aber diese Seite existiert nicht im Build.\n` +
          `    Entweder die Sprach-Seiten wirklich bauen (src/pages/en/…) oder sprachen auf ['de'] lassen.`,
      );
    }
  }

  // Doppelte Titel/Descriptions = Duplicate-Content-Signal (die 404 zählt nicht mit)
  if (!name.startsWith('404')) {
    if (titel) titelGesehen.set(titel, [...(titelGesehen.get(titel) ?? []), name]);
    if (desc) descGesehen.set(desc, [...(descGesehen.get(desc) ?? []), name]);
  }

  // Genau eine <h1> je Seite
  const h1 = (html.match(/<h1\b/gi) ?? []).length;
  if (h1 === 0) fehler(`${name}: keine <h1>`);
  else if (h1 > 1) fehler(`${name}: ${h1} <h1>-Überschriften (genau eine gehört auf jede Seite)`);

  // Sprache gesetzt
  if (!/<html[^>]+lang=/i.test(html)) fehler(`${name}: <html lang="…"> fehlt`);

  // Viewport – ohne den ist keine Responsiveness möglich
  if (!/<meta[^>]+name=["']viewport["']/i.test(html)) fehler(`${name}: <meta name="viewport"> fehlt`);

  // Alt-Texte.
  // Zwei zulässige Schreibweisen: alt="Beschreibung" für Bilder, die etwas
  // aussagen – und ein LEERES alt für rein schmückende Bilder (Hintergrund,
  // Foto neben der eigenen Beschriftung). Ein leeres alt ist kein Versäumnis,
  // sondern die Ansage an den Screenreader „hier gibt es nichts vorzulesen";
  // Bildbeschreibungen zu erfinden wäre dort schlechter als Schweigen.
  // Astro schreibt ein leeres alt als blosses `alt` (gültiges HTML) – deshalb
  // zählt hier `alt=…` UND `alt` allein. Das führende \s verhindert, dass
  // `data-alt="…"` als Treffer durchgeht.
  for (const m of html.matchAll(/<img\b(?![^>]*\salt(?:=|[\s>]))[^>]*>/gi)) {
    fehler(`${name}: <img> ohne alt-Attribut -> ${m[0].slice(0, 70)}`);
  }
}

for (const [titel, seiten] of titelGesehen) {
  if (seiten.length > 1) fehler(`Gleicher <title> auf mehreren Seiten (${seiten.join(', ')}): "${titel}"`);
}
for (const [, seiten] of descGesehen) {
  if (seiten.length > 1) fehler(`Gleiche Description auf mehreren Seiten: ${seiten.join(', ')}`);
}

// ---------------------------------------------------------------------------
//  4. RESPONSIVENESS – feste Breiten sind der häufigste Fehler beim Portieren
// ---------------------------------------------------------------------------
for (const f of htmlDateien) {
  const html = readFileSync(f, 'utf-8');
  const name = kurz(f);

  // width/min-width mit festem px-Wert über 400px sprengt schmale Screens.
  // max-width ist erlaubt (begrenzt nur nach oben).
  for (const m of html.matchAll(FESTE_BREITE)) {
    if (Number(m[1]) > 400) {
      fehler(`${name}: feste Breite ${m[1]}px – am Handy bricht das. Token verwenden (siehe CLAUDE.md)`);
    }
  }
  /* Feste Höhen sind derselbe Fehler eine Achse weiter: Ein Block mit
     `height: 600px` schneidet seinen Inhalt ab, sobald die Schrift größer ist
     oder der Text länger wird. `min-height` ist erlaubt (wächst mit). */
  for (const m of html.matchAll(/(?<!max-)(?<!min-)\bheight:\s*(\d{3,})px/gi)) {
    if (Number(m[1]) > 400) {
      warnung(`${name}: feste Höhe ${m[1]}px – schneidet Inhalt ab, sobald der Text länger wird. min-height oder Token verwenden.`);
    }
  }
  // Inline-Styles mit festem padding sind ein Zeichen für ungetokenisierten Design-Code
  const inlinePadding = [...html.matchAll(/style=["'][^"']*padding:\s*(\d{2,})px/gi)];
  if (inlinePadding.length > 3) {
    warnung(
      `${name}: ${inlinePadding.length}× festes padding in style="…" – vermutlich ungetokenisierter Design-Code. Auf var(--raum-*) umstellen.`,
    );
  }
}

// ---------------------------------------------------------------------------
//  5. JSON-LD
// ---------------------------------------------------------------------------
for (const f of htmlDateien.filter((f) => !kurz(f).startsWith('404'))) {
  const html = readFileSync(f, 'utf-8');
  const block = html.match(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/i)?.[1];
  if (!block) {
    fehler(`${kurz(f)}: JSON-LD fehlt`);
    continue;
  }
  try {
    JSON.parse(block);
  } catch {
    fehler(`${kurz(f)}: JSON-LD ist kaputt (kein gültiges JSON)`);
  }
}

// ---------------------------------------------------------------------------
//  5a. LESBARKEIT – Kontrast der Design-Farben (WCAG)
//      Jedes Design ist einzigartig – niemand sonst prüft, ob die Textfarbe
//      auf dem Hintergrund lesbar ist. Unter 3:1 ist Text praktisch unlesbar,
//      unter 4,5:1 fällt er durch die Zugänglichkeits-Norm für Fließtext.
// ---------------------------------------------------------------------------
function relLuminanz(hex) {
  const h = hex.replace('#', '');
  const voll = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(voll.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function kontrast(hexA, hexB) {
  const [l1, l2] = [relLuminanz(hexA), relLuminanz(hexB)].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
}
{
  const startHtml = readFileSync(htmlDateien.find((f) => kurz(f) === 'index.html') ?? htmlDateien[0], 'utf-8');
  const farbe = (name) => startHtml.match(new RegExp(`--farbe-${name}:\\s*(#[0-9a-fA-F]{3,6})`))?.[1];
  const text = farbe('text');
  const hintergrund = farbe('hintergrund');
  if (text && hintergrund) {
    const v = kontrast(text, hintergrund);
    if (v < 3) {
      fehler(
        `Lesbarkeit: Textfarbe ${text} auf Hintergrund ${hintergrund} hat nur ${v.toFixed(1)}:1 Kontrast – praktisch unlesbar. Farben in content.config.ts -> design.farben anpassen.`,
      );
    } else if (v < 4.5) {
      warnung(
        `Lesbarkeit: Textfarbe ${text} auf Hintergrund ${hintergrund} hat ${v.toFixed(1)}:1 Kontrast (Norm für Fließtext: 4,5:1). Besser eine dunklere/hellere Textfarbe wählen.`,
      );
    }
  }

  // Schrift AUF der Markenfarbe (Buttons, Sprunglink). Der Motor wählt dafür
  // automatisch Schwarz oder Weiß – je nachdem, was besser lesbar ist
  // (src/lib/theme.ts). Reicht selbst die bessere Wahl nicht, liegt es an der
  // Markenfarbe selbst: mittelhelle Töne (viele Orange-, Türkis- und Grüntöne)
  // vertragen weder Weiß noch Schwarz gut. Dann muss das Design ran.
  const primaer = farbe('primaer');
  const aufPrimaer = farbe('auf-primaer');
  if (primaer && aufPrimaer) {
    const v = kontrast(primaer, aufPrimaer);
    if (v < 3) {
      fehler(
        `Lesbarkeit: Schrift ${aufPrimaer} auf der Markenfarbe ${primaer} hat nur ${v.toFixed(1)}:1 – Buttons und der Sprunglink sind unlesbar. Markenfarbe abdunkeln oder aufhellen (content.config.ts -> design.farben.primaer).`,
      );
    } else if (v < 4.5) {
      warnung(
        `Lesbarkeit: Schrift auf der Markenfarbe ${primaer} erreicht nur ${v.toFixed(1)}:1 (Norm 4,5:1). Der Motor hat bereits die bessere von Schwarz/Weiß gewählt – für mehr Kontrast muss die Markenfarbe selbst dunkler oder heller werden.`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
//  5b. BILD-PIPELINE – läuft sie überhaupt?
//      Liegen Fotos in fotos/, aber im Build taucht kein optimiertes Bild auf,
//      dann greift die Auflösung ins Leere (z. B. falscher Pfad in bilder.ts).
//      Ohne diese Prüfung bleibt so ein Fehler still, bis er beim Kunden auffällt.
// ---------------------------------------------------------------------------
const fotoOrdner = join(WURZEL, 'fotos');
if (existsSync(fotoOrdner)) {
  const eingang = alleDateien(fotoOrdner).filter((f) =>
    ['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(extname(f).toLowerCase()),
  );
  // Nur BILDER in _astro/ zählen – dort liegen auch JS/CSS-Bündel.
  const optimiert = dateien.filter(
    (f) =>
      kurz(f).startsWith('_astro/') &&
      ['.webp', '.avif', '.jpg', '.jpeg', '.png'].includes(extname(f).toLowerCase()),
  );
  if (eingang.length > 0 && optimiert.length === 0) {
    fehler(
      `In fotos/ liegen ${eingang.length} Bild(er), aber der Build hat keines optimiert.\n` +
        `    Die Bild-Auflösung greift ins Leere – siehe src/lib/bilder.ts (Ordner-Pfad).`,
    );
  }

  // ALLES in fotos/ wird mitveröffentlicht – auch Bilder, die auf keiner Seite
  // vorkommen. Beim Kunden kann so ein nur „geparktes" Foto ungewollt öffentlich
  // auf dem Server landen. WICHTIG: „liegt in dist/" reicht als Maßstab nicht,
  // weil die Bild-Pipeline alle Fotos emittiert – zählt nur, was eine Seite
  // wirklich REFERENZIERT. Deshalb (nur beim Kunden, nicht im Referenz-Template):
  if (!istTemplate) {
    const referenziert = new Set();
    for (const f of dateien.filter((f) => ['.html', '.css', '.js'].includes(extname(f)))) {
      const inhalt = readFileSync(f, 'utf-8');
      for (const m of inhalt.matchAll(/_astro\/([A-Za-z0-9._-]+?)\.[A-Za-z0-9_-]+\.\w+/g)) {
        referenziert.add(m[1].toLowerCase());
      }
    }
    for (const b of eingang) {
      const basis = b.split(/[\\/]/).pop().replace(/\.[^.]+$/, '').toLowerCase();
      if (!referenziert.has(basis)) {
        warnung(
          `fotos/${b.split(/[\\/]/).pop()}: wird auf keiner Seite verwendet, landet aber öffentlich am Server. Entfernen oder einbauen.`,
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
//  6. BILDER – Gewicht und Format
// ---------------------------------------------------------------------------
const bilder = dateien.filter((f) => ['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(extname(f).toLowerCase()));

/*
 * ERSATZFASSUNGEN WERDEN ANDERS GEWOGEN.
 *
 * Die Gewichtsgrenze unterstellt: Was ausgeliefert wird, lädt jeder Besucher.
 * Bei einem `<picture>` stimmt das nicht mehr – dort steht das moderne Format
 * in `<source>`, die ältere Fassung nur im `<img src>`. Wer WebP kann
 * (praktisch jeder seit 2020), lädt die Ersatzfassung NIE.
 *
 * Würde man sie mit demselben Maß wiegen, gäbe es nur zwei Auswege: die
 * Bildqualität für ALLE senken, oder auf die Ersatzfassung verzichten – und
 * damit auf jedes Foto bei genau den Besuchern, die sie brauchen. Beides wäre
 * falsch. Deshalb ein eigenes, großzügigeres, aber vorhandenes Maß.
 */
const ersatzfassungen = new Set();
for (const seite of htmlDateien) {
  const html = readFileSync(seite, 'utf-8');
  for (const m of html.matchAll(/<picture[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/g)) {
    ersatzfassungen.add(m[1].split('/').pop());
  }
}

for (const b of bilder) {
  const kb = statSync(b).size / 1024;
  const name = kurz(b);
  if (name === 'og.jpg') continue; // OG-Bild darf größer sein

  if (ersatzfassungen.has(name.split('/').pop())) {
    if (kb > 600) fehler(`${name}: ${Math.round(kb)} KB – Ersatzfassung zu schwer (Grenze 600 KB)`);
    else if (kb > 400) warnung(`${name}: ${Math.round(kb)} KB – Ersatzfassung grenzwertig`);
    continue;
  }

  if (kb > 300) fehler(`${name}: ${Math.round(kb)} KB – zu schwer (Richtwert: max. 200 KB, Hero ~200 KB)`);
  else if (kb > 200) warnung(`${name}: ${Math.round(kb)} KB – grenzwertig`);
}

/* ALLE übrigen ausgelieferten Dateien wiegen – bisher galt die Grenze NUR für
   Bilder. Ein 2,3-MB-PDF (Speisekarte aus dem Scan) passierte deshalb
   unbemerkt und wurde prominent verlinkt: Wer es am Handy antippt, zieht 2,3 MB
   über Mobilfunk. Auch Videos und Schriften gehören gewogen. */
const SCHWER = { '.pdf': 1500, '.mp4': 3000, '.webm': 3000, '.woff2': 120, '.woff': 200, '.zip': 2000 };
for (const f of dateien) {
  const endung = extname(f).toLowerCase();
  const grenze = SCHWER[endung];
  if (!grenze) continue;
  const kb = statSync(f).size / 1024;
  if (kb > grenze) {
    const mb = (kb / 1024).toFixed(1);
    warnung(
      `${kurz(f)}: ${mb} MB – schwer für einen Mobilfunk-Besucher (Richtwert ${(grenze / 1024).toFixed(1)} MB).\n` +
        `    PDFs verkleinern (Bilder auf ~150 dpi) oder die Größe am Link nennen.`,
    );
  }
}

// ---------------------------------------------------------------------------
//  7. MODE-KONSISTENZ (demo vs. live)
// ---------------------------------------------------------------------------
const configText = existsSync(CONFIG) ? readFileSync(CONFIG, 'utf-8') : '';
const istLive = /mode:\s*'live'/.test(configText);
const robots = existsSync(join(DIST, 'robots.txt')) ? readFileSync(join(DIST, 'robots.txt'), 'utf-8') : '';

for (const f of htmlDateien) {
  const html = readFileSync(f, 'utf-8');
  const noindex = /content=["']noindex/i.test(html);
  /* Hilfsseiten dürfen bewusst gesperrt sein: die Fehlerseite und die
     Danke-Seite. Beide stehen nicht in der Seiten-Config, gehören also gar
     nicht in Googles Index – eine Danke-Seite im Suchergebnis nützt niemandem
     und erscheint ohne Zusammenhang. */
  const istHilfsseite = /^(404|danke)/.test(kurz(f));
  if (istLive && noindex && !istHilfsseite) {
    fehler(`${kurz(f)}: mode ist 'live', aber die Seite steht auf noindex`);
  }
  if (!istLive && !noindex) {
    fehler(`${kurz(f)}: mode ist 'demo', aber es fehlt noindex – die Vorschau darf NICHT in Google landen`);
  }
}
if (!istLive && !/Disallow:\s*\//.test(robots)) {
  fehler('robots.txt erlaubt Zugriff, obwohl mode auf "demo" steht');
}
if (istLive && /Disallow:\s*\/\s*$/m.test(robots)) {
  fehler('robots.txt sperrt alles, obwohl mode auf "live" steht');
}

/* MERKLISTE: Sie speichert auf dem Gerät des Besuchers – das MUSS in der
   Datenschutzerklärung stehen (§ 165 TKG / ePrivacy erfassen jede Speicherung
   auf dem Endgerät, auch ohne Cookie). Daneben behauptet dieselbe Seite
   „keine Cookies"; ohne den Absatz wirkt das wie „wir speichern nichts", und
   das stimmt dann nicht mehr. Die Lücke entstand am 2026-07-27 mit dem
   Katalog selbst – deshalb bewacht sie ab jetzt eine Regel. */
{
  const nutztMerkliste = htmlDateien.some((f) => /data-merken=/.test(readFileSync(f, 'utf-8')));
  const datenschutz = htmlDateien.find((f) => /datenschutz/.test(kurz(f)));
  if (nutztMerkliste && datenschutz && !/Merkliste/i.test(readFileSync(datenschutz, 'utf-8'))) {
    fehler(
      'Die Seite hat eine Merkliste, die Datenschutzerklärung erwähnt sie aber nicht.\n' +
        '    Sie speichert auf dem Gerät des Besuchers – das gehört dort hinein (CLAUDE.md Abschnitt 6a).',
    );
  }
}

/* VORSCHAU: Das Formular ist sichtbar, darf aber kein Versandziel haben.
   Seit 2026-07-27 rendert die Vorschau ein echtes, bedienbares Formular –
   sonst schreibt der Port sein Aussehen blind und der Kunde sieht bei der
   Abnahme nichts. Die Sperre muss deshalb STRUKTURELL sein und nicht nur im
   JavaScript hängen: kein `action`, kein `data-formular`. Sonst schickt ein
   Browser ohne laufendes Skript die Anfrage doch ab – ins Leere, weil in der
   Vorschau kein Schlüssel gesetzt ist, und ohne dass es jemand merkt. */
for (const f of htmlDateien) {
  const html = readFileSync(f, 'utf-8');
  const name = kurz(f);
  for (const m of html.matchAll(/<form\b[^>]*>/gi)) {
    const tag = m[0];
    const istVorschau = /data-formular-vorschau/.test(tag);
    if (!istLive) {
      if (/action=["'][^"']*\/api\/contact/.test(tag)) {
        fehler(
          `${name}: Vorschau-Modus, aber ein Formular zeigt auf /api/contact.\n` +
            `    In der Vorschau darf kein Versandziel im Markup stehen (auch nicht für Browser ohne JavaScript).`,
        );
      }
      if (/data-formular(?![-\w])/.test(tag)) {
        fehler(
          `${name}: Vorschau-Modus, aber ein Formular trägt data-formular (scharf).\n` +
            `    In der Vorschau gehört data-formular-vorschau dorthin – sonst verdrahtet der Motor den echten Versand.`,
        );
      }
    } else if (istVorschau) {
      fehler(
        `${name}: live-Modus, aber ein Formular ist noch als Vorschau markiert – es würde nichts verschicken.`,
      );
    }
  }
}

// Sicherheits-Header-Selbstkontrolle. Geprüft wird vercel.json – die Datei, die
// beim einzigen Host des Motors tatsächlich ausgeliefert wird. (Früher stand
// hier dist/_headers für Cloudflare/Netlify: eine Datei, die auf Vercel
// niemand liest – die Prüfung bewachte also den falschen Weg.) Sie entsteht
// automatisch, aber Hand-Änderungen oder ein kaputter Build-Hook dürfen nicht
// still bleiben.
const vercelDatei = join(WURZEL, 'vercel.json');
if (existsSync(vercelDatei)) {
  let vercelJson;
  try {
    vercelJson = JSON.parse(readFileSync(vercelDatei, 'utf-8'));
  } catch {
    fehler('vercel.json ist kein gültiges JSON – Vercel lehnt den Deploy komplett ab');
  }
  if (vercelJson) {
    const gesetzt = (vercelJson.headers ?? [])
      .flatMap((eintrag) => eintrag.headers ?? [])
      .map((h) => h.key);
    for (const pflicht of ['X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy']) {
      if (!gesetzt.includes(pflicht)) fehler(`vercel.json: Sicherheits-Header "${pflicht}" fehlt`);
    }
    if (istLive && !gesetzt.includes('Strict-Transport-Security')) {
      fehler('vercel.json: HSTS fehlt, obwohl die Seite live ist');
    }
    if (!istLive && !gesetzt.includes('X-Robots-Tag')) {
      fehler('vercel.json: X-Robots-Tag fehlt, obwohl mode "demo" ist – die Vorschau wäre indexierbar');
    }
    // Vercel prüft die Datei gegen ein Schema und lehnt JEDES unbekannte Feld
    // ab. Ein Kommentarfeld hier lässt jeden Deploy scheitern.
    const erlaubt = new Set(['$schema', 'headers', 'redirects', 'cleanUrls', 'trailingSlash', 'rewrites', 'regions', 'framework', 'buildCommand', 'outputDirectory', 'installCommand', 'devCommand', 'github', 'functions', 'crons', 'images']);
    for (const schluessel of Object.keys(vercelJson)) {
      if (!erlaubt.has(schluessel)) {
        fehler(`vercel.json enthält das unbekannte Feld "${schluessel}" – Vercel lehnt den Deploy damit komplett ab`);
      }
    }
  }
} else {
  fehler('vercel.json fehlt – der Build-Hook in astro.config.ts läuft nicht');
}

// ---------------------------------------------------------------------------
//  8. REFERENZ-RESTE & PLATZHALTER (Lücken-Inventar)
// ---------------------------------------------------------------------------
const REFERENZ_MARKER = [
  'Muster Betrieb',
  'muster-betrieb.example',
  'Musterstraße 1',
  'ATU00000000',
  'FN 000000a',
  '+43 1 000 00 00',
  'Referenz-Seite des Kanbuk-Motors',
  // Der Muster-Katalog haelt die Katalog-Mechanik bei jedem Build in Betrieb.
  // Beim Kunden gehoert er ersetzt oder geloescht - sonst stehen drei erfundene
  // Eintraege samt eigener Adresse in der Sitemap und irgendwann bei Google.
  'Muster-Katalog',
  'Muster-Eintrag',
];
const referenzReste = REFERENZ_MARKER.filter((m) => configText.includes(m));
if (referenzReste.length > 0) {
  if (istTemplate) {
    // Im Template selbst ist die Referenz Absicht – sie hält den Standard vorführbar.
    console.log('ℹ Referenz-Template (noch keine Kundendaten) – beim Kunden wird dieser Block ersetzt.\n');
  } else {
    for (const m of referenzReste) {
      fehler(`content.config.ts enthält noch den Referenz-Wert „${m}" – durch echte Kundendaten ersetzen`);
    }
  }
}

// Leere Pflichtfelder
for (const feld of ['name', 'claim', 'kurzbeschreibung', 'telefon', 'email', 'domain']) {
  const re = new RegExp(`${feld}:\\s*['"]\\s*['"]`);
  if (re.test(configText)) fehler(`content.config.ts: Feld "${feld}" ist leer`);
}

// ---------------------------------------------------------------------------
//  8b. NUR IM TEMPLATE: bleibt es kundenfrei?
//      Das Template ist die Vorlage für ALLE Kunden. Steht dort die Adresse von
//      Kunde A als Beispiel, schleppt Kunde B sie in seinem Ordner mit sich herum.
//      Deshalb: im Template sind nur Musterdaten erlaubt.
// ---------------------------------------------------------------------------
if (istTemplate) {
  const motorDateien = [
    ...alleDateien(join(WURZEL, 'src')),
    ...alleDateien(join(WURZEL, 'scripts')),
    ...alleDateien(join(WURZEL, '.claude')),
    ...alleDateien(join(WURZEL, 'vorlagen')),
    join(WURZEL, 'content.config.ts'),
    join(WURZEL, 'CLAUDE.md'),
    join(WURZEL, 'README.md'),
    // STAND.md gehört ausdrücklich dazu: Genau dort rutschten am 2026-07-27
    // drei Betriebsnamen durch – in der Verlaufszeile, wo man beim Schreiben
    // an die Arbeit denkt und nicht an die Regel.
    join(WURZEL, 'STAND.md'),
  ].filter((f) => existsSync(f) && ['.ts', '.astro', '.mjs', '.md', '.css'].includes(extname(f)));

  /* BETRIEBSNAMEN – der Fall, den kein allgemeines Muster findet.
     Telefonnummern und E-Mail-Adressen haben eine erkennbare Form, ein
     Betriebsname nicht. Eine Namensliste im Template wäre selbst wieder
     Kundendaten – also holt sich die Regel die Namen dort, wo sie ohnehin
     stehen: aus den NACHBARORDNERN. Jeder Ordner unter kanbuk-kunden/ und
     kanbuk-demos/ ist ein Kunde oder eine Demo; taucht sein Name im Template
     auf, gehört er dort nicht hin.

     Auf einem fremden Rechner gibt es diese Ordner nicht – dann schweigt die
     Regel, statt Fehlalarm zu schlagen. Sie schützt genau den, der die Fehler
     machen kann. */
  const nachbarn = ['kanbuk-kunden', 'kanbuk-demos']
    .map((ordner) => join(WURZEL, '..', ordner))
    .filter((p) => existsSync(p))
    .flatMap((p) => readdirSync(p, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
      .map((e) => e.name));

  for (const name of new Set(nachbarn)) {
    /* Aus dem Ordnernamen die Schreibweisen ableiten, die im Text vorkämen:
       'muster-laden' → 'muster-laden' | 'muster laden' | 'musterladen'.

       Die Wortgrenzen sind nicht Zierde: Ohne sie schlug die Regel mitten in
       zusammengesetzten Wörtern an, weil ein Demo-Ordner zufällig wie ein
       gewöhnliches deutsches Wort hieß – ein Wachhund, der jeden Fußgänger
       anbellt, wird bald ignoriert.
       Ein Restrisiko bleibt genau dort: Heißt ein Ordner wie ein normales
       Wort, kann die Regel danebengreifen. Dann entweder den Satz umformulieren
       oder – dauerhafter – den Ordner mit Präfix benennen (demo-<name>), dann
       trifft das Muster den Alltagsbegriff nicht mehr. */
    const teile = name.split('-').filter((s) => s.length > 2);
    if (teile.length === 0) continue;
    const muster = new RegExp(
      '\\b' + teile.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[\\s-]?') + '\\b',
      'i',
    );
    for (const f of motorDateien) {
      const text = readFileSync(f, 'utf-8');
      if (!muster.test(text)) continue;
      const zeile = text.split('\n').find((z) => muster.test(z)) ?? '';
      fehler(
        `${relative(WURZEL, f).replace(/\\/g, '/')}: enthält den Namen „${name}" – das ist ein Kunde oder eine Demo aus dem Nachbarordner.\n` +
          `    „${zeile.trim().slice(0, 90)}"\n` +
          `    Das Repo ist öffentlich, und JEDER künftige Klon trägt den Namen mit sich herum.\n` +
          `    Neutral umschreiben („ein Gastro-Pilot") – siehe CLAUDE.md, „Das Template bleibt kundenfrei".`,
      );
      break;
    }
  }

  // Verräterische Muster echter Kundendaten in Beispielen/Kommentaren.
  const kundenspuren = [
    { muster: /\+43[\s\d/-]{7,}/g, was: 'eine echte österreichische Telefonnummer' },
    { muster: /[\w.-]+@(?!.*\.example)[\w-]+\.(?:at|com|net|org)\b/g, was: 'eine echte E-Mail-Adresse' },
    { muster: /claude\.ai\/design\/p\/[0-9a-f-]{8,}/g, was: 'ein echter Design-Projekt-Link' },
  ];
  // Erlaubt: alles rund um die Musterdaten und offensichtliche Doku-Beispiele.
  const harmlos = /muster-betrieb|@example|ihr-betrieb|\+43 1 000 00 00|noreply@anthropic/i;

  for (const f of motorDateien) {
    const text = readFileSync(f, 'utf-8');
    for (const { muster, was } of kundenspuren) {
      for (const treffer of text.match(muster) ?? []) {
        if (harmlos.test(treffer)) continue;
        warnung(
          `${relative(WURZEL, f).replace(/\\/g, '/')}: enthält ${was} („${treffer.trim()}“) – ` +
            `im Template gehören nur Musterdaten (siehe CLAUDE.md, „Das Template bleibt kundenfrei“).`,
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
//  8a. FORMULAR-ENDPUNKT – die Türsteher-Schicht muss dranbleiben
//
//  api/contact.ts weist fremde Ursprünge ab, erzwingt JSON, begrenzt die Größe
//  und bremst Fluten. Wird eine dieser Schranken beim Umbauen entfernt, kann
//  jede fremde Website das Postfach des Betriebs fluten und das Mail-Kontingent
//  leerlaufen lassen – ohne dass es jemandem auffällt. Deshalb hier verankert.
// ---------------------------------------------------------------------------
{
  const endpunkt = join(WURZEL, 'api', 'contact.ts');
  if (existsSync(endpunkt)) {
    const quelle = readFileSync(endpunkt, 'utf-8');
    const schranken = [
      [/content-type/i, 'Format-Prüfung (nur application/json)'],
      [/origin/i, 'Ursprungs-Prüfung (keine fremden Websites)'],
      [/413|zu lang/i, 'Größenbegrenzung'],
      [/429|zuVieleAnfragen/i, 'Bremse gegen Anfrage-Fluten'],
    ];
    for (const [muster, was] of schranken) {
      if (!muster.test(quelle)) {
        fehler(
          `api/contact.ts: Die ${was} fehlt.\n` +
            `    Ohne sie kann jede fremde Seite über das Formular E-Mails auslösen.`,
        );
      }
    }
  }

  /* Die Bestätigung an den ABSENDER darf keine Formularinhalte enthalten.
     Die Empfängeradresse kommt aus dem Formular und wird nie überprüft – mit
     Inhalt darin lässt sich die Domain des Betriebs missbrauchen, um fremden
     Text an fremde Adressen zu schicken. Der Schaden ist keine gestohlene
     Datei, sondern eine Absender-Domain auf einer Sperrliste: Ab dann kommt
     KEINE echte Anfrage mehr an, und niemand merkt, warum.
     Die Regel schaut in genau den Block, der die zweite Mail baut. */
  const kontaktDatei = join(WURZEL, 'src', 'lib', 'kontakt.ts');
  if (existsSync(kontaktDatei)) {
    const quelle = readFileSync(kontaktDatei, 'utf-8');
    const start = quelle.indexOf('if (antwortAdresse) {');
    if (start > 0) {
      const block = quelle.slice(start);
      // Nur der Rumpf bis zum Ende der Bestätigungs-Anfrage interessiert.
      const ende = block.indexOf('return { status: 200');
      const rumpf = ende > 0 ? block.slice(0, ende) : block;
      // Kommentare weg – dort steht die Begründung und darf „zeilen" vorkommen.
      const code = rumpf.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
      for (const [muster, was] of [
        [/\bzeilen\b/, 'die gesammelten Formularzeilen'],
        [/\bdaten\s*\[/, 'einzelne Formularfelder'],
      ]) {
        if (muster.test(code)) {
          fehler(
            `src/lib/kontakt.ts: Die Bestätigung an den Absender enthält wieder ${was}.\n` +
              `    Sie geht an eine ungeprüfte Adresse – mit Inhalt darin wird daraus ein Versandkanal\n` +
              `    für fremden Text über die Domain des Betriebs. Nur Empfangsbestätigung, keine Kopie.`,
          );
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
//  8bb. SCHREIBWEISEN IM BROWSER-CODE
//
//  `npm run browser` findet das im fertigen Bündel – aber mit der Meldung des
//  Übersetzers („Transforming destructuring … not supported yet") und ohne
//  Dateinamen aus dem Quelltext. Diese Regel sagt dasselbe an der Stelle, an
//  der es zu ändern ist.
//
//  WARUM AUSGERECHNET DIESE EINE SCHREIBWEISE: Das Zerlegen in Klammern
//  (`const [a, b] = …`, `const { a } = …`) ist die einzige moderne Form, die
//  der Übersetzer NICHT in eine ältere umwandeln kann. Steht sie irgendwo im
//  Browser-Code, ist das GESAMTE Skriptbündel für ältere Browser ein
//  Lesefehler – und dann fällt nicht ein Baustein aus, sondern alle
//  gleichzeitig: Menü, Filter, Merkliste, Formular, Lightbox. Ohne Meldung
//  für den Besucher. In einem Kundenprojekt hoben fünf solche Stellen die
//  Untergrenze des ganzen Bündels um zwei Safari-Generationen.
//
//  NUR Browser-Code. In scripts/ ist Zerlegen völlig in Ordnung – das läuft
//  in Node auf einem aktuellen Rechner, nie im Browser eines Besuchers.
// ---------------------------------------------------------------------------
{
  const browserCode = alleDateien(join(WURZEL, 'src', 'lib', 'verhalten'))
    .filter((f) => extname(f) === '.ts');
  const zerlegen = /^\s*(?:const|let|var)\s*[[{]|for\s*\(\s*(?:const|let|var)\s*[[{]/;

  for (const f of browserCode) {
    const zeilen = readFileSync(f, 'utf-8').split(/\r?\n/);
    const name = relative(WURZEL, f).replace(/\\/g, '/');
    zeilen.forEach((zeile, i) => {
      // Kommentarzeilen erklären die Regel oft am Beispiel – die zählen nicht.
      if (/^\s*(\*|\/\/|\/\*)/.test(zeile)) return;
      if (!zerlegen.test(zeile)) return;
      fehler(
        [
          `${name}:${i + 1}: Zerlegen in Klammern im Browser-Code.`,
          `    „${zeile.trim().slice(0, 80)}"`,
          '    Diese eine Schreibweise kann der Übersetzer nicht ersetzen. Solange sie hier steht,',
          '    ist das GESAMTE Skriptbündel für ältere Browser unlesbar – dann funktioniert KEIN',
          '    Bedien-Element mehr. Ausschreiben: const a = x[0]; const b = x[1];',
        ].join('\n'),
      );
    });
  }
}

// ---------------------------------------------------------------------------
//  8c. ASSISTENT – ein mehrstufiges Formular ohne Weg nach vorn ist eine Falle
//
//  Der Assistent versteckt alle Schritte bis auf einen. Fehlt der Weiter-Knopf,
//  sieht der Besucher nur den ersten Schritt und kommt nie zum Absenden – die
//  Seite wirkt fertig, nimmt aber keine einzige Anfrage mehr entgegen. Genau
//  solche Fehler fallen ohne Prüfung erst auf, wenn wochenlang nichts kommt.
// ---------------------------------------------------------------------------
for (const f of htmlDateien) {
  const html = readFileSync(f, 'utf-8');
  const name = kurz(f);
  if (!/data-assistent(?:[\s=>"'])/.test(html)) continue;

  const schritte = (html.match(/data-assistent-schritt=/g) ?? []).length;
  if (schritte < 2) {
    fehler(
      `${name}: Formular als Assistent ausgezeichnet, hat aber ${schritte} Schritt(e).\n` +
        `    Entweder \`schritte\` in content.config.ts füllen oder ganz weglassen.`,
    );
    continue;
  }
  if (!/data-assistent-weiter/.test(html)) {
    fehler(
      `${name}: Assistent mit ${schritte} Schritten, aber ohne „Weiter"-Knopf – der Besucher kommt nie zum Absenden.`,
    );
  }
  if (!/data-formular-absenden/.test(html)) {
    fehler(`${name}: Assistent ohne Absende-Knopf – die Anfrage lässt sich nicht abschicken.`);
  }
  if (!/data-assistent-fortschritt/.test(html)) {
    warnung(
      `${name}: Assistent ohne Fortschrittsanzeige. Wer nicht sieht, wie lange es noch dauert, bricht eher ab.`,
    );
  }
}

// ---------------------------------------------------------------------------
//  8b. INTERNE LINKS – führt jeder Verweis wirklich irgendwohin?
//
//  Bis 2026-07-27 prüfte das NIEMAND. Kaputte BILDER fielen auf (die
//  Sichtprüfung fragt jede Ressource wirklich ab), ein <a href="/gibtsnicht">
//  dagegen nie – Werkzeuge folgen keinem Link. Typische Fälle: Tippfehler in
//  der Navigation, eine im Design geplante aber nie gebaute Unterseite, ein
//  PDF, das nie nach public/ kopiert wurde, ein Weiterleitungsziel aus der
//  alten Website. Alles rein statisch prüfbar.
// ---------------------------------------------------------------------------
{
  /** Löst einen absoluten Pfad gegen dist/ auf (Datei, /index.html oder .html). */
  const findetZiel = (pfad) => {
    const rein = decodeURIComponent(pfad.replace(/\/+$/, '')) || '/';
    if (rein === '/') return existsSync(join(DIST, 'index.html'));
    const ohneSlash = rein.replace(/^\//, '');
    return (
      existsSync(join(DIST, ohneSlash)) ||
      existsSync(join(DIST, ohneSlash, 'index.html')) ||
      existsSync(join(DIST, `${ohneSlash}.html`))
    );
  };

  /** Sprungmarken: echte id/name – ODER die Kennungen der Verhaltens-Bausteine
      (Tabs springen über data-tab/data-tabpanel, nicht über eine id). */
  const ankerDa = (html, anker) =>
    new RegExp(`(?:id|name|data-tab|data-tabpanel)=["']${anker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`).test(html);

  const htmlNach = (pfad) => {
    const rein = pfad.replace(/\/+$/, '') || '/';
    for (const k of [rein === '/' ? 'index.html' : `${rein.slice(1)}/index.html`, `${rein.slice(1)}.html`]) {
      const p = join(DIST, k);
      if (existsSync(p)) return readFileSync(p, 'utf-8');
    }
    return null;
  };

  for (const f of htmlDateien) {
    const html = readFileSync(f, 'utf-8');
    const name = kurz(f);
    const gesehen = new Set();
    for (const m of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)) {
      const ziel = m[1].trim();
      if (gesehen.has(ziel)) continue;
      gesehen.add(ziel);
      if (/^(https?:|mailto:|tel:|data:|javascript:)/i.test(ziel)) continue;
      if (!ziel.startsWith('/') && !ziel.startsWith('#')) continue; // relative Links kommen im Motor nicht vor

      const [pfad, anker] = ziel.split('#');
      if (pfad && !findetZiel(pfad)) {
        fehler(`${name}: Link ins Leere -> ${ziel}  (im Build gibt es dafür keine Seite und keine Datei)`);
        continue;
      }
      if (anker) {
        const zielHtml = pfad ? htmlNach(pfad) : html;
        if (zielHtml && !ankerDa(zielHtml, anker)) {
          fehler(`${name}: Sprungmarke fehlt -> ${ziel}  (auf der Zielseite gibt es „${anker}" nicht)`);
        }
      }
    }
  }

  // Weiterleitungen der Vorgänger-Website: das ZIEL muss existieren, sonst
  // landet der alte Google-Treffer auf einer 404 statt auf der neuen Seite.
  const vj = join(WURZEL, 'vercel.json');
  if (existsSync(vj)) {
    try {
      for (const w of JSON.parse(readFileSync(vj, 'utf-8')).redirects ?? []) {
        const zielPfad = String(w.destination || '').split('#')[0];
        if (zielPfad.startsWith('/') && !findetZiel(zielPfad)) {
          fehler(
            `Weiterleitung ${w.source} zeigt auf ${w.destination} – diese Seite gibt es im Build nicht.\n` +
              `    Der alte Google-Treffer würde auf einer Fehlerseite landen.`,
          );
        }
      }
    } catch { /* JSON-Fehler meldet bereits die vercel.json-Regel */ }
  }
}

// ---------------------------------------------------------------------------
//  9. LIVE-PFLICHTEN (nur bei mode: 'live' oder --live)
// ---------------------------------------------------------------------------
if (istLive || nurLive) {
  // Bewusst GROSSGESCHRIEBEN geprüft: Marker werden als "PLATZHALTER: UID" gesetzt.
  // (Kleingeschrieben würde das Schema-Feld `platzhalter` jeden Live-Gang blockieren.)
  if (/PLATZHALTER|TODO|XXX/.test(configText)) {
    fehler('content.config.ts enthält noch Marker (PLATZHALTER/TODO) – vor dem Live-Gang ersetzen');
  }

  /* … und dasselbe auf der FERTIGEN Seite.
     Bis 2026-07-27 wurde nur content.config.ts durchsucht. Beim Portieren
     liefert aber das Design die sichtbaren Texte – ein „PLATZHALTER: Öffnungs-
     zeiten" in einer Komponente ging deshalb ungebremst live, ebenso stehen-
     gebliebene Musterdaten. Geprüft wird der SICHTBARE Text (Tags entfernt),
     damit Klassennamen und data-Attribute keine Fehlalarme auslösen. */
  const musterFunde = new Map(); // Marker -> Seiten (gebündelt, sonst 20 Zeilen Lärm)
  for (const f of htmlDateien) {
    const sichtbar = readFileSync(f, 'utf-8')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-z]+;/gi, ' ');
    const marker = (sichtbar.match(/\b(PLATZHALTER|TODO|XXX+|LOREM IPSUM)\b/g) ?? [])[0];
    if (marker) {
      fehler(`${kurz(f)}: Der Marker „${marker}" steht im fertigen Text – vor dem Live-Gang ersetzen.`);
    }
    if (!istTemplate) {
      for (const m of REFERENZ_MARKER) {
        if (sichtbar.includes(m)) {
          if (!musterFunde.has(m)) musterFunde.set(m, []);
          musterFunde.get(m).push(kurz(f));
        }
      }
    }
  }
  for (const [m, seiten] of musterFunde) {
    fehler(
      `Musterdaten „${m}" stehen noch auf der fertigen Seite (${seiten.length === 1 ? seiten[0] : `${seiten.length} Seiten, u. a. ${seiten[0]}`}) – durch echte Kundendaten ersetzen.`,
    );
  }
  // STAND.md ist das Gedächtnis des Projekts: Offene Punkte im Lücken-Inventar
  // ([ ]) blockieren den Live-Gang – erledigt wird mit [x] abgehakt.
  const standDatei = join(WURZEL, 'STAND.md');
  if (existsSync(standDatei)) {
    const stand = readFileSync(standDatei, 'utf-8');
    const offen = [...stand.matchAll(/^\s*-\s*\[ \]\s*(.+)$/gm)]
      .map((m) => m[1].trim())
      .filter((z) => !z.startsWith('*(')); // die Beispielzeile der Vorlage zählt nicht
    for (const punkt of offen) {
      fehler(`STAND.md: offener Punkt vor dem Live-Gang -> "${punkt.slice(0, 90)}"`);
    }
  } else {
    warnung('STAND.md fehlt – das Lücken-Inventar dieses Projekts ist nirgends festgehalten.');
  }
  /* Beim Live-Gang muss `domain` die ECHTE Kundendomain sein.
     Bleibt dort die Vorschau-Adresse stehen (…kanbuk.com) oder ein Musterwert,
     zeigen sämtliche Canonicals, die Sitemap und das Vorschaubild auf einen
     fremden Host – die Seite bewirbt dann dauerhaft die Vorschau statt sich
     selbst, und Google indexiert sie unter der falschen Adresse. */
  const domain = configText.match(/domain:\s*['"]([^'"]+)['"]/)?.[1] ?? '';
  if (/kanbuk\.com|\.vercel\.app|\.example(\/|$)/.test(domain)) {
    fehler(
      `content.config.ts: domain steht beim Live-Gang noch auf „${domain}".\n` +
        `    Hier gehört die eigene Domain des Kunden hin – sonst zeigen alle Adressen im Seitenkopf auf die Vorschau.`,
    );
  }

  if (!/uid:\s*'AT[UO]\d/.test(configText)) {
    warnung('Rechtstexte: UID-Nummer sieht nicht nach einer echten österreichischen UID aus');
  }
  const sitemapDatei = join(DIST, 'sitemap-0.xml');
  if (!existsSync(join(DIST, 'sitemap-index.xml')) && !existsSync(sitemapDatei)) {
    warnung('Keine Sitemap gefunden, obwohl die Seite live geht');
  } else if (existsSync(sitemapDatei)) {
    /* Sitemap und canonical müssen ZEICHENGLEICH sein.
       Sie widersprachen sich: Die Sitemap bot Google „…/speisekarte/" an, die
       Seite selbst bezeichnete sich als „…/speisekarte". Beide antworteten mit
       200 – Google muss dann raten, welche gilt, verteilt eingehende Links auf
       zwei Adressen und braucht länger, bis eine neue Seite im Index steht.
       Für Lighthouse ist dieser Widerspruch unsichtbar. */
    /* Einzige erlaubte Abweichung: die Startseite. Die Sitemap-Erweiterung
       schreibt sie ohne Schrägstrich („https://kunde.at"), das canonical mit
       („https://kunde.at/"). Bei einer Adresse ohne Pfad sind beide Formen
       nach RFC dieselbe Seite – anders als bei /speisekarte vs.
       /speisekarte/, wo wirklich zwei Adressen entstehen. Deshalb hier
       normalisiert statt eine unübliche Kanonisierung zu erzwingen. */
    const wurzelGleich = (u) => u.replace(/^(https?:\/\/[^/]+)\/$/, '$1');
    const gemeldet = [...readFileSync(sitemapDatei, 'utf-8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const canonicals = new Set(
      htmlDateien
        .map((f) => readFileSync(f, 'utf-8').match(/rel="canonical"\s+href="([^"]+)"/)?.[1])
        .filter(Boolean)
        .map(wurzelGleich),
    );
    for (const url of gemeldet.map(wurzelGleich)) {
      if (!canonicals.has(url)) {
        fehler(
          `Sitemap meldet ${url}, aber keine Seite bezeichnet sich selbst so.\n` +
            `    Sitemap und canonical müssen zeichengleich sein – sonst zählt Google zwei Adressen für eine Seite.`,
        );
      }
    }
  }

  // Kanbuk-Signatur: Der dezente Footer-Backlink auf kanbuk.com ist Teil des
  // Geschäftsmodells – jede live geschaltete Kundenseite trägt ihn. Baustein:
  // <Signatur /> in der Fußzeile des Kunden-Designs (src/components/Signatur.astro).
  // Geprüft wird nicht nur DASS der Link da ist, sondern auch WIE:
  //   – Anker muss die Marke tragen („Kanbuk"; bei Logo-Link zählt img-alt)
  //   – kein rel="nofollow/sponsored/ugc" (würde den Link still entwerten)
  //   – kein Money-Keyword als Anker (seitenweit über alle Kunden = Link-Spam)
  const MONEY_ANKER = /(webdesign|werbeagentur|grafikdesign|marketing|seo)[-\s]*(agentur\s*)?(wien|österreich|oesterreich|austria)/i;
  for (const f of htmlDateien) {
    const name = kurz(f);
    if (name === '404.html') continue;
    const html = readFileSync(f, 'utf-8');
    const treffer = [
      ...html.matchAll(/<a\b[^>]*href=["']https:\/\/(?:www\.)?kanbuk\.com[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi),
    ];
    if (treffer.length === 0) {
      fehler(
        `${name}: Kanbuk-Signatur fehlt.\n` +
          `    <Signatur /> gehört in die Fußzeile – der Backlink ist Live-Pflicht.`,
      );
      continue;
    }
    if (treffer.length > 1) {
      warnung(`${name}: ${treffer.length} Links auf kanbuk.com – einer pro Seite genügt (mehr wirkt gestellt).`);
    }
    for (const [ganzerTag, inhalt] of treffer) {
      if (/\brel=["'][^"']*(nofollow|sponsored|ugc)/i.test(ganzerTag)) {
        fehler(
          `${name}: Die Kanbuk-Signatur ist per rel="nofollow/sponsored/ugc" entwertet.\n` +
            `    Der Backlink muss followed sein – rel darf höchstens "noopener" enthalten.`,
        );
      }
      // Sichtbarer Text; bei reinem Logo-Link zählt der alt-Text des Bildes.
      const anker = (
        inhalt.replace(/<img\b[^>]*\balt=["']([^"']*)["'][^>]*>/gi, ' $1 ').replace(/<[^>]+>/g, ' ')
      ).replace(/\s+/g, ' ').trim();
      if (!/kanbuk/i.test(anker)) {
        fehler(
          `${name}: Signatur-Anker „${anker.slice(0, 40)}" trägt die Marke nicht.\n` +
            `    Der Linktext muss „Kanbuk" enthalten (Marken-Anker, nie Keyword-Anker).`,
        );
      }
      if (MONEY_ANKER.test(anker)) {
        fehler(
          `${name}: Signatur-Anker „${anker.slice(0, 40)}" ist ein Money-Keyword.\n` +
            `    Seitenweite Keyword-Anker wertet Google als Link-Spam – Marken-Text verwenden.`,
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
//  Ergebnis
// ---------------------------------------------------------------------------
console.log('');
console.log(
  `Geprüft: ${htmlDateien.length} Seite(n), ${bilder.length} Bild(er) — Modus: ${istLive ? 'live' : 'demo'} — Motor ${pkg.version ?? '?'}`,
);
console.log('');

if (warnungen.length > 0) {
  console.log('⚠ Hinweise:');
  for (const w of warnungen) console.log(`  • ${w}`);
  console.log('');
}

if (probleme.length > 0) {
  console.log('✗ Diese Seite darf so nicht raus:');
  for (const p of probleme) console.log(`  • ${p}`);
  console.log('');
  console.log(`${probleme.length} Problem(e). Details zu den Regeln: CLAUDE.md`);
  process.exit(1);
}

console.log('✓ Prüf-Tor bestanden. Die Seite erfüllt den Standard.');
