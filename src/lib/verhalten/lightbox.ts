/**
 * LIGHTBOX – Bild groß anzeigen, mit Blättern.
 *
 * Nutzt das native <dialog>: Fokusfalle, Escape und Hintergrund-Sperre kommen
 * vom Browser. Der Dialog wird bei Bedarf einmal erzeugt.
 *
 * Markup:
 *   <div data-lightbox>
 *     <figure><img src="klein.webp" data-gross="gross.webp" alt="…"></figure>
 *     <figure><img src="klein2.webp" data-gross="gross2.webp" alt="…"></figure>
 *   </div>
 *
 * BLÄTTERN (seit 2026-07-27): Innerhalb einer `[data-lightbox]`-Box lässt sich
 * mit Pfeiltasten, Wischen und den Knöpfen durch ALLE Bilder blättern, mit
 * Zähler („3 / 12"). Vorher öffnete die Lightbox nur ein einzelnes Bild und man
 * musste sie zum Weiterschauen jedes Mal schließen – bei einer Fahrzeug- oder
 * Immobiliengalerie ist das der halbe Zweck der Sache.
 *
 * Ohne data-gross wird die Bildquelle selbst verwendet. Ohne JS bleibt die
 * Galerie eine normale Bildergalerie – nichts geht verloren.
 */
import { dialogOeffnen, dialogSchliessen } from './browserluecke.js';
export function lightboxStarten(): void {
  const boxen = document.querySelectorAll<HTMLElement>('[data-lightbox]');
  if (boxen.length === 0) return;

  let dialog: HTMLDialogElement | null = null;
  let bildEl: HTMLImageElement;
  let zaehlerEl: HTMLElement;
  let zurueckEl: HTMLButtonElement;
  let vorEl: HTMLButtonElement;

  /** Bilder der aktuell geöffneten Galerie und die Position darin. */
  let aktuelleBilder: HTMLImageElement[] = [];
  let index = 0;

  function dialogBauen(): HTMLDialogElement {
    const d = document.createElement('dialog');
    d.className = 'lightbox';
    d.innerHTML = `
      <button class="lightbox__schliessen" type="button" aria-label="Schließen">×</button>
      <button class="lightbox__zurueck" type="button" aria-label="Vorheriges Bild">‹</button>
      <img class="lightbox__bild" alt="" />
      <button class="lightbox__vor" type="button" aria-label="Nächstes Bild">›</button>
      <p class="lightbox__zaehler" aria-live="polite"></p>
    `;
    d.addEventListener('click', (e) => {
      // Klick auf den Hintergrund (nicht aufs Bild) schließt
      if (e.target === d || (e.target as HTMLElement).classList.contains('lightbox__schliessen')) {
        dialogSchliessen(d);
      }
    });
    document.body.appendChild(d);
    bildEl = d.querySelector('.lightbox__bild')!;
    zaehlerEl = d.querySelector('.lightbox__zaehler')!;
    zurueckEl = d.querySelector('.lightbox__zurueck')!;
    vorEl = d.querySelector('.lightbox__vor')!;

    zurueckEl.addEventListener('click', () => blaettern(-1));
    vorEl.addEventListener('click', () => blaettern(1));

    d.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); blaettern(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); blaettern(1); }
    });

    /* Wischen am Handy – dort ist es die naheliegendste Geste, und die
       Pfeilknöpfe sind bei einem Vollbild eher klein. */
    let startX = 0;
    d.addEventListener('touchstart', (e) => { startX = e.changedTouches[0].clientX; }, { passive: true });
    d.addEventListener('touchend', (e) => {
      const weite = e.changedTouches[0].clientX - startX;
      if (Math.abs(weite) > 50) blaettern(weite < 0 ? 1 : -1);
    }, { passive: true });

    return d;
  }

  function zeige() {
    const img = aktuelleBilder[index];
    if (!img) return;
    bildEl.src = img.dataset.gross || img.currentSrc || img.src;
    bildEl.alt = img.alt;
    const mehrere = aktuelleBilder.length > 1;
    zaehlerEl.textContent = mehrere ? `${index + 1} / ${aktuelleBilder.length}` : '';
    // Bei einem einzelnen Bild wären Pfeile sinnlose Klickfallen.
    zurueckEl.hidden = !mehrere;
    vorEl.hidden = !mehrere;
  }

  /** Blättert im Kreis – am Ende geht es wieder von vorn los. */
  function blaettern(richtung: number) {
    if (aktuelleBilder.length < 2) return;
    index = (index + richtung + aktuelleBilder.length) % aktuelleBilder.length;
    zeige();
  }

  boxen.forEach((box) => {
    const bilder = [...box.querySelectorAll<HTMLImageElement>('img')];
    bilder.forEach((img, nr) => {
      const knopf = img.closest('button') ?? img;
      knopf.setAttribute('role', 'button');
      knopf.setAttribute('tabindex', '0');
      knopf.setAttribute('aria-haspopup', 'dialog');

      function oeffne() {
        dialog ??= dialogBauen();
        aktuelleBilder = bilder;
        index = nr;
        zeige();
        dialogOeffnen(dialog);
      }

      knopf.addEventListener('click', oeffne);
      knopf.addEventListener('keydown', (e) => {
        const k = e as KeyboardEvent;
        if (k.key === 'Enter' || k.key === ' ') {
          e.preventDefault();
          oeffne();
        }
      });
    });
  });
}
