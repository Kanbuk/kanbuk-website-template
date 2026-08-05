/**
 * Gepflegte Inhalte – die EINE Stelle, an der von außen gepflegte Werte in die
 * Config kommen.
 *
 * GRUNDSATZ DES BAUSTEINS: **Der Dienst schreibt Dateien, der Motor baut aus
 * Dateien.** Beim Bauen wird nichts abgefragt. Gelesen wird ausschließlich
 * `daten/inhalte.json` – eine ganz normale, eingecheckte Datei im Projekt.
 * Das hat drei Folgen, die alle wichtig sind:
 *
 *   1. Ein Ausfall des Redaktionsdienstes kann keine Veröffentlichung
 *      aufhalten. Auch keine, die mit den Inhalten nichts zu tun hat.
 *   2. Ein gekündigtes Konto nimmt der Website nichts weg – Texte UND Fotos
 *      liegen im Projekt.
 *   3. Jeder Stand ist nachvollziehbar, weil er als Änderung im Projekt steht.
 *
 * WARUM DIE ÜBERLAGERUNG GENERISCH IST (und nicht Feld für Feld geschrieben):
 * In einem Kundenprojekt bot die Eingabemaske zehn Impressumsfelder an,
 * verdrahtet waren sechs. Vier ließen sich ändern, ohne dass sich je etwas
 * änderte – und eingetragene Feiertage erschienen überhaupt nie, weil die
 * erzeugte Datei zwar importiert, aber nirgends benutzt wurde. Für den Betrieb
 * ist das der schlimmste Fall: Er ändert seine Anschrift, sieht
 * „veröffentlicht", und die Website zeigt weiter die alte. Bei Pflichtangaben
 * nach § 5 ECG ist das ein Rechtsrisiko.
 *
 * Deshalb gibt es hier bewusst KEINE Feldliste, an der etwas fehlen könnte.
 * Was in der Datei steht, wird überlagert – Punkt. Die Liste der pflegbaren
 * Felder steht einmal in redaktion/felder.mjs und erzeugt von dort aus die
 * Eingabemaske und die Abfrage.
 */
import type { SiteConfig, KatalogEintrag } from '../../content.config.js';

/**
 * Was in der Datei stehen darf. Alles optional – gepflegt wird, was gepflegt
 * wird; der Rest bleibt, wie er in content.config.ts steht.
 */
export interface GepflegteInhalte {
  /** Wann zuletzt geholt – erscheint im Prüf-Bericht. */
  erzeugt?: string;
  /** Woher, z. B. 'sanity/abc123/production'. */
  quelle?: string;
  /** Teilbaum von SiteConfig, Feld für Feld überlagert. */
  betrieb?: Record<string, unknown>;
  rechtstexte?: Record<string, unknown>;
  /** Ersetzt katalog.eintraege vollständig. */
  katalog?: KatalogEintrag[];
}

/* WARUM `import.meta.glob` UND NICHT EIN NORMALER IMPORT:
   Die Datei ist der Normalfall NICHT vorhanden – ein Klon ohne
   Redaktionssystem hat sie nie. `import.meta.glob` liefert dann ein leeres
   Objekt, statt den Build mit „Modul nicht gefunden" abzubrechen.

   UND WARUM DER AUFRUF UMKLAMMERT IST – DER SERVER KENNT DIE FUNKTION NICHT.
   ===========================================================================
   Diese Datei hängt über `content.config.ts` mit im Server-Bündel des
   Formular-Empfängers (`api/contact.ts`). Vercel baut den als Node-ESM, und
   dort ist `import.meta.glob` schlicht nicht vorhanden: Das Modul bricht beim
   EINLESEN ab mit „(intermediate value).glob is not a function".

   Folge: Der Empfänger ist tot, die Seite baut trotzdem, alle Tore bleiben
   grün – und weil die Vorschau bewusst nichts abschickt, fällt es erst nach
   dem Live-Gang auf, dadurch dass wochenlang keine Anfrage kommt. In einem
   Kundenprojekt ist genau das dreimal passiert und blieb jedes Mal unbemerkt.

   Die Umklammerung ist deshalb keine Vorsicht, sondern die Bedingung dafür,
   dass Redaktionssystem und Formular nebeneinander existieren können. Im
   Bau-Werkzeug läuft der Aufruf normal; im Server fällt er auf ein leeres
   Objekt zurück – und der Server braucht die gepflegten Inhalte gar nicht,
   er verschickt nur Mails.

   `npm run check` beanstandet diesen Aufruf in der Importkette der Config,
   `npm run endpunkt` ruft den Empfänger zusätzlich wirklich an. */
let gefunden: Record<string, GepflegteInhalte> = {};
try {
  gefunden = import.meta.glob<GepflegteInhalte>('/daten/inhalte.json', {
    import: 'default',
    eager: true,
  });
} catch {
  /* Kein Bau-Werkzeug – dann gibt es hier auch keine gepflegten Inhalte. */
}

const datei: GepflegteInhalte | undefined = Object.values(gefunden)[0];

/** Ein einfaches Objekt (kein Array, kein null) – dann wird tiefer überlagert. */
function istObjekt(w: unknown): w is Record<string, unknown> {
  return typeof w === 'object' && w !== null && !Array.isArray(w);
}

/**
 * Überlagert `neu` über `alt`: Objekte werden zusammengeführt, alles andere
 * ersetzt. Listen ersetzen bewusst vollständig – bei Öffnungszeiten oder
 * Katalogeinträgen wäre ein Zusammenmischen sinnlos und gefährlich (gelöschte
 * Zeilen kämen wieder).
 */
function ueberlagere<T>(alt: T, neu: unknown): T {
  if (!istObjekt(neu)) return (neu === undefined ? alt : (neu as T));
  const ergebnis: Record<string, unknown> = istObjekt(alt) ? { ...alt } : {};
  for (const [schluessel, wert] of Object.entries(neu)) {
    if (wert === undefined || wert === null) continue;
    ergebnis[schluessel] = istObjekt(wert)
      ? ueberlagere(ergebnis[schluessel], wert)
      : wert;
  }
  return ergebnis as T;
}

/**
 * Prüft einen Katalogeintrag auf das Nötigste.
 *
 * WARUM: Die Datei entsteht aus Eingaben eines Laien. Ein Eintrag ohne Kennung
 * hätte keine Adresse, einer ohne Titel keine Überschrift – beides würde die
 * Seite kaputtbauen. Ein fehlerhafter Eintrag fällt deshalb raus, statt alles
 * mitzureißen; die übrigen bleiben online.
 */
function eintragTaugt(e: unknown): e is KatalogEintrag {
  if (!istObjekt(e)) return false;
  const id = e.id;
  const titel = e.titel;
  if (typeof id !== 'string' || !/^[a-z0-9-]+$/.test(id)) return false;
  if (typeof titel !== 'string' || titel.trim() === '') return false;
  return true;
}

/** Liegt eine gepflegte Fassung vor? */
export function wirdGepflegt(): boolean {
  return datei !== undefined;
}

/** Herkunftszeile für den Bericht („Stand vom …"). */
export function inhalteStand(): string | undefined {
  if (!datei) return undefined;
  return [datei.quelle, datei.erzeugt].filter(Boolean).join(' · ') || undefined;
}

/**
 * Legt die gepflegten Werte über die Config. Wird EINMAL in aufloesen()
 * aufgerufen – es gibt keinen zweiten Weg, damit keiner vergessen werden kann.
 */
export function mitGepflegtenInhalten(s: SiteConfig): SiteConfig {
  if (!datei) return s;

  let ergebnis: SiteConfig = s;

  if (datei.betrieb) ergebnis = { ...ergebnis, betrieb: ueberlagere(ergebnis.betrieb, datei.betrieb) };
  if (datei.rechtstexte) {
    ergebnis = { ...ergebnis, rechtstexte: ueberlagere(ergebnis.rechtstexte, datei.rechtstexte) };
  }

  if (Array.isArray(datei.katalog) && ergebnis.katalog) {
    const brauchbar = datei.katalog.filter(eintragTaugt);
    const aussortiert = datei.katalog.length - brauchbar.length;
    if (aussortiert > 0) {
      console.warn(
        `[inhalte] ${aussortiert} gepflegte(r) Eintrag/Einträge ohne gültige Kennung oder ohne Titel – übersprungen.\n` +
          `          Die Kennung darf nur Kleinbuchstaben, Ziffern und Bindestriche enthalten.`,
      );
    }
    // Leere Antwort überschreibt nie: Sonst löscht ein Aussetzer beim Dienst
    // den gesamten Bestand, und die Seite steht leer da.
    if (brauchbar.length > 0) {
      ergebnis = { ...ergebnis, katalog: { ...ergebnis.katalog, eintraege: brauchbar } };
    }
  }

  return ergebnis;
}
