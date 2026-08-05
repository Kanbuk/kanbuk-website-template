/**
 * =============================================================================
 *  BILDSCHÄRFE – kommt genug Auflösung an?
 * =============================================================================
 *  Aus der Abnahme eines Kundenprojekts: „nicht alle Bilder sind komplett
 *  scharf."
 *
 *  Ein Bild wirkt unscharf, wenn der Browser weniger Bildpunkte bekommt, als
 *  der Bildschirm darstellen kann. Auf einem gewöhnlichen Monitor entspricht
 *  ein CSS-Pixel einem Bildpunkt; auf einem MacBook, einem iPhone oder einem
 *  modernen Windows-Laptop sind es zwei oder drei. Ein Foto, das 640 Punkte
 *  breit ausgeliefert wird und 640 CSS-Pixel breit steht, ist dort nur halb so
 *  scharf wie möglich – und genau so sieht es aus.
 *
 *  DAS TRIFFT AUSGERECHNET DIE GERÄTE, AUF DENEN DER KUNDE SEINE NEUE WEBSITE
 *  BEURTEILT. Auf einem gewöhnlichen Büromonitor ist nichts zu sehen.
 *
 *  Gemessen wird bei 2× (der heute übliche Fall):
 *      gebraucht = Anzeigebreite × 2
 *      geliefert = die tatsächlich gewählte Datei
 *
 * =============================================================================
 *  ZWEI KNIFFE, OHNE DIE DIE PRÜFUNG WERTLOS IST
 * =============================================================================
 *  1. NICHT `naturalWidth`. Das klingt nach „so breit ist die Datei wirklich",
 *     ist es aber nicht: Bei einem `srcset` mit w-Angaben rechnet der Browser
 *     die Zahl auf die Anzeigedichte ZURÜCK. Ein 480 Punkte breites Bild in
 *     einem 171 Pixel breiten Kasten meldet dort schlicht 171 – und jede
 *     Messung, die darauf baut, findet überall genau 100 % und nie einen
 *     Fehler. Die echte Breite steht im `srcset`, hinter der gewählten Datei.
 *
 *  2. ZWEI GRUNDVERSCHIEDENE FÄLLE TRENNEN, die im Browser gleich aussehen:
 *     Liefert er bereits die GRÖSSTE angebotene Größe, ist die Größenliste
 *     ausgereizt – dann ist das Originalfoto zu klein, und nur ein neues Foto
 *     hilft. Bleibt er darunter, fehlt eine Größe in `widths`, und das ist
 *     eine Zeile Arbeit. Ohne diese Trennung meldet die Prüfung ewig dieselben
 *     Bilder, man gewöhnt sich daran und übersieht die echte Verschlechterung.
 *
 *  Verwandt und ausdrücklich NICHT dasselbe: Die Regel in `sicht.mjs` findet
 *  nur HOCHSKALIERTE Bilder (Datei kleiner als der Kasten), gemessen bei 1×.
 *  Der häufige Fall „Datei genau so groß wie der Kasten, Bildschirm stellt
 *  doppelt so fein dar" liegt unter deren Schwelle. Beide Prüfungen sind
 *  nötig; welche was kann, steht in beiden Dateien.
 *
 *      npm run bildschaerfe
 * =============================================================================
 */
import { chromium } from 'playwright';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { starteDistServer } from './lib/dist-server.mjs';
import { verlangeAktuellesDist } from './lib/bau-marke.mjs';

const WURZEL = process.cwd();
verlangeAktuellesDist(WURZEL, 'npm run bildschaerfe');

/**
 * Wie breit ist das ORIGINAL wirklich?
 *
 * Ohne diese Tabelle lässt sich „ausgereizt" nicht von „Größe fehlt"
 * unterscheiden: Beides sieht im Browser gleich aus, nämlich so, dass die
 * größte angebotene Datei geliefert wird. Ob diese größte Datei die Grenze des
 * Fotos ist oder die Grenze einer Einstellung, weiß nur die Platte.
 *
 * (Im Kundenprojekt lag genau hier die Anfahrtskarte: Original 2400 breit,
 * angeboten bis 1024 – ohne die Tabelle hätte die Prüfung das als „Foto zu
 * klein" durchgewinkt und die eigentliche Ursache verdeckt.)
 */
const ORIGINALE = new Map();
if (existsSync('fotos')) {
  const { default: sharp } = await import('sharp');
  const sammeln = (o) => {
    for (const e of readdirSync(o)) {
      const v = join(o, e);
      if (statSync(v).isDirectory()) sammeln(v);
      else if (/\.(jpe?g|png|webp)$/i.test(e)) ORIGINALE.set(e.replace(/\.[^.]+$/, ''), v);
    }
  };
  sammeln('fotos');
  for (const [name, pfad] of [...ORIGINALE]) {
    try {
      ORIGINALE.set(name, (await sharp(pfad).metadata()).width ?? 0);
    } catch {
      ORIGINALE.set(name, 0);
    }
  }
}

const DPR = 2;
const { basis: BASIS, seiten, stop } = await starteDistServer(join(WURZEL, 'dist'));
const browser = await chromium.launch();
const funde = [];

console.log(`Bildschärfe bei ${DPR}×: ${seiten.length} Seite(n) × 390/1440 px\n`);

for (const breite of [390, 1440]) {
  const ctx = await browser.newContext({
    viewport: { width: breite, height: 900 },
    deviceScaleFactor: DPR,
  });
  for (const pfad of seiten) {
    const seite = await ctx.newPage();
    await seite.goto(BASIS + pfad, { waitUntil: 'networkidle' });
    /* Bis ans Ende rollen, damit auch die faul geladenen Bilder wirklich da
       sind – sonst misst man leere Kästen. */
    await seite.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await seite.waitForTimeout(600);
    const bilder = await seite.evaluate((dpr) => {
      return [...document.images]
        .filter((b) => b.getBoundingClientRect().width > 40)
        .map((b) => {
          const gewaehlt = b.currentSrc || b.src;

          /* DAS GEWINNENDE `srcset` STEHT BEI `<picture>` AM `<source>`.
             Der Motor schreibt `<Picture formats={['webp']}>` – das erzeugt
             ein `<picture>` mit einem `<source>` für WebP und einem `<img>`
             mit der JPEG-Ersatzfassung. Gewählt wird fast immer das WebP, also
             der `<source>`; am `<img>` steht dann eine ganz andere Liste.

             Wer nur das `<img>` liest, findet die gewählte Datei dort NICHT –
             und fällt auf `naturalWidth` zurück, also auf genau die Zahl, die
             laut Kniff 1 lügt. Beim ersten Lauf hier meldete die Prüfung
             deshalb „geliefert 720" für eine Datei, die 900 breit ist. */
          const listen = [];
          if (b.parentElement && b.parentElement.tagName === 'PICTURE') {
            for (const q of b.parentElement.querySelectorAll('source')) {
              listen.push(q.getAttribute('srcset') || '');
            }
          }
          listen.push(b.getAttribute('srcset') || '');

          let geliefert = 0;
          let passendeListe = '';
          for (const liste of listen) {
            for (const teil of liste.split(',')) {
              const stueck = teil.trim().split(/\s+/);
              const url = stueck[0];
              const mass = stueck[1];
              if (!url) continue;
              /* ZWEI SORTEN ANGABE, ZWEI RECHNUNGEN.
                 `<Picture widths={…}>` erzeugt Breitenangaben (`900w`), das
                 für Logos vorgeschriebene `<Image densities={[1,2]}>` dagegen
                 Dichteangaben (`1x 2x`). Beide brauchen eigene Behandlung, und
                 beide Fehler sind hier beim ersten Lauf aufgetreten:

                 • `parseInt('2x')` ergibt 2 – die Prüfung meldete jedes Logo
                   als „1 % scharf".
                 • Danach der Rückfall auf `naturalWidth`: Auch bei
                   Dichteangaben rechnet Chromium zurück. Nachgemessen an der
                   2×-Datei des Logos: Datei 168 px breit, `naturalWidth`
                   meldet 84. Die Prüfung sah 50 % statt 100 %.

                 Richtig ist deshalb: `naturalWidth × Dichte`. */
              const alsBreite = /^(\d+)w$/.exec(mass || '');
              const alsDichte = /^([\d.]+)x$/.exec(mass || '');
              if (!alsBreite && !alsDichte) continue;
              if (gewaehlt.endsWith(url) || new URL(url, location.href).href === gewaehlt) {
                geliefert = alsBreite
                  ? parseInt(alsBreite[1], 10)
                  : Math.round(b.naturalWidth * parseFloat(alsDichte[1]));
                passendeListe = liste;
              }
            }
          }
          if (!geliefert) geliefert = b.naturalWidth;
          const r = b.getBoundingClientRect();
          return {
            quelle: gewaehlt.split('/').pop(),
            angezeigt: Math.round(r.width),
            geliefert,
            gebraucht: Math.round(r.width * dpr),
            alt: (b.alt || '').slice(0, 40),
            ausSrcset: passendeListe !== '',
            kandidaten: (passendeListe || listen.find(Boolean) || '')
              .split(',')
              .map((x) => x.trim().split(/\s+/)[1])
              .filter(Boolean)
              .join(' '),
          };
        });
    }, DPR);
    for (const b of bilder) {
      if (b.geliefert > 0 && b.geliefert < b.gebraucht * 0.9) {
        /* Aus „karte.UWWpg9-k_1C8B9Q.webp" wird „karte" – so heißt die Datei
           in fotos/. Astro hängt beim Bauen zwei Prüfsummen an. */
        const stamm = b.quelle.split('.')[0];
        const original = ORIGINALE.get(stamm) ?? 0;
        funde.push({
          ...b,
          breite,
          pfad,
          original,
          faktor: Math.round((b.geliefert / b.gebraucht) * 100),
          art: original > 0 && b.geliefert >= original ? 'original-zu-klein' : 'groesse-fehlt',
        });
      }
    }
    await seite.close();
  }
  await ctx.close();
}
await browser.close();
stop();

if (funde.length === 0) {
  console.log(`✓ Alle Bilder liefern genug Auflösung für einen ${DPR}×-Bildschirm.`);
  process.exit(0);
}

/* Nach Datei gruppieren: Dieselbe Datei an derselben Stelle mehrfach zu melden
   hilft niemandem. */
const nach = new Map();
for (const f of funde) {
  const k = `${f.quelle} @ ${f.breite}px`;
  if (!nach.has(k) || nach.get(k).faktor > f.faktor) nach.set(k, f);
}

const fehlend = [...nach.values()].filter((f) => f.art === 'groesse-fehlt');
const klein = [...nach.values()].filter((f) => f.art === 'original-zu-klein');

if (fehlend.length > 0) {
  console.log(`✗ ${fehlend.length} Bild(er) könnten schärfer sein – es fehlt eine Größe in der Liste:\n`);
  for (const f of fehlend.sort((a, b) => a.faktor - b.faktor)) {
    console.log(`  ${f.quelle}`);
    console.log(
      `    ${f.pfad} @ ${f.breite}px · angezeigt ${f.angezeigt} px · gebraucht ${f.gebraucht} px · geliefert ${f.geliefert} px  →  ${f.faktor} %`,
    );
    console.log(`    „${f.alt}"  · vorhandene Größen: ${f.kandidaten}\n`);
  }
  console.log(
    '  Zu beheben in der `widths`-Liste des jeweiligen <Picture>. Faustregel nach\n' +
      '  Verwendung: randlose Banner bis 2400, breite Blöcke bis 1920, Raster bis 1440.\n' +
      '  Astro erzeugt nichts über der Originalgröße – überzählige Einträge fallen\n' +
      '  von selbst weg, eine zu kurze Liste bemerkt dagegen niemand.\n',
  );
}

if (klein.length > 0) {
  console.log(`ℹ ${klein.length} Bild(er) sind ausgereizt – das ORIGINALFOTO gibt nicht mehr her.`);
  console.log('  Nur ein größeres Foto hilft. Kein Fehler in der Einstellung:\n');
  for (const f of klein.sort((a, b) => a.faktor - b.faktor)) {
    console.log(
      `  ${String(f.faktor).padStart(3)} %  ${f.quelle.replace(/\.[^.]+\.webp$/, '')}  (${f.pfad} @ ${f.breite}px, ${f.geliefert} von ${f.gebraucht} Punkten)`,
    );
  }
  console.log('');
}

if (fehlend.length === 0) {
  console.log('✓ Keine Einstellung bremst die Schärfe – jedes Bild liefert, was sein Original hergibt.');
  process.exit(0);
}
process.exit(1);
