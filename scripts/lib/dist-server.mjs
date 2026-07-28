/**
 * Mini-Webserver für dist/ – geteilte Grundlage der Prüf-Werkzeuge
 * (sicht.mjs, interaktion.mjs). Kein Zusatzpaket, zufälliger freier Port,
 * nur 127.0.0.1 (bleibt auf dem eigenen Rechner).
 *
 *   const { basis, stop, seiten } = await starteDistServer();
 *   … await page.goto(basis + seiten[0]) …
 *   stop();
 */
import { createServer } from 'node:http';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.txt': 'text/plain', '.xml': 'application/xml',
};

function alleDateien(dir, treffer = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) alleDateien(p, treffer);
    else treffer.push(p);
  }
  return treffer;
}

/** Alle Routen der gebauten Seite ('/', '/impressum', …). */
export function distSeiten(dist) {
  return alleDateien(dist)
    .filter((f) => extname(f) === '.html')
    .map((f) => '/' + relative(dist, f).replace(/\\/g, '/').replace(/index\.html$/, '').replace(/\.html$/, ''));
}

/** Startet den Server. Liefert Basis-URL, Routenliste und stop(). */
export async function starteDistServer(dist) {
  const server = createServer((req, res) => {
    /*
     * ALLES ABFANGEN – der Server darf die Prüfung nicht mitreißen.
     *
     * WARUM: Ohne diesen Rahmen beendet JEDE Ausnahme im Bearbeiter den
     * gesamten Node-Prozess. Eine Sicht- oder Bedien-Prüfung bricht dann mit
     * einem Stapelabzug ab statt mit einer Meldung – für jemanden, der nicht
     * programmiert, ist das ununterscheidbar von „die Seite ist kaputt".
     * Der reale Auslöser ist ein Wettlauf: Zwischen `existsSync` und
     * `readFileSync` kann die Datei verschwinden, wenn nebenher gebaut wird
     * (ein Build leert dist/ und schreibt es neu). Am 2026-07-28 ist genau so
     * ein Abbruch aufgetreten und war danach nicht mehr nachstellbar.
     */
    try {
      let pfad = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      let datei = join(dist, pfad);
      if (existsSync(datei) && statSync(datei).isDirectory()) datei = join(datei, 'index.html');
      if (!existsSync(datei)) datei = `${join(dist, pfad)}.html`;
      if (!existsSync(datei)) {
        res.writeHead(404).end('nicht gefunden');
        return;
      }
      const inhalt = readFileSync(datei);
      res.writeHead(200, { 'Content-Type': MIME[extname(datei).toLowerCase()] ?? 'application/octet-stream' });
      res.end(inhalt);
    } catch (e) {
      /* 500 statt Absturz: Die Prüfung sieht dann eine kaputte Seite und
         meldet sie – das ist das richtige Ergebnis und nicht das Ende. */
      console.error('[dist-server] Anfrage fehlgeschlagen:', req.url, '->', e?.message ?? e);
      try {
        res.writeHead(500).end('Serverfehler');
      } catch { /* Antwort schon unterwegs – dann ist nichts mehr zu retten */ }
    }
  });

  // Auch ein Fehler am Server selbst (Port, Netzwerk) darf nur melden, nicht töten.
  server.on('clientError', (_e, socket) => socket.destroy());
  server.on('error', (e) => console.error('[dist-server]', e?.message ?? e));
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
  return {
    basis: `http://127.0.0.1:${server.address().port}`,
    seiten: distSeiten(dist),
    stop: () => server.close(),
  };
}
