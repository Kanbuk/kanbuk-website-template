/**
 * CHECK-LAUF – die komplette Prüf-Kette hinter `npm run check`:
 *
 *   1. vorcheck.mjs   – Sekunden-Prüfung OHNE Build (Pflichtfelder, Dateien
 *                       existieren, Binär-Integrität) – fängt ab, was sonst
 *                       erst nach 2 Minuten Build auffiele
 *   2. astro build    – NUR wenn sich seit dem letzten Lauf etwas geändert hat
 *   3. check.mjs      – das Prüf-Tor über die gebaute Seite
 *
 *       npm run check              (übliche Kette)
 *       npm run check -- --live    (zusätzlich Live-Pflichten)
 *       npm run check -- --force   (Build erzwingen, Marke ignorieren)
 *
 * ZUR BAU-ERSPARNIS (mit Vorsicht gebaut): Im Piloten waren 2–3 von ~8
 * Check-Läufen redundant – nichts hatte sich geändert, gebaut wurde trotzdem.
 * Die Marke ist ein Hash über die SORTIERTE Liste aller Quell-Dateien samt
 * Größe und Änderungszeit. Weil die LISTE Teil des Hashes ist, fallen auch
 * GELÖSCHTE Dateien auf (nur mtime-Vergleiche würden sie übersehen). Die Marke
 * liegt IN dist/ – wer dist/ löscht, löscht die Marke mit, und dann wird
 * gebaut. Grundsatz: Im Zweifel bauen.
 */
import { readdirSync, statSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const WURZEL = process.cwd();
const MARKE = join(WURZEL, 'dist', '.kanbuk-marke.json');
const args = process.argv.slice(2);
const force = args.includes('--force');
const live = args.includes('--live');

// --- Was zählt als Quelle? Alles, was das Bau-Ergebnis beeinflusst. ---------
const QUELLEN = ['content.config.ts', 'astro.config.ts', 'package.json', 'tsconfig.json', 'src', 'fotos', 'public', 'daten'];

function sammle(pfad, zeilen) {
  if (!existsSync(pfad)) return;
  const st = statSync(pfad);
  if (st.isDirectory()) {
    for (const e of readdirSync(pfad)) sammle(join(pfad, e), zeilen);
  } else {
    zeilen.push(`${relative(WURZEL, pfad).replace(/\\/g, '/')}|${st.size}|${st.mtimeMs}`);
  }
}

function quellMarke() {
  const zeilen = [];
  for (const q of QUELLEN) sammle(join(WURZEL, q), zeilen);
  zeilen.sort();
  return createHash('sha1').update(zeilen.join('\n')).digest('hex');
}

/** node direkt starten – NIE über die Shell: der Node-Pfad enthält unter
    Windows ein Leerzeichen ("C:\Program Files\…") und cmd zerlegt ihn daran. */
function nodeLauf(argv) {
  const r = spawnSync(process.execPath, argv, { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
/** npx braucht unter Windows die Shell (npx.cmd). Als EIN Befehls-String, nicht
    als Argument-Liste – Liste + shell:true warnt Node zu Recht (keine Escapes);
    die Argumente hier sind feste Literale, kein Nutzer-Input. */
function npxLauf(argv) {
  const r = spawnSync(['npx', ...argv].join(' '), { stdio: 'inherit', shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

// --- 1. Vorprüfung (Sekunden, ohne Build) ------------------------------------
if (existsSync(join(WURZEL, 'scripts', 'vorcheck.mjs'))) {
  nodeLauf([join('scripts', 'vorcheck.mjs')]);
}

// --- 2. Bauen – nur wenn nötig ------------------------------------------------
const marke = quellMarke();
const alteMarke = existsSync(MARKE) ? JSON.parse(readFileSync(MARKE, 'utf-8')).marke : null;

/* ---------------------------------------------------------------------------
 *  TYPPRÜFUNG – IMMER, NICHT NUR WENN GEBAUT WIRD
 * ---------------------------------------------------------------------------
 *  WARUM ÜBERHAUPT: Astro entfernt Typen beim Bauen. Ein falsch geschriebener
 *  Feldname bricht deshalb erst zur Laufzeit ab – und wenn er in einem
 *  optionalen Ausdruck steht (`site.betrieb?.nam`), rendert die Stelle still
 *  LEER und niemand merkt es. Der erste echte Lauf am 30.07.2026 fand sofort
 *  50 Fehler, darunter die Geo-Koordinaten des Betriebs, die unter einem
 *  Feldnamen gelesen wurden, den es nie gab.
 *
 *  WARUM SIE HIER OBEN STEHT UND NICHT MEHR IM BAU-ZWEIG (berichtigt am
 *  31.07.2026): Sie lag bis dahin INNERHALB der Bedingung „nur bauen, wenn sich
 *  Quellen geändert haben". Damit lief sie beim ersten Lauf – und danach nie
 *  wieder, ohne ein Wort. Der Wiederholungslauf war dadurch LEISER als der alte
 *  Zustand: Früher stand wenigstens „⚠ Typprüfung übersprungen" da, danach gar
 *  nichts, und die Kette endete mit „✓ Prüf-Tor bestanden".
 *
 *  Schlimmer noch: Die Bau-Marke unten kennt `api/`, `scripts/` und
 *  `redaktion/` gar nicht – sie beeinflussen das Bau-Ergebnis nicht. Die
 *  Typprüfung deckt sie aber sehr wohl ab (`tsconfig.json` nimmt alles). Wer
 *  also NUR `api/contact.ts` ändert, baute nicht neu und wurde nicht geprüft.
 *  Ausgerechnet diese Datei baut `astro build` bei `output: 'static'` nie mit –
 *  hier ist die einzige Stelle, an der sie lokal überhaupt geprüft wird, und es
 *  ist die Datei, vor deren `.js`-Endungs-Falle der Motor ausdrücklich warnt.
 * ------------------------------------------------------------------------- */
const typenDa = existsSync(join(WURZEL, 'node_modules', '@astrojs', 'check'));
if (typenDa) {
  console.log('Typprüfung (astro check) …');
  const typen = spawnSync('npx astro check --minimumSeverity error', {
    stdio: 'inherit',
    shell: true,
  });
  /* `status === null` heißt ABGEBROCHEN (Signal), nicht bestanden. Das galt
     hier als Erfolg – ein per Strg+C oder vom Betriebssystem beendeter Lauf
     meldete „✓ Typprüfung bestanden". Die beiden Hilfsfunktionen oben machen
     es genau umgekehrt; jetzt auch diese Stelle. */
  if (typen.status !== 0) {
    console.error(
      typen.status === null
        ? '\n✗ Die Typprüfung wurde abgebrochen – das ist kein bestandener Lauf.'
        : '\n✗ Typprüfung fehlgeschlagen – bitte die gemeldeten Stellen beheben.',
    );
    process.exit(typen.status ?? 1);
  }
  console.log('✓ Typprüfung bestanden.\n');
} else if (live) {
  console.error(
    '\n✗ Die Typprüfung fehlt – und vor dem Live-Gang ist das ein Abbruch.\n' +
      '  Die Vorlage liefert @astrojs/check und typescript mit; hier fehlen sie.\n' +
      '  Nachholen: npm i -D @astrojs/check typescript\n' +
      '  Grund: Ein falsch geschriebener Feldname bricht sonst erst beim Besucher ab –\n' +
      '  und steht er in einem optionalen Ausdruck, rendert die Stelle einfach LEER.',
  );
  process.exit(1);
} else {
  console.log(
    '⚠ Typprüfung übersprungen – das ist KEIN grünes Tor (CLAUDE.md Abschnitt 9).\n' +
      '  Einschalten: npm i -D @astrojs/check typescript',
  );
}

// --- 2b. Bauen – nur wenn nötig ------------------------------------------------
if (force || marke !== alteMarke || !existsSync(join(WURZEL, 'dist', 'index.html'))) {
  npxLauf(['astro', 'build']);
  writeFileSync(MARKE, JSON.stringify({ marke: quellMarke() }) + '\n', 'utf-8');
} else {
  console.log('↷ Quellen unverändert – Build übersprungen (npm run check -- --force erzwingt ihn).');
}

// --- 3. Das Prüf-Tor ----------------------------------------------------------
nodeLauf([join('scripts', 'check.mjs'), ...(live ? ['--live'] : [])]);

/* --- 4. Die Browser-Untergrenze ---------------------------------------------
   Hängt hier mit drin und nicht nur in der Definition of Done. Grund: Der
   Ausgangsfall war eine Zusage, die NIEMAND geprüft hat – genau eine vergessene
   Ausführung reicht, damit derselbe Fehler wiederkommt. Die Prüfung braucht
   keinen Browser, misst den fertigen Build und läuft unter einer Sekunde; sie
   hier wegzulassen spart nichts und kostet die Zusage. */
if (existsSync(join(WURZEL, 'scripts', 'browser.mjs'))) {
  nodeLauf([join('scripts', 'browser.mjs')]);
}
