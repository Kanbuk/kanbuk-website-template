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

/** Liefert die Motor-Texte in der gewählten Ansprache. */
export function motorTexte(ansprache: Ansprache): MotorTexte {
  return ansprache === 'du' ? DU : SIE;
}
