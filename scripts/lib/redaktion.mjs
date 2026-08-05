/**
 * Gemeinsame Teile des Redaktions-Bausteins – benutzt von `npm run inhalte`
 * und `npm run maske`. Beide leiten alles aus redaktion/felder.mjs ab, damit
 * Eingabemaske und Abfrage nicht auseinanderlaufen können.
 */
import { existsSync, readFileSync } from 'node:fs';
import { BETRIEB, RECHT, KATALOG } from '../../redaktion/felder.mjs';

/** Die drei Dokumente, in die sich die Feldliste aufteilt. */
export const DOKUMENTE = [
  { typ: 'betrieb', titel: 'Betriebsdaten', felder: BETRIEB, einzeln: true },
  { typ: 'impressum', titel: 'Impressum', felder: RECHT, einzeln: true },
  { typ: 'eintrag', titel: 'Katalog-Eintrag', felder: KATALOG, einzeln: false },
];

/**
 * Der Feldname im Dienst ist das letzte Stück des Pfades.
 * `betrieb.adresse.strasse` -> `strasse`.
 */
export function feldName(feld) {
  return feld.pfad.split('.').pop();
}

/**
 * Zwei Felder desselben Dokuments mit gleichem Namen wären ein stiller
 * Datenverlust: Der Betrieb füllt eines aus, überschrieben wird das andere.
 * Deshalb bricht der Maskenbau hier ab, statt es zu erzeugen.
 */
export function pruefeNamen() {
  for (const dok of DOKUMENTE) {
    const gesehen = new Map();
    for (const feld of dok.felder) {
      const name = feldName(feld);
      if (gesehen.has(name)) {
        throw new Error(
          `redaktion/felder.mjs: „${name}" steht zweimal im Dokument „${dok.typ}" ` +
            `(${gesehen.get(name)} und ${feld.pfad}). Feldnamen müssen je Dokument eindeutig sein.`,
        );
      }
      gesehen.set(name, feld.pfad);
    }
  }
}

// ---------------------------------------------------------------------------
//  Zugangsdaten – redaktion/dienst.json
//
//  WARUM NICHT IN content.config.ts: Diese Datei wird gelesen, BEVOR es
//  TypeScript gibt – vom Holskript, das auch ohne Website-Build laufen muss
//  (nachts, in der Sicherung). Und ihr Vorhandensein ist zugleich der
//  An/Aus-Schalter des ganzen Bausteins: Kein Klon ohne Redaktionssystem hat
//  sie, und dort passiert dann auch nichts.
//
//  Geheim ist hier nichts – die Projektkennung ist öffentlich. Das Lesezeichen
//  (Token) steht ausschließlich in der Umgebung (REDAKTION_TOKEN).
// ---------------------------------------------------------------------------

export const DIENST_DATEI = 'redaktion/dienst.json';

export function dienstLesen() {
  if (!existsSync(DIENST_DATEI)) return undefined;
  try {
    return JSON.parse(readFileSync(DIENST_DATEI, 'utf-8'));
  } catch (e) {
    throw new Error(`${DIENST_DATEI} ist kein gültiges JSON: ${e.message}`);
  }
}

// ---------------------------------------------------------------------------
//  Netzzugriff
//
//  JEDER Zugriff läuft hier durch. Grund: In einem Kundenprojekt war die
//  Textabfrage sauber abgesichert, das Bilderholen aber nicht – kein
//  Statuscheck, kein Zeitlimit, kein zweiter Versuch. Eine 403-Antwort des
//  Bildservers hat damit jede Veröffentlichung lahmgelegt, auch solche, die
//  mit den Inhalten nichts zu tun hatten.
// ---------------------------------------------------------------------------

const ZEITLIMIT_MS = 20_000;
const VERSUCHE = 3;

export async function hole(adresse, { token, alsText = false } = {}) {
  let letzterFehler;
  for (let versuch = 1; versuch <= VERSUCHE; versuch++) {
    const abbruch = new AbortController();
    const uhr = setTimeout(() => abbruch.abort(), ZEITLIMIT_MS);
    try {
      const antwort = await fetch(adresse, {
        signal: abbruch.signal,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!antwort.ok) {
        // 4xx wiederholen bringt nichts – das ist ein Fehler auf unserer Seite.
        const endgueltig = antwort.status >= 400 && antwort.status < 500 && antwort.status !== 429;
        letzterFehler = new Error(`HTTP ${antwort.status} ${antwort.statusText}`);
        if (endgueltig) break;
      } else {
        return alsText ? await antwort.text() : Buffer.from(await antwort.arrayBuffer());
      }
    } catch (e) {
      letzterFehler = e.name === 'AbortError' ? new Error(`keine Antwort binnen ${ZEITLIMIT_MS / 1000} s`) : e;
    } finally {
      clearTimeout(uhr);
    }
    if (versuch < VERSUCHE) await new Promise((r) => setTimeout(r, 1500 * versuch));
  }
  throw new Error(`${adresse.split('?')[0]}: ${letzterFehler?.message ?? 'unbekannter Fehler'}`);
}

// ---------------------------------------------------------------------------
//  Sanity – der eine umgesetzte Dienst.
//
//  Bewusst über die HTTP-Schnittstelle statt über ein npm-Paket: Die Website
//  bleibt frei von Abhängigkeiten, die ein Klon nie aktualisiert bekommt.
//  Ein anderer Dienst braucht nur diese beiden Funktionen neu.
// ---------------------------------------------------------------------------

/** Baut die Projektion eines Feldes für die Abfragesprache. */
function projektion(feld) {
  const name = feldName(feld);
  switch (feld.typ) {
    // Bilder kommen als Verweis auf die Datei, nicht als Adresse. Der Verweis
    // enthält die Prüfsumme des Bildinhalts – daher rührt der Dateiname.
    case 'bilder':
      return `"${name}": ${name}[].asset._ref`;
    case 'merkmale':
      return `${name}[]{name, wert}`;
    case 'paare':
      return `${name}[]{schluessel, wert}`;
    case 'zeiten':
      return `${name}[]{tag, zeit, tageISO, vonISO, bisISO}`;
    case 'sonderzeiten':
      return `${name}[]{datum, von, bis, zeit, anlass, vonISO, bisISO}`;
    default:
      return name;
  }
}

/** Die vollständige Abfrage – entsteht aus der Feldliste, nicht von Hand. */
export function abfrage() {
  const teil = (dok) => dok.felder.map(projektion).join(', ');
  const betrieb = DOKUMENTE.find((d) => d.typ === 'betrieb');
  const impressum = DOKUMENTE.find((d) => d.typ === 'impressum');
  const eintrag = DOKUMENTE.find((d) => d.typ === 'eintrag');
  return (
    '{' +
    /* `!(_id in path("drafts.**"))` ist PFLICHT, nicht Feinschliff.
       UNVEROEFFENTLICHTE ENTWUERFE KONNTEN SONST OEFFENTLICH GEHEN: Der Dienst
       legt jede Bearbeitung als Entwurf mit eigener Kennung an. Ohne diese
       Bedingung liefert die Abfrage beide Fassungen - und wer gerade an einem
       Text arbeitet, hat ihn damit schon veroeffentlicht. Genau umgekehrt zu
       dem, was der Betrieb erwartet, wenn er auf "Speichern" statt auf
       "Veroeffentlichen" drueckt. */
    /* JEDE TEILABFRAGE NUR, WENN ES IHRE GRUPPE WIRKLICH GIBT.
       Hier wurden die drei Teile fest aneinandergehängt. Nimmt ein Klon eine
       Gruppe aus DOKUMENTE heraus – und „kein Katalog" ist beim Kleinbetrieb
       der NORMALFALL, nicht die Ausnahme: Friseur, Wirt, Installateur, Studio
       haben keinen –, liefert `find()` `undefined`, und die Abfrage wird mit
       dem Wort „undefined" weitergebaut. Der ganze Abruf geht dann leer aus,
       und die Fehlermeldung lautet „Dienst antwortet nicht", obwohl der
       Dienst einwandfrei läuft.

       SORTIERT WIRD BEWUSST NACH `_createdAt`. Was aus dem Dienst kommt,
       ersetzt `katalog.eintraege` vollständig – ohne `order()` steht die Liste
       danach in der Reihenfolge des Dienstes. In einem Kundenprojekt standen
       die Einträge nach der Erstbefüllung alphabetisch statt in der gesetzten
       Reihenfolge; fachlich falsch und in keiner Prüfung sichtbar, weil ja
       alle da waren. Die Anlagereihenfolge ist die einzige Ordnung, die der
       Motor branchenneutral kennen kann – eine Sortierung nach Preis oder
       Titel wäre für den einen Betrieb richtig und für den nächsten falsch.
       Wer es anders will, sortiert im Design. */
    [
      betrieb && `"betrieb": *[_type == "betrieb" && !(_id in path("drafts.**"))][0]{${teil(betrieb)}}`,
      impressum &&
        `"impressum": *[_type == "impressum" && !(_id in path("drafts.**"))][0]{${teil(impressum)}}`,
      eintrag &&
        `"eintraege": *[_type == "eintrag" && !(_id in path("drafts.**"))] | order(_createdAt asc){${teil(eintrag)}}`,
    ]
      .filter(Boolean)
      .join(',') +
    '}'
  );
}

/**
 * SCHREIBEN. Dieselbe Sorgfalt wie beim Lesen: Zeitlimit, zweiter Versuch,
 * Statuscheck. Ein halb durchgelaufener Schreibvorgang ist schlimmer als ein
 * fehlgeschlagener – deshalb wird jede Antwort geprüft, nicht nur die
 * Verbindung.
 *
 * Benutzt wird das ausschliesslich von der ERSTBEFUELLUNG. Der laufende
 * Betrieb liest nur; der Motor schreibt nie in den Dienst zurück, sonst gäbe
 * es zwei Wahrheiten.
 */
export async function sende(adresse, { token, koerper, typ = 'application/json' } = {}) {
  let letzterFehler;
  for (let versuch = 1; versuch <= VERSUCHE; versuch++) {
    const abbruch = new AbortController();
    const uhr = setTimeout(() => abbruch.abort(), ZEITLIMIT_MS);
    try {
      const antwort = await fetch(adresse, {
        method: 'POST',
        signal: abbruch.signal,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': typ },
        body: koerper,
      });
      const text = await antwort.text();
      if (!antwort.ok) {
        const endgueltig = antwort.status >= 400 && antwort.status < 500 && antwort.status !== 429;
        letzterFehler = new Error(`HTTP ${antwort.status} ${antwort.statusText} – ${text.slice(0, 300)}`);
        if (endgueltig) break;
      } else {
        return JSON.parse(text);
      }
    } catch (e) {
      letzterFehler = e.name === 'AbortError' ? new Error(`keine Antwort binnen ${ZEITLIMIT_MS / 1000} s`) : e;
    } finally {
      clearTimeout(uhr);
    }
    if (versuch < VERSUCHE) await new Promise((r) => setTimeout(r, 1500 * versuch));
  }
  throw new Error(`${adresse.split('?')[0]}: ${letzterFehler?.message ?? 'unbekannter Fehler'}`);
}

/** Die Schreib-Adresse. NICHT über apicdn – der liefert nur Zwischengespeichertes. */
export function schreibAdresse(dienst, was) {
  const version = dienst.apiVersion ?? '2024-01-01';
  const datensatz = dienst.datensatz ?? 'production';
  const basis = dienst.schreibBasis ?? `https://${dienst.projekt}.api.sanity.io`;
  return was === 'bild'
    ? `${basis}/v${version}/assets/images/${datensatz}`
    : `${basis}/v${version}/data/mutate/${datensatz}`;
}

export function abfrageAdresse(dienst, groq) {
  const version = dienst.apiVersion ?? '2024-01-01';
  const datensatz = dienst.datensatz ?? 'production';
  /* NICHT ÜBER DEN ZWISCHENSPEICHER LESEN.
     Hier stand `apicdn` mit der Begründung „schneller und belastbarer". Der
     Abruf läuft aber nur nachts oder direkt nach einem „Veröffentlichen" – ein
     paar hundert Millisekunden spielen keine Rolle, Richtigkeit schon.

     Zwei Fehlschläge an einem Tag in einem Kundenprojekt, beide sahen nach
     Erfolg aus:
       1. Direkt nach der Erstbefüllung lieferte der Zwischenspeicher noch die
          leere Antwort von davor; das Werkzeug meldete „unverändert".
       2. Ein Text wurde im Studio geändert und Sekunden später zurückgesetzt.
          Der Bau danach holte den zwischengespeicherten Stand VON DAVOR und
          buk den Probetext fest ein. Danach löst nichts mehr einen Bau aus –
          die verworfene Fassung bleibt bis zur nächsten Nacht online.

     Der zweite Fall trifft den Normalbetrieb: Wer eine Kleinigkeit ändert und
     gleich korrigiert, veröffentlicht sonst genau die Fassung, die er
     zurückgenommen hat. `dienst.basis` überschreibt das weiterhin. */
  const basis = dienst.basis ?? `https://${dienst.projekt}.api.sanity.io`;
  return `${basis}/v${version}/data/query/${datensatz}?query=${encodeURIComponent(groq)}`;
}

/**
 * Aus dem Dateiverweis wird die Adresse des Bildes.
 * `image-a1b2c3-1200x800-jpg` -> `.../a1b2c3-1200x800.jpg`
 */
export function bildAdresse(dienst, verweis) {
  const teile = String(verweis).split('-');
  if (teile.length < 4 || teile[0] !== 'image') return undefined;
  const endung = teile.pop();
  const rest = teile.slice(1).join('-');
  const datensatz = dienst.datensatz ?? 'production';
  const basis = dienst.bildBasis ?? 'https://cdn.sanity.io';
  return `${basis}/images/${dienst.projekt}/${datensatz}/${rest}.${endung}`;
}

/**
 * Der Dateiname eines Bildes im Projekt.
 *
 * WARUM NICHT NACH POSITION („eintrag-1.jpg"): Genau so war es in einem
 * Kundenprojekt gebaut, zusammen mit „schon da? dann nicht noch einmal laden".
 * Tauscht der Betrieb Foto 1 aus, bleibt der Dateiname gleich – und die
 * Website zeigt für immer das alte Bild, ohne jede Fehlermeldung. Das trifft
 * die häufigste Pflegehandlung überhaupt: ein besseres Foto nachschieben.
 *
 * Der Verweis des Dienstes enthält die Prüfsumme des Bildinhalts. Ein anderes
 * Foto ergibt deshalb zwingend einen anderen Dateinamen.
 */
export function bildDateiname(verweis) {
  const teile = String(verweis).split('-');
  const endung = teile.pop();
  return `${teile.slice(1).join('-')}.${endung}`;
}
