import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { site } from './content.config';

const istLive = site.mode === 'live';

/**
 * Die Browser-Untergrenze steht in EINER Datei, nicht zweimal.
 *
 * `browser-untergrenze.json` wird hier gelesen und von `npm run browser`
 * ebenso. Stuende die Zahl an beiden Stellen, liefe sie irgendwann
 * auseinander - und dann prueft das Tor gegen etwas anderes, als gebaut wird.
 */
let grenze: Record<string, number>;
try {
  grenze = JSON.parse(readFileSync(new URL('./browser-untergrenze.json', import.meta.url), 'utf-8'));
} catch (e) {
  /* Klartext statt Stapelabzug: Ohne die Datei bricht sonst `astro build` mit
     einem ENOENT und fuenf Zeilen Technik ab - fuer jemanden, der nicht
     programmiert, unlesbar. Abgebrochen wird trotzdem, und das mit Absicht:
     Ohne Zusage wuerde still gegen "jeder Browser ist taufrisch" gebaut, und
     genau das war der urspruengliche Fehler. */
  throw new Error(
    'browser-untergrenze.json fehlt oder ist kaputt. Ohne sie weiss der Bau nicht, ' +
      'ab welchem Browser die Seite funktionieren muss - und baut fuer brandneue. ' +
      'Datei aus dem Template zuruueckholen. (' + ((e as Error)?.message ?? e) + ')',
  );
}

/**
 * Nur ECHTE Browsernamen weitergeben - und die Version richtig codieren.
 *
 * Zwei Fallen steckten hier, beide still:
 *  1. Ein Filter auf "alles ohne Unterstrich" reichte NICHT: `vollstaendig_ab_safari`
 *     ist keine Bau-Angabe, sondern die Aussehen-Grenze. Sie landete als
 *     vermeintlicher Browser in den CSS-Zielen und wurde wortlos geschluckt.
 *  2. `version << 16` verwirft Nachkommastellen: Aus 15.4 wird 15.0. Wer der
 *     Anleitung in der JSON-Datei folgt und `safari` eines Tages auf 15.4 setzt,
 *     baut gegen 15.0, waehrend das Tor gegen 15.4 misst - genau das
 *     Auseinanderlaufen, das die eine gemeinsame Datei verhindern soll.
 */
const BROWSER = ['safari', 'chrome', 'firefox', 'edge'] as const;

/* HIER STAND EINE UMRECHNUNG INS LIGHTNING-CSS-FORMAT (`15.4` -> Bitmuster)
   samt einer daraus gebauten `cssZiele`-Tabelle. Beides war TOT: Vite benutzt
   Lightning CSS nur, wenn `css.transformer` ausdruecklich darauf gesetzt ist -
   die Vorgabe ist postcss, und die Tabelle wurde stillschweigend verworfen.
   Gebaut wird mit esbuild, und das erwartet die Namensliste unten. Beide
   Ziele - JavaScript und CSS - stehen deshalb im selben Format. */

/* JEDE ZAHL DER GRENZ-DATEI MUSS AUCH WIRKEN.
   Bis zum 02.08.2026 standen dort `ios_saf`, `android` und `samsung` - gelesen
   hat sie NIEMAND, weder der Build noch `npm run browser`. Wer `samsung`
   senkte, aenderte nichts und erfuhr es nie. Genau die stille Sorte Fehler,
   gegen die es diese Datei ueberhaupt gibt.
   Sie sind jetzt draussen; iOS laeuft auf Safari, Android und Samsung Internet
   auf Chromium - die Zahlen oben decken sie mit ab. Und der Build haelt an,
   sobald eine Angabe dazukommt, die kein Ziel erreicht. */
const unbekannt = Object.keys(grenze).filter(
  (k) => !k.startsWith('_') && k !== 'vollstaendig_ab_safari' && !(BROWSER as readonly string[]).includes(k),
);
if (unbekannt.length) {
  throw new Error(
    `browser-untergrenze.json: unbekannte Angabe(n) ${unbekannt.join(', ')}.\n` +
      `Erlaubt sind ${BROWSER.join(', ')} sowie vollstaendig_ab_safari.\n` +
      `Ein Name, den niemand liest, senkt die Grenze nicht - er sieht nur so aus.`,
  );
}

/** esbuild erwartet Namen wie "safari12". */
const jsZiele = [
  'safari' + grenze.safari,
  'chrome' + grenze.chrome,
  'firefox' + grenze.firefox,
  'edge' + grenze.edge,
];

/**
 * Erzeugt nach dem Build automatisch die Auslieferungs-Regeln für Vercel
 * (vercel.json): Sicherheits-Kopfzeilen, Sperr-Header je nach `mode`,
 * Schriften-Caching und die Weiterleitungen der Vorgänger-Website.
 *
 * NUR VERCEL, mit Absicht: Früher entstanden hier zusätzlich `_headers` und
 * `_redirects` für Cloudflare Pages / Netlify. Kanbuk hostet ausschließlich
 * auf Vercel – die zweite Schiene wurde nie ausgeliefert, musste aber
 * mitgepflegt werden und ging dabei still kaputt (in `_redirects` sind
 * Query-Strings wie `/index.php?id=670` gar nicht zulässig, die alten
 * TYPO3-Adressen hätten dort nie gegriffen). Doppelte Wege heißen doppelte
 * Fehlerquellen. Wer später doch auf einen anderen Host wechselt, holt sich
 * die Erzeugung aus der Versionsgeschichte zurück.
 *
 * WARUM AUTOMATISCH: Früher stand der X-Robots-Tag fest in einer committeten
 * vercel.json und musste beim Live-Gang von Hand entfernt werden. Vergisst man
 * das, bleibt die Seite für Google gesperrt – und niemand merkt es, weil die
 * Seite ja funktioniert. Genau solche stillen Fallen darf ein Motor nicht haben.
 * Jetzt folgt alles dem `mode`.
 */
/**
 * Zerlegt eine alte Adresse in Pfad + Query-Bedingungen.
 *
 * Die Vorgänger-Website war ein TYPO3 mit Adressen wie `/index.php?id=670`.
 * Vercel vergleicht `source` NUR mit dem Pfad – ein Fragezeichen darin würde
 * nie zutreffen, und die alten Google-Treffer liefen still ins Leere. Der
 * Query-Teil muss deshalb als `has`-Bedingung mitgegeben werden.
 */
function zerlegeWeiterleitung(von: string) {
  const [pfad, suchteil] = von.split('?');
  const has = suchteil
    ? [...new URLSearchParams(suchteil)].map(([key, value]) => ({ type: 'query' as const, key, value }))
    : [];
  return { pfad, has };
}

function auslieferungsRegeln() {
  const sicherheit = [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    /* Kein Fremder darf die Seite in einen Rahmen setzen. Ohne diese Zeile
       kann jede beliebige Website die Kundenseite einbetten und darüber ein
       eigenes Bedienelement legen (Clickjacking) – oder sie schlicht als
       eigene ausgeben. `frame-ancestors` ist der moderne Weg,
       X-Frame-Options die Rückfallebene für ältere Browser. */
    { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    {
      key: 'Permissions-Policy',
      value: 'geolocation=(), camera=(), microphone=(), interest-cohort=()',
    },
  ];
  const kopfzeilen = istLive
    ? [
        // HSTS nur live: zwingt Browser dauerhaft auf HTTPS (Vorschau-Domains
        // sollen keine so langlebige Zusage machen).
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        ...sicherheit,
      ]
    : [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }, ...sicherheit];

  return {
    name: 'kanbuk-auslieferung',
    hooks: {
      'astro:build:done': ({ dir }: { dir: URL }) => {
        const outDir = fileURLToPath(dir);

        /**
         * Schriften unveränderlich cachen. Ohne diese Regel liefert der Host
         * public/-Dateien mit `max-age=0, must-revalidate` aus – der Browser
         * fragt die Schrift dann bei JEDEM Seitenwechsel neu beim Server nach,
         * und während dieser Rückfrage zeigt font-display:swap die Ersatz-
         * schrift: der Text „hüpft" bei den ersten Seitenwechseln (auf der
         * Pilot-Seite live gemessen). Die Dateinamen aus `npm run schrift`
         * tragen einen Hash – eine neue Schrift bekommt einen neuen Namen,
         * darum ist ein Jahr + immutable sicher.
         */
        const schriftCache = { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' };

        // --- vercel.json (im Projekt-Ordner – dort liest Vercel sie) ---
        //
        // ACHTUNG: Vercel prüft diese Datei gegen ein Schema und lehnt JEDES
        // unbekannte Feld ab ("should NOT have additional property"). Ein
        // Hinweis-Feld wie `_kommentar_de` lässt den Deploy also komplett
        // scheitern – deshalb steht der Hinweis hier im Quelltext und NICHT
        // in der erzeugten Datei. Nur `$schema` ist als Zusatz erlaubt.
        //
        // Die Datei ist AUTOMATISCH ERZEUGT – nicht von Hand ändern. Ihr Inhalt
        // folgt dem Feld `mode` in content.config.ts: bei "demo" mit
        // X-Robots-Tag (nicht indexierbar), bei "live" ohne. Einfach `mode`
        // umstellen und neu bauen.
        const vercel = {
          $schema: 'https://openapi.vercel.sh/vercel.json',
          /**
           * Formular-Endpunkt in Frankfurt rechnen lassen, nicht dort, wo
           * Vercel gerade Platz hat (Standard war Washington/iad1).
           *
           * WARUM: Über /api/contact laufen Name, Telefonnummer und Nachricht
           * echter Gäste – personenbezogene Daten. Die gehören nicht ohne Not
           * über einen US-Server. Der Rest der Seite ist statisch und kommt
           * ohnehin aus dem CDN-Knoten beim Besucher; das hier betrifft nur die
           * Funktion. Nebeneffekt: näher am Gast = schnelleres Absenden.
           *
           * fra1 = Frankfurt, der nächste EU-Standort zu Österreich.
           */
          regions: ['fra1'],
          /* Eine Seite, eine Adresse: /speisekarte/ wird per 308 auf
             /speisekarte umgeleitet. Ohne das antworten beide Schreibweisen
             mit 200, und Google zählt sie als zwei Seiten mit gleichem Inhalt
             (siehe trailingSlash weiter unten). */
          trailingSlash: false,
          headers: [
            { source: '/(.*)', headers: kopfzeilen },
            { source: '/fonts/(.*)', headers: [schriftCache] },
          ],
          ...(site.weiterleitungen.length > 0 && {
            redirects: site.weiterleitungen.map((w) => {
              const { pfad, has } = zerlegeWeiterleitung(w.von);
              return {
                source: pfad,
                ...(has.length > 0 && { has }),
                destination: w.nach,
                permanent: (w.status ?? 301) === 301,
              };
            }),
          }),
        };
        writeFileSync('vercel.json', JSON.stringify(vercel, null, 2) + '\n', 'utf-8');
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: site.domain,
  // Rein statischer Build – kein SSR-Adapter, kein CMS, keine Datenbank.
  output: 'static',
  /**
   * Adressen OHNE abschließenden Schrägstrich – und zwar überall gleich.
   *
   * Vorher widersprachen sich zwei Stellen: Die Sitemap meldete Google
   * `…/speisekarte/`, die Seite selbst bezeichnete sich per canonical als
   * `…/speisekarte`. Beide Adressen antworteten mit 200. Google muss dann
   * raten, welche gilt – das kostet Crawl-Budget, verzögert die Indexierung
   * neuer Seiten und verteilt eingehende Links auf zwei Adressen. Genau in der
   * Phase, in der ein Betrieb seine alte Website ablöst, ist das teuer.
   *
   * Wichtig: Die Vercel-Regel `trailingSlash: false` in der erzeugten
   * vercel.json gehört dazu – sie leitet /x/ per 308 auf /x um, damit die
   * Doppel-Adresse gar nicht erst erreichbar bleibt.
   */
  trailingSlash: 'never',
  // Sitemap nur im live-Modus (im demo-Modus wird ohnehin nicht indexiert).
  integrations: [
    // Sitemap nur im live-Modus (im demo-Modus wird ohnehin nicht indexiert).
    /* Sitemap nur im live-Modus (im demo-Modus wird ohnehin nicht indexiert).
       Bekannter Sonderfall: Die Sitemap meldet die Startseite als
       „https://kunde.at" ohne Schrägstrich, das canonical im Seitenkopf
       schreibt „https://kunde.at/". Das ist unkritisch – bei einer Adresse
       OHNE Pfad behandeln Browser und Google beide Formen als dieselbe Seite
       (anders als bei /speisekarte vs. /speisekarte/, wo echte Doppel-
       Adressen entstehen). Ein Angleichen über `serialize` ist nicht möglich:
       die Sitemap-Erweiterung entfernt den Schrägstrich danach wieder.
       Die Prüf-Regel in scripts/check.mjs kennt diesen Fall. */
    /* SEITEN MIT noindex GEHÖREN NICHT IN DIE SITEMAP.
       Die Erweiterung schließt von sich aus nur Fehlerseiten (404, 500) aus –
       nicht die Danke-Seite und nicht die Anfrage-Fehlerseite, die der Motor
       beide bewusst auf `noindex` setzt. Folge: In der Relaunch-Woche steht in
       der Search Console der rote Fehler „Übermittelte URL als ‚noindex'
       gekennzeichnet" – ausgerechnet dann, wenn der Inhaber das erste Mal
       hinsieht und wissen will, ob der Umzug geklappt hat.
       Beim Ergänzen einer weiteren noindex-Seite gehört sie hier dazu. */
    ...(istLive
      ? [
          sitemap({
            filter: (seite) => !/\/(danke|anfrage-fehler)\/?$/.test(seite),
          }),
        ]
      : []),
    auslieferungsRegeln(),
  ],
  /**
   * Vorschau-Server fest auf IPv4-localhost.
   *
   * WARUM: Ohne Angabe bindet der Server an den Namen "localhost". Node löst den
   * seit Version 17 zuerst nach ::1 (IPv6) auf – der Server lauscht dann NUR auf
   * IPv6. Ein Browser, der http://localhost:4321 über IPv4 aufruft (oder auf dem
   * IPv6 abgeschaltet ist), bekommt „Verbindung abgelehnt", obwohl der Server
   * läuft. Genau das ist unter Windows passiert.
   *
   * 127.0.0.1 ist zusätzlich enger als 0.0.0.0: Die Vorschau bleibt auf dem
   * eigenen Rechner und hängt nicht im ganzen WLAN.
   */
  server: {
    host: '127.0.0.1',
  },
  image: {
    // astro:assets nutzt sharp für responsive Bildgrößen.
    responsiveStyles: true,
  },
  build: {
    inlineStylesheets: 'auto',
  },

  /**
   * ZIEL-BROWSER - die Einstellung, deren FEHLEN eine fertige Seite auf
   * aelteren Geraeten unbenutzbar machte, waehrend alle Pruefungen gruen waren.
   *
   * Ohne diese Angabe nimmt der Build an, jeder Browser sei taufrisch:
   *
   *  - Der CSS-Verdichter schreibt `@media (min-width: 900px)` in die Kurzform
   *    `@media (width>=900px)` um. Die versteht Safari erst ab 16.4 (Maerz
   *    2023). Ein Browser, der sie nicht kennt, verwirft nicht eine Zeile,
   *    sondern den GANZEN Regelblock. Im Kundenprojekt blieb dadurch der
   *    Menue-Knopf auf `display:none` UND die Navigationsliste ebenfalls - es
   *    gab auf keiner Seite mehr eine Navigation.
   *  - Das Skriptbuendel entsteht als "esnext". Eine Schreibweise, die der
   *    Browser nicht LESEN kann, ist kein Ausfall eines Bausteins: Er bricht
   *    beim Einlesen ab, und damit sind Menue, Filter, Merkliste, Formular und
   *    Lightbox gleichzeitig tot - ohne Fehlermeldung fuer den Besucher.
   *
   * ACHTUNG, HIER LIEGT EINE FALLE: `environments.client.build.target` klingt
   * richtig, wirkt aber nicht - Astros eigene Vorgabe gewinnt. Nur der
   * `vite`-Schluessel unten greift.
   *
   * DIE ZAHLEN SELBST stehen in `browser-untergrenze.json`, dort auch die
   * Anleitung zum Aendern. `npm run browser` misst den fertigen Build dagegen.
   */
  vite: {
    build: {
      // JavaScript: Was der Browser nicht LESEN kann, killt das ganze Buendel.
      target: jsZiele,
      /* CSS AUSDRUECKLICH SETZEN, NICHT ERBEN.
         Hier stand stattdessen `css: { lightningcss: { targets: cssZiele } }`
         mit dem Kommentar, das verhindere die Kurzformen. Das war WIRKUNGSLOS:
         Vite benutzt lightningcss nur, wenn `css.transformer` darauf gesetzt
         ist - die Vorgabe ist postcss, und die Angabe wurde stillschweigend
         verworfen. Geschuetzt hat in Wahrheit `build.target`, von dem
         `build.cssTarget` erbt.

         Das ist genau die Falle, wegen der es die Browser-Untergrenze gibt:
         Der Verdichter schreibt `@media (min-width: 900px)` in die Kurzform
         `@media (width>=900px)` um, die Safari erst ab 16.4 kennt - und wer
         sie nicht kennt, verwirft den GANZEN Regelblock. Eine geerbte
         Vorgabe ist dafuer zu wenig: Sie kann sich mit einer Vite-Version
         aendern, ohne dass es jemandem auffaellt. */
      cssTarget: jsZiele,
    },
  },
});
