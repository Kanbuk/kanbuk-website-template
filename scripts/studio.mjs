/**
 * `npm run studio` – legt das Eingabe-Studio als NACHBARORDNER an.
 *
 * =============================================================================
 *  DIE LÜCKE, DIE ES SCHLIESST
 * =============================================================================
 *  Der Motor lieferte die Eingabemaske (`npm run maske`) – aber nicht das
 *  Studio, in dem der Betrieb sie zu sehen bekommt. `redaktion/README.md`
 *  verwies auf einen Ordner `../<kunde>-studio`, den niemand anlegt, und
 *  `npm run maske` brach mit „Studio-Ordner stimmt nicht?" ab.
 *
 *  Was dazwischen fehlte, hätte der Auftraggeber selbst tippen müssen: ein
 *  Projekt aufsetzen, Abhängigkeiten holen, eine Konfigurationsdatei
 *  schreiben. Alles Befehlszeile – und die ist für ihn ausdrücklich
 *  ausgeschlossen (CLAUDE.md Abschnitt 0: „Alles, was ein Terminal braucht,
 *  macht der Klon selbst; der Nutzer klickt nur").
 *
 * =============================================================================
 *  WARUM NEBENAN UND NICHT IM PROJEKT
 * =============================================================================
 *  Das Studio ist ein eigenes Programm mit eigenen Abhängigkeiten. Läge es im
 *  Website-Ordner, wanderten die in `package.json` der Website – und damit in
 *  jeden Build, jede Prüfung, jede Sicherheitsmeldung. Die Website ist rein
 *  statisch und soll es bleiben.
 *
 *  Deshalb: `../<kunde>-studio`, ein eigenes Repository. `dienst.json` merkt
 *  sich den Pfad, und `npm run maske` legt die Maske von selbst dorthin.
 *
 * =============================================================================
 *  WAS DIESES SKRIPT NICHT TUT
 * =============================================================================
 *  Es legt kein Projekt beim Dienst an und vergibt keine Zugänge – dafür
 *  braucht es ein Konto, und das gehört dem Betrieb. Es setzt voraus, dass
 *  `redaktion/dienst.json` mit der Projektkennung schon dasteht, und sagt
 *  sonst genau das.
 * =============================================================================
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { dienstLesen, DIENST_DATEI } from './lib/redaktion.mjs';

const MASKE = 'redaktion/maske.js';

function raus(text, hilfe) {
  console.error(`\n✗ ${text}\n`);
  if (hilfe) console.error(`  ${hilfe.replace(/\n/g, '\n  ')}\n`);
  process.exit(1);
}

const dienst = dienstLesen();
if (!dienst) {
  raus(
    `${DIENST_DATEI} gibt es nicht – dieses Projekt hat (noch) kein Redaktionssystem.`,
    'Das ist der Normalfall: Die Inhalte stehen dann in content.config.ts.\n' +
      'Soll der Betrieb selbst pflegen, zuerst redaktion/README.md, Schritt 1 und 2.',
  );
}
if (!dienst.projekt || /^</.test(String(dienst.projekt))) {
  raus(
    `In ${DIENST_DATEI} steht keine echte Projektkennung (aktuell: ${JSON.stringify(dienst.projekt)}).`,
    'Die Kennung vergibt der Dienst beim Anlegen des Projekts. Ohne sie weiß das\n' +
      'Studio nicht, welche Daten es zeigen soll.',
  );
}

const datensatz = dienst.datensatz ?? 'production';
const ordner = resolve(dienst.studioOrdner ?? `../${basename(process.cwd())}-studio`);
const name = basename(ordner);

console.log(`Studio anlegen: ${ordner}`);
console.log(`  Projekt ${dienst.projekt} · Datensatz ${datensatz}\n`);

/* NIE ETWAS ÜBERSCHREIBEN. Ein zweiter Lauf darf einen laufenden Studio-Ordner
   nicht plattmachen – dort können eigene Anpassungen liegen. Fehlende Dateien
   werden ergänzt, vorhandene bleiben, wie sie sind; nur die Maske schreibt
   `npm run maske` bewusst neu. */
let angelegt = 0;
let vorhanden = 0;
function datei(pfad, inhalt) {
  const ziel = join(ordner, pfad);
  if (existsSync(ziel)) {
    vorhanden++;
    console.log(`  · ${pfad} war schon da – unverändert gelassen`);
    return;
  }
  mkdirSync(join(ziel, '..'), { recursive: true });
  writeFileSync(ziel, inhalt, 'utf-8');
  angelegt++;
  console.log(`  + ${pfad}`);
}

mkdirSync(ordner, { recursive: true });

datei(
  'package.json',
  JSON.stringify(
    {
      name,
      private: true,
      version: '1.0.0',
      type: 'module',
      scripts: { dev: 'sanity dev', build: 'sanity build', deploy: 'sanity deploy' },
      /*
       * NUR EIN BODEN, NICHT DIE FASSUNG. Die echten Fassungen holt der
       * `npm install`-Schritt weiter unten mit `@latest`; npm schreibt sie
       * danach hier hinein.
       *
       * WARUM DAS SO SEIN MUSS: Hier stand `sanity: '^3'` und `react: '^18'`.
       * Damit bekam JEDES Studio Hauptversion 3 – auch eines, das man heute
       * frisch anlegt. Bei zwei Kundenprojekten lief die Eingabemaske deshalb
       * wochenlang auf Sanity 3.99, während 6.9 aktuell war.
       *
       * Das war nicht nur „alt": In 3.99 überlebte von 18 gleichzeitig
       * hochgeladenen Fotos genau EINES – jeder fertige Upload schrieb die
       * ganze Liste zurück, der letzte gewann. Der Betrieb hielt das für eine
       * Obergrenze („ich kann nur 7 Fotos hinzufügen") und meldete es erst
       * nach Wochen. Ab Sanity 4 verlangt das Studio ausserdem React 19; mit
       * `^18` liesse sich gar nicht mehr aktualisieren.
       *
       * Ein festgenagelter Hauptversions-Bereich in einer VORLAGE altert
       * zwangsläufig – die Vorlage wird jahrelang benutzt. Deshalb: Boden
       * hier, `@latest` beim Anlegen, `autoUpdates` danach.
       */
      dependencies: {
        sanity: '^6',
        react: '^19',
        'react-dom': '^19',
        'styled-components': '^6',
      },
    },
    null,
    2,
  ) + '\n',
);

/* DER STUDIO-NAME wird aus dem Ordnernamen abgeleitet: `<kunde>-studio` wird
   zu `<kunde>`. Sanity erlaubt dort nur Kleinbuchstaben, Ziffern und
   Bindestriche. */
const studioName = name.replace(/-studio$/, '').replace(/[^a-z0-9-]/gi, '').toLowerCase();

datei(
  /* ALS .ts, NICHT ALS .js – und das ist kein Geschmack, sondern notwendig.
     Sanity sucht genau zwei Dateinamen: `sanity.cli.js` und `sanity.cli.ts`.
     Die .js-Fassung liest es intern mit `require` ein. Die package.json dieses
     Studios enthält aber `"type": "module"`, und damit ist jede .js-Datei ein
     ES-Modul, in dem es kein `require` gibt. */
  'sanity.cli.ts',
  `/*
 * ALS .ts, NICHT ALS .js – und das ist kein Geschmack, sondern notwendig.
 *
 * Sanity sucht genau zwei Dateinamen: \`sanity.cli.js\` und \`sanity.cli.ts\`.
 * Die .js-Fassung liest es intern mit \`require\` ein. Die package.json dieses
 * Studios enthält aber "type": "module", und damit ist jede .js-Datei ein
 * ES-Modul, in dem es kein \`require\` gibt. Ergebnis:
 *
 *   Error reading "sanity.cli.js": require is not defined in ES module scope
 *
 * Und jetzt das Gefährliche daran: \`sanity deploy\` bricht deswegen NICHT ab.
 * Es gibt die Fehlermeldung aus, druckt seine Hilfeseite – und beendet sich
 * mit RÜCKGABE 0. Wer nur auf den Rückgabewert schaut, hält das für Erfolg.
 * In einem Kundenprojekt genau so passiert; aufgefallen erst, als die
 * Studio-Adresse abgerufen wurde und 404 lieferte.
 *
 * Die .ts-Fassung geht durch Sanitys eigenen Übersetzer und umgeht das.
 *
 * \`defineCliConfig\` steht hier bewusst nicht: Der benannte Export lässt sich
 * in dieser Version ebenfalls nicht auflösen, und er ist ohnehin nur eine
 * Typ-Hilfe. Ein schlichtes Objekt tut dasselbe und hängt an keiner Version.
 */
export default {
  api: { projectId: '${dienst.projekt}', dataset: '${datensatz}' },
  /**
   * Die Adresse des Studios: ${studioName}.sanity.studio
   *
   * Ohne diese Angabe fragt \`sanity deploy\` beim ersten Mal danach und bleibt
   * stehen, bis jemand tippt – in einem Ablauf ohne Tastatur bleibt er hängen.
   *
   * NICHT MEHR ÄNDERN: Es ist die Adresse, die der Betrieb sich merkt und im
   * Browser speichert. Ein neuer Name heisst ein totes Lesezeichen.
   */
  studioHost: '${studioName}',

  /**
   * AUTOMATISCHE AKTUALISIERUNG – die wichtigste Zeile in dieser Datei.
   *
   * Ohne sie friert die Eingabemaske auf dem Stand ein, der am Tag der
   * Veröffentlichung installiert war. Sie holt sich danach NIE wieder etwas,
   * auch keine Fehlerbehebungen.
   *
   * Was das anrichtet, an zwei Kundenprojekten gemessen: Beide liefen
   * wochenlang auf Sanity 3.99, während 6.9 aktuell war. In 3.99 überlebte von
   * 18 gleichzeitig hochgeladenen Fotos genau eines – der Betrieb hielt das
   * für eine Obergrenze und meldete es erst nach Wochen.
   *
   * Neu angelegte Studios bringen diese Zeile seit Sanity 3.57 von selbst
   * mit. Diese Vorlage tat es nicht, und deshalb erbte sie jeder Klon.
   *
   * Der eigene Code hier bleibt davon unberührt – aktualisiert wird nur der
   * Kern des Studios.
   */
  deployment: {
    autoUpdates: true,
  },
};
`,
);

datei(
  'sanity.config.js',
  `import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemaTypes/index.js';

/*
 * Diese Datei erzeugt "npm run studio" im Website-Projekt.
 * Die FELDER stehen nicht hier, sondern in schemaTypes/index.js - und die
 * entsteht aus redaktion/felder.mjs des Website-Projekts ("npm run maske").
 * Nie hier von Hand ein Feld ergaenzen: Die Abfrage der Website kennt es dann
 * nicht, der Betrieb fuellt es aus, und es erscheint nirgends.
 */
export default defineConfig({
  name: 'default',
  title: '${name}',
  projectId: '${dienst.projekt}',
  dataset: '${datensatz}',
  plugins: [structureTool()],
  schema: { types: schemaTypes },
});
`,
);

datei('schemaTypes/index.js', existsSync(MASKE) ? readFileSync(MASKE, 'utf-8') : 'export const schemaTypes = [];\n');

datei(
  '.gitignore',
  `node_modules
dist
.sanity
.env*
`,
);

datei(
  'README.md',
  `# ${name}

Das Eingabe-Studio zur Website. **Erzeugt von \`npm run studio\` im
Website-Projekt** – dort steht auch, wie es eingerichtet wird
(\`redaktion/README.md\`).

## Was hier NICHT geändert wird

\`schemaTypes/index.js\` ist erzeugt. Die Felder stehen in
\`redaktion/felder.mjs\` des Website-Projekts; \`npm run maske\` legt sie hier
ab. Ein Feld, das nur hier ergänzt wird, kennt die Abfrage der Website nicht:
Der Betrieb füllt es aus, und es erscheint nirgends.

## Befehle

| | |
| --- | --- |
| \`npm run dev\` | Studio lokal öffnen |
| \`npm run deploy\` | Studio ins Netz stellen, damit der Betrieb es erreicht |
`,
);

console.log(`\n  ${angelegt} Datei(en) angelegt, ${vorhanden} unverändert gelassen.`);

/* ---------------------------------------------------------------------------
   ABHÄNGIGKEITEN HOLEN – der Klon macht das, nicht der Nutzer.
   Sie landen im NACHBARORDNER, nicht im Website-Projekt; die Website bleibt
   abhängigkeitsfrei. Mit `--ohne-install` überspringbar, etwa ohne Netz.

   AUSDRÜCKLICH `@latest`, NICHT NUR `npm install`.

   `npm install` würde die Bereiche aus package.json auflösen – und die sind in
   einer VORLAGE zwangsläufig irgendwann alt. Genau daran lag es, dass zwei
   Kundenprojekte mit Sanity 3 aufgesetzt wurden, als längst 6 aktuell war.
   Mit `@latest` bekommt jedes neue Studio den heutigen Stand, npm schreibt
   ihn in package.json, und `deployment.autoUpdates` hält ihn danach frisch.

   DIE VIER PAKETE GEHÖREN ZUSAMMEN: Ab Sanity 4 ist React 19 Voraussetzung.
   Nur `sanity@latest` zu holen und React auf 18 zu lassen, ergibt ein Studio,
   das sich nicht starten lässt.
   --------------------------------------------------------------------------- */
const PAKETE = ['sanity@latest', 'react@latest', 'react-dom@latest', 'styled-components@latest'];

if (process.argv.includes('--ohne-install')) {
  console.log('\n  (--ohne-install: Abhängigkeiten nicht geholt.)');
  console.log('     Die Fassungen in package.json sind nur ein Boden. Vor dem');
  console.log('     Veröffentlichen einmal nachholen:');
  console.log(`     npm install ${PAKETE.join(' ')}`);
} else if (existsSync(join(ordner, 'node_modules'))) {
  console.log('\n  Abhängigkeiten liegen schon im Ordner.');
} else {
  console.log('\n  Abhängigkeiten holen (das dauert ein bis zwei Minuten) …');
  const lauf = spawnSync('npm', ['install', ...PAKETE], { cwd: ordner, stdio: 'inherit', shell: process.platform === 'win32' });
  if (lauf.status !== 0) {
    console.error(
      `\n  ! "npm install" im Studio-Ordner ist fehlgeschlagen (Code ${lauf.status}).\n` +
        `    Die Dateien liegen aber alle da. Der Ordner ist: ${ordner}\n`,
    );
    process.exitCode = 1;
  }
}

/* Den Pfad in dienst.json festhalten – sonst sucht `npm run maske` ihn beim
   nächsten Mal wieder nicht und bricht mit „Studio-Ordner stimmt nicht?" ab. */
if (!dienst.studioOrdner) {
  const roh = JSON.parse(readFileSync(DIENST_DATEI, 'utf-8'));
  roh.studioOrdner = `../${name}`;
  writeFileSync(DIENST_DATEI, JSON.stringify(roh, null, 2) + '\n', 'utf-8');
  console.log(`\n  ${DIENST_DATEI}: studioOrdner = ../${name} eingetragen.`);
}

console.log(
  `\n✓ Studio liegt in ${ordner}\n\n` +
    '  So geht es weiter:\n' +
    '   1. npm run maske        (im Website-Projekt – legt die Felder ins Studio)\n' +
    `   2. im Studio-Ordner: npm run deploy   (stellt es ins Netz)\n` +
    '   3. Zugang für den Betrieb anlegen und die Anleitung ausfüllen\n' +
    '      (redaktion/ANLEITUNG-VORLAGE.md – die Beschriftungen dort NACHSEHEN,\n' +
    '      nicht aus dem Gedächtnis eintragen)\n' +
    '   4. npm run erstbefuellung   – bringt den vorhandenen Bestand hinein.\n' +
    '      Ohne diesen Schritt startet das Studio LEER, und `npm run inhalte`\n' +
    '      holt nichts, ohne dass es nach einem Fehler aussieht.\n',
);
