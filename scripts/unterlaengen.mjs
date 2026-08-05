/**
 * =============================================================================
 *  UNTERLÄNGEN – wo schneidet die Seite Buchstaben ab?
 * =============================================================================
 *  Aus der Abnahme eines Kundenprojekts: „manche Buchstaben schneiden ab, weil
 *  sie zu tief gehen." Gemeint sind Unterlängen – g, j, p, q, y, ß und das
 *  Komma. Sie reichen unter die Grundlinie hinaus, und wo eine Kante knapp
 *  darunter sitzt, werden sie gekappt.
 *
 *  DER HÄUFIGSTE FALL IST NICHT `overflow: hidden`, SONDERN DER FARBVERLAUF.
 *  Füllt ein Design eine Überschrift mit `background-clip: text` – in
 *  Claude-Designs sehr häufig, oft zusammen mit `line-height: 1` –, ist die
 *  Schrift kein gefärbtes Zeichen mehr, sondern ein Fenster auf den
 *  Hintergrund. Der endet an der Kante des Elements. Was darüber hinausragt,
 *  bekommt gar keine Füllung: nicht überdeckt, sondern nie gemalt. Aus
 *  „Designkategorien" wird optisch „Desi_nkate_orien" – auf der größten
 *  Überschrift der Seite.
 *
 *  DAS IST MIT DEM AUGE NICHT ZU FINDEN. Es trifft einzelne Wörter bei
 *  einzelnen Breiten, und ein halb abgeschnittenes „g" sieht auf einem
 *  Screenshot aus wie ein „g". Es rutscht durch ALLE anderen Tore: Es läuft
 *  nichts über, es wird nichts überdeckt, es gibt keine Meldung und kein
 *  Kontrastproblem. Deshalb wird hier gerechnet statt geschaut:
 *
 *    1. Für jedes Element mit Text wird die ECHTE Tinte vermessen – nicht die
 *       Zeilenbox. Die Zeilenbox ist eine Rechenhilfe des Browsers und sagt
 *       nichts darüber, wie weit ein „g" wirklich hinunterreicht. Dafür misst
 *       `canvas.measureText().actualBoundingBoxDescent` die Schrift selbst.
 *    2. Dann wird jede Kante gesucht, die diesen Text beschneiden kann – der
 *       Malkasten des Farbverlaufs und jeder Vorfahr mit `overflow: hidden`.
 *    3. Gemeldet wird, was darüber hinausragt.
 *
 *  DIE DREI FILTER SIND NICHT VERHANDELBAR. Ohne sie meldet die Prüfung
 *  hundert harmlose Stellen und ertränkt die drei echten darin – siehe die
 *  Begründungen im Code. Eine Prüfung, der niemand mehr glaubt, ist keine.
 *
 *  DIE ANDERE HÄLFTE IST EIN REZEPT, KEIN CODE: Wie ein Verlaufs-Effekt zu
 *  schreiben ist, damit er gar nicht erst abschneidet, steht in CLAUDE.md
 *  Abschnitt 4 („Farbverlauf in der Schrift").
 *
 *      npm run unterlaengen
 * =============================================================================
 */
import { chromium } from 'playwright';
import { join } from 'node:path';
import { starteDistServer } from './lib/dist-server.mjs';
import { verlangeAktuellesDist } from './lib/bau-marke.mjs';

const WURZEL = process.cwd();
verlangeAktuellesDist(WURZEL, 'npm run unterlaengen');

const MESSUNG = () => {
  const UNTERLAENGEN = /[gjpqyßQ,;µ@]/;
  const leinwand = document.createElement('canvas');
  const stift = leinwand.getContext('2d');

  /* FILTER 0: NUR FÜR AUGEN GEDACHTER TEXT ZÄHLT.
     `.sr-only` (bzw. jede Variante davon) klemmt Text absichtlich auf ein
     Pixel zusammen – er ist nur für Vorleseprogramme da und soll gar nicht zu
     sehen sein. Diese Prüfung meldete ihn beim ersten Lauf als „27 px zu
     tief": formal richtig, praktisch Unsinn, und genau die Sorte Fehlalarm,
     die eine Prüfung wertlos macht. Wer Text auf ein Pixel klemmt, tut das nie
     versehentlich. */
  const nurFuerVorleser = (el) => {
    for (let p = el; p && p !== document.documentElement; p = p.parentElement) {
      const r = p.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) return true;
    }
    return false;
  };

  /** Jede Kante über dem Element, die den Text beschneiden kann. */
  function kanten(el) {
    const raus = [];
    let p = el;
    while (p && p !== document.documentElement) {
      const s = getComputedStyle(p);
      if (/hidden|clip/.test(s.overflowY) || /hidden|clip/.test(s.overflowX)) {
        raus.push({ el: p, rect: p.getBoundingClientRect(), style: s });
      }
      p = p.parentElement;
    }
    return raus;
  }

  const funde = [];
  for (const el of document.querySelectorAll('body *')) {
    /* Nur Elemente mit eigenem Text – sonst würde jeder Container die Sünden
       seiner Kinder doppelt melden. */
    const eigenerText = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent)
      .join('')
      .trim();
    if (!eigenerText || !UNTERLAENGEN.test(eigenerText)) continue;

    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) continue;
    if (nurFuerVorleser(el)) continue;
    /* FILTER 1 UND 2 – NUR Elemente, bei denen Zeilen von oben nach unten
       gestapelt werden. Zwei Sorten Fehlalarm fallen damit weg:

       • INLINE-ELEMENTE (<a>, <strong> mitten im Satz). Ihr Rechteck ist so
         hoch wie die Schrift, nicht wie die Zeile – die Unterlänge steht dort
         IMMER darunter und ist trotzdem vollständig sichtbar, weil die Zeile
         des Absatzes viel höher ist.
       • FLEX- UND GRID-KÄSTEN. Dort sitzt der Text mittig statt oben, und die
         Rechnung „wievielte Zeile mal Zeilenhöhe" trifft die Grundlinie nicht
         einmal näherungsweise. Ein Knopf mit 44 px Tippfläche und 26 px Zeile
         wurde so als zweizeilig gelesen und um 6 px danebengeschätzt. */
    if (!['block', 'list-item', 'flow-root', 'inline-block'].includes(s.display)) continue;
    const rect = el.getBoundingClientRect();
    if (rect.height === 0 || rect.width === 0) continue;

    stift.font = `${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
    const m = stift.measureText(eigenerText);
    const tinteUnten = m.actualBoundingBoxDescent;
    const schriftAufwaerts = m.fontBoundingBoxAscent;
    const schriftAbwaerts = m.fontBoundingBoxDescent;
    if (!Number.isFinite(tinteUnten)) continue;

    /* Grundlinie der LETZTEN Zeile. Bei einzeiligem Text sitzt sie mittig in
       der Zeilenbox; bei mehrzeiligem zählt die unterste Zeile, denn nur dort
       kann etwas an die untere Kante stoßen. */
    const zeile = parseFloat(s.lineHeight) || schriftAufwaerts + schriftAbwaerts;
    const innen = rect.height - (parseFloat(s.paddingTop) || 0) - (parseFloat(s.paddingBottom) || 0);
    const zeilen = Math.max(1, Math.round(innen / zeile));
    const letzteZeileOben = rect.top + (parseFloat(s.paddingTop) || 0) + (zeilen - 1) * zeile;
    const grundlinie =
      letzteZeileOben + (zeile - (schriftAufwaerts + schriftAbwaerts)) / 2 + schriftAufwaerts;
    const tinteBis = grundlinie + tinteUnten;

    const name = (n) =>
      n.tagName.toLowerCase() +
      (n.className && typeof n.className === 'string'
        ? '.' + n.className.trim().split(/\s+/).slice(0, 2).join('.')
        : '');

    /* ZUERST der Malkasten. Bei `background-clip: text` zählt nicht das
       Element mit dem Text, sondern das mit dem Hintergrund – in einem Hero
       ist der Text oft in <span> gegliedert, während der Effekt an der <h1>
       darüber hängt. */
    let malkasten = null;
    for (let p = el; p && p !== document.documentElement; p = p.parentElement) {
      const ps = getComputedStyle(p);
      if (ps.backgroundClip === 'text' || ps.webkitBackgroundClip === 'text') {
        const pr = p.getBoundingClientRect();
        malkasten = { el: p, unten: pr.bottom - (parseFloat(ps.borderBottomWidth) || 0) };
        break;
      }
    }
    if (malkasten) {
      const ueberstand = tinteBis - malkasten.unten;
      if (ueberstand > 0.5) {
        funde.push({
          art: 'ohne-fuellung',
          text: eigenerText.slice(0, 60),
          element: name(el),
          kante: name(malkasten.el) + ' [background-clip: text]',
          ueberstand: Math.round(ueberstand * 10) / 10,
          schriftgroesse: s.fontSize,
          zeilenhoehe: s.lineHeight,
        });
      }
      continue;
    }

    /* FILTER 3: Ohne Farbverlauf in der Schrift ist eine herausragende
       Unterlänge für sich genommen KEIN Fehler – sie steht dann einfach in der
       Luft darunter und ist vollständig zu sehen. Zum Fehler wird sie erst,
       wenn eine Kante sie beschneidet. Genau danach wird jetzt gesucht, und
       nur danach. */
    for (const k of kanten(el)) {
      /* Ein Element mit eigener Bildlaufleiste schneidet nicht ab, es rollt. */
      if (k.el !== el && k.el.scrollHeight > k.el.clientHeight + 1) continue;
      const ueberstand = tinteBis - k.rect.bottom;
      if (ueberstand > 0.5) {
        funde.push({
          art: 'abgeschnitten',
          text: eigenerText.slice(0, 60),
          element: name(el),
          kante: name(k.el),
          ueberstand: Math.round(ueberstand * 10) / 10,
          schriftgroesse: s.fontSize,
          zeilenhoehe: s.lineHeight,
        });
        break;
      }
    }
  }
  return funde;
};

const { basis: BASIS, seiten, stop } = await starteDistServer(join(WURZEL, 'dist'));
const browser = await chromium.launch();
const alle = [];

console.log(`Unterlängen: ${seiten.length} Seite(n) × 350/768/1440 px\n`);

for (const breite of [350, 768, 1440]) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: 900 } });
  for (const pfad of seiten) {
    const seite = await ctx.newPage();
    await seite.goto(BASIS + pfad, { waitUntil: 'networkidle' });
    /* Zugeklappte Bereiche mitmessen: Ein abgeschnittenes Wort im FAQ sieht
       man sonst nie. */
    await seite.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)));
    await seite.waitForTimeout(250);
    const funde = await seite.evaluate(MESSUNG);
    for (const f of funde) alle.push({ ...f, breite, pfad });
    await seite.close();
  }
  await ctx.close();
}
await browser.close();
stop();

if (alle.length === 0) {
  console.log(`✓ Keine abgeschnittenen Unterlängen (${seiten.length} Seite(n) × 350/768/1440 px).`);
  process.exit(0);
}

/* Nach Element gruppieren – ein Fehler in einer CSS-Regel trifft meist viele
   Stellen, und eine Liste mit 80 Zeilen verdeckt, dass es drei Ursachen sind. */
const nach = new Map();
for (const f of alle) {
  const schluessel = `${f.element} @ ${f.kante}`;
  if (!nach.has(schluessel)) nach.set(schluessel, []);
  nach.get(schluessel).push(f);
}

console.log(`✗ ${alle.length} abgeschnittene Stelle(n) in ${nach.size} Ursache(n):\n`);
for (const [schluessel, funde] of [...nach.entries()].sort((a, b) => b[1].length - a[1].length)) {
  const schlimmster = funde.reduce((a, b) => (b.ueberstand > a.ueberstand ? b : a));
  const breiten = [...new Set(funde.map((f) => f.breite))].sort((a, b) => a - b);
  console.log(`  ${schluessel}`);
  console.log(`    ${funde.length}× · bis zu ${schlimmster.ueberstand} px zu tief · Breiten ${breiten.join('/')}`);
  console.log(`    Schrift ${schlimmster.schriftgroesse} / Zeile ${schlimmster.zeilenhoehe}`);
  console.log(`    schlimmster Fall: "${schlimmster.text}" auf ${schlimmster.pfad} @ ${schlimmster.breite}px\n`);
}
console.log(
  '  Bei „[background-clip: text]" hilft das Rezept aus CLAUDE.md Abschnitt 4:\n' +
    '  am Verlaufs-Element `padding-block: 0.09em` PLUS `margin-block: -0.09em`.\n' +
    '  Das Padding vergrößert den Malkasten, die negative Marge nimmt das\n' +
    '  Außenmaß exakt zurück – das Layout verschiebt sich um kein Pixel.\n',
);
process.exit(1);
