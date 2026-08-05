/**
 * SLIDER – horizontal durchlaufende Inhalte (Galerie, Stimmen, Projekte).
 *
 * Nutzt natives Scroll-Snapping; das JS steuert nur Pfeile, Punkte und den
 * Auto-Durchlauf. Ohne JS bleibt es ein scrollbarer Streifen – nichts kaputt.
 *
 * Markup:
 *   <div data-slider data-slider-auto="4500">
 *     <div data-slider-spur>
 *       <figure> … </figure>
 *       <figure> … </figure>
 *     </div>
 *     <button data-slider-zurueck>‹</button>
 *     <button data-slider-vor>›</button>
 *     <div data-slider-punkte></div>   <!-- Punkte werden erzeugt -->
 *   </div>
 *
 * data-slider-auto="<ms>" schaltet den Auto-Durchlauf ein (weglassen = aus).
 * Auto-Durchlauf pausiert bei Hover, Fokus und im Hintergrund-Tab und läuft
 * nie bei „Bewegung reduzieren".
 */
import { bewegungReduziert } from './hilfen';

export function sliderStarten(): void {
  document.querySelectorAll<HTMLElement>('[data-slider]').forEach((slider) => {
    const spur = slider.querySelector<HTMLElement>('[data-slider-spur]');
    if (!spur) return;
    const folien = Array.from(spur.children) as HTMLElement[];
    if (folien.length <= 1) return;

    const reduziert = bewegungReduziert();
    let index = 0;

    // Punkte erzeugen (nur wenn ein Behälter vorhanden ist)
    const punkteBox = slider.querySelector<HTMLElement>('[data-slider-punkte]');
    const punkte: HTMLButtonElement[] = [];
    if (punkteBox) {
      /* KEINE REITER-ROLLEN AN EINEM KARUSSELL.
         -------------------------------------------------------------------
         Hier stand `role="tablist"` am Behälter, `role="tab"` an jedem Punkt
         und `aria-selected` am aktiven. Das ist eine Zusage, die der Baustein
         nicht einlöst: Zu Reitern gehören `role="tabpanel"` an den Folien,
         `aria-controls` als Verbindung und Pfeiltasten zum Wechseln. Nichts
         davon gibt es hier.

         Für ein Vorleseprogramm ist das schlimmer als gar keine Rolle: Es
         kündigt „Registerkarte 1 von 5" an, der Benutzer drückt die
         Pfeiltaste – und nichts passiert. Wer sich darauf verlässt, kommt
         durch die Galerie gar nicht durch.

         Richtig ist die einfache Wahrheit: eine Gruppe von Knöpfen, von denen
         einer der aktuelle ist. `aria-current` sagt genau das. */
      punkteBox.setAttribute('role', 'group');
      if (!punkteBox.hasAttribute('aria-label')) {
        punkteBox.setAttribute('aria-label', slider.dataset.sliderPunkteLabel || 'Bildauswahl');
      }
      /* Die Beschriftung folgt der Seite, nicht dem Motor. `{n}` und `{m}`
         werden ersetzt – eine englische Seite setzt
         `data-slider-punkt-label="Image {n} of {m}"`. */
      const muster = slider.dataset.sliderPunktLabel || 'Bild {n} von {m}';
      folien.forEach((_, i) => {
        const p = document.createElement('button');
        p.type = 'button';
        p.className = 'slider-punkt';
        p.setAttribute(
          'aria-label',
          muster.replace('{n}', String(i + 1)).replace('{m}', String(folien.length)),
        );
        p.addEventListener('click', () => gehe(i, true));
        punkteBox.appendChild(p);
        punkte.push(p);
      });
    }

    function markiere(i: number) {
      index = i;
      punkte.forEach((p, j) => {
        p.classList.toggle('ist-aktiv', j === i);
        /* `aria-current` statt `aria-selected`: Letzteres gehört zu Reitern
           und Auswahllisten. Gesetzt wird es nur am aktuellen Punkt –
           `aria-current="false"` überall sonst wäre Lärm im Vorleseprogramm. */
        if (j === i) p.setAttribute('aria-current', 'true');
        else p.removeAttribute('aria-current');
      });
    }

    function gehe(i: number, anhalten = false) {
      const n = (i + folien.length) % folien.length;
      /* DIE GLÄTTUNG GEHÖRT DEM DESIGN.
         Hier stand fest `behavior: 'smooth'`. Eine ausdrückliche Angabe
         schlägt jedes CSS `scroll-behavior` an der Spur – ein Design mit
         eigener Galerie-Bewegung konnte den Baustein damit nicht benutzen,
         ohne sein Timing zu verlieren.

         Jetzt wird gelesen, was an der Spur steht: Schreibt das Design
         `scroll-behavior: auto`, springt es hart; schreibt es nichts, gilt
         die Motor-Vorgabe aus global.css. „Bewegung reduzieren" schlägt
         beides – das ist Barrierefreiheit, nicht Gestaltung. */
      const ausCss = getComputedStyle(spur!).scrollBehavior;
      spur!.scrollTo({
        left: folien[n].offsetLeft - spur!.offsetLeft,
        behavior: reduziert ? 'auto' : ausCss === 'auto' ? 'auto' : 'smooth',
      });
      markiere(n);
      if (anhalten) stopp();
    }

    slider.querySelector('[data-slider-zurueck]')?.addEventListener('click', () => gehe(index - 1, true));
    slider.querySelector('[data-slider-vor]')?.addEventListener('click', () => gehe(index + 1, true));

    // Beim manuellen Scrollen den aktiven Punkt mitführen
    let t: number | undefined;
    spur.addEventListener('scroll', () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        const naechste = folien.reduce(
          (best, f, i) => {
            const d = Math.abs(f.offsetLeft - spur.offsetLeft - spur.scrollLeft);
            return d < best.d ? { d, i } : best;
          },
          { d: Infinity, i: 0 },
        );
        markiere(naechste.i);
      }, 90);
    });

    // Auto-Durchlauf
    const takt = Number(slider.dataset.sliderAuto ?? 0);
    let timer: number | undefined;
    function start() {
      if (!takt || reduziert) return;
      stopp();
      timer = window.setInterval(() => gehe(index + 1), takt);
    }
    function stopp() {
      if (timer) window.clearInterval(timer);
      timer = undefined;
    }
    if (takt && !reduziert) {
      slider.addEventListener('mouseenter', stopp);
      slider.addEventListener('mouseleave', start);
      slider.addEventListener('focusin', stopp);
      slider.addEventListener('focusout', start);
      document.addEventListener('visibilitychange', () => (document.hidden ? stopp() : start()));
      start();
    }

    markiere(0);
  });
}
