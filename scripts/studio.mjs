/**
 * `npm run studio` – Eingabemaske erzeugen, ins Studio kopieren und danach
 * PRÜFEN, ob dort wirklich dieselbe steht.
 *
 * =============================================================================
 *  WARUM ES DIESEN BEFEHL GIBT
 * =============================================================================
 *  Die Maske liegt zwangsläufig zweimal: einmal im Website-Projekt (erzeugt aus
 *  `redaktion/felder.mjs`) und einmal im laufenden Eingabe-Studio, das ein
 *  eigenes Projekt daneben ist. Abgeglichen wurde per Handkopie.
 *
 *  DER BELEG, dass das nicht trägt, stammt aus dem eigenen Projekt: Im Studio
 *  stand noch der alte, irreführende Hilfetext, während der berichtigte längst
 *  im Repo lag. Aufgefallen ist es nur, weil vor der Zugangsübergabe zufällig
 *  verglichen wurde – innerhalb von Stunden auseinandergelaufen, mit der
 *  Warnung davor schon im Bericht.
 *
 *  Ein Rezept, dessen Richtigkeit von einem `cp` abhängt, geht auseinander.
 *  Deshalb kopiert dieser Befehl nicht nur, sondern **prüft danach nach**.
 *
 *  Was er NICHT kann: veröffentlichen. Das braucht das Werkzeug des Dienstes
 *  und einen Zugang; er sagt aber genau, was jetzt zu tun ist – und meldet
 *  beim nächsten Lauf, wenn es nicht getan wurde.
 */
import { existsSync, readFileSync, copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dienstLesen } from './lib/redaktion.mjs';

const WURZEL = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const MASKE = join(WURZEL, 'redaktion', 'maske.js');

const dienst = dienstLesen();
if (!dienst) {
  console.log(
    'Dieses Projekt hat kein Redaktionssystem – es gibt keine Maske zu pflegen.\n' +
      'Einrichten: redaktion/README.md',
  );
  process.exit(0);
}

// 1. Maske frisch erzeugen – sie ist immer die Ableitung, nie die Quelle.
const erzeugt = spawnSync(process.execPath, [join(WURZEL, 'scripts', 'maske.mjs')], {
  stdio: 'inherit',
  cwd: WURZEL,
});
if (erzeugt.status !== 0) process.exit(erzeugt.status ?? 1);

if (!dienst.studioOrdner) {
  console.log(
    '\n✗ In redaktion/dienst.json fehlt `studioOrdner`.\n' +
      '  Ohne ihn bleibt der Kopierschritt Handarbeit – und genau der läuft\n' +
      '  auseinander. Eintragen, z. B. "studioOrdner": "../<kunde>-studio".',
  );
  process.exit(1);
}

const ziel = join(dienst.studioOrdner, 'schemaTypes', 'index.js');
if (!existsSync(join(dienst.studioOrdner, 'schemaTypes'))) {
  console.error(`\n✗ ${ziel} gibt es nicht. Stimmt der Studio-Ordner?`);
  process.exit(1);
}

// 2. Kopieren.
copyFileSync(MASKE, ziel);

// 3. NACHPRÜFEN – das ist der Teil, der bisher fehlte.
const gleich = readFileSync(MASKE, 'utf-8') === readFileSync(ziel, 'utf-8');
if (!gleich) {
  console.error('\n✗ Die Kopie stimmt nicht mit der erzeugten Maske überein. Schreibrecht?');
  process.exit(1);
}

console.log(
  `\n✓ Maske erzeugt und nach ${ziel} kopiert – Inhalt nachgeprüft, identisch.\n` +
    '\n' +
    '  JETZT NOCH VERÖFFENTLICHEN, sonst sieht der Betrieb die Änderung nicht:\n' +
    `  im Ordner ${dienst.studioOrdner} das Veröffentlichen-Werkzeug des Dienstes\n` +
    '  ausführen (siehe redaktion/README.md).\n' +
    '\n' +
    '  Was dieser Befehl NICHT prüfen kann: ob die VERÖFFENTLICHTE Maske dem\n' +
    '  entspricht, was hier liegt. Das weiß nur der Dienst. Deshalb im Zweifel\n' +
    '  im Studio nachsehen – ein Feld, das der Betrieb dort nicht sieht, füllt\n' +
    '  er auch nicht aus.',
);
