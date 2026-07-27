/**
 * =============================================================================
 *  content.config.ts  –  DIE MOTOR-SCHNITTSTELLE
 * =============================================================================
 *  Hier stehen die Daten, die der MOTOR braucht, um seine Arbeit zu tun:
 *  Meta-Tags, JSON-LD, Formulare, Rechtstexte, demo/live-Logik.
 *
 *  WAS HIER *NICHT* STEHT:
 *  Layout, Aufbau und Gestaltung. Das kommt aus dem Design (Claude Design)
 *  und lebt in den Seiten-Komponenten unter src/components/.
 *
 *  Faustregel: Steht es im Browser-Tab, in Google, in einer E-Mail oder im
 *  Impressum -> hierher. Sieht man es auf der Seite -> Design.
 *
 *  Ausnahme mit Absicht: Tabellarische Daten, die sich oft ändern
 *  (Speisekarte, Preisliste) stehen hier bzw. in daten/ – damit eine
 *  Preisänderung eine Ein-Datei-Änderung bleibt.
 * =============================================================================
 */

import { BRANCHE_JSONLD_TYP } from './src/lib/branchen.js';

// ---------------------------------------------------------------------------
//  Auswahl-Werte
// ---------------------------------------------------------------------------

/** Branche – steuert NUR den Schema.org-Typ (SEO). Kein Design. */
export type Branche =
  | 'gastro'
  | 'cafe'
  | 'bar'
  | 'beauty'
  | 'friseur'
  | 'handwerk'
  | 'dienstleistung'
  | 'praxis'
  | 'zahnarzt'
  | 'physio'
  | 'studio'
  | 'kfz'
  | 'handel'
  | 'sonstiges';

/** demo = Vorschau (kein Index, Formular aus). live = öffentlich, alles scharf. */
export type Mode = 'demo' | 'live';

/** Ansprache – betrifft die Motor-Texte (Formular). Kundentexte kommen aus dem Design. */
export type Ansprache = 'du' | 'sie';

/**
 * Unterstützte Sprachen. 'de' ist immer die Hauptsprache.
 * WICHTIG: 'en' NUR eintragen, wenn die englischen Seiten wirklich als Routen
 * gebaut werden (src/pages/en/…) – sonst zeigen die hreflang-Verweise ins
 * Leere. Das Prüf-Tor kontrolliert genau das.
 */
export type Sprache = 'de' | 'en';

// ---------------------------------------------------------------------------
//  Design-Tokens – die Nahtstelle zwischen Claude Design und Motor
// ---------------------------------------------------------------------------

/**
 * Farben aus dem Design. Drei sind Pflicht, weil der Motor sich darauf verlässt;
 * beliebige weitere frei benennbar -> werden zu --farbe-<name>.
 *
 * Beispiel (dunkler Auftritt):
 *   { hintergrund: '#14120f', text: '#f0ece4', primaer: '#b8763a',
 *     akzent: '#3a8f86', flaeche: '#1c1916' }
 */
export interface DesignFarben {
  /** Seitenhintergrund. */
  hintergrund: string;
  /** Standard-Textfarbe. */
  text: string;
  /** Hauptakzent – auch für Fokus-Ringe und theme-color. */
  primaer: string;
  [name: string]: string;
}

/**
 * Schriften aus dem Design. Die Familien müssen lokal vorliegen –
 * `npm run schrift -- --familie "<Name>"` lädt sie herunter und bettet sie ein.
 * NIE eine CDN-Schrift verlinken (externe Requests sind verboten).
 */
export interface DesignSchriften {
  ueberschrift: string;
  text: string;
  [name: string]: string;
}

/**
 * Wie sich die Seite beim Scrollen anfühlt. Variiert NUR die bestehende
 * Einblende-Animation (Dauer, Distanz, Kurve) – kein zusätzliches JS,
 * „Bewegung reduzieren" des Besuchers gewinnt immer.
 *   aus      – keine Einblendungen
 *   dezent   – kaum merklich (Standard)
 *   lebendig – schneller, spürbarer Schwung (Studio, Bar)
 *   elegant  – langsamer, weicher (Beauty, Fine Dining)
 */
export type AnimationsPreset = 'aus' | 'dezent' | 'lebendig' | 'elegant';

export interface Design {
  farben: DesignFarben;
  schriften: DesignSchriften;
  /** z. B. '0px', '8px' – aus dem Design übernommen. */
  radius?: string;
  /** Siehe AnimationsPreset. Weglassen = 'dezent'. */
  animation?: AnimationsPreset;
}

// ---------------------------------------------------------------------------
//  Seiten & Navigation
// ---------------------------------------------------------------------------

/**
 * Eine echte Unterseite mit eigener URL. Jede Seite hat eigene Meta-Angaben –
 * das ist der ganze Grund, warum wir keine Onepager mehr bauen.
 */
export interface Seite {
  /** Route, z. B. '/' oder '/speisekarte'. Ohne Sprach-Präfix. */
  pfad: string;
  /** Beschriftung in der Navigation. */
  navTitel: string;
  /** <title> der Seite. Ohne Betriebsnamen – der wird angehängt. */
  metaTitel: string;
  /** <meta name="description"> – 120–160 Zeichen, eigenständig je Seite. */
  metaBeschreibung: string;
  /** In der Hauptnavigation zeigen? Default: true. */
  inNavigation?: boolean;
  /**
   * Steht die Preisliste/Speisekarte auf DIESER Seite?
   *
   * Steuert, wo die strukturierten Speisekarten-Daten für Google ausgegeben
   * werden. Ohne die Angabe hingen sie an jeder Seite – auch am Impressum und
   * an der Datenschutzerklärung, wo kein einziges Gericht sichtbar ist. Google
   * verlangt, dass eine Auszeichnung den auf dieser Seite sichtbaren Inhalt
   * beschreibt. Ist bei keiner Seite gesetzt, gilt die Startseite.
   */
  zeigtPreisliste?: boolean;
  /** Stehen die häufigen Fragen auf DIESER Seite? (steuert das FAQ-Schema) */
  zeigtFaq?: boolean;
  /** Stehen die Stellenanzeigen auf DIESER Seite? (steuert das Jobs-Schema) */
  zeigtStellen?: boolean;
  /** Eigenes OG-Bild für DIESE Seite – Dateiname in **public/** (nicht fotos/!),
      z. B. 'og-speisekarte.jpg'. Erzeugen mit:
      npm run og -- --bild fotos/<foto>.jpg --ziel public/og-<seite>.jpg
      Weglassen = globales OG-Bild (public/og.jpg). */
  ogBild?: string;
}

// ---------------------------------------------------------------------------
//  Betriebsdaten – Grundlage für JSON-LD, Impressum, Kontakt
// ---------------------------------------------------------------------------

export interface Oeffnungszeit {
  /** z. B. 'Mo–Fr', 'Samstag' */
  tag: string;
  /** z. B. '08:00–18:00' oder 'geschlossen' */
  zeit: string;
  /** Maschinenlesbar für Google, Kurzcodes: Mo Tu We Th Fr Sa Su.
      (Werden beim Bauen automatisch zu 'Monday' usw. übersetzt.) */
  tageISO?: string[];
  /** Maschinenlesbar, z. B. '08:00' / '18:00' */
  vonISO?: string;
  bisISO?: string;
}

/**
 * Abweichende Zeiten an einzelnen Tagen: Feiertage, Betriebsurlaub,
 * Inventur, verkürzte Öffnung.
 *
 * WARUM DAS FEHLTE UND WAS ES KOSTETE: Die Öffnungszeiten kannten nur den
 * Wochenrhythmus. Am 25. Dezember, am 1. Mai und im August-Betriebsurlaub
 * zeigten Website UND Google-Suchergebnis die normalen Zeiten – Gäste standen
 * vor der verschlossenen Tür. Das ist der Ärger, der als schlechte Bewertung
 * zurückkommt, und gleichzeitig widerspricht die Website in dem Moment dem
 * Google-Unternehmensprofil (ein Qualitätssignal, das Google mitzählt).
 *
 * Beispiel:
 *   { datum: '2026-12-25', zeit: 'geschlossen', anlass: 'Weihnachten' }
 *   { datum: '2026-12-31', zeit: '09:00–15:00', anlass: 'Silvester',
 *     vonISO: '09:00', bisISO: '15:00' }
 *   { von: '2026-08-01', bis: '2026-08-14', zeit: 'geschlossen',
 *     anlass: 'Betriebsurlaub' }
 */
export interface Sonderzeit {
  /** Einzelner Tag im Format JJJJ-MM-TT. Entfällt bei einem Zeitraum. */
  datum?: string;
  /** Beginn eines Zeitraums, JJJJ-MM-TT. */
  von?: string;
  /** Ende eines Zeitraums (einschließlich), JJJJ-MM-TT. */
  bis?: string;
  /** Sichtbarer Text, z. B. 'geschlossen' oder '09:00–15:00'. */
  zeit: string;
  /** Anlass für die Anzeige, z. B. 'Weihnachten', 'Betriebsurlaub'. */
  anlass?: string;
  /** Maschinenlesbar für Google – weglassen bedeutet geschlossen. */
  vonISO?: string;
  bisISO?: string;
}

export interface SocialLink {
  plattform: 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'linkedin' | 'whatsapp' | 'website';
  url: string;
}

export interface Adresse {
  strasse: string;
  plz: string;
  ort: string;
  land?: string;
  /** Link, der beim Klick auf das Kartenbild geöffnet wird. */
  googleMapsUrl: string;
  /** Statisches Kartenbild in fotos/ – erzeugt via `npm run karte`.
      NIEMALS ein Live-Embed: das setzt Cookies. */
  karteBild?: string;
  /**
   * Geokoordinaten – für die lokale Suche eines der wichtigsten Signale
   * („Café in meiner Nähe"). `npm run karte` ermittelt sie ohnehin beim
   * Erzeugen des Kartenbildes und gibt sie am Ende aus; bis 2026-07-27 wurden
   * sie schlicht weggeworfen. Format: Dezimalgrad, z. B. 48.2082 / 16.3738.
   */
  breitengrad?: number;
  laengengrad?: number;
}

export interface Betrieb {
  name: string;
  claim: string;
  /** 1–2 Sätze. Fällt als Meta-Description zurück, wenn eine Seite keine hat. */
  kurzbeschreibung: string;
  telefon: string;
  email: string;
  adresse: Adresse;
  oeffnungszeiten: Oeffnungszeit[];
  /**
   * Abweichungen vom Wochenrhythmus (Feiertage, Betriebsurlaub).
   * Werden auf der Seite hervorgehoben und an Google gemeldet.
   * Vergangene Einträge meldet das Prüf-Tor beim Live-Gang – so bleibt die
   * Liste gepflegt statt jahrelang alte Feiertage zu tragen.
   */
  sonderzeiten?: Sonderzeit[];
  socialLinks: SocialLink[];
  /** Dateiname in fotos/. */
  logo?: string;
  /**
   * Preisniveau als €-Zeichen: '€' (günstig) bis '€€€€'. Google zeigt das im
   * Eintrag an und nutzt es für Filter wie „günstig" – ohne die Angabe fehlt
   * der Betrieb in genau diesen Ergebnissen.
   */
  preisniveau?: '€' | '€€' | '€€€' | '€€€€';
}

// ---------------------------------------------------------------------------
//  Formulare – ein Motor, beliebig viele Formulare
// ---------------------------------------------------------------------------

/**
 * Feldtypen des Formular-Motors.
 *
 * 'haekchen' und 'mehrfach' kamen 2026-07-27 dazu: Ohne sie liess sich weder
 * eine Datenschutz-Zustimmung noch eine Mehrfachauswahl abbilden (Handwerk:
 * „Welche Leistungen?", KFZ: „Was soll gemacht werden?").
 *
 * BEWUSST NICHT DABEI – Datei-Upload: Der Motor ist rein statisch und hat
 * keinen Speicher. Ein Foto müsste auf einen fremden Dienst hochgeladen
 * werden (Speicher, Kosten, Auftragsverarbeitung, Virenprüfung, Missbrauchs-
 * risiko) – das ist ein eigener Ausbauschritt, kein Feldtyp. Der bewährte
 * Weg ohne Neubau: ein Hinweis am Formular „Fotos gerne per WhatsApp an
 * <Nummer>" oder ein 'text'-Feld für einen Link. Für Handwerk und KFZ ist
 * das in der Praxis sogar schneller als ein Upload-Feld.
 */
export type FeldTyp =
  | 'text'
  | 'email'
  | 'tel'
  | 'textarea'
  | 'datum'
  | 'zeit'
  | 'zahl'
  | 'auswahl'
  /** Einzelnes Ankreuzfeld, z. B. Zustimmung zur Datenschutzerklärung. */
  | 'haekchen'
  /** Mehrere Ankreuzfelder aus `optionen` – Mehrfachauswahl. */
  | 'mehrfach';

export interface FormularFeld {
  /** Feldname, landet so in der E-Mail. */
  name: string;
  label: string;
  typ: FeldTyp;
  pflicht?: boolean;
  /** Nur für typ 'auswahl'. */
  optionen?: string[];
  /** Browser-Autovervollständigung, z. B. 'name', 'email', 'tel'. */
  autocomplete?: string;
  /**
   * Frühestes erlaubtes Datum bei typ 'datum'.
   * 'heute' setzt beim Bauen das aktuelle Datum – verhindert Terminanfragen
   * für gestern (der häufigste Unsinn in Reservierungsformularen).
   */
  minDatum?: 'heute' | string;
  /** Platzhalter im Feld. */
  platzhalter?: string;
  /** Nur für typ 'zahl'. */
  min?: number;
  max?: number;
  /**
   * Nur bei mehrstufigen Formularen (siehe `Formular.schritte`): In welchem
   * Schritt steht das Feld? 1-basiert, fehlt = Schritt 1.
   */
  schritt?: number;
}

/**
 * Ein Formular. Der Motor rendert die Felder, prüft sie, verschickt sie über
 * Resend und blockt Spam per Honeypot. Das AUSSEHEN kommt aus dem Design.
 *
 * Typische Formulare: 'kontakt' (überall), 'reservierung' (Gastro),
 * 'termin' (Beauty/Praxis), 'angebot' (Handwerk).
 */
export interface Formular {
  /** Eindeutige ID, z. B. 'kontakt' oder 'reservierung'. */
  id: string;
  /** Betreff der E-Mail an den Betrieb. */
  betreff: string;
  felder: FormularFeld[];
  /**
   * MEHRSTUFIG (Assistent) – optional. Titel der Schritte, z. B.
   * `['Ihr Anliegen', 'Termin', 'Kontakt']`. Jedes Feld bekommt dann
   * `schritt: 1|2|3`. Der Motor zeigt immer nur einen Schritt, prüft ihn vor
   * dem Weiterklicken und blendet einen Fortschritt ein.
   *
   * WANN SINNVOLL: ab etwa acht Feldern, oder wenn die ersten Fragen leicht
   * sind und die persönlichen Daten erst zum Schluss kommen (Ankauf-Anfrage,
   * Angebotsassistent, Erstberatung). Ein langes Formular am Stück schreckt
   * ab; drei kurze Schritte werden deutlich häufiger fertig ausgefüllt.
   *
   * WANN NICHT: bei vier Feldern. Da ist ein Assistent nur ein Umweg.
   *
   * Ohne JavaScript sind alle Schritte untereinander sichtbar und absendbar –
   * es geht also nichts verloren.
   */
  schritte?: string[];
}

// ---------------------------------------------------------------------------
//  KATALOG – viele gleichartige Einträge, jeder mit eigener Unterseite
//
//  Branchenneutral: Fahrzeuge (KFZ-Händler), Objekte (Immobilien), Maschinen
//  (Handel), Kurse (Studio), Projekte (Handwerk), Zimmer (Pension).
//
//  ABGRENZUNG ZUR PREISLISTE: Die Preisliste ist eine TABELLE auf einer Seite
//  (Speisekarte, Behandlungen). Der Katalog ist eine LISTE mit Detailseiten –
//  jeder Eintrag bekommt eine eigene Adresse, eigene Meta-Angaben und eigene
//  Bilder. Faustregel: Würde man einen einzelnen Eintrag per WhatsApp
//  verschicken wollen? Dann Katalog.
//
//  WARUM DAS IM MOTOR STEHT: Ohne eigene Adresse je Eintrag findet Google
//  genau eine Seite statt zweihundert – der größte SEO-Hebel überhaupt bei
//  einem Händler. Und ein Klon, der die Routen selbst bauen müsste, baut sie
//  jedes Mal anders und meist ohne saubere Meta-Angaben.
// ---------------------------------------------------------------------------

/** Eine Zeile in der Merkmalstabelle der Detailseite („Baujahr | 2019"). */
export interface KatalogMerkmal {
  name: string;
  wert: string;
}

export interface KatalogEintrag {
  /**
   * Adress-Baustein, klein und mit Bindestrichen: 'bmw-320d-touring-2019'.
   * Ergibt zusammen mit `Katalog.pfad` die Adresse der Detailseite.
   * **Nach dem Live-Gang nicht mehr ändern** – sonst ist der Google-Treffer tot
   * (und wenn doch, gehört eine Weiterleitung in `weiterleitungen`).
   */
  id: string;
  titel: string;
  /** Ein Satz für die Übersichtskarte. */
  kurz?: string;
  /** Fließtext für die Detailseite. Absätze mit Leerzeile trennen. */
  beschreibung?: string;
  /** Zahl ohne Währung, z. B. 18900. Weglassen = „auf Anfrage". */
  preis?: number;
  /** Zusatz beim Preis, z. B. 'inkl. USt.' oder 'zzgl. Überstellung'. */
  preisHinweis?: string;
  /** Dateinamen aus `fotos/`. Das erste Bild ist das Hauptbild. */
  bilder?: string[];
  /** Alt-Texte zu `bilder`, gleiche Reihenfolge. Fehlt einer, nimmt der Motor
      den Titel – besser als gar kein Alt-Text, aber schlechter als ein echter. */
  bildAlt?: string[];
  /** Tabelle auf der Detailseite. */
  merkmale?: KatalogMerkmal[];
  /**
   * Merkmale zum FILTERN (Text). Werden zu `data-<name>` auf der Karte, damit
   * der Filter-Baustein sie kennt: `{ marke: 'bmw', kraftstoff: 'diesel' }`.
   * Kleinschreibung ohne Umlaute – es sind Schlüssel, keine Anzeigetexte.
   */
  filter?: Record<string, string>;
  /**
   * Merkmale zum SORTIEREN und für Schieberegler (Zahlen):
   * `{ preis: 18900, km: 84000, baujahr: 2019 }`.
   */
  zahlen?: Record<string, number>;
  /** false blendet den Eintrag aus der Liste aus, die Detailseite bleibt
      erreichbar (verkauft/vergeben – der Google-Treffer soll nicht ins Leere
      laufen). Weglassen = verfügbar. */
  verfuegbar?: boolean;
  /** Hinweis statt Preis, wenn nicht verfügbar, z. B. 'bereits verkauft'. */
  statusText?: string;
}

/** Wie Google die Detailseiten lesen soll. Bestimmt den JSON-LD-Typ. */
export type KatalogSchema =
  | 'Product'
  | 'Vehicle'
  | 'Course'
  | 'Apartment'
  | 'House'
  | 'Service';

export interface Katalog {
  /** Basispfad OHNE abschließenden Schrägstrich, z. B. '/fahrzeuge'.
      Ergibt Detailseiten unter '/fahrzeuge/<id>'. */
  pfad: string;
  /** Für Überschriften und Brotkrumen: 'Fahrzeug' / 'Fahrzeuge'. */
  einzahl: string;
  mehrzahl: string;
  /** Siehe KatalogSchema. Weglassen = 'Product'. */
  schema?: KatalogSchema;
  /** ISO-Währung, Standard 'EUR'. */
  waehrung?: string;
  /**
   * ID eines Formulars aus `formulare`. Steht sie hier, blendet die
   * Detailseite eine Anfrage ein, in der der Eintrag schon eingetragen ist –
   * der Interessent muss nicht abtippen, worum es geht.
   */
  anfrageFormular?: string;
  /**
   * Sichtbare Beschriftungen für Filtermerkmale und deren Werte.
   *
   * WARUM ES DAS BRAUCHT: Die Schlüssel unter `filter` und `zahlen` sind
   * Adressbausteine – klein, ohne Umlaute (`gruen`, `kraftstoff`, `km`).
   * Ohne diese Zuordnung stünde genau das auf der Seite: „Gruen" statt „Grün",
   * „Km" statt „Kilometerstand". Das fiel erst in der Sichtprüfung auf, weil
   * technisch alles richtig war – es las sich nur falsch.
   *
   *   beschriftungen: {
   *     kraftstoff: 'Kraftstoff', gruen: 'Grün', km: 'Kilometerstand',
   *   }
   *
   * Was hier fehlt, wird schlicht großgeschrieben – für `alpha`, `beta` oder
   * `bmw` reicht das.
   */
  beschriftungen?: Record<string, string>;
  /** Die Einträge. Bei mehr als ~30 in `daten/katalog.ts` auslagern. */
  eintraege: KatalogEintrag[];
}

// ---------------------------------------------------------------------------
//  Preisliste / Speisekarte – branchenneutral
//  Funktioniert für Speisekarte (Gastro), Behandlungen (Beauty),
//  Leistungen (Handwerk/KFZ) und Kurse (Studio).
// ---------------------------------------------------------------------------

export interface PreisVariante {
  /** z. B. '0,33 l', 'klein', '60 Min' */
  groesse: string;
  preis: string;
}

export interface PreisPosition {
  name: string;
  beschreibung?: string;
  /** Einzelpreis. Entfällt, wenn `varianten` gesetzt ist. */
  preis?: string;
  /** Mehrere Größen/Preise, z. B. 0,33 l und 0,5 l. */
  varianten?: PreisVariante[];
  /** Allergene laut österreichischer Kennzeichnung, z. B. 'A C G'.
      Pflicht in der Gastronomie, sobald Speisen gelistet sind. */
  allergene?: string;
  /** Dauer, z. B. '60 Min' – für Behandlungen, Training, Kurse. */
  dauer?: string;
  /** Freie Kennzeichnungen, z. B. 'veg', 'vegan', 'scharf'. */
  tags?: string[];
  /** Foto (Dateiname in fotos/). */
  bild?: string;
}

export interface PreisGruppe {
  titel: string;
  /** Hinweis unter der Gruppe, z. B. 'Zu jedem Kuchen eine Kugel Eis um 2,00 €.' */
  notiz?: string;
  positionen: PreisPosition[];
}

/** Eine Kategorie – wird üblicherweise als Tab dargestellt. */
export interface PreisKategorie {
  /** ID für den Tab-Anker, z. B. 'fruehstueck'. */
  id: string;
  titel: string;
  untertitel?: string;
  /** Kategoriebild (Dateiname in fotos/). */
  bild?: string;
  gruppen: PreisGruppe[];
}

/**
 * Vier Blöcke, die fast jede Branchenseite hat und die bisher in JEDEM Klon von
 * Hand entstanden – ohne Datenmodell, ohne strukturierte Daten für Google,
 * ohne Prüfung. Alle vier sind optional: Wer sie nicht befüllt, hat sie nicht.
 */

/** Mitarbeiter – Praxis, Kanzlei, Studio, Friseur, Werkstatt. */
export interface TeamMitglied {
  name: string;
  rolle: string;
  /** 1–3 Sätze; bei Praxen typisch Qualifikationen. */
  text?: string;
  /** Dateiname in fotos/. */
  bild?: string;
  /** Nur wenn der Betrieb es ausdrücklich wünscht (Ärzte, Kanzleien). */
  email?: string;
  telefon?: string;
}

/**
 * Häufige Fragen. Erscheinen zusätzlich als FAQPage-Schema – Google zeigt sie
 * dann aufklappbar direkt im Suchergebnis, was den Platz in der Trefferliste
 * vergrößert. Reine Fließtext-Fragen bringen das nicht.
 */
export interface FaqEintrag {
  frage: string;
  /** Nur Text, keine Auszeichnung – so verlangt es Google für das Schema. */
  antwort: string;
}

/** Referenz / abgeschlossenes Projekt – Handwerk, Bau, Agentur, KFZ. */
export interface Referenz {
  titel: string;
  /** Was gemacht wurde, 1–3 Sätze. */
  text?: string;
  /** Ort oder Bezirk – wirkt lokal und ist für die Suche wertvoll. */
  ort?: string;
  /** Jahr der Umsetzung. */
  jahr?: string;
  bild?: string;
  /** Freie Kennzeichnungen für Filter, z. B. ['bad', 'sanierung']. */
  tags?: string[];
}

/** Stellenanzeige. Erscheint zusätzlich als JobPosting-Schema (Google Jobs). */
export interface Stelle {
  titel: string;
  /** z. B. 'Vollzeit', 'Teilzeit', 'Lehre', 'geringfügig'. */
  umfang: string;
  text: string;
  /** Kollektivvertrags-Mindestgehalt – in Österreich PFLICHTANGABE
      (§ 9 Gleichbehandlungsgesetz), z. B. 'ab 2.100 € brutto/Monat'. */
  gehalt: string;
  /** Frühestes Eintrittsdatum, JJJJ-MM-TT – nur für das Google-Schema. */
  ab?: string;
}

export interface Preisliste {
  kategorien: PreisKategorie[];
  /** Allergen-Legende, z. B. { A: 'Glutenhaltiges Getreide' }. */
  allergene?: Record<string, string>;
  /** Hinweise unter der Karte (Preise inkl. MwSt., Küchenzeiten, Stand …). */
  hinweise?: string[];
  /** Original als PDF in public/, z. B. 'speisekarte.pdf'. */
  pdfDatei?: string;
}

// ---------------------------------------------------------------------------
//  Ausbau: Dienste (Tracking/Pixel) – standardmäßig LEER
// ---------------------------------------------------------------------------

/**
 * Einwilligungs-Kategorien.
 *  notwendig  – ohne die geht die Seite nicht (nie zustimmungspflichtig)
 *  funktional – Komfort, z. B. eine eingebettete Karte
 *  statistik  – Reichweitenmessung
 *  marketing  – Pixel, Remarketing, Ads
 */
export type Kategorie = 'notwendig' | 'funktional' | 'statistik' | 'marketing';

/**
 * Ein externer Dienst (Meta-Pixel, Google Ads, Analytics …).
 *
 * WICHTIG: Solange diese Liste LEER ist, ist die Seite cookiefrei, es gibt
 * keinen Banner und keine externen Requests. Das ist der Normalfall und ein
 * Verkaufsargument – bitte nur auf ausdrücklichen Kundenwunsch befüllen.
 *
 * Sobald ein Dienst drinsteht:
 *  - erscheint der Einwilligungs-Banner
 *  - lädt NICHTS, bevor der Besucher zugestimmt hat (Opt-in, DSGVO)
 *  - erscheint der Dienst automatisch in der Datenschutzerklärung
 *
 * Beispiel Meta-Pixel:
 *   { id: 'meta-pixel', name: 'Meta-Pixel', anbieter: 'Meta Platforms Ireland Ltd.',
 *     kategorie: 'marketing', zweck: 'Messung von Werbeerfolgen auf Facebook/Instagram',
 *     datenschutzUrl: 'https://www.facebook.com/privacy/policy/',
 *     skript: `!function(f,b,e,v,n,t,s){…}` }
 */
export interface Dienst {
  id: string;
  name: string;
  /** Anbieter mit Rechtsform – Pflichtangabe für die Datenschutzerklärung. */
  anbieter: string;
  kategorie: Kategorie;
  /** Wozu? Verständlich formuliert – steht so in der Datenschutzerklärung. */
  zweck: string;
  /** Datenschutzerklärung des Anbieters. */
  datenschutzUrl: string;
  /** Externe Skript-Adresse ODER Inline-Code. Wird bis zur Zustimmung geparkt. */
  quelle?: string;
  skript?: string;
  /** Setzt der Dienst Cookies? Für die Datenschutzerklärung. */
  setztCookies?: boolean;
}

// ---------------------------------------------------------------------------
//  Weiterleitungen – rettet das Google-Ranking bei bestehender Website
// ---------------------------------------------------------------------------

/**
 * Hatte der Betrieb schon eine Website mit anderen Adressen, MUSS jede alte
 * Adresse auf die neue zeigen. Sonst laufen bestehende Google-Treffer und
 * fremde Links ins Leere – der Kunde verliert seine mühsam aufgebaute
 * Sichtbarkeit über Nacht.
 *
 * Beispiel:  { von: '/speisen.html', nach: '/speisekarte' }
 */
export interface Weiterleitung {
  /** Alte Adresse (Pfad, wie er früher war). */
  von: string;
  /** Neue Adresse. */
  nach: string;
  /** 301 = dauerhaft (Standard, vererbt das Ranking). 302 = vorübergehend. */
  status?: 301 | 302;
}

// ---------------------------------------------------------------------------
//  Recht
// ---------------------------------------------------------------------------

export interface Rechtstexte {
  firmenwortlaut: string;
  rechtsform: string;
  /** Kann von der Kontaktadresse abweichen (Sitz laut Firmenbuch). */
  adresse: string;
  /** UID-Nummer, falls vorhanden. */
  uid: string;
  aufsichtsbehoerde: string;
  /** Gewerbeberechtigung / Kammer-Mitgliedschaft. */
  gewerbe: string;
  firmenbuchnummer: string;
  firmenbuchgericht: string;
  /**
   * ALLGEMEINE GESCHÄFTSBEDINGUNGEN – optional.
   *
   * Steht hier etwas, entsteht automatisch die Seite `/agb` samt Fußzeilen-Link
   * und Meta-Angaben. Fehlt das Feld, gibt es die Seite nicht.
   *
   * WANN GEBRAUCHT: sobald über die Website verkauft, verbindlich gebucht oder
   * bestellt wird (Shop, Kursanmeldung, Reservierung mit Stornoregel,
   * Fahrzeug-Reservierung). Ein reines Kontaktformular braucht keine AGB.
   *
   * WICHTIG – NICHT SELBST TEXTEN: AGB sind Vertragsrecht. Der Motor liefert
   * die Seite, den Text liefert der Betrieb (Anwalt, WKO-Muster, Steuerberater).
   * Fehlt er noch, hier ausdrücklich `PLATZHALTER: AGB-Text vom Kunden` stehen
   * lassen – das Prüf-Tor hält den Live-Gang dann an, statt eine erfundene
   * Klausel online gehen zu lassen.
   *
   * Aufbau: je Eintrag eine Überschrift und ein oder mehrere Absätze.
   */
  agb?: AgbAbschnitt[];
}

/** Ein Abschnitt der AGB: Überschrift plus Absätze. */
export interface AgbAbschnitt {
  titel: string;
  absaetze: string[];
}

// ---------------------------------------------------------------------------
//  Die Gesamt-Config
// ---------------------------------------------------------------------------

export interface SiteConfig {
  betrieb: Betrieb;
  design: Design;
  seiten: Seite[];
  formulare: Formular[];
  preisliste?: Preisliste;
  /**
   * Viele gleichartige Einträge mit je eigener Unterseite – siehe Katalog.
   * Weglassen = kein Katalog, es entstehen keine zusätzlichen Adressen.
   */
  katalog?: Katalog;
  /** Mitarbeiter – siehe TeamMitglied. */
  team?: TeamMitglied[];
  /** Häufige Fragen – erscheinen zusätzlich als FAQ-Schema bei Google. */
  faq?: FaqEintrag[];
  /** Referenzen / abgeschlossene Projekte. */
  referenzen?: Referenz[];
  /** Offene Stellen – erscheinen zusätzlich als JobPosting-Schema. */
  stellen?: Stelle[];
  rechtstexte: Rechtstexte;

  /**
   * Externe Dienste (Pixel/Tracking). LEER = cookiefrei, kein Banner.
   * Nur auf ausdrücklichen Kundenwunsch befüllen.
   */
  dienste: Dienst[];
  /** Alte Adressen der Vorgänger-Website -> neue. Rettet das Google-Ranking. */
  weiterleitungen: Weiterleitung[];

  // Steuerung
  branche: Branche;
  mode: Mode;
  ansprache: Ansprache;
  sprachen: Sprache[];
  /** Volle URL ohne abschließenden Schrägstrich, z. B. 'https://ihr-betrieb.at'. */
  domain: string;
  /**
   * Adresse, unter der die VORSCHAU tatsächlich liegt, z. B.
   * 'https://muster-betrieb.kanbuk.com'. Nur im `demo`-Modus wirksam.
   *
   * WARUM: `domain` ist die spätere Kundendomain – die existiert während der
   * Vorschau noch gar nicht. Trotzdem baute der Motor daraus die Adressen im
   * Seitenkopf: Beim Verschicken einer Demo holte WhatsApp das Vorschaubild
   * von der künftigen Kundendomain und bekam eine Fehlermeldung – der Lead sah
   * eine nackte graue Zeile statt eines Fotos. Steht hier die Vorschau-Adresse,
   * stimmt das Bild sofort. Beim Live-Gang wird das Feld schlicht ignoriert.
   */
  vorschauDomain?: string;
  /**
   * Wird auf der Seite eine BEDIENTE Karte per 2-Klick eingebettet
   * (`<Einbettung>` mit Google Maps)? Standard: false – dann zeigt die Anfahrt
   * nur das statische Kartenbild.
   *
   * WARUM ES DAS FELD GIBT: Die Datenschutzerklärung behauptete fest verdrahtet
   * „Es wird keine Karte eingebettet". Auf einer Seite mit 2-Klick-Karte war das
   * schlicht falsch – die Erklärung sagte das Gegenteil dessen, was die Seite
   * tut, und die Übermittlung an Google wurde nirgends erwähnt. Steht das Feld
   * auf true, beschreibt die Erklärung die Einbettung samt Rechtsgrundlage.
   */
  karteEingebettet?: boolean;
  /** Globales OG-Bild (in public/), Standard: '/og.jpg'. */
  ogBild: string;
}

/** Felder, die aufloesen() mit Standardwerten füllt. */
type OptionaleFelder = 'ansprache' | 'sprachen' | 'formulare' | 'ogBild' | 'dienste' | 'weiterleitungen';

export type KundenKonfig = Omit<SiteConfig, OptionaleFelder> &
  Partial<Pick<SiteConfig, OptionaleFelder>>;

/** Füllt Standardwerte auf und liefert die fertige Config. */
export function aufloesen(k: KundenKonfig): SiteConfig {
  return {
    ...k,
    ansprache: k.ansprache ?? 'sie',
    sprachen: k.sprachen ?? ['de'],
    formulare: k.formulare ?? [],
    ogBild: k.ogBild ?? '/og.jpg',
    // Standard: keine Dienste -> cookiefrei, kein Banner. Das ist Absicht.
    dienste: k.dienste ?? [],
    weiterleitungen: k.weiterleitungen ?? [],
  };
}

/** Schema.org-Typ für die JSON-LD-Auszeichnung. */
export function jsonLdTyp(branche: Branche): string {
  return BRANCHE_JSONLD_TYP[branche];
}

/**
 * Braucht diese Seite einen Einwilligungs-Banner?
 * Nur, wenn zustimmungspflichtige Dienste konfiguriert sind. Ohne sie bleibt
 * die Seite cookiefrei und banner-frei.
 */
export function brauchtEinwilligung(s: SiteConfig): boolean {
  return s.dienste.some((d) => d.kategorie !== 'notwendig');
}

// ===========================================================================
//  REFERENZ-DATEN
//  ---------------------------------------------------------------------------
//  Ein neutraler Beispielbetrieb, damit `npm run dev` sofort läuft und der
//  technische Standard sichtbar ist.
//
//  >>> BEIM KUNDEN: diesen Block komplett ersetzen. <<<
//  `npm run check` schlägt an, solange Referenz-Reste drinstehen.
// ===========================================================================

const konfig = {
  betrieb: {
    name: 'Muster Betrieb',
    claim: 'Referenz-Seite des Kanbuk-Motors',
    kurzbeschreibung:
      'Diese Seite zeigt den technischen Standard, den jede Kundenseite erfüllen muss. Sie wird beim Kunden vollständig durch das Design ersetzt.',
    telefon: '+43 1 000 00 00',
    email: 'hallo@muster-betrieb.example',
    adresse: {
      strasse: 'Musterstraße 1',
      plz: '1010',
      ort: 'Wien',
      land: 'AT',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Musterstra%C3%9Fe+1+1010+Wien',
    },
    oeffnungszeiten: [
      { tag: 'Mo–Fr', zeit: '09:00–18:00', tageISO: ['Mo', 'Tu', 'We', 'Th', 'Fr'], vonISO: '09:00', bisISO: '18:00' },
      { tag: 'Samstag', zeit: '09:00–13:00', tageISO: ['Sa'], vonISO: '09:00', bisISO: '13:00' },
      { tag: 'Sonntag', zeit: 'geschlossen' },
    ],
    socialLinks: [
      { plattform: 'instagram', url: 'https://www.instagram.com/musterbetrieb' },
      { plattform: 'facebook', url: 'https://www.facebook.com/musterbetrieb' },
      { plattform: 'whatsapp', url: 'https://wa.me/4310000000' },
    ],
  },

  // Design-Tokens: beim Kunden aus dem Claude Design übernehmen.
  design: {
    farben: {
      hintergrund: '#ffffff',
      text: '#1a1a1a',
      primaer: '#1a1a1a',
      flaeche: '#f4f4f5',
    },
    schriften: {
      ueberschrift: 'Georgia, serif',
      text: 'system-ui, sans-serif',
    },
    radius: '0px',
  },

  seiten: [
    {
      pfad: '/',
      navTitel: 'Start',
      metaTitel: 'Referenz-Seite',
      metaBeschreibung:
        'Referenz-Seite des Kanbuk-Motors: zeigt Token-System, Meta-Struktur und Prüf-Tor. Wird beim Kunden durch das Design ersetzt.',
    },
    {
      pfad: '/muster-katalog',
      navTitel: 'Katalog',
      metaTitel: 'Muster-Katalog',
      metaBeschreibung:
        'Muster-Katalog des Kanbuk-Motors: zeigt Filter, Sortierung, Merkliste und Detailseiten. Wird beim Kunden ersetzt oder gelöscht.',
    },
  ],

  /* ------------------------------------------------------------------------
     MUSTER-KATALOG – beim Kunden ersetzen oder ersatzlos löschen.

     Er steht hier aus demselben Grund wie das Referenzfoto: So läuft die
     Katalog-Mechanik (Detailseiten, Filter, Produkt-Schema, Vorschaubilder)
     bei JEDEM Build durch. Ohne ihn bliebe ein Fehler in dieser Kette still,
     bis er beim ersten Kunden auffällt – und dort fällt er teuer auf.

     Beim Kunden: `katalog` mit den echten Einträgen füllen (Fahrzeuge,
     Objekte, Maschinen, Kurse …) oder den ganzen Block entfernen. Das
     Prüf-Tor meldet die Muster-Einträge, solange sie stehen.
     ------------------------------------------------------------------------ */
  katalog: {
    pfad: '/muster-katalog',
    einzahl: 'Muster-Eintrag',
    mehrzahl: 'Muster-Katalog',
    schema: 'Product',
    anfrageFormular: 'kontakt',
    /* Sichtbare Beschriftungen: Ohne sie stuende auf der Seite „Gruen" statt
       „Grün" - der Schluessel ist ein Adressbaustein, kein Anzeigetext. */
    beschriftungen: {
      art: 'Art',
      farbe: 'Farbe',
      blau: 'Blau',
      gruen: 'Grün',
      preis: 'Preis',
      baujahr: 'Baujahr',
    },
    eintraege: [
      {
        id: 'muster-eintrag-eins',
        titel: 'Muster-Eintrag Eins',
        kurz:
          'Muster-Eintrag des Kanbuk-Motors: zeigt Filter nach Art und Farbe, Preis-Regler, Sortierung, Merkliste und eine eigene Detailseite mit Bildern.',
        beschreibung:
          'Dieser Eintrag ist ein Muster des Kanbuk-Motors.\n\nEr belegt, dass jede Position eine eigene Adresse, eigene Meta-Angaben und ein eigenes Vorschaubild bekommt.',
        preis: 1200,
        preisHinweis: 'inkl. USt.',
        bilder: ['galerie-1.jpg', 'galerie-2.jpg'],
        bildAlt: ['Muster-Eintrag Eins, Ansicht von vorn', 'Muster-Eintrag Eins, Detailansicht'],
        merkmale: [
          { name: 'Art', wert: 'Alpha' },
          { name: 'Farbe', wert: 'Blau' },
          { name: 'Baujahr', wert: '2022' },
        ],
        filter: { art: 'alpha', farbe: 'blau' },
        zahlen: { baujahr: 2022 },
      },
      {
        id: 'muster-eintrag-zwei',
        titel: 'Muster-Eintrag Zwei',
        kurz:
          'Zweiter Muster-Eintrag des Kanbuk-Motors: Er belegt, dass Filtergruppen, Schieberegler und Sortierung automatisch aus den gepflegten Daten entstehen.',
        preis: 3400,
        bilder: ['galerie-3.jpg'],
        bildAlt: ['Muster-Eintrag Zwei'],
        merkmale: [
          { name: 'Art', wert: 'Beta' },
          { name: 'Farbe', wert: 'Grün' },
          { name: 'Baujahr', wert: '2024' },
        ],
        filter: { art: 'beta', farbe: 'gruen' },
        zahlen: { baujahr: 2024 },
      },
      {
        id: 'muster-eintrag-drei',
        titel: 'Muster-Eintrag Drei',
        kurz:
          'Muster-Eintrag des Kanbuk-Motors, nicht mehr verfügbar: Er verschwindet aus der Liste, seine Seite bleibt aber erreichbar – der Google-Treffer läuft nicht ins Leere.',
        preis: 890,
        verfuegbar: false,
        statusText: 'bereits vergeben',
        bilder: ['galerie-4.jpg'],
        bildAlt: ['Muster-Eintrag Drei'],
        merkmale: [
          { name: 'Art', wert: 'Alpha' },
          { name: 'Farbe', wert: 'Grün' },
          { name: 'Baujahr', wert: '2019' },
        ],
        filter: { art: 'alpha', farbe: 'gruen' },
        zahlen: { baujahr: 2019 },
      },
    ],
  },

  formulare: [
    {
      id: 'kontakt',
      betreff: 'Neue Anfrage über die Website',
      felder: [
        { name: 'name', label: 'Name', typ: 'text', pflicht: true, autocomplete: 'name' },
        { name: 'email', label: 'E-Mail', typ: 'email', pflicht: true, autocomplete: 'email' },
        { name: 'telefon', label: 'Telefon', typ: 'tel', autocomplete: 'tel' },
        { name: 'nachricht', label: 'Nachricht', typ: 'textarea', pflicht: true },
      ],
    },
  ],

  branche: 'sonstiges',
  mode: 'demo',
  ansprache: 'sie',
  sprachen: ['de'],
  domain: 'https://muster-betrieb.example',

  rechtstexte: {
    firmenwortlaut: 'Muster Betrieb e.U.',
    rechtsform: 'Eingetragenes Einzelunternehmen (e.U.)',
    adresse: 'Musterstraße 1, 1010 Wien, Österreich',
    uid: 'ATU00000000',
    aufsichtsbehoerde: 'Magistratisches Bezirksamt für den 1. Bezirk',
    gewerbe: 'Mitglied der WKO Wien',
    firmenbuchnummer: 'FN 000000a',
    firmenbuchgericht: 'Handelsgericht Wien',
  },
} satisfies KundenKonfig;

export const site: SiteConfig = aufloesen(konfig);

export default site;
