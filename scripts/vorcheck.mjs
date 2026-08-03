/**
 * =============================================================================
 *  VORCHECK – der Schnelltest VOR dem Build (unter 2 Sekunden)
 * =============================================================================
 *  `npm run check` baut erst die komplette Seite (Minuten) und prüft dann.
 *  Fehler, die schon in der Config oder in den Dateien selbst liegen – ein
 *  leeres Pflichtfeld, ein ogBild, das es nicht gibt, ein abgeschnittenes
 *  Foto – fallen so erst NACH dem Build auf, oder schlimmer: erst beim
 *  Kunden. Dieser Vorcheck fängt genau diese Fälle in Sekunden, ohne Build:
 *
 *   1. Pflichtfelder in content.config.ts nicht leer
 *      (name, claim, kurzbeschreibung, telefon, email, domain)
 *   2. Jedes ogBild existiert in public/ – dort wird es ausgeliefert
 *      (BaseLayout baut daraus `/<datei>`); karteBild/logo existieren
 *      in fotos/ (dort sucht sie der Bild-Helfer)
 *   3. JEDE Datei in fotos/ und public/ ist vollständig und dekodierbar
 *      (scripts/lib/integritaet.mjs: Endmarken + sharp-Volldekodierung)
 *   4. PLATZHALTER-Zählung als Info fürs Lücken-Inventar (nicht rot)
 *
 *      node scripts/vorcheck.mjs
 *      (gedacht als erster Schritt der npm-run-check-Kette)
 *
 *  Die Config wird bewusst als TEXT gelesen, nicht ausgeführt: content.config.ts
 *  ist TypeScript, und sie auszuführen hieße zu bauen – genau das soll der
 *  Vorcheck ja vermeiden. Die Muster unten sind darauf abgestimmt.
 *
 *  Rot = Exit 1: erst beheben, dann bauen.
 * =============================================================================
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname, relative, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { pruefeDatei } from './lib/integritaet.mjs';
import { ohneKommentare, markerGlobal } from './lib/quelltext.mjs';

const WURZEL = process.cwd();
const CONFIG = join(WURZEL, 'content.config.ts');
const FOTOS = join(WURZEL, 'fotos');
const PUBLIC = join(WURZEL, 'public');

// ---------------------------------------------------------------------------
//  Text-Werkzeuge
// ---------------------------------------------------------------------------

/* Kommentare ausblenden macht `lib/quelltext.mjs` – dieselbe Stelle wie im
   Prüf-Tor. Hier stand eine eigene, schwächere Fassung aus zwei regulären
   Ausdrücken: Sie erkannte URLs nur an dem Doppelpunkt davor und zählte anders
   als `check.mjs`, sodass beide für dieselbe Datei verschiedene Zahlen
   meldeten. Der Zustandsautomat dort weiß, was in einer Zeichenkette steht,
   und lässt die Zeilennummern stehen. */

/** Erster als String notierter Wert eines Feldes ( feld: '…' ), sonst null. */
function feldWert(text, feld) {
  const m = text.match(new RegExp(`\\b${feld}\\s*:\\s*(['"\`])([\\s\\S]*?)\\1`));
  return m ? m[2] : null;
}

// ---------------------------------------------------------------------------
//  Die eigentliche Config-Prüfung – als reine Funktion exportiert, damit sie
//  sich mit einem Fake-Configtext direkt testen lässt (ohne echte Dateien).
// ---------------------------------------------------------------------------

/**
 * @param {string} configText  Inhalt von content.config.ts
 * @param {{ inPublic: (datei: string) => boolean,
 *           inFotos:  (datei: string) => boolean }} pruefer
 * @returns {{ fehler: string[], infos: string[] }}
 */
export function pruefeConfigText(configText, { inPublic, inFotos }) {
  const fehler = [];
  const infos = [];
  const text = ohneKommentare(configText);

  // --- 1. Pflichtfelder ----------------------------------------------------
  // "name" heißt in der Config vieles (Formularfelder, Dienste) – der
  // Betriebsname wird deshalb nur INNERHALB des betrieb-Blocks gesucht.
  const betriebStart = text.search(/\bbetrieb\s*:\s*\{/);
  if (betriebStart < 0) {
    fehler.push('content.config.ts: kein "betrieb: { … }"-Block gefunden – ohne Betriebsdaten kann der Motor weder Meta-Tags noch Impressum bauen. Lösung: Block laut Vorlage anlegen.');
  } else {
    const name = feldWert(text.slice(betriebStart), 'name');
    if (name === null || name.trim() === '') {
      fehler.push('content.config.ts: Pflichtfeld "name" (Betriebsname) ist leer oder fehlt. Lösung: im betrieb-Block eintragen; ist der Wert noch unbekannt, einen PLATZHALTER-Marker setzen.');
    }
  }
  /* `telefon` steht bewusst NICHT in dieser Liste.
     Nicht jeder Betrieb veröffentlicht eine Telefonnummer – ein Nagelstudio,
     das Termine ausschließlich über Instagram vergibt, hat schlicht keine.
     § 5 ECG verlangt auch keine: gefordert sind „Angaben, die eine schnelle
     elektronische Kontaktaufnahme ermöglichen", und die E-Mail-Adresse erfüllt
     das. Als Pflichtfeld zwang die Regel dazu, entweder eine Nummer zu erfinden
     oder dauerhaft einen PLATZHALTER stehen zu lassen – der dann den Live-Gang
     blockiert. Beides falsch. `email` bleibt Pflicht.
     Dieselbe Änderung steht in scripts/check.mjs. */
  for (const feld of ['claim', 'kurzbeschreibung', 'email', 'domain']) {
    const wert = feldWert(text, feld);
    if (wert === null || wert.trim() === '') {
      fehler.push(`content.config.ts: Pflichtfeld "${feld}" ist leer oder fehlt. Lösung: in content.config.ts eintragen; ist der Wert noch unbekannt, einen PLATZHALTER-Marker setzen.`);
    }
  }

  // --- 2. Bild-Verweise ------------------------------------------------------
  // ogBild wird als /<datei> von der Domain ausgeliefert (BaseLayout.astro),
  // muss also in public/ liegen – das gilt für die seiten-Einträge genauso
  // wie für ein global gesetztes ogBild.
  for (const m of text.matchAll(/\bogBild\s*:\s*(['"`])([^'"`]+)\1/g)) {
    const datei = m[2].replace(/^\//, '');
    if (!inPublic(datei)) {
      fehler.push(`content.config.ts: ogBild "${m[2]}" existiert nicht in public/ – der Build liefe durch, aber WhatsApp/Google zeigten ein kaputtes Vorschaubild. Lösung: Bild nach public/ legen oder mit "npm run og -- --bild fotos/<foto>.jpg" erzeugen.`);
    }
  }
  for (const m of text.matchAll(/\bkarteBild\s*:\s*(['"`])([^'"`]+)\1/g)) {
    if (!inFotos(m[2])) {
      fehler.push(`content.config.ts: karteBild "${m[2]}" nicht in fotos/ gefunden. Lösung: mit "npm run karte -- --adresse „…“" erzeugen – das legt das statische Kartenbild dort ab.`);
    }
  }
  /* ZWEI VERSCHIEDENE `logo`-FELDER, ZWEI VERSCHIEDENE ORTE.
     `betrieb.logo` liegt in fotos/ und wird beim Bauen optimiert.
     `bestaetigung.logo` liegt in public/ – es ist das PNG aus
     `npm run maillogo`, das ein Mailprogramm ueber eine absolute Adresse holt;
     dort gibt es keine Bild-Optimierung.

     Diese Regel sah nur das Wort `logo` und verlangte beides in fotos/. Wer
     also der EIGENEN Anleitung des Motors folgte (`npm run maillogo`, dann
     `bestaetigung: { logo: 'logo-mail.png' }` eintragen), bekam einen harten
     Fehler mit einer FALSCHEN Loesung: „Logo-Datei nach fotos/ legen". Wer das
     befolgt, verschiebt das Erzeugnis aus public/ heraus – und dann holt das
     Mailprogramm ins Leere. Nachgestellt und reproduziert am 02.08.2026. */
  /* ABGEGRENZT ÜBER DIE KLAMMERN, NICHT ÜBER DIE EINRÜCKUNG.
     Hier stand `!/\n {2}[a-zA-Z]+:/` – also „solange keine Zeile mit GENAU zwei
     Leerzeichen Einrückung folgt". Das ist dieselbe Falle, die in check.mjs für
     den `dienste`-Block schon beseitigt wurde: Es ist eine Annahme über die
     FORMATIERUNG, nicht über die Struktur.

     Solange ein Klon die Formatierung des Templates behält, merkt niemand
     etwas – deshalb ist es so unauffällig. Rückt jemand seine
     content.config.ts anders ein (vier Leerzeichen, oder ein Editor formatiert
     beim Speichern um), verschiebt sich die Blockgrenze still. Dann verlangt
     die Regel das Mail-Logo wieder in fotos/ und nennt eine Lösung, die das
     Erzeugnis aus public/ heraustrüge – genau der Fehler, den der Absatz
     darüber beschreibt.

     Gezählt wird jetzt, wie tief wir in geschweiften Klammern stehen: Der
     Treffer gehört zum Block, solange die Klammer von `bestaetigung: {` noch
     offen ist. Das gilt unabhängig von jeder Formatierung. */
  const imBestaetigungsblock = (index) => {
    const start = text.lastIndexOf('bestaetigung:', index);
    if (start < 0) return false;
    const auf = text.indexOf('{', start);
    if (auf < 0 || auf > index) return false;
    let tiefe = 0;
    for (let i = auf; i < index; i++) {
      const z = text[i];
      if (z === '{') tiefe++;
      else if (z === '}') tiefe--;
      if (tiefe === 0 && i > auf) return false; // Block war schon zu
    }
    return tiefe > 0;
  };
  for (const m of text.matchAll(/\blogo\s*:\s*(['"`])([^'"`]+)\1/g)) {
    if (imBestaetigungsblock(m.index)) {
      if (!inPublic(m[2])) {
        fehler.push(
          `content.config.ts: bestaetigung.logo "${m[2]}" liegt nicht in public/. ` +
            `Lösung: "npm run maillogo" erzeugt es dort aus demselben Logo, das die Fußzeile zeigt. ` +
            `NICHT nach fotos/ verschieben – das Mailprogramm holt die Datei über eine absolute Adresse.`,
        );
      }
      continue;
    }
    if (!inFotos(m[2])) {
      fehler.push(`content.config.ts: logo "${m[2]}" nicht in fotos/ gefunden. Lösung: Logo-Datei nach fotos/ legen (aus dem Netz mit "npm run holen", nie per Chat kopieren).`);
    }
  }

  // --- 4. PLATZHALTER nur zählen – Marker sind erlaubt, sie gehören aber
  //        ins Lücken-Inventar (STAND.md) und blockieren erst den Live-Gang.
  //        OHNE KOMMENTARE, wie im Prüf-Tor: Sonst zählt der Vorcheck die
  //        Erklärungen mit, die einem Klon gerade erst beibringen, wie man
  //        einen Platzhalter setzt – und meldet eine andere Zahl als `check`.
  const marker = (ohneKommentare(configText).match(markerGlobal()) ?? []).length;
  if (marker > 0) {
    infos.push(`${marker} PLATZHALTER-Marker in content.config.ts – gehören ins Lücken-Inventar (STAND.md); erst der Live-Gang verlangt echte Werte.`);
  }

  return { fehler, infos };
}

// ---------------------------------------------------------------------------
//  Skript-Lauf (nur bei direktem Aufruf – beim Import passiert nichts)
// ---------------------------------------------------------------------------

function alleDateien(dir, treffer = []) {
  if (!existsSync(dir)) return treffer;
  for (const eintrag of readdirSync(dir)) {
    const p = join(dir, eintrag);
    if (statSync(p).isDirectory()) alleDateien(p, treffer);
    else treffer.push(p);
  }
  return treffer;
}

async function haupt() {
  const start = performance.now();

  if (!existsSync(CONFIG)) {
    console.error('✗ content.config.ts fehlt – der Vorcheck muss im Projekt-Hauptordner laufen (dort, wo package.json liegt).');
    process.exit(1);
  }
  const configText = readFileSync(CONFIG, 'utf-8');
  const fotosDateien = alleDateien(FOTOS);
  const publicDateien = alleDateien(PUBLIC);

  console.log('Vorcheck (vor dem Build): Config-Pflichtfelder, Bild-Verweise, Datei-Integrität\n');

  // --- Config ---------------------------------------------------------------
  const { fehler, infos } = pruefeConfigText(configText, {
    inPublic: (datei) => existsSync(join(PUBLIC, datei)),
    // Der Bild-Helfer (src/lib/bilder.ts) findet Bilder auch in Unterordnern
    // von fotos/ – die Existenzprüfung muss genauso großzügig sein.
    inFotos: (datei) =>
      existsSync(join(FOTOS, datei)) ||
      fotosDateien.some((f) => basename(f).toLowerCase() === basename(datei).toLowerCase()),
  });
  console.log(
    fehler.length
      ? `  ✗ content.config.ts: ${fehler.length} Problem(e)`
      : '  ✓ content.config.ts: Pflichtfelder gefüllt, alle Bild-Verweise vorhanden',
  );

  // --- Integrität aller Dateien in fotos/ und public/ -----------------------
  // Parallel geprüft, damit die 2-Sekunden-Marke auch mit vielen Fotos hält.
  const alle = [...fotosDateien, ...publicDateien];
  const ergebnisse = await Promise.all(
    alle.map(async (f) => ({ datei: f, ergebnis: await pruefeDatei(f) })),
  );
  let kaputte = 0;
  for (const { datei, ergebnis } of ergebnisse) {
    if (!ergebnis.ok) {
      kaputte++;
      fehler.push(`${relative(WURZEL, datei).replace(/\\/g, '/')}: ${ergebnis.grund}`);
    }
  }
  console.log(
    kaputte
      ? `  ✗ Datei-Integrität: ${kaputte} von ${alle.length} Datei(en) beschädigt`
      : `  ✓ ${alle.length} Datei(en) in fotos/ und public/ vollständig und dekodierbar`,
  );

  // --- PLATZHALTER auch im Quelltext zählen (Info fürs Lücken-Inventar) -----
  const quellDateien = alleDateien(join(WURZEL, 'src')).filter((f) =>
    ['.astro', '.ts'].includes(extname(f)),
  );
  let quellMarker = 0;
  for (const f of quellDateien) {
    quellMarker += (readFileSync(f, 'utf-8').match(/PLATZHALTER/g) ?? []).length;
  }
  if (quellMarker > 0) {
    infos.push(`${quellMarker} PLATZHALTER-Marker in src/ – gehören ins Lücken-Inventar (STAND.md).`);
  }
  for (const info of infos) console.log(`  ℹ ${info}`);

  // --- Ergebnis ---------------------------------------------------------------
  const dauer = Math.round(performance.now() - start);
  console.log('');
  if (fehler.length > 0) {
    console.error('✗ Vorcheck NICHT bestanden – erst beheben, dann bauen:\n');
    for (const f of fehler) console.error(`  • ${f}`);
    console.error(`\n${fehler.length} Problem(e), geprüft in ${dauer} ms.`);
    process.exit(1);
  }
  console.log(`✓ Vorcheck bestanden (${dauer} ms) – weiter mit dem Build.`);
}

// Direkt-Aufruf erkennen (Import durch Tests darf nichts ausführen).
// toLowerCase, weil Windows Laufwerksbuchstaben mal groß, mal klein liefert.
const direktAufruf =
  process.argv[1] && import.meta.url.toLowerCase() === pathToFileURL(process.argv[1]).href.toLowerCase();
if (direktAufruf) await haupt();
