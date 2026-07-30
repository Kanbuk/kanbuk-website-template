/**
 * =============================================================================
 *  SICHT – die automatische Sichtprüfung vor jedem Launch
 * =============================================================================
 *  Öffnet JEDE gebaute Seite in einem echten Browser bei 350 / 430 / 768 / 1440 px,
 *  macht Screenshots und prüft dabei automatisch:
 *
 *   1. HORIZONTALER ÜBERLAUF – die Seite darf auf keiner Breite seitlich
 *      scrollen (nennt die schuldigen Elemente beim Namen)
 *   2. JS-FEHLER – jeder Konsolen-Fehler ist ein Bug
 *   3. KAPUTTE RESSOURCEN – Bild/Skript/Style, das nicht lädt (404)
 *
 *  Die Screenshots landen in pruefung/ – danach MUSS Claude sie ANSEHEN
 *  (Read rendert Bilder) und visuell beurteilen: Layout-Brüche, Überlappungen,
 *  Design-Fehler, Rechtschreibung der sichtbaren Texte. Das Skript findet die
 *  messbaren Fehler, die Augen finden den Rest – beides zusammen ist die
 *  Launch-Prüfung (siehe /port Etappe 5 und /deploy).
 *
 *      npm run sicht            (nutzt dist/ – vorher npm run check laufen lassen)
 *      npm run sicht -- --breiten 350,768,1024,1440
 *
 *  Rot = die Seite darf so nicht raus.
 * =============================================================================
 */
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';
import { starteDistServer } from './lib/dist-server.mjs';

const WURZEL = process.cwd();
const DIST = join(WURZEL, 'dist');
const ZIEL = join(WURZEL, 'pruefung');

const args = process.argv.slice(2);
const wert = (name, standard) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : standard;
};
/* VIER BREITEN, und 430 ist die wichtigste Ergänzung.
   Zwischen 350 und 768 lag eine Lücke – und genau dort kommen die meisten
   Besucher an: Aktuelle Handys im Hochformat messen 390 bis 440 px. Dort
   kippen ausserdem die Raster von einer auf zwei Spalten, also genau die
   Stelle, an der ein Layout bricht.
   Am 30.07.2026 an einer echten Kundenseite belegt: Ein abgeschnittener Knopf
   („DETA" statt „Details ansehen") lag in dieser Lücke und wurde von keiner
   Breite erwischt.
   350 bleibt: das schmalste Gerät, das noch vorkommt. */
const BREITEN = wert('breiten', '350,430,768,1440').split(',').map((b) => Number(b.trim()));

if (!existsSync(DIST)) {
  console.error('✗ dist/ fehlt. Zuerst "npm run check" (baut und prüft), dann "npm run sicht".');
  process.exit(1);
}

// --- Server + Seitenliste aus der geteilten Bibliothek (nutzt auch interaktion.mjs)
const { basis: BASIS, seiten, stop } = await starteDistServer(DIST);

// --- Prüfung ------------------------------------------------------------------
rmSync(ZIEL, { recursive: true, force: true });
mkdirSync(ZIEL, { recursive: true });

const probleme = [];
const hinweise = [];
const texte = [];
const groessteBreite = Math.max(...BREITEN);
const browser = await chromium.launch();
console.log(`Sichtprüfung: ${seiten.length} Seite(n) × ${BREITEN.length} Breiten (${BREITEN.join(', ')} px)\n`);

for (const seite of seiten) {
  for (const breite of BREITEN) {
    const kontext = await browser.newContext({ viewport: { width: breite, height: 900 } });
    const page = await kontext.newPage();

    const jsFehler = [];
    const kaputt = [];
    page.on('pageerror', (e) => jsFehler.push(e.message.split('\n')[0]));
    page.on('console', (m) => m.type() === 'error' && jsFehler.push(m.text().split('\n')[0]));
    page.on('requestfailed', (r) => kaputt.push(`${r.url()} (${r.failure()?.errorText})`));
    page.on('response', (r) => r.status() >= 400 && kaputt.push(`${r.url()} (HTTP ${r.status()})`));

    await page.goto(BASIS + seite, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);

    // 0) LCP-MESSUNG – MUSS VOR jeder Manipulation unten stehen.
    //    Das größte sichtbare Element ("Largest Contentful Paint") bestimmt,
    //    wann eine Seite für Google und für den Besucher "da" ist. Ist das
    //    ausgerechnet ein Bild mit loading="lazy", lädt es erst verzögert –
    //    der klassische Ladezeit-Fehler.
    //    ACHTUNG: Weiter unten schaltet diese Prüfung alle Lazy-Bilder auf
    //    "sofort" (für brauchbare Ganzseiten-Screenshots). Würde man danach
    //    messen, verdeckt die Prüfung genau den Fehler, den sie finden soll.
    //    WICHTIG zur Technik: LCP-Einträge stehen NICHT in der normalen
    //    Performance-Liste – performance.getEntriesByType('largest-contentful-paint')
    //    liefert immer ein leeres Ergebnis. Nur ein PerformanceObserver mit
    //    buffered:true bekommt sie. (Erste Fassung dieser Prüfung war genau
    //    deshalb still blind und meldete brav "alles gut".)
    const lcp = await page.evaluate(async () => {
      await new Promise((r) => setTimeout(r, 700)); // LCP darf sich setzen
      const eintraege = await new Promise((fertig) => {
        const gesammelt = [];
        try {
          const beobachter = new PerformanceObserver((liste) => gesammelt.push(...liste.getEntries()));
          beobachter.observe({ type: 'largest-contentful-paint', buffered: true });
          setTimeout(() => {
            beobachter.disconnect();
            fertig(gesammelt);
          }, 300);
        } catch {
          fertig([]);
        }
      });
      const letzter = eintraege[eintraege.length - 1];
      const el = letzter?.element;
      if (!el) return null;
      const istBild = el.tagName === 'IMG';
      return {
        zeit: Math.round(letzter.startTime),
        tag: el.tagName.toLowerCase(),
        lazy: istBild && el.getAttribute('loading') === 'lazy',
        datei: istBild ? ((el.currentSrc || el.src || '').split('/').pop() || '').slice(0, 44) : '',
      };
    });

    // Einblende-Animationen sofort in den Endzustand bringen – sonst zeigen
    // Ganzseiten-Screenshots halbtransparente Sektionen und jede visuelle
    // Beurteilung würde Geister-Fehler sehen.
    await page.evaluate(() => {
      document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('ist-sichtbar'));
    });

    // Lazy-Bilder erzwingen. Ein Ganzseiten-Screenshot fotografiert die ganze
    // Seite, SCROLLT aber nicht – Bilder mit loading="lazy" weit unterhalb des
    // Sichtfensters laden deshalb nie und wären im Screenshot leere Flächen.
    // Wer den Screenshot beurteilt, sähe dort einen Fehler, den es gar nicht
    // gibt (bzw. übersähe einen echten). Deshalb: alles laden und abwarten.
    await page.evaluate(async () => {
      document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
        img.loading = 'eager';
      });
      await Promise.all(
        [...document.images]
          .filter((img) => !img.complete)
          .map((img) => new Promise((fertig) => {
            img.addEventListener('load', fertig, { once: true });
            img.addEventListener('error', fertig, { once: true });
          })),
      );
    });

    await page.waitForTimeout(400); // Übergänge zur Ruhe kommen lassen

    // 1) Horizontaler Überlauf – DER Responsive-Killer.
    const ueberlauf = await page.evaluate(() => {
      const doc = document.documentElement;
      if (doc.scrollWidth <= doc.clientWidth + 1) return null;
      const schuldige = [];
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.right > doc.clientWidth + 1 || r.left < -1) {
          const id = el.id ? `#${el.id}` : '';
          const klasse = el.classList.length ? `.${[...el.classList].slice(0, 2).join('.')}` : '';
          schuldige.push(`<${el.tagName.toLowerCase()}${id}${klasse}> ragt bis ${Math.round(r.right)}px`);
          if (schuldige.length >= 3) break;
        }
      }
      return { breite: doc.scrollWidth, sichtbar: doc.clientWidth, schuldige };
    });

    /* 1b) ABGESCHNITTENER TEXT – der blinde Fleck der Überlauf-Messung.
       Eine Karte mit `overflow: hidden` lässt Text nicht überlaufen, sondern
       SCHNEIDET ihn ab. Für die Messung oben ist das unsichtbar: Das Dokument
       scrollt nicht seitlich, also ist alles in Ordnung.
       Am 30.07.2026 an einer echten Kundenseite: Im Knopf stand „DETA" statt
       „Details ansehen". Kein Tor hat es gemeldet, kein Mensch hat es gesehen.
       Gemessen wird nur EINZEILIGER Text – bei mehrzeiligem ist ein Rest unter
       der Kante normal und gewollt (Zeilenklemme). */
    const abgeschnitten = await page.evaluate(() => {
      const funde = [];
      for (const el of document.querySelectorAll('button,a,span,h1,h2,h3,li,label,td,th')) {
        if (el.children.length > 0) continue; // nur Blätter, sonst zählt man doppelt
        const text = (el.textContent || '').trim();
        if (text.length < 4) continue;
        const s = getComputedStyle(el);
        if (s.display === 'none' || s.visibility === 'hidden') continue;
        /* AUSLASSUNGSPUNKTE SIND KEIN FEHLER, SONDERN EINE ENTSCHEIDUNG.
           `text-overflow: ellipsis` kürzt SICHTBAR – mit „…" am Ende. Der
           Besucher sieht, dass da mehr steht; genau dafür gibt es die
           Eigenschaft, und praktisch jede Katalogkarte benutzt sie.
           Ohne diese Zeile meldete die Messung jede solche Karte als harten
           Fehler und färbte das Tor rot – also genau die Sorte Fehlalarm, die
           einem das Hinsehen abgewöhnt. Gemeint ist nur das STILLE Kappen. */
        if (s.textOverflow === 'ellipsis') continue;
        /* NUR ELEMENTE MIT EIGENER BOX. Bei einem reinen Inline-Element
           (`<span>`, `<a>` im Text) sind scrollWidth und clientWidth immer 0 –
           die Prüfung unten wäre dort nicht etwa streng, sondern WIRKUNGSLOS,
           und das ohne jede Meldung. Lieber ehrlich überspringen: Gekappt wird
           ohnehin im Kasten drumherum, und der hat eine Box. */
        if (s.display === 'inline') continue;
        const r = el.getBoundingClientRect();
        if (r.width < 8 || r.height < 8) continue;
        // Mehrzeilig? Dann ist Beschneiden gewollt.
        const zeilenhoehe = parseFloat(s.lineHeight) || parseFloat(s.fontSize) * 1.4;
        if (r.height > zeilenhoehe * 1.6) continue;
        if (el.scrollWidth <= el.clientWidth + 1) continue;
        // Läuft der Text aus einem Vorfahren mit overflow:hidden heraus?
        let versteckt = false;
        for (let p = el; p && p !== document.body; p = p.parentElement) {
          const ps = getComputedStyle(p);
          if (ps.overflowX === 'hidden' || ps.overflowX === 'clip') { versteckt = true; break; }
        }
        if (!versteckt) continue;
        funde.push(
          `${el.tagName}${el.className ? '.' + String(el.className).split(' ')[0] : ''}: „${text.slice(0, 40)}" ` +
            `(${Math.round(el.scrollWidth)}px Text auf ${Math.round(el.clientWidth)}px Platz)`,
        );
        if (funde.length >= 5) break;
      }
      return funde;
    });

    /* 1c) TIPPFLÄCHEN – 44 x 44 px ist die empfohlene Fingerfläche.
       Nur am Handy gemessen: Am Zeigegerät ist ein 20-px-Ziel kein Problem.
       Der schlimmste Fund einer echten Abnahme war ein Schieberegler mit 16 px
       Höhe – und das ist eine ZIEHbewegung, nicht ein Tippen.

       DIE MESSUNG SCROLLT, UND ZWAR ZWINGEND: `elementFromPoint` fragt den
       Browser, was an einer Bildschirmstelle wirklich liegt – die Frage geht
       also nur fürs SICHTFENSTER. Ohne Scrollen wurde deshalb nur der erste
       Bildschirm geprüft und alles darunter stillschweigend übersprungen.
       Auf der Referenzseite des Motors betraf das die Fußzeile und die
       Formularfelder: Die Messung meldete grün, weil sie gar nicht hingesehen
       hatte. Das ist der schlimmste Fehlertyp – ein Tor, das nur so tut. */
    const zuKlein = breite > 500 ? [] : await page.evaluate(async () => {
      const funde = [];
      const gesehen = new Set();
      const naechsteBilder = () =>
        new Promise((fertig) => requestAnimationFrame(() => requestAnimationFrame(fertig)));
      const anfangs = window.scrollY;
      const gesamt = Math.max(document.documentElement.scrollHeight, window.innerHeight);
      // Deckel gegen sehr lange Seiten – 20 Bildschirme sind reichlich.
      const schritte = Math.min(Math.ceil(gesamt / window.innerHeight), 20);

      for (let schritt = 0; schritt < schritte && funde.length < 6; schritt++) {
        window.scrollTo(0, schritt * window.innerHeight);
        await naechsteBilder();

        for (const el of document.querySelectorAll('a,button,input,select,textarea,summary,[role="button"]')) {
          const s = getComputedStyle(el);
          if (s.display === 'none' || s.visibility === 'hidden') continue;
          if (el.type === 'hidden') continue;
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          /* Was gerade nicht im Sichtfenster liegt, wird in diesem Durchgang
             nicht gemessen – der nächste Schritt holt es. Weggeparktes (der
             Sprung-Link wartet über dem Seitenrand) fällt dabei immer heraus:
             Dort kann niemand hintippen, und elementFromPoint findet es nie. */
          if (r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) continue;
          /* Ein Link MITTEN IM FLIESSTEXT ist kein Bedienelement im Sinne der
             Regel – ein Link, der allein in seinem <li> steht, sehr wohl.

             HIER STAND NUR DER ELTERN-TAGNAME, und weil `LI` in der Liste war,
             hat die Messung die KOMPLETTE NAVIGATION jeder Seite übersprungen –
             also ausgerechnet die Bedienelemente, die jeder Besucher zuerst
             trifft. Entscheidend ist nicht das Eltern-Element, sondern ob
             wirklich Text darum herum steht. */
          const eigen = (el.textContent || '').trim();
          const drumherum = (el.parentElement ? el.parentElement.textContent || '' : '').trim();
          const imText =
            el.tagName === 'A' &&
            !!el.parentElement &&
            /^(P|LI|TD|SPAN|EM|STRONG|DD)$/.test(el.parentElement.tagName) &&
            drumherum.length > eigen.length + 3;
          if (imText) continue;
          if (r.width >= 44 && r.height >= 44) continue;
          /* Ein unsichtbares Pseudo-Element vergrößert die TREFFERFLÄCHE, ohne
             das Layout zu verschieben – genau die vorgeschriebene Technik. Es
             taucht aber in getBoundingClientRect() nicht auf. Also fragen, was
             der Browser an den Rändern einer 44er-Fläche wirklich trifft. */
          const mx = r.left + r.width / 2;
          const my = r.top + r.height / 2;
          const trifft = (x, y) => {
            /* Ins Fenster klemmen: Ein Element ganz oben, unten oder am Rand
               hat seinen Prüfpunkt sonst ausserhalb, und elementFromPoint
               liefert null – ein Fehlalarm, der mit der Tippfläche nichts zu
               tun hat. */
            const g = document.elementFromPoint(
              Math.min(Math.max(x, 1), window.innerWidth - 1),
              Math.min(Math.max(y, 1), window.innerHeight - 1),
            );
            return !!g && (g === el || el.contains(g) || g.contains(el));
          };
          /* IN BEIDE RICHTUNGEN PRÜFEN. Hier wurde nur oben und unten geprüft –
             das genügt für einen breiten, flachen Link, aber nicht für ein
             quadratisches Zeichen. Die Social-Icons der Fußzeile (20 × 20 px)
             bekamen ihre 44er-Fläche und wurden trotzdem weiter gemeldet, weil
             die Messung nie nach links und rechts gesehen hat. Geprüft werden
             die vier Kanten einer 44er-Fläche um die Mitte des Elements. */
          const nurHoch = r.width >= 44;
          const nurBreit = r.height >= 44;
          const senkrecht = nurBreit || (trifft(mx, my - 21) && trifft(mx, my + 21));
          const waagrecht = nurHoch || (trifft(mx - 21, my) && trifft(mx + 21, my));
          if (senkrecht && waagrecht) continue;
          const kennung = `${el.tagName}${el.className ? '.' + String(el.className).split(' ')[0] : ''}`;
          if (gesehen.has(kennung)) continue;
          gesehen.add(kennung);
          funde.push(`${kennung}: ${Math.round(r.width)}×${Math.round(r.height)} px`);
          if (funde.length >= 6) break;
        }
      }

      // Zurück an den Anfang: Die Bildschirmfotos danach sollen oben beginnen.
      window.scrollTo(0, anfangs);
      await naechsteBilder();
      return funde;
    });

    // 1d) Matsch-Bilder: ein Bild, das breiter angezeigt wird, als seine
    // Datei Pixel hat, wird vom Browser hochgerechnet und sieht verpixelt
    // aus. Klassische Ursache: <Image widths={[…1000]}> unter einem
    // Vollbreiten-Band. Fällt sonst erst dem Kunden am großen Monitor auf.
    const matschig = await page.evaluate(() => {
      return [...document.images]
        .filter((b) => b.complete && b.naturalWidth > 0 && !b.currentSrc.startsWith('data:'))
        .filter((b) => !/\.svg(\?|$)/i.test(b.currentSrc)) // Vektor skaliert verlustfrei
        .filter((b) => {
          const r = b.getBoundingClientRect();
          return r.width > 60 && r.width > b.naturalWidth * 1.34;
        })
        .slice(0, 4)
        .map((b) => {
          const r = b.getBoundingClientRect();
          const datei = (b.currentSrc.split('/').pop() || '').split('?')[0].slice(0, 44);
          return `${datei}: nur ${b.naturalWidth}px Datei auf ${Math.round(r.width)}px Anzeige`;
        });
    });

    /* 1e) KONTRAST UND SCHRIFTGRÖSSE AM ECHTEN TEXT.
       Das Prüf-Tor rechnet den Kontrast nur an zwei Farbwerten aus der Config
       aus (Text auf Hintergrund) – was tatsächlich auf der Seite steht, sah
       bisher niemand. Genau dort entstehen die Verstöße: gedämpfte Farben auf
       Sonderflächen, Pflichtangaben in 9 px, blasse Fußzeilen. Gemessen wird
       hier der GERENDERTE Zustand, inklusive geerbter Farben und Deckkraft.
       Nur sichtbarer Text mit echtem Inhalt zählt. */
    const lesbarkeit = await page.evaluate(() => {
      const zuRgb = (s) => {
        const m = s.match(/[\d.]+/g);
        if (!m) return null;
        return { r: +m[0], g: +m[1], b: +m[2], a: m[3] === undefined ? 1 : +m[3] };
      };
      const kanal = (c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      const leucht = ({ r, g, b }) => 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b);
      const mischen = (vorn, hinten) => ({
        r: vorn.r * vorn.a + hinten.r * (1 - vorn.a),
        g: vorn.g * vorn.a + hinten.g * (1 - vorn.a),
        b: vorn.b * vorn.a + hinten.b * (1 - vorn.a),
        a: 1,
      });
      /** Erste undurchsichtige Hintergrundfarbe von unten nach oben. */
      /*
       * Sucht die Fläche HINTER einem Text.
       *
       * WARUM DAS ZWEITE RÜCKGABEFELD DA IST: Diese Funktion las früher nur
       * `backgroundColor`. Ein Verlauf steht aber in `background-image` – und
       * die Kurzschreibweise `background: radial-gradient(…)` setzt
       * `background-color` dabei auf `transparent`. Die Messung lief also an
       * jedem Verlaufsband vorbei bis zur weißen Seite darunter und meldete
       * weißen Text auf schwarzem Grund als „1,57:1 – Kontrast zu schwach".
       *
       * Im ersten Testlauf mit einem echten Kundendesign (29.07.2026) waren
       * das 78 von 85 Befunden. Zwei Dinge machen es schlimmer als eine
       * harmlose Falschmeldung:
       *   1. Der Rat darunter lautet „Farbe aufhellen/abdunkeln". Wer dem bei
       *      weißem Text auf schwarzem Band folgt, macht ein einwandfreies
       *      Design kaputt – genau die Design-Treue, die der Motor schützen soll.
       *   2. Eine lange Liste Geister deckt die echten Befunde zu.
       *
       * Dasselbe gilt für Text auf einem FOTO: Auch da gibt es keine Farbe,
       * gegen die sich rechnen ließe. Die Prüfung sagt jetzt, dass sie es
       * nicht messen kann, statt eine Zahl zu erfinden.
       */
      const hintergrundVon = (el) => {
        let k = el;
        while (k && k !== document.documentElement) {
          const st = getComputedStyle(k);
          const f = zuRgb(st.backgroundColor);
          if (f && f.a === 1) return { farbe: f, unklar: null };
          const bild = st.backgroundImage;
          if (bild && bild !== 'none') {
            return { farbe: null, unklar: /gradient\(/.test(bild) ? 'Verlauf' : 'Bild' };
          }
          k = k.parentElement;
        }
        return { farbe: { r: 255, g: 255, b: 255, a: 1 }, unklar: null };
      };

      const funde = [];
      const zuKlein = [];
      const unmessbar = [];
      const gesehen = new Set();
      for (const el of document.querySelectorAll('p,li,a,span,td,th,h1,h2,h3,h4,h5,h6,label,button,figcaption,address,dd,dt,small,sup')) {
        const text = (el.textContent ?? '').trim();
        if (!text || text.length < 2) continue;
        // Nur Elemente mit EIGENEM Text (sonst zählt jeder Container mehrfach).
        if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
        const st = getComputedStyle(el);
        if (st.visibility === 'hidden' || st.display === 'none' || +st.opacity === 0) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;

        const px = parseFloat(st.fontSize);
        const kennung = `${el.tagName}.${el.className}`.slice(0, 48);
        // Text unter 12px ist auf einem Handy kaum lesbar – Pflichtangaben
        // (Allergene, Preise, Rechtshinweise) landen dort besonders gern.
        if (px < 12 && !zuKlein.some((z) => z.startsWith(kennung))) {
          zuKlein.push(`${kennung}: ${px.toFixed(1)}px – „${text.slice(0, 30)}"`);
        }

        /*
         * KONTURSCHRIFT: `color: transparent` plus `-webkit-text-stroke` ist
         * eine gängige Design-Technik (ein Wort nur als Umriss). Wer nur
         * `color` liest, misst „durchsichtig gegen irgendwas" = 1,00:1 und
         * meldet ein einwandfreies Wort als unlesbar. Im Testlauf am
         * 29.07.2026 waren das die letzten drei Falschmeldungen von
         * urspruenglich 85. Sichtbar ist hier die Konturfarbe – also wird die
         * gemessen.
         */
        const strichBreite = parseFloat(st.webkitTextStrokeWidth);
        const vornRoh = zuRgb(st.color);
        const vorn =
          vornRoh && vornRoh.a === 0 && Number.isFinite(strichBreite) && strichBreite > 0
            ? zuRgb(st.webkitTextStrokeColor)
            : vornRoh;
        if (!vorn || vorn.a === 0) continue;
        const deckkraft = parseFloat(st.opacity);
        const grund = hintergrundVon(el);
        /* Kein messbarer Grund -> KEINE erfundene Zahl. Einmal je Seite
           gemeldet, nicht je Textstelle: sonst steht dieselbe Sache
           dreißigmal da und deckt zu, worauf es ankommt. */
        if (!grund.farbe) {
          if (!gesehen.has('unmessbar:' + grund.unklar)) {
            gesehen.add('unmessbar:' + grund.unklar);
            unmessbar.push(grund.unklar);
          }
          continue;
        }
        const effektiv = mischen({ ...vorn, a: vorn.a * (Number.isFinite(deckkraft) ? deckkraft : 1) }, grund.farbe);
        const hinten = grund.farbe;
        const l1 = leucht(effektiv);
        const l2 = leucht(hinten);
        const v = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        // WCAG AA: 4,5:1 normal, 3:1 für großen (>=24px) oder fetten (>=18.66px) Text.
        const gross = px >= 24 || (px >= 18.66 && +st.fontWeight >= 700);
        const noetig = gross ? 3 : 4.5;
        if (v < noetig && !gesehen.has(kennung)) {
          gesehen.add(kennung);
          funde.push(`${kennung}: ${v.toFixed(2)}:1 bei ${px.toFixed(0)}px (nötig ${noetig}) – „${text.slice(0, 30)}"`);
        }
      }
      return { kontrast: funde.slice(0, 6), zuKlein: zuKlein.slice(0, 4), unmessbar };
    });

    const name = `${(seite === '/' ? 'start' : seite.replace(/^\//, '').replace(/\//g, '-'))}-${breite}px.png`;
    await page.screenshot({ path: join(ZIEL, name), fullPage: true });

    // 2b) Text-Dump – NACH dem Screenshot (der zeigt den echten Zustand) und
    // nur bei der größten Breite: bei 350 px steckt die Navigation im Burger
    // und fehlt im innerText. Zugeklappte Tabs/Akkordeons werden aufgedeckt –
    // der Dump prüft damit auch Text, den Screenshots nie zeigen. Die Prüfung
    // von Rechtschreibung/ß/Ansprache läuft über pruefung/texte.md (Text statt
    // Pixel); Text IN Bildern (Logos) bleibt Screenshot-Sache.
    if (breite === groessteBreite) {
      const dump = await page.evaluate(() => {
        document.querySelectorAll('[data-tabpanel]').forEach((p) => { p.hidden = false; });
        document.querySelectorAll('details').forEach((d) => { d.open = true; });
        return {
          titel: document.title,
          beschreibung: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
          text: document.body.innerText,
        };
      });
      texte.push({ seite, ...dump });
      const laenge = dump.text.trim().length;
      if (laenge < 80) hinweise.push(`${seite}: verdächtig wenig sichtbarer Text (${laenge} Zeichen) – leere Seite?`);
    }

    const kennung = `${seite} @ ${breite}px`;
    if (ueberlauf) {
      probleme.push(
        `${kennung}: HORIZONTALER ÜBERLAUF (${ueberlauf.breite}px Inhalt auf ${ueberlauf.sichtbar}px)\n      ${ueberlauf.schuldige.join('\n      ') || '(Verursacher nicht eingrenzbar)'}`,
      );
    }
    for (const a of abgeschnitten) {
      probleme.push(
        [
          `${kennung}: TEXT ABGESCHNITTEN -> ${a}`,
          '      Ein Vorfahre hat overflow:hidden – der Text läuft nicht über, er wird',
          '      GEKAPPT. Die Überlauf-Messung sieht das nicht. Platz schaffen oder umbrechen.',
        ].join('\n'),
      );
    }
    for (const z of zuKlein) {
      hinweise.push(
        [
          `${kennung}: TIPPFLÄCHE ZU KLEIN -> ${z} (empfohlen 44×44)`,
          '      Vergrößern mit einem unsichtbaren Pseudo-Element, NICHT mit Innenabstand –',
          '      sonst verschiebt sich das Layout und der Design-Abgleich reißt. Nur am Handy.',
        ].join('\n'),
      );
    }
    for (const f of [...new Set(jsFehler)]) probleme.push(`${kennung}: JS-Fehler -> ${f.slice(0, 140)}`);
    for (const k of [...new Set(kaputt)]) probleme.push(`${kennung}: lädt nicht -> ${k.slice(0, 140)}`);
    for (const m of matschig) probleme.push(`${kennung}: VERPIXELT (hochskaliert) -> ${m}\n      Abhilfe: widths der <Image> bis zur echten Anzeigebreite erweitern.`);
    for (const k of lesbarkeit.kontrast) {
      probleme.push(
        `${kennung}: KONTRAST ZU SCHWACH -> ${k}\n      Farbe aufhellen/abdunkeln (content.config.ts -> design.farben) oder eine kräftigere Textstufe verwenden.`,
      );
    }
    /* Ehrlich sagen, was nicht gemessen werden konnte – als HINWEIS, nicht als
       Fehler. Ein Verlauf oder ein Foto hinter Text lässt sich rechnerisch
       nicht auflösen; eine Zahl dafür wäre erfunden. Der Rat unten ist auch
       unabhängig von dieser Prüfung richtig: Eine Grundfarbe unter dem Verlauf
       ist der korrekte Rückfall, wenn er einmal nicht gemalt wird (Druck,
       erzwungene Farben, alter Browser unter der Browser-Untergrenze). */
    for (const u of lesbarkeit.unmessbar ?? []) {
      hinweise.push(
        u === 'Verlauf'
          ? `${kennung}: KONTRAST NICHT MESSBAR -> Text auf einem Verlauf ohne eigene Grundfarbe.\n` +
              '      `background-color` und `background-image` getrennt setzen statt der Kurzform\n' +
              '      `background: …gradient(…)` – dann kann die Prüfung rechnen (und der Verlauf\n' +
              '      hat einen Rückfall, wenn er nicht gemalt wird). MIT EIGENEN AUGEN ANSEHEN.'
          : `${kennung}: KONTRAST NICHT MESSBAR -> Text auf einem Bild.\n` +
              '      Rechnerisch nicht auflösbar. MIT EIGENEN AUGEN ANSEHEN: Text auf einem Foto\n' +
              '      braucht fast immer eine Plakette oder einen Schleier darunter.',
      );
    }
    for (const z of lesbarkeit.zuKlein) {
      probleme.push(
        `${kennung}: SCHRIFT ZU KLEIN -> ${z}\n      Mindestens 12px; Pflichtangaben (Allergene, Preise, Rechtshinweise) besser 13–14px.`,
      );
    }
    if (lcp?.lazy) {
      probleme.push(
        `${kennung}: GRÖSSTES BILD LÄDT VERZÖGERT -> ${lcp.datei} (LCP nach ${lcp.zeit} ms)\n` +
          `      Das Bild, das den ersten Eindruck bestimmt, hat loading="lazy" und startet erst spät.\n` +
          `      Abhilfe: loading="eager" + fetchpriority="high" (bei <Image>: loading="eager" fetchpriority="high").`,
      );
    }

    console.log(`  ${ueberlauf || jsFehler.length || kaputt.length || matschig.length || lcp?.lazy || lesbarkeit.kontrast.length || lesbarkeit.zuKlein.length ? '✗' : '✓'} ${kennung}  → pruefung/${name}`);
    await kontext.close();
  }
}

await browser.close();
stop();

// --- pruefung/texte.md schreiben: aller sichtbarer Text als lesbarer Dump ---
const md = texte
  .map(
    (t) =>
      `## ${t.seite}\n\n**Titel:** ${t.titel}\n**Description:** ${t.beschreibung}\n\n\`\`\`\n${t.text.trim()}\n\`\`\`\n`,
  )
  .join('\n');
writeFileSync(
  join(ZIEL, 'texte.md'),
  `# Sichtbarer Text aller Seiten (bei ${groessteBreite} px, inkl. aufgedeckter Tabs/Akkordeons)\n\n` +
    `> Hierüber läuft die Text-Prüfung: Rechtschreibung, ß-Schreibung, österreichisches\n` +
    `> Standarddeutsch, konsistente Ansprache. Text in Bildern zeigt nur der Screenshot.\n\n${md}`,
  'utf-8',
);

// --- Screen-Bögen für die Layout-Triage – bewusst non-fatal: ein Bogen-Fehler
//     darf eine grüne Sichtprüfung nicht kippen (Einzel-Screenshots reichen dann).
if (existsSync(join(WURZEL, 'scripts', 'bogen.mjs'))) {
  const bogen = spawnSync(process.execPath, ['scripts/bogen.mjs', '--screens'], { stdio: 'inherit' });
  if (bogen.status !== 0) console.warn('⚠ Screen-Bögen fehlgeschlagen – bitte die Einzel-Screenshots ansehen.');
}

console.log('');
if (hinweise.length > 0) {
  console.log('⚠ Hinweise:');
  for (const h of hinweise) console.log(`  • ${h}`);
  console.log('');
}
if (probleme.length > 0) {
  console.log('✗ Sichtprüfung NICHT bestanden:\n');
  for (const p of probleme) console.log(`  • ${p}`);
  console.log(`\n${probleme.length} Problem(e). Screenshots zum Nachsehen: pruefung/`);
  process.exit(1);
}
console.log(`✓ Messbare Prüfung bestanden (kein Überlauf, keine JS-Fehler, nichts kaputt).

  JETZT PFLICHT (das Skript misst, die Augen urteilen):
  1. pruefung/texte.md LESEN  → Rechtschreibung, ß, Ansprache, Ö-Deutsch
  2. pruefung/bogen-screens-* ANSEHEN → Layout über alle Breiten (Triage)
  3. Verdachtsfälle + Text-in-Bildern → Einzel-Screenshot in voller Größe`);
