/**
 * AKKORDEON – auf-/zuklappbare Bereiche (FAQ, Preisgruppen, Leistungsdetails).
 *
 * Basiert bewusst auf nativem <details>/<summary>: funktioniert ohne JS,
 * ist von Haus aus barrierefrei und für Google im DOM (kein SEO-Nachteil).
 * Das JS fügt nur zwei Dinge hinzu, die nativ fehlen:
 *   1. Optionales „nur eines offen" (data-akkordeon-exklusiv)
 *   2. Sanftes Aufklappen statt Springen
 *
 * Markup:
 *   <div data-akkordeon data-akkordeon-exklusiv>
 *     <details><summary>Frage</summary><div>Antwort</div></details>
 *     <details><summary>Frage</summary><div>Antwort</div></details>
 *   </div>
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ZWEI BEWEGUNGSFEHLER, DIE HIER GELÖST SIND
 *
 * Beide wurden in einem Kundenprojekt vom Auftraggeber gemeldet, nicht von
 * einer Prüfung – die messen Überlauf, Kontrast, JS-Fehler und Klickbarkeit,
 * aber keine BEWEGUNG. Alle vier Tore waren dabei grün.
 *
 * 1. DER DOPPELSPRUNG. `<details>` klappt beim Klick SOFORT auf; das
 *    `toggle`-Ereignis kommt erst danach. Zwischen beidem malt der Browser
 *    ein Bild mit voller Höhe – gemessen 68 px hinunter –, dann startet die
 *    Bewegung bei 0 und es geht 48 px zurück. Deshalb wird die Sperre schon
 *    im `click` gesetzt, VOR der nativen Reaktion.
 *    Zweiter Teil derselben Ursache: `height` bewegt die INNENABSTÄNDE nicht
 *    mit. Die müssen ausdrücklich mitlaufen, sonst ruckelt es am Ende.
 *
 * 2. DIE ANGEKLICKTE FRAGE SPRINGT WEG. Schließt „nur eines offen" einen
 *    Eintrag WEITER OBEN, rutscht alles darunter hoch – auch die Frage, die
 *    gerade unter dem Finger liegt. Deshalb wird ihre Position vorher und
 *    nachher gemessen und der Unterschied ausgeglichen.
 */
import { bewegungReduziert } from './hilfen';

export function akkordeonStarten(): void {
  document.querySelectorAll<HTMLElement>('[data-akkordeon]').forEach((box) => {
    const eintraege = Array.from(box.querySelectorAll<HTMLDetailsElement>('details'));
    if (eintraege.length === 0) return;

    const exklusiv = box.hasAttribute('data-akkordeon-exklusiv');
    const reduziert = bewegungReduziert();

    eintraege.forEach((d) => {
      const inhalt = d.querySelector<HTMLElement>('summary + *');
      const summary = d.querySelector<HTMLElement>('summary');

      /* Sperre VOR der nativen Reaktion setzen – siehe Bewegungsfehler 1.
         Ein `click`-Zuhörer läuft vor der Standardaktion des Browsers; danach
         wäre das Bild mit voller Höhe schon gemalt. */
      if (inhalt && summary && !reduziert) {
        summary.addEventListener('click', () => {
          if (d.open) return; // wird gleich geschlossen – das läuft ohne Bewegung
          inhalt.style.overflow = 'hidden';
          inhalt.style.height = '0px';
          inhalt.style.paddingTop = '0px';
          inhalt.style.paddingBottom = '0px';
        });
      }

      d.addEventListener('toggle', () => {
        d.classList.toggle('ist-offen', d.open);

        if (d.open && exklusiv) {
          const andere = eintraege.filter((a) => a !== d && a.open);
          if (andere.length > 0) {
            /* Position der angeklickten Frage festhalten – siehe
               Bewegungsfehler 2. Ohne das rutscht sie unter dem Finger weg,
               sobald ein Eintrag weiter oben zuklappt. */
            const vorher = d.getBoundingClientRect().top;
            andere.forEach((a) => (a.open = false));
            const nachher = d.getBoundingClientRect().top;
            const versatz = nachher - vorher;
            /* SOFORT, nicht weich: Die Seite hat `scroll-behavior: smooth`.
               Ohne `behavior: instant` wird aus dem Ausgleich selbst eine
               sichtbare Bewegung über rund 300 ms - gemessen wanderte die
               angeklickte Frage dann immer noch 118 px, nur langsamer. Der
               Ausgleich muss im selben Bild passieren wie die Ursache. */
            if (Math.abs(versatz) > 1) window.scrollBy({ top: versatz, behavior: 'instant' });
          }
        }

        if (reduziert || !inhalt) return;

        if (!d.open) {
          // Zugeklappt: Sperre lösen, damit der nächste Aufklapp sauber misst.
          inhalt.style.cssText = '';
          return;
        }

        /* Die natürlichen Maße messen, solange die Sperre noch sitzt. Zwischen
           Setzen und Zurücknehmen wird kein Bild gemalt – der Browser rechnet
           innerhalb dieses Blocks, es flackert also nichts. */
        inhalt.style.height = 'auto';
        inhalt.style.paddingTop = '';
        inhalt.style.paddingBottom = '';
        const stil = getComputedStyle(inhalt);
        const zielHoehe = inhalt.getBoundingClientRect().height;
        const padOben = stil.paddingTop;
        const padUnten = stil.paddingBottom;

        inhalt.style.height = '0px';
        inhalt.style.paddingTop = '0px';
        inhalt.style.paddingBottom = '0px';

        const lauf = inhalt.animate(
          [
            { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 },
            { height: `${zielHoehe}px`, paddingTop: padOben, paddingBottom: padUnten, opacity: 1 },
          ],
          { duration: 220, easing: 'ease-out' },
        );
        // Danach die Maße wieder dem CSS überlassen – sonst bliebe der Bereich
        // auf der gemessenen Höhe stehen und wüchse bei längerem Text nicht mit.
        lauf.onfinish = () => {
          inhalt.style.cssText = '';
        };
      });
    });
  });
}
