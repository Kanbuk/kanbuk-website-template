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
      throw new Error(
        `Katalog: Die Kennung "${e.id}" gibt es zweimal (Eintrag ${gesehen.get(e.id)! + 1} und ${i + 1}). ` +
          `Beide bekämen dieselbe Adresse – einer der beiden verschwindet. Bitte in content.config.ts eine eindeutige "id" vergeben.`,
      );
    }
    gesehen.set(e.id, i);

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e.id)) {
      throw new Error(
        `Katalog: Die Kennung "${e.id}" taugt nicht als Adresse. Erlaubt sind Kleinbuchstaben, Ziffern und Bindestriche – ` +
          `zum Beispiel "bmw-320d-touring-2019". Umlaute ausschreiben (ä = ae).`,
      );
    }
  });

  if (k.anfrageFormular && !site.formulare.some((f) => f.id === k.anfrageFormular)) {
    throw new Error(
      `Katalog: anfrageFormular verweist auf "${k.anfrageFormular}", dieses Formular gibt es aber nicht. ` +
        `Bekannt: ${site.formulare.map((f) => f.id).join(', ') || '(keines)'}. ` +
        `Ohne Formular hätte jede Detailseite keinen Anfrageweg.`,
    );
  }

  if (!/^\/[a-z0-9-]+$/.test(k.pfad.replace(/\/$/, ''))) {
    throw new Error(
      `Katalog: pfad ist "${k.pfad}". Erwartet wird ein einfacher Pfad wie "/fahrzeuge" – ` +
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

/** Kleinster und größter Wert eines Zahlenmerkmals – für Schieberegler. */
export function zahlenBereich(merkmal: string): { min: number; max: number } | undefined {
  const zahlen = katalogEintraege()
    .map((e) => (merkmal === 'preis' ? (e.zahlen?.preis ?? e.preis) : e.zahlen?.[merkmal]))
    .filter((z): z is number => typeof z === 'number' && Number.isFinite(z));
  if (zahlen.length === 0) return undefined;
  return { min: Math.min(...zahlen), max: Math.max(...zahlen) };
}
