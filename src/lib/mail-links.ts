/**
 * SIGNIERTE LINKS IN E-MAILS – Abmeldung und Anmelde-Bestätigung.
 * ===========================================================================
 * Zwei Links brauchen der Motor und jeder Betrieb, der Adressen sammelt:
 *
 *   • der ABMELDE-Link in jeder Mail an eine Verteilerliste
 *   • der BESTÄTIGUNGS-Link der doppelten Anmeldung (Double Opt-in)
 *
 * Beide tun etwas, ohne dass sich jemand anmeldet – deshalb müssen sie
 * fälschungssicher sein.
 *
 * WARUM DIE ADRESSE NICHT NACKT IM LINK STEHEN DARF
 * ---------------------------------------------------------------------------
 * `…/api/abmelden?e=jemand@example.com` wäre eine Einladung, wildfremde
 * Adressen auszutragen – wer einmal so einen Link gesehen hat, tauscht die
 * Adresse. Der Schaden ist begrenzt (niemand bekommt Daten zu sehen), aber es
 * ist eine Verarbeitung im fremden Namen.
 *
 * Deshalb hängt an jedem Link eine kurze Signatur. Sie entsteht aus den Daten
 * und einem Geheimnis; ohne das Geheimnis lässt sie sich nicht berechnen, und
 * ein veränderter Link fällt sofort durch.
 *
 * KEIN NEUES PAKET: `createHmac` und `timingSafeEqual` sind Node-Bordmittel.
 * Bedingung ist, dass die Serverfunktionen im Node-Laufzeitumfeld laufen –
 * deshalb steht in jeder `api/`-Datei `export const config = { runtime:
 * 'nodejs' }`. Im Edge-Umfeld gäbe es `node:crypto` nicht, und die Funktion
 * stürbe beim Einlesen des Moduls: genau der Fehlertyp, für den es das neunte
 * Tor gibt.
 *
 * `timingSafeEqual` statt `===`: Ein normaler Zeichenkettenvergleich bricht
 * beim ersten Unterschied ab und verrät über die Dauer, wie viele Zeichen
 * gestimmt haben. Bei einer Signatur ist das der Weg, sie zu erraten.
 *
 * DREI ENTSCHEIDUNGEN, DIE NICHT VERLOREN GEHEN DÜRFEN
 * ---------------------------------------------------------------------------
 * 1. DER ZWECK GEHT IN DIE SIGNATUR EIN. Sonst taugt ein Abmeldelink als
 *    Bestätigungslink – und wer eine fremde Adresse ausgetragen hat, könnte
 *    sie mit demselben Link wieder eintragen.
 *
 * 2. DIE FORMULAR-KENNUNG GEHT EBENFALLS EIN. Der Klon, aus dem dieser
 *    Baustein zurückkam, hatte genau EIN Formular und nahm im Endpunkt
 *    `site.formulare[0]`. Ein Betrieb mit Kontakt- UND Anmeldeformular
 *    bestätigt damit das falsche Formular. Stünde die Kennung nur in der
 *    Adresszeile, liesse sie sich tauschen – deshalb gehört sie in die
 *    Rechnung.
 *
 * 3. DER BESTÄTIGUNGSLINK LÄUFT AB, DER ABMELDELINK NIE.
 *    Ein Bestätigungslink ohne Ablauf gilt ewig; wer ihn in einem
 *    weitergeleiteten Mailverlauf findet, kann die Adresse erneut eintragen.
 *    Vierzehn Tage sind lang genug für jeden, der seine Post nicht täglich
 *    liest. Ein ABGELAUFENER Abmeldelink wäre dagegen ein Rechtsproblem: Die
 *    Abmeldung muss jederzeit möglich sein, auch aus einer zwei Jahre alten
 *    Mail. Deshalb bekommt nur der Anmeldeweg einen Zeitstempel.
 *
 * WOHER DAS GEHEIMNIS KOMMT
 * ---------------------------------------------------------------------------
 * Aus `LINK_GEHEIMNIS`, ersatzweise aus `RESEND_API_KEY`. Der Ersatz ist kein
 * Trick, sondern die Vermeidung einer zweiten Variablen, die jemand vergessen
 * kann – und der Schlüssel liegt ohnehin genau dort, wo auch der Versand
 * passiert. Der Schlüssel selbst verlässt den Server nie; aus ihm entsteht
 * nur ein Abdruck.
 *
 * ACHTUNG BEIM SCHLÜSSELTAUSCH: Wird `RESEND_API_KEY` erneuert, werden alle
 * offenen Bestätigungslinks ungültig – ohne dass es jemandem auffällt. Wer
 * den Schlüssel regelmässig tauscht, setzt deshalb `LINK_GEHEIMNIS` einmal
 * eigenständig; dann hängt es nicht mehr aneinander.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Wofür die Signatur gilt. Sie geht in die Berechnung ein, damit ein Link
 * NICHT für den anderen Zweck taugt.
 */
export type Zweck = 'abmelden' | 'anmelden';

/** Wie lange ein Bestätigungslink gilt. Der Abmeldelink läuft NIE ab. */
export const ANMELDUNG_GUELTIG_TAGE = 14;

/** Tage seit dem 1.1.1970 – grob genug, um ohne Uhrzeit auszukommen. */
function heuteInTagen(): number {
  return Math.floor(Date.now() / 86_400_000);
}

/** Das Geheimnis für die Signatur. Siehe Dateikopf. */
export function linkGeheimnis(env: { LINK_GEHEIMNIS?: string; RESEND_API_KEY?: string }): string {
  return env.LINK_GEHEIMNIS || env.RESEND_API_KEY || '';
}

/**
 * Kurze, URL-sichere Signatur über Zweck, Formular, Adresse und (nur beim
 * Anmelden) den Tag der Ausstellung.
 *
 * Die Adresse wird VOR der Rechnung kleingeschrieben und beschnitten, weil
 * die Endpunkte sie beim Lesen ebenso behandeln – sonst schlägt jede Signatur
 * mit Grossbuchstaben fehl, und zwar nur bei manchen Leuten.
 */
export function signatur(
  email: string,
  geheimnis: string,
  zweck: Zweck,
  formularId: string,
  tag?: number,
): string {
  const stoff = [zweck, formularId, email.trim().toLowerCase()];
  if (zweck === 'anmelden') stoff.push(String(tag ?? heuteInTagen()));
  return createHmac('sha256', geheimnis).update(stoff.join(':')).digest('base64url').slice(0, 22);
}

/** Ergebnis der Prüfung – mit Grund, damit der Endpunkt sauber antworten kann. */
export type Pruefung = { gilt: true } | { gilt: false; grund: 'signatur' | 'abgelaufen' };

/** Stimmt die Signatur – und ist sie noch gültig? */
export function signaturPruefen(
  email: string,
  gegeben: string,
  geheimnis: string,
  zweck: Zweck,
  formularId: string,
  tag?: number,
): Pruefung {
  if (!geheimnis) return { gilt: false, grund: 'signatur' };
  const soll = Buffer.from(signatur(email, geheimnis, zweck, formularId, tag));
  const ist = Buffer.from(String(gegeben ?? ''));
  if (soll.length !== ist.length) return { gilt: false, grund: 'signatur' };
  if (!timingSafeEqual(soll, ist)) return { gilt: false, grund: 'signatur' };
  /* Erst nach der Echtheit die Frist prüfen: Ein gefälschter Link soll nicht
     „abgelaufen" heissen, das wäre eine Auskunft an den Fälscher. */
  if (zweck === 'anmelden') {
    const alter = heuteInTagen() - Number(tag ?? -1);
    if (!Number.isFinite(alter) || alter < 0 || alter > ANMELDUNG_GUELTIG_TAGE) {
      return { gilt: false, grund: 'abgelaufen' };
    }
  }
  return { gilt: true };
}

function link(
  pfad: string,
  basis: string,
  email: string,
  geheimnis: string,
  zweck: Zweck,
  formularId: string,
  englisch: boolean,
): string {
  const u = new URL(pfad, basis.endsWith('/') ? basis : basis + '/');
  const tag = zweck === 'anmelden' ? heuteInTagen() : undefined;
  u.searchParams.set('e', email);
  u.searchParams.set('f', formularId);
  if (tag !== undefined) u.searchParams.set('t', String(tag));
  u.searchParams.set('s', signatur(email, geheimnis, zweck, formularId, tag));
  if (englisch) u.searchParams.set('lang', 'en');
  return u.href;
}

/** Der fertige Abmelde-Link für eine Adresse. Läuft nie ab. */
export function abmeldeLink(
  basis: string,
  email: string,
  geheimnis: string,
  formularId: string,
  englisch = false,
): string {
  return link('/api/abmelden', basis, email, geheimnis, 'abmelden', formularId, englisch);
}

/**
 * Der Bestätigungslink der doppelten Anmeldung.
 *
 * ERST DIESER KLICK macht aus einer eingetippten Adresse eine Anmeldung.
 * Vorher steht sie nirgends – nicht in der Verteilerliste, nicht im Postfach
 * des Betriebs.
 */
export function anmeldeLink(
  basis: string,
  email: string,
  geheimnis: string,
  formularId: string,
  englisch = false,
): string {
  return link('/api/bestaetigen', basis, email, geheimnis, 'anmelden', formularId, englisch);
}
