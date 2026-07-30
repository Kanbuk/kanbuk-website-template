/**
 * Formular-Verarbeitung – aufgerufen von der Vercel-Funktion /api/contact.ts.
 *
 * Generisch: verarbeitet JEDES in content.config.ts definierte Formular
 * (Kontakt, Reservierung, Terminanfrage, Angebot …). Welche Felder es gibt und
 * welche Pflicht sind, steht in der Config – nicht hier.
 *
 * Versendet über die Resend-REST-API (kein zusätzliches npm-Paket nötig).
 */
// .js-Endung Pflicht (Node-ESM im Serverless-Bundle, s. api/contact.ts).
import { site } from '../../content.config.js';
// .js-Endung ebenfalls Pflicht – siehe Hinweis darüber.
import { bestaetigungBetreff, bestaetigungHtml, bestaetigungText } from './kontakt-mail.js';

export interface KontaktEnv {
  RESEND_API_KEY?: string;
  CONTACT_FROM?: string;
}

export interface KontaktErgebnis {
  status: number;
  json: Record<string, unknown>;
}

export type Eingabe = Record<string, string | undefined>;

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Schützt vor Header-Injection und begrenzt die Länge. */
function saeubern(wert: string, maxLaenge = 5000): string {
  return wert.replace(/[\r\n]+/g, ' ').trim().slice(0, maxLaenge);
}

export async function verarbeiteKontakt(rohdaten: Eingabe, env: KontaktEnv): Promise<KontaktErgebnis> {
  // 0) Eingaben normalisieren: Der Body kommt vom Client und kann ALLES enthalten
  //    (Zahlen, Objekte, Arrays). Alles Nicht-String wird verworfen – sonst
  //    crasht .trim() mit einem 500 statt einer sauberen Fehlermeldung.
  const daten: Record<string, string> = {};
  for (const [k, v] of Object.entries(rohdaten ?? {})) {
    if (typeof v === 'string') daten[k] = v;
  }

  // 1) Honeypot: Bots füllen dieses Feld. Wir melden Erfolg, senden aber nichts.
  if (daten.webseite && daten.webseite.trim() !== '') {
    return { status: 200, json: { ok: true } };
  }

  // 1b) Zeitfalle: Menschen brauchen zum Ausfüllen länger als 3 Sekunden.
  //     Fehlt das Feld (kein JS) oder ist die Uhr des Geräts verstellt
  //     (negative Dauer), lassen wir durch – der Honeypot greift weiterhin.
  const geladen = Number(daten._t ?? '');
  if (Number.isFinite(geladen) && geladen > 0) {
    const dauer = Date.now() - geladen;
    if (dauer >= 0 && dauer < 3000) {
      return { status: 200, json: { ok: true } };
    }
  }

  // 2) Welches Formular? Ohne Angabe das erste (üblicherweise 'kontakt').
  const id = (daten.formular ?? '').trim();
  const formular = id ? site.formulare.find((f) => f.id === id) : site.formulare[0];
  if (!formular) {
    return { status: 400, json: { fehler: 'Unbekanntes Formular.' } };
  }

  // 3) Pflichtfelder laut Config prüfen
  const fehlend = formular.felder
    .filter((f) => f.pflicht && !(daten[f.name] ?? '').trim())
    .map((f) => f.label);
  if (fehlend.length > 0) {
    return { status: 400, json: { fehler: `Bitte ausfüllen: ${fehlend.join(', ')}.` } };
  }

  // 4) E-Mail-Felder auf Format prüfen
  const emailFeld = formular.felder.find((f) => f.typ === 'email');
  const antwortAdresse = emailFeld ? (daten[emailFeld.name] ?? '').trim() : '';
  if (emailFeld && antwortAdresse && !emailRegex.test(antwortAdresse)) {
    return { status: 400, json: { fehler: 'Bitte geben Sie eine gültige E-Mail-Adresse an.' } };
  }

  /* 5) Serverkonfiguration prüfen.
     DIE MELDUNG MUSS SAGEN, WELCHE ANGABE FEHLT. Vorher standen beide Namen
     mit einem Schrägstrich da („RESEND_API_KEY / CONTACT_FROM") – wer das im
     Protokoll liest, prüft beide, findet beide im Dashboard und sucht weiter.

     WARUM DIE MELDUNG AUCH SAGT, WO MAN SUCHEN SOLL: Der häufigste Fall ist
     nicht „vergessen einzutragen", sondern „eingetragen und trotzdem leer".
     Im Dashboard sieht dann alles korrekt aus, der Versand ist still tot, und
     ohne Hinweis sucht man an der falschen Stelle. Die Reihenfolge unten ist
     die aus dem /deploy-Skill. */
  const fehlendeZugaenge = [
    !env.RESEND_API_KEY ? 'RESEND_API_KEY' : '',
    !env.CONTACT_FROM ? 'CONTACT_FROM' : '',
  ].filter(Boolean);
  if (fehlendeZugaenge.length > 0) {
    console.error(
      `[kontakt] Der Versand ist nicht konfiguriert. Es fehlt: ${fehlendeZugaenge.join(' und ')}.\n` +
        '          Steht die Variable im Vercel-Dashboard und ist hier trotzdem leer:\n' +
        '          1. Wurde nach dem Eintragen NEU DEPLOYT? Bestehende Bereitstellungen\n' +
        '             bekommen eine nachträglich eingetragene Variable nicht.\n' +
        '          2. Gilt sie auch für DIESE Umgebung (Produktion/Vorschau)?\n' +
        '          3. Stimmt die Schreibweise exakt, auch Gross-/Kleinschreibung?\n' +
        '          4. Erst dann: einmal ohne „Sensitive" neu anlegen und deployen.\n' +
        '          Ausführlich im /deploy-Skill.',
    );
    return {
      status: 500,
      json: {
        fehler: `Der E-Mail-Versand ist nicht konfiguriert – es fehlt ${fehlendeZugaenge.join(' und ')}.`,
      },
    };
  }

  // 6) Nachricht aus den konfigurierten Feldern bauen – in der Reihenfolge der Config.
  const zeilen = [`${formular.betreff} – ${site.betrieb.name}`, ''];
  for (const f of formular.felder) {
    const wert = (daten[f.name] ?? '').trim();
    zeilen.push(`${f.label}: ${wert ? saeubern(wert) : '–'}`);
  }

  try {
    const antwort = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM,
        to: [site.betrieb.email],
        ...(antwortAdresse && { reply_to: antwortAdresse }),
        subject: `${formular.betreff} – ${site.betrieb.name}`,
        text: zeilen.join('\n'),
      }),
    });

    if (!antwort.ok) {
      /* Der genaue Grund gehört ins Server-Protokoll, nicht zum Besucher –
         aber er muss irgendwo stehen. Ohne diese Zeile scheiterte der Versand
         VOLLSTÄNDIG STILL: falscher Absender, abgelaufener Schlüssel oder ein
         Resend-Ausfall führten dazu, dass jede Anfrage im Nichts endete und
         niemand es merkte (der Betrieb wundert sich nur, dass keine Anfragen
         kommen). Im Vercel-Protokoll ist die Zeile jetzt auffindbar. */
      console.error('[kontakt] Resend hat abgelehnt:', antwort.status, await antwort.text().catch(() => ''));
      return { status: 502, json: { fehler: 'Die Nachricht konnte gerade nicht gesendet werden.' } };
    }

    /* Bestätigung an den ABSENDER – nur wenn eine E-Mail-Adresse vorliegt.
       Ohne sie weiß der Gast nach einer Reservierungsanfrage nicht, ob sie
       angekommen ist. Ein Fehlschlag hier darf die Hauptmeldung NICHT
       gefährden – die ist beim Betrieb ja bereits angekommen.

       STANDARDMÄSSIG OHNE INHALT, UND DAS MIT ABSICHT (geändert 2026-07-27;
       seit 30.07.2026 über `bestaetigung.angabenWiederholen` umschaltbar –
       der Standard bleibt „ohne"):
       Bis dahin standen in dieser Mail ALLE ausgefüllten Felder noch einmal
       drin. Zwei Gründe, warum das weg musste:

       1. MISSBRAUCH. Die Empfängeradresse kommt aus dem Formular und wird nie
          überprüft. Wer den Endpunkt direkt anspricht – der Ursprungs-Kopf
          lässt sich weglassen, Honeypot und Zeitfalle sind trivial zu
          umgehen –, ließ die Domain des Kunden beliebigen selbst geschriebenen
          Text an eine beliebige Adresse schicken. Der teure Ausgang ist nicht
          Datendiebstahl, sondern eine Absender-Domain auf einer Sperrliste:
          Ab dann kommen die ECHTEN Anfragen des Betriebs nirgends mehr an.
          Ohne Inhalt bleibt bestenfalls ein harmloser deutscher Satz übrig.

       2. VERTRAULICHKEIT. Der Inhalt ging an eine Adresse, die niemand geprüft
          hat, und stand in keiner Datenschutzerklärung. Bei einem Tischler ist
          das lästig; bei einem Gesundheitsberuf wäre es der Punkt, an dem es
          teuer wird.

       Der Betrieb bekommt die Angaben unverändert – nur der Absender bekommt
       eine Empfangsbestätigung statt einer Kopie. */
    if (antwortAdresse) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: env.CONTACT_FROM,
            to: [antwortAdresse],
            reply_to: site.betrieb.email,
            /* DER BETREFF DER BESTÄTIGUNG IST NICHT DER INTERNE.
               Hier stand `formular.betreff` – also die Überschrift der
               Benachrichtigung AN DEN BETRIEB („Neue Anfrage über die
               Website"). Der Absender bekam damit die Innensicht des Betriebs
               in sein Postfach, in genau dem Moment, in dem er gerade seine
               Telefonnummer und persönliche Angaben hinterlassen hat. */
            subject: bestaetigungBetreff(),
            text: bestaetigungText(formular, daten),
            html: bestaetigungHtml(formular, daten),
          }),
        });
      } catch (e) {
        console.error('[kontakt] Bestätigung an den Absender fehlgeschlagen:', e);
      }
    }

    return { status: 200, json: { ok: true } };
  } catch (e) {
    console.error('[kontakt] Versand fehlgeschlagen:', e);
    return { status: 502, json: { fehler: 'Die Nachricht konnte gerade nicht gesendet werden.' } };
  }
}
