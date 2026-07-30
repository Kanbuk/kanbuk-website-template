/**
 * FORMULAR – Absenden ohne Seitenwechsel, mit Rückmeldung.
 *
 * Ein Baustein für alle Formulare: Kontakt, Reservierung, Terminanfrage,
 * Angebotsanfrage. Welche Felder es gibt, steht in content.config.ts.
 *
 * Markup erzeugt <Formular>-Komponente. Erwartet:
 *   <form data-formular action="/api/contact"
 *         data-text-sendet="…" data-text-erfolg="…"
 *         data-text-fehler="…" data-text-verbindungsfehler="…">
 *     … Felder …
 *     <button type="submit" data-formular-absenden>Senden</button>
 *     <p data-formular-status role="status" aria-live="polite"></p>
 *   </form>
 *
 * Ohne JS greift das native POST auf dieselbe Adresse – das Formular
 * funktioniert also auch dann.
 *
 * Zustandsklassen fürs Design: .ist-erfolg / .ist-fehler auf dem Status-Element.
 */
export function formulareStarten(): void {
  /* VORSCHAU (demo): Das Formular ist sichtbar und bedienbar, aber es darf
     nichts hinausgehen. Die Sperre sitzt strukturell im Markup – kein
     `action`, kein `data-formular` –, hier kommt nur die ehrliche Antwort
     dazu. Ohne sie klickte der Kunde bei der Abnahme auf „Senden" und es
     passierte sichtbar gar nichts; das sieht nach kaputt aus, nicht nach
     Vorschau. */
  document.querySelectorAll<HTMLFormElement>('[data-formular-vorschau]').forEach((form) => {
    const status = form.querySelector<HTMLElement>('[data-formular-status]');
    form.noValidate = true;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (status) {
        status.textContent =
          form.dataset.textVorschau ?? 'In der Live-Version wird diese Anfrage wirklich verschickt.';
        status.classList.add('ist-erfolg');
      }
    });
  });

  document.querySelectorAll<HTMLFormElement>('[data-formular]').forEach((form) => {
    const status = form.querySelector<HTMLElement>('[data-formular-status]');
    const absenden = form.querySelector<HTMLButtonElement>('[data-formular-absenden]');
    if (!status || !absenden) return;

    /* AB HIER übernimmt das Skript die Prüfung – erst JETZT wird die des
       Browsers abgeschaltet, nicht schon im Markup.

       WARUM ÜBERHAUPT ABSCHALTEN: Beim Assistenten sind die Felder der noch
       nicht erreichten Schritte `hidden`. Ein Pflichtfeld, das der Browser
       nicht anzeigen kann, kann er auch nicht anspringen – er bricht das
       Absenden dann still ab und schreibt nur in die Entwicklerkonsole.
       Der Besucher klickt auf „Senden" und es passiert nichts.

       WARUM NICHT IM MARKUP: Dort stand es unbedingt – also auch für Besucher
       OHNE Skript. Die bekamen damit gar keine Feldprüfung mehr: Eine
       unvollständige Anfrage ging bis zum Server und der Besucher landete auf
       der Fehlerseite, statt sofort am leeren Feld zu stehen. Ohne Skript ist
       auch kein Schritt versteckt – der Grund fürs Abschalten fällt dort weg.

       Steigt der Baustein oben aus (kein Status-Feld, kein Absende-Knopf),
       bleibt die Browser-Prüfung ebenfalls an. Das ist der bessere Rückfall. */
    form.noValidate = true;

    const t = form.dataset;

    // Zeitfalle: Ladezeitpunkt eintragen – der Server verwirft Absendungen,
    // die verdächtig schnell danach kommen (Bots). Seite ist statisch, deshalb
    // muss der Zeitpunkt hier im Browser gesetzt werden, nicht beim Bauen.
    const zeitFeld = form.querySelector<HTMLInputElement>('[data-formular-zeit]');
    if (zeitFeld) zeitFeld.value = String(Date.now());

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.textContent = '';
      status.classList.remove('ist-erfolg', 'ist-fehler');

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const alterText = absenden.textContent;
      absenden.disabled = true;
      absenden.textContent = t.textSendet ?? 'Wird gesendet …';

      try {
        /* Object.fromEntries() behält bei mehrfach vergebenem Namen nur den
           LETZTEN Wert – bei einer Mehrfachauswahl („Welche Leistungen?")
           käme also nur ein einziges Kreuz an. Deshalb pro Feld sammeln und
           mit Komma verbinden; die E-Mail liest sich dann als „Reifen, Service". */
        const formDaten = new FormData(form);
        const daten: Record<string, string> = {};
        for (const schluessel of new Set(formDaten.keys())) {
          const werte = formDaten.getAll(schluessel).map((w) => String(w)).filter((w) => w !== '');
          daten[schluessel] = werte.join(', ');
        }
        const antwort = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(daten),
        });

        if (antwort.ok) {
          form.reset();
          status.textContent = t.textErfolg ?? 'Danke! Ihre Nachricht wurde gesendet.';
          status.classList.add('ist-erfolg');
        } else {
          const info = await antwort.json().catch(() => ({}));
          status.textContent = info.fehler ?? t.textFehler ?? 'Das hat leider nicht geklappt.';
          status.classList.add('ist-fehler');
        }
      } catch {
        status.textContent = t.textVerbindungsfehler ?? 'Verbindung fehlgeschlagen.';
        status.classList.add('ist-fehler');
      } finally {
        absenden.disabled = false;
        absenden.textContent = alterText;
      }
    });
  });
}
