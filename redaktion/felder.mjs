/**
 * Die EINE Feldliste des Redaktions-Bausteins.
 *
 * WOZU: Sobald ein Betrieb seine Inhalte selbst pflegt, gibt es drei Stellen,
 * die dieselben Felder kennen müssen:
 *
 *   1. die Eingabemaske, die der Betrieb im Browser sieht
 *   2. die Abfrage, die diese Werte abholt
 *   3. die Website, die sie anzeigt
 *
 * Laufen die drei auseinander, merkt es niemand: Der Betrieb ändert seine
 * Anschrift, sieht „veröffentlicht" – und die Website zeigt weiter die alte.
 * Genau das ist in einem Kundenprojekt passiert (zehn angebotene Felder, sechs
 * angezeigte), und es ist der schlimmste Fehlertyp, weil alles grün aussieht.
 *
 * Deshalb steht die Liste EINMAL hier. Die Maske entsteht daraus
 * (`npm run maske`), die Abfrage entsteht daraus (`npm run inhalte`), und die
 * Website liest schlicht alles, was in der erzeugten Datei steht (siehe
 * src/lib/inhalte.ts – dort gibt es bewusst KEINE zweite Feldliste, sondern
 * eine Überlagerung Feld für Feld).
 *
 * ÄNDERN: Feld hier ergänzen → `npm run maske` → im Dienst veröffentlichen.
 * Ein Feld, das der Motor nicht kennt, meldet das Prüf-Tor.
 */

/**
 * Ein Feld.
 *
 *   pfad   Wohin der Wert in der Config gehört, mit Punkten:
 *          'betrieb.adresse.strasse'. Der Motor überlagert genau dort.
 *   titel  Was der Betrieb in seiner Maske liest. Deutsch, ohne Fachbegriff.
 *   typ    Siehe TYPEN unten.
 *   hinweis  Erklärzeile unter dem Feld. Immer ausfüllen, wenn das Format zählt.
 */

/** Die erlaubten Feldarten und ihre Entsprechung im Dienst (Sanity). */
export const TYPEN = {
  text: { sanity: 'string' },
  textblock: { sanity: 'text' },
  zahl: { sanity: 'number' },
  'ja-nein': { sanity: 'boolean' },
  'liste-text': { sanity: 'array-string' },
  bilder: { sanity: 'array-image' },
  zeiten: { sanity: 'array-oeffnungszeit' },
  sonderzeiten: { sanity: 'array-sonderzeit' },
  merkmale: { sanity: 'array-merkmal' },
  paare: { sanity: 'array-paar' },
};

/**
 * BETRIEBSDATEN – das, was sich ohne Umbau ändert.
 *
 * Bewusst NICHT dabei: Farben, Schriften, Seitenstruktur, Rechtstexte-Fließtext.
 * Das sind Eingriffe ins Design bzw. ins Recht; sie gehören in die Hand
 * dessen, der die Seite betreut, nicht in eine Eingabemaske.
 */
export const BETRIEB = [
  /* Musterform mit Nullen, wie überall sonst im Template. Hier stand vorher
     eine aufsteigende Ziffernfolge – die sieht wie eine echte Nummer aus, und
     die Kundenfrei-Prüfung hat sie beim allerersten Lauf bemängelt, den sie
     über diese Datei überhaupt machen konnte (redaktion/ stand nicht in der
     alten Handliste). Kein Beispiel im Kommentar wiederholen: Die Prüfung
     unterscheidet Kommentar und Wert nicht – zu Recht. */
  { pfad: 'betrieb.telefon', titel: 'Telefonnummer', typ: 'text', hinweis: 'International: +43 1 000 00 00' },
  { pfad: 'betrieb.email', titel: 'E-Mail-Adresse', typ: 'text' },
  { pfad: 'betrieb.claim', titel: 'Slogan', typ: 'text', hinweis: 'Ein kurzer Satz unter dem Namen.' },
  {
    pfad: 'betrieb.kurzbeschreibung',
    titel: 'Kurzbeschreibung',
    typ: 'textblock',
    hinweis: '1–2 Sätze. Erscheint auch in der Google-Ergebnisliste.',
  },
  { pfad: 'betrieb.adresse.strasse', titel: 'Straße und Hausnummer', typ: 'text' },
  { pfad: 'betrieb.adresse.plz', titel: 'Postleitzahl', typ: 'text' },
  { pfad: 'betrieb.adresse.ort', titel: 'Ort', typ: 'text' },
  {
    pfad: 'betrieb.oeffnungszeiten',
    titel: 'Öffnungszeiten',
    typ: 'zeiten',
    hinweis: 'Eine Zeile je Tag oder Tagesgruppe.',
  },
  {
    pfad: 'betrieb.sonderzeiten',
    titel: 'Feiertage und Betriebsurlaub',
    typ: 'sonderzeiten',
    hinweis: 'Abweichungen vom Wochenrhythmus. Werden auch an Google gemeldet.',
  },
];

/**
 * IMPRESSUMSDATEN.
 *
 * WARUM DIESE ÜBERHAUPT IN DIE MASKE DÜRFEN: Es sind Pflichtangaben nach § 5
 * ECG und § 25 Mediengesetz. Ändert sich der Firmensitz und die Website zeigt
 * weiter den alten, ist das nicht nur unschön, sondern angreifbar. Wer sie
 * ändern kann, muss sie deshalb auch wirklich auf der Seite sehen – genau das
 * war im Kundenprojekt bei vier von zehn Feldern nicht der Fall.
 */
export const RECHT = [
  { pfad: 'rechtstexte.firmenwortlaut', titel: 'Firmenwortlaut', typ: 'text', hinweis: 'Genau wie im Firmenbuch.' },
  { pfad: 'rechtstexte.rechtsform', titel: 'Rechtsform', typ: 'text', hinweis: 'z. B. Einzelunternehmen, GmbH' },
  { pfad: 'rechtstexte.adresse', titel: 'Anschrift laut Firmenbuch', typ: 'text' },
  { pfad: 'rechtstexte.uid', titel: 'UID-Nummer', typ: 'text', hinweis: 'z. B. ATU00000000' },
  { pfad: 'rechtstexte.firmenbuchnummer', titel: 'Firmenbuchnummer', typ: 'text' },
  { pfad: 'rechtstexte.firmenbuchgericht', titel: 'Firmenbuchgericht', typ: 'text' },
  { pfad: 'rechtstexte.gewerbe', titel: 'Gewerbeberechtigung', typ: 'text' },
  { pfad: 'rechtstexte.aufsichtsbehoerde', titel: 'Aufsichtsbehörde', typ: 'text' },
  {
    pfad: 'rechtstexte.unternehmensgegenstand',
    titel: 'Unternehmensgegenstand',
    typ: 'text',
    hinweis: 'Was der Betrieb tut – Pflichtangabe nach § 25 Mediengesetz.',
  },
];

/**
 * KATALOG-EINTRÄGE – der eigentliche Grund für ein Redaktionssystem.
 *
 * Die Felder sind die des Motors (siehe KatalogEintrag in content.config.ts).
 * Was je Betrieb verschieden ist, sind nur die Merkmale unter `filter` und
 * `zahlen` – die entstehen beim Erzeugen der Maske aus den vorhandenen
 * Einträgen und den Beschriftungen der Config.
 */
export const KATALOG = [
  {
    pfad: 'id',
    titel: 'Kennung',
    typ: 'text',
    pflicht: true,
    hinweis: 'Wird zur Internetadresse. Nach dem Live-Gang NICHT mehr ändern – sonst ist der Google-Treffer tot.',
  },
  { pfad: 'titel', titel: 'Titel', typ: 'text', pflicht: true },
  { pfad: 'kurz', titel: 'Ein Satz für die Übersicht', typ: 'text' },
  { pfad: 'beschreibung', titel: 'Beschreibung', typ: 'textblock', hinweis: 'Absätze mit einer Leerzeile trennen.' },
  { pfad: 'preis', titel: 'Preis', typ: 'zahl', hinweis: 'Nur die Zahl, ohne €. Leer lassen = „auf Anfrage".' },
  { pfad: 'preisHinweis', titel: 'Zusatz beim Preis', typ: 'text', hinweis: 'z. B. inkl. USt.' },
  { pfad: 'bilder', titel: 'Fotos', typ: 'bilder', hinweis: 'Das erste Foto ist das Hauptbild.' },
  { pfad: 'bildAlt', titel: 'Bildbeschreibungen', typ: 'liste-text', hinweis: 'Für Blinde und für Google. Gleiche Reihenfolge wie die Fotos.' },
  { pfad: 'merkmale', titel: 'Merkmalstabelle', typ: 'merkmale' },
  { pfad: 'verfuegbar', titel: 'Verfügbar', typ: 'ja-nein', hinweis: 'Aus = raus aus der Liste. Die Seite bleibt erreichbar, damit alte Google-Treffer nicht ins Leere laufen.' },
  { pfad: 'statusText', titel: 'Hinweis statt Preis', typ: 'text', hinweis: 'z. B. bereits verkauft' },
  { pfad: 'filter', titel: 'Merkmale zum Filtern', typ: 'paare' },
  { pfad: 'zahlen', titel: 'Merkmale zum Sortieren', typ: 'paare' },
];

/** Alles, was in die Config zurückfließt – ohne den Katalog (eigene Liste). */
export const KONFIG_FELDER = [...BETRIEB, ...RECHT];

/** Hilfe: Wert an einem Punkt-Pfad lesen. */
export function lies(objekt, pfad) {
  return pfad.split('.').reduce((o, t) => (o == null ? undefined : o[t]), objekt);
}

/** Hilfe: Wert an einem Punkt-Pfad setzen (legt Zwischenobjekte an). */
export function setze(objekt, pfad, wert) {
  const teile = pfad.split('.');
  const letzter = teile.pop();
  let ziel = objekt;
  for (const t of teile) {
    if (typeof ziel[t] !== 'object' || ziel[t] === null) ziel[t] = {};
    ziel = ziel[t];
  }
  ziel[letzter] = wert;
}
