/**
 * MOBILMENÜ – Navigation am Handy auf-/zuklappen.
 *
 * Markup:
 *   <button data-menue-schalter aria-controls="hauptnavi">Menü</button>
 *   <nav id="hauptnavi" data-menue>… </nav>
 *
 * Vergibt: aria-expanded, .ist-offen (auf Schalter, Navigation und <html>).
 * `html.menue-offen` gibt dem Design die Möglichkeit, das Scrollen zu sperren.
 * Schließt bei Escape, bei Klick auf einen Link und beim Wechsel auf Desktop.
 */
export function mobilmenueStarten(): void {
  const schalter = document.querySelector<HTMLButtonElement>('[data-menue-schalter]');
  const navi = document.querySelector<HTMLElement>('[data-menue]');
  if (!schalter || !navi) return;

  schalter.setAttribute('type', 'button');
  schalter.setAttribute('aria-expanded', 'false');
  if (navi.id) schalter.setAttribute('aria-controls', navi.id);

  function setze(offen: boolean) {
    schalter!.setAttribute('aria-expanded', String(offen));
    schalter!.classList.toggle('ist-offen', offen);
    navi!.classList.toggle('ist-offen', offen);
    document.documentElement.classList.toggle('menue-offen', offen);
  }

  const offen = () => schalter.getAttribute('aria-expanded') === 'true';

  schalter.addEventListener('click', () => setze(!offen()));

  navi.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setze(false)));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && offen()) {
      setze(false);
      schalter.focus();
    }
  });

  /*
   * Beim Wechsel auf Desktop-Breite sicher zurücksetzen, damit kein
   * gesperrtes Scrollen zurückbleibt.
   *
   * DIE BREITE KOMMT AUS DEM MARKUP, NICHT AUS DIESER DATEI. Hier stand
   * `(min-width: 900px)` fest – während der Umschaltpunkt im CSS des jeweiligen
   * Designs steht. Im ersten Testlauf mit einem echten Kundendesign lag er bei
   * 1120 px (gemessen an der Breite von Logo + fünf Navigationspunkten). Ergebnis
   * wäre gewesen: Zwischen 900 und 1120 px schließt sich das Menü beim Drehen
   * des Geräts, obwohl der Hamburger noch da ist – und die Seitensperre bleibt.
   * Zwei Zahlen für dieselbe Entscheidung laufen immer auseinander.
   *
   * Also: `data-menue-ab="1120px"` an den Schalter schreiben. Fehlt es, bleiben
   * es 900 px wie bisher.
   */
  const abBreite = schalter.getAttribute('data-menue-ab') || '900px';
  const abfrage = window.matchMedia(`(min-width: ${abBreite})`);
  const beiWechsel = (e: MediaQueryListEvent | MediaQueryList) => {
    if (e.matches) setze(false);
  };
  /* ZWEI WEGE, UND DAS IST HIER KEINE VORSICHT, SONDERN PFLICHT.
     `MediaQueryList.addEventListener` gibt es erst ab Safari 14. Die Zusage in
     `browser-untergrenze.json` lautet aber „bedienbar ab Safari 12", und
     bedienbar heißt dort wörtlich: Navigation, Filter, Merkliste, Formular und
     Bilder funktionieren.

     Was ohne diese Weiche passiert, ist nicht „das Menü schließt nicht beim
     Drehen": Der Aufruf wirft, die Ausnahme fliegt aus `verhaltenStarten()`
     heraus, und ALLE danach eingehängten Bausteine starten nicht mehr – ohne
     eine Meldung für den Besucher. Ein Baustein reisst die halbe Seite mit.

     Kein Tor sieht das: `npm run browser` prüft Syntax und eine CSS-Liste,
     und CLAUDE.md Abschnitt 4a nennt `matchMedia.addEventListener` selbst als
     blinden Fleck – der Motor ist genau da hineingetreten.

     `addListener` ist veraltet, aber in Safari 12/13 der einzige Weg und in
     neuen Browsern weiterhin vorhanden. */
  if (typeof abfrage.addEventListener === 'function') {
    abfrage.addEventListener('change', beiWechsel);
  } else if (typeof abfrage.addListener === 'function') {
    abfrage.addListener(beiWechsel);
  }
}
