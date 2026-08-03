/**
 * =============================================================================
 *  MOTOR-ABBRUCH – ein Fehler, den auch jemand lesen kann, der nicht programmiert
 * =============================================================================
 *  Der Motor bricht an mehreren Stellen absichtlich den Build ab: doppelte
 *  Katalog-Kennungen, ein Formular, das es nicht gibt, ein falscher Symbolname.
 *  Das ist richtig – ein stiller Fehler wäre schlimmer.
 *
 *  NUR: Ein normaler `throw new Error(...)` sieht beim Bauen so aus –
 *
 *      [ERROR] Error: Katalog: Die Kennung "bmw" gibt es zweimal …
 *          at file:///…/dist/.prerender/chunks/Fuss_Dh4M9dzq.mjs:786:24
 *          at AstroComponentInstance.BaseLayout [as factory] (…:20:10)
 *          at renderStreamToString (…/classPrivateFieldGet2_KCNpJf5e.mjs:1705:8)
 *          … acht weitere Zeilen …
 *
 *  – und wer nicht programmiert, sieht dort einen Absturz, keine Anweisung. Die
 *  Dateien in der Liste gibt es nicht einmal wirklich; sie entstehen beim Bauen
 *  und sind beim Nachsehen wieder weg.
 *
 *  Am 03.08.2026 in Astros Ausgabe-Code nachgesehen
 *  (`core/messages/runtime.js`): Der Stapelabzug wird nur ausgegeben, wenn
 *  `err.stack` etwas enthält – und `err.hint` erscheint als eigener, gelb
 *  gesetzter Absatz unter der Meldung. Beides nutzt diese Datei aus.
 *
 *  Ergebnis: eine rote Zeile, was nicht stimmt. Eine gelbe Zeile, was zu tun
 *  ist. Sonst nichts.
 * =============================================================================
 */

/**
 * Bricht den Build mit einer lesbaren Meldung ab.
 *
 * `was` – was nicht stimmt, in einem Satz.
 * `hilfe` – was der Nutzer tun soll, in einem Satz. Konkret: welches Feld in
 *           welcher Datei, oder welcher Befehl.
 */
export function motorFehler(was: string, hilfe: string): never {
  const fehler: Error & { hint?: string } = new Error(was);
  fehler.hint = hilfe;
  /* Leerer Stapelabzug: Astro überspringt den Abschnitt dann ganz. Nicht
     `undefined` – die Eigenschaft muss existieren und falsy sein. */
  fehler.stack = '';
  throw fehler;
}

/* -------------------------------------------------------------------------
   UND DER FALL DARUNTER: laut sagen, ohne den Build umzubringen.

   Nicht jeder Mangel rechtfertigt einen Abbruch. Eine doppelte Katalog-Kennung
   schon – dort verschwindet ein Eintrag spurlos. Ein fehlendes FAQ-Schema
   nicht: Die Seite ist vollständig, es fehlt nur ein Zusatz im Google-Treffer.
   Ein Abbruch hieße dort, dass ein Klon abends nicht mehr veröffentlichen
   kann, weil jemand eine Frage ergänzt hat.

   Deshalb zwei Ebenen, und beide sind nötig:
     • Beim Bauen ein sichtbarer Hinweis (diese Funktion)
     • Im Prüf-Tor ein harter Fehler – dort wird entschieden, ob eine Seite
       raus darf (CLAUDE.md Abschnitt 2)

   Der Schlüssel verhindert, dass derselbe Satz einmal je gebauter Seite
   erscheint. Dieses Modul wird pro Build genau einmal geladen, das Set lebt
   also über alle Seiten hinweg.
   ------------------------------------------------------------------------- */
const schonGesagt = new Set<string>();

export function motorHinweis(schluessel: string, was: string, hilfe: string): void {
  if (schonGesagt.has(schluessel)) return;
  schonGesagt.add(schluessel);
  console.warn(`\n  ! ${was}\n    ${hilfe.replace(/\n/g, '\n    ')}\n`);
}
