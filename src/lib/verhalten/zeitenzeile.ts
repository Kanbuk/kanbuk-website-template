/**
 * =============================================================================
 *  ZEITENZEILE – die Öffnungszeiten stellen sich am richtigen Tag selbst um
 * =============================================================================
 *  Eine statisch gebaute Seite kennt genau ein Datum: das des Bauens. Jede
 *  Zeitangabe, die beim Bauen ausgerechnet wird, ist ab dem nächsten Tag ein
 *  eingefrorener Zustand – und ein Bau entsteht nur aus einer ÄNDERUNG, nicht
 *  aus dem Verstreichen von Zeit.
 *
 *  GENAU DARAN SCHEITERN DIE SONDERZEITEN. Wer einen Betriebsurlaub im Voraus
 *  einträgt, löst damit einen Bau aus, bei dem der Urlaub noch Zukunft ist. Am
 *  Urlaubstag selbst baut nichts mehr. Die Sperre wird also NIE sichtbar – und
 *  nach ihrem Ende bliebe „geschlossen" ebenso lange stehen, bis zufällig
 *  jemand etwas anderes ändert. Google zeigt derweil das Richtige (die
 *  Sonderzeiten stehen korrekt im JSON-LD), und die Website widerspricht ihm.
 *  Der Betrieb trägt seinen Urlaub gewissenhaft ein, sieht ihn nie auf der
 *  Seite – und erfährt davon durch Kundschaft vor verschlossener Tür.
 *
 *  Hier wird deshalb nur noch VERGLICHEN. Die fertigen Texte liegen im Markup;
 *  übrig bleibt eine Frage: Welches Datum ist heute, und fällt es in eine
 *  Sonderzeit?
 *
 *  Gerechnet wird in der ZEITZONE DES BETRIEBS, nicht in der der Besucherin.
 *  Wer aus Tokio auf die Seite schaut, soll die Wiener Öffnungszeiten sehen und
 *  nicht wegen der Zeitverschiebung einen Tag zu weit sein.
 *
 *  OHNE JAVASCRIPT bleibt der beim Bauen geschriebene Stand stehen – nie eine
 *  leere Fläche, im Regelfall (kein Urlaub) ohnehin derselbe Text.
 *
 *  ABGRENZUNG ZUM ÖFFNUNGS-STATUS: Der rechnet aus, OB gerade offen ist
 *  („Jetzt geöffnet · bis 22:00"). Diese Zeile tauscht einen fertigen TEXT
 *  („Mo–Fr 9–18 Uhr" gegen „Betriebsurlaub bis 18.01."). Fast jedes Design
 *  verlangt beides an verschiedenen Stellen.
 *
 *  Aktiviert durch:  data-zeitenzeile="<Plan als JSON>"
 *  Kein Zerlegen in Klammern – siehe CLAUDE.md Abschnitt 4a, Punkt 1.
 * =============================================================================
 */

interface Plan {
  /** Zeitzone des Betriebs, z. B. 'Europe/Vienna'. */
  zeitzone?: string;
  /** Der Text für den Normalfall. */
  woche: string;
  /** Zeiträume mit abweichendem Text. */
  sonder?: { von: string; bis: string; text: string }[];
}

export function zeitenzeileStarten(): void {
  const zeilen = document.querySelectorAll<HTMLElement>('[data-zeitenzeile]');
  if (zeilen.length === 0) return;

  for (const zeile of zeilen) {
    let plan: Plan;
    try {
      plan = JSON.parse(zeile.dataset.zeitenzeile ?? '');
    } catch {
      continue;
    }
    if (!plan || !plan.woche) continue;

    /* DIE ZEITZONE KOMMT AUS DEM PLAN, NICHT AUS EINER KONSTANTEN.
       Der Öffnungs-Status macht es genauso (`plan.zeitzone`). Stünde sie hier
       fest im Code, gäbe es im Motor zwei Wahrheiten für dieselbe Frage – und
       die eine ließe sich konfigurieren, die andere nicht.

       „en-CA" liefert das Datum als 2026-08-15 – dieselbe Schreibweise wie in
       der Konfiguration. Damit ist der Vergleich ein reiner Textvergleich und
       kommt ohne Datums-Arithmetik aus, die an Sommerzeit und Zeitzonen
       scheitern könnte. */
    let heute: string;
    try {
      heute = new Intl.DateTimeFormat('en-CA', {
        timeZone: plan.zeitzone || 'Europe/Vienna',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
    } catch {
      /* Kennt ein sehr altes Gerät die Zeitzone nicht, bleibt der gebaute
         Stand stehen. Das ist die richtige Reaktion: lieber der Stand von
         gestern als ein falsch gerechneter von heute. */
      continue;
    }

    const treffer = (plan.sonder ?? []).find((s) => heute >= s.von && heute <= s.bis);
    const soll = treffer ? treffer.text : plan.woche;

    /* Nur anfassen, wenn sich wirklich etwas ändert – sonst flackert die Zeile
       bei jedem Seitenaufruf kurz auf, obwohl derselbe Text danebensteht. */
    if (zeile.textContent && zeile.textContent.trim() !== soll) zeile.textContent = soll;
    else if (!zeile.textContent) zeile.textContent = soll;
  }
}
