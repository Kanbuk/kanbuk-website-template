/**
 * ASSISTENT – ein langes Formular in mehreren Schritten.
 *
 * Ab etwa acht Feldern bricht ein Formular am Stück reihenweise ab. Drei kurze
 * Schritte mit sichtbarem Fortschritt werden deutlich häufiger fertig
 * ausgefüllt – besonders, wenn die leichten Fragen vorne stehen und die
 * persönlichen Daten erst zum Schluss kommen.
 *
 * Markup erzeugt die <Formular>-Komponente aus `formular.schritte`:
 *   <form data-formular data-assistent>
 *     <p data-assistent-fortschritt></p>
 *     <ol><li data-assistent-punkt="1">Ihr Anliegen</li> …</ol>
 *     <fieldset data-assistent-schritt="1"> … Felder … </fieldset>
 *     <fieldset data-assistent-schritt="2"> … </fieldset>
 *     <button data-assistent-zurueck>Zurück</button>
 *     <button data-assistent-weiter>Weiter</button>
 *     <button type="submit">Senden</button>
 *   </form>
 *
 * DIE FALLE, DIE HIER GELÖST IST: Ein Pflichtfeld in einem ausgeblendeten
 * Schritt bricht das Absenden ab, OHNE dass der Besucher etwas sieht – der
 * Browser kann eine unsichtbare Fehlermeldung nicht anzeigen und meldet nur
 * „not focusable" in die Konsole. Das Formular wirkt dann kaputt. Deshalb
 * springt der Assistent beim Absenden zuerst zum ersten fehlerhaften Feld und
 * macht dessen Schritt sichtbar. Genau daran scheitern die meisten selbst
 * gebauten Assistenten.
 *
 * Läuft VOR dem Formular-Baustein (siehe index.ts) – sonst käme dessen
 * Prüfung zuerst und liefe in genau diese Falle.
 *
 * Ohne JavaScript stehen alle Schritte untereinander und das Formular ist
 * ganz normal absendbar.
 */
export function assistentStarten(): void {
  document.querySelectorAll<HTMLFormElement>('[data-assistent]').forEach((form) => {
    const schritte = Array.from(form.querySelectorAll<HTMLElement>('[data-assistent-schritt]'));
    if (schritte.length < 2) return;

    const punkte = Array.from(form.querySelectorAll<HTMLElement>('[data-assistent-punkt]'));
    const fortschritt = form.querySelector<HTMLElement>('[data-assistent-fortschritt]');
    const balken = form.querySelector<HTMLElement>('[data-assistent-balken]');
    const zurueck = form.querySelector<HTMLButtonElement>('[data-assistent-zurueck]');
    const weiter = form.querySelector<HTMLButtonElement>('[data-assistent-weiter]');
    const senden = form.querySelector<HTMLButtonElement>('[data-formular-absenden]');

    let aktuell = 0;

    /** Alle bedienbaren Felder eines Schritts – ohne den Honeypot. */
    const felderVon = (schritt: HTMLElement) =>
      Array.from(
        schritt.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
          'input, select, textarea',
        ),
      ).filter((el) => el.type !== 'hidden');

    function zeigen(nr: number) {
      aktuell = Math.max(0, Math.min(nr, schritte.length - 1));

      schritte.forEach((s, i) => {
        s.toggleAttribute('hidden', i !== aktuell);
        s.classList.toggle('ist-aktiv', i === aktuell);
      });

      punkte.forEach((p, i) => {
        p.classList.toggle('ist-aktiv', i === aktuell);
        p.classList.toggle('ist-erledigt', i < aktuell);
        // Screenreader sollen wissen, wo sie stehen, ohne die Optik zu kennen.
        if (i === aktuell) p.setAttribute('aria-current', 'step');
        else p.removeAttribute('aria-current');
      });

      if (fortschritt) fortschritt.textContent = `Schritt ${aktuell + 1} von ${schritte.length}`;
      // Gerundet – ein Prozentwert mit vierzehn Nachkommastellen im Markup
      // sieht in den Entwicklerwerkzeugen nach Versehen aus.
      if (balken) {
        balken.style.setProperty('--fortschritt', `${Math.round(((aktuell + 1) / schritte.length) * 100)}%`);
      }

      const letzter = aktuell === schritte.length - 1;
      if (zurueck) zurueck.toggleAttribute('hidden', aktuell === 0);
      if (weiter) weiter.toggleAttribute('hidden', letzter);
      // Der Senden-Knopf erscheint erst im letzten Schritt. Sonst schickt ein
      // ungeduldiger Klick ein halb ausgefülltes Formular ab.
      if (senden) senden.toggleAttribute('hidden', !letzter);
    }

    /** Prüft nur den sichtbaren Schritt. Gibt true zurück, wenn er passt. */
    function schrittPasst(): boolean {
      for (const feld of felderVon(schritte[aktuell])) {
        if (!feld.checkValidity()) {
          feld.reportValidity();
          return false;
        }
      }
      return true;
    }

    /**
     * Zum neuen Schritt scrollen – ABER NUR, WENN ES NÖTIG IST.
     *
     * Vorher wurde bei JEDEM Schrittwechsel gescrollt, auch wenn das Formular
     * vollständig im Bild stand. Das Ergebnis war ein Ruck ohne Anlass: Der
     * Besucher klickt „Weiter", und die Seite springt, obwohl er längst auf
     * das schaut, was er sehen soll. Gemeldet hat das der Auftraggeber eines
     * Kundenprojekts – keine der vier Prüfungen misst Bewegung.
     *
     * Zweiter Teil: `block: 'start'` schob den Formularanfang UNTER die
     * klebende Kopfleiste. Deshalb wird deren Höhe abgezogen.
     */
    function zeigeSchrittAn() {
      const kasten = schritte[aktuell].getBoundingClientRect();
      // Höhe einer klebenden Kopfleiste ermitteln – sie verdeckt sonst den Anfang.
      const kopf = document.querySelector<HTMLElement>('[data-kopf], header');
      const kopfHoehe =
        kopf && getComputedStyle(kopf).position === 'sticky' ? kopf.getBoundingClientRect().height : 0;

      // Steht der Anfang schon sichtbar unter der Kopfleiste? Dann nichts tun.
      if (kasten.top >= kopfHoehe && kasten.top < window.innerHeight * 0.6) return;

      window.scrollTo({
        top: window.scrollY + kasten.top - kopfHoehe - 12,
        behavior: 'smooth',
      });
    }

    weiter?.setAttribute('type', 'button');
    weiter?.addEventListener('click', () => {
      if (!schrittPasst()) return;
      zeigen(aktuell + 1);
      zeigeSchrittAn();
      felderVon(schritte[aktuell])[0]?.focus({ preventScroll: true });
    });

    zurueck?.setAttribute('type', 'button');
    zurueck?.addEventListener('click', () => {
      zeigen(aktuell - 1);
      zeigeSchrittAn();
    });

    /* Enter in einem einzeiligen Feld bedeutet in einem Assistenten „weiter",
       nicht „absenden". Im Textfeld (textarea) bleibt Enter ein Zeilenumbruch. */
    form.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const ziel = e.target as HTMLElement;
      if (ziel.tagName === 'TEXTAREA') return;
      if (aktuell < schritte.length - 1) {
        e.preventDefault();
        weiter?.click();
      }
    });

    form.addEventListener('submit', (e) => {
      // Erstes fehlerhaftes Feld suchen – egal in welchem Schritt.
      for (let i = 0; i < schritte.length; i++) {
        const kaputt = felderVon(schritte[i]).find((f) => !f.checkValidity());
        if (!kaputt) continue;
        e.preventDefault();
        // WICHTIG: den Formular-Baustein gar nicht erst laufen lassen, sonst
        // prüft er gleich noch einmal und meldet ins Leere.
        e.stopImmediatePropagation();
        zeigen(i);
        kaputt.reportValidity();
        kaputt.focus();
        return;
      }
    });

    zeigen(0);
  });
}
