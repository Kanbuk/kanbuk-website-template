/**
 * /api/bestaetigen – SCHRITT ZWEI DER DOPPELTEN ANMELDUNG.
 * ===========================================================================
 * Erst der Klick auf diesen Link macht aus einer eingetippten Adresse eine
 * Anmeldung. Vorher steht sie nirgends: nicht in der Verteilerliste, nicht im
 * Postfach des Betriebs.
 *
 * WARUM ES DEN ZWEITEN SCHRITT ÜBERHAUPT GIBT – drei Gründe, der dritte ist
 * der teure:
 *
 * 1. NACHWEIS. Art. 7 Abs. 1 DSGVO verlangt, dass die Einwilligung nachweisbar
 *    ist. Ein Häkchen auf einer Website beweist, dass jemand es gesetzt hat –
 *    nicht, dass es der Inhaber der Adresse war.
 * 2. FREMDE ADRESSEN. Ohne zweiten Schritt trägt jeder eine beliebige Adresse
 *    ein. Der echte Besitzer bekommt ungefragt Post und beschwert sich beim
 *    Betrieb.
 * 3. ZUSTELLBARKEIT. Tippfehler und Wegwerfadressen bleiben dauerhaft in der
 *    Liste. Genug davon, und die Domain steht auf einer Sperrliste – dann
 *    kommt auch die normale Geschäftspost des Betriebs nicht mehr an.
 *
 * DIE REIHENFOLGE IST NICHT GESCHMACKSSACHE
 * ---------------------------------------------------------------------------
 * Erst eintragen, dann benachrichtigen, dann bestätigen. Scheitert der
 * Eintrag, wird ABGEBROCHEN – eine Anmeldung, die der Betrieb als Mail sieht,
 * die aber in keiner Liste steht, sieht erledigt aus und ist es nicht. Das
 * `return` mitten in der Kette sieht wie eine Unsauberkeit aus und ist die
 * wichtigste Zeile der Datei.
 *
 * `runtime: 'nodejs'` ist Pflicht: Die Signaturprüfung braucht `node:crypto`.
 * Im Edge-Umfeld stürbe die Funktion beim Einlesen des Moduls – genau der
 * Fehlertyp, für den es das neunte Tor gibt.
 *
 * IN DER VORSCHAU (`mode: 'demo'`) läuft der Weg trotzdem scharf, wenn
 * Zugänge hinterlegt sind. Das ist gewollt: Die Abnahme-Vorschau eines
 * gebauten Klons hat regelmässig schon echte Zugänge, damit der Betrieb das
 * Formular testen kann. Wer sich über Testadressen in der Verteilerliste
 * wundert, hat genau das getan.
 */
import { site } from '../content.config.js';
import { signaturPruefen, abmeldeLink, linkGeheimnis } from '../src/lib/mail-links.js';
import {
  bestaetigungBetreff,
  bestaetigungText,
  bestaetigungHtml,
  benachrichtigungHtml,
} from '../src/lib/kontakt-mail.js';

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
  const tagRoh = url.searchParams.get('t');
  const englisch = url.searchParams.get('lang') === 'en';

  const schluessel = process.env.RESEND_API_KEY;
  const absenderRoh = process.env.CONTACT_FROM;
  if (!schluessel || !absenderRoh) {
    console.error('[bestaetigen] RESEND_API_KEY oder CONTACT_FROM fehlt.');
    return umleiten('/anmeldung-fehler', englisch);
  }

  /* DAS FORMULAR KOMMT AUS DEM LINK, NICHT AUS `formulare[0]`.
     Hier stand im Ursprungsprojekt der erste Eintrag – bei einem Betrieb mit
     Kontakt- UND Anmeldeformular hätte der Link das falsche bestätigt. Die
     Kennung steht deshalb im Link und geht in die Signatur ein; tauschen
     lässt sie sich damit nicht. */
  const formular = site.formulare.find((f) => f.id === formularId);
  if (!formular) {
    console.error('[bestaetigen] Unbekannte Formular-Kennung im Link:', formularId);
    return umleiten('/anmeldung-fehler', englisch);
  }

  const pruefung = signaturPruefen(
    email,
    sig,
    linkGeheimnis(process.env),
    'anmelden',
    formularId,
    tagRoh === null ? undefined : Number(tagRoh),
  );
  if (!email || !pruefung.gilt) {
    console.error(
      '[bestaetigen] Link abgewiesen:',
      pruefung.gilt ? 'keine Adresse' : pruefung.grund,
    );
    return umleiten('/anmeldung-fehler', englisch);
  }

  const absender = absenderRoh.includes('<')
    ? absenderRoh
    : `${site.betrieb.name.replace(/["<>]/g, '')} <${absenderRoh.trim()}>`;
  const kopf = { Authorization: `Bearer ${schluessel}`, 'Content-Type': 'application/json' };
  const audience = process.env.RESEND_AUDIENCE_ID;
  const sprache = englisch ? 'en' : 'de';

  /* 1) IN DIE VERTEILERLISTE. Ohne Liste gibt es nichts einzutragen – dann
        zählt allein die Benachrichtigung an den Betrieb, und der Schritt gilt
        als erledigt. Das ist Absicht und kein vergessener Fall: Nicht jeder
        Betrieb führt eine Liste. */
  if (audience) {
    let eingetragen = false;
    try {
      const antwort = await fetch(`${DIENST}/contacts`, {
        method: 'POST',
        headers: kopf,
        body: JSON.stringify({ audience_id: audience, email, unsubscribed: false }),
      });
      eingetragen = antwort.ok;
      if (!antwort.ok) {
        console.error(
          '[bestaetigen] Verteilerliste hat abgelehnt:',
          antwort.status,
          await antwort.text().catch(() => ''),
        );
      }
    } catch (e) {
      console.error('[bestaetigen] Verteilerliste nicht erreichbar:', e);
    }
    /* SCHEITERT DER EINTRAG, WIRD NICHT WEITERGEMACHT. Siehe Dateikopf. */
    if (!eingetragen) return umleiten('/anmeldung-fehler', englisch);
  }

  /* Zum Zeitpunkt des Klicks gibt es nur noch die Adresse – alle anderen
     Felder wurden bewusst nirgends zwischengespeichert. Deshalb hält der
     Build an, wenn `doppelteAnmeldung` an einem Formular mit weiteren Feldern
     steht (Prüfung im Vorcheck). */
  const daten = { email, einwilligung: 'ja' };

  /* 2) DEN BETRIEB BENACHRICHTIGEN – jetzt, nicht beim Abschicken. */
  try {
    await fetch(`${DIENST}/emails`, {
      method: 'POST',
      headers: kopf,
      body: JSON.stringify({
        from: absender,
        to: [site.betrieb.email],
        reply_to: email,
        subject: formular.betreff.includes(site.betrieb.name)
          ? formular.betreff
          : `${formular.betreff} – ${site.betrieb.name}`,
        text: `${formular.betreff}\n\nE-Mail-Adresse: ${email}\nDie Anmeldung wurde per Klick bestätigt.`,
        /* Der Betrieb liest in SEINER Sprache, nicht in der des Anmelders. */
        html: benachrichtigungHtml(formular, daten, 'de'),
      }),
    });
  } catch (e) {
    console.error('[bestaetigen] Benachrichtigung an den Betrieb fehlgeschlagen:', e);
  }

  /* 3) DEM ANMELDER DIE BESTÄTIGUNG – mit Abmeldelink. Ein Fehlschlag hier
        darf das Ergebnis nicht kippen: In der Liste steht die Adresse schon. */
  const basis = site.mode === 'demo' ? (site.vorschauDomain ?? site.domain) : site.domain;
  const abmelde = abmeldeLink(basis, email, linkGeheimnis(process.env), formularId, englisch);
  try {
    await fetch(`${DIENST}/emails`, {
      method: 'POST',
      headers: kopf,
      body: JSON.stringify({
        from: absender,
        to: [email],
        reply_to: site.betrieb.email,
        subject: bestaetigungBetreff(sprache),
        text: bestaetigungText(formular, daten, sprache, abmelde),
        html: bestaetigungHtml(formular, daten, sprache, abmelde),
        /* KEIN `List-Unsubscribe`-Kopf – ausführlich begründet in
           src/lib/kontakt.ts an der gleichlautenden Stelle. Kurz: Diese Mail
           ist die Quittung für eine einzelne Handlung, kein Massenversand.
           Der sichtbare Abmeldelink bleibt im Fuss. */
      }),
    });
  } catch (e) {
    console.error('[bestaetigen] Bestätigung an den Anmelder fehlgeschlagen:', e);
  }

  return umleiten('/angemeldet', englisch);
}

/**
 * Ein Bestätigungslink wird angeklickt, nicht abgeschickt.
 *
 * Anders als bei der Abmeldung gibt es hier keinen Ein-Klick-Weg der
 * Mailprogramme, den man beantworten müsste.
 */
export function POST(): Response {
  return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET' } });
}
