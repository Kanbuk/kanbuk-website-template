/**
 * KATALOG-HELFER – die Mechanik hinter Listen mit Detailseiten.
 *
 * Der Motor liefert Adressen, Datenattribute und Preisformat; das Design
 * schreibt die Karte, wie sie aussehen soll. Typische Verwendung in einer
 * Übersichts-Komponente:
 *
 *   ---
 *   import { katalogEintraege, katalogAdresse, katalogAttribute, preisText } from '../lib/katalog';
 *   const eintraege = katalogEintraege();
 *   ---
 *   <div data-filter data-filter-kombi>
 *     …Filterknöpfe des Designs…
 *     <div data-filter-ziel>
 *       {eintraege.map((e) => (
 *         <article class="karte" {...katalogAttribute(e)}>
 *           <a href={katalogAdresse(e)}>{e.titel}</a>
 *           <p>{preisText(e)}</p>
 *         </article>
 *       ))}
 *     </div>
 *   </div>
 *
 * `katalogAttribute` setzt `data-katalog-eintrag` und alle Filter-/Zahlenwerte
 * als `data-<name>`. Damit greifen Filter, Sortierung und Merkliste ohne
 * weiteres Zutun – genau diese Verdrahtung geht sonst jedes Mal schief.
 */
import { site, type KatalogEintrag } from '../../content.config';
import { motorFehler } from './motorfehler';

/** Der konfigurierte Katalog – oder undefined, wenn keiner gepflegt ist. */
export function katalog() {
  return site.katalog;
}

/**
 * Prüft den Katalog beim Bauen und bricht mit einer klaren Ansage ab.
 *
 * Diese drei Fehler wären sonst STILL – die Seite entsteht, sieht richtig aus
 * und ist trotzdem kaputt:
 *
 *  1. Zwei Einträge mit derselben `id`. Beide wollen dieselbe Adresse; der
 *     zweite überschreibt den ersten. Ein Fahrzeug verschwindet spurlos, und
 *     niemand merkt es, weil die Liste beide zeigt.
 *  2. Eine `id` mit Leerzeichen, Umlauten oder Großbuchstaben. Daraus wird
 *     eine Adresse wie `/fahrzeuge/BMW 320d (2019)` – die verschickt niemand
 *     per WhatsApp, ohne dass sie unterwegs zerbricht.
 *  3. `anfrageFormular` zeigt auf ein Formular, das es nicht gibt. Die
 *     Detailseite hätte dann einfach keinen Anfrageweg – der teuerste stille
 *     Fehler von allen, weil genau dort verkauft wird.
 */
export function katalogPruefen(): void {
  const k = site.katalog;
  if (!k) return;

  const gesehen = new Map<string, number>();
  k.eintraege.forEach((e, i) => {
    if (gesehen.has(e.id)) {
      motorFehler(
        `Katalog: Die Kennung "${e.id}" gibt es zweimal (Eintrag ${gesehen.get(e.id)! + 1} und ${i + 1}). ` +
          `Beide bekämen dieselbe Adresse – einer der beiden verschwindet spurlos.`,
        `In content.config.ts unter "katalog" bei einem der beiden Einträge eine andere "id" eintragen.`,
      );
    }
    gesehen.set(e.id, i);

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e.id)) {
      motorFehler(
        `Katalog: Die Kennung "${e.id}" taugt nicht als Adresse.`,
        `Erlaubt sind Kleinbuchstaben, Ziffern und Bindestriche – zum Beispiel "modell-320-touring-2019". ` +
          `Umlaute ausschreiben (ä = ae), keine Leerzeichen. Zu ändern in content.config.ts unter "katalog".`,
      );
    }
  });

  if (k.anfrageFormular && !site.formulare.some((f) => f.id === k.anfrageFormular)) {
    motorFehler(
      `Katalog: anfrageFormular verweist auf "${k.anfrageFormular}", dieses Formular gibt es aber nicht. ` +
        `Ohne Formular hätte jede Detailseite keinen Anfrageweg – genau dort wird verkauft.`,
      `In content.config.ts unter "katalog" -> anfrageFormular einen dieser Namen eintragen: ` +
        `${site.formulare.map((f) => f.id).join(', ') || '(es ist noch kein Formular angelegt)'}.`,
    );
  }

  if (!/^\/[a-z0-9-]+$/.test(k.pfad.replace(/\/$/, ''))) {
    motorFehler(
      `Katalog: pfad ist "${k.pfad}" – daraus lässt sich keine Adresse bauen.`,
      `In content.config.ts unter "katalog" -> pfad etwas wie "/leistungen" eintragen: ` +
        `mit führendem Schrägstrich, ohne abschließenden, in Kleinbuchstaben.`,
    );
  }
}

/**
 * Alle Einträge. `nurVerfuegbare` blendet Verkauftes aus der LISTE aus – die
 * Detailseite bleibt trotzdem erreichbar, damit ein alter Google-Treffer nicht
 * auf einen Fehler läuft.
 */
export function katalogEintraege(nurVerfuegbare = true): KatalogEintrag[] {
  const eintraege = site.katalog?.eintraege ?? [];
  return nurVerfuegbare ? eintraege.filter((e) => e.verfuegbar !== false) : eintraege;
}

/** Adresse der Detailseite, z. B. '/fahrzeuge/bmw-320d'. */
export function katalogAdresse(eintrag: KatalogEintrag | string): string {
  const basis = (site.katalog?.pfad ?? '').replace(/\/$/, '');
  const id = typeof eintrag === 'string' ? eintrag : eintrag.id;
  return `${basis}/${id}`;
}

/**
 * Die data-Attribute für eine Katalogkarte. Direkt in ein Element spreaden:
 * `<article {...katalogAttribute(e)}>`.
 */
export function katalogAttribute(eintrag: KatalogEintrag): Record<string, string> {
  const attr: Record<string, string> = { 'data-katalog-eintrag': eintrag.id };
  for (const [name, wert] of Object.entries(eintrag.filter ?? {})) {
    attr[`data-${name}`] = String(wert);
  }
  for (const [name, wert] of Object.entries(eintrag.zahlen ?? {})) {
    attr[`data-${name}`] = String(wert);
  }
  // Der Preis ist fast immer Sortier- und Reglerkriterium; ihn hier automatisch
  // mitzugeben erspart, ihn in `zahlen` zu wiederholen (und zu vergessen).
  if (eintrag.preis !== undefined && attr['data-preis'] === undefined) {
    attr['data-preis'] = String(eintrag.preis);
  }
  return attr;
}

/**
 * Preis als Text. Ohne Preis „auf Anfrage", bei nicht verfügbaren Einträgen
 * der `statusText`.
 *
 * Bewusst 'de-DE' statt 'de-AT': Für Österreich liefert die Zeichensatz-
 * Datenbank ein schmales Leerzeichen als Tausendertrenner („18 900 €"),
 * österreichische Preisschilder schreiben aber den Punkt („18.900 €").
 */
export function preisText(eintrag: KatalogEintrag): string {
  if (eintrag.verfuegbar === false && eintrag.statusText) return eintrag.statusText;
  if (eintrag.preis === undefined) return 'auf Anfrage';
  const waehrung = site.katalog?.waehrung ?? 'EUR';
  const zahl = eintrag.preis.toLocaleString('de-DE', {
    style: 'currency',
    currency: waehrung,
    minimumFractionDigits: Number.isInteger(eintrag.preis) ? 0 : 2,
  });
  return eintrag.preisHinweis ? `${zahl} ${eintrag.preisHinweis}` : zahl;
}

/**
 * Alle vorkommenden Werte eines Filtermerkmals, alphabetisch – Grundlage für
 * die Filterknöpfe, damit dort nie eine Auswahl steht, die null Treffer hat.
 */
export function filterWerte(merkmal: string): string[] {
  const werte = new Set<string>();
  for (const e of katalogEintraege()) {
    const wert = e.filter?.[merkmal];
    if (wert) werte.add(wert);
  }
  return [...werte].sort((a, b) => a.localeCompare(b, 'de'));
}

/**
 * Sichtbare Beschriftung für ein Merkmal oder einen Merkmalswert.
 *
 * Die Schlüssel im Katalog sind Adressbausteine (`gruen`, `km`) – auf der
 * Seite gehört „Grün" und „Kilometerstand". Was in `katalog.beschriftungen`
 * steht, gewinnt; sonst wird der Schlüssel großgeschrieben.
 */
export function beschriftung(schluessel: string): string {
  const eigen = site.katalog?.beschriftungen?.[schluessel];
  if (eigen) return eigen;
  return schluessel.charAt(0).toUpperCase() + schluessel.slice(1);
}

/* ===========================================================================
 *  DIE ABLEITUNGEN – hier, nicht in der Komponente
 * ===========================================================================
 *  `KatalogListe.astro` ist ein BEISPIEL, keine Vorschrift. Bei einem echten
 *  Design weicht nicht nur die Karte ab, sondern die ganze Filterleiste:
 *  Position, Reihenfolge, Bedienart, Beschriftungen. In einem Kundenprojekt
 *  wurde die Komponente deshalb gar nicht benutzt und die Liste von Hand neu
 *  gebaut – rund 700 Zeilen. Damit erbt dieser Klon KEINE Motor-Korrektur mehr;
 *  der Regler-Fehler weiter unten musste dort zweimal repariert werden.
 *
 *  Deshalb stehen die Ableitungen ab jetzt HIER. Wer eigenes Markup schreibt,
 *  ruft sie auf und kommt mit ein paar Dutzend Zeilen aus – und bekommt jede
 *  spätere Korrektur automatisch mit.
 * ======================================================================== */

/**
 * Die Filtergruppen: je Merkmal die vorkommenden Werte, in der Reihenfolge
 * ihres ersten Auftretens in der Config (nicht alphabetisch – so folgt die
 * Leiste der Pflege-Reihenfolge).
 *
 * Gruppen mit nur einem Wert fallen weg: Ein Knopf, der immer alles zeigt,
 * ist kein Filter.
 */
export function filterGruppen(): { name: string; werte: string[] }[] {
  const merkmale: string[] = [];
  for (const e of katalogEintraege()) {
    for (const k of Object.keys(e.filter ?? {})) if (!merkmale.includes(k)) merkmale.push(k);
  }
  return merkmale
    .map((name) => ({ name, werte: filterWerte(name) }))
    .filter((g) => g.werte.length > 1);
}

/**
 * Die Schieberegler: je Zahlenmerkmal Bereich und Schrittweite.
 *
 * DIE OBERGRENZE WIRD AUFGERUNDET, und das ist kein Schönheitsfehler:
 * Ein `<input type="range">` erlaubt nur Werte auf dem Raster
 * `min + n × step`. Liegt der echte Höchstwert nicht darauf, rundet der
 * Browser beim Laden STILL AB – der Regler steht dann unter dem Maximum, und
 * der teuerste bzw. größte Eintrag ist ab der ersten Sekunde ausgefiltert.
 * In einem Kundenprojekt fehlte so ein Fahrzeug in der Liste, ohne dass es
 * jemandem auffiel; gefunden hat es erst die Bedien-Prüfung, die die
 * Trefferzahl je Filterwert nachrechnet.
 */
export function regler(): { name: string; min: number; max: number; step: number }[] {
  const namen: string[] = [];
  for (const e of katalogEintraege()) {
    for (const k of Object.keys(e.zahlen ?? {})) if (!namen.includes(k)) namen.push(k);
  }
  if (katalogEintraege().some((e) => e.preis !== undefined) && !namen.includes('preis')) {
    namen.unshift('preis');
  }

  const raus: { name: string; min: number; max: number; step: number }[] = [];
  for (const name of namen) {
    const bereich = zahlenBereich(name);
    // Sind alle Werte gleich, gäbe es nichts zu schieben.
    if (!bereich || bereich.max <= bereich.min) continue;
    const step = Math.max(1, Math.round((bereich.max - bereich.min) / 50));
    // Aufs nächste Raster-Vielfache AUFrunden – siehe Erklärung oben.
    const max = bereich.min + Math.ceil((bereich.max - bereich.min) / step) * step;
    raus.push({ name, min: bereich.min, max, step });
  }
  return raus;
}

/**
 * Die Sortier-Auswahl: je Zahlenmerkmal auf- und absteigend.
 * Der Wert ist `<merkmal>-auf` / `<merkmal>-ab`, so erwartet es der
 * Filter-Baustein.
 */
export function sortierOptionen(): { wert: string; merkmal: string; richtung: 'auf' | 'ab' }[] {
  return regler().flatMap((r) => [
    { wert: `${r.name}-auf`, merkmal: r.name, richtung: 'auf' as const },
    { wert: `${r.name}-ab`, merkmal: r.name, richtung: 'ab' as const },
  ]);
}

/** Kleinster und größter Wert eines Zahlenmerkmals – für Schieberegler. */
export function zahlenBereich(merkmal: string): { min: number; max: number } | undefined {
  const zahlen = katalogEintraege()
    .map((e) => (merkmal === 'preis' ? (e.zahlen?.preis ?? e.preis) : e.zahlen?.[merkmal]))
    .filter((z): z is number => typeof z === 'number' && Number.isFinite(z));
  if (zahlen.length === 0) return undefined;
  return { min: Math.min(...zahlen), max: Math.max(...zahlen) };
}
