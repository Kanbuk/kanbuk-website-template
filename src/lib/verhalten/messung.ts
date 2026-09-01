/**
 * =============================================================================
 *  MESSUNG – meldet Handlungen an den Statistik-Dienst, den die Einwilligung
 *  freigegeben hat.
 *
 *  Branchenneutral: „Anruf getippt" ist beim Wirt die Reservierung, beim
 *  Installateur der Notdienst, in der Praxis der Terminwunsch. Der Baustein
 *  weiß davon nichts – er liest ab, was im Markup steht.
 *
 *  ---------------------------------------------------------------------------
 *  ZWEI WEGE, UND DER ERSTE BRAUCHT NIEMANDEN
 *  ---------------------------------------------------------------------------
 *  1. VON SELBST. Die Kontaktwege einer Seite stehen im Markup und sind
 *     eindeutig: `tel:` ist ein Anruf, `mailto:` eine Mail, `wa.me` ein
 *     WhatsApp-Tipp, eine Kartenadresse eine Route, eine `.pdf` ein geöffnetes
 *     Dokument. Der Baustein erkennt sie selbst – ohne dass jemand ein Attribut
 *     setzt.
 *
 *     WARUM DAS DER WICHTIGERE WEG IST: An einer echten Kundenseite standen
 *     elf `tel:`-Verweise, und fünf davon trugen ein Messattribut. Nicht aus
 *     Nachlässigkeit – die Nummer steht in Kopfleiste, Fußzeile, Kontaktblock,
 *     Schwebeknopf und auf jeder Unterseite, und beim Nachrüsten von Hand
 *     findet man nie alle. Der Betrieb hätte danach die Hälfte seiner Anrufe
 *     gezählt und die Zahl für die Wahrheit gehalten.
 *
 *     Abschalten für einen einzelnen Verweis (oder alles darin):
 *     `data-messung-aus` an das Element oder einen Vorfahren.
 *
 *  2. VON HAND, für alles, was nur dieser Betrieb kennt – der Knopf
 *     „Tisch reservieren", eine Kategorie der Speisekarte, eine Anmeldung:
 *
 *         <button data-messung="reservierung_begonnen"
 *                 data-messung-feld="stelle"
 *                 data-messung-wert="hero">Tisch reservieren</button>
 *
 *     `data-messung`       der Ereignisname (Pflicht)
 *     `data-messung-feld`  Name einer Zusatzangabe (freiwillig)
 *     `data-messung-wert`  ihr Wert (freiwillig)
 *
 *     Ein gesetztes `data-messung` gewinnt immer gegen die Erkennung – so
 *     lässt sich ein Anruf-Knopf auch anders benennen.
 *
 *  Aus dem Code heraus geht es über `melden(name, felder)` – so meldet das
 *  Formular seinen Erfolg, wo es kein anklickbares Element gibt.
 *
 *  WAS AUF DER SEITE ANZULEGEN IST, SAGT `npm run messung`: Der Befehl liest
 *  die gebaute Website und schreibt die fertige Liste für den Statistik-Dienst
 *  auf – je Kunde verschieden, weil jede Seite andere Wege hat.
 *
 *  ER VERGIBT NICHTS. Keine Klasse, kein ARIA-Attribut, keine Zustandsänderung.
 *  Er liest nur mit. Ohne JavaScript passiert gar nichts – und das ist richtig:
 *  Messung ist kein Bestandteil der Bedienung.
 *
 *  ---------------------------------------------------------------------------
 *  DATENSCHUTZ – bitte vor dem Einbau lesen
 *  ---------------------------------------------------------------------------
 *  1. ES WIRD AUSSCHLIESSLICH NACH DER EINWILLIGUNG GESENDET. Vor dem Ja gibt
 *     es weder `window.gtag` noch `window.dataLayer` – beide entstehen erst in
 *     dem Skript, das die Einwilligung freigibt. Geprüft wird deshalb ZWEIMAL:
 *     beim Start und bei jedem einzelnen Klick. Der Zuhörer wird früh gehängt,
 *     der Klick kommt später – dazwischen kann der Besucher widerrufen haben.
 *
 *  2. ES WIRD NICHTS GEPUFFERT. Was vor der Zustimmung passiert, ist verloren –
 *     mit Absicht. Ein Puffer wäre eine Aufzeichnung vor der Einwilligung und
 *     würde der Opt-in-Zusage widersprechen, die im Kopf von einwilligung.ts
 *     steht.
 *
 *  3. ÜBERTRAGEN WERDEN NUR FESTE WÖRTER – „kopfleiste", „fusszeile",
 *     „reservierung". Niemals ein Formularinhalt, niemals Nummer oder Adresse
 *     des Besuchers, niemals ein Text aus einer Serverantwort. Auch die
 *     erkannten Verweise geben NUR ihre Art weiter, nie ihr Ziel: gemeldet
 *     wird „anruf_getippt", nicht welche Nummer dort steht.
 *
 *  ---------------------------------------------------------------------------
 *  WARUM `gtag(…)` UND NICHT `dataLayer.push` – am 01.09.2026 nachgemessen
 *  ---------------------------------------------------------------------------
 *  Hier stand zuerst `dataLayer.push`, mit der Begründung, das sei „das, was
 *  gtag intern ohnehin tut", und man umgehe damit die Sperre des Prüf-Tors
 *  nicht. Die Begründung war falsch. An einer laufenden Seite gemessen:
 *
 *      dataLayer.push(['event', …])   ->  erreicht Google NICHT
 *      dataLayer.push(arguments)      ->  erreicht Google NICHT
 *      window.gtag('event', …)        ->  gesendet
 *
 *  Die Ereignisse lagen also in der Warteschlange und wurden nie abgeschickt.
 *  Alle Tore waren grün, alle Tests im eigenen Browser bestanden – gemessen
 *  wurde `dataLayer`, und darin stand ja etwas. Nur ankommen tat es nie.
 *  Gefunden erst, als jemand im Statistik-Dienst nachsah und dort nichts fand.
 *
 *  DIE LEHRE, und sie ist größer als dieser Baustein: Eine Messung ist erst
 *  bewiesen, wenn der Netzverkehr sie zeigt – nicht, wenn die eigene
 *  Warteschlange gefüllt ist.
 *
 *  Das Prüf-Tor verbietet `gtag(` im ausgelieferten JavaScript weiterhin. Es
 *  kennt jetzt aber eine bedingte Erlaubnis: erlaubt genau dann, wenn es
 *  diesen Baustein gibt UND er die Einwilligung abfragt. Wer ihn löscht und
 *  `gtag(` woanders hinschreibt, wird rot.
 * =============================================================================
 */
import { erlaubt } from './einwilligung';
import type { Kategorie } from './einwilligung';

/** Ereignisnamen und Feldnamen, die Google für sich reserviert hat. */
const VERBOTENE_PRAEFIXE = ['_', 'firebase_', 'ga_', 'google_', 'gtag.'];

/**
 * Schickt ein Ereignis – aber nur, wenn die Statistik freigegeben ist.
 *
 * Gibt `true` zurück, wenn wirklich gesendet wurde. Das ist kein Beiwerk:
 * Ohne diese Rückmeldung ließe sich beim Prüfen nicht unterscheiden, ob
 * nichts gesendet wurde, weil abgelehnt wurde, oder weil der Baustein nicht
 * läuft.
 */
export function melden(name: string, felder: Record<string, string> = {}): boolean {
  /* ERSTE SICHERUNG: die Entscheidung des Besuchers. */
  if (!erlaubt('statistik')) return false;

  /* ZWEITE SICHERUNG: Existiert der Kanal überhaupt? Vor der Freigabe gibt es
     ihn nicht, und ein ungeprüfter Zugriff wäre ein Fehler, der die ganze
     Verhaltenskette anhält – wegen einer Zahl, die niemand braucht. */
  const senden = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
  if (typeof senden !== 'function') return false;

  if (!istErlaubterName(name)) return false;

  /* KEIN ZERLEGEN IN KLAMMERN. `for (const [feld, wert] of Object.entries(…))`
     wäre hier das Naheliegende – und genau die eine moderne Schreibweise, die
     der Übersetzer NICHT ersetzen kann (CLAUDE.md 4a). Steht sie irgendwo im
     Browser-Code, ist das GESAMTE Skriptbündel für ältere Browser ein
     Lesefehler: Dann fällt nicht diese Messung aus, sondern jeder Baustein
     der Seite gleichzeitig – wegen einer Zahl. */
  const nutzlast: Record<string, string> = {};
  const felderNamen = Object.keys(felder);
  for (let i = 0; i < felderNamen.length; i++) {
    const feld = felderNamen[i];
    const wert = felder[feld];
    if (!feld || !wert || !istErlaubterName(feld)) continue;
    /* 100 Zeichen sind für ein festes Wort reichlich. Die Grenze steht hier
       nicht gegen Google, sondern gegen uns selbst: Sie macht es unmöglich,
       versehentlich einen Freitext mitzuschicken. */
    nutzlast[feld] = String(wert).slice(0, 100);
  }

  try {
    senden('event', name, nutzlast);
    return true;
  } catch {
    /* Eine Messung darf nie eine Seite anhalten. */
    return false;
  }
}

/**
 * Prüft die Namensregeln von Google – Buchstabe am Anfang, nur Buchstaben,
 * Ziffern und Unterstriche, kein reserviertes Präfix.
 *
 * Warum überhaupt: Ein falscher Name wird stillschweigend verworfen. Ohne
 * diese Prüfung fehlt die Zahl später einfach, und niemand weiß warum.
 */
function istErlaubterName(name: string): boolean {
  if (!/^[A-Za-z][A-Za-z0-9_]{0,39}$/.test(name)) return false;
  return !VERBOTENE_PRAEFIXE.some((p) => name.toLowerCase().startsWith(p));
}

/**
 * DIE KONTAKTWEGE, DIE DER MOTOR VON SELBST ERKENNT.
 *
 * Diese Liste ist die einzige Wahrheit darüber, was automatisch gemessen wird –
 * `scripts/messung.mjs` liest sie beim Erstellen der Anlege-Liste aus DIESER
 * Datei. Wer hier etwas ergänzt, muss die Liste dort nicht nachziehen.
 *
 * Bewusst NICHT dabei: gewöhnliche Verweise auf eigene Unterseiten. Die zählt
 * der Statistik-Dienst ohnehin als Seitenaufruf; ein zweites Ereignis daneben
 * wäre dieselbe Zahl unter anderem Namen.
 */
const ERKANNTE_WEGE: Array<{ name: string; passt: (ziel: string) => boolean }> = [
  { name: 'anruf_getippt', passt: (z) => z.indexOf('tel:') === 0 },
  /* KEIN EMPFÄNGER, KEIN KONTAKT – die wichtigste Zeile dieser Liste.
     -----------------------------------------------------------------
     `mailto:info@betrieb.at` schreibt DEM BETRIEB. `mailto:?subject=…`
     dagegen öffnet ein leeres Mailfenster, in das der Besucher selbst einen
     Empfänger einträgt: Das ist ein TEILEN-Knopf, kein Kontaktweg. Genau so
     bei WhatsApp – `wa.me/4315224280` ruft den Betrieb, `wa.me/?text=…`
     schickt irgendwem eine Empfehlung.

     Ohne diese Unterscheidung zählt jeder Teilen-Knopf als Kontaktaufnahme.
     An einer echten Kundenseite (Teilen-Menü der Speisekarte mit WhatsApp,
     Facebook und Mail) wäre daraus je ein erfundener „Gast will uns
     erreichen" geworden – und zwar auf der meistbesuchten Unterseite. Der
     Fehler geht in die andere Richtung als der, gegen den die Erkennung
     antritt, und ist genauso schlimm: Beide Male glaubt der Betrieb eine
     Zahl, die es nicht gibt. */
  { name: 'mail_getippt', passt: (z) => /^mailto:[^?\s]*@/i.test(z) },
  {
    name: 'whatsapp_getippt',
    passt: (z) =>
      /^https?:\/\/(?:wa\.me|api\.whatsapp\.com)/i.test(z) &&
      (/wa\.me\/\+?\d/i.test(z) || /[?&]phone=\+?\d/i.test(z)),
  },
  {
    name: 'route_geplant',
    passt: (z) =>
      /^https?:\/\/(?:[a-z0-9.-]*\.)?(?:google\.[a-z.]+\/maps|maps\.google\.|maps\.app\.goo\.gl|openstreetmap\.org)/i.test(
        z,
      ),
  },
  { name: 'dokument_geoeffnet', passt: (z) => /\.pdf(?:$|[?#])/i.test(z) },
];

/**
 * WO auf der Seite geklickt wurde – als festes Wort, nie als Text des Knopfes.
 *
 * Warum das mitgeht: „Zwölf Anrufe" sagt einem Betrieb wenig. „Zehn davon aus
 * der Fußzeile" sagt ihm, dass die Nummer weiter oben gehört.
 */
function stelleVon(el: Element): string {
  const bereich = el.closest('dialog, header, footer, main, aside');
  if (!bereich) return 'seite';
  const tag = bereich.tagName.toLowerCase();
  if (tag === 'dialog') return 'fenster';
  if (tag === 'header') return 'kopfleiste';
  if (tag === 'footer') return 'fusszeile';
  if (tag === 'aside') return 'randspalte';
  return 'inhalt';
}

/**
 * Hängt einen einzigen Zuhörer ans Dokument. Ein Zuhörer statt einer je
 * Element: So werden auch Elemente erfasst, die erst später entstehen – etwa
 * in einem Dialog –, und die Seite trägt keine hundert Zuhörer mit sich herum.
 */
export function messungStarten(): void {
  /* WIE der Besucher zugestimmt hat – nicht OB.
     -------------------------------------------------------------------
     „Wie viele stimmen zu?" lässt sich grundsätzlich nicht messen: Wer
     ablehnt, löst per Definition nichts aus, sonst würde gegen die eigene
     Zusage gemessen. Ein Ereignis „akzeptiert" käme deshalb immer auf 100 %
     der Gemessenen – eine Zahl, die wie eine Erkenntnis aussieht und keine
     ist.

     Messbar und brauchbar ist die ART der Zustimmung: alles freigegeben oder
     nur einzelne Kategorien. Daran sieht ein Betrieb, ob seine Besucher die
     bequemen Zusatzdienste wollen oder nur widerwillig durchklicken.

     Das Signal kommt aus einwilligung.ts (`einwilligung:geaendert`). Es
     entsteht nur bei einer NEUEN Entscheidung – bei einem wiederkehrenden
     Besucher mit gespeicherter Wahl feuert es nicht. Genau richtig: Gemessen
     wird der Moment der Entscheidung, nicht jeder Seitenaufruf.

     Kein Import aus messung.ts in einwilligung.ts und umgekehrt kein Aufruf
     von dort – die beiden würden sich sonst gegenseitig laden. */
  document.addEventListener('einwilligung:geaendert', () => {
    /* `melden` prüft selbst; nach einem Widerruf geht hier nichts hinaus. */

    /* GEMESSEN WIRD GEGEN DAS, WAS ES AUF DIESER WEBSITE ÜBERHAUPT GIBT –
       nicht gegen die drei Kategorien, die der Motor kennt.

       Hier stand die feste Liste ['funktional','statistik','marketing'], und
       „alle" konnte damit nur herauskommen, wenn eine Website zufällig alle
       drei benutzt. Ein Betrieb mit Statistik und Karte (also zwei
       Kategorien) bekam für JEDEN Gast, der „Alle akzeptieren" drückte, die
       Meldung „funktional_statistik" – und im Bericht sah es aus, als hätte
       niemand alles freigegeben. Eine Zahl, die immer dasselbe Falsche sagt,
       ist schlimmer als keine.

       Die Liste steht am Banner (`data-einwilligung-kategorien`) und wird
       beim Bauen über alle Quelldateien gebildet. */
    const banner = document.querySelector<HTMLElement>('[data-einwilligung-kategorien]');
    const roh = banner && banner.dataset.einwilligungKategorien;
    const kategorien: Kategorie[] = roh
      ? (roh.split(' ').filter(Boolean) as Kategorie[])
      : ['funktional', 'statistik', 'marketing'];

    const gewaehlt: string[] = [];
    for (let i = 0; i < kategorien.length; i++) {
      if (erlaubt(kategorien[i])) gewaehlt.push(kategorien[i]);
    }
    melden('einwilligung_erteilt', {
      auswahl: gewaehlt.length === kategorien.length ? 'alle' : gewaehlt.join('_') || 'keine',
    });
  });

  document.addEventListener(
    'click',
    (e) => {
      const ziel = e.target as Element | null;
      if (!ziel || typeof ziel.closest !== 'function') return;

      /* 1. VON HAND GESETZT – gewinnt immer. */
      const el = ziel.closest<HTMLElement>('[data-messung]');
      if (el && el.dataset.messung) {
        if (el.closest('[data-messung-aus]')) return;
        const feld = el.dataset.messungFeld;
        const wert = el.dataset.messungWert;
        melden(el.dataset.messung, feld && wert ? { [feld]: wert } : { stelle: stelleVon(el) });
        return;
      }

      /* 2. VON SELBST ERKANNT. */
      const verweis = ziel.closest<HTMLAnchorElement>('a[href]');
      if (!verweis) return;
      if (verweis.closest('[data-messung-aus]')) return;

      /* `getAttribute` statt `.href`: Der Browser vervollständigt `.href` zur
         absoluten Adresse und macht aus einer relativen `/karte.pdf` eine mit
         Domain davor. Für die Erkennung ist beides gleich – aber was im Markup
         steht, ist nachvollziehbar, und `tel:`/`mailto:` bleiben unverändert. */
      const zielAdresse = verweis.getAttribute('href') || '';
      if (!zielAdresse) return;

      for (let i = 0; i < ERKANNTE_WEGE.length; i++) {
        if (ERKANNTE_WEGE[i].passt(zielAdresse)) {
          melden(ERKANNTE_WEGE[i].name, { stelle: stelleVon(verweis) });
          return;
        }
      }
    },
    /* In der Erfassungsphase: Ein Klick, der unterwegs abgefangen wird (etwa
       vom Dialog-Baustein), soll trotzdem gezählt werden. */
    true,
  );
}
