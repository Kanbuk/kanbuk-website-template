/**
 * =============================================================================
 *  BROWSERLÜCKEN – die Funktionen, die keine Prüfung sieht
 * =============================================================================
 *  CLAUDE.md Abschnitt 4a nennt sie ausdrücklich als blinden Fleck des fünften
 *  Tores: `dialog.showModal()`, `replaceChildren`,
 *  `matchMedia.addEventListener`. Syntaktisch sind sie einwandfrei – der
 *  Übersetzer sieht nichts, das Tor sieht nichts, und der Fehler entsteht erst
 *  im Browser des Besuchers.
 *
 *  WARUM DAS MEHR IST ALS EIN AUSGEFALLENER BAUSTEIN: Alle Bausteine werden in
 *  `index.ts` nacheinander gestartet. Wirft einer, bricht die Kette ab – und
 *  die NACHFOLGENDEN starten gar nicht mehr. Ein Menü, das eine Funktion von
 *  2020 aufruft, nimmt Filter, Merkliste und Formular mit, ohne dass der
 *  Besucher eine Meldung sieht.
 *
 *  Die Zusage lautet „bedienbar ab Safari 12" (browser-untergrenze.json) und
 *  meint wörtlich: Navigation, Filter, Merkliste, Formular und Bilder
 *  funktionieren. Diese Datei löst genau die Fälle ein.
 *
 *  KEIN ZERLEGEN IN KLAMMERN hier – siehe CLAUDE.md Abschnitt 4a, Punkt 1.
 * =============================================================================
 */

/**
 * Öffnet einen `<dialog>` so modal wie der Browser es hergibt.
 *
 * `showModal()` gibt es ab Safari 15.4 – das ist die AUSSEHEN-Grenze, nicht die
 * Bedienbar-Grenze. Darunter kennt Safari das Element gar nicht: Ein Aufruf
 * wirft, und die Kette in `index.ts` bricht ab.
 *
 * Der Rückfall macht den Inhalt sichtbar, statt ihn modal zu legen. Das ist
 * ärmer (kein Abdunkeln, kein Fokus-Fang) – aber der Besucher kommt an den
 * Inhalt, und alle folgenden Bausteine laufen weiter.
 */
/* DER PARAMETER IST `HTMLElement`, NICHT `HTMLDialogElement` – MIT ABSICHT.
   Wer hier `HTMLDialogElement` verlangt, zwingt jeden Aufrufer zu einer
   Typprüfung, und die naheliegende ist `instanceof HTMLDialogElement`. Genau
   die wirft unterhalb von Safari 15.4 einen ReferenceError, weil es die Klasse
   dort nicht gibt – und zwar beim START, wodurch alle folgenden Bausteine
   ausfallen. Am 03.08.2026 im Browser nachgemessen und genau so passiert.
   Die Funktion prüft ohnehin selbst, was der Browser kann; ein strengerer Typ
   am Rand hätte nur die Falle davor erzeugt. */
export function dialogOeffnen(dialog: HTMLElement): void {
  const d = dialog as HTMLDialogElement;
  if (typeof d.showModal === 'function') {
    try {
      d.showModal();
      return;
    } catch {
      /* `showModal()` wirft auch, wenn der Dialog schon offen ist. Kein Grund,
         die Seite mitzureissen. */
    }
  }

  /* ------------------------------------------------------------------------
     DER RÜCKFALL – und hier stand vorher NUR die eine Zeile `setAttribute`.
     Die reicht nicht, und zwar aus zwei Gründen, die beide erst im echten
     alten Browser sichtbar werden:

     1. Ein Browser, der `<dialog>` nicht kennt, hat auch keine Vorlage-Regel
        dafür. Das Element ist ein unbekanntes Kästchen ohne jede Gestaltung:
        keine Position, kein Hintergrund, kein Rand. Es hängt einfach da, wo
        es im Quelltext steht – am Seitenende, mitten in einem Abschnitt.
        `[open]` zu setzen ändert daran nichts. (Dass es überhaupt zu ist,
        besorgt jetzt `dialog:not([open])` in global.css.)
     2. Ohne `showModal()` gibt es auch die eingebaute Escape-Taste nicht.
        Ein Fenster, das man nicht schliessen kann, ist schlimmer als keines.

     Die Gestaltung wird hier von Hand gesetzt statt in global.css, damit
     moderne Browser NICHTS davon abbekommen: Dieser Zweig läuft nur, wenn
     `showModal` fehlt. Eine CSS-Regel für `dialog[open]` träfe dagegen auch
     die nativen Fenster und würde deren Zentrierung überschreiben.

     `--farbe-hintergrund` mit Ersatzwert IN der Klammer – ohne einen
     Hintergrund stünde der Text des Fensters über dem Text der Seite.
     ------------------------------------------------------------------------ */
  dialog.setAttribute('open', '');
  const s = dialog.style;
  s.position = 'fixed';
  s.top = '5%';
  s.left = '50%';
  s.marginLeft = '0';
  s.transform = 'translateX(-50%)';
  s.width = 'min(92%, 40rem)';
  s.maxHeight = '90%';
  s.overflowY = 'auto';
  s.zIndex = '1000';
  s.background = 'var(--farbe-hintergrund, #fff)';
  s.color = 'var(--farbe-text, #1a1a1a)';
  s.padding = 'var(--raum-m, 1.5rem)';
  s.border = '1px solid var(--farbe-linie, rgba(0,0,0,0.15))';

  /* Escape muss schliessen. Der Zuhörer hängt am Dokument, weil das Fenster im
     Rückfall keinen Fokus fängt – ein Tastendruck landet sonst irgendwo. */
  if (!dialog.dataset.escapeGesetzt) {
    dialog.dataset.escapeGesetzt = 'ja';
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' && e.key !== 'Esc') return;
      if (!dialog.hasAttribute('open')) return;
      dialogSchliessen(dialog);
    });
  }
}

/** Gegenstück – schliesst auch den Rückfall-Zustand. */
export function dialogSchliessen(dialog: HTMLElement): void {
  const d = dialog as HTMLDialogElement;
  if (typeof d.close === 'function') {
    try {
      d.close();
      return;
    } catch {
      /* nichts – gleich unten von Hand */
    }
  }
  dialog.removeAttribute('open');
}

/**
 * Ersetzt den Inhalt eines Elements durch genau ein neues Kind.
 *
 * `replaceChildren` gibt es erst ab Safari 14. Der Aufruf wirft darunter, und
 * betroffen ist ausgerechnet die 2-Klick-Einbettung: Der Besucher klickt auf
 * „Karte laden", nichts passiert, und ab da ist auch der Rest der Seite tot.
 */
export function inhaltErsetzen(ziel: Element, neu: Node): void {
  if (typeof ziel.replaceChildren === 'function') {
    ziel.replaceChildren(neu);
    return;
  }
  while (ziel.firstChild) ziel.removeChild(ziel.firstChild);
  ziel.appendChild(neu);
}
