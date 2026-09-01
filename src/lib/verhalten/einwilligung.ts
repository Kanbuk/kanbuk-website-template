/**
 * =============================================================================
 *  EINWILLIGUNG – die Schleuse für Tracking, Pixel und Einbettungen
 * =============================================================================
 *  WICHTIG: Standardmäßig ist NICHTS davon aktiv. Ohne konfigurierte Dienste
 *  rendert der Motor keinen Banner, lädt nichts nach und setzt nichts – die
 *  Seite bleibt cookiefrei (das ist ein Verkaufsargument, kein Zufall).
 *
 *  Sobald ein Dienst in content.config.ts -> dienste eingetragen ist, gilt:
 *
 *  OPT-IN, NICHT OPT-OUT. Vor der Zustimmung wird KEIN fremdes Skript geladen,
 *  kein Cookie gesetzt, kein Request nach draußen gemacht. Weiterscrollen oder
 *  Wegklicken ist KEINE Zustimmung (DSGVO, EuGH „Planet49").
 *
 *  So funktioniert die Schleuse:
 *    <script type="text/plain" data-einwilligung="marketing" src="…"></script>
 *  Ein <script type="text/plain"> führt der Browser NICHT aus. Erst nach dem
 *  Ja tauscht dieses Modul es gegen ein echtes <script> – vorher passiert nichts.
 *
 *  Die Wahl liegt in localStorage (kein Cookie – nichts wird mitgesendet).
 *
 *  Das AUSSEHEN des Banners kommt aus dem Design. Hier steht nur die Mechanik.
 * =============================================================================
 */

export type Kategorie = 'notwendig' | 'funktional' | 'statistik' | 'marketing';

const SCHLUESSEL = 'kanbuk-einwilligung';

/**
 * Die Kennung der Dienste-Liste – sie steht im Markup, nicht hier.
 *
 * FRÜHER STAND HIER `const VERSION = 1` mit dem Kommentar „hochzählen, wenn
 * sich die Dienste ändern (Pflicht)". Nichts erzwang das: Die Dienste stehen
 * in content.config.ts, die Zahl stand hier – und beim Ausbau öffnet niemand
 * eine Baustein-Datei. In einem Kundenprojekt wurde ein Dienst eingetragen und
 * später sein Zweck geändert; die Zahl blieb beide Male auf 1. Die
 * Datenschutzerklärung versprach derweil wörtlich, bei geänderter Liste erneut
 * zu fragen.
 *
 * Jetzt rechnet der Build die Kennung aus der Liste (siehe `diensteKennung`)
 * und schreibt sie an den Banner. Ändert sich ein Dienst, passt der
 * gespeicherte Stand nicht mehr – und es wird automatisch neu gefragt.
 */
function standKennung(): string {
  return document.querySelector<HTMLElement>('[data-einwilligung-stand]')?.dataset.einwilligungStand ?? '';
}

interface Zustand {
  stand: string;
  zeitpunkt: string;
  erlaubt: Kategorie[];
}

/* RÜCKFALL FÜR DIESE SITZUNG, wenn der Speicher des Browsers nicht mitspielt.

   HIER STAND NUR EIN KOMMENTAR MIT DIESER BEHAUPTUNG – und sie stimmte nicht.
   Schlug `localStorage` fehl (privater Modus, Website-Daten blockiert, manche
   In-App-Browser), wurde der Fehler abgefangen und der Zustand war weg. Direkt
   danach fragt `setzen()` über `erlaubt()` wieder den Speicher ab, findet
   nichts – und gibt weder die geparkten Skripte noch die Karte frei. Der
   Besucher drückt „Alle akzeptieren", und es passiert sichtbar NICHTS. Das
   sieht nach kaputt aus, und der Banner kommt beim nächsten Klick wieder.

   Mit dieser Variable gilt die Wahl wenigstens für diese Sitzung – also genau
   das, was der Kommentar schon immer versprochen hat. */
let imGedaechtnis: Zustand | null = null;

function lesen(): Zustand | null {
  let z: Zustand | null = null;
  try {
    const roh = localStorage.getItem(SCHLUESSEL);
    if (roh) z = JSON.parse(roh) as Zustand;
  } catch {
    /* siehe oben – dann zählt nur, was in dieser Sitzung entschieden wurde */
  }
  if (!z) z = imGedaechtnis;
  if (!z) return null;
  // Dienste haben sich geändert -> die alte Zustimmung gilt nicht mehr.
  if (z.stand !== standKennung()) return null;
  return z;
}

function schreiben(erlaubt: Kategorie[]) {
  const zustand: Zustand = {
    stand: standKennung(),
    zeitpunkt: new Date().toISOString(),
    erlaubt,
  };
  imGedaechtnis = zustand;
  try {
    localStorage.setItem(SCHLUESSEL, JSON.stringify(zustand));
  } catch {
    /* Privater Modus o. Ä. – die Wahl gilt dank `imGedaechtnis` für diese
       Sitzung, aber nicht darüber hinaus. Das ist die richtige Reaktion:
       Ohne Speicher lässt sich eine Entscheidung nicht aufbewahren, und
       raten wäre schlechter als noch einmal fragen. */
  }
}

/** Ist diese Kategorie erlaubt? "notwendig" immer. */
export function erlaubt(kategorie: Kategorie): boolean {
  if (kategorie === 'notwendig') return true;
  return lesen()?.erlaubt.includes(kategorie) ?? false;
}

/** Wartet auf die Freigabe einer Kategorie (auch nachträglich). */
export function beiFreigabe(kategorie: Kategorie, tuwas: () => void): void {
  if (erlaubt(kategorie)) {
    tuwas();
    return;
  }
  document.addEventListener('einwilligung:geaendert', () => {
    if (erlaubt(kategorie)) tuwas();
  });
}

/**
 * Gibt die geparkten <script type="text/plain" data-einwilligung="…"> frei.
 * Erst hier entsteht ein echtes <script> – vorher war es toter Text.
 */
function skripteFreigeben() {
  document.querySelectorAll<HTMLScriptElement>('script[type="text/plain"][data-einwilligung]').forEach((alt) => {
    const kategorie = alt.dataset.einwilligung as Kategorie;
    if (!erlaubt(kategorie)) return;

    const neu = document.createElement('script');
    for (const attr of Array.from(alt.attributes)) {
      if (attr.name === 'type' || attr.name === 'data-einwilligung') continue;
      neu.setAttribute(attr.name, attr.value);
    }
    if (!alt.src) neu.textContent = alt.textContent;
    alt.replaceWith(neu);
  });
}

/** Wahl speichern, Schleuse öffnen, Banner schließen, Rest informieren. */
function setzen(erlaubteKategorien: Kategorie[]) {
  schreiben(erlaubteKategorien);
  skripteFreigeben();
  document.querySelectorAll('[data-einwilligung-banner]').forEach((b) => ((b as HTMLElement).hidden = true));
  document.dispatchEvent(new CustomEvent('einwilligung:geaendert', { detail: { erlaubt: erlaubteKategorien } }));
}

/**
 * Widerruf – rechtlich Pflicht: Die Zustimmung muss so einfach zurückziehbar
 * sein, wie sie erteilt wurde. Der Datenschutz-Link ruft das auf.
 * Nach dem Widerruf wird neu geladen, damit bereits geladene Skripte weg sind.
 */
export function widerrufen(): void {
  /* Auch den Sitzungs-Rückfall leeren – sonst gilt die widerrufene Wahl im
     privaten Modus einfach weiter. */
  imGedaechtnis = null;
  try {
    localStorage.removeItem(SCHLUESSEL);
  } catch {
    /* egal */
  }
  fremdeCookiesLoeschen();
  location.reload();
}

/**
 * Löscht die Cookies, die freigegebene Dienste gesetzt haben.
 *
 * WARUM DAS NICHT OPTIONAL IST – an einer laufenden Kundenseite nachgemessen
 * (01.09.2026, Chromium): Nach dem Widerruf lag `_ga` unverändert weiter auf
 * dem Gerät, Ablauf dreizehn Monate in der Zukunft. Es ging bei JEDEM Aufruf
 * wieder an den eigenen Server mit – auch beim Absenden des Formulars. Und
 * stimmte derselbe Besucher Wochen später erneut zu, nahm Google **dieselbe
 * Kennung** wieder auf und zählte ihn als bereits bekannt. Der Widerruf hatte
 * die Wiedererkennung also gar nicht beendet.
 *
 * Die Datenschutzerklärung sagt an zwei Stellen etwas anderes: „ohne
 * Einwilligung werden keine Cookies gesetzt" und „jederzeit mit Wirkung für
 * die Zukunft widerrufbar". Das eine war richtig, das andere nicht.
 *
 * ALLE LÖSCHEN, NICHT EINE LISTE PFLEGEN. Der Motor selbst setzt kein einziges
 * Cookie – das ist die Zusage aus CLAUDE.md Abschnitt 2. Was hier liegt, kann
 * deshalb nur von einem eingewilligten Dienst stammen. Eine Namensliste
 * (`_ga`, `_fbp`, `_hj…`) wäre beim nächsten Dienst wieder unvollständig, und
 * niemand würde es merken.
 *
 * DREI VERSUCHE JE COOKIE, weil ein Cookie nur mit DERSELBEN Domain und
 * demselben Pfad gelöscht werden kann, mit denen es gesetzt wurde – und was
 * das war, verrät `document.cookie` nicht. Google setzt `_ga` auf der Domain
 * mit führendem Punkt (`.betrieb.at`), damit es auf allen Unterdomains gilt.
 * Wer nur ohne Domain löscht, löscht nichts und merkt davon nichts.
 *
 * Was hier NICHT gelöscht werden kann: Cookies mit `HttpOnly`. Die sind für
 * JavaScript unsichtbar – der Motor setzt keine, und ein eingebetteter Dienst
 * kann sie nur auf SEINER eigenen Domain setzen, nicht auf dieser.
 */
function fremdeCookiesLoeschen(): void {
  try {
    const teile = document.cookie ? document.cookie.split(';') : [];
    const host = location.hostname;
    /* `example.co.uk` würde hier zu `.co.uk` – das lehnt der Browser ab, und
       mehr passiert nicht. Der Versuch ohne Domain und der mit dem vollen Host
       greifen weiterhin. Eine Liste aller mehrteiligen Länderendungen wäre
       Ballast für einen Fall, den es hier nicht gibt. */
    const punkte = host.split('.');
    const oben = punkte.length > 2 ? '.' + punkte.slice(-2).join('.') : '.' + host;
    const bereiche = ['', '; domain=' + host, '; domain=' + oben];

    for (let i = 0; i < teile.length; i++) {
      const name = teile[i].split('=')[0].trim();
      if (!name) continue;
      for (let j = 0; j < bereiche.length; j++) {
        document.cookie = name + '=; Max-Age=0; path=/' + bereiche[j];
      }
    }
  } catch {
    /* Ein Widerruf darf nie an einer Nebensache scheitern. */
  }
}

/**
 * Startet die Einwilligungs-Verwaltung.
 *
 * Markup (Aussehen kommt aus dem Design):
 *   <div data-einwilligung-banner hidden>
 *     <button data-einwilligung-alle>Alle akzeptieren</button>
 *     <button data-einwilligung-nur-notwendig>Nur notwendige</button>
 *     <button data-einwilligung-auswahl>Auswahl speichern</button>   (optional)
 *     <input type="checkbox" data-einwilligung-kategorie="statistik"> (optional)
 *   </div>
 *   <button data-einwilligung-widerruf>Einwilligung widerrufen</button>
 */
export function einwilligungStarten(): void {
  // Widerruf-Knöpfe funktionieren immer (auch ohne Banner auf der Seite).
  document.querySelectorAll<HTMLElement>('[data-einwilligung-widerruf]').forEach((k) => {
    k.addEventListener('click', (e) => {
      e.preventDefault();
      widerrufen();
    });
  });

  const banner = document.querySelector<HTMLElement>('[data-einwilligung-banner]');
  if (!banner) {
    // Kein Banner = keine Dienste konfiguriert = nichts zu tun.
    return;
  }

  const zustand = lesen();

  /* NACHRÄUMEN BEIM START, WENN KEINE ZUSTIMMUNG (MEHR) VORLIEGT.
     -------------------------------------------------------------------
     Der Widerruf löscht die Cookies der Dienste sofort – und trotzdem blieb
     an der Live-Seite genau eines liegen: das Sitzungs-Cookie von Google
     (`_ga_<Kennung>`). Der Grund ist ein Wettlauf, den man nicht gewinnen
     kann: Zwischen dem Löschen und dem `location.reload()` läuft das
     Google-Skript noch und schreibt es einfach neu. Das Kennungs-Cookie
     (`_ga`) wird seltener geschrieben und war deshalb weg – das eine blieb,
     das andere nicht. Ein halber Widerruf sieht aus wie ein ganzer.

     Hier ist der Wettlauf vorbei: Die Seite ist neu geladen, es liegt keine
     Zustimmung vor, also läuft auch kein Dienst mehr, der etwas neu setzen
     könnte. Was jetzt noch da ist, ist ein Rest von vorher.

     Das deckt zugleich zwei Fälle mit ab, die der Widerruf gar nicht sieht:
     einen Besucher, der seine Auswahl selbst aus dem Browser gelöscht hat,
     und eine Zustimmung, die durch geänderte Dienste ungültig geworden ist
     (`standKennung`). In beiden Fällen wird neu gefragt – und dann dürfen
     auch keine alten Cookies mehr liegen. */
  if (!zustand) fremdeCookiesLoeschen();

  if (zustand) {
    // Schon entschieden: Banner bleibt weg, erlaubte Skripte starten.
    banner.hidden = true;
    skripteFreigeben();
    return;
  }

  banner.hidden = false;

  /* WELCHE KATEGORIEN NUTZT DIESE SEITE ÜBERHAUPT?
     Hier standen nur die geparkten Skripte (`[data-einwilligung]`). Eine
     2-Klick-Einbettung trägt ihre Kategorie aber in
     `data-einbettung-kategorie` – die kam in dieser Liste nicht vor.

     Folge: „Alle akzeptieren" gab die Kategorie einer Einbettung NIE frei.
     Ein Wirt mit Google-Karte auf der Kontaktseite und einem eingetragenen
     Dienst hatte damit einen Baustein, der auf eine Freigabe wartet, die
     dieser Banner nie erteilen kann. Der Besucher klickt „Alle akzeptieren"
     und die Karte bleibt ein Platzhalter – er hat gerade zugestimmt und
     glaubt, es sei kaputt.

     Praktisch wirksam wird das erst zusammen mit `<Einbettung auto>`; ohne
     `auto` bleibt der Klick auf den Platzhalter die Einwilligung für den
     Einzelfall, wie CLAUDE.md 7a es vorsieht. Beide Hälften mussten repariert
     werden – jede allein wäre wirkungslos geblieben. */
  /* DIE KATEGORIEN DER GANZEN WEBSITE – sie stehen am Banner.

     HIER STAND EINE SUCHE IM DOM DER AKTUELLEN SEITE. Das war zu eng: Der
     Banner zeigt immer alle Kästchen (beim Bauen über alle Quelldateien
     gebildet), gespeichert wurde aber nur, was auf DIESER Seite vorkam. Wer
     auf der Startseite „Alle akzeptieren" drückte und dann zur Kontaktseite
     ging, sah dort trotzdem wieder den Karten-Platzhalter – und die Messung
     meldete seine Zustimmung als sparsame Teilauswahl. Der Rückfall auf die
     alte Suche bleibt für den Fall, dass ein Klon den Banner selbst baut. */
  const amBanner = banner.dataset.einwilligungKategorien;
  const vorhanden = amBanner
    ? (amBanner.split(' ').filter(Boolean) as Kategorie[])
    : [
        ...new Set([
          ...Array.from(document.querySelectorAll<HTMLElement>('[data-einwilligung]')).map(
            (el) => el.dataset.einwilligung as Kategorie,
          ),
          ...Array.from(document.querySelectorAll<HTMLElement>('[data-einbettung-kategorie]')).map(
            (el) => el.dataset.einbettungKategorie as Kategorie,
          ),
        ]),
      ];

  banner.querySelector('[data-einwilligung-alle]')?.addEventListener('click', () => {
    setzen(['notwendig', ...vorhanden]);
  });

  banner.querySelector('[data-einwilligung-nur-notwendig]')?.addEventListener('click', () => {
    setzen(['notwendig']);
  });

  banner.querySelector('[data-einwilligung-auswahl]')?.addEventListener('click', () => {
    const gewaehlt: Kategorie[] = ['notwendig'];
    banner
      .querySelectorAll<HTMLInputElement>('[data-einwilligung-kategorie]:checked')
      .forEach((c) => gewaehlt.push(c.dataset.einwilligungKategorie as Kategorie));
    setzen(gewaehlt);
  });
}
