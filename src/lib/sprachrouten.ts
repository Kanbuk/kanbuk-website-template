/**
 * WELCHE ENGLISCHEN SEITEN GIBT ES WIRKLICH?
 * ===========================================================================
 * Beantwortet aus dem VERZEICHNIS (`src/pages/en/…`), nicht aus einer Liste in
 * der Konfiguration.
 *
 * WARUM DAS DER UNTERSCHIED IST, DER ZÄHLT:
 *
 * Die Sprachverweise (hreflang) hingen bisher an `site.seiten`. Impressum,
 * Datenschutz und AGB stehen dort aber nie – ihre Texte kommen aus
 * `rechtstexte`. Die Datenschutzerklärung gibt es bei jedem zweisprachigen
 * Kunden trotzdem zweimal. Google sah damit zwei unverbundene Seiten mit
 * demselben Inhalt in zwei Sprachen: genau der Fall, für den es hreflang gibt.
 *
 * Eine zweite Liste in der Config hätte dasselbe Problem eine Ebene später:
 * Sie driftet beim nächsten Verschieben einer Datei, und niemand merkt es.
 * Das Verzeichnis driftet nicht. Hilfsseiten wie /danke und /404 bleiben
 * automatisch draußen, weil es sie unter /en/ schlicht nicht gibt.
 *
 * WARUM DIE UMKLAMMERUNG UM `import.meta.glob`:
 * Diese Funktion gibt es NUR im Bau-Werkzeug. Diese Datei kann über die
 * Motor-Bibliothek im Server-Bündel des Formular-Empfängers landen (Vercel
 * baut es als Node-ESM) – dort bricht ein nackter Aufruf beim Einlesen des
 * Moduls ab, und der Formular-Empfänger ist tot, bei grünen Toren. Genau das
 * ist mit derselben Funktion schon dreimal passiert (siehe src/lib/inhalte.ts).
 */

let dateien: Record<string, unknown> = {};
try {
  dateien = import.meta.glob('/src/pages/en/**/*.astro', { eager: true });
} catch {
  /* Kein Bau-Werkzeug (Server-Bündel) – dort wird die Liste nicht gebraucht. */
}

/**
 * Die deutschen Pfade, zu denen es eine englische Fassung gibt.
 * `/src/pages/en/datenschutz.astro` -> `/datenschutz`
 * `/src/pages/en/index.astro`       -> `/`
 */
export const ENGLISCHE_ROUTEN: ReadonlySet<string> = new Set(
  Object.keys(dateien).map((datei) => {
    const ohneRahmen = datei
      .replace('/src/pages/en', '')
      .replace(/\/index\.astro$/, '/')
      .replace(/\.astro$/, '');
    return ohneRahmen === '' ? '/' : ohneRahmen;
  }),
);

/** Gibt es zu diesem deutschen Pfad eine englische Fassung? */
export function hatEnglischeFassung(pfad: string): boolean {
  return ENGLISCHE_ROUTEN.has(pfad);
}
