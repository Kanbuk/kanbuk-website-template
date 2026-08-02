/**
 * Ist `dist/` noch der Bau des aktuellen Quelltextes?
 *
 * WARUM ES DIESE DATEI GIBT: Fünf der sechs Tore messen `dist/` und prüften
 * nur, DASS der Ordner existiert – nicht, ob er noch zum Quelltext passt. Wer
 * eine Seite ändert und danach `npm run sicht`, `npm run interaktion`,
 * `npm run browser`, `npm run altgeraet` oder `npm run abgleich` startet,
 * misst den ALTEN Build und bekommt grün. Das ist exakt der Fehlertyp, gegen
 * den der Motor sonst überall argumentiert: ein Tor, das ja sagt, ohne
 * hingesehen zu haben.
 *
 * Die Marke ist ein Hash über die SORTIERTE Liste aller Quell-Dateien samt
 * Größe und Änderungszeit. Weil die LISTE Teil des Hashes ist, fallen auch
 * gelöschte Dateien auf.
 */
import { readdirSync, statSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

/** Alles, was das Bau-Ergebnis beeinflusst. */
export const QUELLEN = [
  'content.config.ts',
  'astro.config.ts',
  'package.json',
  'tsconfig.json',
  'browser-untergrenze.json',
  'src',
  'fotos',
  'public',
  'daten',
];

function sammle(pfad, wurzel, zeilen) {
  if (!existsSync(pfad)) return;
  const st = statSync(pfad);
  if (st.isDirectory()) {
    for (const e of readdirSync(pfad)) sammle(join(pfad, e), wurzel, zeilen);
  } else {
    zeilen.push(`${relative(wurzel, pfad).replace(/\\/g, '/')}|${st.size}|${st.mtimeMs}`);
  }
}

export function quellMarke(wurzel) {
  const zeilen = [];
  for (const q of QUELLEN) sammle(join(wurzel, q), wurzel, zeilen);
  zeilen.sort();
  return createHash('sha1').update(zeilen.join('\n')).digest('hex');
}

export function markePfad(wurzel) {
  return join(wurzel, 'dist', '.kanbuk-marke.json');
}

export function schreibeMarke(wurzel) {
  writeFileSync(markePfad(wurzel), JSON.stringify({ marke: quellMarke(wurzel) }) + '\n', 'utf-8');
}

/**
 * Prüft `dist/` und hält an, wenn es fehlt oder veraltet ist.
 *
 * `werkzeug` ist der Name für die Meldung („npm run sicht").
 * Rückgabe nur, wenn alles passt – sonst beendet sich der Prozess.
 *
 * FEHLENDE MARKE IST KEIN ABBRUCH, sondern ein lauter Hinweis: Wer `npm run
 * build` direkt aufruft, hinterlässt keine. Falsch wäre, deshalb gar nichts zu
 * sagen – dann ist man wieder bei „gemessen, ohne zu wissen was".
 */
export function verlangeAktuellesDist(wurzel, werkzeug) {
  const dist = join(wurzel, 'dist');
  if (!existsSync(join(dist, 'index.html'))) {
    console.error(
      `\n✗ dist/ fehlt. ${werkzeug} misst den fertigen Build.\n` +
        `  Zuerst: npm run check   (baut und prüft)\n`,
    );
    process.exit(1);
  }

  const pfad = markePfad(wurzel);
  if (!existsSync(pfad)) {
    console.log(
      `  ! Der Build trägt keine Bau-Marke – vermutlich mit "npm run build" erzeugt.\n` +
        `    ${werkzeug} kann deshalb NICHT sagen, ob er zum heutigen Quelltext passt.\n` +
        `    Sicher ist nur "npm run check" (baut bei Bedarf und setzt die Marke).\n`,
    );
    return;
  }

  let alt;
  try {
    alt = JSON.parse(readFileSync(pfad, 'utf-8')).marke;
  } catch {
    alt = null;
  }
  if (alt && alt !== quellMarke(wurzel)) {
    console.error(
      `\n✗ dist/ ist VERALTET – seit dem letzten Bauen wurde am Quelltext geändert.\n` +
        `  ${werkzeug} würde den alten Build messen und grün melden, obwohl die\n` +
        `  Änderung nie geprüft wurde. Genau dieser stille Fall soll nicht vorkommen.\n\n` +
        `  Zuerst: npm run check\n`,
    );
    process.exit(1);
  }
}
