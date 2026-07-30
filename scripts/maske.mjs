/**
 * `npm run maske` – erzeugt die Eingabemaske, die der Betrieb im Browser sieht.
 *
 * WARUM ERZEUGT STATT GESCHRIEBEN: In einem Kundenprojekt lag die Maske im
 * Website-Projekt und das laufende Eingabe-Studio in einem Nachbarordner,
 * abgeglichen per Handkopie („nach jeder Änderung neu hinüberkopieren").
 * Erwartbares Ergebnis: Die Abfrage las zwei Felder, die die Maske nicht
 * hatte. Das Studio meldete „unbekannte Felder", der Betrieb hätte sie nie
 * bearbeiten können, und beim nächsten Speichern wären sie weg gewesen.
 *
 * Hier entsteht die Maske aus derselben Feldliste wie die Abfrage
 * (redaktion/felder.mjs). Auseinanderlaufen können sie damit nicht mehr –
 * und wenn in redaktion/dienst.json ein Studio-Ordner steht, legt dieses
 * Skript die Maske auch gleich dorthin, statt einen `cp` zu verlangen.
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DOKUMENTE, dienstLesen, feldName, pruefeNamen } from './lib/redaktion.mjs';

const ZIEL = 'redaktion/maske.js';

pruefeNamen();

// ---------------------------------------------------------------------------
//  Die Merkmale zum Filtern und Sortieren sind je Betrieb verschieden. Sie
//  stehen bereits in katalog.beschriftungen – dort, wo der Motor die sichtbaren
//  Namen herholt. Von dort werden sie auch zur Auswahlliste in der Maske.
//
//  WARUM DAS ZÄHLT: Ohne Auswahlliste tippt der Betrieb den Schlüssel selbst.
//  Ein Tippfehler („diesl") bricht keinen Build – der Eintrag verschwindet nur
//  lautlos aus dem Filter. Das findet niemand.
// ---------------------------------------------------------------------------
function beschriftungen() {
  if (!existsSync('content.config.ts')) return {};
  const text = readFileSync('content.config.ts', 'utf-8');
  // Zeilengenau ankern: Ohne `^ {4}` fängt der Ausdruck die Beispielzeile im
  // Erklärkommentar darüber ein und liest von dort bis ans Dateiende weiter.
  const block = text.match(/^ {4}beschriftungen: \{\n([\s\S]*?)\n {4}\},/m);
  if (!block) return {};
  const raus = {};
  for (const m of block[1].matchAll(/^ {6}([A-Za-z0-9_]+): '([^']*)',$/gm)) raus[m[1]] = m[2];
  return raus;
}

const BESCHRIFTUNG = beschriftungen();
const auswahl = Object.entries(BESCHRIFTUNG).map(([wert, titel]) => ({ title: titel, value: wert }));

// ---------------------------------------------------------------------------
//  Aus einem Feld der Liste wird ein Feld der Maske.
// ---------------------------------------------------------------------------
function alsMaskenFeld(feld) {
  const name = feldName(feld);
  const gemeinsam = { name, title: feld.titel, description: feld.hinweis };
  const pflicht = feld.pflicht ? { validation: 'Rule => Rule.required()' } : {};

  switch (feld.typ) {
    case 'textblock':
      return { ...gemeinsam, type: 'text', rows: 5, ...pflicht };
    case 'zahl':
      return { ...gemeinsam, type: 'number', ...pflicht };
    case 'ja-nein':
      return { ...gemeinsam, type: 'boolean', initialValue: true };
    case 'liste-text':
      return { ...gemeinsam, type: 'array', of: [{ type: 'string' }] };
    case 'bilder':
      return { ...gemeinsam, type: 'array', of: [{ type: 'image' }], options: { layout: 'grid' } };
    case 'merkmale':
      return {
        ...gemeinsam,
        type: 'array',
        of: [
          {
            type: 'object',
            fields: [
              { name: 'name', title: 'Bezeichnung', type: 'string' },
              { name: 'wert', title: 'Wert', type: 'string' },
            ],
          },
        ],
      };
    case 'paare':
      return {
        ...gemeinsam,
        type: 'array',
        of: [
          {
            type: 'object',
            fields: [
              auswahl.length
                ? {
                    name: 'schluessel',
                    title: 'Merkmal',
                    type: 'string',
                    options: { list: auswahl },
                  }
                : { name: 'schluessel', title: 'Merkmal', type: 'string' },
              { name: 'wert', title: 'Wert', type: 'string' },
            ],
          },
        ],
      };
    case 'zeiten':
      return {
        ...gemeinsam,
        type: 'array',
        of: [
          {
            type: 'object',
            fields: [
              { name: 'tag', title: 'Tag', type: 'string', description: 'z. B. Mo–Fr oder Samstag' },
              { name: 'zeit', title: 'Zeit', type: 'string', description: 'z. B. 08:00–18:00 oder geschlossen' },
              {
                name: 'tageISO',
                title: 'Für Google: Tageskürzel',
                type: 'array',
                of: [{ type: 'string' }],
                description: 'Mo Tu We Th Fr Sa Su',
              },
              { name: 'vonISO', title: 'Für Google: von', type: 'string', description: 'z. B. 08:00' },
              { name: 'bisISO', title: 'Für Google: bis', type: 'string', description: 'z. B. 18:00' },
            ],
          },
        ],
      };
    case 'sonderzeiten':
      return {
        ...gemeinsam,
        type: 'array',
        of: [
          {
            type: 'object',
            fields: [
              { name: 'anlass', title: 'Anlass', type: 'string', description: 'z. B. Weihnachten, Betriebsurlaub' },
              { name: 'datum', title: 'Einzelner Tag', type: 'string', description: 'JJJJ-MM-TT' },
              { name: 'von', title: 'Zeitraum von', type: 'string', description: 'JJJJ-MM-TT' },
              { name: 'bis', title: 'Zeitraum bis', type: 'string', description: 'JJJJ-MM-TT, einschließlich' },
              { name: 'zeit', title: 'Zeit', type: 'string', description: 'z. B. geschlossen oder 09:00–15:00' },
              { name: 'vonISO', title: 'Für Google: von', type: 'string' },
              { name: 'bisISO', title: 'Für Google: bis', type: 'string' },
            ],
          },
        ],
      };
    default:
      return { ...gemeinsam, type: 'string', ...pflicht };
  }
}

/** JSON mit einer Ausnahme: `validation` ist eine Funktion, kein Text. */
function alsQuelltext(wert, tiefe = 1) {
  const ein = '  '.repeat(tiefe);
  const aus = '  '.repeat(tiefe - 1);
  if (Array.isArray(wert)) {
    if (!wert.length) return '[]';
    return `[\n${wert.map((w) => ein + alsQuelltext(w, tiefe + 1)).join(',\n')}\n${aus}]`;
  }
  if (wert && typeof wert === 'object') {
    const zeilen = Object.entries(wert)
      .filter(([, w]) => w !== undefined)
      .map(([s, w]) =>
        s === 'validation' ? `${ein}validation: ${w}` : `${ein}${s}: ${alsQuelltext(w, tiefe + 1)}`,
      );
    return `{\n${zeilen.join(',\n')}\n${aus}}`;
  }
  return JSON.stringify(wert);
}

const dokumente = DOKUMENTE.map((dok) => ({
  name: dok.typ,
  title: dok.titel,
  type: 'document',
  ...(dok.einzeln ? {} : { __liste: true }),
  fields: dok.felder.map(alsMaskenFeld),
}));

const quelltext = `/**
 * ERZEUGT von \`npm run maske\` – NICHT von Hand ändern.
 *
 * Die Feldliste steht in redaktion/felder.mjs. Ein Feld dort ergänzen, dieses
 * Skript laufen lassen, im Studio veröffentlichen – fertig. Wer stattdessen
 * hier ändert, hat beim nächsten Lauf nichts mehr davon, und die Abfrage weiß
 * von dem Feld ohnehin nichts.
 *
 * Stand der Feldliste: ${DOKUMENTE.reduce((n, d) => n + d.felder.length, 0)} Felder in ${DOKUMENTE.length} Dokumenten.
 */
export const schemaTypes = ${alsQuelltext(
  dokumente.map(({ __liste, ...rest }) => rest),
)};

export default schemaTypes;
`;

/* `--pruefen` schreibt nicht, sondern vergleicht nur. Das Prüf-Tor benutzt es,
   um zu merken, wenn jemand die Feldliste geändert und die Maske vergessen
   hat – der Fall, der im Kundenprojekt zu „unbekannte Felder" geführt hat. */
if (process.argv.includes('--pruefen')) {
  /* Gibt es die Maske gar nicht, ist das KEIN Fehler: In der Vorlage ist das
     der Normalfall (sie ist ein erzeugtes Artefakt und liegt nicht im Repo).
     „passt NICHT" wäre hier eine Meldung ohne Bedeutung – und genau die
     gewöhnt einem das Hinsehen ab. */
  if (!existsSync(ZIEL)) {
    console.log(`${ZIEL} gibt es noch nicht – nichts zu vergleichen. Erzeugen: npm run maske`);
    process.exit(0);
  }
  const gleich = readFileSync(ZIEL, 'utf-8') === quelltext;
  console.log(gleich ? `${ZIEL} passt zur Feldliste.` : `${ZIEL} passt NICHT zur Feldliste.`);
  process.exit(gleich ? 0 : 1);
}

writeFileSync(ZIEL, quelltext, 'utf-8');
console.log(`${ZIEL} geschrieben – ${DOKUMENTE.reduce((n, d) => n + d.felder.length, 0)} Felder.`);

if (!auswahl.length) {
  console.log(
    '  ! In content.config.ts steht kein `beschriftungen`-Block im Katalog.\n' +
      '    Ohne ihn tippt der Betrieb die Filter-Merkmale von Hand – ein Tippfehler\n' +
      '    lässt den Eintrag dann lautlos aus dem Filter verschwinden.',
  );
} else {
  console.log(`  Auswahllisten aus ${auswahl.length} Beschriftung(en): ${auswahl.map((a) => a.value).join(', ')}`);
}

// ---------------------------------------------------------------------------
//  Und gleich hinüber ins laufende Studio – kein Handkopieren.
// ---------------------------------------------------------------------------
const dienst = dienstLesen();
if (dienst?.studioOrdner) {
  const ziel = join(dienst.studioOrdner, 'schemaTypes', 'index.js');
  if (!existsSync(join(dienst.studioOrdner, 'schemaTypes'))) {
    console.log(`  ! ${ziel} nicht gefunden – Studio-Ordner stimmt nicht?`);
  } else {
    copyFileSync(ZIEL, ziel);
    console.log(`  -> ${ziel}`);
    console.log('  Jetzt im Studio-Ordner veröffentlichen, sonst sieht der Betrieb die Änderung nicht.');
  }
} else if (dienst) {
  console.log(
    '  Hinweis: In redaktion/dienst.json steht kein `studioOrdner`.\n' +
      '  Steht er dort, legt dieses Skript die Maske gleich dorthin – sonst bleibt\n' +
      '  ein Kopierschritt von Hand, und genau der läuft irgendwann auseinander.',
  );
}
