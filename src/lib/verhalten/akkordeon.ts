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
 * 3. ES KLAPPTE NUR AUF SANFT AUF, NICHT ZU. Das Zuklappen sprang hart – die
 *    Hälfte der Bedienung. Zwei Sackgassen auf dem Weg zur Lösung, beide
 *    gemessen, damit sie niemand noch einmal geht:
 *
 *    a) NUR `height` auf 0 fahren reicht nicht. Eine Box kann nicht unter ihr
 *       eigenes Polster schrumpfen: Steht am Antworttext ein `padding-bottom`
 *       von 24 px, bleibt sie bei `height: 0` trotzdem 24 px hoch. Der
 *       Höhenverlauf war „73 → Sprung auf 96 → sanft auf 149" beim Öffnen und
 *       beim Schließen ein Hängenbleiben bei 96 mit hartem Fall auf 73 ganz am
 *       Ende. Die Polster MÜSSEN mitlaufen.
 *
 *    b) Das <details> selbst zu animieren scheitert daran, dass
 *       `overflow: hidden` auf <details> NICHT KLEMMT. Gegenprobe: Höhe fest
 *       auf 40 px, `overflow: hidden` gesetzt – der Antworttext ragte trotzdem
 *       97 px hinaus. Er schwebte sichtbar in die nächste Frage hinein.
 *       Geklemmt wird deshalb am Inhalt, nicht am Klappelement.
 *
 *    Bewegt wird also ALLES, was nach dem <summary> steht: Höhe und beide
 *    senkrechten Polster gemeinsam, geklemmt am Element selbst. Die Zielwerte
 *    werden GEMESSEN, nicht gerechnet – dann stimmen sie, egal wie ein Design
 *    die Antwort gestaltet.
 */
import { bewegungReduziert } from './hilfen';

/* ===========================================================================
   DIE BEWEGUNG GEHÖRT DEM DESIGN, NICHT DEM MOTOR.
   ===========================================================================
   Hier standen 240 ms und eine Kurve fest im Code. Das ist Lack, kein
   Getriebe: WIE schnell und mit welchem Schwung etwas aufklappt, entscheidet
   das Design – der Motor entscheidet nur, WAS aufklappt und was die Tastatur
   dabei tut (CLAUDE.md 4aa).

   Warum das im Motor besonders hart zuschlug: `Element.animate()` steht in
   der Kaskade ÜBER normalem Autoren-CSS. Ein Design konnte seine eigene
   Aufklapp-Bewegung also nicht einmal mit einer CSS-Regel zurückholen – sie
   lief bestenfalls PARALLEL zur Motor-Bewegung, mit zwei verschiedenen
   Dauern. Genau das Bild von „im Design sah es super aus, im Bau ruckelt es".

   Jetzt gilt:

   1. Die Werte kommen aus dem CSS, nicht aus dem Code:
        [data-akkordeon] { --akkordeon-dauer: 320ms; --akkordeon-kurve: ease; }
      Steht dort nichts, bleiben die Motor-Werte als Rückfall.

   2. Bringt das Design eine EIGENE Bewegung mit, hält sich der Motor ganz
      heraus – siehe `designBewegtSelbst()`. Dann klappt `<details>` nativ um,
      das Design animiert, und der Motor macht nur noch Mechanik.
   =========================================================================== */
const DAUER_RUECKFALL = 240;
/* Schneller Start, weiches Auslaufen. Wichtiger als der genaue Wert ist, DASS
   es weich ausläuft: Daran erkennt man beim Nachmessen eine echte Bewegung –
   ein hartes Umschalten endet mit einem Sprung über die ganze Strecke. */
const KURVE_RUECKFALL = 'cubic-bezier(0.32, 0.72, 0, 1)';

/** Millisekunden aus einer CSS-Angabe („320ms", „0.4s"). */
function alsMillisekunden(wert: string): number | null {
  const t = wert.trim();
  if (!t) return null;
  const zahl = Number.parseFloat(t);
  if (!Number.isFinite(zahl)) return null;
  return t.endsWith('ms') ? zahl : t.endsWith('s') ? zahl * 1000 : null;
}

/**
 * BRINGT DAS DESIGN SEINE EIGENE AUFKLAPP-BEWEGUNG MIT?
 *
 * Erkannt an einer laufenden `transition` oder `animation` auf dem Inhalt.
 * Ein Design, das `details[open] .antwort { transition: … }` schreibt, meint
 * genau das – dann darf der Motor nicht mitanimieren, sonst laufen zwei
 * Bewegungen gegeneinander.
 *
 * Ausdrücklich abschaltbar über `data-akkordeon-bewegung="motor"`, falls ein
 * Design zwar Übergänge auf dem Inhalt hat, das Aufklappen aber dem Motor
 * überlassen will.
 */
function designBewegtSelbst(inhalt: HTMLElement, box: HTMLElement): boolean {
  if (box.dataset.akkordeonBewegung === 'motor') return false;
  if (box.dataset.akkordeonBewegung === 'design') return true;
  const stil = getComputedStyle(inhalt);
  const hatUebergang = stil.transitionDuration
    .split(',')
    .some((d) => (alsMillisekunden(d) ?? 0) > 0);
  const hatAnimation =
    stil.animationName !== 'none' &&
    stil.animationDuration.split(',').some((d) => (alsMillisekunden(d) ?? 0) > 0);
  return hatUebergang || hatAnimation;
}

export function akkordeonStarten(): void {
  document.querySelectorAll<HTMLElement>('[data-akkordeon]').forEach((box) => {
    const eintraege = Array.from(box.querySelectorAll<HTMLDetailsElement>('details'));
    if (eintraege.length === 0) return;

    const exklusiv = box.hasAttribute('data-akkordeon-exklusiv');
    const laufend = new WeakMap<HTMLDetailsElement, Animation>();

    const zustandMelden = (d: HTMLDetailsElement) => d.classList.toggle('ist-offen', d.open);

    /** Alles, was nach dem <summary> steht. Meist ein einzelner Block – es
     *  dürfen aber mehrere sein, und dann muss jeder mitlaufen, sonst springt
     *  der Rest. */
    function inhalte(d: HTMLDetailsElement): HTMLElement[] {
      return Array.from(d.children).filter((k) => k.tagName !== 'SUMMARY') as HTMLElement[];
    }

    /** `overflow` gehört ans Element, NICHT in die Keyframes: Es ist keine
     *  animierbare Eigenschaft – die Web-Animation ignoriert es dort
     *  stillschweigend, und dann steht der Inhalt außerhalb seiner
     *  schrumpfenden Box. Danach wieder wegnehmen, sonst schneidet die Box
     *  dauerhaft ab (etwa den Fokusrahmen eines Links in der Antwort).
     *
     *  DER WACHPOSTEN (`laufend.get(d) !== a`) IST KEIN SCHMUCK. Ereignisse
     *  der Web-Animation werden VERZÖGERT zugestellt, nicht sofort. Wer eine
     *  alte Bewegung abbricht und im selben Atemzug eine neue startet, bekommt
     *  das `cancel` der alten ERST DANACH – ihr Aufräumen löscht dann die
     *  Klemmung, die die neue Bewegung gerade gesetzt hat. Gemessen: 110 ms
     *  nach dem Klick lief die Bewegung, aber `overflow` stand wieder auf
     *  `visible`, und der Antworttext ragte 91 px über seinen Eintrag hinaus –
     *  er schwebte sichtbar in die nächste Frage hinein. Aufräumen darf
     *  deshalb nur, wer noch der aktuelle Lauf ist. */
    function fahren(d: HTMLDetailsElement, oeffnen: boolean): Animation | null {
      const teile = inhalte(d);
      if (teile.length === 0) return null;

      /* Die natürlichen Maße messen, solange `open` steht. Zwischen Messen und
         Setzen wird kein Bild gemalt – der Browser rechnet innerhalb dieses
         Blocks, es flackert also nichts. */
      const ziele = teile.map((el) => {
        el.style.removeProperty('height');
        el.style.removeProperty('padding-top');
        el.style.removeProperty('padding-bottom');
        const stil = getComputedStyle(el);
        return {
          el,
          hoehe: el.getBoundingClientRect().height,
          padOben: stil.paddingTop,
          padUnten: stil.paddingBottom,
        };
      });

      /* Dauer und Kurve aus dem CSS – das Design schreibt sie an den Kasten
         oder an den einzelnen Eintrag. Ohne Angabe der Motor-Rückfall. */
      const eigen = getComputedStyle(teile[0]);
      const dauer = alsMillisekunden(eigen.getPropertyValue('--akkordeon-dauer')) ?? DAUER_RUECKFALL;
      const kurve = eigen.getPropertyValue('--akkordeon-kurve').trim() || KURVE_RUECKFALL;

      let leit: Animation | null = null;
      for (const z of ziele) {
        z.el.style.overflow = 'hidden';
        const offen = { height: `${z.hoehe}px`, paddingTop: z.padOben, paddingBottom: z.padUnten, opacity: 1 };
        const zu = { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 };
        const a = z.el.animate(oeffnen ? [zu, offen] : [offen, zu], { duration: dauer, easing: kurve });
        if (!leit) leit = a;
      }
      if (!leit) return null;

      const chef = leit;
      laufend.set(d, chef);
      /* DER WACHPOSTEN (`laufend.get(d) !== chef`) IST KEIN SCHMUCK.
         Ereignisse der Web-Animation werden VERZÖGERT zugestellt, nicht
         sofort. Wer eine alte Bewegung abbricht und im selben Atemzug eine
         neue startet, bekommt das `cancel` der alten ERST DANACH – ihr
         Aufräumen löscht dann die Klemmung, die die neue gerade gesetzt hat.
         Gemessen: 110 ms nach dem Klick lief die Bewegung, aber `overflow`
         stand wieder auf `visible`. Aufräumen darf nur der aktuelle Lauf. */
      const zurueck = () => {
        if (laufend.get(d) !== chef) return;
        for (const z of ziele) {
          z.el.style.removeProperty('overflow');
          z.el.style.removeProperty('height');
          z.el.style.removeProperty('padding-top');
          z.el.style.removeProperty('padding-bottom');
        }
      };
      chef.addEventListener('finish', zurueck);
      chef.addEventListener('cancel', zurueck);
      return chef;
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
      d.open = true;
      zustandMelden(d);
      fahren(d, true);
    }

    function zuklappen(d: HTMLDetailsElement, sanft: boolean): void {
      laufend.get(d)?.cancel();
      if (!sanft) {
        d.open = false;
        zustandMelden(d);
        return;
      }
      // Die Klasse sofort wegnehmen, damit das Plus-/Minus-Zeichen mit dem
      // Klick umschlägt und nicht erst eine Viertelsekunde später.
      d.classList.remove('ist-offen');
      const a = fahren(d, false);
      if (!a) {
        d.open = false;
        zustandMelden(d);
        return;
      }
      // `open` bleibt stehen, bis die Bewegung durch ist – sonst wäre der
      // Inhalt sofort weg und es gäbe nichts mehr zuzuklappen.
      // Auch hier der Wachposten: Ein verspätet zugestelltes `finish` eines
      // überholten Laufs dürfte sonst einen gerade wieder geöffneten Eintrag
      // zuschlagen.
      a.addEventListener('finish', () => {
        if (laufend.get(d) !== a) return;
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
      /* DIE MECHANIK HÄNGT AM `toggle`, NICHT AM KLICK – und zwar IMMER.
         -----------------------------------------------------------------
         Hier stand dieser Zweig nur für Browser ohne `Element.animate`.
         Seit der Motor auch dann die Finger stillhält, wenn das DESIGN die
         Bewegung mitbringt, gibt es einen dritten Weg, auf dem `<details>`
         nativ umschaltet – und auf dem wäre die Zustandsklasse `.ist-offen`
         nie gesetzt worden und die Exklusiv-Logik nie gelaufen. Also
         genau der Fehlertyp, gegen den dieser Kommentar warnt: eine Zusage
         im Text, die der Code auf einem von drei Wegen nicht hält.

         `toggle` feuert bei JEDER Änderung von `open` – ob nativ oder vom
         Motor gesetzt. Doppelt schadet es nicht: `classList.toggle` mit
         zweitem Argument ist wertgleich, und `andereSchliessen` überspringt
         bereits geschlossene Einträge. */
      d.addEventListener('toggle', () => {
        zustandMelden(d);
        if (exklusiv && d.open) andereSchliessen(d);
      });

      if (typeof d.animate !== 'function') return;

      schalter.addEventListener('click', (e) => {
        /* HAT DAS DESIGN EINE EIGENE BEWEGUNG? Dann Finger weg.
           Bei JEDEM Klick neu geprüft, nicht einmal beim Start: Ein Design
           kann seine Übergänge je Breite anders setzen, und eine Messung beim
           Laden würde die Medienabfrage übersehen.

           Der Motor lässt dann das native Umschalten von <details> laufen –
           kein preventDefault, keine Web-Animation. Die Mechanik (Exklusiv-
           Logik, ARIA, Tastatur) bleibt, sie hängt am `toggle`-Ereignis. */
        const inhalt = d.querySelector<HTMLElement>(':scope > :not(summary)');
        if (inhalt && designBewegtSelbst(inhalt, box)) return;

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
