/**
 * =============================================================================
 *  INTERAKTION – der automatische Bedien-Test der Verhaltens-Bausteine
 * =============================================================================
 *  Ein Screenshot zeigt, WIE die Seite aussieht (npm run sicht) – aber nicht,
 *  OB sie sich bedienen lässt. Dieses Skript fährt deshalb jede gebaute Seite
 *  im echten Browser bei 350 und 1440 px und BEDIENT alles, was der Motor an
 *  Verhalten mitbringt:
 *
 *   • Tabs        – zweiten Tab klicken: wandert aria-selected, wechselt das Panel?
 *   • Filter      – Kategorie klicken: stimmt die Zahl der sichtbaren Elemente?
 *   • Mobilmenü   – öffnen, mit Escape schließen (nur in der Handy-Ansicht)
 *   • Akkordeon   – Eintrag aufklappen; „exklusiv" darf nur einen offen lassen
 *   • Lightbox    – Bild klicken: Dialog offen? Escape schließt?
 *   • Vergleich   – Regler auf 25: sitzt die CSS-Variable --vergleich-pos?
 *   • Slider      – Vor-Knopf: wandert der aktive Punkt bzw. die Spur?
 *   • Katalog-Filter – jede Merkmalsgruppe, jeder Schieberegler, jede
 *                   Sortierrichtung, Zurücksetzen und der Trefferzähler
 *   • Merkliste   – merken, „nur Vorgemerkte“, wieder lösen
 *   • Dialog      – öffnet, übernimmt den Bezug des Auslösers, schließt
 *   • Assistent   – erster Schritt offen, Senden versteckt, leeres
 *                   Pflichtfeld hält den Schritt
 *   • Bewegung    – bleibt das angeklickte Element dort, wo der Finger es
 *                   berührt hat? Akkordeon und Assistent, über mehrere Bilder
 *                   gemessen. Die anderen Stufen sehen Bewegung nicht.
 *   • Formular    – in der Vorschau sichtbar und bedienbar, aber ohne
 *                   Versandziel; ein Klick auf Senden wird beantwortet und
 *                   verlässt die Seite nicht. Live nur strukturell geprüft
 *                   (Absende-Knopf + Status-Element) und NIE abgesendet.
 *
 *  Die Bausteine sind über data-Attribute standardisiert (src/lib/verhalten/) –
 *  deshalb testet EIN Skript jede Kundenseite, egal welches Design. Was auf
 *  einer Seite nicht vorkommt, wird still übersprungen. JS-Fehler während der
 *  Bedienung zählen als Rot.
 *
 *      npm run interaktion            (nutzt dist/ – vorher npm run check)
 *      npm run interaktion -- --breiten 350,768,1440
 *
 *  Rot (Exit 1) = ein Bedien-Element ist kaputt. Die Seite darf so nicht raus.
 * =============================================================================
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { starteDistServer } from './lib/dist-server.mjs';
import { verlangeAktuellesDist } from './lib/bau-marke.mjs';

const WURZEL = process.cwd();
const DIST = join(WURZEL, 'dist');

const args = process.argv.slice(2);
const wert = (name, standard) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : standard;
};
// 350 = schmalstes Handy (dort lebt das Mobilmenü), 1440 = Desktop. Die mittlere
// Breite bringt für die MECHANIK nichts Neues – die prüft npm run sicht visuell.
const BREITEN = wert('breiten', '350,1440').split(',').map((b) => Number(b.trim()));

verlangeAktuellesDist(WURZEL, 'npm run interaktion');

// Nummerierung nur ab dem zweiten Vorkommen – bei einem einzigen Tabs-Block
// wäre „Tabs #1" nur Rauschen im Bericht.
const benenne = (name, nr) => (nr > 0 ? `${name} #${nr + 1}` : name);

const { basis: BASIS, seiten, stop } = await starteDistServer(DIST);

const probleme = [];
let geprueft = 0;

/* WELCHE PRUEFUNGEN HABEN UEBERHAUPT ETWAS GEFUNDEN?
   Die Zeile „✓ Alle Bedien-Elemente funktionieren (34 Prüfungen)" las sich wie
   eine Aussage über alle Bausteine. Gemessen am 02.08.2026 auf dem
   unveränderten Template: Nur sieben der vierzehn Prüfungen sind je gelaufen –
   Tabs, Filter, Slider, Vergleich, Dialog, Assistent und die Formular-Struktur
   kamen auf keiner gebauten Seite vor. Deren Code hat niemand je ausgeführt;
   ein falsches Attribut oder eine falsche Erwartung darin fällt zum ersten Mal
   BEIM KUNDEN auf. Beim Wirt ist die Speisekarte ein Tab-Baustein, beim Händler
   der Vergleich – also genau dort.
   Deshalb nennt der Schlussbericht jetzt, was NICHT vorkam. */
/* NUR WAS IN DIESEM MODUS ÜBERHAUPT LAUFEN KANN.
   Hier stand eine feste Liste mit allen vier Formular-Prüfungen. Die können
   aber nie gleichzeitig vorkommen: Eine Vorschau prüft „Formular (Vorschau)"
   und „(Demo-Hinweis)", eine Live-Seite „Formular (Struktur)". Egal wie die
   Seite gebaut ist, mindestens zwei standen deshalb in JEDEM grünen Lauf unter
   „NICHT GEPRÜFT" – und zwar dauerhaft, ohne dass irgendetwas daran zu machen
   wäre.

   Eine Warnliste, in der drei von zehn Punkten immer falsch sind, gewöhnt
   einem das Hinsehen ab. Genau dann übersieht man den vierten, der stimmt.

   Der Modus steht in der gebauten Seite: die Vorschau trägt `noindex`. */
const startSeite = readFileSync(join(DIST, 'index.html'), 'utf-8');
const IST_VORSCHAU = /<meta[^>]+name=["']robots["'][^>]+noindex/i.test(startSeite);

const ALLE_PRUEFUNGEN = [
  'Tabs',
  'Filter',
  'Katalog-Filter',
  'Merkliste',
  'Dialog',
  'Assistent',
  'Assistent (Bewegung)',
  'Akkordeon (exklusiv)',
  'Akkordeon (Bewegung)',
  'Vergleich',
  'Slider',
  'Lightbox',
  'Einbettung',
  'Mobilmenü',
  /* „Formular" ohne Zusatz ist KEIN Prüfschritt, sondern die Beschriftung der
     Fehlermeldungen weiter unten (scharfes Formular in der Vorschau, Vorschau
     ohne Hinweis). Auf einem grünen Lauf entsteht sie nie – sie hier zu
     erwarten hiess, sie in jedem grünen Lauf zu vermissen. */
  ...(IST_VORSCHAU ? ['Formular (Vorschau)'] : ['Formular (Struktur)']),
  'Zustimmungs-Häkchen',
];

/* ZWEI BESCHRIFTUNGEN, EIN PRÜFSCHRITT.
   „Formular (Demo-Hinweis)" läuft ausschliesslich dann, wenn es einen Hinweis,
   aber KEIN Vorschau-Formular gibt (siehe den Zweig `if (vorschauen.length ===
   0)` weiter unten). Beide zu erwarten hiess, in jedem Lauf genau einen von
   beiden zu vermissen – je nachdem, wie die Seite gebaut ist. Erwartet wird
   deshalb der Regelfall; die Alternative zählt als erfüllt, wenn sie statt
   seiner gelaufen ist. */
const ALTERNATIVEN = { 'Formular (Vorschau)': ['Formular (Demo-Hinweis)'] };
const gesehen = new Set();

const browser = await chromium.launch();
console.log(`Interaktionstest: ${seiten.length} Seite(n) × ${BREITEN.length} Breiten (${BREITEN.join(', ')} px)\n`);

for (const seite of seiten) {
  for (const breite of BREITEN) {
    /* „Bewegung reduzieren" macht den Test deterministisch: Slider springen
       sofort statt zu gleiten (kein Warten auf halbe Animationen), und der
       Auto-Durchlauf schaltet nicht mitten in der Messung weiter. Die
       Bausteine respektieren die Einstellung ohnehin – das ist ihr regulärer
       Pfad.

       WAS DAS KOSTET, und es stand lange nirgends: In dieser Einstellung wird
       ECHTE Bewegung nie gesehen. Der Durchgang unten (`BEWEGUNG`) fährt
       deshalb ein zweites Mal OHNE sie, nur für die Bausteine mit Animation.
       Im Kundenprojekt lag genau dort einer der beiden Fehler, die der
       Betreiber selbst gefunden hat. */
    const kontext = await browser.newContext({
      viewport: { width: breite, height: 900 },
      reducedMotion: 'reduce',
    });
    const page = await kontext.newPage();

    const jsFehler = [];
    page.on('pageerror', (e) => jsFehler.push(e.message.split('\n')[0]));
    page.on('console', (m) => m.type() === 'error' && jsFehler.push(m.text().split('\n')[0]));

    await page.goto(BASIS + seite, { waitUntil: 'load' });
    // Die Bausteine starten als Modul-Skript vor dem load-Ereignis – die kurze
    // Pause ist nur Sicherheitsabstand für langsame Rechner.
    await page.waitForTimeout(250);

    /** @type {{baustein: string, ok: boolean, detail: string}[]} */
    const ergebnisse = [];

    // Die Klicks passieren bewusst per element.click() IM Browser (evaluate),
    // nicht über Playwrights Maus: Getestet wird die MECHANIK der Bausteine –
    // ob ein Element von etwas verdeckt wird, ist eine Layout-Frage und Sache
    // der Sichtprüfung. So bleibt der Test stabil über jedes Kundendesign.

    // --- Tabs: zweiten Tab klicken → Auswahl wandert, Panel wechselt ---------
    ergebnisse.push(...await page.evaluate(() => {
      const raus = [];
      document.querySelectorAll('[data-tabs]').forEach((box, nr) => {
        const knoepfe = [...box.querySelectorAll('[data-tab]')];
        const panels = [...box.querySelectorAll('[data-tabpanel]')];
        // Mit nur einem Tab gibt es nichts umzuschalten.
        if (knoepfe.length < 2 || panels.length === 0) return;

        const ziel = knoepfe[1];
        const id = ziel.dataset.tab;
        ziel.click();

        const fehler = [];
        if (ziel.getAttribute('aria-selected') !== 'true') fehler.push('aria-selected wandert nicht auf den geklickten Tab');
        if (knoepfe.some((k) => k !== ziel && k.getAttribute('aria-selected') === 'true')) fehler.push('mehrere Tabs gleichzeitig ausgewählt');
        const panel = panels.find((p) => p.dataset.tabpanel === id);
        if (!panel) fehler.push(`kein Panel zu data-tab="${id}" (data-tabpanel fehlt oder Tippfehler)`);
        else if (panel.hidden) fehler.push(`Panel "${id}" bleibt nach dem Klick versteckt`);
        if (panels.some((p) => p !== panel && !p.hidden)) fehler.push('ein inaktives Panel bleibt sichtbar');
        if (box.hasAttribute('data-tabs-url') && location.hash !== `#${id}`) {
          fehler.push(`URL-Anker fehlt (erwartet #${id}, ist "${location.hash || '(leer)'}")`);
        }
        raus.push({ baustein: nr > 0 ? `Tabs #${nr + 1}` : 'Tabs', ok: fehler.length === 0, detail: fehler.join('; ') });
      });
      return raus;
    }));

    // --- Filter: Kategorie klicken → Sichtbarkeit stimmt; „alle" zeigt alles -
    ergebnisse.push(...await page.evaluate(() => {
      const raus = [];
      document.querySelectorAll('[data-filter]').forEach((box, nr) => {
        const knoepfe = [...box.querySelectorAll('[data-filter-wert]')];
        const ziel = box.querySelector('[data-filter-ziel]') ?? box;
        const elemente = [...ziel.querySelectorAll('[data-kategorie]')];
        if (knoepfe.length === 0 || elemente.length === 0) return;

        const fehler = [];
        /* JEDE Kategorie fahren, nicht nur die erste – und zusätzlich prüfen,
           dass hinter dem Knopf überhaupt etwas steckt.
           WARUM DAS ZWEITE NÖTIG IST: Die Erwartung wird aus demselben Markup
           abgeleitet, das der Filter benutzt. Zeigt ein Knopf auf eine
           Kategorie, die kein einziges Element hat, ist erwartet = 0 und
           sichtbar = 0 – die Prüfung war zufrieden, obwohl der Besucher auf
           „Cocktails" klickt und eine leere Seite bekommt. Genau der Fehler,
           den ein Filtertest finden muss, konnte ihn nicht auslösen. */
        for (const knopf of knoepfe.filter((k) => k.dataset.filterWert !== 'alle')) {
          const kat = knopf.dataset.filterWert;
          knopf.click();
          const erwartet = elemente.filter((el) => (el.dataset.kategorie ?? '').split(/\s+/).includes(kat));
          const sichtbar = elemente.filter((el) => !el.hidden);
          if (erwartet.length === 0) {
            fehler.push(`Filter "${kat}" führt ins Leere – kein einziges Element trägt diese Kategorie`);
            continue;
          }
          if (sichtbar.length !== erwartet.length || sichtbar.some((el) => !erwartet.includes(el))) {
            fehler.push(`Filter "${kat}": ${sichtbar.length} Element(e) sichtbar, erwartet ${erwartet.length}`);
          }
        }
        /* Umgekehrt: eine Kategorie, die an Elementen steht, aber keinen Knopf
           hat – dann sind diese Elemente über den Filter nie erreichbar. */
        const knopfWerte = new Set(knoepfe.map((k) => k.dataset.filterWert));
        const ohneKnopf = new Set();
        for (const el of elemente) {
          for (const k of (el.dataset.kategorie ?? '').split(/\s+/).filter(Boolean)) {
            if (!knopfWerte.has(k)) ohneKnopf.add(k);
          }
        }
        if (ohneKnopf.size > 0) {
          fehler.push(`Kategorie(n) ohne Filter-Knopf: ${[...ohneKnopf].join(', ')} – diese Einträge sind nicht filterbar`);
        }
        const alleKnopf = knoepfe.find((k) => k.dataset.filterWert === 'alle');
        if (alleKnopf) {
          alleKnopf.click();
          const versteckt = elemente.filter((el) => el.hidden).length;
          if (versteckt > 0) fehler.push(`"alle" lässt ${versteckt} Element(e) versteckt`);
        }
        raus.push({ baustein: nr > 0 ? `Filter #${nr + 1}` : 'Filter', ok: fehler.length === 0, detail: fehler.join('; ') });
      });
      return raus;
    }));

    // --- Kombi-Filter: Gruppen, Regler, Sortierung, Zuruecksetzen -----------
    /* Der einfache Filtertest oben greift nur bei [data-kategorie]. Ein
       Katalog (Fahrzeuge, Objekte, Kurse) filtert ueber mehrere Merkmale
       zugleich - der blieb bis 2026-07-27 voellig ungeprueft, obwohl er das
       komplizierteste Bedienteil des Motors ist. */
    ergebnisse.push(...await page.evaluate(() => {
      const raus = [];
      document.querySelectorAll('[data-filter-kombi]').forEach((box, nr) => {
        const ziel = box.querySelector('[data-filter-ziel]') ?? box;
        const elemente = [...ziel.querySelectorAll('[data-katalog-eintrag]')];
        if (elemente.length === 0) return;
        const fehler = [];
        /* Frisch aus dem Seitenbaum lesen, nicht aus der oben eingesammelten
           Liste: Beim Sortieren werden die Einträge umgehängt. Wer die alte
           Liste filtert, bekommt die ALTE Reihenfolge zurück – die Prüfung
           hätte dann jede Sortierung für richtig gehalten, solange die
           Ausgangsreihenfolge zufällig passte (genau so beim ersten Lauf
           passiert: „aufsteigend" grün, „absteigend" rot, beides zu Unrecht). */
        const sichtbare = () =>
          [...ziel.querySelectorAll('[data-katalog-eintrag]')].filter((el) => !el.hidden);
        const zuruecksetzen = () => box.querySelector('[data-filter-zuruecksetzen]')?.click();

        // 1. Jede Gruppe, jeder Wert: stimmt die Auswahl?
        for (const gruppe of box.querySelectorAll('[data-filter-gruppe]')) {
          const merkmal = gruppe.dataset.filterGruppe;
          for (const knopf of gruppe.querySelectorAll('[data-filter-wert]')) {
            const wert = knopf.dataset.filterWert;
            if (wert === 'alle') continue;
            zuruecksetzen();
            if (knopf.type === 'checkbox') {
              knopf.checked = true;
              knopf.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
              knopf.click();
            }
            const erwartet = elemente.filter((el) =>
              (el.dataset[merkmal] ?? '').split(/\s+/).includes(wert),
            );
            if (erwartet.length === 0) {
              fehler.push(`Auswahl "${merkmal}: ${wert}" fuehrt ins Leere - kein Eintrag hat diesen Wert`);
              continue;
            }
            const s = sichtbare();
            if (s.length !== erwartet.length || s.some((el) => !erwartet.includes(el))) {
              fehler.push(`"${merkmal}: ${wert}": ${s.length} sichtbar, erwartet ${erwartet.length}`);
            }
          }
        }

        // 2. Zuruecksetzen muss ALLES zurueckholen
        zuruecksetzen();
        if (sichtbare().length !== elemente.length) {
          fehler.push(`Zuruecksetzen laesst ${elemente.length - sichtbare().length} Eintrag/Eintraege versteckt`);
        }

        // 3. Schieberegler auf das Minimum stellen
        for (const regler of box.querySelectorAll('[data-filter-max]')) {
          const merkmal = regler.dataset.filterMax;
          zuruecksetzen();
          regler.value = regler.min;
          regler.dispatchEvent(new Event('input', { bubbles: true }));
          const grenze = Number(regler.min);
          const drueber = sichtbare().filter((el) => {
            const w = Number.parseFloat((el.dataset[merkmal] ?? '').replace(/[^0-9.-]/g, ''));
            return Number.isFinite(w) && w > grenze;
          });
          if (drueber.length > 0) {
            fehler.push(`Regler "${merkmal}" auf ${grenze}: ${drueber.length} Eintrag/Eintraege ueber der Grenze noch sichtbar`);
          }
          const anzeige = box.querySelector(`[data-filter-max-anzeige="${merkmal}"]`);
          if (anzeige && !anzeige.textContent.trim()) {
            fehler.push(`Regler "${merkmal}" zeigt keinen Wert an - der Besucher sieht nicht, was er eingestellt hat`);
          }
          zuruecksetzen();
        }

        // 4. Sortierung: steht die Reihenfolge danach wirklich?
        const sortierung = box.querySelector('[data-filter-sortierung]');
        if (sortierung) {
          /* Die Reihenfolge VOR dem ersten Sortieren merken – sie ist die
             Bedeutung von „Empfohlen". Ohne sie ist ein Knopf, der nichts
             aendern SOLL, von einem, der nichts aendern KANN, nicht zu
             unterscheiden. Genau daran ist diese Pruefung schon einmal
             vorbeigelaufen: `if (!wert) return;` im Filter-Baustein, und die
             Ruecksetz-Option tat gar nichts. */
          const ausgang = sichtbare().map((el) => el.dataset.katalogEintrag || el.id || '');

          for (const option of [...sortierung.options].filter((o) => o.value)) {
            zuruecksetzen();
            sortierung.value = option.value;
            sortierung.dispatchEvent(new Event('change', { bubbles: true }));
            const [merkmal, richtung] = option.value.split('-');
            const werte = sichtbare()
              .map((el) => Number.parseFloat((el.dataset[merkmal] ?? '').replace(/[^0-9.-]/g, '')))
              .filter((n) => Number.isFinite(n));
            const geordnet = werte.every((w, i) =>
              i === 0 || (richtung === 'ab' ? werte[i - 1] >= w : werte[i - 1] <= w),
            );
            if (!geordnet) fehler.push(`Sortierung "${option.value}" ordnet nicht: ${werte.join(', ')}`);
          }

          /* Und zurueck auf die leere Option ("Empfohlen"): Sie muss die
             Ausgangsreihenfolge WIEDERHERSTELLEN. Vorher wurde sie ueber
             `.filter((o) => o.value)` gar nicht erst angefahren. */
          const leere = [...sortierung.options].find((o) => !o.value);
          if (leere && ausgang.length > 1) {
            sortierung.value = leere.value;
            sortierung.dispatchEvent(new Event('change', { bubbles: true }));
            const jetzt = sichtbare().map((el) => el.dataset.katalogEintrag || el.id || '');
            if (jetzt.join('|') !== ausgang.join('|')) {
              fehler.push(
                `"${leere.textContent.trim()}" stellt die Ausgangsreihenfolge nicht wieder her ` +
                  `(war ${ausgang.join(', ')}, ist ${jetzt.join(', ')})`,
              );
            }
          }
          zuruecksetzen();
        }

        // 5. Trefferzaehler muss zur Wirklichkeit passen
        const anzahl = box.querySelector('[data-filter-anzahl]');
        if (anzahl && Number(anzahl.textContent) !== sichtbare().length) {
          fehler.push(`Trefferzaehler sagt ${anzahl.textContent}, sichtbar sind ${sichtbare().length}`);
        }

        raus.push({
          baustein: nr > 0 ? `Katalog-Filter #${nr + 1}` : 'Katalog-Filter',
          ok: fehler.length === 0,
          detail: fehler.join('; '),
        });
      });
      return raus;
    }));

    // --- Merkliste: merken, nur Vorgemerkte, wieder loesen -------------------
    ergebnisse.push(...await page.evaluate(() => {
      const knoepfe = [...document.querySelectorAll('[data-merken]')];
      if (knoepfe.length === 0) return [];
      const fehler = [];
      const zaehler = document.querySelector('[data-merkliste-anzahl]');
      const eintragVon = (k) => k.closest('[data-katalog-eintrag]') ?? k.parentElement;

      /* Sauber starten: Die Merkliste ueberlebt im Geraetespeicher auch den
         Seitenwechsel - ohne Aufraeumen faelschte ein frueherer Durchlauf das
         Ergebnis dieses Tests. */
      knoepfe.filter((k) => k.getAttribute('aria-pressed') === 'true').forEach((k) => k.click());

      knoepfe[0].click();
      if (knoepfe[0].getAttribute('aria-pressed') !== 'true') {
        fehler.push('Merken-Knopf meldet sich nicht als gedrueckt (aria-pressed)');
      }
      if (zaehler && zaehler.textContent.trim() !== '1') {
        fehler.push(`Zaehler zeigt "${zaehler.textContent.trim()}" statt 1`);
      }

      const nurKnopf = document.querySelector('[data-merkliste-nur]');
      if (nurKnopf) {
        nurKnopf.click();
        const sichtbar = knoepfe.filter((k) => !eintragVon(k).hidden);
        if (sichtbar.length !== 1) {
          fehler.push(`"Nur Vorgemerkte" zeigt ${sichtbar.length} Eintraege statt 1`);
        }
        nurKnopf.click();
        const wiederAlle = knoepfe.filter((k) => !eintragVon(k).hidden).length;
        if (wiederAlle !== knoepfe.length) {
          fehler.push(`Nach dem Zurueckschalten fehlen ${knoepfe.length - wiederAlle} Eintraege`);
        }
      }

      knoepfe[0].click(); // wieder loesen - der naechste Durchlauf startet sauber
      try { localStorage.removeItem('kanbuk-merkliste'); } catch { /* egal */ }

      return [{ baustein: 'Merkliste', ok: fehler.length === 0, detail: fehler.join('; ') }];
    }));

    // --- Dialog: oeffnet, uebernimmt den Bezug, laesst sich schliessen -------
    ergebnisse.push(...await page.evaluate(async () => {
      const ausloeser = [...document.querySelectorAll('[data-dialog-oeffnen]')];
      if (ausloeser.length === 0) return [];
      const fehler = [];
      const a = ausloeser[0];
      const ziel = document.getElementById(a.dataset.dialogOeffnen ?? '');
      if (!ziel) {
        fehler.push(`Ausloeser zeigt auf "${a.dataset.dialogOeffnen}" - dieses Element gibt es nicht`);
      } else {
        a.click();
        await new Promise((r) => setTimeout(r, 120));
        if (!ziel.open) fehler.push('Dialog bleibt beim Klick zu');
        const bezug = a.dataset.dialogBezug;
        if (bezug) {
          const ok = [...ziel.querySelectorAll('[data-dialog-bezug-ziel]')].every(
            (el) => (el.value ?? el.textContent) === bezug,
          );
          if (!ok) fehler.push('Der Bezug des Ausloesers kommt im Dialog nicht an');
        }
        /* MIT DEM SCHLIESSEN-KNOPF DES BAUSTEINS, NICHT MIT `ziel.close()`.
           Hier stand der Browser-Aufruf – der schliesst natuerlich immer. Die
           Pruefung sagte damit „Dialog laesst sich schliessen" aus, ohne je
           angefasst zu haben, was der Besucher anfasst. `data-dialog-schliessen`
           kam in keiner einzigen Pruefung des Motors vor: Ein Klon, der den
           Knopf falsch auszeichnet, haette ein Fenster ohne Ausgang, und alle
           sechs Tore waeren gruen. */
        const schliesser = ziel.querySelector('[data-dialog-schliessen]');
        if (!schliesser) {
          fehler.push('Kein Schliessen-Knopf im Dialog ([data-dialog-schliessen]) – das Fenster hat keinen Ausgang');
          ziel.close();
        } else {
          schliesser.click();
          await new Promise((r) => setTimeout(r, 120));
          if (ziel.open) {
            fehler.push('Der Schliessen-Knopf des Dialogs schliesst ihn nicht');
            ziel.close();
          }
        }
        await new Promise((r) => setTimeout(r, 80));
        if (ziel.open) fehler.push('Dialog laesst sich nicht schliessen');
      }
      return [{ baustein: 'Dialog', ok: fehler.length === 0, detail: fehler.join('; ') }];
    }));

    // --- Assistent: Schritte, Senden-Knopf, Pflichtfeld-Sperre ---------------
    ergebnisse.push(...await page.evaluate(() => {
      const formulare = [...document.querySelectorAll('[data-assistent]')];
      if (formulare.length === 0) return [];
      const raus = [];
      formulare.forEach((form, nr) => {
        const schritte = [...form.querySelectorAll('[data-assistent-schritt]')];
        if (schritte.length < 2) return;
        const fehler = [];
        const sichtbare = () => schritte.filter((s) => !s.hidden);
        const weiter = form.querySelector('[data-assistent-weiter]');
        const senden = form.querySelector('[data-formular-absenden]');

        if (sichtbare().length !== 1 || sichtbare()[0] !== schritte[0]) {
          fehler.push('Es steht nicht genau der erste Schritt offen');
        }
        if (senden && !senden.hidden) {
          fehler.push('Der Senden-Knopf ist schon im ersten Schritt sichtbar - ein ungeduldiger Klick schickt ein halbes Formular ab');
        }

        /* Der wichtigste Fall: Ein leeres Pflichtfeld darf nicht durchlassen.
           Hat der erste Schritt keins, pruefen wir stattdessen, dass "Weiter"
           ueberhaupt weiterschaltet. */
        const pflicht = [...schritte[0].querySelectorAll('[required]')].find((f) => !f.value);
        weiter?.click();
        if (pflicht) {
          if (sichtbare()[0] !== schritte[0]) {
            fehler.push('Leeres Pflichtfeld haelt den Schritt nicht - der Besucher kommt ohne Angabe weiter');
          }
        } else if (sichtbare()[0] !== schritte[1]) {
          fehler.push('"Weiter" schaltet nicht zum naechsten Schritt');
        }

        raus.push({
          baustein: nr > 0 ? `Assistent #${nr + 1}` : 'Assistent',
          ok: fehler.length === 0,
          detail: fehler.join('; '),
        });
      });
      return raus;
    }));

    // --- Akkordeon: Eintrag umschalten; „exklusiv" lässt nur einen offen -----
    ergebnisse.push(...await page.evaluate(async () => {
      const raus = [];
      let nr = 0;
      for (const box of document.querySelectorAll('[data-akkordeon]')) {
        const eintraege = [...box.querySelectorAll('details')];
        if (eintraege.length === 0) continue;
        const exklusiv = box.hasAttribute('data-akkordeon-exklusiv');
        const fehler = [];

        // Bevorzugt den ZWEITEN Eintrag (der erste ist oft schon offen gestylt);
        // ist er bereits offen, den ersten geschlossenen nehmen.
        let ziel = eintraege[1] ?? eintraege[0];
        if (ziel.open) ziel = eintraege.find((d) => !d.open) ?? ziel;
        const summary = ziel.querySelector('summary');
        if (!summary) {
          fehler.push('<details> ohne <summary> – so ist nichts klickbar');
        } else {
          const warOffen = ziel.open;
          summary.click();
          // toggle-Ereignisse feuern verzögert – erst danach schließt
          // „exklusiv" die übrigen Einträge. Kurz warten, dann messen.
          await new Promise((r) => setTimeout(r, 200));
          if (ziel.open === warOffen) fehler.push(warOffen ? 'schließt nach Klick nicht' : 'öffnet nach Klick nicht');
          if (exklusiv && !warOffen) {
            const offen = eintraege.filter((d) => d.open).length;
            if (offen !== 1) fehler.push(`data-akkordeon-exklusiv, aber ${offen} Einträge gleichzeitig offen`);
          }
        }
        const name = `Akkordeon${exklusiv ? ' (exklusiv)' : ''}`;
        raus.push({ baustein: nr > 0 ? `${name} #${nr + 1}` : name, ok: fehler.length === 0, detail: fehler.join('; ') });
        nr++;
      }
      return raus;
    }));

    // --- Vergleich: Regler auf 25 → CSS-Variable --vergleich-pos ≈ 25 % ------
    ergebnisse.push(...await page.evaluate(() => {
      const raus = [];
      document.querySelectorAll('[data-vergleich]').forEach((box, nr) => {
        const regler = box.querySelector('[data-vergleich-regler]');
        if (!regler) return; // ohne Regler startet der Baustein selbst nicht
        regler.value = '25';
        regler.dispatchEvent(new Event('input', { bubbles: true }));
        const roh = box.style.getPropertyValue('--vergleich-pos');
        const pos = parseFloat(roh);
        const ok = Math.abs(pos - 25) < 0.6;
        raus.push({
          baustein: nr > 0 ? `Vergleich #${nr + 1}` : 'Vergleich',
          ok,
          detail: ok ? '' : `--vergleich-pos ist "${roh || '(nicht gesetzt)'}", erwartet 25%`,
        });
      });
      return raus;
    }));

    // --- Slider: Vor-Knopf → aktiver Punkt wandert bzw. Spur bewegt sich -----
    ergebnisse.push(...await page.evaluate(async () => {
      const raus = [];
      let nr = 0;
      for (const box of document.querySelectorAll('[data-slider]')) {
        const spur = box.querySelector('[data-slider-spur]');
        if (!spur || spur.children.length <= 1) continue; // Baustein startet dann selbst nicht
        const vor = box.querySelector('[data-slider-vor]');
        const punkte = [...(box.querySelector('[data-slider-punkte]')?.querySelectorAll('button') ?? [])];
        if (!vor && punkte.length === 0) continue; // reiner Wisch-Slider – nichts zu klicken

        const fehler = [];
        let hinweis = '';
        const aktivIndex = () => punkte.findIndex((p) => p.getAttribute('aria-selected') === 'true');
        const vorher = aktivIndex();
        const scrollVorher = spur.scrollLeft;

        if (vor) vor.click();
        else punkte[1].click();
        // Dank „Bewegung reduzieren" scrollt die Spur sofort; die Pause deckt
        // nur den nachlaufenden Scroll-Abgleich der Punkte (90 ms Debounce) ab.
        await new Promise((r) => setTimeout(r, 250));

        if (punkte.length > 0) {
          const erwartet = vor ? (vorher + 1) % punkte.length : 1;
          const nachher = aktivIndex();
          if (nachher !== erwartet) fehler.push(`aktiver Punkt bleibt bei ${vorher + 1}, erwartet Punkt ${erwartet + 1}`);
          /* AUCH BEI PUNKTEN MUSS SICH DIE SPUR BEWEGEN.
             `scrollVorher` wurde oben erhoben und hier weggeworfen: Sobald es
             Punkte gibt, galt allein das ARIA-Attribut als Beweis. Der Baustein
             ruft aber `spur.scrollTo(...)` und danach `markiere(n)` – ohne
             Rückmeldung, ob wirklich gescrollt wurde. Setzt das Design
             `overflow-x: hidden` auf die Spur (verbreitet, weil Slider ohne
             Scrollbalken gezeigt werden), bewegt sich NICHTS, der Punkt wandert
             trotzdem weiter – und die Prüfung meldet grün, während der Besucher
             immer dasselbe Bild sieht. */
          if (spur.scrollWidth > spur.clientWidth + 2 && Math.abs(spur.scrollLeft - scrollVorher) < 2) {
            fehler.push(
              'der aktive Punkt wandert, die Spur bewegt sich aber nicht – ' +
                'meist `overflow-x: hidden` auf der Spur (nötig ist `auto` oder `scroll`)',
            );
          }
        } else if (spur.scrollWidth > spur.clientWidth + 2) {
          if (Math.abs(spur.scrollLeft - scrollVorher) < 2) fehler.push('Spur bewegt sich nach Klick auf den Vor-Knopf nicht');
        } else {
          // Alle Folien passen ins Bild (z. B. am Desktop): der Klick KANN
          // nichts bewegen – das ist kein Fehler, nur nichts Messbares.
          hinweis = 'Spur passt komplett ins Bild, Bewegung nicht messbar';
        }
        raus.push({ baustein: nr > 0 ? `Slider #${nr + 1}` : 'Slider', ok: fehler.length === 0, detail: fehler.join('; ') || hinweis });
        nr++;
      }
      return raus;
    }));

    // --- Lightbox: Bild klicken → Dialog offen; Escape schließt --------------
    // Escape braucht eine ECHTE Taste (page.keyboard): das Schließen des
    // nativen <dialog> macht der Browser selbst, kein JS-Listener.
    const lightboxGeklickt = await page.evaluate(() => {
      const box = document.querySelector('[data-lightbox]');
      const img = box?.querySelector('img');
      if (!img) return false;
      (img.closest('button') ?? img).click();
      return true;
    });
    if (lightboxGeklickt) {
      const fehler = [];
      const zustand = await page.evaluate(() => {
        const d = document.querySelector('dialog.lightbox');
        return d ? { offen: d.open, src: d.querySelector('img')?.getAttribute('src') ?? '' } : null;
      });
      if (!zustand) fehler.push('nach Klick aufs Bild entsteht kein <dialog class="lightbox">');
      else {
        if (!zustand.offen) fehler.push('Dialog vorhanden, aber nicht geöffnet');
        if (!zustand.src) fehler.push('Dialog zeigt kein Bild (leere src)');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(120);
        const nochOffen = await page.evaluate(() => document.querySelector('dialog.lightbox')?.open ?? false);
        if (nochOffen) fehler.push('Escape schließt die Lightbox nicht');
      }
      ergebnisse.push({ baustein: 'Lightbox', ok: fehler.length === 0, detail: fehler.join('; ') });
    }

    /* --- 2-Klick-Einbettung: den Ladeknopf WIRKLICH drücken -----------------
       Hinter diesem Klick hat bis 05.08.2026 keine Prüfung nachgesehen – das
       Wort „Einbettung" kam in dieser Datei kein einziges Mal vor. In einem
       Kundenprojekt fiel die Karte nach dem Klick auf einen 150-Pixel-Streifen
       zusammen; gefunden hat es der Betreiber, nicht das Tor.

       Die 2-Klick-Karte ist der Standardweg des Motors für die Anfahrt
       (CLAUDE.md 7a) – das trifft also praktisch jeden Kunden.

       Geprüft wird, was der Besucher merkt: Entsteht überhaupt ein Rahmen,
       hat er eine brauchbare Höhe, und läuft die Seite danach seitlich über?
       Der Rahmen zeigt eine fremde Adresse, die es im Prüflauf nicht gibt –
       gemessen wird deshalb der Kasten, nicht sein Inhalt. */
    const einbettungen = await page.evaluate(() => document.querySelectorAll('[data-einbettung]').length);
    if (einbettungen > 0) {
      const fehler = [];
      const vorher = await page.evaluate(() => document.querySelectorAll('iframe').length);
      const geklickt = await page.evaluate(() => {
        const box = document.querySelector('[data-einbettung]');
        const knopf = box.querySelector('[data-einbettung-laden]') ?? box;
        knopf.click();
        return true;
      });
      if (!geklickt) fehler.push('Ladeknopf der Einbettung nicht gefunden');
      await page.waitForTimeout(400);
      const nachher = await page.evaluate(() => {
        const box = document.querySelector('[data-einbettung]');
        const rahmen = box.querySelector('iframe');
        const doc = document.documentElement;
        const br = box.getBoundingClientRect();
        /* NICHT DIE HÖHE DES RAHMENS MESSEN, SONDERN DIE SICHTBARE.
           Der Rahmen bekommt sein Seitenverhältnis per Inline-Stil und bleibt
           deshalb gross, auch wenn der Kasten darunter zusammenfällt – der
           Kasten trägt `overflow: hidden` und schneidet ihn einfach ab. Wer
           den Rahmen misst, sieht 400 px, während der Besucher 150 sieht.
           Beim ersten Lauf dieser Prüfung ist genau das passiert: Der
           nachgestellte Fehler des Kundenprojekts ging durch. */
        const rr = rahmen ? rahmen.getBoundingClientRect() : null;
        const sichtbar = rr
          ? Math.max(0, Math.min(rr.bottom, br.bottom) - Math.max(rr.top, br.top))
          : 0;
        return {
          rahmen: document.querySelectorAll('iframe').length,
          hoehe: Math.round(sichtbar),
          boxHoehe: Math.round(br.height),
          geladen: box.classList.contains('ist-geladen'),
          ueberlauf: doc.scrollWidth > doc.clientWidth + 1,
        };
      });
      if (nachher.rahmen <= vorher) fehler.push('Klick auf „laden" erzeugt keinen Rahmen');
      if (!nachher.geladen) fehler.push('Die Einbettung markiert sich nicht als geladen (.ist-geladen)');
      /* 150 px war der Wert aus dem Kundenprojekt. Alles unter 200 px ist für
         eine Karte oder ein Video unbrauchbar – das ist kein Schönheitsmaß,
         sondern die Grenze, ab der man nichts mehr erkennt. */
      if (nachher.rahmen > vorher && nachher.hoehe < 200) {
        fehler.push(
          `Der Rahmen ist nach dem Klick nur ${nachher.hoehe} px hoch (Kasten ${nachher.boxHoehe} px) – ` +
            'darauf ist nichts zu erkennen. Meist fehlt dem Kasten die Höhe, sobald der Platzhalter weg ist.',
        );
      }
      if (nachher.ueberlauf) fehler.push('Nach dem Laden läuft die Seite seitlich über');
      ergebnisse.push({ baustein: 'Einbettung', ok: fehler.length === 0, detail: fehler.join('; ') });
    }

    // --- Mobilmenü: nur in der Handy-Ansicht – am Desktop ist der Schalter ---
    // ausgeblendet, und ab 900 px setzt der Baustein sich selbst zurück.
    if (breite < 900) {
      const auf = await page.evaluate(() => {
        const schalter = document.querySelector('[data-menue-schalter]');
        const navi = document.querySelector('[data-menue]');
        if (!schalter || !navi) return null;
        schalter.click();
        return {
          expanded: schalter.getAttribute('aria-expanded'),
          offen: navi.classList.contains('ist-offen'),
        };
      });
      if (auf) {
        const fehler = [];
        if (auf.expanded !== 'true') fehler.push(`nach Klick ist aria-expanded="${auf.expanded}" statt "true"`);
        if (!auf.offen) fehler.push('Navigation bekommt keine Klasse .ist-offen');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(120);
        const zu = await page.evaluate(() => ({
          expanded: document.querySelector('[data-menue-schalter]')?.getAttribute('aria-expanded'),
          offen: document.querySelector('[data-menue]')?.classList.contains('ist-offen'),
        }));
        if (zu.expanded !== 'false' || zu.offen) fehler.push('Escape schließt das Menü nicht');
        ergebnisse.push({ baustein: 'Mobilmenü', ok: fehler.length === 0, detail: fehler.join('; ') });
      }
    }

    // --- Formular ------------------------------------------------------------
    /* VORSCHAU (seit 2026-07-27): Das Formular ist sichtbar und bedienbar,
       aber es darf nichts hinausgehen. Geprüft wird beides – dass die Felder
       wirklich da sind (sonst schreibt der Port sie blind) UND dass die Sperre
       strukturell hält: kein Versandziel, kein scharfer Baustein.
       LIVE: nur Struktur prüfen, NIE absenden – das würde echte Mails
       auslösen bzw. als Spam-Versuch in der Zeitfalle landen. */
    ergebnisse.push(...await page.evaluate(async () => {
      const raus = [];
      // Den Modus verrät die gebaute Seite selbst: demo trägt noindex im Kopf.
      const istDemo = !!document.querySelector('meta[name="robots"][content*="noindex"]');
      const hinweise = document.querySelectorAll('[data-formular-demo]');
      const scharfe = document.querySelectorAll('[data-formular]');
      const vorschauen = document.querySelectorAll('[data-formular-vorschau]');

      if (istDemo) {
        if (scharfe.length > 0) {
          raus.push({
            baustein: 'Formular',
            ok: false,
            detail: 'Vorschau, aber ein scharfes Formular ist verdrahtet – es würde ins Leere senden. mode in content.config.ts prüfen und neu bauen (npm run check).',
          });
        }
        if (vorschauen.length > 0 && hinweise.length === 0) {
          raus.push({
            baustein: 'Formular',
            ok: false,
            detail: 'Vorschau-Formular ohne Hinweis darüber – der Kunde hält es für scharf und wundert sich, dass nichts ankommt.',
          });
        }

        for (const [i, form] of [...vorschauen].entries()) {
          const fehler = [];
          const felder = form.querySelectorAll('input:not([type=hidden]), select, textarea');
          if (felder.length === 0) {
            fehler.push('kein einziges sichtbares Feld – dann ist das Formular in der Vorschau wertlos');
          }
          if (!form.querySelector('[data-formular-absenden]')) {
            fehler.push('Absende-Knopf fehlt – der Kunde kann den Ablauf nicht durchspielen');
          }
          // Die Sperre muss im Markup sitzen, nicht nur im Skript.
          const ziel = form.getAttribute('action');
          if (ziel) {
            fehler.push(`Versandziel "${ziel}" steht im Markup – ohne JavaScript ginge die Anfrage doch hinaus`);
          }
          const status = form.querySelector('[data-formular-status]');
          if (!status) {
            fehler.push('Status-Element fehlt – ein Klick auf Senden bliebe unbeantwortet');
          } else {
            /* Wirklich draufklicken: Ein Formular, das beim Absenden gar nichts
               tut, sieht für den Kunden kaputt aus. Pflichtfelder vorher
               füllen, sonst hält die Browser-Prüfung den Klick auf. */
            for (const feld of form.querySelectorAll('[required]')) {
              if (feld.type === 'checkbox' || feld.type === 'radio') feld.checked = true;
              else if (feld.type === 'email') feld.value = 'probe@example.org';
              else if (feld.tagName === 'SELECT') feld.selectedIndex = feld.options.length - 1;
              else feld.value = 'Probe';
            }
            const vorher = location.href;
            form.querySelector('[data-formular-absenden]').click();
            await new Promise((r) => setTimeout(r, 200));
            if (location.href !== vorher) {
              fehler.push('Der Klick auf Senden hat die Seite verlassen – in der Vorschau darf nichts abgeschickt werden');
            } else if (!status.textContent.trim()) {
              fehler.push('Klick auf Senden bleibt ohne jede Rückmeldung – das sieht kaputt aus, nicht nach Vorschau');
            }
          }
          raus.push({
            baustein: i > 0 ? `Formular (Vorschau) #${i + 1}` : 'Formular (Vorschau)',
            ok: fehler.length === 0,
            detail: fehler.join('; '),
          });
        }

        if (vorschauen.length === 0) {
          hinweise.forEach((_, i) => raus.push({ baustein: i > 0 ? `Formular (Demo-Hinweis) #${i + 1}` : 'Formular (Demo-Hinweis)', ok: true, detail: '' }));
        }
      } else {
        if (hinweise.length > 0 || vorschauen.length > 0) {
          raus.push({
            baustein: 'Formular',
            ok: false,
            detail: 'live-Modus, aber das Formular ist noch als Vorschau markiert – niemand kann etwas absenden. Neu bauen (npm run check).',
          });
        }
        scharfe.forEach((form, i) => {
          const fehler = [];
          if (!form.querySelector('[data-formular-absenden]')) fehler.push('Absende-Knopf [data-formular-absenden] fehlt');
          if (!form.querySelector('[data-formular-status]')) fehler.push('Status-Element [data-formular-status] fehlt (keine Rückmeldung nach dem Senden)');
          raus.push({ baustein: i > 0 ? `Formular (Struktur) #${i + 1}` : 'Formular (Struktur)', ok: fehler.length === 0, detail: fehler.join('; ') });
        });
      }
      return raus;
    }));

    // --- Bewegung: springt beim Klicken etwas weg? --------------------------
    /* WARUM ES DIESE MESSUNG GIBT: An einem Tag kamen in einem Kundenprojekt
       DREI Bewegungsfehler in Motor-Bausteinen zusammen - ein Akkordeon, das
       beim Zuklappen die angeklickte Frage unter dem Finger wegzog; ein
       Assistent, der bei jedem Schritt grundlos sprang; ein <details>, das
       erst 68 px hinunter und dann 48 px zurück ruckte. Gemeldet hat alle drei
       der Auftraggeber. Alle vier Tore waren gruen - sie messen Ueberlauf,
       Kontrast, JS-Fehler und Klickbarkeit, aber keine BEWEGUNG.

       Gemessen wird das Einfachste, was zaehlt: Bleibt das angeklickte Element
       da, wo der Finger es beruehrt hat? */
    ergebnisse.push(...await page.evaluate(async () => {
      const raus = [];
      const warte = (ms) => new Promise((r) => setTimeout(r, ms));

      /**
       * Wartet, bis die Seite wirklich still steht.
       *
       * WARUM DAS SEIN MUSS: Die Seite hat `scroll-behavior: smooth`. Wird
       * gemessen, während noch eine Scroll-Bewegung läuft, überschreibt die
       * jede Korrektur des Bausteins - und die Prüfung meldet einen Fehler,
       * den es nicht gibt. Genau so ist es beim ersten Lauf dieser Messung
       * passiert: 62 px gemeldet, tatsächlich 0. Eine Prüfung, die Fehlalarm
       * schlägt, ist schlimmer als keine.
       */
      async function ruheAbwarten() {
        let letzte = -1;
        for (let i = 0; i < 40 && letzte !== window.scrollY; i++) {
          letzte = window.scrollY;
          await warte(50);
        }
      }

      /** Klickt ein Element und misst, wie weit es sich dabei verschiebt. */
      async function wandertBeimKlick(el) {
        const vorher = el.getBoundingClientRect().top;
        el.click();
        // Ueber mehrere Bilder messen: Der schlimmste Ruck passiert im ersten,
        // die Bewegung endet erst nach der Animation.
        let groesster = 0;
        for (const ms of [16, 60, 150, 320]) {
          await warte(ms);
          const jetzt = el.getBoundingClientRect().top;
          groesster = Math.max(groesster, Math.abs(jetzt - vorher));
        }
        return groesster;
      }

      // Akkordeon: die angeklickte Frage darf sich nicht bewegen.
      for (const [nr, box] of [...document.querySelectorAll('[data-akkordeon]')].entries()) {
        const fragen = [...box.querySelectorAll('details > summary')];
        if (fragen.length < 2) continue;
        const fehler = [];

        // Erst einen weiter OBEN oeffnen - das ist der gefaehrliche Fall bei
        // "nur eines offen": Schliesst er, rutscht alles darunter hoch.
        fragen[0].click();
        await warte(320);

        /* Die anzuklickende Frage sicher ins Bild holen und die Seite zur Ruhe
           kommen lassen. Ohne das holt der Browser sie beim Klick selbst ins
           Bild - eine Bewegung, die nichts mit dem Baustein zu tun hat. */
        const ziel = fragen[fragen.length - 1];
        ziel.scrollIntoView({ block: 'center' });
        await ruheAbwarten();

        const wanderung = await wandertBeimKlick(ziel);
        if (wanderung > 8) {
          fehler.push(
            `Die angeklickte Frage wandert beim Aufklappen um ${Math.round(wanderung)} px - ` +
              'sie springt dem Besucher unter dem Finger weg',
          );
        }
        raus.push({
          baustein: nr > 0 ? `Akkordeon (Bewegung) #${nr + 1}` : 'Akkordeon (Bewegung)',
          ok: fehler.length === 0,
          detail: fehler.join('; '),
        });
      }

      // Assistent: ein Schrittwechsel darf nicht grundlos springen.
      for (const [nr, form] of [...document.querySelectorAll('[data-assistent]')].entries()) {
        const weiter = form.querySelector('[data-assistent-weiter]');
        const schritte = [...form.querySelectorAll('[data-assistent-schritt]')];
        if (!weiter || schritte.length < 2) continue;

        // Nur messen, wenn das Formular ohnehin ganz im Bild steht - dann darf
        // sich beim Weiterklicken gar nichts bewegen.
        const kasten = form.getBoundingClientRect();
        if (kasten.top < 0 || kasten.bottom > window.innerHeight) continue;

        for (const feld of schritte[0].querySelectorAll('[required]')) {
          if (feld.type === 'checkbox' || feld.type === 'radio') feld.checked = true;
          else if (feld.type === 'email') feld.value = 'probe@example.org';
          else if (feld.tagName === 'SELECT') feld.selectedIndex = feld.options.length - 1;
          else feld.value = 'Probe';
        }

        await ruheAbwarten();
        const vorher = window.scrollY;
        weiter.click();
        await warte(400);
        const sprung = Math.abs(window.scrollY - vorher);
        raus.push({
          baustein: nr > 0 ? `Assistent (Bewegung) #${nr + 1}` : 'Assistent (Bewegung)',
          ok: sprung <= 8,
          detail:
            sprung > 8
              ? `Die Seite springt beim Schrittwechsel um ${Math.round(sprung)} px, obwohl das Formular ganz sichtbar ist`
              : '',
        });
      }

      return raus;
    }));

    // --- Bericht für diese Seite × Breite ------------------------------------
    geprueft += ergebnisse.length;
    // Welche Baustein-Art kam überhaupt jemals vor? (siehe Schlussbericht)
    for (const e of ergebnisse) gesehen.add(String(e.baustein).replace(/ #\d+$/, ''));
    const kennung = `${seite} @ ${breite}px`;
    const alleFehler = [...new Set(jsFehler)];

    if (ergebnisse.length === 0 && alleFehler.length === 0) {
      console.log(`  · ${kennung} — keine Verhaltens-Bausteine`);
    } else {
      const liste = ergebnisse.map((e) => `${e.baustein} ${e.ok ? '✓' : '✗'}`).join(' · ');
      const gruen = ergebnisse.every((e) => e.ok) && alleFehler.length === 0;
      console.log(`  ${gruen ? '✓' : '✗'} ${kennung} — ${liste || 'keine Bausteine'}${alleFehler.length ? ' · JS-Fehler ✗' : ''}`);
    }

    for (const e of ergebnisse) {
      if (!e.ok) probleme.push(`${kennung}: ${e.baustein} -> ${e.detail}`);
    }
    for (const f of alleFehler) probleme.push(`${kennung}: JS-Fehler während der Bedienung -> ${f.slice(0, 140)}`);

    await kontext.close();
  }
}

/* ===========================================================================
   ZWEITER DURCHGANG: MIT ECHTER BEWEGUNG
   ===========================================================================
   Der Hauptlauf oben fährt bewusst mit „Bewegung reduzieren" – das macht ihn
   deterministisch. Der Preis: Animationen laufen dort gar nicht, also wird
   auch nie geprüft, ob sie sauber aussehen.

   Im Kundenprojekt lag dort einer der beiden Fehler, die der Betreiber selbst
   gefunden hat: Das Akkordeon wanderte beim Zuklappen unter dem Finger weg.
   Kein Tor hat es je gesehen, er fand es in fünf Minuten.

   Dieser Durchgang ist deshalb kurz und gezielt: nur die Startseite, nur eine
   Breite, nur die Bausteine mit Bewegung. Gemessen wird, ob sich beim Auf- und
   Zuklappen etwas SPRINGEND verschiebt – also ob der Punkt, den der Finger
   berührt, unter ihm wegläuft.
   =========================================================================== */
{
  const kontext = await browser.newContext({ viewport: { width: 390, height: 900 } });
  const page = await kontext.newPage();

  /* DIE SEITE MIT DEM AKKORDEON SUCHEN, nicht die erste nehmen.
     `seiten[0]` ist alphabetisch die 404-Seite – dort gibt es nichts zu
     bewegen, und der Durchgang meldete brav „grün" für eine Messung, die
     nie stattgefunden hat. */
  let zielSeite = null;
  for (const s of seiten) {
    await page.goto(BASIS + s, { waitUntil: 'load' });
    const hat = await page.evaluate(() => document.querySelectorAll('[data-akkordeon] details').length > 0);
    if (hat) {
      zielSeite = s;
      break;
    }
  }
  if (zielSeite) await page.waitForTimeout(300);

  const bewegung = !zielSeite ? [] : await page.evaluate(async () => {
    const fehler = [];
    const details = [...document.querySelectorAll('[data-akkordeon] details')];
    for (const d of details.slice(0, 3)) {
      const summary = d.querySelector('summary');
      if (!summary) continue;
      d.open = false;
      await new Promise((r) => setTimeout(r, 350));
      const vorher = summary.getBoundingClientRect().top;
      summary.click();
      /* Mitten in der Animation messen, nicht danach: Genau dort wandert der
         Griff weg, und genau dort liegt der Finger. */
      await new Promise((r) => setTimeout(r, 120));
      const mitten = summary.getBoundingClientRect().top;
      await new Promise((r) => setTimeout(r, 400));
      const nachher = summary.getBoundingClientRect().top;
      const sprung = Math.max(Math.abs(mitten - vorher), Math.abs(nachher - vorher));
      /* Ein Griff, der beim Öffnen des EIGENEN Eintrags stehen bleibt, ist
         richtig. Verschiebt er sich um mehr als ein paar Pixel, läuft er unter
         dem Finger weg. */
      if (sprung > 8) {
        fehler.push(
          `Akkordeon: der Griff „${(summary.textContent || '').trim().slice(0, 28)}" wandert beim Klick um ${Math.round(sprung)} px`,
        );
      }
      d.open = false;
      await new Promise((r) => setTimeout(r, 350));
    }
    return fehler;
  });

  if (zielSeite) {
    for (const f of bewegung) probleme.push(`${zielSeite} @ 390px (mit Bewegung): ${f}`);
    geprueft += 1;
    gesehen.add('Akkordeon (Bewegung)');
    console.log(
      `  ${bewegung.length === 0 ? '✓' : '✗'} ${zielSeite} @ 390px  · zweiter Durchgang MIT Bewegung`,
    );
  }
  await kontext.close();
}

/* ===========================================================================
   DRITTER DURCHGANG: DER LINK IM ZUSTIMMUNGS-HÄKCHEN
   ===========================================================================
   Ein Pflicht-Häkchen „Ich habe die Datenschutzerklärung gelesen" bekommt vom
   Motor einen echten Link auf das genannte Dokument. Dabei gibt es genau eine
   Falle, und sie ist rechtlicher Natur: Ein Klick auf diesen Link darf das
   Häkchen NICHT setzen. Eine so erschlichene Zustimmung wäre keine – die
   Besucherin wollte nachlesen, nicht zustimmen.

   Warum das ein EIGENER Durchgang ist: Es lässt sich nicht im Seiten-Skript
   messen. Ob ein Klick auf ein Kindelement die Beschriftung „durchschlägt",
   entscheidet der Browser beim echten Klick; ein `element.click()` im Skript
   löst genau diesen Weg nicht aus. Gemessen wird deshalb mit dem Zeiger.

   Die Gegenrichtung gehört mit: Der Text NEBEN dem Link muss das Häkchen
   weiterhin setzen. Ein Häkchen, das man nur noch im Kästchen selbst treffen
   kann, ist am Handy eine Zumutung – und der Fehler wäre unsichtbar, weil er
   wie eine ungenaue Berührung aussieht.
   =========================================================================== */
{
  const kontext = await browser.newContext({ viewport: { width: 390, height: 900 } });
  const page = await kontext.newPage();
  /* Der Link öffnet einen neuen Tab (target="_blank") – der wird sofort wieder
     geschlossen, sonst wartet der Durchgang darauf. */
  kontext.on('page', (p) => p.close().catch(() => {}));

  for (const s of seiten) {
    await page.goto(BASIS + s, { waitUntil: 'load' });
    const kaesten = page.locator('label[data-typ="haekchen"]:has(.formular__label-link)');
    if ((await kaesten.count()) === 0) continue;

    const label = kaesten.first();
    const kasten = label.locator('input[type="checkbox"]');
    const link = label.locator('.formular__label-link').first();
    const fehler = [];

    await link.click();
    await page.waitForTimeout(250);
    if (await kasten.isChecked()) {
      fehler.push('Ein Klick auf den Link im Häkchen SETZT das Häkchen – das wäre eine erschlichene Zustimmung');
    }

    /* Ganz links im Label steht Text vor dem Link. */
    await label.click({ position: { x: 4, y: 8 } });
    await page.waitForTimeout(200);
    if (!(await kasten.isChecked())) {
      fehler.push('Ein Klick auf den Text des Häkchens setzt es nicht mehr – am Handy kaum noch zu treffen');
    }

    gesehen.add('Zustimmungs-Häkchen');
    geprueft++;
    const kennung = `${s} @ 390px`;
    console.log(`  ${fehler.length === 0 ? '✓' : '✗'} ${kennung} — Zustimmungs-Häkchen ${fehler.length === 0 ? '✓' : '✗'}`);
    for (const f of fehler) probleme.push(`${kennung}: Zustimmungs-Häkchen -> ${f}`);
    break; // ein Beleg genügt – der Baustein ist auf allen Seiten derselbe
  }
  await kontext.close();
}

await browser.close();
stop();

console.log('');
if (probleme.length > 0) {
  console.log('✗ Interaktionstest NICHT bestanden:\n');
  for (const p of probleme) console.log(`  • ${p}`);
  console.log(`\n${probleme.length} Problem(e). Das erwartete Markup jedes Bausteins steht im Kopf
seiner Datei in src/lib/verhalten/ – meist fehlt ein data-Attribut oder eine
Zuordnung (Tab ohne Panel, Filterwert ohne Kategorie).`);
  process.exit(1);
}
console.log(`✓ Alle Bedien-Elemente funktionieren (${geprueft} Prüfung(en), ${seiten.length} Seite(n) × ${BREITEN.join('/')} px).`);

const nieGefahren = ALLE_PRUEFUNGEN.filter(
  (p) => !gesehen.has(p) && !(ALTERNATIVEN[p] ?? []).some((a) => gesehen.has(a)),
);
if (nieGefahren.length) {
  console.log('');
  /* „auf dieser Seite" stand hier, während zehn Seiten gefahren wurden – der
     Leser sucht dann auf der falschen. */
  console.log(
    `  NICHT GEPRÜFT – auf keiner der ${seiten.length} Seiten kam ${nieGefahren.length} Baustein-Art vor:`,
  );
  console.log(`  ${nieGefahren.join(' · ')}`);
  console.log('');
  console.log('  Das ist kein Fehler: Was die Seite nicht hat, kann nicht geprüft werden.');
  console.log('  Es heißt aber, dass „alle Bedien-Elemente funktionieren" sich NUR auf die');
  console.log('  tatsächlich vorhandenen bezieht. Baut das Design einen dieser Bausteine');
  console.log('  ein, läuft seine Prüfung hier zum ERSTEN Mal – Ergebnis dann genau ansehen.');
}
