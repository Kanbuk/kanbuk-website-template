/**
 * =============================================================================
 *  ICONS HOLEN – die Bibliothek kommt EINMAL ins Repo, nicht bei jedem Aufruf
 * =============================================================================
 *      npm run icons                         → Lucide vollständig, feste Version
 *      npm run icons -- --set heroicons --namen "home,user,phone"
 *
 *  WARUM ES DAS GIBT: Ein Claude Design bindet Bildzeichen per NAME aus einer
 *  Bibliothek ein (`<script src="https://unpkg.com/lucide@latest">`). Der Motor
 *  verbietet externe Requests zu Recht – sagte aber nicht, woher die Icons dann
 *  kommen. In einem Kundenprojekt wurden daraufhin eigene Symbole GEZEICHNET.
 *  Ergebnis: Jedes Zeichen der Seite sah anders aus als im Design, und die
 *  ganze Seite wirkte fremd.
 *
 *  Deshalb liegt Lucide jetzt VOLLSTÄNDIG im Motor (2007 Symbole). Beim
 *  Portieren muss niemand mehr überlegen, welche gebraucht werden – man
 *  schreibt `<Symbol name="car-front" />`, und es ist da.
 *
 *  ─────────────────────────────────────────────────────────────────────────
 *  WICHTIG – die Bibliothek ist DATENQUELLE, kein Auslieferungsgut:
 *  `icons/lucide.json` liegt im Repo und wird beim Bauen gelesen. In die
 *  fertige Seite kommt ausschließlich, was `<Symbol>` wirklich angefordert
 *  hat. 2007 ungenutzte Symbole im ausgelieferten HTML wären ein Eigentor
 *  gegen die eigene Ladezeit-Regel – das Prüf-Tor misst es.
 *
 *  FESTE VERSION, kein „latest": Sonst sieht ein Klon von heute in zwei Jahren
 *  anders aus als einer von morgen. Die Version steht unten, in package.json
 *  und in STAND.md.
 * =============================================================================
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const WURZEL = process.cwd();
const ZIEL = join(WURZEL, 'icons');

/** FESTE VERSION – siehe Kopfkommentar. Ändern heißt: alle Symbole ändern sich. */
const LUCIDE_VERSION = '1.27.0';

const args = process.argv.slice(2);
const wert = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : null;
};

/**
 * Zieht aus einer SVG-Datei nur den INHALT heraus.
 *
 * Die Hülle (`<svg width viewBox stroke …>`) schreibt `Symbol.astro` selbst –
 * so tragen alle Symbole dieselben Maße und dieselbe Strichstärke, und das
 * Design kann sie über eine einzige CSS-Regel umfärben. Stünde die Hülle in
 * den Daten, müsste jede Anpassung 1.600-mal passieren.
 */
function innenraum(svg) {
  const m = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  if (!m) return null;
  return m[1]
    .replace(/\s*\n\s*/g, '')
    .replace(/>\s+</g, '><')
    .trim();
}

// ---------------------------------------------------------------------------
//  Weg A: eine ANDERE Bibliothek, nur benannte Symbole (Bedingung 5)
// ---------------------------------------------------------------------------
const set = wert('set');
if (set) {
  const namen = (wert('namen') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (namen.length === 0) {
    console.error('\n✖ --set braucht --namen "a,b,c" – bei einer fremden Bibliothek holen wir nur, was gebraucht wird.\n');
    process.exit(1);
  }

  /* Nur benannte Symbole, weil wir bei fremden Bibliotheken weder Umfang noch
     Aufbau kennen. Lucide ist der geprüfte Sonderfall, alles andere die
     Ausnahme – deshalb hier der schmale Weg. */
  const quellen = {
    heroicons: (n) => `https://unpkg.com/heroicons@2.1.5/24/outline/${n}.svg`,
    phosphor: (n) => `https://unpkg.com/@phosphor-icons/core@2.1.1/assets/regular/${n}.svg`,
    feather: (n) => `https://unpkg.com/feather-icons@4.29.2/dist/icons/${n}.svg`,
  };
  const quelle = quellen[set];
  if (!quelle) {
    console.error(`\n✖ Bibliothek "${set}" ist hier nicht hinterlegt. Bekannt: ${Object.keys(quellen).join(', ')}.\n`);
    process.exit(1);
  }

  mkdirSync(ZIEL, { recursive: true });
  const datei = join(ZIEL, `${set}.json`);
  const bestand = existsSync(datei) ? JSON.parse(readFileSync(datei, 'utf-8')) : { _bibliothek: set, symbole: {} };

  for (const name of namen) {
    const antwort = await fetch(quelle(name));
    if (!antwort.ok) {
      console.error(`  ✖ "${name}" gibt es dort nicht (${antwort.status}) – Schreibweise prüfen.`);
      continue;
    }
    const inner = innenraum(await antwort.text());
    if (!inner) {
      console.error(`  ✖ "${name}" ließ sich nicht lesen.`);
      continue;
    }
    bestand.symbole[name] = inner;
    console.log(`  ▸ ${name}`);
  }
  writeFileSync(datei, JSON.stringify(bestand, null, 0) + '\n', 'utf-8');
  console.log(`\n✓ ${Object.keys(bestand.symbole).length} Symbol(e) in icons/${set}.json.`);
  console.log(`  Verwenden: <Symbol set="${set}" name="…" />\n`);
  /* Kein `process.exit(0)`: Solange eine Netzwerkverbindung noch offen ist,
     quittiert Node das unter Windows mit einer rohen Assertion-Meldung. Die
     sieht nach Absturz aus, obwohl alles geklappt hat – und wer nicht
     programmiert, kann das nicht unterscheiden. Sauber auslaufen lassen. */
} else {

// ---------------------------------------------------------------------------
//  Weg B: Lucide vollständig (der Normalfall)
// ---------------------------------------------------------------------------
const arbeit = join(tmpdir(), `kanbuk-icons-${process.pid}`);
mkdirSync(arbeit, { recursive: true });

console.log(`Hole Lucide ${LUCIDE_VERSION} …`);
try {
  /* Über npm statt über tausende Einzelabrufe: ein Paket, eine feste Version,
     nachvollziehbar. Der Ordner wird danach gelöscht – die Bibliothek soll
     im Repo liegen, nicht in node_modules. */
  /* Als EINE Zeichenkette statt Argumentliste + shell:true - Node warnt bei der
     Kombination zu Recht (Argumente werden dann nicht maskiert). Hier sind
     alle Bestandteile feste Literale, aber die Warnung im Protokoll verwirrt
     jemanden, der nicht programmiert. */
  execSync(
    `npm install --no-save --no-audit --no-fund --prefix "${arbeit}" lucide-static@${LUCIDE_VERSION}`,
    { stdio: 'inherit' },
  );

  const quelle = join(arbeit, 'node_modules', 'lucide-static', 'icons');
  if (!existsSync(quelle)) throw new Error(`Ordner ${quelle} fehlt nach der Installation`);

  const symbole = {};
  let uebersprungen = 0;
  for (const datei of readdirSync(quelle)) {
    if (!datei.endsWith('.svg')) continue;
    const inner = innenraum(readFileSync(join(quelle, datei), 'utf-8'));
    if (!inner) {
      uebersprungen++;
      continue;
    }
    symbole[datei.replace(/\.svg$/, '')] = inner;
  }

  mkdirSync(ZIEL, { recursive: true });
  writeFileSync(
    join(ZIEL, 'lucide.json'),
    JSON.stringify(
      {
        _hinweis:
          'DATENQUELLE, kein Auslieferungsgut. In die fertige Seite kommt nur, was <Symbol> anfordert - das misst npm run check. Nicht von Hand bearbeiten: npm run icons erzeugt die Datei neu.',
        _bibliothek: 'lucide',
        _version: LUCIDE_VERSION,
        _lizenz: 'ISC - siehe icons/lucide.LICENSE',
        symbole,
      },
      null,
      0,
    ) + '\n',
    'utf-8',
  );

  // Lizenztext mitnehmen (Bedingung 3): ISC erlaubt die Nutzung, verlangt aber
  // den Text.
  const lizenzDatei = ['LICENSE', 'LICENSE.md', 'license']
    .map((n) => join(arbeit, 'node_modules', 'lucide-static', n))
    .find((p) => existsSync(p));
  if (lizenzDatei) {
    writeFileSync(join(ZIEL, 'lucide.LICENSE'), readFileSync(lizenzDatei, 'utf-8'), 'utf-8');
  } else {
    console.error('  ⚠ Lizenzdatei nicht gefunden – bitte von Hand nachtragen (ISC).');
  }

  const kb = Math.round(readFileSync(join(ZIEL, 'lucide.json')).length / 1024);
  console.log(`\n✓ ${Object.keys(symbole).length} Symbole in icons/lucide.json (${kb} KB)`);
  if (uebersprungen) console.log(`  (${uebersprungen} Datei(en) übersprungen – kein lesbares SVG)`);
  console.log('  Verwenden: <Symbol name="car-front" />');
  console.log('  Die Datei geht NICHT mit in die Seite – nur angeforderte Symbole landen dort.\n');
} finally {
  rmSync(arbeit, { recursive: true, force: true });
}
}
