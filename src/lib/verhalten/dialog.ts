/**
 * DIALOG – ein Fenster über der Seite (Anfrage, Hinweis, Detailansicht).
 *
 * Nutzt das native <dialog>: Fokusfalle, Escape-Taste, Hintergrund-Sperre und
 * die richtige Ansage für Screenreader kommen vom Browser. Ein selbstgebautes
 * Overlay bekommt genau diese vier Dinge fast nie richtig hin – deshalb steht
 * das hier im Motor statt in jedem Klon neu.
 *
 * Markup:
 *   <button data-dialog-oeffnen="anfrage">Fahrzeug anfragen</button>
 *
 *   <dialog id="anfrage" data-dialog>
 *     <button data-dialog-schliessen aria-label="Schließen">×</button>
 *     … beliebiger Inhalt, auch ein <Formular /> …
 *   </dialog>
 *
 * Klick auf den Hintergrund schließt ebenfalls. Ohne JavaScript bleibt der
 * Dialog zu und der Auslöser wirkungslos – deshalb gilt: **nichts
 * Lebenswichtiges nur im Dialog anbieten.** Eine Telefonnummer oder ein
 * Kontaktweg muss auch ohne ihn erreichbar sein.
 */
export function dialogStarten(): void {
  const dialoge = document.querySelectorAll<HTMLDialogElement>('[data-dialog]');
  if (dialoge.length === 0) return;

  dialoge.forEach((d) => {
    // Klick auf die Fläche AUSSERHALB des Inhalts schließt. Der Vergleich mit
    // dem Dialog selbst ist der zuverlässige Weg – ein Klick auf ein Kindelement
    // hat immer dieses als Ziel.
    d.addEventListener('click', (e) => {
      if (e.target === d) d.close();
    });
    d.querySelectorAll<HTMLElement>('[data-dialog-schliessen]').forEach((k) => {
      k.setAttribute('type', 'button');
      k.addEventListener('click', () => d.close());
    });
  });

  document.querySelectorAll<HTMLElement>('[data-dialog-oeffnen]').forEach((ausloeser) => {
    const ziel = document.getElementById(ausloeser.dataset.dialogOeffnen ?? '');
    if (!(ziel instanceof HTMLDialogElement)) return;
    ausloeser.setAttribute('aria-haspopup', 'dialog');
    if (ausloeser.tagName === 'BUTTON') ausloeser.setAttribute('type', 'button');
    ausloeser.addEventListener('click', (e) => {
      e.preventDefault();
      /* Welcher Eintrag war gemeint? Bei einer Katalogseite öffnet derselbe
         Dialog für viele Einträge – der Auslöser gibt seinen Titel mit, damit
         die Anfrage weiß, worum es geht (und das versteckte Formularfeld
         `betreff` gefüllt werden kann). */
      const bezug = ausloeser.dataset.dialogBezug;
      if (bezug) {
        ziel.querySelectorAll<HTMLElement>('[data-dialog-bezug-ziel]').forEach((el) => {
          if (el instanceof HTMLInputElement) el.value = bezug;
          else el.textContent = bezug;
        });
      }
      ziel.showModal();
    });
  });
}
