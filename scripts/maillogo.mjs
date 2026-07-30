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
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const WURZEL = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const ANZEIGE_BREITE = 180; // wie in kontakt-mail.ts
const ZIEL = join(WURZEL, 'public', 'logo-mail.png');

/** Den Logo-Namen aus der Config lesen – ohne TypeScript zu laden. */
function logoName() {
  const config = readFileSync(join(WURZEL, 'content.config.ts'), 'utf-8');
  // Der letzte Treffer ist der aus dem Kundenblock, nicht der aus dem Typ-Kommentar.
  const treffer = [...config.matchAll(/^\s*logo:\s*'([^']+)'/gm)];
  return treffer.length ? treffer[treffer.length - 1][1] : undefined;
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
const farbe = process.argv.includes('--farbe')
  ? process.argv[process.argv.indexOf('--farbe') + 1]
  : '#ffffff';
const eingabe = istSvg
  ? Buffer.from(roh.toString('utf-8').replace(/currentColor/g, farbe))
  : roh;

mkdirSync(join(WURZEL, 'public'), { recursive: true });
const info = await sharp(eingabe, { density: 300 })
  .resize({ width: ANZEIGE_BREITE * 2, withoutEnlargement: false })
  .png({ compressionLevel: 9 })
  .toFile(ZIEL);

writeFileSync(ZIEL.replace(/\.png$/, '.txt'), `Erzeugt aus ${name} mit npm run maillogo. Nicht von Hand ändern.\n`);

console.log(
  `✓ public/logo-mail.png – ${info.width}×${info.height} px (${Math.round(info.size / 1024)} KB)\n` +
    `  Quelle: ${name}${istSvg ? `, currentColor → ${farbe}` : ''}\n` +
    `  Angezeigt wird es mit ${ANZEIGE_BREITE} px Breite, also in doppelter Auflösung.\n\n` +
    `  Jetzt in content.config.ts eintragen:\n` +
    `      bestaetigung: { logo: 'logo-mail.png' },\n\n` +
    `  Steht das Logo in der Mail auf einer HELLEN Fläche:\n` +
    `      npm run maillogo -- --farbe "#0b0c0d"`,
);
