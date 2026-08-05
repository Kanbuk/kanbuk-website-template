/**
 * `npm run erstbefuellung` – bringt den vorhandenen Bestand EINMALIG in den
 * Redaktionsdienst.
 *
 * =============================================================================
 *  DIE LÜCKE, DIE ES SCHLIESST – und warum sie die gefährlichere von beiden war
 * =============================================================================
 *  Der Redaktions-Baustein war eine Einbahnstraße: `npm run inhalte` LIEST aus
 *  dem Dienst. Ein frisch angelegtes Projekt ist aber leer. Der Bestand steht
 *  zu diesem Zeitpunkt in `content.config.ts` – dort hat ihn der Port
 *  hingeschrieben.
 *
 *  Und jetzt der Teil, der wehtut: `npm run inhalte` läuft in dieser Lage
 *  durch, ohne dass etwas nach einem Fehler aussieht. Die Sicherung „eine
 *  leere Antwort überschreibt nie" greift genau wie vorgesehen – sie schützt
 *  hier aber nicht vor einem Ausfall, sondern verdeckt, dass nie jemand die
 *  Inhalte hineingegeben hat. Wer nicht misstrauisch wird, übergibt dem
 *  Betrieb ein leeres Studio und sagt „ab jetzt können Sie selbst pflegen".
 *
 *  Die Alternative wäre Abtippen: bei einem Händler zweihundert Einträge samt
 *  Fotos. Das passiert dann nicht, und der Baustein bleibt ungenutzt.
 *
 * =============================================================================
 *  DREI SICHERUNGEN – dieselbe Handschrift wie beim Holen
 * =============================================================================
 *   1. NIEMALS ÜBER BESTEHENDES SCHREIBEN. Hat der Dienst schon Einträge,
 *      bricht das Skript ab. Es ist die ERSTbefüllung, kein Abgleich – und
 *      ein zweiter Lauf würde sonst überschreiben, was der Betrieb inzwischen
 *      gepflegt hat. Das wäre der teuerste Datenverlust überhaupt, weil
 *      niemand ihn bemerkt.
 *   2. OHNE ZUGANG PASSIERT NICHTS. Kein Schreib-Token -> Meldung, Ende.
 *   3. `--probe` ZEIGT ALLES, OHNE ETWAS ZU TUN. Der ehrliche Weg, das
 *      Ergebnis vorher anzusehen – auch ohne Token und ohne Netz.
 *
 *  GELESEN WIRD DIE ECHTE CONFIG, nicht ein Muster-Parser daneben: über den
 *  TS-Auflöser (scripts/lib/ts-aufloeser.mjs). Eine zweite, abweichende
 *  Fassung derselben Daten ist im Motor schon zweimal teuer geworden.
 * =============================================================================
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import { KATALOG, lies } from '../redaktion/felder.mjs';
import {
  DOKUMENTE,
  DIENST_DATEI,
  abfrage,
  abfrageAdresse,
  dienstLesen,
  feldName,
  hole,
  schreibAdresse,
  sende,
} from './lib/redaktion.mjs';
import { globVorbereiten } from './lib/ts-aufloeser.mjs';

const WURZEL = process.cwd();
const FOTOS = join(WURZEL, 'fotos');
const nurProbe = process.argv.includes('--probe');

function raus(text, hilfe) {
  console.error(`\n✗ ${text}\n`);
  if (hilfe) console.error(`  ${hilfe.replace(/\n/g, '\n  ')}\n`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
//  1. Voraussetzungen
// ---------------------------------------------------------------------------
const dienst = dienstLesen();
if (!dienst) {
  raus(
    `${DIENST_DATEI} gibt es nicht – dieses Projekt hat kein Redaktionssystem.`,
    'Das ist der Normalfall. Einrichten: redaktion/README.md',
  );
}

const token = process.env.REDAKTION_TOKEN;
if (!token && !nurProbe) {
  raus(
    'Kein Schreib-Zugang in REDAKTION_TOKEN.',
    'Die Erstbefüllung SCHREIBT in den Dienst – dafür reicht der Lese-Zugang nicht.\n' +
      'Im Dienst einen Token mit Schreibrecht anlegen und in die Umgebung legen.\n' +
      'Vorher ansehen, ohne irgendetwas zu tun:  npm run erstbefuellung -- --probe',
  );
}

// ---------------------------------------------------------------------------
//  2. Den vorhandenen Bestand lesen – aus der echten Config
// ---------------------------------------------------------------------------
globVorbereiten(WURZEL);
register(pathToFileURL(join(WURZEL, 'scripts/lib/ts-aufloeser.mjs')));

let site;
try {
  ({ site } = await import(pathToFileURL(join(WURZEL, 'content.config.ts')).href));
} catch (e) {
  raus(`content.config.ts liess sich nicht lesen: ${e.message.split('\n')[0]}`);
}

const eintraege = site.katalog?.eintraege ?? [];

/* KEIN ABBRUCH NUR WEGEN EINES FEHLENDEN KATALOGS.
   Hier stand `if (eintraege.length === 0) raus(...)`. Damit brach die
   Erstbefüllung bei jedem Betrieb OHNE Katalog sofort ab – und das ist beim
   Kleinbetrieb der Normalfall: Friseur, Wirt, Installateur, Studio haben
   keinen. Betriebsdaten und Impressum gehören aber sehr wohl hinein.

   Abgebrochen wird jetzt nur noch, wenn es NIRGENDS etwas zu befüllen gibt.

   GEZÄHLT WIRD INHALT, NICHT DIE ZAHL DER DOKUMENT-TYPEN. Hier stand
   `einzelDokumente.length === 0` – und diese Liste ist in
   scripts/lib/redaktion.mjs fest mit zwei Einträgen belegt. Die Bedingung war
   damit konstant falsch: toter Code, der nie auslösen konnte. Bei einem
   Betrieb ohne Katalog UND ohne gefüllte Betriebsdaten lief das Skript
   stattdessen durch, meldete je Dokument „übersprungen" und schloss mit der
   Erfolgszeile „0 Eintrag/Einträge im Dienst angelegt". */
const einzelDokumente = DOKUMENTE.filter((d) => d.einzeln);
const hatEinzelInhalt = einzelDokumente.some((dok) =>
  dok.felder.some((feld) => {
    const wert = lies(site, feld.pfad);
    if (wert === undefined || wert === null || wert === '') return false;
    return !(Array.isArray(wert) && wert.length === 0);
  }),
);
if (eintraege.length === 0 && !hatEinzelInhalt) {
  raus(
    'In content.config.ts gibt es nichts, was sich in den Dienst bringen liesse.',
    'Weder Katalog-Einträge noch gefüllte Betriebs- oder Impressumsfelder.\n' +
      'Dann legt der Betrieb seine Inhalte direkt im Studio an.',
  );
}

console.log(`Erstbefüllung${nurProbe ? ' (Probe – es wird nichts geschrieben)' : ''}`);
console.log(`  Dienst: ${dienst.projekt} · Datensatz ${dienst.datensatz ?? 'production'}`);
console.log(`  Aus content.config.ts: ${eintraege.length} Eintrag/Einträge\n`);

// ---------------------------------------------------------------------------
//  3. Sicherung 1: niemals über Bestehendes schreiben
// ---------------------------------------------------------------------------
if (!nurProbe) {
  let vorhanden = 0;
  try {
    const antwort = JSON.parse(
      await hole(abfrageAdresse(dienst, abfrage()), { token, alsText: true }),
    );
    vorhanden = antwort?.result?.eintraege?.length ?? 0;
  } catch (e) {
    raus(
      `Der Dienst antwortet nicht: ${e.message}`,
      'Ohne zu wissen, was dort liegt, darf nicht geschrieben werden – sonst\n' +
        'überschreibt ein Lauf womöglich gepflegte Inhalte.',
    );
  }
  if (vorhanden > 0) {
    raus(
      `Im Dienst liegen bereits ${vorhanden} Eintrag/Einträge – hier wird nichts geschrieben.`,
      'Das ist die ERSTbefüllung, kein Abgleich. Ein zweiter Lauf würde überschreiben,\n' +
        'was der Betrieb inzwischen gepflegt hat – und das merkt niemand.\n\n' +
        'Sollen die vorhandenen Einträge wirklich weg, im Studio löschen und erneut starten.',
    );
  }
}

// ---------------------------------------------------------------------------
//  4. Bilder hochladen – ohne sie ist der Bestand nur halb drüben
// ---------------------------------------------------------------------------
/* WARUM DIE BILDER MIT MÜSSEN: Ein Katalog ohne Fotos ist für den Betrieb
   kein übernommener Bestand, sondern eine Liste, die er neu bebildern darf –
   also genau die Arbeit, die dieses Skript ersparen soll. */
function bildPfad(name) {
  const direkt = join(FOTOS, name);
  if (existsSync(direkt)) return direkt;
  // Unterordner sind erlaubt (CLAUDE.md 9a) – wie bei `bild()`.
  const stapel = [FOTOS];
  while (stapel.length) {
    const ordner = stapel.pop();
    for (const e of readdirSyncSicher(ordner)) {
      const voll = join(ordner, e);
      if (istOrdner(voll)) stapel.push(voll);
      else if (basename(voll).toLowerCase() === name.toLowerCase()) return voll;
    }
  }
  return undefined;
}
function readdirSyncSicher(p) {
  try {
    return readdirSync(p);
  } catch {
    return [];
  }
}
function istOrdner(p) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

const bildVerweise = new Map(); // Dateiname -> _ref im Dienst
const fehlendeBilder = [];
const alleBilder = [...new Set(eintraege.flatMap((e) => e.bilder ?? []))];

for (const name of alleBilder) {
  const pfad = bildPfad(name);
  if (!pfad) {
    fehlendeBilder.push(name);
    continue;
  }
  if (nurProbe) {
    bildVerweise.set(name, '(Probe)');
    continue;
  }
  const antwort = await sende(schreibAdresse(dienst, 'bild'), {
    token,
    koerper: readFileSync(pfad),
    typ: 'application/octet-stream',
  });
  const ref = antwort?.document?._id;
  if (!ref) raus(`Bild ${name} wurde hochgeladen, der Dienst nennt aber keine Kennung.`);
  bildVerweise.set(name, ref);
  console.log(`  Bild hochgeladen: ${name}`);
}

if (fehlendeBilder.length) {
  console.log(
    `\n  ! ${fehlendeBilder.length} Bild(er) liegen nicht in fotos/ und fehlen daher im Dienst:\n` +
      `    ${fehlendeBilder.join(', ')}\n` +
      '    Der Eintrag entsteht trotzdem – das Foto ergänzt der Betrieb im Studio.',
  );
}

// ---------------------------------------------------------------------------
//  5. Aus jedem Eintrag ein Dokument bauen – NUR aus den gepflegten Feldern
// ---------------------------------------------------------------------------
/* Es wird ausschliesslich übernommen, was in redaktion/felder.mjs steht. Ein
   Feld, das die Maske nicht anbietet, hätte im Studio keinen Platz: Der
   Betrieb sähe es nie, und beim nächsten Speichern wäre es weg. Genau der
   Fehler, den die eine Feldliste verhindern soll (CLAUDE.md 6c). */
const felderNachName = new Map(KATALOG.map((f) => [feldName(f), f]));

function alsDokument(eintrag) {
  const doc = { _type: 'eintrag', _id: `eintrag-${eintrag.id}` };
  for (const [name, feld] of felderNachName) {
    const wert = eintrag[name];
    if (wert === undefined || wert === null || wert === '') continue;
    if (Array.isArray(wert) && wert.length === 0) continue;

    if (feld.typ === 'bilder') {
      const bilder = wert
        .filter((b) => bildVerweise.has(b))
        .map((b, i) => ({
          _type: 'image',
          _key: `bild${i}`,
          asset: { _type: 'reference', _ref: bildVerweise.get(b) },
        }));
      if (bilder.length) doc[name] = bilder;
      continue;
    }
    if (feld.typ === 'merkmale') {
      doc[name] = wert.map((m, i) => ({ _key: `m${i}`, name: m.name, wert: m.wert }));
      continue;
    }
    if (feld.typ === 'liste-text') {
      doc[name] = [...wert];
      continue;
    }
    doc[name] = wert;
  }
  return doc;
}

const dokumente = eintraege.map(alsDokument);

// Zusätzlich die Merkmals-Paare (filter/zahlen), falls die Feldliste sie führt.
for (const [i, eintrag] of eintraege.entries()) {
  for (const gruppe of ['filter', 'zahlen']) {
    if (!felderNachName.has(gruppe) || !eintrag[gruppe]) continue;
    dokumente[i][gruppe] = Object.entries(eintrag[gruppe]).map(([schluessel, wert], n) => ({
      _key: `${gruppe}${n}`,
      schluessel,
      wert: String(wert),
    }));
  }
}

/* ---------------------------------------------------------------------------
   BETRIEBSDATEN UND IMPRESSUM – der Teil, der bisher ganz fehlte.
   ---------------------------------------------------------------------------
   Die Erstbefüllung lud ausschliesslich Katalog-Einträge hoch. Die Maske bietet
   danach über dreissig Felder an, von denen nur die Katalogfelder gefüllt sind.
   Der Betrieb bekommt sein Studio übergeben mit den Worten „ab jetzt können Sie
   selbst pflegen", öffnet die Öffnungszeiten und findet ein leeres Feld – und
   tippt sie neu, im besten Fall gleich, im schlechteren anders als auf der
   Seite. Beim nächsten Abruf überschreibt genau das die Konfiguration.

   Gelesen wird über dieselbe Feldliste, aus der auch Maske und Abfrage
   entstehen (redaktion/felder.mjs). Ein Feld, das dort fehlt, kann also gar
   nicht erst entstehen – und eines, das dort steht, kommt zwingend mit.

   `_key` JE LISTENELEMENT IST PFLICHT, nicht Feinschliff: Der Dienst nimmt
   Listen von Objekten (Öffnungszeiten, Sonderzeiten) sonst nicht an. */
for (const dok of einzelDokumente) {
  const inhalt = { _type: dok.typ, _id: dok.typ };
  let gefuellt = 0;
  for (const feld of dok.felder) {
    const wert = lies(site, feld.pfad);
    if (wert === undefined || wert === null || wert === '') continue;
    if (Array.isArray(wert) && wert.length === 0) continue;
    if (Array.isArray(wert)) {
      inhalt[feldName(feld)] = wert.map((w, i) =>
        w && typeof w === 'object' && !Array.isArray(w) ? { _key: `${feldName(feld)}${i}`, ...w } : w,
      );
    } else {
      inhalt[feldName(feld)] = wert;
    }
    gefuellt++;
  }
  if (gefuellt === 0) {
    console.log(`  ! ${dok.titel}: nichts in content.config.ts gefunden – übersprungen.`);
    continue;
  }
  dokumente.push(inhalt);
  console.log(`  ${dok.titel}: ${gefuellt} Feld(er) übernommen.`);
}

console.log(`\n  ${dokumente.length} Dokument(e) vorbereitet, ${bildVerweise.size} Bild(er) verknüpft.`);

if (nurProbe) {
  /* `dokumente` kann leer sein. `JSON.stringify(undefined)` gibt dann den Wert
     `undefined` zurück, und `.split` darauf beendet die Probe mit einem
     Absturz statt mit einer Auskunft. */
  if (dokumente.length === 0) {
    console.log('\n  Es wäre nichts zu schreiben – kein Eintrag und kein gefülltes Feld.\n');
    process.exit(0);
  }
  console.log('\n  So sähe der erste Eintrag im Dienst aus:\n');
  console.log(
    JSON.stringify(dokumente[0], null, 2)
      .split('\n')
      .map((z) => '    ' + z)
      .join('\n'),
  );
  console.log('\n  Probe – es wurde nichts geschrieben.\n');
  process.exit(0);
}

// ---------------------------------------------------------------------------
//  6. Schreiben – in EINEM Vorgang, damit es entweder ganz oder gar nicht gilt
// ---------------------------------------------------------------------------
/* `createIfNotExists` statt `create`: Bricht der Lauf mitten drin ab (Netz,
   Strom), legt der zweite Versuch nicht die Hälfte doppelt an. Zusammen mit
   der festen Kennung `eintrag-<id>` ist ein Wiederholen damit gefahrlos. */
const antwort = await sende(schreibAdresse(dienst, 'daten'), {
  token,
  koerper: JSON.stringify({ mutations: dokumente.map((doc) => ({ createIfNotExists: doc })) }),
});

const geschrieben = antwort?.results?.length ?? 0;
console.log(`\n✓ ${geschrieben} Eintrag/Einträge im Dienst angelegt.\n`);
console.log(
  '  So geht es weiter:\n' +
    '   1. Im Studio nachsehen, ob alles richtig angekommen ist – besonders die Fotos.\n' +
    '   2. npm run inhalte   (holt sie zurück nach daten/inhalte.json)\n' +
    '   3. npm run check     (baut die Seite daraus)\n\n' +
    '  AB JETZT IST DER DIENST DIE QUELLE. Was in content.config.ts unter `katalog`\n' +
    '  steht, wird davon überlagert – Änderungen dort wirken nicht mehr. Das ist so\n' +
    '  gewollt, aber es überrascht beim ersten Mal jeden.\n',
);
