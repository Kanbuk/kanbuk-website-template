import type { APIRoute } from 'astro';
import { site } from '../../content.config';

/**
 * /llms.txt – eine Kurzfassung der Website für Sprachmodelle.
 *
 * WAS HIER AUSDRÜCKLICH NICHT BEHAUPTET WIRD
 * ===========================================================================
 * **Dass sie jemand liest.** Am 06.08.2026 in der Dokumentation der grossen
 * Anbieter nachgesehen – OpenAI, Anthropic, Google, Perplexity, Meta, Apple,
 * Amazon, Mistral. Ergebnis:
 *
 *   • KEINER von ihnen sagt zu, fremde `llms.txt`-Dateien zu lesen oder
 *     auszuwerten. In der Anbieter-Dokumentation steht durchgehend nur
 *     `robots.txt` als Steuerungsmittel.
 *   • Google hat sich ausdrücklich DAGEGEN geäussert: normales SEO zähle,
 *     `llms.txt` werde nicht verwendet.
 *   • Erhebungen aus der Branche kommen darauf, dass die grosse Mehrheit der
 *     vorhandenen `llms.txt`-Dateien **null** Abrufe durch KI-Dienste sieht.
 *
 * `llms.txt` ist ein Vorschlag aus der Community (llmstxt.org), kein
 * Standard. Wer sie einbaut, tut das **auf Verdacht**.
 *
 * WARUM SIE TROTZDEM DABEI IST
 * ---------------------------------------------------------------------------
 * Sie kostet nichts: kein Pflegeaufwand, kein zweiter Ort für dieselbe
 * Wahrheit, keine Ladezeit auf der Website. Sie entsteht vollständig aus
 * `content.config.ts`. Sollte sich die Lage ändern, ist sie da – und wenn
 * nicht, hat sie niemandem geschadet.
 *
 * Was **nachweislich** wirkt und was der Motor ohnehin liefert: sauberes
 * HTML, echte Texte statt Text in Bildern, JSON-LD, und eine `robots.txt`,
 * die den KI-Crawler nicht aussperrt (`kiSuche`). Wer Zeit investieren will,
 * investiert sie dort.
 *
 * WARUM EINE ROUTE UND KEIN `npm run llms`
 * ---------------------------------------------------------------------------
 * Ein Skript erzeugt eine Datei, die man danach pflegen muss – und die beim
 * ersten Adresswechsel still veraltet. Als Route entsteht sie bei jedem Bau
 * neu aus derselben Config, aus der auch die Seite entsteht. Sie kann gar
 * nicht auseinanderlaufen.
 *
 * IN DER VORSCHAU bleibt sie leer: Eine Demo soll nirgends auftauchen.
 *
 * Der Statuscode hilft dabei nicht – bei einem rein statischen Bau schreibt
 * Astro den Rumpf als Datei, und der Server liefert sie mit 200 aus. Hier
 * stand deshalb einmal `new Response('Not found', { status: 404 })`, was auf
 * der Vorschau als Datei mit dem Inhalt „Not found" landete. Ein Satz, der
 * erklärt, warum sie leer ist, ist ehrlicher.
 */
export const GET: APIRoute = () => {
  if (site.mode !== 'live') {
    return new Response('# Vorschau – diese Seite ist noch nicht öffentlich.\n', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const b = site.betrieb;
  const basis = site.domain.replace(/\/$/, '');
  const zeilen: string[] = [];

  zeilen.push(`# ${b.name}`, '');

  const beschreibung = site.seiten?.[0]?.metaBeschreibung ?? '';
  if (beschreibung) zeilen.push(`> ${beschreibung}`, '');

  /* Ort und Art des Betriebs – genau die zwei Angaben, nach denen jemand in
     einem Chat fragt („Wo bekomme ich in Wien …?"). */
  const ort = [b.adresse?.plz, b.adresse?.ort].filter(Boolean).join(' ');
  if (ort) zeilen.push(`Standort: ${ort}${b.adresse?.strasse ? `, ${b.adresse.strasse}` : ''}`);
  if (b.email) zeilen.push(`E-Mail: ${b.email}`);
  if (b.telefon) zeilen.push(`Telefon: ${b.telefon}`);
  if (ort || b.email || b.telefon) zeilen.push('');

  /* Öffnungszeiten NUR als Wochenplan, ohne „heute" – alles, was von einem
     Datum abhängt, wäre hier beim Bauen eingefroren (CLAUDE.md Abschnitt 5). */
  const zeiten = b.oeffnungszeiten ?? [];
  if (zeiten.length > 0) {
    zeilen.push('## Öffnungszeiten', '');
    for (const z of zeiten) {
      zeilen.push(`- ${z.tag}: ${z.zeit}`);
    }
    zeilen.push('');
  }

  const seiten = (site.seiten ?? []).filter((s) => s.pfad && s.navTitel);
  if (seiten.length > 0) {
    zeilen.push('## Seiten', '');
    for (const s of seiten) {
      const kurz = s.metaBeschreibung ? `: ${s.metaBeschreibung}` : '';
      zeilen.push(`- [${s.navTitel}](${basis}${s.pfad})${kurz}`);
    }
    zeilen.push('');
  }

  zeilen.push('## Rechtliches', '');
  zeilen.push(`- [Impressum](${basis}/impressum)`);
  zeilen.push(`- [Datenschutz](${basis}/datenschutz)`);
  if ((site.rechtstexte?.agb ?? []).length > 0) zeilen.push(`- [AGB](${basis}/agb)`);

  return new Response(zeilen.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
