import type { APIRoute } from 'astro';
import { site } from '../../content.config';
/* EINGEBUNDEN, NICHT GELESEN. Ein `readFileSync(new URL(...))` zeigt nach dem
   Buendeln ins Bauverzeichnis statt in den Quellordner – der Bau brach mit
   ENOENT ab. Als Modul eingebunden wandert der Inhalt beim Bauen mit, und die
   Datei bleibt trotzdem die eine Wahrheit. */
import kiCrawler from '../../ki-crawler.json';

/**
 * robots.txt – mode-abhängig, plus der Schalter für KI-Crawler.
 *
 * demo: alles gesperrt (zusätzlich zu noindex-Meta + X-Robots-Tag-Header).
 * live: Indexierung erlaubt, Verweis auf die Sitemap.
 *
 * DER KI-SCHALTER – warum es ihn gibt
 * ===========================================================================
 * Hier stand nur `User-agent: *`. Das heißt: Jeder KI-Crawler darf, **ohne
 * dass irgendwer das entschieden hat.** Es gibt Betriebe, die das wollen
 * (Sichtbarkeit in ChatGPT, Perplexity, Gemini), und Betriebe, die es nicht
 * wollen (ihre Texte, Bilder und Preise als Trainingsmaterial). Beides ist
 * legitim – eine Nicht-Entscheidung ist es nicht.
 *
 * WELCHE KENNUNGEN es gibt, steht in `ki-crawler.json`, mit Anbieter-Quelle
 * und Datum. Nicht aus dem Gedächtnis ergänzen: Eine falsch geschriebene
 * Kennung sperrt nichts und erlaubt nichts – sie tut gar nichts, ohne
 * Meldung.
 *
 * DREI STUFEN statt zwei, und das ist der eigentliche Gewinn: Die Anbieter
 * trennen ihre Crawler nach Zweck (Training / Suche / Abruf im Chat). Ein
 * Betrieb kann deshalb in KI-Antworten auffindbar sein und trotzdem kein
 * Trainingsmaterial – `kiSuche: 'nur-suche'`. Das ist die Wahl, die die
 * meisten eigentlich meinen.
 *
 * EHRLICH DAZU: robots.txt ist eine BITTE. Die genannten Anbieter halten sich
 * nach eigener Aussage daran; erzwingen lässt es sich nicht. Wer eine echte
 * Sperre braucht, braucht eine Regel am Server.
 */
type Zweck = 'training' | 'suche' | 'abruf' | 'werbung';
type Crawler = { kennung: string; anbieter: string; zweck: Zweck };

const LISTE = kiCrawler as { nachgesehen: string; crawler: Crawler[] };

/* Ohne Kennungen wird NICHT still „alles erlaubt" ausgeliefert – das wäre
   genau die Nicht-Entscheidung, gegen die der Schalter antritt. */
if (!Array.isArray(LISTE.crawler) || LISTE.crawler.length === 0) {
  throw new Error(
    'ki-crawler.json enthaelt keine Kennungen. Ohne sie bliebe die Einstellung ' +
      '`kiSuche` wirkungslos – die Seite waere fuer jeden KI-Crawler offen, ohne ' +
      'dass es jemand entschieden haette. Datei aus dem Template zurueckholen.',
  );
}

/** Welche Zwecke werden bei welcher Einstellung gesperrt? */
const GESPERRT: Record<string, Zweck[]> = {
  erlaubt: [],
  'nur-suche': ['training'],
  gesperrt: ['training', 'suche', 'abruf', 'werbung'],
};

export const GET: APIRoute = () => {
  const istLive = site.mode === 'live';

  /* In der Vorschau ist ohnehin alles gesperrt – ein KI-Block darüber wäre
     Zierde. Die Vorschau soll nirgends auftauchen, auch nicht in einer
     KI-Antwort. */
  if (!istLive) {
    return new Response('User-agent: *\nDisallow: /\n', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const wahl = site.kiSuche ?? 'erlaubt';
  const zuSperren = GESPERRT[wahl] ?? [];
  const bloecke = ['User-agent: *\nAllow: /'];

  if (zuSperren.length > 0) {
    const betroffen = LISTE.crawler.filter((c) => zuSperren.includes(c.zweck));
    bloecke.push(
      [
        `# KI-Crawler: ${wahl === 'gesperrt' ? 'alle gesperrt' : 'kein Trainingsmaterial, KI-Suche erlaubt'}`,
        `# Eingestellt in content.config.ts -> kiSuche: '${wahl}'`,
        `# Kennungen nachgesehen am ${LISTE.nachgesehen} (Quellen in ki-crawler.json)`,
        ...betroffen.map((c) => `User-agent: ${c.kennung}\nDisallow: /`),
      ].join('\n'),
    );
  }

  bloecke.push(`Sitemap: ${new URL('sitemap-index.xml', site.domain).href}`);

  return new Response(bloecke.join('\n\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
