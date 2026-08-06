/**
 * /api/abmelden – DER EIN-KLICK-ABMELDEWEG.
 * ===========================================================================
 * Steht in einer Mail „Abmeldung mit einem Klick", muss ein Klick reichen:
 * ein Link, der die Adresse wirklich austrägt – ohne Anmeldung, ohne
 * Formular, ohne Rückfrage. Eine Zusage, die man nicht einlöst, ist schlimmer
 * als keine.
 *
 * WARUM EIN GET HIER ETWAS VERÄNDERT – die Abwägung, nicht die Nachlässigkeit
 * ---------------------------------------------------------------------------
 * Mail-Prüfdienste und Firmen-Proxys folgen Links in E-Mails automatisch. Die
 * können damit Leute stillschweigend austragen. Das ist bekannt und der Preis
 * für die Zusage „ein Klick":
 *
 *   Eine versehentliche Abmeldung ist ärgerlich und umkehrbar – die Person
 *   kann sich neu eintragen. Eine Abmeldung, die nicht funktioniert, ist ein
 *   Rechtsverstoß.
 *
 * Wer diese Zusage nicht geben will, baut stattdessen eine Zwischenseite mit
 * einem Knopf, der POSTet – und nimmt dann den Satz „mit einem Klick" aus
 * allen Texten.
 *
 * DER ABMELDELINK LÄUFT NIE AB. Anders als der Bestätigungslink: Die
 * Abmeldung muss jederzeit möglich sein, auch aus einer zwei Jahre alten
 * Mail. Ein abgelaufener Abmeldelink wäre ein Rechtsproblem.
 *
 * OHNE VERTEILERLISTE (`RESEND_AUDIENCE_ID` nicht gesetzt) fällt jeder Aufruf
 * in den Rückfall-Weg, also in eine Mail an den Betrieb. Das ist richtig und
 * kein vergessener Fall – nicht jeder Betrieb führt eine Liste.
 */
import { site } from '../content.config.js';
import { signaturPruefen, linkGeheimnis } from '../src/lib/mail-links.js';

export const config = { runtime: 'nodejs' };

/** Die Adresse der Verteilerliste – an EINER Stelle, nicht in drei Dateien. */
const DIENST = 'https://api.resend.com';

function umleiten(pfad: string, englisch: boolean): Response {
  return new Response(null, {
    status: 303,
    headers: { Location: englisch ? `/en${pfad}` : pfad },
  });
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const email = (url.searchParams.get('e') ?? '').trim().toLowerCase();
  const sig = url.searchParams.get('s') ?? '';
  const formularId = url.searchParams.get('f') ?? '';
  const englisch = url.searchParams.get('lang') === 'en';

  const schluessel = process.env.RESEND_API_KEY;
  if (!schluessel) {
    console.error('[abmelden] RESEND_API_KEY fehlt.');
    return umleiten('/abmelden-fehler', englisch);
  }
  const pruefung = signaturPruefen(email, sig, linkGeheimnis(process.env), 'abmelden', formularId);
  if (!email || !pruefung.gilt) {
    console.error('[abmelden] Link ohne gültige Signatur aufgerufen.');
    return umleiten('/abmelden-fehler', englisch);
  }

  /* 1) DER REGULÄRE WEG: in der Verteilerliste als abgemeldet eintragen.
   *
   *  ZWEI ADRESSEN, WEIL DIE SCHNITTSTELLE ZWEI KENNT. Die Doku zeigt den
   *  flachen Weg (`/contacts/<mail>`); daneben gibt es die Fassung mit der
   *  Liste im Pfad (`/audiences/<id>/contacts/<mail>`), und welche ein Konto
   *  beantwortet, ist von aussen nicht zu sehen. Beide zu versuchen kostet im
   *  Erfolgsfall nichts (der zweite Aufruf entfällt) und erspart im anderen
   *  Fall genau den Fehler, den niemand bemerkt: Der Besucher sieht
   *  „abgemeldet", und ausgetragen ist er nicht.
   */
  const audience = process.env.RESEND_AUDIENCE_ID;
  const wege = [
    `${DIENST}/contacts/${encodeURIComponent(email)}`,
    ...(audience ? [`${DIENST}/audiences/${audience}/contacts/${encodeURIComponent(email)}`] : []),
  ];

  let erledigt = false;
  for (const weg of wege) {
    try {
      const antwort = await fetch(weg, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${schluessel}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ unsubscribed: true, ...(audience && { audience_id: audience }) }),
      });
      if (antwort.ok) {
        erledigt = true;
        break;
      }
      console.error(
        '[abmelden] Verteilerliste hat abgelehnt:',
        antwort.status,
        /* Die Adresse gehört nicht ins Protokoll – dort liest sie irgendwann
           jemand, der sie nicht braucht. */
        weg.replace(email, '<mail>'),
        await antwort.text().catch(() => ''),
      );
    } catch (e) {
      console.error('[abmelden] Verteilerliste nicht erreichbar:', e);
    }
  }

  /* 2) DER RÜCKFALL: Der Wunsch geht als Mail an den Betrieb. Er wird dann von
        Hand ausgetragen – aber er geht nicht verloren. Erst wenn auch das
        scheitert, sieht die Besucherin die Fehlerseite. So steht nie
        „abgemeldet" da, wenn nichts passiert ist. */
  if (!erledigt) {
    const absenderRoh = process.env.CONTACT_FROM;
    if (!absenderRoh) {
      console.error('[abmelden] Auch der Rückfall fehlt: CONTACT_FROM ist nicht gesetzt.');
      return umleiten('/abmelden-fehler', englisch);
    }
    const absender = absenderRoh.includes('<')
      ? absenderRoh
      : `${site.betrieb.name.replace(/["<>]/g, '')} <${absenderRoh.trim()}>`;
    try {
      const antwort = await fetch(`${DIENST}/emails`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${schluessel}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: absender,
          to: [site.betrieb.email],
          subject: `Abmeldung von der Liste – ${site.betrieb.name}`,
          text:
            `Diese Adresse möchte von der Verteilerliste gestrichen werden:\n\n  ${email}\n\n` +
            `Der automatische Weg hat nicht funktioniert – bitte von Hand austragen.\n` +
            `(Diese Nachricht kommt vom Abmeldelink der Website.)`,
        }),
      });
      if (!antwort.ok) {
        console.error('[abmelden] Auch der Rückfall per Mail wurde abgelehnt:', antwort.status);
        return umleiten('/abmelden-fehler', englisch);
      }
    } catch (e) {
      console.error('[abmelden] Auch der Rückfall per Mail schlug fehl:', e);
      return umleiten('/abmelden-fehler', englisch);
    }
  }

  return umleiten('/abgemeldet', englisch);
}

/**
 * POST – der Ein-Klick-Weg der Mailprogramme.
 *
 * Ein Rundschreiben trägt `List-Unsubscribe-Post: List-Unsubscribe=One-Click`
 * (der Versanddienst setzt es). Damit sagt es zu, dass ein POST auf diese
 * Adresse genügt – Gmail und Apple Mail zeigen daraufhin ihren eigenen
 * „Abbestellen"-Knopf neben dem Absender, und der schickt genau diesen POST.
 *
 * Antwortete hier ein 405, wäre die Zusage im Kopf der Mail eine Lüge: Der
 * Knopf erscheint, der Klick läuft ins Leere, und die Besucherin hält sich für
 * abgemeldet. Deshalb macht POST dasselbe wie GET – nur ohne Weiterleitung,
 * denn hier sieht niemand eine Seite.
 *
 * (Der Motor selbst setzt diese Kopfzeilen NIRGENDS – siehe die Begründung in
 * src/lib/kontakt.ts. Sie gehören an ein Rundschreiben, nicht an eine
 * Quittung. Der Weg muss trotzdem funktionieren, sobald der Betrieb ein
 * Rundschreiben verschickt.)
 */
export async function POST(request: Request): Promise<Response> {
  const antwort = await GET(request);
  return new Response(null, { status: antwort.status === 303 ? 200 : antwort.status });
}
