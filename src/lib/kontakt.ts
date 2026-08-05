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

export type Sprache = 'de' | 'en';

/* ===========================================================================
   DIE ANTWORTEN DES SERVERS IN DER SPRACHE DER SEITE
   ===========================================================================
   Der Motor baut zweisprachige Seiten – seine Server-Antworten waren fest
   deutsch. Das fällt ausgerechnet dann auf, wenn etwas schiefgeht: Das
   Formular-Skript zeigt bevorzugt die Serverantwort an, weil sie genauer ist
   („zu viele Anfragen" statt „hat nicht geklappt"). Ein englischsprachiger
   Interessent bekommt also deutschen Text in genau dem Moment, in dem er
   Hilfe braucht.

   Deutsch kennt zusätzlich die Unterscheidung du/Sie (CLAUDE.md Abschnitt 3),
   Englisch nicht – deshalb steht dort je Schlüssel ein Paar und hier nur ein
   Satz. Die Musterformulierungen sind neutral: Sie gehören dem Motor, nicht
   einem Kunden.
   =========================================================================== */
type Schluessel =
  | 'format'
  | 'fremd'
  | 'zuLang'
  | 'zuViele'
  | 'unbekannt'
  | 'email'
  | 'pflichtfelder'
  | 'nichtErreichbar'
  | 'versand';

const MELDUNGEN: Record<Schluessel, { de: string | [string, string]; en: string }> = {
  format: { de: 'Ungültiges Format.', en: 'Invalid format.' },
  fremd: { de: 'Anfrage von einer fremden Adresse.', en: 'Request from an unknown origin.' },
  zuLang: { de: 'Die Nachricht ist zu lang.', en: 'Your message is too long.' },
  zuViele: {
    de: 'Zu viele Anfragen. Bitte in ein paar Minuten erneut versuchen.',
    en: 'Too many requests. Please try again in a few minutes.',
  },
  unbekannt: { de: 'Unbekanntes Formular.', en: 'Unknown form.' },
  email: {
    de: ['Bitte gib eine gültige E-Mail-Adresse an.', 'Bitte geben Sie eine gültige E-Mail-Adresse an.'],
    en: 'Please enter a valid email address.',
  },
  pflichtfelder: { de: 'Bitte ausfüllen:', en: 'Please fill in:' },
  nichtErreichbar: {
    de: [
      'Das Formular ist gerade nicht erreichbar. Bitte melde dich direkt – ',
      'Das Formular ist gerade nicht erreichbar. Bitte melden Sie sich direkt – ',
    ],
    en: 'The form is currently unavailable. Please contact us directly – ',
  },
  versand: {
    de: 'Die Nachricht konnte gerade nicht gesendet werden.',
    en: 'Your message could not be sent right now.',
  },
};

/**
 * Eine Server-Antwort in der Sprache der Seite.
 * `duzt` wirkt nur auf Deutsch – Englisch kennt die Unterscheidung nicht.
 */
export function meldung(schluessel: Schluessel, sprache: Sprache = 'de', duzt = false): string {
  const eintrag = MELDUNGEN[schluessel];
  if (sprache === 'en') return eintrag.en;
  return Array.isArray(eintrag.de) ? eintrag.de[duzt ? 0 : 1] : eintrag.de;
}

export async function verarbeiteKontakt(
  rohdaten: Eingabe,
  env: KontaktEnv,
  sprache: Sprache = 'de',
): Promise<KontaktErgebnis> {
  /* Die Ansprache des Betriebs gilt auch für die Meldungen des Servers – sonst
     siezt genau die eine Stelle, an der etwas schiefgeht (CLAUDE.md
     Abschnitt 3). Rechtstexte bleiben davon unberührt, die sind formal. */
  const duzt = site.ansprache === 'du';
  const sagt = (s: Schluessel) => meldung(s, sprache, duzt);

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
    return { status: 400, json: { fehler: sagt('unbekannt') } };
  }

  // 3) Pflichtfelder laut Config prüfen
  const fehlend = formular.felder
    .filter((f) => f.pflicht && !(daten[f.name] ?? '').trim())
    .map((f) => f.label);
  if (fehlend.length > 0) {
    return { status: 400, json: { fehler: `${sagt('pflichtfelder')} ${fehlend.join(', ')}.` } };
  }

  // 4) E-Mail-Felder auf Format prüfen
  const emailFeld = formular.felder.find((f) => f.typ === 'email');
  const antwortAdresse = emailFeld ? (daten[emailFeld.name] ?? '').trim() : '';
  if (emailFeld && antwortAdresse && !emailRegex.test(antwortAdresse)) {
    /* DUZT MIT, WENN DER BETRIEB DUZT. Hier stand die Sie-Form fest verdrahtet –
       auf einer Seite, die durchgehend duzt, fällt genau diese eine Meldung aus
       dem Ton. Im JS-Weg überschreibt sie zusätzlich den Text, den das Formular
       schon richtig gesetzt hat. */
    return {
      status: 400,
      json: {
        fehler: sagt('email'),
      },
    };
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
        /* DEM BESUCHER SAGT MAN NICHT, WELCHE INTERNE ANGABE FEHLT.
           Hier standen `RESEND_API_KEY` und `CONTACT_FROM` in der Antwort, die
           im Browser landet. Das nützt ihm nichts, verrät die eingesetzten
           Werkzeuge und wirkt wie eine kaputte Seite. Der Betreuer braucht die
           Namen – der bekommt sie im Server-Protokoll oben, und zwar
           ausführlicher als vorher.
           Für den Besucher zählt nur: Es liegt nicht an ihm, und wie er den
           Betrieb sonst erreicht. */
        fehler:
          sagt('nichtErreichbar') +
          /* Klammern sind hier PFLICHT: `a ? x : y` bindet schwächer als `+`.
             Ohne sie wäre die ganze vorangehende Verkettung die Bedingung –
             also immer wahr – und der Satz nennte auch dann eine Telefonnummer,
             wenn keine hinterlegt ist. */
          (site.betrieb.telefon
            ? `Telefon ${site.betrieb.telefon}, E-Mail ${site.betrieb.email}.`
            : `E-Mail ${site.betrieb.email}.`),
      },
    };
  }

  /* DER ABSENDER TRÄGT DEN NAMEN DES BETRIEBS, nicht den des Postfachs.
     -------------------------------------------------------------------------
     Steht in CONTACT_FROM nur die nackte Adresse, zeigen Gmail und die meisten
     Programme den Teil vor dem @ an. In einem Kundenprojekt stand im
     Posteingang des Interessenten schlicht „anfrage" – wer eine Terminanfrage
     stellt, bekommt als Antwort eine Mail von „anfrage" statt vom Betrieb.
     Das sieht nach Spam aus und wird weggeklickt.

     Der Name steht ohnehin in der Config; ihn zusätzlich in einer
     Umgebungsvariablen zu verlangen hiesse nur, dass ihn der nächste Kunde
     genauso vergisst. Ist in CONTACT_FROM bereits ein Anzeigename gesetzt
     (erkennbar am `<`), bleibt der stehen.

     Die Anführungszeichen-Säuberung ist Pflicht: Ein Betriebsname mit
     Anführungszeichen oder spitzen Klammern zerlegt sonst die Kopfzeile, und
     dann geht die Mail gar nicht hinaus. */
  /* Eigene Konstante, weil TypeScript die Prüfung oben nicht als Einschränkung
     dieses Feldes sieht – zur Laufzeit ist an dieser Stelle beides gesetzt. */
  const versandAdresse = env.CONTACT_FROM ?? '';
  const absender = versandAdresse.includes('<')
    ? versandAdresse
    : `${site.betrieb.name.replace(/["<>]/g, '')} <${versandAdresse.trim()}>`;

  // 6) Nachricht aus den konfigurierten Feldern bauen – in der Reihenfolge der Config.
  const zeilen = [`${formular.betreff} – ${site.betrieb.name}`, ''];

  /* WORAUF SICH DIE ANFRAGE BEZIEHT – GANZ OBEN, VOR ALLEM ANDEREN.
     Das verdeckte Feld `bezug` wurde übertragen und landete NIRGENDS: Diese
     Schleife läuft über `formular.felder`, und dort steht `bezug` nicht drin.
     Der Händler bekam also „Anfrage über die Website" mit Name und Telefon –
     aber ohne das Fahrzeug, auf dessen Detailseite der Interessent stand.
     Genau das verspricht die Katalog-Detailseite ausdrücklich („In der E-Mail
     steht sofort, um welchen es ging"), und genau das kam nie an. Bei einem
     Bestand von zweihundert Einträgen muss der Betrieb dann zurückfragen. */
  const bezug = (daten.bezug ?? '').trim();
  if (bezug) zeilen.push(`Bezieht sich auf: ${saeubern(bezug)}`, '');

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
        from: absender,
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
      return { status: 502, json: { fehler: sagt('versand') } };
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
        const bestaetigung = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: absender,
            to: [antwortAdresse],
            reply_to: site.betrieb.email,
            /* DER BETREFF DER BESTÄTIGUNG IST NICHT DER INTERNE.
               Hier stand `formular.betreff` – also die Überschrift der
               Benachrichtigung AN DEN BETRIEB („Neue Anfrage über die
               Website"). Der Absender bekam damit die Innensicht des Betriebs
               in sein Postfach, in genau dem Moment, in dem er gerade seine
               Telefonnummer und persönliche Angaben hinterlassen hat. */
            subject: bestaetigungBetreff(sprache),
            text: bestaetigungText(formular, daten, sprache),
            html: bestaetigungHtml(formular, daten, sprache),
          }),
        });
        /* AUCH HIER MUSS DER GRUND INS PROTOKOLL.
           Das `catch` unten fängt nur NETZfehler. Lehnt der Dienst ab –
           abgelaufener Schlüssel, gesperrte Absenderdomain, Kontingent
           erschöpft –, kommt eine ordentliche Antwort mit Fehlercode zurück,
           und die wurde hier stillschweigend weggeworfen. Der Betrieb bekommt
           seine Benachrichtigung, der Absender nie eine Bestätigung, und
           niemand erfährt davon. Zwanzig Zeilen weiter oben macht es die
           Hauptmeldung längst richtig – genau deshalb steht es jetzt auch
           hier. */
        if (!bestaetigung.ok) {
          console.error(
            '[kontakt] Resend hat die Bestätigung an den Absender abgelehnt:',
            bestaetigung.status,
            await bestaetigung.text().catch(() => ''),
          );
        }
      } catch (e) {
        console.error('[kontakt] Bestätigung an den Absender fehlgeschlagen:', e);
      }
    }

    return { status: 200, json: { ok: true } };
  } catch (e) {
    console.error('[kontakt] Versand fehlgeschlagen:', e);
    return { status: 502, json: { fehler: sagt('versand') } };
  }
}
