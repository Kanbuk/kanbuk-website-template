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
import { hatEnglischeFassung } from './sprachrouten';

export interface MotorTexte {
  /** Rechtlicher Hinweis unter dem Formular (vor dem Datenschutz-Link). */
  einwilligung: string;
  sendet: string;
  erfolg: string;
  /**
   * Die Erfolgsmeldung bei DOPPELTER ANMELDUNG – eine andere Wahrheit.
   *
   * „Ihre Nachricht wurde gesendet" ist dort falsch: Gesendet wurde eine Mail
   * an den Absender, angekommen ist beim Betrieb nichts, und die Adresse steht
   * nirgends. Wer die Mail übersieht, bliebe überzeugt, angemeldet zu sein –
   * und fehlt dann in der Liste.
   *
   * Sie hängt bewusst NICHT an einer Angabe, die jemand setzen muss: Der
   * Motor leitet sie aus `doppelteAnmeldung` ab. Ein Feld, das man vergessen
   * kann, wäre hier die Falle, nicht die Lösung.
   */
  erfolgOptIn: string;
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
  erfolgOptIn:
    'Fast geschafft: In Ihrem Postfach liegt eine E-Mail. Erst der Klick darin schließt die Anmeldung ab.',
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
  erfolgOptIn:
    'Fast geschafft: In deinem Postfach liegt eine E-Mail. Erst der Klick darin schließt die Anmeldung ab.',
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
  erfolgOptIn:
    'Almost done: an email is waiting in your inbox. Only the click inside it completes your sign-up.',
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
  /**
   * WIRD ABGELEITET, NICHT GEPFLEGT – siehe `motorBeschriftungen()` unten.
   * Der Wert hier ist der Rückfall für den Fall, dass es keine englische
   * Erklärung gibt.
   */
  datenschutzPfad: string;
  vorschauTitel: string;
  honeypot: string;
  zurueck: string;
  weiter: string;
  /** Sprungmarke ganz oben – der erste Text, den ein Vorleseprogramm ansagt. */
  zumInhalt: string;
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
    zumInhalt: 'Zum Inhalt springen',
  },
  en: {
    senden: 'Send',
    optional: '(optional)',
    bitteWaehlen: 'Please choose',
    datenschutz: 'privacy policy',
    /* Rückfall auf die deutsche Erklärung. Gibt es /en/datenschutz, setzt
       `motorBeschriftungen()` den Pfad selbst – siehe dort. */
    datenschutzPfad: '/datenschutz',
    vorschauTitel: 'Preview: nothing is sent',
    honeypot: 'Please leave this field empty',
    zurueck: 'Back',
    weiter: 'Next',
    zumInhalt: 'Skip to content',
  },
};

/** Liefert die Motor-Texte in der gewählten Ansprache und Sprache. */
export function motorTexte(ansprache: Ansprache, sprache: 'de' | 'en' = 'de'): MotorTexte {
  if (sprache === 'en') return EN;
  return ansprache === 'du' ? DU : SIE;
}

/**
 * DER DATENSCHUTZ-PFAD WIRD ABGELEITET, NICHT VON HAND GESETZT.
 * ---------------------------------------------------------------------------
 * Hier stand für Englisch fest `/datenschutz`, mit dem Hinweis „baut ein Klon
 * eine englische Route, wird der Pfad hier gesetzt". Dafür musste ein Klon
 * eine Motor-Bibliotheksdatei ändern – genau der Handgriff, den der nächste
 * Klon wieder vergisst.
 *
 * Was daran hängt: Der Link steht direkt unter dem Häkchen, mit dem die
 * Besucherin bestätigt, die Erklärung gelesen zu haben. Eine Einwilligung ist
 * in verständlicher Sprache einzuholen (Art. 7 DSGVO) – ein Verweis auf die
 * deutsche Fassung erfüllt das auf einer englischen Seite nicht.
 *
 * Gibt es `src/pages/en/datenschutz.astro`, zeigt der Link dorthin. Sonst
 * bleibt es beim deutschen Pfad, und das ist dann auch richtig so.
 */
export function motorBeschriftungen(sprache: 'de' | 'en' = 'de'): MotorBeschriftungen {
  const basis = BESCHRIFTUNGEN[sprache];
  if (sprache !== 'en' || !hatEnglischeFassung('/datenschutz')) return basis;
  return { ...basis, datenschutzPfad: '/en/datenschutz' };
}
