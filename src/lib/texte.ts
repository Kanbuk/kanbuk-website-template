/**
 * Bedientexte des MOTORS in du- und Sie-Form.
 *
 * Wichtig: Hier stehen NUR Texte, die der Motor zur Laufzeit selbst erzeugt –
 * Formular-Rückmeldungen, Fehler, der Einwilligungshinweis. Überschriften und
 * alle sichtbaren Inhalte kommen aus dem Design bzw. aus content.config.ts.
 *
 * Umschaltung über content.config.ts -> ansprache.
 */
import type { Ansprache } from '../../content.config';

export interface MotorTexte {
  /** Rechtlicher Hinweis unter dem Formular (vor dem Datenschutz-Link). */
  einwilligung: string;
  sendet: string;
  erfolg: string;
  fehler: string;
  verbindungsfehler: string;
  pflichtfelder: string;
  /** Hinweis im Demo-Modus, solange das Formular nicht scharf ist. */
  formularDemo: string;
}

const SIE: MotorTexte = {
  einwilligung:
    /* KEINE Einwilligungs-Formel. Der frühere Satz „Mit dem Absenden stimmen
       Sie … zu" behauptete eine Einwilligung als Rechtsgrundlage, während die
       Datenschutzerklärung Art. 6 Abs. 1 lit. b und f nennt. Zwei sich
       widersprechende Angaben auf jeder Kundenseite – und die Einwilligung
       wäre ohnehin die schwächere Grundlage (jederzeit widerrufbar). */
    'Ihre Angaben verwenden wir ausschließlich, um diese Anfrage zu beantworten. Mehr dazu in der ',
  sendet: 'Wird gesendet …',
  erfolg: 'Vielen Dank! Ihre Nachricht wurde gesendet.',
  fehler: 'Das hat leider nicht geklappt. Bitte versuchen Sie es per E-Mail.',
  verbindungsfehler: 'Verbindung fehlgeschlagen. Bitte versuchen Sie es per E-Mail.',
  pflichtfelder: 'Bitte füllen Sie die Pflichtfelder aus.',
  /* Seit 2026-07-27 ist das Formular in der Vorschau SICHTBAR und bedienbar –
     nur der Versand ist gesperrt. „In der Live-Version aktiv" wäre jetzt
     irreführend: Der Kunde soll es ausprobieren, nicht davor stehen bleiben. */
  formularDemo:
    'Sie können es ausprobieren – abgeschickt wird in der Vorschau nichts. In der Live-Version geht die Anfrage direkt an uns.',
};

const DU: MotorTexte = {
  einwilligung:
    'Deine Angaben verwenden wir ausschließlich, um diese Anfrage zu beantworten. Mehr dazu in der ',
  sendet: 'Wird gesendet …',
  erfolg: 'Danke! Deine Nachricht wurde gesendet.',
  fehler: 'Das hat leider nicht geklappt. Bitte versuch es per E-Mail.',
  verbindungsfehler: 'Verbindung fehlgeschlagen. Bitte versuch es per E-Mail.',
  pflichtfelder: 'Bitte füll die Pflichtfelder aus.',
  formularDemo:
    'Du kannst es ausprobieren – abgeschickt wird in der Vorschau nichts. In der Live-Version geht die Anfrage direkt an uns.',
};

/**
 * Englische Fassung.
 *
 * WARUM ES SIE GIBT: Der Motor kann zweisprachige Seiten bauen (`sprachen`,
 * `src/pages/en/…`) – seine EIGENEN Bedientexte gab es aber nur auf Deutsch.
 * Auf einer fertigen englischen Seite stand damit ein komplett deutsches
 * Formular: „Vorname", „Senden", darunter ein deutscher Datenschutzhinweis.
 * Bei einem zweisprachigen Beauty-Piloten war das der auffälligste Fehler der englischen Fassung.
 *
 * Englisch kennt die Unterscheidung du/Sie nicht – deshalb nur eine Fassung.
 */
const EN: MotorTexte = {
  einwilligung: 'We use your details solely to answer this enquiry. More on this in our ',
  sendet: 'Sending …',
  erfolg: 'Thank you! Your message has been sent.',
  fehler: 'That did not work, unfortunately. Please try by email.',
  verbindungsfehler: 'Connection failed. Please try by email.',
  pflichtfelder: 'Please fill in the required fields.',
  formularDemo:
    'Feel free to try it out – nothing is sent from the preview. On the live site the enquiry goes straight to us.',
};

/**
 * Beschriftungen, die der Formular-Baustein selbst setzt (also nicht aus der
 * Config kommen). Sie standen fest verdrahtet im Markup und blieben deshalb
 * auch auf englischen Seiten deutsch.
 */
export interface MotorBeschriftungen {
  senden: string;
  optional: string;
  bitteWaehlen: string;
  datenschutz: string;
  /** Rechtsseiten bleiben üblicherweise deutsch – der Link zeigt dorthin. */
  datenschutzPfad: string;
  vorschauTitel: string;
  honeypot: string;
  zurueck: string;
  weiter: string;
}

const BESCHRIFTUNGEN: Record<'de' | 'en', MotorBeschriftungen> = {
  de: {
    senden: 'Senden',
    optional: '(optional)',
    bitteWaehlen: 'Bitte wählen',
    datenschutz: 'Datenschutzerklärung',
    datenschutzPfad: '/datenschutz',
    vorschauTitel: 'Vorschau: Es wird nichts verschickt',
    honeypot: 'Bitte dieses Feld frei lassen',
    zurueck: 'Zurück',
    weiter: 'Weiter',
  },
  en: {
    senden: 'Send',
    optional: '(optional)',
    bitteWaehlen: 'Please choose',
    datenschutz: 'privacy policy',
    /* Zeigt auf die deutsche Erklärung, solange es keine englische Route gibt.
       Baut ein Klon eine (etwa /en/datenschutz), wird der Pfad hier gesetzt. */
    datenschutzPfad: '/datenschutz',
    vorschauTitel: 'Preview: nothing is sent',
    honeypot: 'Please leave this field empty',
    zurueck: 'Back',
    weiter: 'Next',
  },
};

/** Liefert die Motor-Texte in der gewählten Ansprache und Sprache. */
export function motorTexte(ansprache: Ansprache, sprache: 'de' | 'en' = 'de'): MotorTexte {
  if (sprache === 'en') return EN;
  return ansprache === 'du' ? DU : SIE;
}

export function motorBeschriftungen(sprache: 'de' | 'en' = 'de'): MotorBeschriftungen {
  return BESCHRIFTUNGEN[sprache];
}
