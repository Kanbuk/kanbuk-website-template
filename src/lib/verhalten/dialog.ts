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
import { dialogOeffnen, dialogSchliessen } from './browserluecke.js';
export function dialogStarten(): void {
  const dialoge = document.querySelectorAll<HTMLDialogElement>('[data-dialog]');
  if (dialoge.length === 0) return;

  dialoge.forEach((d) => {
    // Klick auf die Fläche AUSSERHALB des Inhalts schließt. Der Vergleich mit
    // dem Dialog selbst ist der zuverlässige Weg – ein Klick auf ein Kindelement
    // hat immer dieses als Ziel.
    d.addEventListener('click', (e) => {
      if (e.target === d) dialogSchliessen(d);
    });
    d.querySelectorAll<HTMLElement>('[data-dialog-schliessen]').forEach((k) => {
      k.setAttribute('type', 'button');
      k.addEventListener('click', () => dialogSchliessen(d));
    });
  });

  document.querySelectorAll<HTMLElement>('[data-dialog-oeffnen]').forEach((ausloeser) => {
    const ziel = document.getElementById(ausloeser.dataset.dialogOeffnen ?? '');
    /* KEIN `instanceof HTMLDialogElement` – DIESE KLASSE GIBT ES ERST AB
       SAFARI 15.4, und ein `instanceof` auf einen Namen, den der Browser nicht
       kennt, wirft einen ReferenceError. Im Browser nachgemessen: Ist die
       Klasse weg, wirft die alte Zeile; die Prüfung über `tagName` läuft durch.

       Das ist keine Randlage, sondern der teuerste Fall: Diese Zeile läuft
       beim START, nicht beim Klick. Die Ausnahme fliegt aus `dialogStarten()`
       heraus, und ALLE danach eingehängten Bausteine starten nicht mehr –
       Merkliste, Öffnungsstatus, Formular. Der Besucher tippt auf „Merken",
       nichts passiert, keine Meldung.

       Bitter daran: Genau dagegen wurde `browserluecke.ts` gebaut. Deren
       Helfer werden nur INNERHALB der Klick-Behandlung aufgerufen – der
       Absturz passiert zwei Zeilen vorher, und sie kamen nie zum Zug. */
    if (!ziel || ziel.tagName !== 'DIALOG') return;
    ausloeser.setAttribute('aria-haspopup', 'dialog');
    if (ausloeser.tagName === 'BUTTON') ausloeser.setAttribute('type', 'button');
    ausloeser.addEventListener('click', (e) => {
      e.preventDefault();
      /* Welcher Eintrag war gemeint? Bei einer Katalogseite öffnet derselbe
         Dialog für viele Einträge – der Auslöser gibt seinen Titel mit, damit
         die Anfrage weiß, worum es geht (und das versteckte Formularfeld
         `betreff` gefüllt werden kann). */
      /* IMMER SETZEN, AUCH AUF LEER. Hier stand `if (bezug) { … }` – ein
         Auslöser ohne eigenen Bezug liess damit stehen, was der vorige
         hineingeschrieben hatte. Auf einer Katalogseite öffnet derselbe Dialog
         für alle Einträge: Wer erst „Eintrag A" anfragt, den Dialog schliesst
         und dann einen allgemeinen Anfrage-Knopf ohne Bezug drückt, verschickt
         eine Anfrage, die weiterhin „Eintrag A" nennt. Der Betrieb antwortet
         dann zum falschen Stück – und niemand kann sich erklären, warum.

         Ein leerer Wert ist die richtige Aussage: „kein bestimmter Eintrag". */
      const bezug = ausloeser.dataset.dialogBezug ?? '';
      ziel.querySelectorAll<HTMLElement>('[data-dialog-bezug-ziel]').forEach((el) => {
        if (el instanceof HTMLInputElement) el.value = bezug;
        else el.textContent = bezug;
      });
      dialogOeffnen(ziel);
    });
  });
}
