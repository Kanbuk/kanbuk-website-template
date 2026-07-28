/**
 * FILTER – Einträge ein-/ausblenden, sortieren, zählen.
 *
 * Zwei Ausbaustufen, dieselbe Datei:
 *
 * ── EINFACH (unverändert): eine Reihe Knöpfe, eine Kategorie ──────────────
 *   <div data-filter>
 *     <button data-filter-wert="alle">Alle</button>
 *     <button data-filter-wert="interieur">Interieur</button>
 *     <div data-filter-ziel>
 *       <figure data-kategorie="interieur"> … </figure>
 *     </div>
 *   </div>
 *   Galerie (Gastro/Beauty), Referenzen nach Gewerk, Kurse nach Art.
 *
 * ── KOMBINIERT (seit 2026-07-27): mehrere Merkmale gleichzeitig ───────────
 *   <div data-filter data-filter-kombi>
 *     <!-- je Merkmal eine Gruppe; INNERHALB einer Gruppe gilt ODER,
 *          ZWISCHEN den Gruppen UND -->
 *     <div data-filter-gruppe="marke">
 *       <button data-filter-wert="alle">Alle</button>
 *       <button data-filter-wert="bmw">BMW</button>
 *     </div>
 *     <div data-filter-gruppe="kraftstoff">
 *       <label><input type="checkbox" data-filter-wert="diesel"> Diesel</label>
 *     </div>
 *     <!-- Wertebereich: das Element trägt data-<merkmal> als Zahl -->
 *     <input type="range" data-filter-max="preis" min="0" max="50000" step="1000">
 *     <output data-filter-max-anzeige="preis"></output>
 *
 *     <button data-filter-zuruecksetzen>Zurücksetzen</button>
 *     <select data-filter-sortierung>
 *       <option value="">Empfohlen</option>
 *       <option value="preis-auf">Preis aufsteigend</option>
 *       <option value="preis-ab">Preis absteigend</option>
 *     </select>
 *     <p><span data-filter-anzahl></span> von <span data-filter-gesamt></span></p>
 *     <div data-filter-leer hidden>Keine Treffer – Filter zurücksetzen.</div>
 *
 *     <div data-filter-ziel>
 *       <article data-katalog-eintrag
 *                data-marke="bmw" data-kraftstoff="diesel"
 *                data-preis="18900" data-km="84000"> … </article>
 *     </div>
 *   </div>
 *
 * WARUM DAS IN DEN MOTOR GEHÖRT: Ein Katalog mit einem einzigen Merkmal ist
 * die Ausnahme – Fahrzeuge, Immobilien, Maschinen und Kurse werden IMMER über
 * mehrere Merkmale zugleich gesucht, mit Preisgrenze und Trefferzähler. Bisher
 * hätte das jeder Klon selbst gebaut, samt der Fehler, die dabei entstehen
 * (Kategorie ohne Treffer, Zähler stimmt nicht, „Zurücksetzen" vergisst etwas).
 *
 * Vergibt: aria-pressed, hidden, .ist-aktiv. Ohne JavaScript sind ALLE
 * Einträge sichtbar – nichts geht verloren, nur die Auswahl fehlt.
 */
export function filterStarten(): void {
  document.querySelectorAll<HTMLElement>('[data-filter]').forEach((box) => {
    const ziel = box.querySelector<HTMLElement>('[data-filter-ziel]') ?? box;
    const elemente = Array.from(
      ziel.querySelectorAll<HTMLElement>('[data-kategorie], [data-katalog-eintrag]'),
    );
    if (elemente.length === 0) return;

    const kombi = box.hasAttribute('data-filter-kombi');
    const anzahlEl = box.querySelector<HTMLElement>('[data-filter-anzahl]');
    const gesamtEl = box.querySelector<HTMLElement>('[data-filter-gesamt]');
    const leerEl = box.querySelector<HTMLElement>('[data-filter-leer]');
    if (gesamtEl) gesamtEl.textContent = String(elemente.length);

    /* Merkliste kann parallel filtern („nur Vorgemerkte"). Damit sich beide
       nicht gegenseitig überschreiben, merkt sich der Filter den Zustand. */
    let nurGemerkte = false;
    let gemerkt: string[] = [];
    document.addEventListener('kanbuk:merkliste', (e) => {
      const d = (e as CustomEvent).detail;
      gemerkt = d.liste ?? [];
      nurGemerkte = !!d.nurGemerkte;
      anwenden();
    });

    // ---- Einfache Stufe: eine Knopfreihe ---------------------------------
    if (!kombi) {
      const knoepfe = Array.from(box.querySelectorAll<HTMLButtonElement>('[data-filter-wert]'));
      if (knoepfe.length === 0) return;

      function filtern(wert: string) {
        knoepfe.forEach((k) => {
          const aktiv = k.dataset.filterWert === wert;
          k.setAttribute('aria-pressed', String(aktiv));
          k.classList.toggle('ist-aktiv', aktiv);
        });
        let sichtbar = 0;
        elemente.forEach((el) => {
          const kategorien = (el.dataset.kategorie ?? '').split(/\s+/);
          const zeigen = wert === 'alle' || kategorien.includes(wert);
          el.hidden = !zeigen;
          if (zeigen) sichtbar++;
        });
        if (anzahlEl) anzahlEl.textContent = String(sichtbar);
        if (leerEl) leerEl.toggleAttribute('hidden', sichtbar > 0);
      }

      knoepfe.forEach((k) => {
        k.setAttribute('type', 'button');
        k.addEventListener('click', () => filtern(k.dataset.filterWert!));
      });
      filtern(box.dataset.filterStart ?? knoepfe[0].dataset.filterWert ?? 'alle');
      return;
    }

    // ---- Kombinierte Stufe ------------------------------------------------
    /** Gewählte Werte je Merkmal. Leer = dieses Merkmal schränkt nicht ein. */
    const auswahl = new Map<string, Set<string>>();
    /** Obergrenzen je Zahlenmerkmal (Schieberegler). */
    const grenzen = new Map<string, number>();

    /* Ursprungsreihenfolge merken. Ohne sie stellt „Zurücksetzen" nur die
       Auswahl-Felder zurück, die Einträge blieben aber in der zuletzt
       gewählten Sortierung stehen – der Besucher setzt zurück und bekommt
       trotzdem nicht den Ausgangszustand (im Test aufgefallen). */
    const urReihenfolge = [...elemente];

    const gruppen = Array.from(box.querySelectorAll<HTMLElement>('[data-filter-gruppe]'));
    const regler = Array.from(box.querySelectorAll<HTMLInputElement>('[data-filter-max]'));
    const sortierung = box.querySelector<HTMLSelectElement>('[data-filter-sortierung]');

    /** Zahl aus einem Datenfeld – „18.900 €" wird zu 18900. */
    const zahl = (wert?: string) => {
      if (!wert) return NaN;
      const n = Number.parseFloat(wert.replace(/[^0-9,.-]/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.'));
      return Number.isFinite(n) ? n : NaN;
    };

    function anwenden() {
      let sichtbar = 0;
      elemente.forEach((el) => {
        let zeigen = true;

        /*
         * Merkmalsgruppen: innerhalb ODER, zwischen UND
         *
         * WARUM HIER KEIN `const [a, b] of …` STEHT (gilt fuer jede Stelle in
         * jedem Verhaltens-Baustein): Das Zerlegen in Klammern ist die EINZIGE
         * moderne Schreibweise, die der Uebersetzer nicht in eine aeltere
         * umwandeln kann. Solange sie hier steht, ist das GESAMTE Skriptbuendel
         * fuer aeltere Browser ein Lesefehler - und dann faellt nicht nur der
         * Filter aus, sondern alles gleichzeitig: Menue, Merkliste, Formular,
         * Lightbox. Ausgeschrieben kostet es zwei Zeilen.
         * `npm run browser` schlaegt an, wenn es jemand wieder einbaut.
         */
        for (const eintrag of auswahl) {
          const merkmal = eintrag[0];
          const werte = eintrag[1];
          if (werte.size === 0) continue;
          const eigene = (el.dataset[merkmal] ?? '').split(/\s+/).filter(Boolean);
          if (!eigene.some((w) => werte.has(w))) { zeigen = false; break; }
        }

        // Obergrenzen
        if (zeigen) {
          for (const eintrag of grenzen) {
            const merkmal = eintrag[0];
            const max = eintrag[1];
            const wert = zahl(el.dataset[merkmal]);
            // Ein Eintrag OHNE den Wert wird nicht ausgeblendet – sonst
            // verschwinden Einträge, bei denen die Angabe schlicht fehlt.
            if (Number.isFinite(wert) && wert > max) { zeigen = false; break; }
          }
        }

        // Merkliste
        if (zeigen && nurGemerkte) {
          const id = el.dataset.katalogEintrag ?? '';
          if (!gemerkt.includes(id)) zeigen = false;
        }

        el.hidden = !zeigen;
        if (zeigen) sichtbar++;
      });

      if (anzahlEl) anzahlEl.textContent = String(sichtbar);
      if (leerEl) leerEl.toggleAttribute('hidden', sichtbar > 0);
    }

    function sortieren(wert: string) {
      if (!wert) return;
      const teile = wert.split('-');
      const merkmal = teile[0];
      const faktor = teile[1] === 'ab' ? -1 : 1;
      const sortiert = [...elemente].sort((a, b) => {
        const x = zahl(a.dataset[merkmal]);
        const y = zahl(b.dataset[merkmal]);
        // Einträge ohne Wert wandern ans Ende statt nach vorn.
        if (!Number.isFinite(x)) return 1;
        if (!Number.isFinite(y)) return -1;
        return (x - y) * faktor;
      });
      sortiert.forEach((el) => ziel.appendChild(el));
    }

    // Knöpfe und Kästchen je Gruppe
    gruppen.forEach((gruppe) => {
      const merkmal = gruppe.dataset.filterGruppe!;
      auswahl.set(merkmal, new Set());

      gruppe.querySelectorAll<HTMLElement>('[data-filter-wert]').forEach((el) => {
        const wert = el.dataset.filterWert!;

        if (el instanceof HTMLInputElement && el.type === 'checkbox') {
          el.addEventListener('change', () => {
            const menge = auswahl.get(merkmal)!;
            el.checked ? menge.add(wert) : menge.delete(wert);
            anwenden();
          });
          return;
        }

        // Knopf: „alle" leert die Gruppe, sonst genau ein Wert je Gruppe
        el.setAttribute('type', 'button');
        el.addEventListener('click', () => {
          const menge = auswahl.get(merkmal)!;
          menge.clear();
          if (wert !== 'alle') menge.add(wert);
          gruppe.querySelectorAll<HTMLElement>('[data-filter-wert]').forEach((k) => {
            const aktiv = k.dataset.filterWert === wert;
            k.setAttribute('aria-pressed', String(aktiv));
            k.classList.toggle('ist-aktiv', aktiv);
          });
          anwenden();
        });
      });
    });

    // Schieberegler
    regler.forEach((r) => {
      const merkmal = r.dataset.filterMax!;
      const anzeige = box.querySelector<HTMLElement>(`[data-filter-max-anzeige="${merkmal}"]`);
      const zeigeWert = () => {
        if (!anzeige) return;
        const n = Number(r.value);
        /* Bewusst 'de-DE' statt 'de-AT': Die Zeichensatz-Datenbank liefert für
           Österreich ein schmales Leerzeichen als Tausendertrenner („25 000"),
           österreichische Preislisten schreiben aber den Punkt („25.000").
           Bei einem Preis fällt der Unterschied sofort auf. */
        anzeige.textContent = n >= Number(r.max) ? 'egal' : n.toLocaleString('de-DE');
      };
      const setzen = () => {
        const n = Number(r.value);
        // Am oberen Anschlag schränkt der Regler nicht ein.
        if (n >= Number(r.max)) grenzen.delete(merkmal);
        else grenzen.set(merkmal, n);
        zeigeWert();
        anwenden();
      };
      r.addEventListener('input', setzen);
      r.value = r.max;
      zeigeWert();
    });

    if (sortierung) {
      sortierung.addEventListener('change', () => sortieren(sortierung.value));
    }

    box.querySelectorAll<HTMLElement>('[data-filter-zuruecksetzen]').forEach((k) => {
      k.setAttribute('type', 'button');
      k.addEventListener('click', () => {
        auswahl.forEach((menge) => menge.clear());
        grenzen.clear();
        box.querySelectorAll<HTMLElement>('[data-filter-wert]').forEach((el) => {
          if (el instanceof HTMLInputElement && el.type === 'checkbox') el.checked = false;
          else {
            const istAlle = el.dataset.filterWert === 'alle';
            el.setAttribute('aria-pressed', String(istAlle));
            el.classList.toggle('ist-aktiv', istAlle);
          }
        });
        regler.forEach((r) => {
          r.value = r.max;
          r.dispatchEvent(new Event('input'));
        });
        if (sortierung) sortierung.value = '';
        urReihenfolge.forEach((el) => ziel.appendChild(el));
        anwenden();
      });
    });

    anwenden();
  });
}
