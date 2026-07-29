/**
 * `npm run inhalte` – holt, was der Betrieb selbst pflegt, und legt es als
 * Dateien ins Projekt.
 *
 * =============================================================================
 *  DER GRUNDSATZ: Der Dienst schreibt Dateien, der Motor baut aus Dateien.
 * =============================================================================
 *
 *  Beim Bauen der Website wird NICHTS abgefragt. Dieses Skript läuft getrennt
 *  davon – von Hand oder nachts durch die mitgelieferte Sicherung – und
 *  schreibt zwei Dinge ins Projekt:
 *
 *      daten/inhalte.json     die Texte und Daten
 *      fotos/inhalte/         die Bilder
 *
 *  Beides wird eingecheckt. Daraus folgen drei Zusagen, die sonst nicht
 *  haltbar wären:
 *
 *    1. Ein Ausfall des Dienstes kann keine Veröffentlichung aufhalten.
 *    2. Ein gekündigtes Konto nimmt der Website nichts weg.
 *    3. Jeder Stand ist als Änderung im Projekt nachvollziehbar.
 *
 *  DREI SICHERUNGEN, die dieses Skript einhält:
 *
 *    - Ohne Zugang passiert nichts. Keine Zugangsdaten -> Meldung, Ende, die
 *      vorhandenen Dateien bleiben unangetastet.
 *    - Eine leere Antwort überschreibt nie. Sonst löscht ein Aussetzer beim
 *      Dienst den gesamten Bestand, und die Seite steht leer da.
 *    - Ein fehlerhafter Eintrag fällt raus, nicht die ganze Liste.
 *
 *  WAS ES NICHT TUT: Code erzeugen. Geschrieben wird JSON; gelesen wird es von
 *  einer festen Motor-Datei (src/lib/inhalte.ts). Ein Generator, der
 *  TypeScript zusammensetzt, kann bei einer unerwarteten Eingabe ungültigen
 *  Code schreiben – und dann sprengt ein Laie mit „Veröffentlichen" den Build.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  DOKUMENTE,
  abfrage,
  abfrageAdresse,
  bildAdresse,
  bildDateiname,
  dienstLesen,
  feldName,
  hole,
  pruefeNamen,
} from './lib/redaktion.mjs';
import { KATALOG, setze } from '../redaktion/felder.mjs';

/**
 * WARUM ALLES IN EINER FUNKTION STECKT: `process.exit()` bei einer noch
 * offenen Netzverbindung beendet Node unter Windows nicht, sondern lässt es
 * abstürzen (Code 0xC0000409). Der gemeldete Ausfall des Dienstes wäre damit
 * ausgerechnet als Absturz angekommen – gemessen, nicht vermutet. Also:
 * Rückgabewert setzen und den Prozess von selbst auslaufen lassen.
 */
async function haupt() {
  const ZIEL_DATEI = 'daten/inhalte.json';
  const BILD_ORDNER = 'fotos/inhalte';

  const nurPruefen = process.argv.includes('--probe');

  let warnungen = 0;
  const warne = (t) => {
    warnungen++;
    console.log(`  ! ${t}`);
  };

  // ---------------------------------------------------------------------------
  //  1. Ohne Zugang passiert nichts
  // ---------------------------------------------------------------------------
  const dienst = dienstLesen();
  if (!dienst) {
    console.log(
      'Dieses Projekt hat kein Redaktionssystem.\n' +
        'Das ist der Normalfall – die Inhalte stehen dann in content.config.ts.\n' +
        'Einrichten: redaktion/README.md',
    );
    return 0;
  }
  if (!dienst.projekt) {
    console.error('redaktion/dienst.json: `projekt` fehlt. Ohne Projektkennung gibt es nichts abzufragen.');
    return 1;
  }

  const token = process.env.REDAKTION_TOKEN;
  if (dienst.privat && !token) {
    console.error(
      'Der Datensatz ist als privat eingetragen, es fehlt aber das Lesezeichen.\n' +
        'REDAKTION_TOKEN setzen – lokal in der Umgebung, in der Sicherung als Repository-Geheimnis.',
    );
    return 1;
  }

  pruefeNamen();

  console.log(`Hole Inhalte von ${dienst.projekt}/${dienst.datensatz ?? 'production'} …`);

  // ---------------------------------------------------------------------------
  //  2. Abfrage
  // ---------------------------------------------------------------------------
  let antwort;
  try {
    const roh = await hole(abfrageAdresse(dienst, abfrage()), { token, alsText: true });
    antwort = JSON.parse(roh).result;
  } catch (e) {
    console.error(
      `\nDer Dienst antwortet nicht: ${e.message}\n` +
        'Es wurde NICHTS verändert – die Website läuft mit dem eingecheckten Stand weiter.',
    );
    return 1;
  }
  if (!antwort) {
    console.error('\nDer Dienst hat kein Ergebnis geliefert. Es wurde nichts verändert.');
    return 1;
  }

  // ---------------------------------------------------------------------------
  //  3. Einträge prüfen – ein kaputter reißt nicht die übrigen mit
  // ---------------------------------------------------------------------------
  const KATALOG_NACH_NAME = new Map(KATALOG.map((f) => [feldName(f), f]));

  /** Aus [{schluessel, wert}] wird {schluessel: wert} – so will es der Motor. */
  function alsPaare(liste, zahlen) {
    if (!Array.isArray(liste)) return undefined;
    const raus = {};
    for (const p of liste) {
      if (!p || !p.schluessel) continue;
      const wert = zahlen ? Number(String(p.wert).replace(',', '.')) : String(p.wert);
      if (zahlen && !Number.isFinite(wert)) continue;
      raus[String(p.schluessel)] = wert;
    }
    return Object.keys(raus).length ? raus : undefined;
  }

  const bilderZuHolen = new Map(); // Dateiname -> Verweis
  const eintraege = [];
  const kennungen = new Set();

  for (const roh of antwort.eintraege ?? []) {
    const kennung = String(roh.id ?? '').trim();
    const titel = String(roh.titel ?? '').trim();

    // Pflichtfelder. Ohne Kennung gäbe es keine Adresse, ohne Titel keine
    // Überschrift – beides würde die Seite kaputtbauen.
    if (!/^[a-z0-9-]+$/.test(kennung)) {
      warne(`Eintrag „${titel || '(ohne Titel)'}" hat keine brauchbare Kennung („${roh.id ?? ''}") – übersprungen.`);
      continue;
    }
    if (!titel) {
      warne(`Eintrag „${kennung}" hat keinen Titel – übersprungen.`);
      continue;
    }
    if (kennungen.has(kennung)) {
      warne(`Kennung „${kennung}" kommt zweimal vor – der zweite Eintrag wurde übersprungen.`);
      continue;
    }
    kennungen.add(kennung);

    const eintrag = {};
    for (const [name, wert] of Object.entries(roh)) {
      const feld = KATALOG_NACH_NAME.get(name);
      if (!feld) continue; // Feld, das der Motor nicht kennt – siehe Gleichstands-Prüfung
      if (wert === null || wert === undefined) continue;

      if (feld.typ === 'bilder') {
        const namen = [];
        for (const verweis of Array.isArray(wert) ? wert : []) {
          const datei = bildDateiname(verweis);
          if (!bildAdresse(dienst, verweis)) {
            warne(`Eintrag „${kennung}": unlesbarer Bildverweis „${verweis}" – Bild ausgelassen.`);
            continue;
          }
          bilderZuHolen.set(datei, verweis);
          namen.push(datei);
        }
        if (namen.length) eintrag.bilder = namen;
        continue;
      }
      if (feld.typ === 'paare') {
        const paare = alsPaare(wert, name === 'zahlen');
        if (paare) eintrag[name] = paare;
        continue;
      }
      if (feld.typ === 'zahl') {
        const zahl = Number(wert);
        if (Number.isFinite(zahl)) eintrag[name] = zahl;
        continue;
      }
      eintrag[name] = wert;
    }
    eintraege.push(eintrag);
  }

  // ---------------------------------------------------------------------------
  //  4. Betriebs- und Impressumsdaten an ihren Platz in der Config
  // ---------------------------------------------------------------------------
  const konfig = {};
  for (const dok of DOKUMENTE.filter((d) => d.einzeln)) {
    const quelle = antwort[dok.typ];
    if (!quelle) continue;
    for (const feld of dok.felder) {
      const wert = quelle[feldName(feld)];
      if (wert === null || wert === undefined || wert === '') continue;
      if (Array.isArray(wert) && wert.length === 0) continue;
      setze(konfig, feld.pfad, wert);
    }
  }

  // ---------------------------------------------------------------------------
  //  5. Eine leere Antwort überschreibt nie
  // ---------------------------------------------------------------------------
  const vorhanden = existsSync(ZIEL_DATEI) ? JSON.parse(readFileSync(ZIEL_DATEI, 'utf-8')) : undefined;
  if (eintraege.length === 0 && (vorhanden?.katalog?.length ?? 0) > 0) {
    console.error(
      `\nDer Dienst liefert 0 Einträge, im Projekt liegen ${vorhanden.katalog.length}.\n` +
        'Das sieht nach einem Aussetzer aus, nicht nach einer Absicht – es wurde nichts verändert.\n' +
        'Sind wirklich alle Einträge gelöscht, die Datei einmal von Hand leeren.',
    );
    return 1;
  }

  // ---------------------------------------------------------------------------
  //  6. Bilder – Dateiname aus dem Inhalt, verwaiste weg
  // ---------------------------------------------------------------------------
  if (!nurPruefen) mkdirSync(BILD_ORDNER, { recursive: true });

  let geholt = 0;
  let uebersprungen = 0;
  for (const [datei, verweis] of bilderZuHolen) {
    const pfad = join(BILD_ORDNER, datei);
    // Der Dateiname enthält die Prüfsumme des Bildinhalts: Liegt er schon da,
    // IST es dasselbe Bild. Ein getauschtes Foto bekommt zwingend einen anderen.
    if (existsSync(pfad)) {
      uebersprungen++;
      continue;
    }
    if (nurPruefen) {
      geholt++;
      continue;
    }
    try {
      const daten = await hole(bildAdresse(dienst, verweis), { token });
      if (daten.length < 1024) throw new Error(`nur ${daten.length} Byte – das ist kein Bild`);
      writeFileSync(pfad, daten);
      geholt++;
    } catch (e) {
      // KEIN Abbruch. Ein einzelnes Bild darf keine Veröffentlichung aufhalten.
      warne(`Bild ${datei} nicht geholt (${e.message}) – der Eintrag erscheint ohne dieses Foto.`);
      for (const e2 of eintraege) {
        if (!e2.bilder) continue;
        e2.bilder = e2.bilder.filter((b) => b !== datei);
        // Eine leere Liste ist kein „keine Fotos", sondern Datenmüll: Sie
        // täuscht in der Datei einen gepflegten Wert vor, den es nicht gibt.
        if (!e2.bilder.length) delete e2.bilder;
      }
    }
  }

  let verwaist = 0;
  if (existsSync(BILD_ORDNER)) {
    for (const datei of readdirSync(BILD_ORDNER)) {
      if (bilderZuHolen.has(datei)) continue;
      verwaist++;
      if (!nurPruefen) rmSync(join(BILD_ORDNER, datei));
    }
  }

  // ---------------------------------------------------------------------------
  //  7. Schreiben – JSON, kein Code
  // ---------------------------------------------------------------------------
  const ergebnis = {
    _hinweis: 'Erzeugt von `npm run inhalte`. Nicht von Hand ändern – der nächste Lauf überschreibt es.',
    erzeugt: new Date().toISOString(),
    quelle: `${dienst.dienst ?? 'sanity'}/${dienst.projekt}/${dienst.datensatz ?? 'production'}`,
    ...konfig,
    katalog: eintraege,
  };

  // Der Zeitstempel darf keine Änderung vortäuschen – sonst committet die
  // nächtliche Sicherung jede Nacht, obwohl sich nichts geändert hat.
  const ohneStempel = (o) => JSON.stringify({ ...o, erzeugt: undefined });
  const gleich = vorhanden && ohneStempel(vorhanden) === ohneStempel(ergebnis);

  if (nurPruefen) {
    console.log(`\nProbe – es wurde nichts geschrieben.`);
  } else if (gleich) {
    console.log(`\n${ZIEL_DATEI} ist unverändert.`);
  } else {
    mkdirSync('daten', { recursive: true });
    writeFileSync(ZIEL_DATEI, JSON.stringify(ergebnis, null, 2) + '\n', 'utf-8');
    console.log(`\n${ZIEL_DATEI} geschrieben.`);
  }

  console.log(
    `  ${eintraege.length} Eintrag/Einträge · ${geholt} Bild(er) neu · ` +
      `${uebersprungen} unverändert · ${verwaist} verwaist${nurPruefen ? '' : ' gelöscht'}`,
  );
  if (warnungen > 0) console.log(`  ${warnungen} Hinweis(e) – siehe oben.`);

  return 0;
}

process.exitCode = await haupt();
