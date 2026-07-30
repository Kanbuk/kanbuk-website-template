/**
 * Textwerkzeuge des Motors – klein, aber sie stehen in Google-Treffern.
 */

/**
 * Kürzt einen Text auf höchstens `max` Zeichen, ohne ein Wort zu zerreißen.
 *
 * WARUM DAS EINE EIGENE FUNKTION IST: Bis zum 30.07.2026 stand in der
 * Katalog-Detailseite schlicht `.slice(0, 158)` – ein harter Schnitt. Was
 * daraus im Google-Treffer wird, sieht man erst live: „… und Navigatio".
 * Niemand liest die Description beim Bauen; sie erscheint an genau einer
 * Stelle, und das ist die Ergebnisliste.
 *
 * In einem Kundenprojekt gab es dafür bereits eine Reparatur, und die war
 * VERDREHT: Sie entfernte den Wortrest nur, wenn er LÄNGER als zwölf Zeichen
 * war – also gerade dann nicht, wenn ein kurzer Rest wie „Navigatio"
 * stehenblieb.
 *
 * Richtig ist, das Zeichen AN der Schnittstelle zu prüfen:
 *   - Steht dort ein Leerzeichen, war das letzte Wort vollständig.
 *   - Sonst bis zum letzten Leerzeichen davor zurück.
 *
 * Ein abschließendes Satzzeichen wird mitgenommen, ein einzelner Bindestrich
 * oder Beistrich am Ende fällt weg – der sieht abgeschnitten aus, auch wenn er
 * es nicht ist.
 */
export function kuerzeAufWort(text: string, max = 158): string {
  const sauber = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (sauber.length <= max) return sauber;

  /* Ein Zeichen weiter schauen als die Grenze: Steht DORT ein Leerzeichen,
     endet das letzte Wort genau an der Grenze und darf ganz bleiben. */
  const passtGenau = /\s/.test(sauber[max] ?? '');
  const roh = passtGenau ? sauber.slice(0, max) : sauber.slice(0, max).replace(/\s\S*$/, '');

  // Ein Rest ohne Leerzeichen (ein einziges sehr langes Wort) wird hart gekürzt.
  const gekuerzt = roh.trim() || sauber.slice(0, max).trim();
  return gekuerzt.replace(/[\s,;:–-]+$/, '');
}
