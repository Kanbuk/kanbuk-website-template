/**
 * Gemeinsame Quelltext-Hilfen für die Prüf-Skripte.
 *
 * WARUM EINE EIGENE DATEI: Der Marker-Zähler stand zweimal da – einmal in
 * `check.mjs` (mit Ausblenden der Kommentare) und einmal in `vorcheck.mjs`
 * (ohne). Die beiden meldeten damit verschiedene Zahlen für dieselbe Datei:
 * Der Vorcheck zählte die Erklärkommentare mit, die einem Klon gerade erst
 * beibringen, WIE man einen Platzhalter setzt. Wer den beiden Zahlen begegnet,
 * traut ab dann keiner mehr.
 */

/**
 * Blendet Kommentare aus – ZEILENZAHL-ERHALTEND (Leerzeichen statt löschen),
 * damit eine Meldung weiterhin auf die richtige Zeile zeigt.
 *
 * EIN ZUSTANDSAUTOMAT, KEIN REGULÄRER AUSDRUCK: In jeder URL stehen zwei
 * Schrägstriche mitten in einer Zeichenkette, und ein Ausdruck hält
 * `https://…` für den Beginn eines Kommentars.
 *
 * WAS ER NICHT KANN, ehrlich benannt: Er kennt keine regulären Ausdrücke als
 * Literal. Stünde in der Datei ein Ausdruck, der selbst zwei Schrägstriche
 * enthält (`/\/\//`), hielte er den Rest der Zeile für einen Kommentar.
 * Das ist bewusst nicht gelöst: „Ist das ein Ausdruck oder eine Division?"
 * ist ohne vollständigen Parser nicht zu beantworten, und die Dateien, die
 * hier durchlaufen, sind Konfigurationen – dort kommen solche Ausdrücke nicht
 * vor. Sollte es doch einmal so weit sein, ist das hier die Stelle.
 */
export function ohneKommentare(quelle) {
  let raus = '';
  let zustand = 'code'; // code | zeile | block | text
  let anfuehrung = '';
  for (let i = 0; i < quelle.length; i++) {
    const z = quelle[i];
    const naechst = quelle[i + 1];
    if (zustand === 'code') {
      if (z === '/' && naechst === '/') { zustand = 'zeile'; raus += '  '; i++; continue; }
      if (z === '/' && naechst === '*') { zustand = 'block'; raus += '  '; i++; continue; }
      if (z === '"' || z === "'" || z === '`') { zustand = 'text'; anfuehrung = z; }
      raus += z;
    } else if (zustand === 'zeile') {
      if (z === '\n') { zustand = 'code'; raus += z; } else raus += ' ';
    } else if (zustand === 'block') {
      if (z === '*' && naechst === '/') { zustand = 'code'; raus += '  '; i++; continue; }
      raus += z === '\n' ? z : ' ';
    } else {
      // In einer Zeichenkette: Escapes überspringen, sonst endet sie zu früh.
      if (z === '\\') { raus += z + (naechst ?? ''); i++; continue; }
      if (z === anfuehrung) zustand = 'code';
      raus += z;
    }
  }
  return raus;
}

/** Die Marker, die vor dem Live-Gang ersetzt sein müssen. */
export const MARKER = /\b(PLATZHALTER|TODO|XXX+|LOREM IPSUM)\b/g;
