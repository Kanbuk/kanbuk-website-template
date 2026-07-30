/**
 * `npm run maillogo` – erzeugt das Logo für die Bestätigungsmail als PNG.
 *
 * WARUM ES DIESES SKRIPT GIBT – drei Gründe, jeder für sich ausreichend:
 *
 * 1. **SVG geht in E-Mails nicht.** Gmail und Outlook zeigen es schlicht nicht
 *    an. Das Logo der Website ist aber fast immer ein SVG (Logos sind
 *    Vektoren). Wer es unverändert in die Mail hängt, hat dort ein Loch.
 * 2. **Es darf nicht zwei Wahrheiten geben.** Ein von Hand exportiertes PNG
 *    läuft irgendwann vom Logo der Fußzeile weg – spätestens beim nächsten
 *    Logo-Wechsel, und dann verschickt der Betrieb monatelang das alte. Dieses
 *    Skript rendert DIESELBE Quelldatei, die `betrieb.logo` nennt.
 * 3. **Doppelte Größe.** Mailprogramme zeigen das Bild auf Bildschirmen mit
 *    hoher Punktdichte an; ein Logo in Anzeigegröße sieht dort matschig aus.
 *
 * Ergebnis: `public/logo-mail.png`. Danach in content.config.ts eintragen:
 *     bestaetigung: { logo: 'logo-mail.png' }
 *
 * OHNE EINTRAG PASSIERT NICHTS – die Mail zeigt dann den Betriebsnamen als
 * Text. Das ist die sichere Wahl: Die meisten Programme blockieren Bilder beim
 * ersten Öffnen ohnehin.
 */
import { existsSync, readdirSync, readFileSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const WURZEL = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const ANZEIGE_BREITE = 180; // wie in kontakt-mail.ts
const ZIEL = join(WURZEL, 'public', 'logo-mail.png');

/**
 * Den Logo-Namen aus der Config lesen – ohne TypeScript zu laden.
 *
 * NUR AUS DEM `betrieb`-BLOCK. Hier stand „nimm den letzten Treffer" – und das
 * war eine Falle, die dieses Skript sich selbst gestellt hat: Sobald jemand der
 * Anweisung ganz unten folgt und `bestaetigung: { logo: 'logo-mail.png' }`
 * einträgt, steht dieser Eintrag WEITER UNTEN in der Datei. Der nächste Lauf
 * suchte dann sein eigenes Erzeugnis in fotos/, fand es nicht und brach ab.
 * Also die Stelle festnageln, an der das Logo des Betriebs wirklich steht.
 */
function logoName() {
  const config = readFileSync(join(WURZEL, 'content.config.ts'), 'utf-8');
  const block = config.match(/^ {2}betrieb: \{\n([\s\S]*?)^ {2}\},/m);
  if (!block) return undefined;
  return block[1].match(/^ {4}logo:\s*'([^']+)'/m)?.[1];
}

/**
 * Die Schriftfarbe für das Logo – dieselbe, die die Website auf der Markenfarbe
 * benutzt. Sie wird NICHT hier nachgerechnet, sondern aus dem fertigen Build
 * gelesen: `--farbe-auf-primaer` entsteht in src/lib/theme.ts, und zwei Stellen,
 * die dasselbe ausrechnen, laufen irgendwann auseinander.
 *
 * Ohne Build gibt es keinen Wert. Dann bleibt Weiß – zusammen mit einem
 * deutlichen Hinweis, denn bei einem hellen Markenton (Sonnengelb, Beige) ist
 * Weiß auf Weiß-nah die falsche Wahl und das Logo verschwindet.
 */
function farbeAusBuild() {
  const start = join(WURZEL, 'dist', 'index.html');
  if (!existsSync(start)) return undefined;
  return readFileSync(start, 'utf-8').match(/--farbe-auf-primaer:\s*(#[0-9a-fA-F]{3,8})/)?.[1];
}

/** Die Datei in fotos/ finden – auch in Unterordnern, wie `bild()` es tut. */
function findeDatei(name, ordner = join(WURZEL, 'fotos')) {
  if (!existsSync(ordner)) return undefined;
  for (const eintrag of readdirSync(ordner, { withFileTypes: true })) {
    const pfad = join(ordner, eintrag.name);
    if (eintrag.isDirectory()) {
      const tiefer = findeDatei(name, pfad);
      if (tiefer) return tiefer;
    } else if (eintrag.name.toLowerCase() === name.split('/').pop().toLowerCase()) {
      return pfad;
    }
  }
  return undefined;
}

const name = logoName();
if (!name) {
  console.log(
    'In content.config.ts steht kein `betrieb.logo`.\n' +
      'Ohne Logo zeigt die Bestätigungsmail den Betriebsnamen als Text – das ist\n' +
      'in Ordnung und oft sogar besser (Bilder sind beim ersten Öffnen meist\n' +
      'blockiert).',
  );
  process.exit(0);
}

const quelle = findeDatei(name);
if (!quelle) {
  console.error(`✗ „${name}" liegt nicht in fotos/. Dasselbe Logo, das die Fußzeile zeigt, wird hier gebraucht.`);
  process.exit(1);
}

const roh = readFileSync(quelle);
const istSvg = extname(quelle).toLowerCase() === '.svg';

/* Ein SVG mit `fill="currentColor"` wird ohne Farbe SCHWARZ gerendert – und
   in der Mail steht das Logo auf der Markenfarbe. Deshalb wird die Farbe hier
   ausdrücklich gesetzt, bevor gerendert wird. Ohne diesen Schritt hat man ein
   schwarzes Logo auf schwarzem Grund und sieht im Bild gar nichts. */
const ausBuild = farbeAusBuild();
const farbe = process.argv.includes('--farbe')
  ? process.argv[process.argv.indexOf('--farbe') + 1]
  : (ausBuild ?? '#ffffff');
const eingabe = istSvg
  ? Buffer.from(roh.toString('utf-8').replace(/currentColor/g, farbe))
  : roh;

mkdirSync(join(WURZEL, 'public'), { recursive: true });
const info = await sharp(eingabe, { density: 300 })
  .resize({ width: ANZEIGE_BREITE * 2, withoutEnlargement: false })
  .png({ compressionLevel: 9 })
  .toFile(ZIEL);

/* KEIN BEGLEIT-TEXTFILE MEHR NEBEN DEM PNG: Alles in public/ wird mit der
   Website ausgeliefert. Eine Notiz für Entwickler hat auf dem Server des Kunden
   nichts verloren – woher das Bild stammt, sagt diese Ausgabe hier. */
console.log(
  `✓ public/logo-mail.png – ${info.width}×${info.height} px (${Math.round(info.size / 1024)} KB)\n` +
    `  Quelle: ${name}${istSvg ? `, currentColor → ${farbe}` : ''}\n` +
    `  Angezeigt wird es mit ${ANZEIGE_BREITE} px Breite, also in doppelter Auflösung.\n` +
    (istSvg && !process.argv.includes('--farbe')
      ? ausBuild
        ? `  Die Farbe stammt aus dem Build (--farbe-auf-primaer) – wie auf der Website.\n`
        : `  ! Es gibt noch keinen Build, deshalb Weiß geraten. Ist die Markenfarbe HELL,\n` +
          `    ist das Logo damit unsichtbar. Einmal \`npm run build\` und dieses Skript\n` +
          `    erneut – dann nimmt es die Farbe, die auch die Website benutzt.\n`
      : '') +
    `\n  Jetzt in content.config.ts eintragen:\n` +
    `      bestaetigung: { logo: 'logo-mail.png' },\n\n` +
    `  Eigene Farbe erzwingen:\n` +
    `      npm run maillogo -- --farbe "#0b0c0d"`,
);
