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
  /* Dieselbe Unterscheidung wie im Baustein: kein Empfänger, kein Kontakt.
     `mailto:?subject=…` und `wa.me/?text=…` sind Teilen-Knöpfe. */
  mail_getippt: { was: 'mailto:-Verweis', passt: (z) => /^mailto:[^?\s]*@/i.test(z) },
  whatsapp_getippt: {
    was: 'WhatsApp-Verweis',
    passt: (z) =>
      /^https?:\/\/(?:wa\.me|api\.whatsapp\.com)/i.test(z) &&
      (/wa\.me\/\+?\d/i.test(z) || /[?&]phone=\+?\d/i.test(z)),
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
const handFelder = new Set();
let kategorienDerSeite = [];
let hatBanner = false;

/* WAS DER CODE MELDET, WIRD GESUCHT – NICHT GERATEN.
   Hier stand eine fest verdrahtete Dreierliste (generate_lead,
   anfrage_gescheitert, einwilligung_erteilt). Ruft eine Seite selbst
   `melden(...)` auf – etwa für einen Teilen-Knopf, der kein Verweis ist –,
   fehlte das Ereignis im Bericht vollständig. Beim ersten Lauf an einer echten
   Kundenseite waren das zwei `share`-Aufrufe in der Speisekarte. */
const ausDemCode = {};
function quellenDurchsuchen(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) { quellenDurchsuchen(p); continue; }
    if (!/\.(ts|astro|js|mjs)$/.test(e)) continue;
    const quelle = readFileSync(p, 'utf-8');
    for (const m of quelle.matchAll(/melden\(\s*'([A-Za-z][A-Za-z0-9_]*)'\s*(?:,\s*\{([^}]*)\})?/g)) {
      const e2 = (ausDemCode[m[1]] ||= { felder: new Set(), dateien: new Set() });
      e2.dateien.add(relative(WURZEL, p));
      for (const f of String(m[2] || '').matchAll(/([A-Za-z][A-Za-z0-9_]*)\s*:/g)) e2.felder.add(f[1]);
    }
  }
}
for (const ordner of ['src', 'api']) {
  if (existsSync(join(WURZEL, ordner))) quellenDurchsuchen(join(WURZEL, ordner));
}

for (const datei of seiten) {
  const html = readFileSync(datei, 'utf-8');
  const seite = '/' + relative(DIST, datei).replace(/index\.html$/, '').replace(/\.html$/, '');

  /* DIESELBE NAMENSREGEL WIE ZUR LAUFZEIT (`istErlaubterName` in messung.ts):
     Buchstabe am Anfang, danach Buchstaben, Ziffern, Unterstriche. Hier stand
     `[a-z_]+`. Ein Name wie `karte_2` oder `Reservierung` wurde damit gesendet,
     vom Bericht aber nicht gefunden – und ein Bericht, der ein vorhandenes
     Ereignis verschweigt, ist genauso falsch wie einer, der eines erfindet. */
  for (const m of html.matchAll(/data-messung="([A-Za-z][A-Za-z0-9_]*)"/g)) {
    const e = (vonHand[m[1]] ||= { elemente: 0, seiten: new Set() });
    e.elemente++;
    e.seiten.add(seite);
  }

  /* DAS GANZE <a>-ELEMENT, nicht nur sein href.
     Grund: Trägt der Verweis ein eigenes `data-messung`, GEWINNT das zur
     Laufzeit und die Erkennung kommt gar nicht mehr dran (siehe messung.ts).
     Wer nur nach `href="…"` sucht, schreibt dann ein Ereignis in die Liste,
     das nie ausgelöst wird – beim ersten Lauf an einer echten Kundenseite
     stand so `dokument_geoeffnet` darin, während der Menüplan-Verweis in
     Wahrheit `menueplan_geoeffnet` meldet. Ein Bericht, der Erfundenes
     auflistet, ist schlechter als keiner. */
  for (const m of html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)) {
    const ziel = m[1];
    if (/data-messung=/.test(m[0])) continue;
    for (const name of Object.keys(MUSTER)) {
      if (!MUSTER[name].passt(ziel)) continue;
      const e = (erkannt[name] ||= { elemente: 0, seiten: new Set() });
      e.elemente++;
      e.seiten.add(seite);
      break;
    }
  }

  for (const m of html.matchAll(/data-messung-feld="([A-Za-z][A-Za-z0-9_]*)"/g)) handFelder.add(m[1]);
  for (const m of html.matchAll(/data-formular-id="([^"]+)"/g)) formulare.add(m[1]);
  if (/data-einwilligung-banner/.test(html)) hatBanner = true;
  const kat = html.match(/data-einwilligung-kategorien="([^"]*)"/);
  if (kat && !kategorienDerSeite.length) kategorienDerSeite = kat[1].split(' ').filter(Boolean);
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

console.log('\n── Aus dem Code (melden(…)) ──────────────────────────────────────\n');
const BESCHREIBUNG = {
  generate_lead: 'Formular abgeschickt UND vom Server angenommen',
  anfrage_gescheitert: 'Absenden fehlgeschlagen – die Zahl, an der ein Betrieb sieht,',
  einwilligung_erteilt: 'Der Gast hat seine Cookie-Wahl getroffen',
  share: 'Etwas wurde geteilt',
};
const codeNamen = Object.keys(ausDemCode);
if (!codeNamen.length) {
  console.log('  (keine)');
} else {
  for (const name of codeNamen) {
    const e = ausDemCode[name];
    const felder = [...e.felder];
    console.log(zeile(name, BESCHREIBUNG[name] || [...e.dateien].join(', ')));
    if (name === 'anfrage_gescheitert') console.log(`  ${''.padEnd(22)}dass ihm Anfragen verlorengehen`);
    if (felder.length) console.log(`  ${''.padEnd(22)}Feld${felder.length > 1 ? 'er' : ''}: ${felder.join(', ')}`);
  }
  if (formulare.size) {
    console.log(`\n  lead_source unterscheidet die Formulare: ${[...formulare].join(', ')}`);
  }
  if (ausDemCode.einwilligung_erteilt) {
    /* HIER STANDEN DREI UNMOEGLICHE WERTE. Der Bericht behauptete
       „auswahl: alle | statistik | funktional | keine". `melden()` steigt aber
       aus, wenn Statistik NICHT freigegeben ist – „keine" und „funktional"
       koennen deshalb nie entstehen. Wer die Liste in GA4 abarbeitet, wartet
       auf Zahlen, die es nicht gibt. */
    console.log(
      `\n  auswahl ist entweder 'alle' oder die einzeln freigegebenen Kategorien,\n` +
        `  mit _ verbunden (z. B. funktional_statistik). Auf DIESER Seite gibt es:\n` +
        `  ${kategorienDerSeite.length ? kategorienDerSeite.join(', ') : '(keine)'}\n` +
        `  Wer Statistik ABLEHNT, erscheint hier gar nicht – das ist die Zusage,\n` +
        `  keine Luecke: Ohne Einwilligung wird nichts gemeldet, auch nicht die\n` +
        `  Ablehnung selbst.`,
    );
  }
}

console.log('\n── In GA4 anzulegen ──────────────────────────────────────────────\n');
const alleNamen = [
  ...new Set([...erkanntNamen, ...handNamen, ...codeNamen]),
];
const empfohlen = alleNamen.filter((n) => SCHLUESSEL.has(n));
const selbst = alleNamen.filter((n) => !SCHLUESSEL.has(n) && n !== 'einwilligung_erteilt' && n !== 'anfrage_gescheitert');

console.log('  1. SCHLUESSELEREIGNISSE markieren (Verwaltung → Ereignisse):\n');
for (const name of empfohlen) console.log(`       • ${name}`);
if (selbst.length) {
  console.log(
    `\n     Diese hier sind eine Ermessensfrage – markieren, wenn der Betrieb\n` +
      `     sie als Erfolg zaehlen will:\n`,
  );
  for (const name of selbst) console.log(`       • ${name}`);
}

/* DER TEIL, DER HIER GANZ GEFEHLT HAT.
   Der Bericht sagte „Anzulegen: Nichts". Fuer die EREIGNISSE stimmt das – fuer
   die Zusatzangaben nicht: `stelle`, `kanal`, `lead_source` und die anderen
   sind benutzerdefinierte Ereignisparameter. GA4 nimmt sie entgegen, zeigt sie
   aber in KEINEM Bericht an, solange niemand je eine benutzerdefinierte
   Dimension dafuer anlegt – und rueckwirkend fuellt sie sich nicht. Wer das
   erst in drei Monaten merkt, hat drei Monate ohne die Angabe, wegen der die
   Messung ueberhaupt gebaut wurde. */
const felder = [
  ...new Set([
    ...(erkanntNamen.length ? ['stelle'] : []),
    ...handFelder,
    ...codeNamen.flatMap((n) => [...ausDemCode[n].felder]),
  ]),
].sort();
if (felder.length) {
  console.log(
    `\n  2. BENUTZERDEFINIERTE DIMENSIONEN anlegen, Bereich „Ereignis"\n` +
      `     (Verwaltung → Benutzerdefinierte Definitionen):\n`,
  );
  for (const f of felder) console.log(`       • ${f}`);
  console.log(
    `\n     OHNE DIESEN SCHRITT gehen die Angaben zwar an Google, tauchen aber\n` +
      `     in keinem Bericht auf – und rueckwirkend fuellen sie sich NICHT.\n` +
      `     Dann steht da „12 Anrufe" und nirgends, ob aus Kopfleiste oder\n` +
      `     Fusszeile. Genau dafuer ist das Feld da.`,
  );
}

console.log(
  '\n  Die Ereignisse selbst muss niemand anlegen: Sie entstehen, sobald sie\n' +
    '  das erste Mal ausgeloest werden. In der Ereignisliste erscheinen sie\n' +
    '  aber erst danach – bei Google Analytics dauert das bis zu 24 Stunden.\n' +
    '  Vorher sind sie nur im Echtzeit-Bericht zu sehen. Das ist normal und\n' +
    '  kein Fehler; am 01.09.2026 an einem echten Konto nachgesehen.\n',
);
