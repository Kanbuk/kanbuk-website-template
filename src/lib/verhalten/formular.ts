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
import { melden } from './messung';
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

          /* DAS FORMULAR TRITT AB, DER DANK NIMMT SEINEN PLATZ EIN.
             (01.09.2026, nach einem echten Test an einer Kundenseite.)

             Vorher blieb das ausgefüllte Formular stehen und darunter erschien
             ein Absatz in derselben kleinen, grauen Schrift wie der
             Datenschutz-Hinweis daneben. Am Handy stand er unterhalb der
             Bildschirmkante. Der Absender sah also: unverändertes Formular,
             keine sichtbare Reaktion. Das liest sich wie „hat nicht geklappt" –
             und die naheliegende Handlung ist, noch einmal zu senden.

             Die Klasse hier ist reine Mechanik; das Ausblenden steht in
             Formular.astro, wie der Dank AUSSIEHT macht das Design
             (`.formular.ist-gesendet .formular__status`). */
          form.classList.add('ist-gesendet');

          /* Sehen und gesagt bekommen – zwei getrennte Wege, weil sie
             verschiedene Menschen erreichen. Der Text steht ohnehin in einem
             `role="status"`-Bereich und wird vorgelesen; der Sprung dorthin ist
             für alle, die mit der Tastatur arbeiten. `preventScroll`, weil der
             Bildlauf gleich darunter gezielt gesetzt wird. */
          status.setAttribute('tabindex', '-1');
          status.focus({ preventScroll: true });

          /* Ohne das steht der Besucher unter Umständen vor einer Stelle, an
             der gerade Inhalt verschwunden ist: Das Formular war lang, die
             Seite ist schlagartig kürzer. */
          status.scrollIntoView({ block: 'center' });

          /* ERST HIER, NICHT BEIM ABSENDEN. Gemeldet wird, dass die Anfrage
             wirklich angekommen ist (Serverantwort ok) – nicht, dass jemand
             auf Senden gedrückt hat. Die beiden Zahlen weichen zwangsläufig
             voneinander ab; diese ist die ehrlichere. */
          melden('generate_lead', { lead_source: form.dataset.formularId ?? 'unbekannt' });
        } else {
          const info = await antwort.json().catch(() => ({}));
          status.textContent = info.fehler ?? t.textFehler ?? 'Das hat leider nicht geklappt.';
          status.classList.add('ist-fehler');
          /* Die einzige Zahl, an der ein Betrieb sieht, dass ihm Anfragen
             verlorengehen. Ohne sie fällt monatelanges Schweigen niemandem
             auf. Kein Text aus der Serverantwort – der könnte Angaben des
             Absenders tragen. */
          melden('anfrage_gescheitert', {
            lead_source: form.dataset.formularId ?? 'unbekannt',
            grund: 'abgelehnt',
          });
        }
      } catch {
        status.textContent = t.textVerbindungsfehler ?? 'Verbindung fehlgeschlagen.';
        status.classList.add('ist-fehler');
        melden('anfrage_gescheitert', {
          lead_source: form.dataset.formularId ?? 'unbekannt',
          grund: 'verbindung',
        });
      } finally {
        absenden.disabled = false;
        absenden.textContent = alterText;

        /* NACH EINEM FEHLSCHLAG DEN FOKUS ZURÜCK AUF DEN KNOPF.
           Ein abgeschalteter Knopf kann den Fokus nicht halten – mit
           `disabled = true` weiter oben fällt er auf den Seitenkörper. Beim
           Wiedereinschalten kommt er nicht von selbst zurück.

           Gemessen an einer gebauten Kontaktseite (Serverantwort 500
           abgefangen): Danach lagen 27 Tabulator-Schritte zwischen dem
           Besucher und dem Knopf, den er gerade gedrückt hat – bei offenem
           Cookie-Hinweis 31. Wer mit der Tastatur arbeitet, kann eine
           gescheiterte Anfrage also praktisch nicht wiederholen.

           Nur im Fehlerfall: Nach dem Erfolg ist der Knopf ausgeblendet,
           dort sitzt der Fokus richtigerweise auf der Danke-Tafel. */
        if (!form.classList.contains('ist-gesendet')) absenden.focus();
      }
    });
  });
}
