/**
 * Vercel Serverless Function – POST /api/contact
 * Aktiv, wenn das Projekt auf Vercel deployt wird.
 * Umgebungsvariablen (im Vercel-Dashboard setzen): RESEND_API_KEY, CONTACT_FROM
 *
 * TÜRSTEHER-SCHICHT: Alles hier drin schützt den Versand, bevor überhaupt eine
 * E-Mail entsteht. Grund (im Audit 2026-07-27 gemessen): Der Endpunkt nahm
 * Anfragen von JEDEM Ursprung, in beliebiger Zahl und beliebiger Größe an –
 * eine fremde Website oder ein Skript konnte damit das Postfach des Betriebs
 * fluten und das Resend-Kontingent still leerlaufen lassen. Die eigentliche
 * Formular-Logik (Pflichtfelder, Honeypot, Zeitfalle) liegt unverändert in
 * src/lib/kontakt.ts.
 */
// Die .js-Endung ist Pflicht: Vercel baut Server-Dateien als Node-ESM –
// ohne Endung stürzt die Funktion beim Start ab (FUNCTION_INVOCATION_FAILED).
import { verarbeiteKontakt, type Eingabe } from '../src/lib/kontakt.js';
import { site } from '../content.config.js';

export const config = { runtime: 'nodejs' };

/** Mehr als das ist kein Kontaktformular mehr. */
const MAX_BYTES = 20_000;
/** Pro Absender: so viele Anfragen in diesem Zeitfenster. */
const MAX_PRO_FENSTER = 5;
const FENSTER_MS = 10 * 60 * 1000;

/**
 * Zähler pro Absender-Adresse.
 *
 * EHRLICHE GRENZE: Das lebt im Arbeitsspeicher EINER Serverless-Instanz.
 * Vercel startet bei Last mehrere davon, und nach Leerlauf ist der Zähler weg –
 * eine verteilte Flut bremst das also nur teilweise. Es kostet dafür nichts,
 * braucht keine Datenbank und stoppt genau den häufigen Fall: ein Skript, das
 * aus einer Quelle heraus hämmert. Wer harte Grenzen braucht, schaltet
 * zusätzlich die Vercel-Firewall auf /api/contact scharf (Dashboard, kein Code).
 */
const zaehler = new Map<string, { anzahl: number; bis: number }>();

function zuVieleAnfragen(ip: string): boolean {
  const jetzt = Date.now();
  const eintrag = zaehler.get(ip);
  /* ABGELAUFENE EINTRÄGE WERDEN BEI JEDER ANFRAGE WEGGERÄUMT, NICHT ERST BEI
     5000. Die Datenschutzerklärung sagt zu: „wird nicht gespeichert, nicht
     protokolliert und nach wenigen Minuten verworfen". Vorher lief ein Eintrag
     zwar nach zehn Minuten AB, gelöscht wurde er aber erst, wenn dieselbe IP
     erneut anfragte oder die Karte 5000 Einträge überschritt. Bei einem
     Kleinbetrieb mit ein paar Anfragen am Tag heisst das: Die IP lag Wochen im
     Arbeitsspeicher, und die Zusage stimmte nicht.

     Der Durchlauf ist billig – die Karte hat bei einer Kleinbetriebs-Seite
     zweistellig viele Einträge. Die 5000er-Grenze bleibt als Notbremse gegen
     einen Ansturm, bei dem auch dieser Durchlauf nicht mehr mithält. */
  for (const [k, v] of zaehler) if (jetzt > v.bis) zaehler.delete(k);

  if (!eintrag || jetzt > eintrag.bis) {
    zaehler.set(ip, { anzahl: 1, bis: jetzt + FENSTER_MS });
    if (zaehler.size > 5000) {
      for (const [k, v] of zaehler) if (jetzt > v.bis) zaehler.delete(k);
    }
    return false;
  }
  eintrag.anzahl += 1;
  return eintrag.anzahl > MAX_PRO_FENSTER;
}

/** Antwortet dieselbe Domain, die die Seite ausliefert? */
function ursprungPasst(request: Request): boolean {
  const ursprung = request.headers.get('origin');
  if (!ursprung) return true; // Formularsendungen ohne Origin (ältere Browser) nicht aussperren
  const erlaubt = new Set<string>();
  for (const adresse of [site.domain, site.vorschauDomain]) {
    if (!adresse) continue;
    try {
      erlaubt.add(new URL(adresse).host);
    } catch { /* unvollständige Config – dann greift nur der Host-Vergleich unten */ }
  }
  try {
    const host = new URL(ursprung).host;
    // Die eigene Auslieferungsadresse ist immer erlaubt (Vorschau-Domains,
    // Vercel-Adressen, eigene Domain – alle liefern denselben Host im Request).
    const eigen = request.headers.get('host');
    return erlaubt.has(host) || host === eigen;
  } catch {
    return false;
  }
}

function antwort(status: number, json: Record<string, unknown>): Response {
  return new Response(JSON.stringify(json), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Abweisung – für den Weg OHNE JavaScript eine SEITE, sonst eine Datenzeile.
 *
 * WARUM ES DAS BRAUCHT: Der Motor hat am 27.07.2026 genau diesen Fehler für
 * den Erfolgs- und den Pflichtfeldfall behoben („der Browser hat gerade die
 * Seite verlassen – er erwartet eine SEITE zurück"). Die vier Abweisungen
 * DAVOR blieben stehen: Wer ohne Skript sendet und in eine davon läuft,
 * bekommt `{"fehler":"Zu viele Anfragen…"}` auf weissem Grund, ohne Kopf,
 * ohne Fuss, ohne Weg zurück – und seine Eingaben sind weg.
 *
 * Praktisch erreichbar sind drei der vier: 403 (Ursprung passt nicht, etwa
 * weil die Vorschau-Domain nicht in der Config steht), 413 (zu lange
 * Nachricht) und 429 – der wahrscheinlichste Fall überhaupt, weil ein
 * Besucher ohne Skript nach einem Fehlschlag genau das tut: noch einmal
 * senden.
 *
 * 303, damit ein Neuladen die Sendung nicht wiederholt.
 */
function abweisung(request: Request, status: number, text: string): Response {
  const typ = (request.headers.get('content-type') ?? '').toLowerCase();
  if (typ.includes('application/x-www-form-urlencoded')) {
    return new Response(null, { status: 303, headers: { Location: '/anfrage-fehler' } });
  }
  return antwort(status, { fehler: text });
}

export async function POST(request: Request): Promise<Response> {
  /* 1) Zwei erlaubte Formate – und nur diese zwei:
       - application/json          … der normale Weg (JavaScript im Browser)
       - x-www-form-urlencoded     … der Weg OHNE JavaScript. Ein Browser ohne
         laufendes Skript sendet das Formular ganz normal ab; bis 2026-07-27
         endete das in einer rohen Fehlermeldung und die Anfrage war weg.
         Das trifft nicht nur die wenigen Besucher ohne JS: Sobald das
         Skript-Modul aus irgendeinem Grund nicht lädt, sind ALLE betroffen.
       'text/plain' bleibt gesperrt – dieses Format behandeln Browser als
       „einfache Anfrage" ohne Vorab-Nachfrage, weshalb darüber jede fremde
       Seite den Endpunkt direkt ansprechen konnte. */
  const typ = (request.headers.get('content-type') ?? '').toLowerCase();
  const istJson = typ.includes('application/json');
  const istFormular = typ.includes('application/x-www-form-urlencoded');
  if (!istJson && !istFormular) {
    return antwort(415, { fehler: 'Ungültiges Format.' });
  }

  // 2) Fremder Ursprung -> abweisen.
  if (!ursprungPasst(request)) {
    return abweisung(request, 403, 'Anfrage von einer fremden Adresse.');
  }

  /* 3) Größe begrenzen – und zwar in BYTES, nicht in Zeichen.
        `roh.length` zählt UTF-16-Einheiten. Ein Text aus Umlauten und
        Emoji braucht pro Zeichen zwei bis vier Bytes; die Grenze lag damit
        in Wahrheit bei bis zu 80 KB statt 20. Umgekehrt gibt es keinen Fall,
        in dem sie zu früh greift – deshalb war der Fehler unsichtbar.

        EHRLICH DAZU: Die zweite Prüfung verhindert nicht das EINLESEN. Ohne
        `content-length` (chunked) puffert `request.text()` den Körper
        vollständig, bevor hier gemessen wird. Sie verhindert die
        Weiterverarbeitung, nicht den Speicherverbrauch. Wer das auch
        abfangen will, braucht eine Schranke vor der Funktion (Firewall des
        Hosters) – im Code geht es an dieser Stelle nicht. */
  const laenge = Number(request.headers.get('content-length') ?? '0');
  if (laenge > MAX_BYTES) {
    return abweisung(request, 413, 'Die Nachricht ist zu lang.');
  }
  const roh = await request.text();
  if (new TextEncoder().encode(roh).length > MAX_BYTES) {
    return abweisung(request, 413, 'Die Nachricht ist zu lang.');
  }

  // 4) Zu viele Anfragen aus derselben Quelle.
  const ip =
    (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unbekannt';
  if (zuVieleAnfragen(ip)) {
    return abweisung(request, 429, 'Zu viele Anfragen. Bitte in ein paar Minuten erneut versuchen.');
  }

  let daten: Eingabe = {};
  if (istFormular) {
    // Mehrfach vergebene Namen (Mehrfachauswahl) zusammenfassen – wie im Skript.
    const felder = new URLSearchParams(roh);
    for (const schluessel of new Set(felder.keys())) {
      daten[schluessel] = felder.getAll(schluessel).filter(Boolean).join(', ');
    }
  } else {
    try {
      daten = JSON.parse(roh) as Eingabe;
    } catch {
      daten = {};
    }
  }

  const { status, json } = await verarbeiteKontakt(daten, {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONTACT_FROM: process.env.CONTACT_FROM,
  });

  /* Ohne JavaScript hat der Browser gerade die Seite verlassen – er erwartet
     eine SEITE zurück, keine Datenzeile. Also auf die Danke-Seite umleiten
     (bzw. mit Fehlermeldung zurück). 303 ist hier richtig: Der Browser holt
     das Ziel danach per GET, ein Neuladen schickt das Formular nicht erneut. */
  if (istFormular) {
    const ok = status === 200;
    /* DIE ROUTE ENTSCHEIDET, NICHT EIN ZUSATZ AN DER ADRESSE.
       Früher ging beides auf `/danke`, unterschieden durch `?fehler=…`, und
       ein Skript auf der Danke-Seite machte daraus den richtigen Text. Diesen
       Weg gehen aber ausschließlich Besucher OHNE Skript – eine statisch
       gebaute Seite kann die Adresszeile gar nicht lesen. Wem die Anfrage
       gerade misslungen war, dem dankte die Seite dafür.
       (Davor stand sogar die volle Fehlermeldung in der Adresse, also bei
       fehlenden Pflichtfeldern die FELDBESCHRIFTUNGEN. Eine Adresse landet im
       Browserverlauf, im Protokoll des Hosters und in jedem geteilten Link –
       bei einem Wirt harmlos, bei einer Praxis stünde dort das Thema der
       Anfrage. Auch das ist mit der eigenen Route erledigt: Es steht nichts
       mehr in der Adresse.) */
    const ziel = ok ? '/danke' : '/anfrage-fehler';
    return new Response(null, { status: 303, headers: { Location: ziel } });
  }

  return antwort(status, json);
}
