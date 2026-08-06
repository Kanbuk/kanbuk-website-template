/**
 * =============================================================================
 *  DIE BESTÄTIGUNG AN DEN ABSENDER – im Aussehen des Betriebs
 * =============================================================================
 *  Baut aus der Formular-Definition zwei Fassungen derselben Nachricht: eine
 *  reine Textfassung und eine gestaltete. Beide gehen zusammen raus – jedes
 *  Mailprogramm nimmt sich, was es kann.
 *
 *  Es ist die einzige Nachricht, die ein Interessent vom Betrieb bekommt,
 *  bevor jemand persönlich antwortet. Bis zum 30.07.2026 war sie eine nackte
 *  Textzeile – und trug den Betreff der INTERNEN Benachrichtigung („Neue
 *  Anfrage über die Website"), also die Innensicht des Betriebs, ausgerechnet
 *  an den, der gerade seine Telefonnummer hinterlassen hat.
 *
 *  WARUM MAIL-MARKUP ANDERS AUSSIEHT ALS WEB-MARKUP – und warum hier nichts
 *  davon Nachlässigkeit ist:
 *
 *    • **Tabellen als Gerüst.** Mailprogramme sind kein Browser: Outlook
 *      zeichnet mit der Word-Engine, viele Programme kennen kein Flexbox und
 *      kein Grid. Eine Tabelle mit fester Breite können alle.
 *    • **Jede Farbe INLINE am Element.** Gmail entfernt <style>-Blöcke in
 *      manchen Ansichten. Ohne Inline-Angaben stünde die Mail dort
 *      unformatiert da.
 *    • **Keine Webschriften.** Sie laden in Mailprogrammen nicht. Es bleibt
 *      eine Systemschrift; die Marke trägt hier das Logo und die Farbe.
 *    • **Dunkler Modus mitbedacht.** Apple Mail und Outlook färben sonst
 *      selbst um. Die Farben sind so gewählt, dass auch eine automatische
 *      Umkehrung lesbar bleibt.
 *    • **Höchstens EIN Bild**, das Logo im Kopf. Blockierte Bilder sind beim
 *      ersten Öffnen der Normalfall – deshalb trägt der Alternativtext den
 *      Betriebsnamen, und die Schriftangaben stehen AM BILD UND AN DER
 *      UMGEBENDEN ZELLE (Outlook zieht sie von der Zelle, andere vom Bild).
 */
/* Die .js-Endung ist PFLICHT, obwohl dort eine .ts-Datei liegt: Vercel baut
   Server-Dateien als Node-ESM. Ohne Endung stürzt die Funktion beim Start ab –
   und zwar erst im Betrieb, nicht im Build. */
import type { Formular } from '../../content.config.js';
import { site } from '../../content.config.js';
import { kontrastText } from './theme.js';

/** Längster Wert, der in die Mail übernommen wird. */
const MAX_WERT = 600;

/**
 * Macht aus einem Eingabewert sicheres Markup.
 *
 * PFLICHT, nicht Vorsicht: Die Werte kommen aus einem öffentlichen Formular.
 * Ohne diese Umwandlung könnte jemand Markup oder einen Link in eine Mail
 * schreiben, die anschließend von der Domain des Betriebs verschickt wird.
 */
function sicher(wert: string): string {
  return wert
    .slice(0, MAX_WERT)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const duzen = site.ansprache === 'du';
const b = site.betrieb;
const einstellung = site.bestaetigung ?? {};

/** Die ausgefüllten Felder in der Reihenfolge der Config, Leeres fällt weg. */
/* ZEILENUMBRÜCHE RAUS – AUCH HIER.
   Die HTML-Fassung ist über `sicher()` geschützt, die TEXTfassung war es
   nicht: Hier stand nur `.slice()`. Ein Wert mit Zeilenumbruch zerreisst dort
   die Aufzählung („Name: Max\nBetreff: gehackt") – und weil beide Fassungen
   aus derselben Liste entstehen, betrifft es genau den Fall, den
   `bestaetigung.angabenWiederholen` einschaltet. Dieselbe Säuberung wie in
   kontakt.ts, aus demselben Grund. */
function einzeilig(wert: string): string {
  return wert.replace(/[\r\n]+/g, ' ').trim().slice(0, MAX_WERT);
}

/* DIE ANGABEN-LISTE WAR DIE EINZIGE TEXTSTELLE OHNE SPRACHE.
   Titel, Fliesstext, Datenschutzsatz und Kontaktzeile schalten laengst um –
   hier standen weiter die deutschen Feldbeschriftungen und ein fest
   verdrahtetes „Ihre Auswahl". Sichtbar wird es, sobald ein Kunde
   `bestaetigung.angabenWiederholen` einschaltet: Dann steht in der englischen
   Mail „This is what you sent us:" und darunter „Vorname / Nachricht /
   Ihre Auswahl". */
function ausgefuellt(formular: Formular, daten: Record<string, string>, sprache: Sprache = 'de') {
  const zeilen: { label: string; wert: string }[] = [];
  for (const feld of formular.felder) {
    const wert = (daten[feld.name] ?? '').trim();
    if (!wert) continue;
    const label = sprache === 'en' ? (feld.labelEn ?? feld.label) : feld.label;
    zeilen.push({ label, wert: einzeilig(wert) });
  }
  const bezug = (daten.bezug ?? '').trim();
  if (bezug) {
    zeilen.push({ label: sprache === 'en' ? 'Your selection' : 'Ihre Auswahl', wert: einzeilig(bezug) });
  }
  return zeilen;
}

/**
 * PFLICHTANGABEN FÜR GESCHÄFTS-E-MAILS (§ 14 UGB).
 *
 * Für eingetragene Unternehmen verlangt § 14 UGB dieselben Angaben wie auf
 * einem Geschäftsbrief; nach österreichischer Praxis gilt das auch für
 * Geschäfts-E-Mails. Sanktion ist eine Zwangsstrafe – teuer ist also nicht
 * der Einzelfall, sondern die Dauer.
 *
 * Alles steht schon in den Rechtstexten; hier wird es nur zusammengesetzt.
 * Fehlt eine Angabe, fällt sie weg statt leer zu erscheinen.
 *
 * OHNE UMWEG ÜBER `Record<string, …>`, UND DAS IST HIER WICHTIG: Ein solcher
 * Umweg schaltet für genau diese vier Zugriffe die Typprüfung ab. Ein Tippfehler
 * im Feldnamen fiele dann nirgends auf – die Angabe verschwände einfach aus der
 * Mail, und niemand vergleicht eine Empfangsbestätigung mit § 14 UGB. Sanktion
 * ist eine Zwangsstrafe, die läuft, bis es jemand merkt. Also direkt zugreifen.
 */
function pflichtangaben(): string {
  const r = site.rechtstexte;
  return [
    /* FIRMENWORTLAUT UND SITZ GEHÖREN DAZU – sie fehlten.
       Die Datei beruft sich im Kopf ausdrücklich auf § 14 UGB und gab dann
       Rechtsform, Firmenbuch, Gericht und UID aus. Der Firmenwortlaut stand
       zwar weiter unten in der Mail, aber als `betrieb.name` – das ist der
       Anzeigename („Muster Betrieb"), nicht der eingetragene Wortlaut
       („Muster Betrieb GmbH"). Und der Sitz fehlte ganz; die Anschrift ist
       nicht dasselbe (siehe `rechtstexte.sitz`).
       Doppelt erscheint dabei nichts: Sind Anzeigename und Firmenwortlaut
       gleich, fällt der Wortlaut hier weg. */
    r.firmenwortlaut !== site.betrieb.name ? r.firmenwortlaut : '',
    /* DIE RECHTSFORM NUR BEI EINEM EINGETRAGENEN UNTERNEHMEN.
       Sie stand im Fuß JEDER Mail, auch bei einer Privatperson. § 14 UGB gilt
       für eingetragene Unternehmen; wer keines ist, gibt hier keine
       Rechtsform an – der Wert wäre dann keine Rechtsformangabe, sondern eine
       Selbstbeschreibung („Einzelperson"), und die gehört nicht in einen
       Block, der sich auf eine Pflichtnorm beruft.

       Woran der Motor es erkennt: an einer Firmenbuchnummer. Wer eine hat,
       ist eingetragen; wer keine hat, ist es nicht. Das ist die einzige
       Angabe, die ohne Rückfrage beim Betrieb sicher unterscheidet – und sie
       steht ohnehin schon in der Config. */
    r.firmenbuchnummer ? r.rechtsform : '',
    r.sitz && `Sitz: ${r.sitz}`,
    r.firmenbuchnummer && `Firmenbuch ${r.firmenbuchnummer}`,
    r.firmenbuchgericht,
    r.uid && `UID ${r.uid}`,
  ]
    .filter(Boolean)
    .join(' · ');
}

/* ===========================================================================
   DIE BESTÄTIGUNG IN DER SPRACHE DER ANFRAGE
   ===========================================================================
   Sie ist die EINZIGE Nachricht, die ein Interessent bekommt, bevor jemand
   persönlich antwortet. Bei einem zweisprachigen Kunden bekam eine englische
   Anfrage bisher eine deutsche Bestätigung.

   Übernommen ist die STRUKTUR, nicht ein fremder Text: Die Sätze hier sind
   neutrale Musterformulierungen des Motors. Deutsch führt zusätzlich die
   du/Sie-Unterscheidung, Englisch kennt sie nicht.
   =========================================================================== */
type Sprache = 'de' | 'en';

/** Wählt aus [du, Sie, englisch] die passende Fassung. */
function satz(du: string, sie: string, en: string, sprache: Sprache): string {
  if (sprache === 'en') return en;
  return duzen ? du : sie;
}

/** Der Betreff – aus Sicht des ABSENDERS, nicht des Betriebs. */
export function bestaetigungBetreff(sprache: Sprache = 'de'): string {
  if (sprache === 'en') return einstellung.betreffEn ?? `Your enquiry to ${b.name}`;
  return einstellung.betreff ?? `Ihre Anfrage bei ${b.name}`;
}

const anschrift = `${b.adresse.strasse}, ${b.adresse.plz} ${b.adresse.ort}`;

/* --------------------------------------------------------------------------
 *  TEXTFASSUNG – geht immer, auch im ältesten Mailprogramm.
 * ----------------------------------------------------------------------- */
export function bestaetigungText(
  formular: Formular,
  daten: Record<string, string>,
  sprache: Sprache = 'de',
): string {
  const zeilen: string[] = [
    satz('Danke für deine Anfrage!', 'Vielen Dank für Ihre Anfrage!', 'Thank you for your enquiry!', sprache),
    '',
    satz(
      'Wir haben deine Anfrage erhalten und melden uns so bald wie möglich.',
      'Wir haben Ihre Anfrage erhalten und melden uns so bald wie möglich.',
      'We have received your enquiry and will get back to you as soon as possible.',
      sprache,
    ),
    '',
  ];

  if (einstellung.angabenWiederholen) {
    zeilen.push(
      satz('Das hast du uns geschickt:', 'Das haben Sie uns geschickt:', 'This is what you sent us:', sprache),
      '',
    );
    for (const z of ausgefuellt(formular, daten, sprache)) zeilen.push(`${z.label}: ${z.wert}`);
    zeilen.push('');
  } else {
    zeilen.push(
      satz(
        'Aus Datenschutzgründen wiederholen wir deine Angaben hier nicht.',
        'Aus Datenschutzgründen wiederholen wir Ihre Angaben hier nicht.',
        'For data protection reasons we do not repeat your details here.',
        sprache,
      ),
      '',
    );
  }

  zeilen.push(
    satz(
      'Bei Rückfragen erreichst du uns direkt:',
      'Bei Rückfragen erreichen Sie uns direkt:',
      'If you have any questions, you can reach us directly:',
      sprache,
    ),
    '',
    b.name,
    anschrift,
    b.telefon,
    b.email,
  );

  const pflicht = pflichtangaben();
  if (pflicht) zeilen.push('', pflicht);

  return zeilen.join('\n');
}

/* --------------------------------------------------------------------------
 *  GESTALTETE FASSUNG
 * ----------------------------------------------------------------------- */

/** Die Farben kommen aus dem Design – die Mail sieht aus wie die Website. */
const F = {
  grund: site.design.farben.hintergrund,
  text: site.design.farben.text,
  primaer: site.design.farben.primaer,
  /* DIE SCHRIFTFARBE AUF DEM FARBIGEN KOPF WIRD GERECHNET, NICHT GERATEN.
     Hier stand die Hintergrundfarbe der Seite – bei einem dunklen Markenton
     sieht das zufällig richtig aus. Bei einem HELLEN Markenton (Sonnengelb,
     Pastell, Beige – nichts Ausgefallenes) stünde dann Weiß auf Hellgelb: Der
     Betriebsname im Kopf der Bestätigung wäre praktisch unlesbar, und zwar in
     der einzigen Mail, die ein Interessent vor dem ersten Gespräch bekommt.
     `kontrastText()` ist dieselbe Rechnung, aus der die Website
     `--farbe-auf-primaer` bekommt – Mail und Seite sehen damit gleich aus. */
  aufPrimaer: kontrastText(site.design.farben.primaer),
};

/* Systemschriften. Webschriften laden in Mailprogrammen nicht – wer sie hier
   einträgt, bekommt überall die Vorgabeschrift und hat nichts gewonnen. */
const SCHRIFT = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/**
 * Die Adresse des Logos muss ABSOLUT sein und dem Modus folgen.
 *
 * In der Vorschau die Vorschau-Adresse, live die Kundendomain – sonst holt das
 * Mailprogramm das Bild von einer Domain, die es noch gar nicht gibt, und der
 * Kopf bleibt leer. Genau dieselbe Falle wie beim Vorschaubild für WhatsApp.
 */
const BASIS = (site.mode === 'demo' ? (site.vorschauDomain ?? site.domain) : site.domain).replace(/\/$/, '');

/**
 * DER MARKENKOPF JEDER MAIL – eine Stelle, nicht drei.
 * ===========================================================================
 * Er lag zuletzt dreimal fast gleich im Code, und eine der drei Mails hatte
 * gar keinen. Sobald es mehr als eine Mail gibt, driftet das garantiert
 * auseinander – und niemand liest drei Mail-Vorlagen gegeneinander.
 *
 * ZWEI FALLEN STECKEN DARIN, beide in echten Postfächern aufgelaufen:
 *
 * 1. DIE FARBE AM `<img>` IST DIE FARBE DES ALTERNATIVTEXTES.
 *    Blockierte Bilder sind beim ersten Öffnen der Normalfall. Stand die
 *    Farbe auf der hellen Schrift der farbigen Kopfleiste, war der Name auf
 *    dem hellen Ersatzkasten eines blockierenden Programms **unsichtbar** –
 *    die Mail begann mit einer leeren Fläche. Mittleres Grau ist der
 *    Kompromiss; auf beiden Untergründen perfekt geht nicht.
 *
 * 2. EIN NAME, DER WIE EINE DOMAIN AUSSIEHT, WIRD VON GMAIL SELBST VERLINKT –
 *    blau und unterstrichen, mitten im Markenauftritt. Dagegen hilft nur, ihn
 *    selbst zu verlinken; ein eigener Link gewinnt gegen die Erkennung.
 *    Betrifft jeden Betrieb mit einem Punkt im Namen („Muster.Studio").
 *
 * Die Schriftangaben stehen AN DER ZELLE UND AM BILD: Outlook zieht sie von
 * der Zelle, andere Programme vom Bild.
 */
function markenKopf(logo?: string): string {
  const name = sicher(site.betrieb.name);
  /* Sieht der Name wie eine Domain aus? Dann selbst verlinken. */
  const wieDomain = /\.[a-z]{2,}(\s|$)/i.test(site.betrieb.name);
  const stil = `font-family:${SCHRIFT};font-size:18px;font-weight:700;`;

  if (logo) {
    return (
      `<img src="${BASIS}/${String(logo).replace(/^\//, '')}" alt="${name}" width="180" ` +
      `style="display:block;border:0;outline:none;text-decoration:none;height:auto;max-width:180px;` +
      /* Grau, NICHT die helle Schriftfarbe der Kopfleiste – siehe Falle 1. */
      `${stil}color:#6b7280;">`
    );
  }
  if (wieDomain) {
    return (
      `<a href="${BASIS}" style="${stil}color:${F.aufPrimaer};text-decoration:none;">` +
      `${name}</a>`
    );
  }
  return `<span style="${stil}color:${F.aufPrimaer};">${name}</span>`;
}

export function bestaetigungHtml(
  formular: Formular,
  daten: Record<string, string>,
  sprache: Sprache = 'de',
): string {
  const angaben = einstellung.angabenWiederholen ? ausgefuellt(formular, daten, sprache) : [];
  const pflicht = pflichtangaben();

  const kopf = markenKopf(einstellung.logo);

  const angabenBlock = angaben.length
    ? `<tr><td style="padding:0 28px 8px;font-family:${SCHRIFT};font-size:14px;color:${F.text};">
         ${satz('Das hast du uns geschickt:', 'Das haben Sie uns geschickt:', 'This is what you sent us:', sprache)}
       </td></tr>
       <tr><td style="padding:0 28px 20px;">
         <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
           ${angaben
             .map(
               (z) =>
                 `<tr>
                    <td style="padding:6px 12px 6px 0;font-family:${SCHRIFT};font-size:13px;color:${F.text};opacity:.7;vertical-align:top;white-space:nowrap;">${sicher(z.label)}</td>
                    <td style="padding:6px 0;font-family:${SCHRIFT};font-size:14px;color:${F.text};">${sicher(z.wert)}</td>
                  </tr>`,
             )
             .join('')}
         </table>
       </td></tr>`
    : `<tr><td style="padding:0 28px 20px;font-family:${SCHRIFT};font-size:13px;color:${F.text};opacity:.7;">
         ${satz(
           'Aus Datenschutzgründen wiederholen wir deine Angaben hier nicht.',
           'Aus Datenschutzgründen wiederholen wir Ihre Angaben hier nicht.',
           'For data protection reasons we do not repeat your details here.',
           sprache,
         )}
       </td></tr>`;

  return `<!doctype html>
<html lang="${sprache}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${sicher(bestaetigungBetreff(sprache))}</title>
</head>
<body style="margin:0;padding:0;background:${F.grund};">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${F.grund};">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;">

      <tr><td style="background:${F.primaer};padding:20px 28px;font-family:${SCHRIFT};">${kopf}</td></tr>

      <tr><td style="padding:28px 28px 12px;font-family:${SCHRIFT};font-size:20px;font-weight:700;color:${F.text};">
        ${satz('Danke für deine Anfrage!', 'Vielen Dank für Ihre Anfrage!', 'Thank you for your enquiry!', sprache)}
      </td></tr>
      <tr><td style="padding:0 28px 20px;font-family:${SCHRIFT};font-size:15px;line-height:1.55;color:${F.text};">
        ${satz(
          'Wir haben deine Anfrage erhalten und melden uns so bald wie möglich.',
          'Wir haben Ihre Anfrage erhalten und melden uns so bald wie möglich.',
          'We have received your enquiry and will get back to you as soon as possible.',
          sprache,
        )}
      </td></tr>

      ${angabenBlock}

      <tr><td style="padding:0 28px 24px;font-family:${SCHRIFT};font-size:14px;line-height:1.6;color:${F.text};">
        ${satz(
          'Bei Rückfragen erreichst du uns direkt:',
          'Bei Rückfragen erreichen Sie uns direkt:',
          'If you have any questions, you can reach us directly:',
          sprache,
        )}<br>
        <strong>${sicher(b.name)}</strong><br>
        ${sicher(anschrift)}<br>
        ${sicher(b.telefon)} · ${sicher(b.email)}
      </td></tr>

      ${pflicht
        ? `<tr><td style="padding:12px 28px 24px;font-family:${SCHRIFT};font-size:11px;line-height:1.5;color:${F.text};opacity:.6;">
             ${sicher(pflicht)}
           </td></tr>`
        : ''}

    </table>
  </td></tr>
</table>
</body></html>`;
}
