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

      // 1) Feiertag / Betriebsurlaub schlägt den Wochenrhythmus.
      const sonder = plan.sonder.find((s) => datum >= s.von && datum <= s.bis);
      if (sonder) {
        const offen =
          sonder.vonISO && sonder.bisISO &&
          minuten >= zuMinuten(sonder.vonISO) && minuten < zuMinuten(sonder.bisISO);
        el.textContent = offen
          ? `${plan.texte.offen} · ${plan.texte.heute} ${sonder.zeit}`
          : `${plan.texte.geschlossen}${sonder.anlass ? ` · ${sonder.anlass}` : ''}`;
        el.classList.toggle('ist-offen', !!offen);
        el.classList.toggle('ist-geschlossen', !offen);
        return;
      }

      // 2) Normaler Wochenrhythmus.
      const heuteOffen = plan.fenster.find(
        (f) => f.tag === tag && minuten >= zuMinuten(f.von) && minuten < zuMinuten(f.bis),
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
