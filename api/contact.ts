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
  if (!eintrag || jetzt > eintrag.bis) {
    zaehler.set(ip, { anzahl: 1, bis: jetzt + FENSTER_MS });
    // Aufräumen, damit die Karte nicht unbegrenzt wächst.
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

export async function POST(request: Request): Promise<Response> {
  // 1) Nur echtes JSON. Ohne diese Prüfung geht der Weg über 'text/plain' –
  //    den behandeln Browser als „einfache Anfrage" ganz ohne Vorab-Nachfrage,
  //    weshalb jede fremde Seite den Endpunkt direkt ansprechen konnte.
  const typ = request.headers.get('content-type') ?? '';
  if (!typ.toLowerCase().includes('application/json')) {
    return antwort(415, { fehler: 'Ungültiges Format.' });
  }

  // 2) Fremder Ursprung -> abweisen.
  if (!ursprungPasst(request)) {
    return antwort(403, { fehler: 'Anfrage von einer fremden Adresse.' });
  }

  // 3) Größe begrenzen (auch ohne content-length, deshalb doppelt geprüft).
  const laenge = Number(request.headers.get('content-length') ?? '0');
  if (laenge > MAX_BYTES) {
    return antwort(413, { fehler: 'Die Nachricht ist zu lang.' });
  }
  const roh = await request.text();
  if (roh.length > MAX_BYTES) {
    return antwort(413, { fehler: 'Die Nachricht ist zu lang.' });
  }

  // 4) Zu viele Anfragen aus derselben Quelle.
  const ip =
    (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unbekannt';
  if (zuVieleAnfragen(ip)) {
    return antwort(429, { fehler: 'Zu viele Anfragen. Bitte in ein paar Minuten erneut versuchen.' });
  }

  let daten: Eingabe = {};
  try {
    daten = JSON.parse(roh) as Eingabe;
  } catch {
    daten = {};
  }

  const { status, json } = await verarbeiteKontakt(daten, {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONTACT_FROM: process.env.CONTACT_FROM,
  });

  return antwort(status, json);
}
