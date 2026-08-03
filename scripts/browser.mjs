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
 *   • Geprüft wird gegen NAMENTLICHE Listen (`JS_MERKMALE`, `CSS_MERKMALE`)
 *     plus alles, was der Übersetzer selbst nicht umwandeln kann. Ein
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
import { verlangeAktuellesDist } from './lib/bau-marke.mjs';
import { transformSync as jsPruefen } from 'esbuild';

const WURZEL = process.cwd();
const DIST = join(WURZEL, 'dist');
const GRENZDATEI = join(WURZEL, 'browser-untergrenze.json');

verlangeAktuellesDist(WURZEL, 'npm run browser');
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

/*
 * Schreibweisen, die ein Browser unterhalb der Grenze nicht LESEN kann.
 *
 * WARUM EINE NAMENTLICHE LISTE UND KEIN AUTOMATISMUS: Der erste Versuch war,
 * das Gebaute zweimal zu uebersetzen (einmal gegen die Grenze, einmal gegen
 * "esnext") und die Ergebnisse zu vergleichen. Das war zu grob - der
 * Uebersetzer trifft je nach Ziel auch reine Schreibentscheidungen. Gemessen:
 * Er machte aus `[data-tabs]` in Schraegstrichen ein normales
 * Anfuehrungszeichen. Voellig gleichwertig, aber der Vergleich meldete es als
 * Verstoss - ein Waechter, der bei jedem Bau bellt, wird abgeschaltet.
 *
 * Also benannt, wie beim CSS auch: Jede Zeile hier ist ein Fall, der wirklich
 * Schaden anrichtet, mit der Version, ab der es geht. Was fehlt, faellt durch -
 * dann gehoert es hier hinein.
 *
 * WANN DAS UEBERHAUPT VORKOMMT: Normale Skripte wandelt der Bau selbst um.
 * Durch die Maschen kommt nur, was daran vorbeigeht - allen voran ein
 * `<script is:inline>`. Genau dafuer ist diese Liste da.
 */
const JS_MERKMALE = [
  { name: 'Fragezeichen-Punkt (a?.b)', suche: /\?\.\s*[A-Za-z_$[(]/, abSafari: 13.1 },
  { name: 'doppeltes Fragezeichen (a ?? b)', suche: /\?\?[^=]/, abSafari: 13.1 },
  { name: 'zuweisende Kurzformen (??=, ||=, &&=)', suche: /(\?\?|\|\||&&)=/, abSafari: 14 },
  { name: 'private Klassenfelder (#name)', suche: /(^|[\s;{])#[A-Za-z_$][\w$]*\s*[=(;]/, abSafari: 14.1 },
  { name: 'statischer Klassenblock (static { … })', suche: /static\s*\{/, abSafari: 16.4 },
  { name: 'Rueckschau im Suchmuster ((?<=…))', suche: /\(\?<[=!]/, abSafari: 16.4 },
];

/**
 * Prueft ein Skriptstueck gegen die Untergrenze.
 *
 * Zwei Wege, weil es zwei Arten von Schaden gibt:
 *  1. Was der Uebersetzer GAR NICHT umwandeln kann (das Zerlegen in Klammern):
 *     Das meldet er selbst als Ausnahme, samt Zeilennummer.
 *  2. Was er umwandeln KOENNTE, im fertigen Bau aber trotzdem noch dasteht:
 *     Dann ist es an ihm vorbeigelaufen - siehe JS_MERKMALE oben.
 *
 * Beides ist derselbe Schaden fuer den Besucher: Der Browser bricht beim
 * EINLESEN ab. Es faellt nicht ein Baustein aus, sondern alle gleichzeitig -
 * Menue, Filter, Merkliste, Formular, Lightbox - und zwar ohne Fehlermeldung.
 */
function jsBefunde(stueck) {
  const raus = [];

  try {
    jsPruefen(stueck.code, { target: jsZiele, loader: 'js' });
  } catch (fehler) {
    for (const e of fehler.errors ?? []) {
      raus.push({
        art: 'JavaScript',
        quelle: stueck.quelle + (e.location ? ` (Zeile ${e.location.line})` : ''),
        text: e.text,
        folge: 'Das gesamte Skript wird nicht ausgefuehrt - KEIN Bedien-Element funktioniert.',
      });
    }
    return raus; // Steckt schon eine unumwandelbare Stelle drin, reicht das.
  }

  for (const merkmal of JS_MERKMALE) {
    if (merkmal.abSafari <= grenze.safari) continue; // von der Grenze gedeckt
    if (!merkmal.suche.test(stueck.code)) continue;
    raus.push({
      art: 'JavaScript',
      quelle: stueck.quelle,
      text: `${merkmal.name} - geht erst ab Safari ${merkmal.abSafari}, bedienbar zugesagt ist ab ${grenze.safari}`,
      folge: [
        'Der Browser bricht beim EINLESEN ab – Menü, Filter, Merkliste, Formular und Lightbox',
        '      sind gleichzeitig tot, ohne Fehlermeldung.',
        '      Häufigste Ursache: ein <script is:inline> – das geht am Bau-Ziel vorbei und',
        '      landet unverändert in der Seite.',
      ].join('\n'),
    });
  }
  return raus;
}

for (const stueck of jsStuecke) {
  befunde.push(...jsBefunde(stueck));
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
function istAbgesichert(code, treffer, merkmal) {
  // Die Deklaration, in der der Treffer steckt.
  let start = treffer;
  while (start > 0 && !';{}'.includes(code[start - 1])) start--;
  const doppelpunkt = code.slice(start, treffer).indexOf(':');
  if (doppelpunkt === -1) return false; // kein Eigenschafts-Wert-Paar (z. B. @media)
  const eigenschaft = code.slice(start, start + doppelpunkt).trim();
  if (!eigenschaft) return false;

  /* DER TREFFER STECKT IN DER BEDINGUNG EINES `@supports` – dort ist er die
     Absicherung selbst, keine Verwendung.

     Wer Weg 3 aus CLAUDE.md 4a wörtlich befolgt, schreibt das Merkmal
     zwangsläufig zweimal hin: einmal in die Bedingung, einmal in die
     Deklaration. Die Prüfung verlangt aber, dass ALLE Fundstellen abgesichert
     sind – und die Bedingung ist keine. Damit war der vorgeschriebene Weg
     nicht sauber begehbar, egal wie richtig man ihn ging.

     `@media` ist davon nicht betroffen: Dort steht vor dem Treffer kein
     Doppelpunkt, die Funktion kehrt schon oben zurück. Die Regel
     „Kurzform in @media" bleibt also scharf. */
  if (/^@supports\b/.test(eigenschaft)) return true;

  /*
   * DEN GANZEN BLOCK ABSUCHEN, nicht nur die Zeile davor.
   *
   * Die erste Fassung sah ausschließlich die UNMITTELBAR vorangehende
   * Deklaration an. Das ging schief, weil der Verdichter umsortiert: Im
   * Quelltext standen Ersatzwert und moderner Wert direkt untereinander, im
   * fertigen CSS schob sich eine fremde Zeile dazwischen
   * (`…calc(100vh - 100%);overscroll-behavior:contain;max-height:calc(100dvh…`).
   * Die Absicherung war da, die Prüfung sah sie nur nicht – und meldete einen
   * Ausfall, den es nicht gab. Eine Meldung, die nicht stimmt, ist schlimmer
   * als keine: Beim nächsten Mal glaubt sie niemand mehr.
   */
  let blockStart = start;
  while (blockStart > 0 && code[blockStart - 1] !== '{' && code[blockStart - 1] !== '}') blockStart--;

  /* WEG 3 ZUERST: STEHT DAS GANZE IN EINEM PASSENDEN `@supports`?
     Dann ist es abgesichert, OHNE dass ein Ersatzwert nötig wäre – ein alter
     Browser überspringt den Block vollständig. Genau das ist der Ausweg, den
     CLAUDE.md Abschnitt 4a als Weg 3 vorschreibt, wenn die moderne Zeile ein
     `var()` enthält und ein Ersatzwert deshalb nicht wirkt.

     Hier wurde `@supports` erst NACH `if (!hatErsatzwert) return false` geprüft.
     Damit zählte es nur, wenn zusätzlich ein Ersatzwert danebenstand – also
     genau dann nicht, wenn man es braucht. Am 03.08.2026 nachgemessen: der
     wörtlich aus CLAUDE.md übernommene Weg 3 wurde als Verstoß gemeldet.

     Geprüft wird die BEDINGUNG des `@supports` gegen dasselbe Muster, nach dem
     gesucht wurde. Ein `@supports (display: grid)` deckt kein `color-mix()` –
     sonst könnte jeder beliebige Block alles decken. Die Klammertiefe sagt, ob
     der Treffer wirklich noch darin liegt. */
  const davor = code.slice(0, blockStart);
  const letztesSupports = davor.lastIndexOf('@supports');
  if (letztesSupports !== -1) {
    const rest = davor.slice(letztesSupports);
    let tiefe = 0;
    for (const z of rest) {
      if (z === '{') tiefe++;
      else if (z === '}') tiefe--;
    }
    const bedingung = rest.slice(0, rest.indexOf('{'));
    /* ZWEI OFFENE KLAMMERN, NICHT EINE: die des `@supports` und die der Regel
       darin. `blockStart` steht bereits INNERHALB der Regel, deren `{` also
       mitgezählt wird. Mit `> 0` hätte auch ein längst geschlossenes
       `@supports` weiter oben in der Datei alles Folgende gedeckt. */
    if (tiefe >= 2 && new RegExp(merkmal.suche.source).test(bedingung)) return true;
  }

  const hatErsatzwert = code
    .slice(blockStart, start)
    .split(';')
    .some((d) => d.trim().startsWith(eigenschaft + ':'));
  if (!hatErsatzwert) return false;

  /* EIN ERSATZWERT RETTET NICHT, WENN DIE MODERNE ZEILE EIN `var()` ENTHÄLT.
     Das ist keine Feinheit, sondern in CLAUDE.md Abschnitt 4a nachgemessen:
     Eine Zeile mit `var()` kann der Browser beim EINLESEN nicht prüfen. Er
     behält sie, setzt später die Variable ein, stellt dann fest, dass das
     Ergebnis ungültig ist – und setzt die Eigenschaft auf NICHTS. Der
     Ersatzwert davor wird dabei mitgelöscht. Gemessen: Rahmen 0px statt 1px.

     Bis hierher hat diese Funktion genau solche Fälle als „abgesichert"
     durchgewinkt – sie verglich nur Eigenschaftsnamen. Damit bestätigte das
     fünfte Tor eine Absicherung, von der die eigene Regel im selben Repo
     festhält, dass sie nicht wirkt. Für solche Fälle ist `@supports` der
     einzige tragfähige Weg (CLAUDE.md 4a, Weg 3) – und der ist oben schon
     geprüft, bevor überhaupt ein Ersatzwert verlangt wird. */
  /* DIE DEKLARATION ENDET AM ERSTEN `;` ODER `}` – nicht nur am `;`.
     Hier stand nur `indexOf(';', treffer)`. Der Verdichter lässt das letzte
     Semikolon eines Blocks weg; steckt der Treffer in der LETZTEN Deklaration,
     zeigte die Suche deshalb ins nächste Regelwerk, und alles dazwischen galt
     als Teil dieser Zeile. Ein `var()` aus einer fremden Regel machte damit
     korrekt abgesicherten Code zum Verstoß.

     Am 03.08.2026 nachgemessen, an genau diesem Muster:
       .karte{background:#eee;background:color-mix(in srgb,#000 12%,transparent)}
       .andere{color:var(--farbe-text);border:0}
     Der Ersatzwert steht da, die moderne Zeile enthält kein `var()` – das Tor
     meldete trotzdem einen Verstoß.

     Warum das schlimmer ist als eine übersehene Stelle: Ein grundlos rotes Tor
     wird weggeräumt. Der nächste Chat baut die funktionierende Absicherung aus,
     um es grün zu bekommen – und danach ist der Fehler wirklich da. */
  const enden = [code.indexOf(';', treffer), code.indexOf('}', treffer)].filter((i) => i !== -1);
  const deklaration = code.slice(start, enden.length ? Math.min(...enden) : undefined);
  if (/var\(/.test(deklaration)) return false;
  return true;
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
    if (treffer.every((t) => istAbgesichert(stueck.code, t.index, merkmal))) continue;

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
