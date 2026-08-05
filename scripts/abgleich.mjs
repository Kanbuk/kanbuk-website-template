/**
 * `npm run abgleich` – DAS SECHSTE TOR: hält die gebaute Seite gegen das Design.
 *
 * =============================================================================
 *  WOZU ES DAS GIBT
 * =============================================================================
 *  Am 29.07.2026 wurde ein echtes Autohaus-Design aus der frischen Vorlage
 *  portiert. Nach fünf Korrekturrunden waren ALLE fünf Tore grün – `check`,
 *  `sicht`, `interaktion`, `browser`, `altgeraet`. Ein Abgleich von Hand fand
 *  danach 65 Abweichungen, elf davon grob: ein Schwebeknopf, der auf keiner
 *  einzigen Seite existierte; zwei Rechtsseiten ohne ihr Kopfband; eine
 *  fehlende und eine erfundene Frage im Akkordeon; ein Formular-Zustand, den
 *  es gar nicht gab; drei Kartenplätze mit zwei Karten darin.
 *
 *  Kein einziger davon war von einem Tor gemeldet worden – und keines KONNTE
 *  es: Alle fünf prüfen, was DA ist. Keines weiß, was da sein müsste.
 *
 *  Die Tücke dabei ist bekannt und steht in CLAUDE.md Abschnitt 4: Eine Seite
 *  aus lauter korrekten Bauteilen wirkt fertig. Erst wer sie neben die
 *  Design-Datei hält, sieht, dass es eine andere Seite ist.
 *
 * =============================================================================
 *  WARUM ES NICHT DIE BILDER VERGLEICHT
 * =============================================================================
 *  Die naheliegende Idee – beide Seiten als Bild übereinanderlegen – trägt aus
 *  zwei Gründen nicht:
 *
 *  1. **Die Design-Datei lässt sich nicht rendern.** Sie ist eine Schablone mit
 *     Bauteil-Platzhaltern (`<x-import>`), Seiten-Schaltern (`<sc-if>`) und
 *     Schleifen (`<sc-for>`). Aufgelöst werden die von `support.js`, dem
 *     Laufzeit-Teil von Claude Design – der beim Export nicht mitkommt. Ihn
 *     nachzubauen hieße, eine zweite Fassung von Claude Design zu pflegen, die
 *     bei jeder Änderung dort bricht.
 *  2. **Ein Pixelvergleich ertränke die Befunde.** Das Design zeigt
 *     Musterinhalte, die Seite echte: andere Fotos, andere Preise, andere
 *     Textlängen. Jeder Textblock wäre ein Unterschied, und die groben Fehler
 *     gingen im Rauschen unter.
 *
 *  Beide Seiten sind aber maschinell lesbar als STRUKTUR. Genau darauf schaut
 *  dieses Werkzeug: Wie viele Blöcke, in welcher Reihenfolge, mit welcher
 *  Grundfarbe, welcher Polsterung, welcher Überschrift. Das sind die Merkmale,
 *  an denen die elf groben Befunde hingen – und sie sind unempfindlich gegen
 *  andere Inhalte.
 *
 * =============================================================================
 *  WAS DAS TOR VERGLEICHT – und was ausdrücklich NICHT
 * =============================================================================
 *  Diese Liste ist am 31.07.2026 einmal vollständig gegen CLAUDE.md Abschnitt 4
 *  gehalten worden („Die Inline-Stile jedes Blocks werden Wert für Wert
 *  übernommen: Innenabstände, Höhen, Schriftgrößen, Radien, Zeilenhöhen,
 *  Sperrungen, Farben, Verläufe, Deckkraft, Übergänge").
 *
 *  ANLASS: Bis dahin sammelte das Skript sechs Merkmale ein, die es nie ansah –
 *  darunter die Innenabstände, obwohl der Abschnitt sie ausdrücklich verlangt.
 *  Wer ins Skript sah, hielt sie für geprüft. Deshalb steht hier jetzt eine
 *  Liste statt eines Gefühls. **Wer ein Merkmal ergänzt, ergänzt sie mit.**
 *
 *  VERGLICHEN WIRD:
 *    ✓ Blockzahl je Seite
 *    ✓ Überschriften-Folge (fehlender / erfundener / vertauschter Block)
 *    ✓ Reihenfolge der gemeinsamen Blöcke
 *    ✓ Dunkle Bänder (über die Umkehr-Klasse, nicht über einen Farbwert)
 *    ✓ Fest stehende Elemente im Rahmen (Schwebeknöpfe)
 *    ✓ Schatten – nur VORHANDEN/NICHT (das Design schreibt Token-Namen)
 *    ✓ Rahmen  – nur VORHANDEN/NICHT, aus demselben Grund
 *    ✓ Bildzuschnitt (object-fit) – seitenweit, Werte vergleichbar
 *    ✓ Schriftenzahl – zwei im Design, eine gebaut = Überschriftenschrift fehlt
 *    ✓ Innenabstand oben je Block – NUR bei glattem Pixelwert, Toleranz 8 px
 *    ✓ SCHRIFT DER ÜBERSCHRIFTEN, Wert für Wert (seit 05.08.2026): Größe,
 *      Zeilenhöhe, Sperrung, Schnitt, Großschreibung – aber NUR, wo das Design
 *      die Eigenschaft am Element SELBST deklariert. Die Zahl der wirklich
 *      verglichenen Überschriften steht in der Ergebniszeile; „0" ist eine
 *      ausgefallene Prüfung, kein bestandener Haken.
 *
 *  AN DAS AUGE ÜBERGEBEN (nicht maschinell vergleichbar, aber ausgegeben):
 *    → Bauteile je Seite (`<x-import>`); die gebaute Seite trägt keine Spur davon
 *    → Klick-Zustände je Seite (`<sc-if>` INNERHALB eines Blocks)
 *
 *  BEWUSST NICHT VERGLICHEN – und warum:
 *    ✗ Radien, Verläufe, Deckkraft, Übergänge, Spaltenaufteilung: Das Design
 *      schreibt sie als Token (`var(--radius-lg)`). Ohne die Token-Datei ist
 *      der Sollwert unbekannt, und aus dem NAMEN einen Wert zu raten hat in
 *      früheren Läufen genau die Falschmeldungen erzeugt, die einem das
 *      Hinsehen abgewöhnen. Lieber schweigen als raten.
 *
 *      HIER STANDEN BIS 05.08.2026 AUCH SCHRIFTGRÖSSEN, ZEILENHÖHEN UND
 *      SPERRUNGEN – mit derselben Begründung, und die war für sie falsch. An
 *      einer echten Design-Datei nachgezählt: 157 feste `font-size`-Werte und
 *      KEIN EINZIGER Token, 120 `padding`, 113 `gap`, 71 `line-height`, alle
 *      als Zahl. Nur bei den Radien stimmt die Aussage (37 Token gegen 7 feste
 *      Werte). Das Tor hat also jahrelang genau die Werte nicht verglichen,
 *      die vergleichbar sind – mit einem Argument, das für eine einzige
 *      Eigenschaft gilt. Eine Begründung, die man nicht nachmisst, altert.
 *
 *    ✗ Innenabstände und `gap` flächendeckend: Dort weicht der Port
 *      LEGITIM ab (fluide Skala, Handy-Ansicht – die es im Design gar nicht
 *      gibt). Der bestehende Vergleich des oberen Innenabstands je Block
 *      bleibt, wie er ist.
 *    ✗ Grundfarbe als WERT (nur die Umkehr-Klasse zählt) – gleicher Grund.
 *    ✗ Ob ein Text inhaltlich stimmt. Es zählt Blöcke, es liest nicht Korrektur.
 *    ✗ Alles, was das Design nur in einer Zeichnung andeutet.
 *
 *  Für all das bleibt Punkt 3d der Definition of Done zuständig: Design-Datei
 *  neben die Umsetzung legen und mit eigenen Augen vergleichen.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { starteDistServer } from './lib/dist-server.mjs';
import { verlangeAktuellesDist } from './lib/bau-marke.mjs';

const WURZEL = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const DESIGN = join(WURZEL, 'design');
const ZUORDNUNG = join(DESIGN, 'abgleich.json');

const nurBericht = process.argv.includes('--bericht');

// ---------------------------------------------------------------------------
//  Ohne Design-Datei gibt es nichts abzugleichen
// ---------------------------------------------------------------------------
function designDatei() {
  if (!existsSync(DESIGN)) return undefined;
  const treffer = readdirSync(DESIGN).filter((f) => f.endsWith('.dc.html'));
  return treffer.length ? join(DESIGN, treffer[0]) : undefined;
}

/* IM KLON IST EINE FEHLENDE DESIGN-DATEI KEIN GRUENES TOR, SONDERN EINE SPERRE.
   Bis zum 02.08.2026 endete dieses Tor ohne .dc.html mit Erfolg. Damit war
   Punkt 3c der Definition of Done („npm run abgleich ist gruen") erfuellt,
   solange NIEMAND die Datei ablegt - das Tor war per Bauart gruen und hatte
   nichts verglichen. CLAUDE.md sagt an anderer Stelle selbst: „Eine
   uebersprungene Pruefung ist kein gruenes Tor."

   Im TEMPLATE ist das anders und richtig: Dort gibt es kein Kundendesign und
   soll auch keines geben. Unterschieden wird am Paketnamen - dieselbe Regel,
   nach der auch das Pruef-Tor scharf wird (CLAUDE.md Abschnitt 8, Schritt 3). */
function istTemplate() {
  try {
    const p = JSON.parse(readFileSync(join(WURZEL, 'package.json'), 'utf-8'));
    return p.name === 'kanbuk-website-template';
  } catch {
    return false;
  }
}

const datei = designDatei();
if (!datei) {
  const vorlage = istTemplate();
  console.log(
    'Kein Design zum Abgleichen gefunden.\n' +
      '\n' +
      'Dieses Tor braucht die Bauanleitung des Design-Projekts:\n' +
      '  design/<Projekt>.dc.html\n' +
      '\n' +
      'Beim Portieren wird sie ohnehin dort abgelegt (siehe /port, Etappe 1,\n' +
      'Schritt 0). Ohne sie kann niemand prüfen, ob die Seite dem Design\n' +
      'entspricht – auch kein Mensch.' +
      (vorlage
        ? '\n\nDies ist das Referenz-Template – hier gibt es kein Kundendesign.\n' +
          'Beim Kunden wird daraus ein Abbruch.'
        : '\n\n✗ DAS IST KEIN GRÜNES TOR (CLAUDE.md Abschnitt 9).\n' +
          '  Die Design-Datei aus dem Claude-Design-Projekt nach design/ legen\n' +
          '  und erneut laufen lassen. Solange sie fehlt, ist Punkt 3c der\n' +
          '  Definition of Done NICHT erfüllt – auch wenn nichts rot ist.'),
  );
  process.exit(vorlage ? 0 : 1);
}

{
  const alle = readdirSync(DESIGN).filter((f) => f.endsWith('.dc.html')).sort();
  /* ALLE nennen, nicht nur die erste. Bis 05.08.2026 stand hier der Name
     EINER Datei, waehrend bei Form B vier danebenlagen – wer die Zeile las,
     hielt den Vergleich fuer vollstaendig. */
  console.log(alle.length === 1 ? `Design: ${alle[0]}` : `Design: ${alle.length} Dateien – ${alle.join(', ')}`);
}

// ---------------------------------------------------------------------------
//  1. Die Bauanleitung lesen – mit einem echten DOM, nicht mit Textsuche
//
//  Der Browser baut aus der Datei einen Baum, auch wenn er `<sc-if>` und
//  `<x-import>` nicht kennt (unbekannte Elemente sind erlaubt und landen ganz
//  normal im Baum). Damit lässt sich sauber durch die Ebenen gehen, statt mit
//  Ausdrücken über verschachtelte Klammern zu raten.
//
//  Die Skripte der Datei laufen dabei NICHT – wir setzen den Inhalt, ohne ihn
//  zu laden. Es geht um die Struktur, nicht um die Darstellung.
// ---------------------------------------------------------------------------
const browser = await chromium.launch();
/* DIESELBE FENSTERBREITE WIE DIE GEBAUTE SEITE (1440). Hier stand ein blankes
   `newPage()` – das sind 1280 px, während die gebaute Seite weiter unten mit
   1440 gemessen wird. Jeder fluide Wert (`clamp()`, `vw`, `%`) fällt bei 1280
   anders aus als bei 1440; allein daraus entstehen rund 9 % Unterschied, und
   die Toleranz des Schriftvergleichs liegt darunter. Das Tor meldete damit
   richtig gebaute Überschriften als Abweichung – und ein Tor, dessen
   Meldungen man wegwischt, ist wertlos. */
const seite = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

/* ALLE .dc.html LESEN, NICHT NUR DIE ERSTE.
   In Form B (eine Datei je Seite) liegen im Ordner mehrere; `designDatei()`
   nahm bis 05.08.2026 `treffer[0]` und verglich stillschweigend nur eine.
   In Form A gibt es ohnehin nur eine – dann laeuft die Schleife einmal. */
const designSeiten = await (async () => {
  const dateien = readdirSync(DESIGN)
    .filter((f) => f.endsWith('.dc.html'))
    .sort()
    .map((f) => join(DESIGN, f));

  const seitenAlle = [];
  let rahmenAlle = [];
  const schriftenAlle = new Set();

  for (const d of dateien) {
    await seite.setContent(readFileSync(d, 'utf-8'), { waitUntil: 'domcontentloaded' });
    const stamm = basename(d).replace(/\.dc\.html$/, '');
    const teil = await seite.evaluate((DATEI_STAMM) => {
    /** Aus einem style-Attribut die zwei Werte holen, auf die es ankommt. */
    const stilWert = (el, name) => {
      const roh = el.getAttribute('style') || '';
      const t = roh.match(new RegExp(`(?:^|;)\\s*${name}\\s*:\\s*([^;]+)`, 'i'));
      return t ? t[1].trim() : '';
    };
    /** Grundfarbe: erst `background`, sonst `background-color`. */
    const grund = (el) => stilWert(el, 'background') || stilWert(el, 'background-color');

    /**
     * Trägt der Inline-Stil eine Eigenschaft, deren Name auf `muster` passt und
     * die wirklich etwas ANSCHALTET? `none`, `0` und `initial` zählen nicht –
     * wer sie schreibt, schaltet die Sache ausdrücklich ab.
     *
     * Es wird der WERT geprüft, nicht der Text davor umschifft: Eine
     * Vorschau-Bedingung („darf nicht `none` folgen") lässt sich mit einem
     * vorangestellten `\s*` aushebeln, weil der Ausdruck die Leerzeichen wieder
     * hergeben darf und die Bedingung dann vor einem Leerzeichen prüft.
     */
    const hatEigenschaft = (el, muster) => {
      const roh = el.getAttribute('style') || '';
      for (const t of roh.matchAll(/(?:^|;)\s*([a-zA-Z-]+)\s*:\s*([^;]*)/g)) {
        if (!muster.test(t[1].trim().toLowerCase())) continue;
        const wert = t[2].trim().toLowerCase();
        if (!wert || wert === 'none' || wert === 'initial' || wert === 'unset') continue;
        if (/^0(?:[a-z%]*)?$/.test(wert)) continue;
        if (/(?:^|\s)none(?:\s|$)/.test(wert)) continue;
        return true;
      }
      return false;
    };

    /* ===================================================================
       ZWEI EXPORT-FORMEN, UND CLAUDE DESIGN LIEFERT BEIDE.
       ===================================================================
       FORM A – alle Seiten in EINER Datei. Jede Seite steht unter einem
       Schalter `<sc-if value="{{ isX }}">` direkt in `<main>`. So kommt es
       bei Projekten MIT eigenem Design-System.

       FORM B – eine Datei JE SEITE. Kein Seiten-Schalter; unter `<x-dc>`
       liegen `<helmet>` und ein einziger Wrapper, darin `<header>`, die
       Abschnitte und `<footer>`. So kommt es bei Projekten OHNE
       Design-System – und das ist der Regelfall bei Demos.

       Bis 05.08.2026 kannte das Tor nur Form A. Bei Form B fand es NULL
       Seiten und setzte trotzdem den Haken – also grün, ohne einen einzigen
       Block verglichen zu haben. Der Abbruch dagegen kam am selben Tag; jetzt
       kommt die Fähigkeit dazu.

       Gemessen an einem echten Export der Form B: `<x-dc>` hat zwei Kinder,
       `<helmet>` und einen `<div>`; darin 5 Abschnitte, teils mit `<main>`,
       teils ohne.
       =================================================================== */
    const seiten = [];
    const seitenWurzeln = [];

    /* FORM A zuerst versuchen. */
    for (const sc of document.querySelectorAll('sc-if')) {
      const treffer = (sc.getAttribute('value') || '').match(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/);
      if (!treffer) continue;
      /* Ein Seiten-Schalter steht DIREKT in <main>. Zwei Fallen, beide im
         ersten Lauf am 29.07.2026 aufgelaufen:

         1. Derselbe Schalter kommt auch in der KOPFLEISTE vor – dort schaltet
            er den Unterstrich unter dem aktiven Menüpunkt. Ohne diese Prüfung
            zählte das Werkzeug 16 Seiten statt 11 und verwässerte die
            Blockzahl mit einzelnen <span>.
         2. Zustände INNERHALB einer Seite (isSellForm, hasResults, sellDone)
            sehen genauso aus. Sie sind keine Seiten. */
      if (!/^is[A-Z]/.test(treffer[1])) continue;
      if (!sc.parentElement || sc.parentElement.tagName !== 'MAIN') continue;
      seitenWurzeln.push({ schalter: treffer[1], wurzel: sc });
    }

    /* FORM B: Die DATEI ist die Seite. Ihr Name wird zum Schalter – die
       Zuordnung in abgleich.json läuft dann über den Dateinamen statt über
       einen `is`-Namen. */
    const rahmenTeile = [];
    if (seitenWurzeln.length === 0) {
      const aussen = document.querySelector('x-dc') || document.body;
      const huellen = [...aussen.children].filter((k) => k.tagName !== 'HELMET' && k.tagName !== 'STYLE');
      const huelle = huellen.length === 1 ? huellen[0] : aussen;
      /* `<main>` ist der Inhaltsbereich, wenn es eines gibt. Gibt es keines –
         auch das kommt vor –, ist es alles ausser Kopf- und Fusszeile. Die
         beiden sind dann zugleich der RAHMEN; in Form A steht der ausserhalb
         von `<main>` und wird weiter unten geholt. */
      const main = huelle.querySelector(':scope > main');
      for (const k of huelle.children) {
        if (k.tagName === 'HEADER' || k.tagName === 'FOOTER') rahmenTeile.push(k);
      }
      seitenWurzeln.push({ schalter: DATEI_STAMM, wurzel: main || huelle, ohneRahmen: !main });
    }

    for (const { schalter, wurzel: sc, ohneRahmen } of seitenWurzeln) {

      /* Fast jedes Design verpackt eine Seite noch einmal in einen Rahmen,
         der nur die Seitenfarbe trägt – manchmal zwei. Zählt man den, hat
         jede Seite genau einen „Block" und der Vergleich ist wertlos (im
         ersten Lauf am 29.07.2026 genau so passiert: „Design: 1 Block,
         Gebaut: 6").

         Ein RAHMEN erkennt man daran, dass er mehrere Abschnitte enthält und
         selbst keine Polsterung hat – die Polsterung ist das, was einen
         echten Block ausmacht. Also so lange hineingehen, bis das nicht mehr
         zutrifft. Die Grundfarbe des Rahmens zählt dabei NICHT als Merkmal:
         Sie ist die Seitenfarbe, nicht die eines Blocks. */
      /* DREI EBENEN, WIE DER KOMMENTAR ES ZUSAGT.
         Hier stand `return kinder` mitten in der Schleife – damit endete sie
         IMMER im ersten Durchlauf, und `tiefe < 3` war eine Zusage ohne
         Wirkung. Ein Design, das seine Blöcke in zwei Hüllen legt (ein
         Wrapper fürs Raster, einer für die Breite – gängig), wurde nur eine
         Ebene weit aufgelöst; darunter zählte das Tor einen einzigen großen
         Block statt der fünf darin. „Block fehlt" ist genau die Klasse, die
         dieses Tor zuverlässig finden soll.

         Jetzt geht es Ebene für Ebene weiter, solange die Bedingungen halten,
         und liefert am Ende die tiefste Menge. */
      const hineingehen = (el) => {
        let ebene = [el];
        for (let tiefe = 0; tiefe < 3; tiefe++) {
          if (ebene.length !== 1) break;
          const e = ebene[0];
          const kinder = [...e.children];
          if (kinder.length < 2) break;
          if (stilWert(e, 'padding') || stilWert(e, 'padding-block')) break;
          if (!kinder.every((k) => /^(SECTION|DIV|HEADER|FOOTER|ARTICLE|ASIDE|NAV|SC-IF)$/.test(k.tagName))) break;
          ebene = kinder;
        }
        return ebene;
      };

      const bloecke = [];
      const inhaltsKinder = ohneRahmen
        ? [...sc.children].filter((k) => k.tagName !== 'HEADER' && k.tagName !== 'FOOTER')
        : [...sc.children];
      for (const kind of inhaltsKinder) {
        for (const b of hineingehen(kind)) {
          /* Nur h1/h2 zählen als Block-Überschrift. h3 trägt im Design die
             Titel EINZELNER Karten („Ford B-MAX") – die wandern mit dem
             Bestand und sind kein Merkmal des Blocks.
             Ausserdem raus: alles aus Schleifen (<sc-for>) und aus Zuständen
             (<sc-if>) – Wiederholungen bzw. Klick-Zustände, keine Blöcke.
             Und Platzhalter wie „{{ curTitle }}", die im Design nur
             stellvertretend stehen. Alle drei erzeugten im Probelauf
             Falschmeldungen. */
          const inWiederholung = (h) => {
            // NUR den Weg INNERHALB des Blocks prüfen. `closest()` lief bis zum
            // Seiten-Schalter hinauf – und der ist selbst ein <sc-if>, also galt
            // jede Überschrift als Wiederholung und die Design-Seite kam ohne
            // eine einzige heraus.
            let e = h.parentElement;
            while (e && e !== b) {
              if (e.tagName === 'SC-FOR' || e.tagName === 'SC-IF') return true;
              e = e.parentElement;
            }
            return false;
          };
          const ueberschrift = [...b.querySelectorAll('h1,h2')].find(
            (h) => !inWiederholung(h) && !h.textContent.includes('{{'),
          );
          /* DIE SCHRIFT DER ÜBERSCHRIFT – gerechnet, nicht aus dem Text geraten.
             Erfasst wird NUR, was das Design am Element SELBST deklariert; alles
             andere bliebe die Vorgabe des Browsers und würde gegen die Vorgabe
             des Motors gemessen. Genau daraus entstünde der Fehlalarm, der
             diese ganze Vergleichsklasse bisher verhindert hat. */
          const typo = (() => {
            if (!ueberschrift) return null;
            const roh = ueberschrift.getAttribute('style') || '';
            const deklariert = new Set(
              [...roh.matchAll(/(?:^|;)\s*([a-zA-Z-]+)\s*:/g)].map((m) => m[1].trim().toLowerCase()),
            );
            if (deklariert.size === 0) return null;
            const s = getComputedStyle(ueberschrift);
            const groesse = parseFloat(s.fontSize) || 0;
            return {
              deklariert: [...deklariert],
              fontSize: groesse,
              // Verhältnis statt Pixel: Wandert die Größe aus einem erlaubten
              // Grund, wandert die Zeilenhöhe mit – das Verhältnis bleibt.
              zeile: s.lineHeight === 'normal' || !groesse ? null : parseFloat(s.lineHeight) / groesse,
              sperrung: s.letterSpacing === 'normal' || !groesse ? 0 : parseFloat(s.letterSpacing) / groesse,
              schnitt: parseFloat(s.fontWeight) || 400,
              grossschreibung: s.textTransform,
            };
          })();
          bloecke.push({
            tag: b.tagName.toLowerCase(),
            klasse: b.getAttribute('class') || '',
            invertiert: /asc-invert|invert/.test(b.getAttribute('class') || ''),
            grundfarbe: grund(b),
            polsterung: stilWert(b, 'padding') || stilWert(b, 'padding-block'),
            ueberschrift: ueberschrift ? ueberschrift.textContent.trim().slice(0, 60) : '',
            typo,
            /* DREI EIGENSCHAFTEN, DIE DAS TOR BIS ZUM 30.07.2026 GAR NICHT ANSAH
               (nachgezählt: je null Treffer im Skript). Ein Design konnte sich
               in Schatten, Rahmen und Bildzuschnitt unterscheiden, und der
               Abgleich blieb grün.

               Bei zweien wird nur das VORHANDENSEIN verglichen, nicht der Wert:
               Das Design schreibt Token-Namen (`var(--shadow-md)`), deren Wert
               nur die Token-Datei kennt – aus dem Namen einen Zahlenwert zu
               raten hat sich beim Bau schon einmal gerächt.

               `object-fit` ist der Sonderfall und der wertvollste: Es sind
               feste Schlüsselwörter (cover/contain/fill), also direkt
               vergleichbar. Und genau daran hing die dokumentierte Falle
               (CLAUDE.md Abschnitt 4): `:global()` in einer .css-Datei
               verwirft die GANZE Regel, `object-fit: cover` fiel weg, und jedes
               Bild mit unpassendem Seitenverhältnis bekam schwarze Balken. */
            hatSchatten: hatEigenschaft(b, /^box-shadow$/),
            /* NUR ECHTE RAHMEN-EIGENSCHAFTEN. Der Ausdruck hier war
               `border(?:-[a-z]+)?` und traf damit auch `border-radius` – also
               ausgerechnet die Eigenschaft, die fast jede Karte trägt und die
               mit einem Rahmen nichts zu tun hat. Ergebnis: „Rahmen fehlt" bei
               jedem abgerundeten Block, obwohl im Design nie einer war.
               Zweiter Fehler in derselben Zeile: `\s*(?!none|0)` hat den
               Ausschluss nie durchgesetzt, weil der Ausdruck die Leerzeichen
               zurückgeben und die Vorschau vor dem Wert ansetzen konnte –
               `border: none` galt damit als Rahmen. Deshalb wird der Wert
               jetzt geholt und geprüft, statt ihn zu umschiffen. */
            hatRahmen: hatEigenschaft(
              b,
              /^border(?:-(?:top|right|bottom|left|block|inline|width|style|color))?$/,
            ),
            bildZuschnitt: [
              ...new Set(
                [b, ...b.querySelectorAll('*')]
                  .map((x) => stilWert(x, 'object-fit'))
                  .filter(Boolean),
              ),
            ].sort(),
            bauteile: [...b.querySelectorAll('x-import[component-from-global-scope]')]
              .map((x) => (x.getAttribute('component-from-global-scope') || '').split('.').pop())
              .filter(Boolean),
            zustaende: [...b.querySelectorAll('sc-if')]
              .map((x) => ((x.getAttribute('value') || '').match(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/) || [])[1])
              .filter(Boolean),
          });
        }
      }
      /* In Form B sind Kopf- und Fusszeile Geschwister des Inhalts, nicht
         Kinder – sie stehen deshalb nicht in `bloecke`, sondern im Rahmen. */
      seiten.push({ schalter, bloecke });
    }

    /* Der RAHMEN: alles ausserhalb von <main>, also Kopfleiste, Fusszeile und
       was sonst auf jeder Seite steht (Schwebeknöpfe, globale Dialoge). Genau
       dort saß im Testlauf der grobste Befund – ein Knopf, der auf keiner der
       sechzehn Seiten existierte. */
    /* IN FORM B STEHT DER RAHMEN IM WRAPPER, NICHT DANEBEN.
       Dort liegen unter `<x-dc>` nur `<helmet>` und EIN `<div>`; Kopf- und
       Fusszeile sind dessen Kinder. Die Schleife unten fände deshalb genau
       einen „Rahmen-Teil" – den Wrapper – und damit nichts Brauchbares.
       Gemessen an einem echten Export: `<x-dc>` hat zwei Kinder.
       `rahmenTeile` wurde oben beim Erkennen der Form gefüllt. */
    /* Die sichtbaren Beschriftungen der Verweise eines Rahmenteils.
       Sie sind das einzige Merkmal, das in BEIDEN Export-Formen dasteht: Form A
       navigiert ueber `onClick` ohne href, Form B ueber echte Adressen. Der
       Text steht immer. */
    const verweiseVon = (el) =>
      [...el.querySelectorAll('a,button')]
        .map((a) => (a.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase())
        .filter((t) => t && t.length < 40 && !t.includes('{{'));

    const rahmen = [];
    const wurzel = document.querySelector('x-dc') || document.body;
    const rahmenQuelle = rahmenTeile.length > 0 ? rahmenTeile : [...wurzel.children];
    for (const el of rahmenQuelle) {
      if (el.tagName === 'MAIN' || el.tagName === 'HELMET' || el.tagName === 'STYLE') continue;
      const inneres = el.tagName === 'SC-IF' ? el.firstElementChild : el;
      if (!inneres) continue;
      rahmen.push({
        tag: inneres.tagName.toLowerCase(),
        fest: /position:\s*fixed/i.test(inneres.getAttribute('style') || ''),
        grundfarbe: grund(inneres),
        bauteile: [...inneres.querySelectorAll('x-import[component-from-global-scope]')]
          .map((x) => (x.getAttribute('component-from-global-scope') || '').split('.').pop())
          .filter(Boolean),
        kennung:
          (inneres.getAttribute('aria-label') || '').slice(0, 40) ||
          (inneres.getAttribute('class') || '').slice(0, 40) ||
          inneres.tagName.toLowerCase(),
        verweise: verweiseVon(inneres),
      });
    }
    /* Welche Schriften nennt das Design ueberhaupt? Gezaehlt werden die
       verschiedenen `font-family`-Werte in der ganzen Datei – meist zwei:
       eine fuer Ueberschriften, eine fuer Fliesstext. */
    const schriften = new Set();
    for (const el of document.querySelectorAll('[style*="font-family"]')) {
      const t = (el.getAttribute('style') || '').match(/font-family\s*:\s*([^;]+)/i);
      if (t) schriften.add(t[1].trim());
    }
    for (const st of document.querySelectorAll('style')) {
      for (const m of (st.textContent || '').matchAll(/font-family\s*:\s*([^;}]+)/gi)) {
        schriften.add(m[1].trim());
      }
    }
    return { seiten, rahmen, schriften: [...schriften] };
    }, stamm);

    seitenAlle.push(...teil.seiten);
    for (const f of teil.schriften) schriftenAlle.add(f);
    /* Der Rahmen ist auf jeder Seite derselbe – der erste Fund gilt. Waere er
       je Datei verschieden, waere das ein Design-Befund; ihn hier zu mitteln
       wuerde ihn verstecken. */
    if (rahmenAlle.length === 0) rahmenAlle = teil.rahmen;
  }

  return { seiten: seitenAlle, rahmen: rahmenAlle, schriften: [...schriftenAlle], dateien: dateien.length };
})();

const designSchriften = new Set(designSeiten.schriften ?? []);

console.log(
  `  ${designSeiten.seiten.length} Seite(n) im Design, ` +
    `${designSeiten.seiten.reduce((n, s) => n + s.bloecke.length, 0)} Block/Blöcke, ` +
    `${designSeiten.rahmen.length} Rahmen-Teil(e)`,
);

/* NULL ERKANNTE SEITEN IST KEIN GRÜNES TOR.
   ---------------------------------------------------------------------------
   Die Seitenerkennung setzt EINE bestimmte Export-Form voraus: alle Seiten in
   EINER Datei, jede unter einem Schalter `<sc-if value="{{ isX }}">` direkt in
   `<main>`. Claude Design liefert aber auch eine zweite Form – eine Datei JE
   Seite, und der Schalter im Inneren steht dann für etwas anderes (etwa die
   Sprache: `{{ de }}` / `{{ en }}`).

   In dieser zweiten Form findet die Schleife oben NICHTS. Ohne diese Prüfung
   lief das Tor dann durch: „0 Seite(n) im Design", danach vergleicht die
   Hauptschleife null Seiten, und am Ende steht ein grüner Haken. Also genau
   der Zustand, den der Kasten weiter oben für die FEHLENDE Datei schon
   abgestellt hat – nur eine Ebene später und deshalb übersehen.

   Ein Tor, das grün meldet, ohne etwas verglichen zu haben, ist schlimmer als
   keines: Punkt 3c der Definition of Done gilt als erfüllt, und niemand sieht
   mehr nach. Deshalb hier ein Abbruch mit der Diagnose statt eines Hakens.

   Mehrere .dc.html im Ordner sind ein starker Hinweis auf die zweite Form –
   verglichen würde ohnehin nur die erste Datei (`designDatei()` nimmt
   `treffer[0]`), also wird auch das gesagt. */
if (designSeiten.seiten.length === 0) {
  const weitere = readdirSync(DESIGN).filter((f) => f.endsWith('.dc.html'));
  console.log(
    '\n✗ In der Design-Datei wurde KEINE einzige Seite erkannt.\n' +
      '\n' +
      '  Erwartet wird ein Seiten-Schalter je Seite, direkt in <main>:\n' +
      '      <main><sc-if value="{{ isHome }}"> … </sc-if></main>\n' +
      '\n' +
      (weitere.length > 1
        ? `  Im Ordner design/ liegen ${weitere.length} .dc.html-Dateien ` +
          `(${weitere.join(', ')}).\n` +
          '  Verglichen wurde nur die erste. Das deutet auf die andere Export-Form\n' +
          '  hin: EINE Datei JE SEITE. Die versteht dieses Tor noch nicht.\n'
        : '  Gefunden wurde keiner. Möglich ist die andere Export-Form – eine\n' +
          '  Datei je Seite – die dieses Tor noch nicht versteht.\n') +
      '\n' +
      '  DAS IST KEIN GRÜNES TOR (CLAUDE.md Abschnitt 9, Punkt 3c).\n' +
      '  Punkt 3d bleibt Pflicht und ersetzt es hier: Design-Datei neben die\n' +
      '  gebaute Seite legen und Block für Block mit eigenen Augen vergleichen.\n' +
      '  Und: als Motor-Meldung in STAND.md eintragen – das Tor gehört auf\n' +
      '  diese zweite Export-Form erweitert.',
  );
  await browser.close();
  process.exit(1);
}

// ---------------------------------------------------------------------------
//  2. Zuordnung Design-Seite -> Route
//
//  DAS IST DIE STELLE, AN DER EIN FRÜHERER VERSUCH GESCHEITERT IST: In einem
//  Kundenprojekt stand die Zuordnung als Liste IM Skript. Damit war das
//  Werkzeug nicht ins Template hebbar – und ins Template dürfen ohnehin keine
//  Kundendaten. Sie gehört also in den Klon, als eigene kleine Datei.
//
//  Fehlt sie, wird sie nicht geraten, sondern vorgeschlagen: Das Werkzeug
//  schreibt einen Entwurf mit allen gefundenen Schaltern und hört auf.
// ---------------------------------------------------------------------------
if (!existsSync(ZUORDNUNG)) {
  const entwurf = Object.fromEntries(designSeiten.seiten.map((s) => [s.schalter, '']));
  writeFileSync(ZUORDNUNG, JSON.stringify(entwurf, null, 2) + '\n', 'utf-8');
  console.log(
    `\n✗ Es fehlt die Zuordnung, welche Design-Seite welche Adresse geworden ist.\n` +
      `\n  Ein Entwurf liegt jetzt in design/abgleich.json. Trage dort je Schalter\n` +
      `  die Adresse ein, z. B.:\n` +
      `\n      "isHome": "/",\n      "isListing": "/fahrzeuge",\n` +
      `\n  Eine Seite, die es bewusst nicht geben soll, bekommt "" – dann wird sie\n` +
      `  übersprungen und im Bericht als bewusst weggelassen genannt.`,
  );
  await browser.close();
  process.exit(1);
}

const zuordnung = JSON.parse(readFileSync(ZUORDNUNG, 'utf-8'));

/* EINE LEERE ZUORDNUNG DARF NICHT GRÜN WERDEN.
   Der Entwurf oben schreibt jeden Schalter mit "" – und "" heißt weiter unten
   „bewusst weggelassen, überspringen". Wer den Entwurf also einfach liegen
   lässt und noch einmal startet, bekommt einen Lauf, der JEDE Seite
   überspringt und mit Haken endet. In der Abnahme-Liste gilt der Punkt damit
   als erledigt, obwohl nichts verglichen wurde.

   Genau dieser Fehlertyp wurde an zwei anderen Stellen dieses Tores schon
   abgestellt; er war nur eine Ebene tiefer gerutscht. */
if (designSeiten.seiten.length > 0 && designSeiten.seiten.every((s) => !zuordnung[s.schalter])) {
  console.log(
    `\n✗ In design/abgleich.json ist keine einzige Adresse eingetragen.\n` +
      `  Alle ${designSeiten.seiten.length} Design-Seite(n) wären damit „bewusst weggelassen" –\n` +
      `  der Lauf hätte NICHTS verglichen und trotzdem grün gemeldet.\n` +
      `  Trage je Schalter die Adresse ein, z. B. "isHome": "/".`,
  );
  await browser.close();
  process.exit(1);
}

const fehlend = designSeiten.seiten.filter((s) => !(s.schalter in zuordnung));
if (fehlend.length) {
  console.log(
    `\n✗ design/abgleich.json kennt ${fehlend.length} Design-Seite(n) nicht: ` +
      fehlend.map((s) => s.schalter).join(', ') +
      `\n  Eintragen (Adresse oder "" für bewusst weggelassen).`,
  );
  await browser.close();
  process.exit(1);
}

// ---------------------------------------------------------------------------
//  3. Die gebaute Seite messen
// ---------------------------------------------------------------------------
const DIST = join(WURZEL, 'dist');
if (!existsSync(join(DIST, 'index.html'))) await browser.close(); // Browser schliessen, bevor unten abgebrochen wird
verlangeAktuellesDist(WURZEL, 'npm run abgleich');
const { basis, stop } = await starteDistServer(DIST);

async function gebauteSeite(pfad) {
  const p = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const antwort = await p.goto(basis + pfad, { waitUntil: 'load' }).catch(() => null);
  if (!antwort || antwort.status() >= 400) {
    await p.close();
    return undefined;
  }
  const daten = await p.evaluate(() => {
    const sichtbar = (el) => {
      const s = getComputedStyle(el);
      return s.display !== 'none' && s.visibility !== 'hidden';
    };
    const hauptteil = document.querySelector('main') || document.body;
    const bloecke = [];
    for (const b of hauptteil.children) {
      if (!sichtbar(b)) continue;
      const s = getComputedStyle(b);
      // Ein reiner Rahmen ohne eigene Fläche zählt nicht als Block – seine
      // Kinder tun es. Sonst zählte man den Wrapper statt der Abschnitte.
      /* Gleiche Regel wie auf der Design-Seite: Ein RAHMEN hat mehrere
         Abschnitte und keine eigene Polsterung. In ihn wird hineingegangen,
         sonst zählt man den Rahmen statt der Blöcke (im ersten Lauf ergab das
         „1 statt 5 Blöcke" auf der Detailseite). */
      const hinein = (el) => {
        let e = el;
        for (let tiefe = 0; tiefe < 3; tiefe++) {
          const kinder = [...e.children].filter(sichtbar);
          const st = getComputedStyle(e);
          if (kinder.length < 2) break;
          if (parseFloat(st.paddingTop) > 8) break;
          if (!kinder.every((k) => /^(SECTION|DIV|HEADER|FOOTER|ARTICLE|ASIDE|NAV)$/.test(k.tagName))) break;
          return kinder;
        }
        return [e];
      };
      for (const x of hinein(b)) {
        const st = getComputedStyle(x);
        // Nur h1/h2 – siehe Begründung auf der Design-Seite oben.
        const h = x.querySelector('h1,h2');
        bloecke.push({
          tag: x.tagName.toLowerCase(),
          klasse: (x.getAttribute('class') || '').slice(0, 60),
          grundfarbe: st.backgroundColor,
          grundbild: st.backgroundImage !== 'none',
          polsterungOben: Math.round(parseFloat(st.paddingTop) || 0),
          /* `hoehe` stand hier und wurde nie gelesen. Sie ist auch nicht
             vergleichbar: Die Design-Datei hat keine gerechnete Höhe (sie wird
             nie gerendert), und die gebaute Höhe hängt an der Textlänge des
             echten Inhalts. Ein Vergleich hätte bei jedem Block angeschlagen. */
          ueberschrift: h ? h.textContent.trim().slice(0, 60) : '',
          /* Gegenstück zur Schrift-Erfassung der Design-Seite. Hier ohne
             Deklarations-Bedingung: Verglichen wird ohnehin nur, was das
             DESIGN deklariert – die gebaute Seite liefert dazu den
             gerechneten Ist-Wert, egal woher er kommt. */
          typo: h
            ? (() => {
                const hs = getComputedStyle(h);
                const groesse = parseFloat(hs.fontSize) || 0;
                return {
                  fontSize: groesse,
                  zeile:
                    hs.lineHeight === 'normal' || !groesse ? null : parseFloat(hs.lineHeight) / groesse,
                  sperrung:
                    hs.letterSpacing === 'normal' || !groesse
                      ? 0
                      : parseFloat(hs.letterSpacing) / groesse,
                  schnitt: parseFloat(hs.fontWeight) || 400,
                  grossschreibung: hs.textTransform,
                  textIstGross: (h.textContent || '').trim() === (h.textContent || '').trim().toUpperCase(),
                };
              })()
            : null,
          /* Gegenstücke zu den Eigenschaften der Design-Seite.
             DIE SCHRIFTFAMILIE FEHLT HIER MIT ABSICHT: Sie wurde zwar erhoben,
             aber nie verglichen – und ein Vergleich wäre auch nicht möglich
             gewesen. Auf der Design-Seite steht ein Inline-Stil (gesetzt oder
             nicht), auf der gebauten Seite steht der GERECHNETE Wert, und der
             ist immer gesetzt, weil er vom Körper geerbt wird. Beides
             gegeneinanderzuhalten hätte jeden Block als Abweichung gemeldet.
             Welche Schrift wirklich geladen wird, prüft `npm run check`. */
          hatSchatten: st.boxShadow !== 'none' && st.boxShadow !== '',
          hatRahmen: ['Top', 'Right', 'Bottom', 'Left'].some(
            (s) => parseFloat(st[`border${s}Width`]) > 0,
          ),
          bildZuschnitt: [
            ...new Set(
              [x, ...x.querySelectorAll('img,picture>img,video')]
                .map((el) => getComputedStyle(el).objectFit)
                // `fill` ist der Vorgabewert des Browsers – nur was ABWEICHT zählt.
                .filter((v) => v && v !== 'fill'),
            ),
          ].sort(),
        });
      }
    }
    // Der Rahmen: was ausserhalb von <main> steht.
    const rahmen = [...document.body.querySelectorAll('body > *')]
      .filter((el) => !['MAIN', 'SCRIPT', 'STYLE', 'TEMPLATE'].includes(el.tagName) && sichtbar(el))
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        fest: getComputedStyle(el).position === 'fixed',
        kennung: (el.getAttribute('aria-label') || el.getAttribute('class') || el.tagName).slice(0, 40),
        verweise: [...el.querySelectorAll('a,button')]
          .map((a) => (a.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase())
          .filter((t) => t && t.length < 40),
      }));
    // Zusätzlich alles fest Positionierte irgendwo im Dokument (Schwebeknöpfe
    // hängen oft tiefer im Baum).
    for (const el of document.querySelectorAll('a,button,div')) {
      if (getComputedStyle(el).position !== 'fixed' || !sichtbar(el)) continue;
      if (rahmen.some((r) => r.fest && r.kennung === (el.getAttribute('aria-label') || ''))) continue;
      rahmen.push({
        tag: el.tagName.toLowerCase(),
        fest: true,
        kennung: (el.getAttribute('aria-label') || el.getAttribute('class') || el.tagName).slice(0, 40),
      });
    }
    /* Welche Schriftfamilien rendert die Seite wirklich? Erste Familie der
       Liste, ueber Ueberschriften und Fliesstext. */
    const schriften = [
      ...new Set(
        [...document.querySelectorAll('h1,h2,h3,p,li,button,a')]
          .map((el) => (getComputedStyle(el).fontFamily || '').split(',')[0].replace(/["']/g, '').trim())
          .filter(Boolean),
      ),
    ];
    return { bloecke, rahmen, schriften };
  });
  await p.close();
  return daten;
}

// ---------------------------------------------------------------------------
//  4. Vergleichen – in BEIDE Richtungen
// ---------------------------------------------------------------------------
const befunde = [];
const zeilen = [];
/* WIE VIELE UEBERSCHRIFTEN WURDEN WIRKLICH AUF SCHRIFT VERGLICHEN?
   Die Regel greift nur, wo das Design die Eigenschaft am Element SELBST
   deklariert. Ein Design, das seine Ueberschriften ueber eine Klasse in einer
   eigenen CSS-Datei formatiert, liefert null vergleichbare Elemente - und die
   Pruefung schweigt dann, ohne dass es jemand merkt. Deshalb steht die Zahl in
   der Ergebniszeile: „0 verglichen" ist eine Aussage, kein Haken. */
let verglicheneSchrift = 0;
/** Was das Tor NICHT vergleichen kann, aber dem Auge übergibt (siehe unten). */
const sichtliste = [];
const melde = (schwere, seiteName, was, design, gebaut) =>
  befunde.push({ schwere, seite: seiteName, was, design, gebaut });

/** Ist eine gemessene Farbe dunkel? */
const istDunkel = (rgb) => {
  const t = String(rgb).match(/(\d+),\s*(\d+),\s*(\d+)/);
  if (!t) return false;
  return (+t[1] * 299 + +t[2] * 587 + +t[3] * 114) / 1000 < 110;
};

/** Überschrift auf das Vergleichbare eindampfen. */
const kern = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^a-zäöüß0-9]+/g, ' ')
    .trim();

for (const dSeite of designSeiten.seiten) {
  const route = zuordnung[dSeite.schalter];
  if (!route) {
    zeilen.push(`  ↷ ${dSeite.schalter.padEnd(16)} bewusst weggelassen`);
    continue;
  }
  const gebaut = await gebauteSeite(route.endsWith('/') ? route : route + '/');
  if (!gebaut) {
    melde('schwer', dSeite.schalter, `Die Seite gibt es im Build nicht: ${route}`, `${dSeite.bloecke.length} Blöcke`, 'keine Seite');
    zeilen.push(`  ✗ ${dSeite.schalter.padEnd(16)} ${route} – nicht gebaut`);
    continue;
  }

  const dz = dSeite.bloecke.length;
  const gz = gebaut.bloecke.length;
  if (dz !== gz) {
    melde(
      Math.abs(dz - gz) > 1 ? 'schwer' : 'mittel',
      dSeite.schalter,
      dz > gz ? `${dz - gz} Block/Blöcke fehlen` : `${gz - dz} Block/Blöcke zu viel`,
      `${dz} Blöcke`,
      `${gz} Blöcke`,
    );
  }

  /* ÜBERSCHRIFTEN VERGLEICHEN – das tragfähigste Merkmal.
     Sie stehen in der Design-Datei als wörtlicher Text und in der gebauten
     Seite auch. Damit fällt in einem Durchgang auf: ein fehlender Block, ein
     erfundener Block, ein vertauschter Block UND ein geänderter Text.
     (Die naheliegende Alternative – Grundfarben vergleichen – wurde im Bau
     verworfen: Das Design schreibt Token-Namen wie `var(--surface-sunken)`,
     deren Wert nur die Token-Datei kennt. Aus dem Namen auf hell/dunkel zu
     schließen war Raterei und erzeugte im Probelauf sechs Falschmeldungen.) */
  const dTitel = dSeite.bloecke.map((b) => kern(b.ueberschrift)).filter(Boolean);
  const gTitel = gebaut.bloecke.map((b) => kern(b.ueberschrift)).filter(Boolean);

  for (const t of dTitel) {
    if (gTitel.includes(t)) continue;
    const d = dSeite.bloecke.find((b) => kern(b.ueberschrift) === t);
    melde('schwer', dSeite.schalter, `Der Block „${d.ueberschrift}" fehlt`, d.ueberschrift, '—');
  }
  for (const t of gTitel) {
    if (dTitel.includes(t)) continue;
    const g = gebaut.bloecke.find((b) => kern(b.ueberschrift) === t);
    melde(
      'mittel',
      dSeite.schalter,
      `Der Block „${g.ueberschrift}" steht auf der Seite, im Design gibt es ihn nicht`,
      '—',
      g.ueberschrift,
    );
  }
  // Reihenfolge: nur die Titel vergleichen, die es auf beiden Seiten gibt.
  const gemeinsamD = dTitel.filter((t) => gTitel.includes(t));
  const gemeinsamG = gTitel.filter((t) => dTitel.includes(t));
  if (gemeinsamD.join('|') !== gemeinsamG.join('|')) {
    melde('schwer', dSeite.schalter, 'Die Blöcke stehen in einer anderen Reihenfolge', gemeinsamD.join(' → '), gemeinsamG.join(' → '));
  }

  /* Grundfarbe nur dort, wo das Design es AUSDRÜCKLICH sagt – über die
     Umkehr-Klasse, nicht über einen geratenen Farbwert. Ein heller Kasten auf
     schwarzem Grund (oder umgekehrt) ist der Fehler, den man aus zehn Metern
     sieht, und die Klasse steht wörtlich in der Datei. */
  /* DIE VIER EIGENSCHAFTEN, die das Tor bis zum 30.07.2026 nicht ansah.
     Zuordnung über die Überschrift, nie über die Position – siehe unten. */
  for (const d of dSeite.bloecke) {
    if (!d.ueberschrift) continue;
    const g = gebaut.bloecke.find((x) => kern(x.ueberschrift) === kern(d.ueberschrift));
    if (!g) continue; // Fehlt ganz – steht schon als eigener Befund da.

    /* Bei den übrigen dreien wird nur das VORHANDENSEIN verglichen: Das Design
       schreibt Token-Namen, deren Wert nur die Token-Datei kennt. „Design sagt
       Schatten, gebaut ist keiner" ist trotzdem ein echter Befund – und war
       bisher unsichtbar. */
    if (d.hatSchatten && !g.hatSchatten) {
      melde('mittel', dSeite.schalter, `„${d.ueberschrift}" hat im Design einen Schatten, gebaut keinen`, 'box-shadow gesetzt', 'none');
    }
    if (d.hatRahmen && !g.hatRahmen) {
      melde('mittel', dSeite.schalter, `„${d.ueberschrift}" hat im Design einen Rahmen, gebaut keinen`, 'border gesetzt', '0px');
    }

    /* DIE SCHRIFT DER ÜBERSCHRIFT – Wert gegen Wert.
       =======================================================================
       Bis 05.08.2026 stand im Kopf dieser Datei, Schriftgrößen und
       Zeilenhöhen seien nicht vergleichbar, weil „das Design sie fast immer
       als Token schreibt". An einer echten Design-Datei nachgezählt ist das
       für diese Eigenschaften das GEGENTEIL: 157 feste font-size-Werte und
       kein einziger Token, 71 Zeilenhöhen, alle als Zahl. Nur bei den Radien
       stimmt die Aussage (37 Token gegen 7 feste Werte) – die bleiben deshalb
       weiter draußen.

       Das Tor hat also genau die Werte nicht verglichen, die vergleichbar
       sind, mit einer Begründung, die für eine einzige Eigenschaft gilt.

       DIE TRAGENDE REGEL IST EINE STRUKTUR-BEDINGUNG, keine Eigenschaft:
       Verglichen wird NUR, was das Design am Element SELBST deklariert
       (`d.typo.deklariert`). Sonst misst man die Vorgabe des Browsers auf der
       Design-Seite gegen die Vorgabe des Motors auf der gebauten – die
       Design-Datei bringt ihr Grund-Stylesheet nämlich nicht mit. Das wäre
       die einzige echte Fehlalarmquelle hier, und sie ist damit weg.

       Die Toleranzen sind bewusst großzügig: Jede deckt eine Abweichung ab,
       die der Port laut Regelwerk machen DARF. */
    if (d.typo && g.typo) {
      const nennt = (name) => d.typo.deklariert.includes(name);

      /* SCHRIFTGRÖSSE: melden nur, wenn die Abweichung GLEICHZEITIG über 2 px
         und über 8 % liegt. Die 8 % decken das Ersetzen einer Design-Stufe
         durch die nächste Motor-Stufe ab (CLAUDE.md 4, Umrechnungstabelle).
         Unter 12 px im Design wird gar nicht verglichen – dort schlägt die
         Untergrenze des Motors das Design, Abweichen ist Pflicht. */
      if (nennt('font-size') && d.typo.fontSize >= 12 && g.typo.fontSize) {
        const ab = Math.abs(g.typo.fontSize - d.typo.fontSize);
        if (ab > 2 && ab / d.typo.fontSize > 0.08) {
          melde(
            'mittel',
            dSeite.schalter,
            `„${d.ueberschrift}": Schriftgröße weicht ab`,
            `${Math.round(d.typo.fontSize)}px`,
            `${Math.round(g.typo.fontSize)}px`,
          );
        }
      }

      /* ZEILENHÖHE als VERHÄLTNIS, nicht in Pixeln. Weicht die Größe aus
         einem erlaubten Grund ab, wandert die Zeilenhöhe mit – das Verhältnis
         bleibt. `normal` auf einer der beiden Seiten wird übersprungen: Die
         Design-Datei lädt die Schriftdateien nicht und fällt auf eine
         Systemschrift zurück. */
      if (nennt('line-height') && d.typo.zeile != null && g.typo.zeile != null) {
        if (Math.abs(g.typo.zeile - d.typo.zeile) > 0.15) {
          melde(
            'mittel',
            dSeite.schalter,
            `„${d.ueberschrift}": Zeilenhöhe weicht ab`,
            d.typo.zeile.toFixed(2),
            g.typo.zeile.toFixed(2),
          );
        }
      }

      /* SPERRUNG in em, aus demselben Grund. Eng toleriert (0,01 em), weil
         der Motor selbst nirgends ein letter-spacing setzt – es gibt also
         keinen Grund, warum es abweichen sollte. */
      if (nennt('letter-spacing') && Math.abs(g.typo.sperrung - d.typo.sperrung) > 0.01) {
        melde(
          'mittel',
          dSeite.schalter,
          `„${d.ueberschrift}": Sperrung weicht ab`,
          `${d.typo.sperrung.toFixed(3)}em`,
          `${g.typo.sperrung.toFixed(3)}em`,
        );
      }

      /* SCHRIFTSCHNITT: 200 Einheiten. 600 gegen 700 ist ein Streit über den
         Schnitt und schweigt; 400 gegen 700 ist der Fehler. */
      if (nennt('font-weight') && Math.abs(g.typo.schnitt - d.typo.schnitt) >= 200) {
        melde(
          'mittel',
          dSeite.schalter,
          `„${d.ueberschrift}": Schriftschnitt weicht ab`,
          String(d.typo.schnitt),
          String(g.typo.schnitt),
        );
      }

      /* GROSSSCHREIBUNG: Schlüsselwörter, also exakt. Übersprungen wird, was
         ohnehin schon groß geschrieben dasteht – dort ist `text-transform`
         wirkungslos und die Abweichung folgenlos. */
      if (
        nennt('text-transform') &&
        d.typo.grossschreibung !== g.typo.grossschreibung &&
        !g.typo.textIstGross
      ) {
        melde(
          'mittel',
          dSeite.schalter,
          `„${d.ueberschrift}": Großschreibung weicht ab`,
          d.typo.grossschreibung,
          g.typo.grossschreibung,
        );
      }
      verglicheneSchrift++;
    }

    /* INNENABSTAND – der einzige MASS, das sich wirklich vergleichen lässt.
       CLAUDE.md Abschnitt 4 verlangt Innenabstände ausdrücklich Wert für Wert;
       das Tor hat sie bis zum 31.07.2026 zwar EINGESAMMELT und nie angesehen.
       Genau daraus entsteht der Fehler, den der Abschnitt beschreibt: eine
       Seite aus lauter richtigen Bauteilen, deren Bänder zu eng oder zu weit
       stehen – sie wirkt fertig und ist es nicht.

       NUR BEI EINEM GLATTEN PIXELWERT. Bringt das Design `clamp()`, `var()`
       oder eine Prozentangabe mit, ist der Sollwert ohne die Token-Datei nicht
       bekannt – dann lieber schweigen als raten. Genau das Raten hat in
       früheren Läufen die Falschmeldungen erzeugt.

       TOLERANZ 8 px: Die Skala des Motors trifft die Design-Werte bei 1280 px
       nur ungefähr (CLAUDE.md, Umrechnungstabelle), und fluide Werte wandern
       mit der Fensterbreite. Gemeint ist der grobe Fehler – 92 px im Design,
       24 px gebaut –, nicht die letzte Nachkommastelle. */
    const dPad = String(d.polsterung || '').trim().match(/^(\d+(?:\.\d+)?)px\b/);
    if (dPad && typeof g.polsterungOben === 'number') {
      const soll = Math.round(parseFloat(dPad[1]));
      const ist = g.polsterungOben;
      if (Math.abs(soll - ist) > 8) {
        melde(
          Math.abs(soll - ist) > 24 ? 'mittel' : 'leicht',
          dSeite.schalter,
          `„${d.ueberschrift}": Der Innenabstand oben weicht ab`,
          `${soll}px`,
          `${ist}px`,
        );
      }
    }
  }

  /* BILDZUSCHNITT – seitenweit, nicht je Block.
     Der einzige der vier, bei dem sich WERTE vergleichen lassen: cover und
     contain sind feste Schlüsselwörter, keine Token. Genau daran hing die
     dokumentierte Falle (CLAUDE.md Abschnitt 4): `:global()` in einer
     .css-Datei verwirft die GANZE Regel, `object-fit: cover` fällt weg, und
     jedes Bild mit unpassendem Seitenverhältnis bekommt schwarze Balken.

     WARUM SEITENWEIT: Beim ersten Lauf je Block verglichen – und sofort ein
     Fehlalarm. Bilder liegen tief im Baum; wo die Blockgrenze zwischen Design
     und gebauter Seite um eine Ebene abweicht, landet dasselbe Bild in einem
     anderen Block. Der Zuschnitt war da, nur woanders gezählt. Auf Seitenebene
     ist die Frage die richtige: Kommt der Zuschnitt, den das Design verlangt,
     auf dieser Seite überhaupt vor? */
  {
    const dZuschnitt = [
      ...new Set(dSeite.bloecke.flatMap((b) => (b.bildZuschnitt || []).filter((v) => v !== 'fill'))),
    ].sort();
    const gZuschnitt = [...new Set(gebaut.bloecke.flatMap((b) => b.bildZuschnitt || []))].sort();
    for (const wert of dZuschnitt) {
      if (gZuschnitt.includes(wert)) continue;
      melde(
        'schwer',
        dSeite.schalter,
        `Kein Bild auf dieser Seite hat den Zuschnitt „${wert}", den das Design verlangt`,
        wert,
        gZuschnitt.join(', ') || '(keiner – Bilder werden verzerrt oder bekommen Balken)',
      );
    }
  }

  /* SCHRIFTFAMILIE – seitenweit, nicht je Block. Je Block verglichen sagt sie
     nichts: Das Design schreibt `var(--font-display)`, gerechnet steht dort ein
     aufgelöster Name, und ohne die Token-Datei ist das nicht vergleichbar.
     Was sich sehr wohl prüfen lässt: Nennt das Design ZWEI Schriften (fast
     jedes tut das – eine für Überschriften, eine für Fließtext) und rendert die
     gebaute Seite nur EINE, dann ist die Überschriftenschrift nie angekommen.
     Das sieht man sofort, wenn man es weiss – und gar nicht, wenn nicht. */
  if (designSchriften.size >= 2 && gebaut.schriften.length === 1) {
    melde(
      'schwer',
      dSeite.schalter,
      'Das Design nennt zwei Schriften, die Seite rendert nur eine',
      [...designSchriften].join(' und '),
      gebaut.schriften[0],
    );
  }

  for (const d of dSeite.bloecke) {
    if (!d.invertiert || !d.ueberschrift) continue;
    /* ÜBER DIE ÜBERSCHRIFT zuordnen, nicht über die Position. Sobald die
       Blockzahlen um eins auseinanderliegen, vergleicht ein Positionsindex
       zwei verschiedene Blöcke – im Probelauf ergab das drei Falschmeldungen
       („dunkel erwartet, hell gemessen") an Bändern, die in Wirklichkeit
       schwarz sind. */
    const g = gebaut.bloecke.find((x) => kern(x.ueberschrift) === kern(d.ueberschrift));
    if (!g) continue; // Fehlt ganz – steht schon als eigener Befund da.
    if (istDunkel(g.grundfarbe) || g.grundbild) continue;
    melde(
      'schwer',
      dSeite.schalter,
      `Der Block „${d.ueberschrift}" ist im Design dunkel, gebaut ist er hell`,
      'dunkel (Umkehr-Klasse im Design)',
      g.grundfarbe,
    );
  }

  /* ZWEI MERKMALE, DIE DAS TOR NICHT VERGLEICHEN KANN – aber melden muss.
     Sie standen bis zum 31.07.2026 nur im Speicher: eingesammelt, nie
     angesehen, nie ausgegeben. Das ist die schlechteste aller Möglichkeiten,
     denn beide sind für einen Port hochwertig:

     BAUTEILE: Welche Design-Komponente in einem Block steckt, steht wörtlich
     in der .dc.html (`<x-import component-from-global-scope="…">`). Die
     gebaute Seite hat davon keine Spur mehr – ein maschineller Vergleich ist
     also unmöglich. Ein Mensch mit der Liste in der Hand braucht dagegen
     Sekunden: „Chip, Karte, Knopf – ist das alles drin?" Genau hier ist im
     Kundenprojekt nach Augenmaß nachempfunden worden, während die exakte
     Definition die ganze Zeit im Projekt lag.

     ZUSTÄNDE: Ein `<sc-if>` INNERHALB eines Blocks ist ein Klick-Zustand
     (Formular abgeschickt, Treffer vorhanden). Das Tor sieht immer nur den
     Ausgangszustand – aber es kann sagen, wonach zu klicken ist. */
  const bauteile = [...new Set(dSeite.bloecke.flatMap((b) => b.bauteile || []))].sort();
  const zustaende = [...new Set(dSeite.bloecke.flatMap((b) => b.zustaende || []))].sort();
  if (bauteile.length || zustaende.length) {
    sichtliste.push({ seite: dSeite.schalter, route, bauteile, zustaende });
  }

  const marke = befunde.filter((b) => b.seite === dSeite.schalter).length;
  zeilen.push(
    `  ${marke ? '✗' : '✓'} ${dSeite.schalter.padEnd(16)} ${String(route).padEnd(24)} ` +
      `${gz}/${dz} Blöcke${marke ? ` – ${marke} Befund(e)` : ''}`,
  );
}

// ---------------------------------------------------------------------------
//  5. Der Rahmen – auf EINER Seite prüfen, gilt für alle
//
//  Hier saß im Testlauf der gröbste Befund: ein Schwebeknopf, den das Design
//  auf jeder Seite zeigt und den es im Build auf keiner einzigen gab.
// ---------------------------------------------------------------------------
const ersteRoute = Object.values(zuordnung).find(Boolean) || '/';
const rahmenGebaut = await gebauteSeite(ersteRoute.endsWith('/') ? ersteRoute : ersteRoute + '/');
if (rahmenGebaut) {
  const dFest = designSeiten.rahmen.filter((r) => r.fest);
  const gFest = rahmenGebaut.rahmen.filter((r) => r.fest);
  if (dFest.length > gFest.length) {
    melde(
      'schwer',
      'Rahmen',
      `${dFest.length - gFest.length} fest stehende(s) Element(e) fehlen – z. B. Schwebeknöpfe. ` +
        `Das Design zeigt sie auf JEDER Seite.`,
      dFest.map((r) => r.kennung).join(', ') || '(unbenannt)',
      gFest.map((r) => r.kennung).join(', ') || 'keines',
    );
  }

  /* ZEIGT DIE FUSSZEILE DIE NAVIGATION DER KOPFLEISTE?
     -----------------------------------------------------------------------
     Genau das ist beim zweiten Port passiert: In der Fußzeile stand noch
     einmal das Kopf-Menü, während das Design dort ein Rechts-Menü vorsah.
     Der Betrieb fand es bei der Abnahme; kein Tor hat es gemeldet, weil am
     Rahmen bis heute genau EINE Zahl verglichen wurde – wie viele Elemente
     fest positioniert sind.

     Verglichen werden die Beschriftungen der Verweise. Sie stehen in BEIDEN
     Export-Formen da: Form A navigiert über `onClick` ohne Adresse, Form B
     über echte Adressen – der Text steht immer.

     Gemeldet wird nur der eindeutige Fall: Das DESIGN zeigt in der Fußzeile
     etwas anderes als in der Kopfleiste (Überschneidung unter der Hälfte),
     die GEBAUTE Seite aber fast dasselbe (über vier Fünftel). Alles
     dazwischen bleibt still – ein Tor, das rauscht, bringt niemandem etwas. */
  const kopfFuss = (liste) => ({
    kopf: liste.find((r) => r.tag === 'header'),
    fuss: liste.find((r) => r.tag === 'footer'),
  });
  const dRahmen = kopfFuss(designSeiten.rahmen);
  const gRahmen = kopfFuss(rahmenGebaut.rahmen);
  if (dRahmen.kopf && dRahmen.fuss && gRahmen.kopf && gRahmen.fuss) {
    const anteil = (a = [], b = []) => {
      if (a.length === 0) return 0;
      const menge = new Set(b);
      return a.filter((t) => menge.has(t)).length / a.length;
    };
    /* DIE PFLICHTLINKS ZÄHLEN NICHT MIT – sonst kann die Regel nie anschlagen.
       Sie wurde gebaut, weil beim zweiten Port die Fußzeile das KOPF-Menü
       wiederholte. Nachgerechnet am 05.08.2026: Die gebaute Fußzeile trägt
       IMMER Impressum, Datenschutz und den Kanbuk-Verweis, und die stehen im
       Kopf-Menü nie. Bei einem Kopf-Menü von vier bis sechs Punkten – dem
       Normalfall beim Wiener Kleinbetrieb – kommt der Anteil damit nie über
       80 %. Die Regel war ein Netz, das nie gespannt war.

       Gezählt wird jetzt nur, was ÜBER die Pflichtteile hinaus in der Fußzeile
       steht. Genau das ist die Frage: Steht dort das Kopf-Menü statt dessen,
       was das Design zeigt? */
    const PFLICHT = /^(impressum|datenschutz|agb|website von kanbuk|kanbuk|imprint|privacy|terms)$/i;
    const ohnePflicht = (liste = []) => liste.filter((t) => !PFLICHT.test(String(t).trim()));
    const imDesign = anteil(ohnePflicht(dRahmen.fuss.verweise), dRahmen.kopf.verweise);
    const gebaut = anteil(ohnePflicht(gRahmen.fuss.verweise), gRahmen.kopf.verweise);
    /* Unter zwei freien Verweisen ist der Anteil Zufall (ein Treffer = 100 %). */
    if (ohnePflicht(gRahmen.fuss.verweise).length >= 2 && imDesign < 0.5 && gebaut > 0.8) {
      melde(
        'schwer',
        'Rahmen · Fußzeile',
        'Die Fußzeile zeigt fast dieselben Verweise wie die Kopfleiste – im Design steht dort etwas anderes.',
        `Fußzeile im Design: ${(dRahmen.fuss.verweise || []).slice(0, 6).join(', ') || '(keine)'}`,
        `Fußzeile gebaut: ${(gRahmen.fuss.verweise || []).slice(0, 6).join(', ') || '(keine)'}`,
      );
    }
  }

  /* DIE BAUTEILE VON KOPF UND FUSS GEHEN AN DAS AUGE – wie die der Blöcke.
     Sie wurden hier eingesammelt (`bauteile` beim Rahmen) und dann verworfen.
     Am 31.07.2026 wurde genau diese Falle für die BLÖCKE behoben und im
     Dateikopf für erledigt erklärt – für den Rahmen blieb sie stehen. Dabei
     wiegt sie hier schwerer: Kopfleiste und Fußzeile stehen auf JEDER Seite,
     ein dort fehlendes Bauteil fällt also überall aus. */
  const rahmenBauteile = [...new Set(designSeiten.rahmen.flatMap((r) => r.bauteile || []))].sort();
  if (rahmenBauteile.length) {
    sichtliste.push({ seite: 'Rahmen (Kopf/Fuß)', route: 'jede Seite', bauteile: rahmenBauteile, zustaende: [] });
  }
}

stop();
await browser.close();

// ---------------------------------------------------------------------------
//  Ergebnis
// ---------------------------------------------------------------------------
console.log('');
for (const z of zeilen) console.log(z);
console.log('');

const schwer = befunde.filter((b) => b.schwere === 'schwer');
const mittel = befunde.filter((b) => b.schwere === 'mittel');

if (befunde.length) {
  for (const b of befunde) {
    console.log(`${b.schwere === 'schwer' ? '✗' : '⚠'} [${b.seite}] ${b.was}`);
    console.log(`    Design: ${b.design}`);
    console.log(`    Gebaut: ${b.gebaut}`);
  }
  console.log('');
}

/* DIE SICHTLISTE – was das Tor nicht kann, gibt es weiter statt es wegzuwerfen. */
const sichtText = sichtliste.length
  ? sichtliste
      .map(
        (s) =>
          `### ${s.seite} (${s.route})\n` +
          (s.bauteile.length
            ? `- **Bauteile laut Design:** ${s.bauteile.join(', ')}\n` +
              `  Ihre exakte Definition steht im \`_ds_bundle.js\` – dort nachlesen,\n` +
              `  nicht vom Bildschirmfoto ableiten (CLAUDE.md Abschnitt 4, Punkt 4).\n`
            : '') +
          (s.zustaende.length
            ? `- **Klick-Zustände laut Design:** ${s.zustaende.join(', ')}\n` +
              `  Das Tor sieht immer nur den Ausgangszustand. Diese hier durchklicken.\n`
            : ''),
      )
      .join('\n')
  : '';

if (sichtliste.length) {
  console.log('  FÜR DAS AUGE – das Tor kann es nicht vergleichen, aber es weiß davon:');
  for (const s of sichtliste) {
    if (s.bauteile.length) console.log(`   · ${s.seite}: Bauteile ${s.bauteile.join(', ')}`);
    if (s.zustaende.length) console.log(`   · ${s.seite}: Klick-Zustände ${s.zustaende.join(', ')}`);
  }
  console.log('');
}

if (nurBericht) {
  writeFileSync(
    join(WURZEL, 'pruefung', 'abgleich.md'),
    `# Abgleich mit dem Design\n\n${zeilen.join('\n')}\n\n` +
      befunde.map((b) => `- **[${b.schwere}] ${b.seite}** – ${b.was}\n  - Design: ${b.design}\n  - Gebaut: ${b.gebaut}`).join('\n') +
      (sichtText ? `\n\n## Für das Auge – vom Tor nicht vergleichbar\n\n${sichtText}` : ''),
    'utf-8',
  );
  console.log('pruefung/abgleich.md geschrieben.');
}

console.log(
  `Abgeglichen: ${designSeiten.seiten.length} Design-Seite(n) — ` +
    `${schwer.length} schwer, ${mittel.length} mittel`,
);
console.log('');
console.log(
  `  Schrift der Überschriften Wert für Wert verglichen: ${verglicheneSchrift} Überschrift(en).` +
    (verglicheneSchrift === 0
      ? '\n  ACHTUNG: NULL. Der Vergleich greift nur, wo das Design die Eigenschaft am\n' +
        '  Element SELBST deklariert. Formatiert dieses Design seine Überschriften über\n' +
        '  eine Klasse in einer eigenen CSS-Datei, hat hier nichts stattgefunden –\n' +
        '  das ist dann keine bestandene Prüfung, sondern eine ausgefallene.'
      : ''),
);
console.log('');
console.log('  WAS DIESES TOR NICHT SIEHT (CLAUDE.md Abschnitt 9, Punkt 3c):');
console.log('  Radien und Verläufe (das Design schreibt sie als Token), Deckkraft,');
console.log('  Übergänge, Spaltenaufteilung – und ob ein Text inhaltlich stimmt.');
console.log('  Schrift, Zeilenhöhe und Sperrung werden seit 05.08.2026 verglichen,');
console.log('  aber NUR an Überschriften und nur, wo das Design sie selbst deklariert.');
console.log('  Die vollständige Liste steht im Kopf dieser Datei, Abschnitt „Was das');
console.log('  Tor vergleicht". Dafür bleiben die Bögen aus `npm run sicht` und das');
console.log('  eigene Auge zuständig (Definition of Done, Punkt 3d).');

process.exitCode = schwer.length > 0 ? 1 : 0;
