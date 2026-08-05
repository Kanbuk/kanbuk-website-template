/**
 * ABWEICHENDE ZEITEN – blendet vergangene Feiertage und Betriebsurlaube aus.
 * ===========================================================================
 * Gehört zu `<Oeffnungszeiten />`.
 *
 * WARUM DAS IM BROWSER PASSIERT UND NICHT BEIM BAUEN:
 *
 * Der Baustein filterte die Abweichungen beim Bauen („nur bevorstehende, Stand
 * Bauzeitpunkt"). Damit unterlag er genau der Regel, die CLAUDE.md Abschnitt 5
 * inzwischen aufstellt: Eine rein statische Seite kennt nur das Datum ihres
 * letzten Baus, und ein Bau entsteht aus einer ÄNDERUNG, nie aus dem
 * Verstreichen von Zeit.
 *
 * Konkret: Der Betrieb trägt „24.–26. Dezember geschlossen" im November ein.
 * Das löst einen Bau aus, und die Zeile erscheint korrekt. Am 27. Dezember
 * baut nichts mehr – die Zeile bleibt stehen, bis zufällig jemand etwas
 * anderes ändert. Im Februar steht dann „Abweichende Zeiten: 24.–26.
 * Dezember" auf der Seite. Das ist kein Ausfall, es sieht nur falsch aus, und
 * genau deshalb meldet es niemand.
 *
 * Hier wird deshalb im Browser verglichen – als reiner Textvergleich zweier
 * Datumsangaben in der Zeitzone des BETRIEBS, nicht in der des Besuchers. Ein
 * Gast aus Tokio sieht sonst am frühen Nachmittag Wiener Zeit schon den
 * nächsten Tag.
 *
 * OHNE JAVASCRIPT bleibt der gebaute Stand stehen. Das ist die richtige
 * Reaktion: lieber eine Zeile zu viel als eine leere Fläche.
 */

const WAHL = '[data-abweichende-zeiten]';

export function abweichendeZeitenStarten(): void {
  for (const block of document.querySelectorAll<HTMLElement>(WAHL)) {
    /* „en-CA" liefert 2026-12-26 – dieselbe Schreibweise wie in der
       Konfiguration. Damit ist der Vergleich ein Textvergleich und kommt ohne
       Datums-Arithmetik aus, die an Sommerzeit scheitern könnte. Dieselbe
       Lösung wie in zeitenzeile.ts und oeffnungsstatus.ts. */
    let heute: string;
    try {
      heute = new Intl.DateTimeFormat('en-CA', {
        timeZone: block.dataset.zeitzone || 'Europe/Vienna',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
    } catch {
      continue; // Sehr altes Gerät ohne Zeitzonen – gebauter Stand bleibt.
    }

    let sichtbar = 0;
    for (const zeile of block.querySelectorAll<HTMLElement>('[data-ende]')) {
      const ende = zeile.dataset.ende ?? '';
      const vorbei = ende !== '' && ende < heute;
      zeile.hidden = vorbei;
      if (!vorbei) sichtbar++;
    }

    /* Ist nichts mehr übrig, verschwindet auch die Überschrift „Abweichende
       Zeiten" – sonst stünde eine Überschrift über einer leeren Liste. */
    block.hidden = sichtbar === 0;
  }
}
