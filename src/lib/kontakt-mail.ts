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
function ausgefuellt(formular: Formular, daten: Record<string, string>) {
  const zeilen: { label: string; wert: string }[] = [];
  for (const feld of formular.felder) {
    const wert = (daten[feld.name] ?? '').trim();
    if (wert) zeilen.push({ label: feld.label, wert: wert.slice(0, MAX_WERT) });
  }
  const bezug = (daten.bezug ?? '').trim();
  if (bezug) zeilen.push({ label: 'Ihre Auswahl', wert: bezug.slice(0, MAX_WERT) });
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
    r.rechtsform,
    r.sitz && `Sitz: ${r.sitz}`,
    r.firmenbuchnummer && `Firmenbuch ${r.firmenbuchnummer}`,
    r.firmenbuchgericht,
    r.uid && `UID ${r.uid}`,
  ]
    .filter(Boolean)
    .join(' · ');
}

/** Der Betreff – aus Sicht des ABSENDERS, nicht des Betriebs. */
export function bestaetigungBetreff(): string {
  return einstellung.betreff ?? `Ihre Anfrage bei ${b.name}`;
}

const anschrift = `${b.adresse.strasse}, ${b.adresse.plz} ${b.adresse.ort}`;

/* --------------------------------------------------------------------------
 *  TEXTFASSUNG – geht immer, auch im ältesten Mailprogramm.
 * ----------------------------------------------------------------------- */
export function bestaetigungText(formular: Formular, daten: Record<string, string>): string {
  const zeilen: string[] = [
    duzen ? 'Danke für deine Anfrage!' : 'Vielen Dank für Ihre Anfrage!',
    '',
    duzen
      ? 'Wir haben deine Anfrage erhalten und melden uns so bald wie möglich.'
      : 'Wir haben Ihre Anfrage erhalten und melden uns so bald wie möglich.',
    '',
  ];

  if (einstellung.angabenWiederholen) {
    zeilen.push(duzen ? 'Das hast du uns geschickt:' : 'Das haben Sie uns geschickt:', '');
    for (const z of ausgefuellt(formular, daten)) zeilen.push(`${z.label}: ${z.wert}`);
    zeilen.push('');
  } else {
    zeilen.push(
      duzen
        ? 'Aus Datenschutzgründen wiederholen wir deine Angaben hier nicht.'
        : 'Aus Datenschutzgründen wiederholen wir Ihre Angaben hier nicht.',
      '',
    );
  }

  zeilen.push(
    duzen ? 'Bei Rückfragen erreichst du uns direkt:' : 'Bei Rückfragen erreichen Sie uns direkt:',
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

export function bestaetigungHtml(formular: Formular, daten: Record<string, string>): string {
  const angaben = einstellung.angabenWiederholen ? ausgefuellt(formular, daten) : [];
  const pflicht = pflichtangaben();

  /* Der Kopf: Logo, wenn eines eingetragen ist – sonst der Name als Text.
     Die Schriftangaben stehen AN DER ZELLE UND AM BILD: Outlook zieht sie von
     der Zelle, andere Programme vom Bild. Blockierte Bilder sind beim ersten
     Öffnen der Normalfall, und dann muss der Alternativtext wie eine Wortmarke
     aussehen statt wie ein kaputtes Bild. */
  const kopf = einstellung.logo
    ? `<img src="${BASIS}/${String(einstellung.logo).replace(/^\//, '')}" alt="${sicher(b.name)}" width="180" ` +
      `style="display:block;border:0;outline:none;text-decoration:none;height:auto;max-width:180px;` +
      `font-family:${SCHRIFT};font-size:18px;font-weight:700;color:${F.aufPrimaer};">`
    : `<span style="font-family:${SCHRIFT};font-size:18px;font-weight:700;color:${F.aufPrimaer};">${sicher(b.name)}</span>`;

  const angabenBlock = angaben.length
    ? `<tr><td style="padding:0 28px 8px;font-family:${SCHRIFT};font-size:14px;color:${F.text};">
         ${duzen ? 'Das hast du uns geschickt:' : 'Das haben Sie uns geschickt:'}
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
         ${duzen
           ? 'Aus Datenschutzgründen wiederholen wir deine Angaben hier nicht.'
           : 'Aus Datenschutzgründen wiederholen wir Ihre Angaben hier nicht.'}
       </td></tr>`;

  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${sicher(bestaetigungBetreff())}</title>
</head>
<body style="margin:0;padding:0;background:${F.grund};">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${F.grund};">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;">

      <tr><td style="background:${F.primaer};padding:20px 28px;font-family:${SCHRIFT};">${kopf}</td></tr>

      <tr><td style="padding:28px 28px 12px;font-family:${SCHRIFT};font-size:20px;font-weight:700;color:${F.text};">
        ${duzen ? 'Danke für deine Anfrage!' : 'Vielen Dank für Ihre Anfrage!'}
      </td></tr>
      <tr><td style="padding:0 28px 20px;font-family:${SCHRIFT};font-size:15px;line-height:1.55;color:${F.text};">
        ${duzen
          ? 'Wir haben deine Anfrage erhalten und melden uns so bald wie möglich.'
          : 'Wir haben Ihre Anfrage erhalten und melden uns so bald wie möglich.'}
      </td></tr>

      ${angabenBlock}

      <tr><td style="padding:0 28px 24px;font-family:${SCHRIFT};font-size:14px;line-height:1.6;color:${F.text};">
        ${duzen ? 'Bei Rückfragen erreichst du uns direkt:' : 'Bei Rückfragen erreichen Sie uns direkt:'}<br>
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
