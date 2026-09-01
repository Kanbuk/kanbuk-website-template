#!/usr/bin/env node
/**
 * =============================================================================
 *  npm run messung – WAS MELDET DIESE WEBSITE?
 * =============================================================================
 *  Liest die GEBAUTE Website und schreibt auf, welche Ereignisse sie an den
 *  Statistik-Dienst schickt – und welche davon dort als Schlüsselereignis
 *  anzulegen sind.
 *
 *  WOZU ES DAS GIBT: Die Liste ist bei jedem Kunden anders, weil jede Seite
 *  andere Kontaktwege hat – der eine hat WhatsApp und keine Nummer, der
 *  nächste eine Speisekarte als PDF, der dritte drei Formulare. Wer sie von
 *  Hand zusammenstellt, vergisst etwas: An einer echten Kundenseite standen
 *  elf `tel:`-Verweise, von denen fünf ein Messattribut trugen. Der Betrieb
 *  hätte die Hälfte seiner Anrufe gezählt und die Zahl für die Wahrheit
 *  gehalten.
 *
 *  KEIN TOR. Es gibt hier nichts zu bestehen – der Befehl schreibt eine Liste
 *  und ist damit fertig. (Die neun Tore stehen in CLAUDE.md Abschnitt 10; ein
 *  zehntes wäre das hier nicht.)
 *
 *  Gelesen wird `dist/` – also das, was der Besucher wirklich bekommt, nicht
 *  die Quelltexte. Ein Messpunkt, den eine Bedingung wegfallen lässt, taucht
 *  hier deshalb richtigerweise nicht auf.
 * =============================================================================
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const WURZEL = process.cwd();
const DIST = join(WURZEL, 'dist');
const MESSBAUSTEIN = join(WURZEL, 'src/lib/verhalten/messung.ts');

if (!existsSync(DIST)) {
  console.error('\n✗ Es gibt noch keine gebaute Website (dist/ fehlt).');
  console.error('  Erst `npm run check` oder `npm run build` laufen lassen.\n');
  process.exit(1);
}

/* ---------------------------------------------------------------------------
   DIE ERKANNTEN WEGE STEHEN IM BAUSTEIN, NICHT HIER.
   Die Namen werden aus messung.ts gelesen; die Muster zum Wiederfinden im
   HTML stehen darunter. Weichen beide Listen voneinander ab, sagt der Befehl
   es – sonst driften sie auseinander und die Anlege-Liste wird still falsch.
   --------------------------------------------------------------------------- */
const MUSTER = {
  anruf_getippt: { was: 'tel:-Verweis', passt: (z) => z.startsWith('tel:') },
  mail_getippt: { was: 'mailto:-Verweis', passt: (z) => z.startsWith('mailto:') },
  whatsapp_getippt: {
    was: 'WhatsApp-Verweis',
    passt: (z) => /^https?:\/\/(?:wa\.me|api\.whatsapp\.com)/i.test(z),
  },
  route_geplant: {
    was: 'Kartenverweis',
    passt: (z) =>
      /^https?:\/\/(?:[a-z0-9.-]*\.)?(?:google\.[a-z.]+\/maps|maps\.google\.|maps\.app\.goo\.gl|openstreetmap\.org)/i.test(
        z,
      ),
  },
  dokument_geoeffnet: { was: 'PDF-Verweis', passt: (z) => /\.pdf(?:$|[?#])/i.test(z) },
};

const imBaustein = new Set();
if (existsSync(MESSBAUSTEIN)) {
  const quelle = readFileSync(MESSBAUSTEIN, 'utf-8');
  const block = quelle.slice(quelle.indexOf('ERKANNTE_WEGE'));
  for (const m of block.matchAll(/name:\s*'([a-z_]+)'/g)) imBaustein.add(m[1]);
}
const nurHier = Object.keys(MUSTER).filter((n) => !imBaustein.has(n));
const nurDort = [...imBaustein].filter((n) => !MUSTER[n]);
if (imBaustein.size && (nurHier.length || nurDort.length)) {
  console.error('\n⚠ scripts/messung.mjs und src/lib/verhalten/messung.ts sind auseinandergelaufen.');
  if (nurDort.length) console.error(`  Nur im Baustein: ${nurDort.join(', ')} – hier ergänzen.`);
  if (nurHier.length) console.error(`  Nur hier: ${nurHier.join(', ')} – im Baustein ergänzt oder entfernt?`);
  console.error('  Die Liste unten ist so lange unvollständig.\n');
}

/* --------------------------------------------------------------------------- */
function alleHtml(dir, treffer = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) alleHtml(p, treffer);
    else if (e.endsWith('.html')) treffer.push(p);
  }
  return treffer;
}

const seiten = alleHtml(DIST);
const erkannt = {}; // name -> { elemente, seiten:Set }
const vonHand = {}; // name -> { elemente, seiten:Set }
const formulare = new Set();
let hatBanner = false;

for (const datei of seiten) {
  const html = readFileSync(datei, 'utf-8');
  const seite = '/' + relative(DIST, datei).replace(/index\.html$/, '').replace(/\.html$/, '');

  for (const m of html.matchAll(/data-messung="([a-z_]+)"/g)) {
    const e = (vonHand[m[1]] ||= { elemente: 0, seiten: new Set() });
    e.elemente++;
    e.seiten.add(seite);
  }

  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const ziel = m[1];
    for (const name of Object.keys(MUSTER)) {
      if (!MUSTER[name].passt(ziel)) continue;
      const e = (erkannt[name] ||= { elemente: 0, seiten: new Set() });
      e.elemente++;
      e.seiten.add(seite);
      break;
    }
  }

  for (const m of html.matchAll(/data-formular-id="([^"]+)"/g)) formulare.add(m[1]);
  if (/data-einwilligung-banner/.test(html)) hatBanner = true;
}

/* --------------------------------------------------------------------------- */
const SCHLUESSEL = new Set([
  'anruf_getippt',
  'mail_getippt',
  'whatsapp_getippt',
  'generate_lead',
]);

function zeile(name, rechts) {
  const marke = SCHLUESSEL.has(name) ? '  ← Schlüsselereignis' : '';
  return `  ${name.padEnd(22)}${rechts}${marke}`;
}
function stueck(n, wort) {
  return `${n} ${wort}${n === 1 ? '' : n && wort.endsWith('e') ? 'n' : ''}`;
}

console.log('\n╔══════════════════════════════════════════════════════════════════╗');
console.log('║  Was diese Website meldet                                        ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');
console.log(`\n${seiten.length} Seiten gelesen (dist/).`);

const konfig = existsSync(join(WURZEL, 'content.config.ts'))
  ? readFileSync(join(WURZEL, 'content.config.ts'), 'utf-8')
  : '';
const hatStatistikDienst = /kategorie:\s*'statistik'/.test(konfig);
if (!hatStatistikDienst) {
  console.log(
    '\n⚠ In content.config.ts ist KEIN Dienst der Kategorie „statistik" eingetragen.\n' +
      '  Dann gibt es im Browser gar keinen Empfänger: Der Baustein misst, und alles\n' +
      '  fällt still auf den Boden. Die Liste unten sagt, was gemessen WÜRDE.',
  );
}

console.log('\n── Der Motor erkennt sie von selbst ──────────────────────────────\n');
const erkanntNamen = Object.keys(erkannt);
if (!erkanntNamen.length) {
  console.log('  (keine – die Seite hat keine Kontaktverweise dieser Art)');
} else {
  for (const name of erkanntNamen) {
    const e = erkannt[name];
    console.log(
      zeile(
        name,
        `${String(e.elemente).padStart(3)} × ${MUSTER[name].was.padEnd(18)} auf ${stueck(e.seiten.size, 'Seite')}`,
      ),
    );
  }
}

console.log('\n── Im Markup von Hand gesetzt (data-messung) ─────────────────────\n');
const handNamen = Object.keys(vonHand);
if (!handNamen.length) {
  console.log('  (keine)');
} else {
  for (const name of handNamen) {
    const e = vonHand[name];
    console.log(
      zeile(name, `${String(e.elemente).padStart(3)} × Element            auf ${stueck(e.seiten.size, 'Seite')}`),
    );
  }
}

console.log('\n── Aus dem Code ──────────────────────────────────────────────────\n');
if (formulare.size) {
  console.log(zeile('generate_lead', `Formular abgeschickt und vom Server angenommen`));
  console.log(
    zeile('anfrage_gescheitert', `Absenden fehlgeschlagen – die Zahl, an der ein Betrieb`),
  );
  console.log(`  ${''.padEnd(22)}sieht, dass ihm Anfragen verlorengehen`);
  console.log(`\n  Feld lead_source unterscheidet die Formulare: ${[...formulare].join(', ')}`);
} else {
  console.log('  (kein Formular auf der Seite)');
}
if (hatBanner) {
  console.log(zeile('einwilligung_erteilt', `Feld auswahl: alle | statistik | funktional | keine`));
}

console.log('\n── Anzulegen im Statistik-Dienst ─────────────────────────────────\n');
const anlegen = [...erkanntNamen, ...handNamen, ...(formulare.size ? ['generate_lead', 'anfrage_gescheitert'] : []), ...(hatBanner ? ['einwilligung_erteilt'] : [])];
console.log(
  '  Nichts. Die Ereignisse entstehen von selbst, sobald sie das erste Mal\n' +
    '  ausgelöst werden – anzulegen ist nur das MARKIEREN der wichtigen als\n' +
    '  Schlüsselereignis (oben mit ← gekennzeichnet):\n',
);
for (const name of anlegen.filter((n) => SCHLUESSEL.has(n))) console.log(`    • ${name}`);
console.log(
  '\n  Sie erscheinen in der Ereignisliste erst, NACHDEM sie einmal ausgelöst\n' +
    '  wurden – bei Google Analytics dauert das bis zu 24 Stunden. Vorher sind\n' +
    '  sie nur im Echtzeit-Bericht zu sehen. Das ist normal und kein Fehler;\n' +
    '  am 01.09.2026 an einem echten Konto nachgesehen.\n',
);
