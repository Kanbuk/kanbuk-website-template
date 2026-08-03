/**
 * ÖFFNUNGS-STATUS – „Jetzt geöffnet · bis 22:00" / „Geschlossen · öffnet Mo 08:00"
 *
 * WARUM DAS IM MOTOR STEHT: Fast jedes Design zeigt diesen Satz im Kopfbereich.
 * Als fester Text ist er falsch, sobald jemand um 3 Uhr früh auf die Seite
 * kommt – und bei einem Feiertag den ganzen Tag. Bisher baute ihn jeder Klon
 * neu nach, jedes Mal ohne Feiertags-Logik.
 *
 * Markup:
 *   <span data-oeffnungsstatus></span>
 *
 * Die Zeiten kommen als JSON im Attribut `data-zeiten` (setzt die Komponente
 * Oeffnungsstatus.astro). Rechnet in der ZEITZONE DES BETRIEBS, nicht in der
 * des Besuchers – ein Gast aus München soll dieselbe Auskunft bekommen wie
 * einer aus Wien.
 *
 * Vergibt die Zustandsklassen `.ist-offen` / `.ist-geschlossen`; das Aussehen
 * bestimmt das Design. Ohne JS bleibt der im HTML gerenderte Stand stehen
 * (Bauzeitpunkt) – nie eine leere Fläche.
 */
interface Fenster {
  /** 0 = Sonntag … 6 = Samstag */
  tag: number;
  von: string;
  bis: string;
}
interface Sonderfenster {
  von: string;
  bis: string;
  zeit: string;
  anlass?: string;
  vonISO?: string;
  bisISO?: string;
}
interface Zeitplan {
  zeitzone: string;
  fenster: Fenster[];
  sonder: Sonderfenster[];
  texte: { offen: string; geschlossen: string; oeffnet: string; heute: string };
}

const TAGE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

/** Datum/Uhrzeit im Betriebs-Zeitzonen-Kontext (statt in der des Besuchers). */
function jetztIn(zeitzone: string): { datum: string; tag: number; minuten: number } {
  const jetzt = new Date();
  const teile = new Intl.DateTimeFormat('en-CA', {
    timeZone: zeitzone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', weekday: 'short', hour12: false,
  }).formatToParts(jetzt);
  const hol = (t: string) => teile.find((p) => p.type === t)?.value ?? '';
  const wochentage: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    datum: `${hol('year')}-${hol('month')}-${hol('day')}`,
    tag: wochentage[hol('weekday')] ?? 0,
    minuten: Number(hol('hour')) * 60 + Number(hol('minute')),
  };
}

/*
 * Ausgeschrieben statt `const [h, m] = …` - siehe die ausfuehrliche
 * Begruendung in `filter.ts`: Diese eine Schreibweise kann der Uebersetzer
 * nicht in eine aeltere umwandeln, und sie allein macht das GESAMTE
 * Skriptbuendel fuer aeltere Browser unlesbar.
 */
const zuMinuten = (hhmm: string) => {
  const teile = hhmm.split(':');
  const stunde = Number(teile[0]);
  const minute = Number(teile[1]);
  return stunde * 60 + (minute || 0);
};

export function oeffnungsstatusStarten(): void {
  document.querySelectorAll<HTMLElement>('[data-oeffnungsstatus]').forEach((el) => {
    let plan: Zeitplan;
    try {
      plan = JSON.parse(el.dataset.zeiten ?? '');
    } catch {
      return; // ohne Daten bleibt der gerenderte Stand stehen
    }

    function zeige() {
      const jetzt = jetztIn(plan.zeitzone);
      const datum = jetzt.datum;
      const tag = jetzt.tag;
      const minuten = jetzt.minuten;

      /* Ein Fenster mit `bis <= von` läuft über Mitternacht. Die Rechnung steht
         hier oben, weil sie an ZWEI Stellen gebraucht wird – bei den
         Sonderzeiten und beim Wochenrhythmus. Genau daran ist sie beim ersten
         Mal gescheitert: Sie stand nur beim Wochenrhythmus, und die
         Sonderzeiten behielten den Fehler. */
      const laeuftUeberNacht = (von: string, bis: string) => zuMinuten(bis) <= zuMinuten(von);

      // 1) Feiertag / Betriebsurlaub schlägt den Wochenrhythmus.
      const sonder = plan.sonder.find((s) => datum >= s.von && datum <= s.bis);
      if (sonder) {
        /* AUCH EINE SONDERZEIT LÄUFT ÜBER MITTERNACHT – und ausgerechnet die
           wichtigste tut es immer: Silvester 18:00–02:00. Hier stand
           `minuten >= von && minuten < bis`; das ist bei 1080 <= m < 120 zu
           keiner Minute wahr. Ein Wiener Lokal zeigte damit den ganzen
           Silvesterabend „Geschlossen · Silvester" im Kopf jeder Seite – zur
           besten Geschäftszeit des Jahres, und durch den Anlass-Zusatz sah es
           auch noch nach Absicht aus.

           Der Fehler ist derselbe, der beim Wochenrhythmus zwei Absätze weiter
           unten ausführlich beschrieben und behoben wurde. Er blieb hier
           stehen, weil die Reparatur nur die Stelle angefasst hat, an der er
           aufgefallen war. */
        let offen = false;
        if (sonder.vonISO && sonder.bisISO) {
          const von = zuMinuten(sonder.vonISO);
          const bis = zuMinuten(sonder.bisISO);
          offen = laeuftUeberNacht(sonder.vonISO, sonder.bisISO)
            ? minuten >= von || minuten < bis
            : minuten >= von && minuten < bis;
        }
        /* SCHLUSSZEIT, NICHT DIE GANZE SPANNE. Hier stand `sonder.zeit` – das
           ist der Anzeigetext des Betriebs, also „09:00–15:00". Zusammen mit
           `texte.heute` („bis") entstand daraus „Jetzt geöffnet · bis
           09:00–15:00". Der Wochenrhythmus unten nimmt richtig `.bis`. */
        el.textContent = offen
          ? `${plan.texte.offen} · ${plan.texte.heute} ${sonder.bisISO}`
          : `${plan.texte.geschlossen}${sonder.anlass ? ` · ${sonder.anlass}` : ''}`;
        el.classList.toggle('ist-offen', !!offen);
        el.classList.toggle('ist-geschlossen', !offen);
        return;
      }

      /* 2) Normaler Wochenrhythmus – EINSCHLIESSLICH DER FENSTER ÜBER
            MITTERNACHT.

         Hier stand nur `minuten >= von && minuten < bis`. Bei einem Fenster
         von 18:00 bis 02:00 ist das zu KEINER Minute wahr: 1080 <= m < 120
         gibt es nicht. Ergebnis: „Geschlossen" den ganzen Abend – bei einem
         Wiener Lokal mit Sperrstunde nach Mitternacht also zur
         Hauptgeschäftszeit, im Kopf jeder Seite.

         Das ist keine Randlage: Gastronomie ist die Leitbranche des Motors,
         und der Kopfkommentar dieser Datei begründet den Baustein
         ausgerechnet damit, dass ein fester Text „falsch ist, sobald jemand
         um 3 Uhr früh auf die Seite kommt".

         Ein Fenster mit `bis <= von` läuft über Mitternacht. Es gilt dann
         zweimal: heute ab `von`, und am FOLGETAG bis `bis`.
         (`laeuftUeberNacht` steht weiter oben – die Sonderzeiten brauchen
         dieselbe Rechnung.) */
      const gestern = (tag + 6) % 7;
      const heuteOffen =
        plan.fenster.find((f) => {
          if (f.tag !== tag) return false;
          const von = zuMinuten(f.von);
          const bis = zuMinuten(f.bis);
          return laeuftUeberNacht(f.von, f.bis) ? minuten >= von : minuten >= von && minuten < bis;
        }) ??
        // Der Ausläufer von gestern: Es ist 01:30 und gestern galt 18:00–02:00.
        plan.fenster.find(
          (f) => f.tag === gestern && laeuftUeberNacht(f.von, f.bis) && minuten < zuMinuten(f.bis),
        );
      if (heuteOffen) {
        el.textContent = `${plan.texte.offen} · ${plan.texte.heute} ${heuteOffen.bis}`;
        el.classList.add('ist-offen');
        el.classList.remove('ist-geschlossen');
        return;
      }

      // 3) Geschlossen – wann geht es weiter? (bis zu 7 Tage vorausschauen)
      let naechstes: { tag: number; von: string } | null = null;
      for (let i = 0; i < 8 && !naechstes; i++) {
        const pruefTag = (tag + i) % 7;
        const kandidaten = plan.fenster
          .filter((f) => f.tag === pruefTag && (i > 0 || zuMinuten(f.von) > minuten))
          .sort((a, b) => zuMinuten(a.von) - zuMinuten(b.von));
        if (kandidaten[0]) naechstes = { tag: pruefTag, von: kandidaten[0].von };
      }
      el.textContent = naechstes
        ? `${plan.texte.geschlossen} · ${plan.texte.oeffnet} ${
            naechstes.tag === tag ? '' : `${TAGE[naechstes.tag]} `
          }${naechstes.von}`
        : plan.texte.geschlossen;
      el.classList.add('ist-geschlossen');
      el.classList.remove('ist-offen');
    }

    zeige();
    // Minütlich nachziehen – wer die Seite offen lässt, sieht keinen alten Stand.
    setInterval(zeige, 60_000);
  });
}
