/**
 * Lässt Node die `.ts`-Dateien des Motors laden – ohne neues npm-Paket.
 *
 * =============================================================================
 *  WOZU
 * =============================================================================
 *  Werkzeuge unter `scripts/` liefen bisher ausschliesslich auf TEXT: Das
 *  Prüf-Tor durchsucht `content.config.ts` mit Mustern, der Vorcheck ebenso.
 *  Fuer eine Pruefung reicht das. Fuer die ERSTBEFUELLUNG des
 *  Redaktionsdienstes nicht: Sie muss den vorhandenen Bestand wirklich lesen -
 *  verschachtelte Eintraege, Zahlen, Listen, Merkmale. Ein Muster-Parser
 *  daneben waere eine zweite, stillschweigend abweichende Fassung der Config;
 *  genau die Sorte Doppelung, an der der Motor schon zweimal aufgelaufen ist.
 *
 *  Node 24 kann TypeScript von sich aus lesen (es entfernt die Typen). Zwei
 *  Dinge kann es nicht, und beide erledigt diese Datei:
 *
 *   1. DIE `.js`-SCHREIBWEISE. Im Motor zeigt ein Import auf `./x.js`, gemeint
 *      ist `x.ts`. Der Buendler von Astro loest das auf, Node sucht die Datei
 *      woertlich und findet nichts.
 *
 *   2. `import.meta.glob`. Das gehoert dem Buendler. `src/lib/inhalte.ts`
 *      benutzt es, um `daten/inhalte.json` einzulesen, WENN es die Datei gibt -
 *      der Normalfall ist, dass es sie nicht gibt. Node bricht mit
 *      „glob is not a function" ab, bevor die Config ueberhaupt entsteht.
 *      Ersetzt wird der Aufruf hier beim LADEN, nicht danach: `import.meta` ist
 *      je Modul eigen, von aussen kommt man nicht daran.
 *
 *  KEIN NEUES PAKET: `module.register` gehoert zu Node. Ein Paket dafuer waere
 *  eine Abhaengigkeit, die ein Klon nie aktualisiert bekommt (CLAUDE.md).
 * =============================================================================
 */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export async function resolve(spezifizierer, kontext, naechster) {
  try {
    return await naechster(spezifizierer, kontext);
  } catch (fehler) {
    /* Nur der eine Fall: `…/x.js` gibt es nicht, `…/x.ts` schon.
       Alles andere faellt unveraendert durch - ein echter Tippfehler im
       Dateinamen soll weiterhin laut scheitern. */
    if (!spezifizierer.endsWith('.js')) throw fehler;
    let ziel;
    try {
      ziel = await naechster(spezifizierer.slice(0, -3) + '.ts', kontext);
    } catch {
      throw fehler; // die urspruengliche Meldung ist die hilfreichere
    }
    if (ziel?.url?.startsWith('file:') && !existsSync(fileURLToPath(ziel.url))) throw fehler;
    return ziel;
  }
}

export async function load(url, kontext, naechster) {
  const ergebnis = await naechster(url, kontext);
  if (!url.endsWith('.ts') || ergebnis.source == null) return ergebnis;
  /* Node liefert den Quelltext je nach Format als Zeichenkette ODER als
     Bytefolge. Wer nur auf `typeof === 'string'` prueft, laesst die halben
     Faelle unveraendert durch – und merkt es erst, wenn der Aufruf spaeter
     doch scheitert. */
  const text =
    typeof ergebnis.source === 'string' ? ergebnis.source : Buffer.from(ergebnis.source).toString('utf-8');
  if (!text.includes('import.meta.glob')) return ergebnis;
  return { ...ergebnis, source: text.replaceAll('import.meta.glob', 'globalThis.__kanbukGlob') };
}

/**
 * Das Gegenstueck zum Ersetzen oben: dieselbe Bedeutung wie beim Buendler,
 * nur auf die eine Verwendung im Motor zugeschnitten (eine JSON-Datei, die es
 * geben kann oder nicht). Mehr soll hier bewusst nicht nachgebaut werden.
 */
export function globVorbereiten(wurzel) {
  globalThis.__kanbukGlob = (muster) => {
    const datei = `${wurzel}/${String(muster).replace(/^\//, '')}`;
    if (!existsSync(datei)) return {};
    return { [String(muster)]: JSON.parse(readFileSync(datei, 'utf-8')) };
  };
}
