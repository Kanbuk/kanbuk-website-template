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

if (force || marke !== alteMarke || !existsSync(join(WURZEL, 'dist', 'index.html'))) {
  /* Typprüfung VOR dem Bauen – aber NUR, wenn das Werkzeug schon da ist.
     WARUM ÜBERHAUPT: Astro entfernt Typen beim Bauen. Ein falsch geschriebener
     Feldname bricht deshalb erst zur Laufzeit ab – und wenn er in einem
     optionalen Ausdruck steht (`site.betrieb?.nam`), rendert die Stelle still
     LEER und niemand merkt es.
     SEIT 30.07.2026 LIEGEN DIE WERKZEUGE BEI (@astrojs/check + typescript als
     devDependencies). Vorher hing die Prüfung an einer Bedingung und meldete
     „übersprungen" – die Vorlage war damit genau in dem Zustand, den CLAUDE.md
     selbst verbietet („Eine übersprungene Prüfung ist kein grünes Tor").
     Was der erste echte Lauf sofort fand: 50 Fehler, darunter eine kaputte
     Frontmatter-Grenze, ein Katalog-Eintrag ohne Typ (39 Folgefehler aus einem
     Wort) und die Geo-Koordinaten des Betriebs, die unter einem Feldnamen
     gelesen wurden, den es nie gab – der ganze geo-Block fiel still weg.
     Nichts davon hat der Build gemeldet, und keines der anderen Tore konnte es.

     Die Bedingung bleibt trotzdem stehen: Ein Klon kann die Entwickler-Pakete
     abgeräumt haben. Dann ist es aber kein stiller Hinweis mehr, sondern beim
     Live-Gang ein Abbruch. */
  const typenDa = existsSync(join(WURZEL, 'node_modules', '@astrojs', 'check'));
  if (typenDa) {
    console.log('Typprüfung (astro check) …');
    const typen = spawnSync('npx astro check --minimumSeverity error', {
      stdio: 'inherit',
      shell: true,
    });
    if (typen.status !== 0 && typen.status !== null) {
      console.error('\n✗ Typprüfung fehlgeschlagen – bitte die gemeldeten Stellen beheben.');
      process.exit(typen.status);
    }
    console.log('✓ Typprüfung bestanden.\n');
  } else if (process.argv.includes('--live')) {
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
