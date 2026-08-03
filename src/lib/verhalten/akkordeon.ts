/**
 * AKKORDEON – auf-/zuklappbare Bereiche (FAQ, Preisgruppen, Leistungsdetails).
 *
 * Basiert bewusst auf nativem <details>/<summary>: funktioniert ohne JS,
 * ist von Haus aus barrierefrei und für Google im DOM (kein SEO-Nachteil).
 * Das JS fügt nur zwei Dinge hinzu, die nativ fehlen:
 *   1. Optionales „nur eines offen" (data-akkordeon-exklusiv)
 *   2. Sanftes Auf- UND Zuklappen statt Springen
 *
 * Markup:
 *   <div data-akkordeon data-akkordeon-exklusiv>
 *     <details><summary>Frage</summary><div>Antwort</div></details>
 *     <details><summary>Frage</summary><div>Antwort</div></details>
 *   </div>
 *
 * ─────────────────────────────────────────────────────────────────────────
 * DREI BEWEGUNGSFEHLER, DIE HIER GELÖST SIND
 *
 * Alle drei wurden von Auftraggebern gemeldet, keiner von einer Prüfung. Das
 * ist kein Zufall: Der Interaktionstest fährt mit „Bewegung reduzieren", damit
 * er nicht auf halbe Animationen warten muss – er sieht also grundsätzlich
 * NUR den Pfad ohne Bewegung. Alle Tore waren jedes Mal grün.
 *
 * 1. DER DOPPELSPRUNG. `<details>` klappt beim Klick SOFORT auf; das
 *    `toggle`-Ereignis kommt erst danach. Wer erst dort mit der Bewegung
 *    beginnt, lässt den Browser vorher ein Bild mit voller Höhe malen –
 *    gemessen 68 px hinunter –, und die Bewegung startet danach bei 0.
 *    Deshalb wird der Klick abgefangen, bevor der Browser reagiert.
 *
 * 2. DIE ANGEKLICKTE FRAGE SPRINGT WEG. Schließt „nur eines offen" einen
 *    Eintrag WEITER OBEN, rutscht alles darunter hoch – auch die Frage, die
 *    gerade unter dem Finger liegt. Deshalb wird ihre Position vorher und
 *    nachher gemessen und der Unterschied SOFORT ausgeglichen. Die
 *    Geschwister klappen dafür ohne Bewegung zu: Eine weiche Bewegung
 *    ließe sich nicht in einem Bild ausgleichen, und der Ausgleich selbst
 *    würde zur sichtbaren Wanderung.
 *
 * 3. ES KLAPPT NUR AUF SANFT ZU, NICHT ZU. Das Zuklappen sprang hart – die
 *    Hälfte der Bedienung. Der frühere Versuch, dafür die INHALTS-Box von
 *    ihrer Höhe auf 0 zu fahren, scheiterte an einer Eigenheit des
 *    Box-Modells: Eine Box kann nicht unter ihr eigenes Polster schrumpfen.
 *    Steht am Antworttext ein `padding-bottom` von 24 px, bleibt sie bei
 *    `height: 0` trotzdem 24 px hoch. Gemessen ergab das beim Öffnen
 *    „73 → Sprung auf 96 → sanft auf 149" und beim Schließen ein
 *    Hängenbleiben bei 96 mit hartem Fall auf 73 ganz am Ende.
 *
 *    Deshalb wird das <details> SELBST animiert, von seiner echten
 *    zugeklappten zu seiner echten aufgeklappten Höhe. Beide Werte werden
 *    GEMESSEN, nicht gerechnet – dann sind Polster, Rahmen und Abstände
 *    automatisch enthalten, egal wie ein Design die Antwort gestaltet.
 */
import { bewegungReduziert } from './hilfen';

const DAUER = 240;
/* Schneller Start, weiches Auslaufen. Wichtiger als der genaue Wert ist, DASS
   es weich ausläuft: Daran erkennt man beim Nachmessen eine echte Bewegung –
   ein hartes Umschalten endet mit einem Sprung über die ganze Strecke. */
const KURVE = 'cubic-bezier(0.32, 0.72, 0, 1)';

export function akkordeonStarten(): void {
  document.querySelectorAll<HTMLElement>('[data-akkordeon]').forEach((box) => {
    const eintraege = Array.from(box.querySelectorAll<HTMLDetailsElement>('details'));
    if (eintraege.length === 0) return;

    const exklusiv = box.hasAttribute('data-akkordeon-exklusiv');
    const laufend = new WeakMap<HTMLDetailsElement, Animation>();

    const zustandMelden = (d: HTMLDetailsElement) => d.classList.toggle('ist-offen', d.open);

    /** Zugeklappte und aufgeklappte Höhe exakt messen.
     *  Das kurze Umschalten von `open` sieht niemand: Es passiert innerhalb
     *  eines Frames, der Browser zeichnet dazwischen nicht. */
    function hoehen(d: HTMLDetailsElement): { zu: number; auf: number } {
      const war = d.open;
      d.open = false;
      const zu = d.getBoundingClientRect().height;
      d.open = true;
      const auf = d.getBoundingClientRect().height;
      d.open = war;
      return { zu, auf };
    }

    /** `overflow` gehört ans Element, NICHT in die Keyframes: Es ist keine
     *  animierbare Eigenschaft – die Web-Animation ignoriert es dort
     *  stillschweigend, und dann steht der Inhalt außerhalb seiner
     *  schrumpfenden Box. Danach wieder wegnehmen, sonst schneidet die Box
     *  dauerhaft ab (etwa den Fokusrahmen eines Links in der Antwort). */
    function fahren(d: HTMLDetailsElement, von: number, nach: number): Animation {
      const vorher = d.style.overflow;
      d.style.overflow = 'hidden';
      const a = d.animate([{ height: `${von}px` }, { height: `${nach}px` }], {
        duration: DAUER,
        easing: KURVE,
      });
      const zurueck = () => {
        d.style.overflow = vorher;
        d.style.removeProperty('height');
      };
      a.addEventListener('finish', zurueck);
      a.addEventListener('cancel', zurueck);
      return a;
    }

    /** Geschwister schließen und den Versatz ausgleichen – Bewegungsfehler 2. */
    function andereSchliessen(d: HTMLDetailsElement): void {
      const andere = eintraege.filter((a) => a !== d && a.open);
      if (andere.length === 0) return;
      const vorher = d.getBoundingClientRect().top;
      andere.forEach((a) => {
        laufend.get(a)?.cancel();
        a.open = false;
        zustandMelden(a);
      });
      const versatz = d.getBoundingClientRect().top - vorher;
      /* SOFORT, nicht weich: Die Seite hat `scroll-behavior: smooth`. Ohne
         `behavior: instant` wird aus dem Ausgleich selbst eine sichtbare
         Bewegung über rund 300 ms – gemessen wanderte die angeklickte Frage
         dann immer noch 118 px, nur langsamer. Der Ausgleich muss im selben
         Bild passieren wie die Ursache. */
      if (Math.abs(versatz) > 1) window.scrollBy({ top: versatz, behavior: 'instant' as ScrollBehavior });
    }

    function aufklappen(d: HTMLDetailsElement, sanft: boolean): void {
      laufend.get(d)?.cancel();
      if (exklusiv) andereSchliessen(d);
      if (!sanft) {
        d.open = true;
        zustandMelden(d);
        return;
      }
      const masse = hoehen(d);
      d.open = true;
      zustandMelden(d);
      if (masse.auf > masse.zu) laufend.set(d, fahren(d, masse.zu, masse.auf));
    }

    function zuklappen(d: HTMLDetailsElement, sanft: boolean): void {
      laufend.get(d)?.cancel();
      if (!sanft) {
        d.open = false;
        zustandMelden(d);
        return;
      }
      const masse = hoehen(d);
      // Die Klasse sofort wegnehmen, damit das Plus-/Minus-Zeichen mit dem
      // Klick umschlägt und nicht erst eine Viertelsekunde später.
      d.classList.remove('ist-offen');
      const a = fahren(d, masse.auf, masse.zu);
      laufend.set(d, a);
      // `open` bleibt stehen, bis die Bewegung durch ist – sonst wäre der
      // Inhalt sofort weg und es gäbe nichts mehr zuzuklappen.
      a.addEventListener('finish', () => {
        d.open = false;
        zustandMelden(d);
      });
      // Ein abgebrochener Lauf (schneller Zweitklick) darf NICHT schließen.
      a.addEventListener('cancel', () => zustandMelden(d));
    }

    eintraege.forEach((d) => {
      zustandMelden(d);
      const schalter = d.querySelector('summary');
      if (!schalter) return;

      /* Die Steuerung NUR übernehmen, wenn der Browser Animationen kennt.
         Sonst bliebe nach `preventDefault` ein totes Akkordeon zurück –
         schlimmer als ein hart schaltendes. Die Untergrenze des Motors
         reicht unter `Element.animate` (Safari 13.1) hinunter. */
      if (typeof d.animate !== 'function') {
        if (exklusiv) {
          d.addEventListener('toggle', () => {
            zustandMelden(d);
            if (d.open) andereSchliessen(d);
          });
        }
        return;
      }

      schalter.addEventListener('click', (e) => {
        /* Bewegungswunsch bei JEDEM Klick neu lesen: Wer die Einstellung im
           Betriebssystem umstellt, soll die Seite nicht neu laden müssen. */
        const sanft = !bewegungReduziert();
        e.preventDefault();
        if (d.open) zuklappen(d, sanft);
        else aufklappen(d, sanft);
      });

      /* Tastatur braucht keinen eigenen Zweig: <summary> löst mit Enter und
         Leertaste ein `click`-Ereignis aus, das oben schon abgefangen wird. */
    });
  });
}
