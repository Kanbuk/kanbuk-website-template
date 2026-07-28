/**
 * =============================================================================
 *  DIE BROWSER-PRÜFUNG – das fünfte Tor
 * =============================================================================
 *  Hält die FERTIG GEBAUTE Seite gegen die Untergrenze aus
 *  `browser-untergrenze.json`.
 *
 *      npm run browser
 *
 *  WARUM ES SIE GIBT: In einem Kundenprojekt war die abgenommene Seite auf
 *  einem echten älteren Gerät unbenutzbar, während ALLE vier bestehenden
 *  Prüfungen grün waren. Das ist kein Zufall, sondern bauartbedingt:
 *  `check`, `sicht`, `interaktion` und `abgleich` fahren alle dasselbe
 *  aktuelle Chromium. Was ein Browser von 2020 nicht versteht, kann keine
 *  davon sehen.
 *
 *  Konkret war passiert: Der CSS-Verdichter schrieb `@media (min-width:900px)`
 *  in die Kurzform `@media (width>=900px)` um – verständlich erst ab Safari
 *  16.4. Wer sie nicht kennt, verwirft den GANZEN Regelblock. Auf älteren
 *  iPhones blieb dadurch der Menü-Knopf unsichtbar UND die Menüliste auch:
 *  keine Navigation mehr, auf keiner Seite.
 *
 *  Diese Prüfung braucht KEIN altes Gerät. Sie misst mit denselben
 *  Werkzeugen, mit denen gebaut wird.
 *
 *  ─────────────────────────────────────────────────────────────────────────
 *  WAS SIE NICHT SIEHT – damit niemand sich in falscher Sicherheit wiegt:
 *
 *   • JavaScript prüft sie VOLLSTÄNDIG (der Übersetzer kennt jede
 *     Schreibweise). CSS dagegen gegen eine NAMENTLICHE Liste unten. Ein
 *     brandneues CSS-Merkmal, das dort fehlt, fällt durch. Kommt ein Fund
 *     dazu: in `CSS_MERKMALE` eintragen, dann ist er dauerhaft erfasst.
 *     Ein maschinelles Auffangnetz gibt es bewusst NICHT – der Versuch, das
 *     Gebaute noch einmal durch den Übersetzer zu schicken, meldete
 *     konstruktionsbedingt immer Unterschiede (Hersteller-Präfixe) und war
 *     damit wertlos.
 *   • Funktionen, die erst IM BROWSER fehlen, nicht in der Datei:
 *     `dialog.showModal()` (ab Safari 15.4), `replaceChildren` (14),
 *     `matchMedia.addEventListener` (14). Syntaktisch sind sie einwandfrei –
 *     kein Übersetzer der Welt sieht daran etwas.
 *   • Bild- und Schriftformate, Zertifikate, Netzwerk.
 *   • WIE SCHLIMM es aussieht. Diese Prüfung sagt, WAS fehlt. Das Aussehen
 *     zeigt `npm run altgeraet`.
 *
 *  Rot = die Seite darf nicht raus.
 * =============================================================================
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { transformSync as jsPruefen } from 'esbuild';

const WURZEL = process.cwd();
const DIST = join(WURZEL, 'dist');
const GRENZDATEI = join(WURZEL, 'browser-untergrenze.json');

if (!existsSync(DIST)) {
  console.error('\n✖ Es gibt keinen dist-Ordner. Zuerst bauen: npm run build\n');
  process.exit(1);
}
if (!existsSync(GRENZDATEI)) {
  console.error('\n✖ browser-untergrenze.json fehlt – ohne Zusage gibt es nichts zu prüfen.\n');
  process.exit(1);
}

const grenze = JSON.parse(readFileSync(GRENZDATEI, 'utf-8'));
const befunde = [];

/* ---------------------------------------------------------------------------
 *  Alle Dateien einsammeln – auch das, was IN den HTML-Seiten steht.
 *
 *  WICHTIG: Ein Teil der Stile und Skripte landet nicht unter _astro/, sondern
 *  direkt in den HTML-Seiten (`inlineStylesheets: 'auto'` in astro.config.ts).
 *  Eine Prüfung, die nur _astro/ ansieht, übersieht davon mehrere tausend
 *  Zeichen – genau dort steckte beim ersten Fund die Hälfte der Treffer.
 * ------------------------------------------------------------------------ */
function alleDateien(ordner, treffer = []) {
  for (const eintrag of readdirSync(ordner, { withFileTypes: true })) {
    const pfad = join(ordner, eintrag.name);
    if (eintrag.isDirectory()) alleDateien(pfad, treffer);
    else treffer.push(pfad);
  }
  return treffer;
}

const dateien = alleDateien(DIST);
const kurz = (p) => p.slice(DIST.length + 1).replace(/\\/g, '/');

const cssStuecke = [];
const jsStuecke = [];

for (const pfad of dateien) {
  if (pfad.endsWith('.css')) {
    cssStuecke.push({ quelle: kurz(pfad), code: readFileSync(pfad, 'utf-8') });
  } else if (pfad.endsWith('.js')) {
    jsStuecke.push({ quelle: kurz(pfad), code: readFileSync(pfad, 'utf-8') });
  } else if (pfad.endsWith('.html')) {
    const html = readFileSync(pfad, 'utf-8');
    let nr = 0;
    for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
      cssStuecke.push({ quelle: `${kurz(pfad)} (Stilblock ${++nr})`, code: m[1] });
    }
    nr = 0;
    for (const m of html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*text\/plain)[^>]*>([\s\S]*?)<\/script>/g)) {
      const inhalt = m[1].trim();
      // JSON-LD und geparkte Einwilligungs-Skripte sind kein ausgeführtes JavaScript.
      if (!inhalt || /application\/(ld\+json|json)/.test(m[0])) continue;
      jsStuecke.push({ quelle: `${kurz(pfad)} (Skriptblock ${++nr})`, code: inhalt });
    }
  }
}

/* ---------------------------------------------------------------------------
 *  JAVASCRIPT – der schwerste Fall.
 *
 *  Eine Schreibweise, die der Browser nicht LESEN kann, ist kein Ausfall
 *  eines Bausteins: Er bricht beim Einlesen ab, und damit sind Menü, Filter,
 *  Merkliste, Formular und Lightbox gleichzeitig tot – ohne dass der Besucher
 *  eine Fehlermeldung sieht. Weil es genau ein Bündel gibt, gibt es auch
 *  keine Teilrettung.
 * ------------------------------------------------------------------------ */
const jsZiele = [
  'safari' + grenze.safari,
  'chrome' + grenze.chrome,
  'firefox' + grenze.firefox,
  'edge' + grenze.edge,
];

for (const stueck of jsStuecke) {
  try {
    jsPruefen(stueck.code, { target: jsZiele, loader: 'js' });
  } catch (fehler) {
    for (const e of fehler.errors ?? []) {
      const ort = e.location ? ` (Zeile ${e.location.line})` : '';
      befunde.push({
        art: 'JavaScript',
        quelle: stueck.quelle + ort,
        text: e.text,
        folge: 'Das gesamte Skript wird nicht ausgeführt – KEIN Bedien-Element funktioniert.',
      });
    }
  }
}

/* ---------------------------------------------------------------------------
 *  CSS – gegen eine benannte Liste.
 *
 *  Benannt, damit die Meldung nicht nur sagt WAS fehlt, sondern auch, was
 *  der Besucher davon merkt. Eine anonyme „nicht unterstützt"-Meldung
 *  hilft niemandem, der nicht programmiert.
 * ------------------------------------------------------------------------ */
const CSS_MERKMALE = [
  {
    name: 'Kurzform in @media, z. B. (width>=900px)',
    suche: /@media[^{]*\(\s*width\s*[<>]=/,
    abSafari: 16.4,
    folge: 'Der GANZE Regelblock wird verworfen – im Zweifel verschwindet die halbe Seitenaufteilung samt Navigation.',
  },
  { name: ':has()', suche: /:has\(/, abSafari: 15.4, folge: 'Die ganze Regel wird verworfen.' },
  { name: 'color-mix()', suche: /color-mix\(/, abSafari: 16.2, folge: 'Die Farbe fällt aus.' },
  { name: '@layer', suche: /@layer\b/, abSafari: 15.4, folge: 'Die Reihenfolge der Stile stimmt nicht mehr.' },
  {
    name: 'aspect-ratio',
    suche: /aspect-ratio\s*:/,
    abSafari: 15,
    folge: 'Bilder reservieren keinen Platz – das Layout springt beim Laden.',
  },
  { name: 'dvh / svh / lvh', suche: /\d(dvh|svh|lvh)\b/, abSafari: 15.4, folge: 'Die Höhenangabe fällt aus.' },
  {
    name: 'clamp()',
    suche: /clamp\(/,
    abSafari: 13.1,
    folge: 'In einer Token-Variablen fallen ALLE Abstände und Schriftgrößen gleichzeitig aus.',
  },
  {
    name: 'gap in Flexbox',
    suche: /display\s*:\s*flex[^}]*[; ]gap\s*:/,
    abSafari: 14.1,
    folge: 'Die Abstände fehlen wortlos – Elemente kleben aneinander.',
  },
  { name: 'inset-Kurzform', suche: /[;{]\s*inset\s*:/, abSafari: 14.1, folge: 'Die Positionierung fällt aus.' },
  {
    name: 'logische Kurzformen (padding-block …)',
    suche: /(padding|margin)-(block|inline)\s*:/,
    abSafari: 15,
    folge: 'Abstände und die Zentrierung des Inhalts fallen aus.',
  },
];

/**
 * Steht direkt DAVOR dieselbe Eigenschaft mit einem einfacheren Wert?
 *
 * Das ist der klassische Ersatzwert und der einzige Weg, ein modernes
 * CSS-Merkmal gefahrlos zu benutzen:
 *
 *     background: var(--farbe-hintergrund);          ← alter Browser nimmt den
 *     background: color-mix(in srgb, … 82%, …);      ← neuer überschreibt ihn
 *
 * Ein Browser, der die zweite Zeile nicht versteht, verwirft NUR sie und
 * behält die erste. Ohne diese Erkennung würde die Prüfung jeden korrekt
 * abgesicherten Einsatz als Verstoß melden – und wäre damit wertlos.
 */
function istAbgesichert(code, treffer) {
  let start = treffer;
  while (start > 0 && !';{}'.includes(code[start - 1])) start--;
  const doppelpunkt = code.slice(start, treffer).indexOf(':');
  if (doppelpunkt === -1) return false; // kein Eigenschafts-Wert-Paar (z. B. @media)
  const eigenschaft = code.slice(start, start + doppelpunkt).trim();
  if (!eigenschaft) return false;

  const vorEnde = start - 1;
  if (vorEnde <= 0 || code[vorEnde] !== ';') return false; // davor beginnt der Block
  let vorStart = vorEnde;
  while (vorStart > 0 && !';{}'.includes(code[vorStart - 1])) vorStart--;
  return code.slice(vorStart, vorEnde).trim().startsWith(eigenschaft + ':');
}

/*
 * ZWEI GRENZEN, ZWEI BEWERTUNGEN – siehe `_4_zwei_stufen` in der JSON-Datei.
 *
 * Rot wird nur, was VERMEIDBAR ist: Merkmale oberhalb der Aussehen-Grenze
 * hätte der Übersetzer umschreiben müssen, oder sie stehen dort aus Versehen.
 * Merkmale zwischen den beiden Grenzen sind bekannt und bewusst hingenommen –
 * sie kosten Aussehen, nicht Bedienbarkeit. Sie werden trotzdem AUFGEZÄHLT,
 * damit niemand glaubt, unterhalb der Zusage sähe alles gleich aus.
 */
const einschraenkungen = new Set();

for (const stueck of cssStuecke) {
  for (const merkmal of CSS_MERKMALE) {
    if (merkmal.abSafari <= grenze.safari) continue; // von der Grenze gedeckt

    const treffer = [...stueck.code.matchAll(new RegExp(merkmal.suche.source, 'g'))];
    if (treffer.length === 0) continue;
    // Alle Vorkommen mit Ersatzwert abgesichert? Dann ist nichts zu melden.
    if (treffer.every((t) => istAbgesichert(stueck.code, t.index))) continue;

    if (merkmal.abSafari <= grenze.vollstaendig_ab_safari) {
      einschraenkungen.add(`${merkmal.name} (ab Safari ${merkmal.abSafari}) – ${merkmal.folge}`);
      continue;
    }
    befunde.push({
      art: 'CSS',
      quelle: stueck.quelle,
      text: `${merkmal.name} – geht erst ab Safari ${merkmal.abSafari}, vollständig zugesagt ist ab ${grenze.vollstaendig_ab_safari}`,
      folge: merkmal.folge,
    });
  }
}

/* ------------------------------------------------------------------------ */

const zahl = (n, ein, mehr) => `${n} ${n === 1 ? ein : mehr}`;
console.log(
  `\nGeprüft: ${zahl(cssStuecke.length, 'Stilblock', 'Stilblöcke')}, ` +
    `${zahl(jsStuecke.length, 'Skript', 'Skripte')}\n` +
    `  Bedienbar ab Safari ${grenze.safari} · vollständig ab Safari ${grenze.vollstaendig_ab_safari}`,
);

if (einschraenkungen.size > 0) {
  console.log(`\n  Zwischen Safari ${grenze.safari} und ${grenze.vollstaendig_ab_safari} nicht darstellbar:`);
  for (const e of [...einschraenkungen].sort()) console.log('   · ' + e);
  console.log('   Die Seite bleibt dort lesbar und bedienbar, sieht aber ärmer aus.');
  console.log('   Wie ärmer, zeigt: npm run altgeraet');
}

if (befunde.length === 0) {
  console.log('\n✓ Die gebaute Seite hält die Browser-Untergrenze ein.\n');
  process.exit(0);
}

console.error(`\n✖ ${zahl(befunde.length, 'Verstoß', 'Verstöße')} gegen die Untergrenze:\n`);
for (const b of befunde) {
  console.error(`  [${b.art}] ${b.quelle}`);
  console.error(`      ${b.text}`);
  console.error(`      Folge: ${b.folge}\n`);
}
console.error(
  '  Das ist fast immer eine fehlende Einstellung, kein Fehler im Quelltext:\n' +
    '  In astro.config.ts muss der vite-Abschnitt die Untergrenze weitergeben\n' +
    '  (build.target und css.lightningcss.targets). Danach neu bauen.\n' +
    '  Bei JavaScript-Befunden: siehe CLAUDE.md, „Schreibweisen im Browser-Code".\n',
);
process.exit(1);
