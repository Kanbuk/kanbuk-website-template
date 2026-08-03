/**
 * =============================================================================
 *  DIE ALTGERÄT-ANSICHT
 * =============================================================================
 *  Zeigt, wie die fertige Seite auf einem alten Browser AUSSIEHT – ohne dass
 *  ein altes Gerät im Haus sein muss.
 *
 *      npm run altgeraet
 *
 *  WARUM ES SIE GIBT: `npm run browser` sagt, WAS ein alter Browser nicht
 *  kann. Es sagt nicht, wie schlimm das aussieht. Genau daran ist die
 *  Einschätzung in einem Kundenprojekt einmal vorbeigegangen: Die Prüfung
 *  meldete „lesbar und bedienbar, nur ärmer" – auf dem echten Gerät des
 *  Auftraggebers klebten dann Elemente aneinander und Abstände fehlten ganz.
 *  Ein Satz im Protokoll ersetzt kein Bild.
 *
 *  WIE ES ARBEITET: Die Seite wird ganz normal im aktuellen Browser geladen,
 *  aber das Stylesheet wird unterwegs abgefangen und um genau das gekürzt,
 *  was der Ziel-Browser nicht versteht. Was übrig bleibt, ist das, was dort
 *  ankommt.
 *
 *  EHRLICHE GRENZE: Das ist eine NACHBILDUNG, kein echter alter Browser.
 *  Sie deckt die CSS-Seite ab. Fehlende JavaScript-Funktionen
 *  (`dialog.showModal`, `replaceChildren`) und Bildformate bildet sie NICHT
 *  nach. Ein Blick auf ein echtes Gerät bleibt die letzte Instanz.
 * =============================================================================
 */
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { starteDistServer } from './lib/dist-server.mjs';
import { verlangeAktuellesDist } from './lib/bau-marke.mjs';

const WURZEL = process.cwd();
const DIST = join(WURZEL, 'dist');
const ZIEL = join(WURZEL, 'pruefung');

verlangeAktuellesDist(WURZEL, 'npm run altgeraet');
mkdirSync(ZIEL, { recursive: true });

const grenzdatei = join(WURZEL, 'browser-untergrenze.json');
const grenze = existsSync(grenzdatei) ? JSON.parse(readFileSync(grenzdatei, 'utf-8')) : { safari: 12 };

/*
 * Was ein Browser unterhalb der Zusage NICHT kann – und was er deshalb wegwirft.
 *
 * Der Unterschied ist entscheidend und der Grund, warum es drei Listen sind:
 *  • Ein unbekannter SELEKTOR macht die ganze Regel ungültig.
 *  • Ein unbekannter WERT oder eine unbekannte EIGENSCHAFT wirft nur die eine
 *    Zeile weg.
 *  • `gap` ist ein Sonderfall: im Raster gibt es das seit Safari 10, im
 *    Flex-Kontext erst ab 14.5. Dieselbe Zeile, zwei Ergebnisse.
 */
const SELEKTOR_UNBEKANNT = [/:has\(/, /:where\(/, /:focus-visible/];
const ZEILE_UNBEKANNT = [
  /clamp\(/,
  /aspect-ratio\s*:/,
  /\d(dvh|svh|lvh)/,
  /^inset\s*:/,
  /^(padding|margin)-(block|inline)/,
  /color-mix\(/,
  /@layer/,
];
const FLEX_LUECKE = /^(gap|row-gap|column-gap)\s*:/;

/** Kürzt ein Stylesheet auf das, was der alte Browser wirklich anwendet. */
function wieAlterBrowser(css) {
  let raus = '';
  let i = 0;
  while (i < css.length) {
    const auf = css.indexOf('{', i);
    if (auf === -1) {
      raus += css.slice(i);
      break;
    }

    const kopf = css.slice(i, auf);
    const atRegel = kopf.trim().split(/[;}]/).pop() ?? '';

    /* EIN `@supports` MIT UNBEKANNTER BEDINGUNG FÄLLT GANZ WEG – samt Inhalt.
       Genau dafür gibt es die Regel: Der alte Browser versteht die Bedingung
       nicht, also überspringt er den Block und behält, was davor stand
       (CLAUDE.md 4a, Weg 3). Hier wurde er unverändert durchgereicht – die
       Nachbildung zeigte damit den modernen Zustand und hätte einen korrekt
       abgesicherten Wert als kaputt dargestellt. */
    if (/@supports/.test(atRegel) && ZEILE_UNBEKANNT.some((r) => r.test(kopf))) {
      let tiefe = 1;
      let j = auf + 1;
      while (j < css.length && tiefe > 0) {
        if (css[j] === '{') tiefe++;
        else if (css[j] === '}') tiefe--;
        j++;
      }
      i = j;
      continue;
    }

    /* Alle anderen verschachtelten Blöcke (@media, @supports mit bekannter
       Bedingung) unverändert durchreichen – ihr Inhalt wird beim nächsten
       Durchlauf selbst behandelt. */
    if (/@(media|supports|layer|font-face|keyframes)/.test(atRegel)) {
      raus += kopf + '{';
      i = auf + 1;
      continue;
    }

    const zu = css.indexOf('}', auf);
    if (zu === -1) {
      raus += css.slice(i);
      break;
    }
    const koerper = css.slice(auf + 1, zu);

    if (SELEKTOR_UNBEKANNT.some((r) => r.test(kopf))) {
      i = zu + 1; // ganze Regel fällt weg
      continue;
    }

    const istFlex = /display\s*:\s*(inline-)?flex/.test(koerper);
    const behalten = koerper
      .split(';')
      .map((d) => d.trim())
      .filter(Boolean)
      /* EINE TOKEN-ZEILE WIRD UNAUFLÖSBAR GEMACHT, NICHT GELÖSCHT.
         Das ist der Unterschied zwischen Nachbildung und Wirklichkeit, und er
         hat am 03.08.2026 einen Fehler als behoben durchgehen lassen.

         Ein echter alter Browser wirft `--raum-s: clamp(…)` NICHT weg. Eine
         Custom Property nimmt jeden Zeichenstrom an; die Zeile überlebt. Erst
         beim Einsetzen fällt auf, dass `clamp(…)` dort nichts zu suchen hat –
         und dann ist die EIGENSCHAFT ungültig und fällt auf ihren Anfangswert.
         Ein `var(--raum-s, 1rem)` hilft dabei nicht: Der Ersatzwert greift nur
         bei einer Variablen, die gar nicht gesetzt ist.

         Dieses Werkzeug löschte die Zeile – damit war die Variable ungesetzt,
         der Ersatzwert griff, und das Bild sah richtig aus. Genau die
         Absicherung, die in Wirklichkeit nicht wirkt, wurde hier bestätigt.

         Jetzt bleibt die Deklaration stehen und bekommt einen Wert, den kein
         Browser auflösen kann. Damit verhält sich die Nachbildung wie das
         Gerät: Wer die Variable benutzt, verliert die Eigenschaft. */
      .map((d) => {
        if (!ZEILE_UNBEKANNT.some((r) => r.test(d))) return d;
        const name = d.match(/^(--[\w-]+)\s*:/);
        return name ? `${name[1]}:kanbuk-nicht-aufloesbar` : '';
      })
      .filter(Boolean)
      .filter((d) => !(istFlex && FLEX_LUECKE.test(d)));

    raus += kopf + '{' + behalten.join(';') + '}';
    i = zu + 1;
  }
  return raus;
}

const BREITEN = [350, 768, 1440];
/* Mehr als sechs Seiten sind zum Hinsehen zu viel – und was auf sechs Seiten
   nicht auffällt, fällt auf zwanzig auch nicht auf. Gekappt wird SICHTBAR,
   nie still: Eine stille Begrenzung liest sich später wie „alles geprüft". */
const MAX_SEITEN = 6;

const { basis, seiten: alleSeiten, stop } = await starteDistServer(DIST);
const seiten = alleSeiten.slice(0, MAX_SEITEN);
if (alleSeiten.length > seiten.length) {
  console.log(`  (${alleSeiten.length} Seiten gebaut, die ersten ${seiten.length} werden gezeigt)`);
}

const browser = await chromium.launch();
let gekuerzteBloecke = 0;

for (const breite of BREITEN) {
  const kontext = await browser.newContext({ viewport: { width: breite, height: 1200 } });

  // Stylesheets unterwegs kürzen …
  await kontext.route('**/*.css', async (route) => {
    const antwort = await route.fetch();
    const gekuerzt = wieAlterBrowser(await antwort.text());
    route.fulfill({ response: antwort, body: gekuerzt, headers: { 'content-type': 'text/css' } });
  });

  for (const seite of seiten) {
    const page = await kontext.newPage();
    await page.goto(basis + seite, { waitUntil: 'load' });

    /* … und dasselbe mit den Stilblöcken, die in der HTML-Seite selbst stehen
       (`inlineStylesheets: 'auto'`). Gekürzt wird hier draußen: Die Funktion in
       die Seite zu schieben scheitert daran, dass sie dort ihre Merkmalslisten
       nicht kennt – und zwei Fassungen derselben Logik wären eine Fehlerquelle. */
    const stile = await page.$$eval('style', (els) => els.map((e) => e.textContent ?? ''));
    const gekuerzt = stile.map(wieAlterBrowser);
    await page.evaluate((liste) => {
      document.querySelectorAll('style').forEach((s, i) => {
        s.textContent = liste[i];
      });
    }, gekuerzt);
    gekuerzteBloecke += stile.length;

    await page.waitForTimeout(250);
    const kennung = seite === '/' ? '-start' : seite.replace(/\/$/, '').replace(/\//g, '-');
    const name = `altgeraet${kennung}-${breite}.png`;
    await page.screenshot({ path: join(ZIEL, name), fullPage: false });
    console.log('  ▸ pruefung/' + name);
    await page.close();
  }
  await kontext.close();
}

await browser.close();
stop();

writeFileSync(
  join(ZIEL, 'altgeraet.md'),
  '# Altgerät-Ansicht\n\n' +
    'So sieht die Seite aus, wenn dem Browser fehlt:\n' +
    '- clamp() – die gesamte Größen-Skala (Abstände UND Schriftgrößen)\n' +
    '- gap im Flex-Kontext\n' +
    '- aspect-ratio, dvh, inset, logische Kurzformen\n' +
    '- :has(), :where(), :focus-visible, color-mix()\n\n' +
    `Entspricht ungefähr Safari ${grenze.safari} – der BEDIENBAR-Grenze.\n` +
    `Vollständig zugesagt ist ab Safari ${grenze.vollstaendig_ab_safari ?? '?'};\n` +
    'dazwischen sieht es aus wie hier, funktioniert aber vollständig.\n\n' +
    'NACHBILDUNG – JavaScript-Funktionen und Bildformate sind NICHT nachgestellt.\n',
);

console.log(
  `\n✓ Altgerät-Ansicht erzeugt (${seiten.length * BREITEN.length} Bilder, ${gekuerzteBloecke} Stilblöcke gekürzt).`,
);
console.log('  Jetzt ANSEHEN – die Bilder zeigen, was ein Besucher mit altem Gerät sieht.');
console.log('  Erwartet wird „ärmer, aber lesbar und bedienbar". Alles andere ist ein Befund.\n');
