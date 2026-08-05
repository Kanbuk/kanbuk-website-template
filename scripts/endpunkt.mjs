/**
 * `npm run endpunkt` – RUFT DEN FORMULAR-EMPFÄNGER WIRKLICH AN.
 *
 * =============================================================================
 *  WARUM ES DAS GIBT
 * =============================================================================
 * In einem Kundenprojekt war der Formular-Empfänger an EINEM Tag zweimal tot,
 * und beide Male waren alle Prüfungen grün:
 *
 *   • Ein Import ohne `.js`-Endung in `content.config.ts`. Beim Bauen der
 *     Seiten egal – der Server baut aber als Node-ESM.
 *   • `import.meta.glob` in einer Datei, die über `content.config.ts` im
 *     Server-Bündel landet. Diese Funktion gibt es nur im Bau-Werkzeug.
 *
 * Beide Male dieselbe Ursache in anderem Gewand: **Der Server läuft nach
 * anderen Regeln als der Bau, und keine Prüfung sah ihn je an.** Die
 * bestehenden Tore lesen seinen Quelltext nach Stichworten durch – das findet
 * keinen Fehler, der erst beim EINLESEN des Moduls entsteht.
 *
 * In der Vorschau fällt es nicht auf, weil das Formular dort bewusst nichts
 * abschickt. Es wird also erst nach dem Umschalten scharf – und fällt dann
 * dadurch auf, dass wochenlang keine Anfrage kommt. Bei einem Betrieb, der
 * bewusst keine Telefonnummer veröffentlicht, ist das Formular DER Weg; der
 * Ausfall ist dann existenziell und wird erst am ausbleibenden Umsatz bemerkt.
 *
 * =============================================================================
 *  WAS GEPRÜFT WIRD – UND WAS AUSDRÜCKLICH NICHT
 * =============================================================================
 * Nur, ob der Empfänger überhaupt LEBT. Es wird KEINE Anfrage abgeschickt und
 * keine E-Mail ausgelöst – dafür genügen zwei Anfragen, die er von sich aus
 * abweisen muss:
 *
 *   • Ein GET (er nimmt nur POST) muss 405 antworten, nicht 500.
 *   • Ein POST mit falschem Format muss 415 antworten, nicht 500.
 *
 * Eine 500 heißt: Das Modul ist beim Einlesen gestorben. Genau das soll diese
 * Prüfung fangen. Eine saubere Abweisung heißt: Er läuft.
 *
 * NICHT geprüft wird, ob eine echte Anfrage ankommt – dafür müsste eine Mail
 * ausgelöst werden. Das bleibt der Testanfrage nach dem Live-Gang vorbehalten
 * (Lücken-Inventar, Rubrik „Nach dem Live-Gang").
 *
 *     npm run endpunkt                    (gegen die Vorschau bzw. die Domain)
 *     npm run endpunkt -- --url <adresse> (gegen eine andere Adresse)
 */
import { readFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const wert = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};

/** Die Adressen aus der Config: die eigentliche und die Ausweich-Adresse. */
function adressen() {
  const t = readFileSync('content.config.ts', 'utf-8');
  const vorschau = t.match(/vorschauDomain:\s*'([^']+)'/)?.[1];
  const domain = t.match(/^\s*domain:\s*'([^']+)'/m)?.[1];
  const live = /mode:\s*'live'/.test(t);
  return live ? { ziel: domain, ausweich: vorschau } : { ziel: vorschau ?? domain, ausweich: undefined };
}

const vorgabe = adressen();
let basis = (wert('--url') ?? vorgabe.ziel ?? '').replace(/\/$/, '');
if (!basis) {
  console.error(
    '\n✗ Keine Adresse gefunden.\n\n' +
      '  Erwartet wird `domain` in content.config.ts (live) bzw. `vorschauDomain`\n' +
      '  (Vorschau). Oder von Hand: npm run endpunkt -- --url <adresse>\n',
  );
  process.exit(1);
}

/**
 * VOR DEM UMSTELLTAG ZEIGT DIE KUNDENDOMAIN NOCH AUF DEN ALTEN SERVER.
 *
 * Dann gibt es dort keinen Formular-Empfänger, und die Prüfung bekäme eine
 * 404 – sie würde also rot melden, obwohl nichts kaputt ist. Genau die Sorte
 * Fehlalarm, die dazu erzieht, ein rotes Tor zu übergehen.
 *
 * Deshalb: Sieht die Adresse aus, als liefe dort noch etwas Fremdes, wird auf
 * die Vorschau-Adresse ausgewichen und das im Klartext gesagt. Geprüft wird
 * dann, was tatsächlich ausgeliefert wird – und am Umstelltag greift die
 * eigentliche Adresse von selbst.
 */
if (!wert('--url') && vorgabe.ausweich) {
  const probe = await fetch(`${basis}/api/contact`, {
    method: 'POST',
    headers: { 'content-type': 'text/plain' },
    body: 'x',
  })
    .then((r) => r.status)
    .catch(() => 0);
  if (probe === 404 || probe === 0) {
    console.log(
      `Hinweis: ${basis} liefert unter /api/contact nichts aus –\n` +
        '  die Domain zeigt also noch auf den alten Server. Geprüft wird\n' +
        `  stattdessen ${vorgabe.ausweich}. Nach dem Umhängen der DNS-Einträge\n` +
        '  diese Prüfung erneut fahren.\n',
    );
    basis = vorgabe.ausweich.replace(/\/$/, '');
  }
}

const ziel = `${basis}/api/contact`;
console.log(`Formular-Empfänger anrufen: ${ziel}\n`);

let fehler = 0;

async function pruefe(name, aufruf, erwartet, erklaerung) {
  let antwort;
  try {
    antwort = await aufruf();
  } catch (e) {
    console.error(`  ✗ ${name}: keine Antwort (${e.message})`);
    fehler++;
    return;
  }
  const ok = erwartet.includes(antwort.status);
  console.log(
    `  ${ok ? '✓' : '✗'} ${name}: HTTP ${antwort.status}` +
      (ok ? '' : `  – erwartet ${erwartet.join(' oder ')}`),
  );
  if (!ok) {
    fehler++;
    if (antwort.status >= 500) {
      console.error(
        `\n    ${erklaerung}\n` +
          '    Eine 500 heißt fast immer: Das Modul stirbt beim EINLESEN.\n' +
          '    Typische Ursachen, beide schon vorgekommen:\n' +
          '      • ein Import ohne `.js`-Endung (der Server baut als Node-ESM)\n' +
          '      • etwas, das es nur im Bau-Werkzeug gibt (z. B. import.meta.glob)\n' +
          '    Den genauen Grund nennt das Protokoll des Hosters:\n' +
          `      npx vercel logs ${basis}\n`,
      );
    }
  }
}

await pruefe(
  'GET wird abgewiesen',
  () => fetch(ziel, { method: 'GET' }),
  [405, 404],
  'Der Empfänger sollte GET mit 405 abweisen.',
);

await pruefe(
  'POST mit falschem Format wird abgewiesen',
  () => fetch(ziel, { method: 'POST', headers: { 'content-type': 'text/plain' }, body: 'x' }),
  [415],
  'Der Empfänger sollte ein unbekanntes Format mit 415 abweisen.',
);

console.log('');
if (fehler > 0) {
  console.error(`✗ Der Formular-Empfänger antwortet nicht wie erwartet (${fehler} Prüfung(en) rot).`);
  console.error('  Solange das so ist, geht KEINE Anfrage des Betriebs durch.\n');
  process.exit(1);
}
console.log('✓ Der Formular-Empfänger lebt und weist unsinnige Anfragen sauber ab.');
console.log('  (Es wurde nichts abgeschickt und keine E-Mail ausgelöst.)\n');
