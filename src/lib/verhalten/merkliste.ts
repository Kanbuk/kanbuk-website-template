/**
 * MERKLISTE – „Zu meinen Favoriten" für Katalog-Einträge.
 *
 * Typisch bei Fahrzeugen, Immobilien, Maschinen, Kursen: Der Besucher vergleicht
 * mehrere Einträge über mehrere Besuche hinweg und will sie sich vormerken.
 *
 * DATENSCHUTZ – bitte vor dem Einbau lesen:
 * Die Merkliste speichert im `localStorage` des Besuchers, also AUF SEINEM
 * GERÄT. Das ist kein Cookie und geht an keinen Server – trotzdem ist es eine
 * Speicherung auf dem Endgerät (§ 165 TKG / ePrivacy). Sie ist einwilligungsfrei
 * zulässig, weil sie **funktional** ist und der Besucher sie selbst auslöst
 * (er klickt „merken"). Zwei Pflichten bleiben:
 *   1. Sie MUSS in der Datenschutzerklärung stehen – dafür gibt es das Feld
 *      `merkliste: true` in content.config.ts, das den Absatz einblendet.
 *   2. Die Aussage „wir speichern nichts" stimmt dann nicht mehr wörtlich.
 *      Richtig ist: „keine Cookies, kein Tracking – die Merkliste bleibt auf
 *      Ihrem Gerät."
 * Kein Banner nötig, kein Server, keine Übermittlung.
 *
 * Markup:
 *   <button data-merken="bmw-320d" aria-label="Merken">♥</button>
 *   <span data-merkliste-anzahl></span>            ← Zähler (z. B. im Kopf)
 *   <div data-merkliste-leer hidden>Noch nichts vorgemerkt.</div>
 *
 * Auf einer Katalogseite zusätzlich:
 *   <button data-merkliste-nur>Nur Vorgemerkte</button>
 *
 * Vergibt `aria-pressed` und die Klasse `.ist-gemerkt`; das Aussehen bestimmt
 * das Design. Ohne JavaScript sind die Knöpfe wirkungslos – deshalb dürfen sie
 * nie der EINZIGE Weg zu einem Eintrag sein.
 */
const SCHLUESSEL = 'kanbuk-merkliste';

function lesen(): string[] {
  try {
    const roh = localStorage.getItem(SCHLUESSEL);
    const liste = roh ? JSON.parse(roh) : [];
    return Array.isArray(liste) ? liste.filter((x) => typeof x === 'string') : [];
  } catch {
    // Privater Modus oder gesperrter Speicher: Merkliste bleibt leer statt zu
    // krachen – die Seite muss auch dann vollständig bedienbar sein.
    return [];
  }
}

function schreiben(liste: string[]): void {
  try {
    localStorage.setItem(SCHLUESSEL, JSON.stringify(liste));
  } catch {
    /* nicht speicherbar – die Merkliste gilt dann nur für diesen Besuch */
  }
}

export function merklisteStarten(): void {
  const knoepfe = document.querySelectorAll<HTMLElement>('[data-merken]');
  const zaehler = document.querySelectorAll<HTMLElement>('[data-merkliste-anzahl]');
  if (knoepfe.length === 0 && zaehler.length === 0) return;

  let liste = lesen();
  let nurGemerkte = false;

  function istGemerkt(id: string) {
    return liste.includes(id);
  }

  function anzeigen() {
    knoepfe.forEach((k) => {
      const id = k.dataset.merken!;
      const an = istGemerkt(id);
      k.setAttribute('aria-pressed', String(an));
      k.classList.toggle('ist-gemerkt', an);
    });
    zaehler.forEach((z) => {
      z.textContent = String(liste.length);
      // Eine „0" im Kopf sieht nach Fehler aus – dann lieber nichts zeigen.
      z.toggleAttribute('hidden', liste.length === 0);
    });
    document.querySelectorAll<HTMLElement>('[data-merkliste-leer]').forEach((el) => {
      el.toggleAttribute('hidden', liste.length > 0 || !nurGemerkte);
    });
    document.documentElement.classList.toggle('hat-merkliste', liste.length > 0);

    if (nurGemerkte) {
      document.querySelectorAll<HTMLElement>('[data-merken]').forEach((k) => {
        const eintrag = k.closest<HTMLElement>('[data-katalog-eintrag]') ?? k.parentElement;
        if (eintrag) eintrag.hidden = !istGemerkt(k.dataset.merken!);
      });
    }
    /* Der Filter-Baustein rechnet danach seine Trefferzahl neu – so bleiben
       Merkliste und Filter widerspruchsfrei, auch wenn beide aktiv sind. */
    document.dispatchEvent(new CustomEvent('kanbuk:merkliste', { detail: { liste: [...liste], nurGemerkte } }));
  }

  knoepfe.forEach((k) => {
    if (k.tagName === 'BUTTON') k.setAttribute('type', 'button');
    k.addEventListener('click', (e) => {
      e.preventDefault();
      const id = k.dataset.merken!;
      liste = istGemerkt(id) ? liste.filter((x) => x !== id) : [...liste, id];
      schreiben(liste);
      anzeigen();
    });
  });

  document.querySelectorAll<HTMLElement>('[data-merkliste-nur]').forEach((k) => {
    if (k.tagName === 'BUTTON') k.setAttribute('type', 'button');
    k.setAttribute('aria-pressed', 'false');
    k.addEventListener('click', () => {
      nurGemerkte = !nurGemerkte;
      k.setAttribute('aria-pressed', String(nurGemerkte));
      k.classList.toggle('ist-aktiv', nurGemerkte);
      if (!nurGemerkte) {
        document.querySelectorAll<HTMLElement>('[data-merken]').forEach((b) => {
          const eintrag = b.closest<HTMLElement>('[data-katalog-eintrag]') ?? b.parentElement;
          if (eintrag) eintrag.hidden = false;
        });
      }
      anzeigen();
    });
  });

  anzeigen();
}
