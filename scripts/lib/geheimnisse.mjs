/**
 * Geheimnis-Prüfung – sucht echte Zugangsschlüssel in VERSIONIERTEN Dateien.
 *
 * WARUM DAS NÖTIG IST (bei einem Piloten wirklich passiert): Der Betreiber
 * wurde gebeten, seinen Resend-Schlüssel „ins env" zu legen. Er trug ihn dort
 * ein, wo die Zeile schon stand – in `.env.example`. Diese Datei ist aber
 * bewusst VERSIONIERT (sie ist die Vorlage), und `.gitignore` schützt nur
 * `.env` und `.env.local`. Beim nächsten `git add -A` wanderte der Schlüssel
 * ins Repository und mit dem Push zu GitHub.
 *
 * Das ist kein Bedienfehler, sondern eine Falle des Motors: Zwei fast gleich
 * heißende Dateien, von denen eine geheim sein darf und die andere nicht,
 * und nichts sagt einem, welche gerade welche ist.
 *
 * Ein Schlüssel im Git-Verlauf ist auch nach dem Löschen der Zeile noch da –
 * er muss beim Anbieter zurückgezogen und neu ausgestellt werden. Deshalb
 * schlägt die Prüfung VOR dem Build an, also lange vor dem Push.
 *
 * Die Prüfung meldet nur Datei und Zeile, NIE den Wert – ein Prüfprotokoll
 * ist der falsche Ort für ein Geheimnis, das gerade geheim bleiben soll.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { extname } from 'node:path';

/** Bekannte Schlüsselformen. Absichtlich eng gefasst – ein Fehlalarm
 *  im Prüf-Tor ist teurer als eine Lücke, weil er zum Wegschauen erzieht.
 *
 *  UNTERSTRICHE MITZÄHLEN: Die erste Fassung verlangte 20 Zeichen am Stück
 *  (`re_[A-Za-z0-9]{20,}`) und ging beim echten Resend-Schlüssel vorbei – der
 *  ist zweiteilig (`re_<8 Zeichen>_<24 Zeichen>`), und nach acht Zeichen kam
 *  der Unterstrich. Die Regel war grün und der Schlüssel trotzdem im Repo. */
const MUSTER = [
  { name: 'Resend', re: /\bre_[A-Za-z0-9_]{20,}\b/ },
  { name: 'Stripe', re: /\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b/ },
  { name: 'OpenAI/Anthropic', re: /\bsk-(?:ant-)?[A-Za-z0-9_-]{24,}\b/ },
  { name: 'Google', re: /\bAIza[A-Za-z0-9_-]{30,}\b/ },
  { name: 'GitHub', re: /\b(?:ghp|gho|ghs|ghu)_[A-Za-z0-9]{30,}\b|\bgithub_pat_[A-Za-z0-9_]{30,}\b/ },
  { name: 'Slack', re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  { name: 'AWS', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'Vercel', re: /\bvercel_blob_rw_[A-Za-z0-9_]{20,}\b/ },
];

/** Wörter, die einen Wert als Vorlage ausweisen (`re_xxxxxxxx`, `<dein-key>`). */
const PLATZHALTER = /x{4,}|X{4,}|dein|deine|hier|your|changeme|beispiel|example|platzhalter|\.{3}|…|<|>/i;

/** Dateien, in denen ein Schlüssel-ähnlicher String normal ist. */
const EGAL = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg', '.ico', '.pdf', '.woff', '.woff2', '.ttf', '.zip', '.lock']);

/**
 * @param {string} wurzel Projekt-Hauptordner
 * @returns {{fehler: string[], geprueft: number}} Fehler nennen Datei + Zeile, nie den Wert.
 */
export function pruefeGeheimnisse(wurzel) {
  let dateien;
  try {
    // NUR versionierte Dateien. Was .gitignore deckt (.env, .env.local), ist
    // genau der richtige Ort für einen echten Schlüssel und darf nicht meckern.
    dateien = execFileSync('git', ['ls-files', '-z'], { cwd: wurzel, encoding: 'utf-8' })
      .split('\0')
      .filter(Boolean);
  } catch {
    return { fehler: [], geprueft: 0 }; // kein Git-Repo – dann gibt es auch nichts zu pushen
  }

  const fehler = [];
  let geprueft = 0;
  for (const rel of dateien) {
    if (EGAL.has(extname(rel).toLowerCase())) continue;
    let text;
    try {
      text = readFileSync(`${wurzel}/${rel}`, 'utf-8');
    } catch {
      continue;
    }
    if (text.includes('\0')) continue; // Binärdatei
    geprueft++;
    /* In einer .env-Datei ist JEDE Zuweisung an einen Schlüssel-Namen
       verdächtig, auch von einem Anbieter, den die Liste oben nicht kennt.
       Anderswo wäre diese Regel zu laut – dort gilt nur die enge Liste. */
    const istEnv = /(^|\/)\.env/.test(rel);
    const muster = istEnv
      ? [...MUSTER, { name: 'Zugangs', re: /(?:API_?KEY|TOKEN|SECRET|PASSWORD|PASSWORT)\s*=\s*["']?([^\s"'#]{16,})/ }]
      : MUSTER;
    const zeilen = text.split(/\r?\n/);
    for (let i = 0; i < zeilen.length; i++) {
      for (const { name, re } of muster) {
        const treffer = zeilen[i].match(re);
        // Bei der generischen Regel zählt der WERT, nicht die ganze Zuweisung –
        // sonst schluckt „API_KEY=" schon das Wort „KEY" als Platzhalter-Beleg.
        if (!treffer || PLATZHALTER.test(treffer[1] ?? treffer[0])) continue;
        fehler.push(
          `${rel}:${i + 1}: sieht aus wie ein echter ${name}-Zugangsschlüssel – und diese Datei ist versioniert.\n` +
            `    Echte Schlüssel gehören in .env.local (von .gitignore gedeckt) und zum Hoster\n` +
            `    (npx vercel env add <NAME> production). In versionierte Dateien gehört nur die Vorlage.\n` +
            `    Steht der Schlüssel schon in einem Commit, muss er beim Anbieter ZURÜCKGEZOGEN und\n` +
            `    neu ausgestellt werden – aus dem Git-Verlauf verschwindet er durch Löschen nicht.`,
        );
        break; // eine Meldung je Zeile genügt
      }
    }
  }
  return { fehler, geprueft };
}
