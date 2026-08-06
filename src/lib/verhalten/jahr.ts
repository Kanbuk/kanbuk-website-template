/**
 * JAHRESZAHL UND „HEUTE" – im BROWSER gesetzt, nicht beim Bauen.
 *
 * WARUM NICHT BEIM BAUEN
 * ===========================================================================
 * `new Date()` in einer Astro-Datei läuft beim BAUEN. Der Wert friert damit
 * auf den Tag des letzten Builds ein. Eine statische Seite wird nach dem
 * Live-Gang oft monatelang nicht neu gebaut – und ein Bau entsteht nur aus
 * einer ÄNDERUNG, nie aus dem Verstreichen von Zeit. Genau davor warnt
 * CLAUDE.md Abschnitt 5: „Jede Zeitangabe, die beim BAUEN gerechnet wird, ist
 * eine Zeitbombe."
 *
 * Dieser Baustein entschärft zwei davon.
 *
 * 1. DIE JAHRESZAHL DER FUSSZEILE
 * ---------------------------------------------------------------------------
 * Am 1. Jänner steht sonst auf JEDER Seite das Vorjahr, bis zufällig jemand
 * etwas anderes ändert. Niemandem fällt es auf, weil nichts kaputt aussieht –
 * es sieht nur alt aus, und zwar genau bei dem Besucher, der prüfen will, ob
 * es den Betrieb noch gibt.
 *
 * 2. DAS FRÜHESTE DATUM IN EINEM FORMULAR
 * ---------------------------------------------------------------------------
 * Ein Feld mit `minDatum: 'heute'` (Reservierung, Termin, Abholung) bekam sein
 * `min` ebenfalls beim Bauen. Wirkung: Eine Seite, die im Juni gebaut wurde,
 * lässt im Dezember eine Reservierung für einen Tag im Juni zu. Der Betrieb
 * bekommt eine Anfrage für ein Datum, das seit einem halben Jahr vorbei ist –
 * und der Besucher hat nichts falsch gemacht, der Browser hat es erlaubt.
 *
 * Das ist die schlimmere der beiden: Die Jahreszahl sieht bloß alt aus, das
 * Datumsfeld nimmt eine falsche Anfrage entgegen. Im Kundenprojekt gemeldet
 * wurde nur die Jahreszahl – die zweite Stelle fiel beim Nachsehen auf.
 *
 * WARUM DIE WERTE TROTZDEM AUCH IM MARKUP STEHEN
 * ===========================================================================
 * Der Baustein ERSETZT einen Wert, er erzeugt ihn nicht. Im Markup steht der
 * Bau-Stand als Rückfall. Ohne JavaScript – und für jeden Crawler, der kein
 * Skript ausführt – bleibt dieser Rückfall stehen. Das ist der schlechtere,
 * aber immer noch sinnvolle Wert; eine leere Klammer wäre schlimmer als eine
 * Zahl, die ein Jahr alt ist.
 *
 * Markup (erzeugt `src/components/Jahr.astro` bzw. `Formular.astro`):
 *   <span data-jahr>2026</span>
 *   <input type="date" data-min-heute min="2026-08-06">
 */
export function jahrStarten(): void {
  const jetzt = new Date();

  const ziele = document.querySelectorAll<HTMLElement>('[data-jahr]');
  const jahr = String(jetzt.getFullYear());
  for (let i = 0; i < ziele.length; i++) {
    /* Nur anfassen, wenn sich wirklich etwas ändert. Ein blindes Überschreiben
       löst bei jedem Seitenaufruf ein Layout-Update aus, obwohl in elf von
       zwölf Monaten dasselbe drinsteht. */
    if (ziele[i].textContent !== jahr) ziele[i].textContent = jahr;
  }

  /* Das früheste Datum. Gerechnet wird in der ZEITZONE DES BETRIEBS, nicht in
     der des Besuchers: Wer aus Tokio auf die Seite eines Wiener Betriebs
     schaut, ist dort schon einen Tag weiter und dürfte sonst einen Tag nicht
     buchen, den es in Wien noch gibt. Die Zeitzone steht am Feld. */
  const felder = document.querySelectorAll<HTMLInputElement>('input[data-min-heute]');
  for (let i = 0; i < felder.length; i++) {
    const feld = felder[i];
    const zone = feld.dataset.minHeute || 'Europe/Vienna';
    let heute: string;
    try {
      /* `en-CA` liefert JJJJ-MM-TT – genau das Format, das `min` erwartet. */
      heute = new Intl.DateTimeFormat('en-CA', {
        timeZone: zone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(jetzt);
    } catch (e) {
      /* Unbekannte Zeitzone: lieber der Bau-Stand als gar keine Grenze. */
      continue;
    }
    if (feld.min !== heute) feld.min = heute;
    /* Steht im Feld schon ein Datum aus der Vergangenheit – etwa weil der
       Browser es aus einem früheren Besuch wiederhergestellt hat –, wird es
       geräumt. Sonst zeigt das Feld einen Wert, den es selbst nicht annimmt. */
    if (feld.value && feld.value < heute) feld.value = '';
  }
}
