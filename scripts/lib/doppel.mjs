/**
 * =============================================================================
 *  SYNC-DOPPEL – „index 2.html", „og 3.jpg", „Foto 2.jpeg"
 * =============================================================================
 *  Legt jemand seine Projekte in einen Ordner, den ein Cloud-Dienst abgleicht
 *  (auf einem Mac sind Schreibtisch und Dokumente in der Standard-Einstellung
 *  genau das), dann legt der Dienst bei jedem Schreibkonflikt eine Kopie mit
 *  angehängter Zahl an. Ein Build schreibt in Sekunden hunderte Dateien neu –
 *  das ist ein Dauerkonflikt.
 *
 *  WAS DAS ANRICHTET, dreimal an einem Tag aufgelaufen (01.09.2026, echtes
 *  Kundenprojekt, 165 Doppel in dist/):
 *
 *    • `npm run interaktion` prüfte 23 statt 15 Seiten und wurde ROT auf
 *      „/anfrage-fehler/index 2" – einer Seite, die es nicht gibt und die
 *      niemand je aufrufen wird.
 *    • `npm run unterlaengen` meldete „23 Seiten geprüft" – eine Zahl, die
 *      niemandem auffällt und trotzdem falsch ist.
 *    • Die Kopien sind ein ALTER Stand. Ein Tor, das eine davon misst, misst
 *      eine Seite von vorgestern und meldet grün.
 *
 *  Ausgeliefert wird davon nie etwas (`dist/` steht in .gitignore), aber jedes
 *  Tor, das den Ordner durchläuft, misst Gespenster.
 *
 *  ZWEI VERSCHIEDENE FÄLLE, und sie werden verschieden behandelt:
 *
 *    dist/  →  WEGRÄUMEN. Der Ordner ist erzeugt; eine Kopie darin ist
 *              wertlos, und die Kopie einer erzeugten Datei ist nie das
 *              Original.
 *    src/, fotos/, public/, daten/  →  NUR MELDEN. Dort könnte in der Kopie
 *              die NEUERE Arbeit stecken – etwa wenn zwei Rechner dieselbe
 *              Datei angefasst haben. Das darf kein Skript entscheiden.
 * =============================================================================
 */
import { existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * „name 2.ext", „name 3.ext" – aber NICHT „hero 2.jpg", wenn es kein
 * „hero.jpg" daneben gibt. Ohne diese zweite Bedingung träfe die Regel auch
 * eine bewusst benannte Datei („Speisekarte 2.pdf", „Saal 2.jpg").
 */
export function istDoppel(ordner, name) {
  const m = name.match(/^(.*) \d+(\.[^.]+)?$/);
  if (!m) return false;
  const original = m[1] + (m[2] || '');
  return existsSync(join(ordner, original));
}

/** Findet alle Sync-Doppel unter `wurzel` (rekursiv), als relative Pfade. */
export function findeDoppel(wurzel, basis = wurzel, treffer = []) {
  if (!existsSync(wurzel)) return treffer;
  for (const e of readdirSync(wurzel)) {
    const p = join(wurzel, e);
    if (statSync(p).isDirectory()) findeDoppel(p, basis, treffer);
    else if (istDoppel(wurzel, e)) treffer.push(relative(basis, p));
  }
  return treffer;
}

/**
 * Räumt die Doppel in einem ERZEUGTEN Ordner weg und sagt, wie viele es waren.
 * Gibt die Anzahl zurück; 0 heißt „nichts zu tun" und schreibt nichts.
 */
export function doppelWegraeumen(ordner) {
  const treffer = findeDoppel(ordner);
  for (const t of treffer) {
    try {
      rmSync(join(ordner, t));
    } catch {
      /* Ein Tor darf nie daran scheitern, dass eine Kopie sich nicht löschen
         lässt – dann bleibt sie eben liegen und wird unten gemeldet. */
    }
  }
  return treffer.length;
}
