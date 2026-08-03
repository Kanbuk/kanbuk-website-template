/**
 * =============================================================================
 *  EINBETTUNG – die 2-Klick-Lösung für Maps, Instagram, YouTube
 * =============================================================================
 *  Das Problem: Ein <iframe> zu Google Maps oder Instagram lädt SOFORT beim
 *  Seitenaufruf – setzt Cookies, überträgt die IP an einen fremden Konzern.
 *  Ohne vorherige Einwilligung ist das nicht zulässig.
 *
 *  Die Lösung: Der Rahmen wird NICHT ins HTML geschrieben. Stattdessen liegt
 *  dort ein Platzhalter (z. B. das statische Kartenbild). Erst wenn der Besucher
 *  bewusst klickt, entsteht der <iframe>. Vorher geht kein einziges Byte raus.
 *
 *  Damit kann ein Kunde eine echte Google-Karte haben, OHNE dass die Seite
 *  einen Cookie-Banner braucht – der Klick IST die Einwilligung für den Fall.
 *
 *  ABER: Die beste Lösung bleibt das statische Kartenbild mit Link
 *  (npm run karte). Kein Rahmen, kein Klick, keine Diskussion. Die
 *  2-Klick-Einbettung ist für Kunden, die unbedingt eine bediente Karte wollen.
 *
 *  Das AUSSEHEN kommt aus dem Design. Hier steht nur die Mechanik.
 * =============================================================================
 */
import { inhaltErsetzen } from './browserluecke.js';
import { erlaubt, type Kategorie } from './einwilligung';

export function einbettungStarten(): void {
  document.querySelectorAll<HTMLElement>('[data-einbettung]').forEach((box) => {
    const url = box.dataset.einbettung;
    if (!url) return;

    const titel = box.dataset.einbettungTitel ?? 'Externer Inhalt';
    const kategorie = (box.dataset.einbettungKategorie as Kategorie) ?? 'funktional';
    const seitenverhaeltnis = box.dataset.einbettungFormat ?? '16 / 9';

    function laden() {
      const rahmen = document.createElement('iframe');
      rahmen.src = url!;
      rahmen.title = titel;
      rahmen.loading = 'lazy';
      // Rechte so eng wie möglich halten.
      rahmen.referrerPolicy = 'no-referrer';
      rahmen.setAttribute('allow', 'fullscreen');
      /* „auto" heißt: Die Größe bestimmt das Design am Rahmen-Element, nicht
         der Baustein. Dann darf hier KEIN Seitenverhältnis gesetzt werden –
         `aspect-ratio: auto` bedeutet für ein <iframe> nämlich „keine Höhe",
         und dann greift die uralte HTML-Vorgabe von 150 px. Genau so sah die
         geladene Karte in einem Klon aus: ein 150-px-Streifen oben in einem
         435 px hohen Kasten, der Rest schwarz. Der Platzhalter davor saß
         richtig – der Fehler zeigte sich erst NACH dem Klick, also hinter
         einer Einwilligung, die von selbst keine Prüfung erteilt. */
      rahmen.style.cssText =
        seitenverhaeltnis === 'auto'
          ? 'position:absolute; inset:0; width:100%; height:100%; border:0; display:block;'
          : `width:100%; aspect-ratio:${seitenverhaeltnis}; border:0; display:block;`;
      inhaltErsetzen(box, rahmen);
      box.classList.add('ist-geladen');

      /* Alles, was nur zum PLATZHALTER gehört, verschwindet mit ihm.
         Typischer Fall: unter dem statischen Kartenbild steht die Pflicht-
         Lizenzzeile „Kartendaten © OpenStreetMap-Mitwirkende". Sobald der
         Besucher die echte Google-Karte lädt, ist das Bild weg – die Zeile
         blieb aber stehen und behauptete etwas Falsches über den nun
         sichtbaren Inhalt. Elemente dafür mit
         data-einbettung-nur-platzhalter auszeichnen. */
      /* NUR DIE EIGENE LIZENZZEILE – nicht die der Nachbarin.
         Hier wurde der ganze umgebende Abschnitt durchsucht. Stehen dort zwei
         Einbettungen (Karte und Video auf einer Kontaktseite ist der
         Normalfall), löschte das Laden der einen die Pflicht-Lizenzzeile der
         anderen – und die andere zeigt weiterhin ihr statisches Kartenbild.
         Die Zeile „Kartendaten © OpenStreetMap-Mitwirkende" ist keine
         Höflichkeit, sondern Bedingung der Lizenz.

         Innerhalb der Box wird immer aufgeräumt. Darüber hinaus nur, wenn der
         Abschnitt genau EINE Einbettung enthält – dann ist die Zuordnung
         eindeutig. */
      box.querySelectorAll<HTMLElement>('[data-einbettung-nur-platzhalter]').forEach((el) => {
        el.hidden = true;
      });
      const umfeld = box.closest('section') ?? box.parentElement ?? document.body;
      if (umfeld.querySelectorAll('[data-einbettung]').length === 1) {
        umfeld.querySelectorAll<HTMLElement>('[data-einbettung-nur-platzhalter]').forEach((el) => {
          el.hidden = true;
        });
      }
    }

    // Wurde die Kategorie schon freigegeben, darf direkt geladen werden.
    if (erlaubt(kategorie) && box.hasAttribute('data-einbettung-auto')) {
      laden();
      return;
    }

    /* NACHTRÄGLICHE ZUSTIMMUNG MUSS AUCH WIRKEN.
       Bisher wurde nur beim Seitenaufbau geprüft. Der übliche Ablauf ist aber:
       Besucher sieht die Seite, klickt im Banner auf „Alle akzeptieren" – und
       die Karte bleibt ein Platzhalter, bis er neu lädt. Er hat gerade
       zugestimmt und glaubt, es sei kaputt.
       Der Einwilligungs-Baustein sendet das Ereignis bereits; es hat nur
       niemand zugehört. Nur bei `data-einbettung-auto`: Ohne das Attribut ist
       der Klick auf den Platzhalter die bewusste Einzelfreigabe und soll es
       auch bleiben. */
    if (box.hasAttribute('data-einbettung-auto')) {
      document.addEventListener('einwilligung:geaendert', () => {
        if (!box.classList.contains('ist-geladen') && erlaubt(kategorie)) laden();
      });
    }

    const knopf = box.querySelector<HTMLElement>('[data-einbettung-laden]') ?? box;
    knopf.setAttribute('role', 'button');
    knopf.setAttribute('tabindex', '0');

    function ausloesen(e: Event) {
      e.preventDefault();
      laden();
    }
    knopf.addEventListener('click', ausloesen);
    knopf.addEventListener('keydown', (e) => {
      const k = e as KeyboardEvent;
      if (k.key === 'Enter' || k.key === ' ') ausloesen(e);
    });
  });
}
