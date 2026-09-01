/**
 * =============================================================================
 *  VERHALTENS-BAUSTEINE – Mechanik ohne Aussehen
 * =============================================================================
 *  Der Motor liefert das Verhalten, das Design liefert den Lack.
 *
 *  Jeder Baustein wird über data-Attribute im Markup aktiviert und vergibt
 *  ausschließlich ARIA-Attribute und Zustandsklassen (`ist-aktiv`, `ist-offen`).
 *  KEINE Farben, keine Abstände, keine Animationen – das gestaltet das Design.
 *
 *  Branchenneutral mit Absicht: „Tabs" sind Speisekarten-Kategorien beim Wirt,
 *  Wochentage beim Yoga-Studio und Leistungsbereiche beim Installateur.
 *
 *  Einbinden (einmal pro Seite, im BaseLayout):
 *      import { verhaltenStarten } from '../lib/verhalten';
 *      verhaltenStarten();
 * =============================================================================
 */

import { tabsStarten } from './tabs';
import { filterStarten } from './filter';
import { sliderStarten } from './slider';
import { akkordeonStarten } from './akkordeon';
import { lightboxStarten } from './lightbox';
import { mobilmenueStarten } from './mobilmenue';
import { vergleichStarten } from './vergleich';
import { formulareStarten } from './formular';
import { assistentStarten } from './assistent';
import { einwilligungStarten } from './einwilligung';
import { einbettungStarten } from './einbettung';
import { oeffnungsstatusStarten } from './oeffnungsstatus';
import { zeitenzeileStarten } from './zeitenzeile';
import { abweichendeZeitenStarten } from './abweichende-zeiten';
import { dialogStarten } from './dialog';
import { merklisteStarten } from './merkliste';
import { jahrStarten } from './jahr';
import { messungStarten } from './messung';

export { bewegungReduziert } from './hilfen';
export { erlaubt, beiFreigabe, widerrufen } from './einwilligung';
export { melden } from './messung';

/** Startet alle Bausteine. Jeder prüft selbst, ob er auf der Seite gebraucht wird. */
export function verhaltenStarten(): void {
  /* Merker für CSS: Bedienelemente, die ohne JavaScript sinnlos wären (etwa
     „Weiter" in einem Assistenten), bleiben ohne diese Klasse verborgen.
     Muss ganz am Anfang stehen – sonst blitzt der Assistent kurz komplett auf. */
  document.documentElement.classList.add('hat-js');

  // Einwilligung zuerst: Sie entscheidet, ob geparkte Skripte laufen dürfen.
  // Ohne konfigurierte Dienste passiert hier nichts (Seite bleibt cookiefrei).
  einwilligungStarten();
  einbettungStarten();

  tabsStarten();
  filterStarten();
  sliderStarten();
  akkordeonStarten();
  lightboxStarten();
  mobilmenueStarten();
  vergleichStarten();
  /* Assistent VOR dem Formular: Beim Absenden muss er zuerst zum fehlerhaften
     Schritt springen dürfen. Andernfalls prüft der Formular-Baustein zuerst,
     scheitert an einem unsichtbaren Pflichtfeld und der Besucher sieht nichts. */
  assistentStarten();
  formulareStarten();
  oeffnungsstatusStarten();
  zeitenzeileStarten();
  abweichendeZeitenStarten();
  dialogStarten();
  /* Merkliste NACH dem Filter: Sie meldet ihren Zustand per Ereignis, der
     Filter hört darauf – so bleiben beide widerspruchsfrei. */
  merklisteStarten();
  jahrStarten();
  /* ZULETZT, und das ist wichtig: Der Mess-Zuhörer hängt in der
     Erfassungsphase am Dokument und sieht damit jeden Klick – auch die, die
     ein anderer Baustein danach abfängt. Wäre er zuerst gestartet, änderte
     das an der Reihenfolge der Zuhörer nichts, aber ein Fehler beim Starten
     würde die ganze Kette anhalten. Messung ist das Unwichtigste auf dieser
     Seite; sie steht deshalb hinten. */
  messungStarten();
}
