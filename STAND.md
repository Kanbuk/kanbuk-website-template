# STAND – das Gedächtnis dieses Projekts

> **Für Claude Code:** Diese Datei ZUERST lesen, bei JEDER Arbeit an diesem Projekt
> aktuell halten (Pflicht, siehe CLAUDE.md). Sie ist das einzige Gedächtnis über
> Chat-Grenzen hinweg – ein Bericht im Chat ist nach dem Chat weg, diese Datei nicht.
>
> **Für Menschen:** Hier steht immer, wo dieses Projekt gerade steht und was noch
> fehlt. Einfach öffnen und lesen – oder Claude Code fragen: „Wie ist der Stand?"

---

## Projekt

| | |
| --- | --- |
| **Kunde** | – (noch Referenz-Template) |
| **Phase** | Vorlage – noch kein Kundenprojekt |
| **Design-Quelle** | – (Claude-Design-Link hier eintragen) |
| **Vorschau-URL** | – |
| **Live-Domain** | – |
| **Motor-Stand** | siehe `package.json → version` *(bei jeder Änderung dort hochgezogen; ein Klon erbt den Stand seines Klon-Zeitpunkts)* |

Phasen: `Vorlage → Portiert (Vorschau) → Beim Kunden vorgestellt → Gebucht → Live`

## Lücken-Inventar (vor dem Live-Gang zu erledigen)

<!-- Beim Port füllt Claude Code diese Liste. Erledigtes abhaken [x], nie löschen. -->

- [ ] *(wird beim Port gefüllt – z. B.: „hero.jpg ist ein Stock-Platzhalter, echtes Foto nötig")*

**Am Motor selbst offen (betrifft JEDE Kundenseite, geprüft am 2026-07-27):**

- [x] **Bestätigungsmail schickt alle Angaben zurück** (`src/lib/kontakt.ts:137`,
      `...zeilen.slice(2)`). Zwei Probleme: Der Inhalt steht in keiner
      Datenschutzerklärung, und die Empfängeradresse wird nie geprüft – jeder
      kann über die Domain des Kunden beliebigen selbst geschriebenen Text an
      eine fremde Adresse schicken lassen. Der teure Ausgang ist eine
      Absender-Domain auf einer Spam-Liste; ab dann kommt keine Anfrage mehr an.
- [x] **Zwei sich widersprechende Rechtsgrundlagen.** Der Text über dem
      Senden-Knopf (`src/lib/texte.ts:26`) sagt „Mit dem Absenden stimmen Sie …
      zu" – das ist eine Einwilligung. Die Datenschutzerklärung
      (`src/pages/datenschutz.astro:150`) nennt Art. 6 Abs. 1 lit. b und f, also
      etwas anderes. Beides zugleich geht nicht.
- [x] **Merkliste fehlt in der Datenschutzerklärung.** Kommt dort 0-mal vor,
      während die Seite „keine Cookies" behauptet. CLAUDE.md Abschnitt 6a
      verlangt den Absatz ausdrücklich – die Lücke ist am 2026-07-27 mit dem
      Katalog selbst entstanden.
- [x] **`besucherzaehlung: 'vercel'` schreibt einen Absatz über
      Reichweitenmessung, lädt aber nirgends ein Skript.** Die Erklärung würde
      eine Verarbeitung behaupten, die gar nicht stattfindet.
- [x] **Ohne JavaScript landen Feldbeschriftungen in der Adresszeile.**
      `kontakt.ts:69` baut „Bitte ausfüllen: <Feldnamen>", `api/contact.ts:153`
      hängt das an die Adresse. Bei einer Praxis stünde dort „Ihre Beschwerden"
      im Browserverlauf und im Protokoll des Hosters.
- [x] **Formular ist in der Vorschau unsichtbar** (`Formular.astro:62`). Der Port
      schreibt das Formular-Aussehen blind; Sicht- und Bedien-Prüfung bekommen es
      nie zu sehen, und beim Live-Gang erscheint ein nie geprüftes Bedienelement.
      Auch der neue Assistent ist dadurch in keiner Demo vorführbar.
- [ ] **Kein Werkzeug für den Abgleich mit der Design-Vorlage.** Die Regel steht
      jetzt (CLAUDE.md 9 Punkt 3c, `/port` Etappe 5 Stufe 6, Deploy-Checkliste
      4a), das Nebeneinanderlegen ist aber **Handarbeit**. Im Kundenprojekt
      wurde dafür ein Werkzeug gebaut, das aus der Design-Datei jedes Element
      mit Inline-Stil sucht und Wert für Wert vergleicht – beim ersten Lauf
      36 Abweichungen, davon eine grobe. Es ist so aber **nicht** ins Template
      hebbar: Seitenzuordnung und Anker sind klonspezifisch. Vor dem nächsten
      Port entscheiden, ob es sich lohnt.
- [ ] **Kein Ort für bewusste Design-Abweichungen im Klon.** Die Regel sagt
      jetzt, dass Mindest-Schriftgröße und Kontrast das Design schlagen und die
      Abweichung in den Bericht gehört. Ein maschinenlesbarer Ort dafür
      (`design-abweichungen.md`) fehlt – im Kundenprojekt landete die Ausnahme
      in einer fest einprogrammierten Liste im Prüfskript, mit Kundenfarbwerten
      darin. Das ist der falsche Ort: Ein Klon bekommt keine Template-Updates,
      und ins Template dürfen keine Kundenwerte.
- [ ] **`npm run sicht` kann einmalig zu Unrecht rot werden.** Beobachtet am
      2026-07-28: ein roter Lauf, danach sechs grüne ohne jede Änderung. Ursache
      ist mit hoher Wahrscheinlichkeit die LCP-Messung (`scripts/sicht.mjs`,
      Zeile 89 ff.): Welches Element als „größtes sichtbares" gewinnt, hängt am
      Ladezeitpunkt – auf einem langsamen Moment kann ein verzögert geladenes
      Bild gewinnen, das sonst nie gewinnt. Nicht nachstellbar, deshalb nicht
      behoben. **Regel bis dahin: Ein einzelner roter Lauf der Sichtprüfung
      wird wiederholt, bevor daran etwas geändert wird.** Bleibt er rot, ist er
      echt.
- [ ] **Browser-Untergrenze nie auf einem ECHTEN alten Gerät nachgestellt.**
      Die Ursachen erklären das gemeldete Symptom vollständig, und `npm run
      browser` sowie `npm run altgeraet` decken CSS und Aussehen ab. Ob
      *restlos*, weiß man erst nach einer Sitzung auf einem echten Gerät mit
      altem iOS oder altem macOS (BrowserStack o. ä.). Das gehört EINMAL
      gemacht und das Ergebnis dann als Erfahrungswert hierher. Nicht sehen
      kann die Prüfung ohnehin: Laufzeit-Funktionen (`dialog.showModal`,
      `replaceChildren`), Bild- und Schriftformate, Netzwerk.
- [ ] **Auftragsverarbeitung Kanbuk ↔ Kunde.** Wer den Versand-Schlüssel hält und
      deployt, ist Auftragsverarbeiter und braucht mit jedem Kunden einen Vertrag
      nach Art. 28 DSGVO. Noch nirgends vorgesehen.

## Getroffene Entscheidungen

<!-- Improvisationen und Abweichungen vom Design, mit kurzer Begründung. -->

- *(wird beim Port gefüllt)*

## Motor-Meldungen (fürs Master-Template)

<!-- PFLICHT bei Motor-Schwächen (Bug, irreführende Doku, fehlendes Rezept), die
     JEDEN frischen Klon beträfen: Was, Datei, warum allgemein, ggf. Fix-Commit.
     Details: CLAUDE.md Abschnitt 0 → „Motor-Meldung". Der Inhaber trägt diese
     Punkte ins Master-Template zurück – NICHT selbst am Template arbeiten. -->

- *(keine)*

## Vorgemerkt: Gesundheitsberufe (Praxis, Zahnarzt, Physio, Psychotherapie)

Geprüft am 2026-07-27, **bewusst nicht gebaut**. Auslöser zum Bauen: eine echte
Anfrage aus einem Gesundheitsberuf. Aufwand dann ~3–4 Arbeitstage.

**Der harte Befund, selbst nachgelesen:** Resends eigener
Auftragsverarbeitungsvertrag sagt in § 6.1 „Customer acknowledges that Company's
primary processing operations take place in the United States" und führt in
Anhang A besondere Datenkategorien als **„Not applicable"**. Der Vertrag mit dem
heutigen Versanddienst deckt Gesundheitsdaten also ausdrücklich nicht ab. Das ist
kein Auslegungsspielraum, sondern eine Vertragsaussage.

**Was fehlt, bevor eine Praxis möglich ist:**

1. **Impressum für Freie Berufe.** § 5 ECG verlangt zusätzlich Kammer,
   Berufsbezeichnung, Verleihungsstaat und einen Link auf die Berufsvorschriften;
   das Mediengesetz zusätzlich den Unternehmensgegenstand. Keines dieser Felder
   existiert. Und `impressum.astro` beschriftet ein Feld mit „Gewerbe" – der
   ärztliche Beruf ist von der Gewerbeordnung ausgenommen. Das nützt auch
   Anwälten, Steuerberatern und Ziviltechnikern. ~½ Tag.
2. **Europäischer E-Mail-Weg** statt Resend, Bestätigungsmail ohne Inhalt,
   Name des Versanddienstes aus der Config statt fest im Datenschutztext. ~1 Tag,
   **betrifft alle Kunden, nicht nur Praxen.**
3. **Gesundheits-Weiche:** eigenes Pflicht-Ankreuzfeld mit Nachweis (der Satz
   über dem Senden-Knopf genügt für Gesundheitsdaten nicht), Datenschutz-Absatz,
   branchenabhängige Prüfregeln. ~2 Tage.
4. **Terminbuchung** nur als beschrifteter Link auf den Anbieter des Kunden –
   nie ein eigenes Buchungssystem im Motor. ~1 Tag, erst bei Bedarf.

**Berufsrechtliche Fallen, die heute grün durchlaufen** (das Prüf-Tor kennt das
Wort „branche" 0-mal): der Vorher-Nachher-Schieber nennt selbst „Physio" als
Einsatzfall; der Katalog würde Behandlungen als Produkte samt Verfügbarkeit an
Google melden; das Preisniveau-Symbol (€–€€€€) wandert ungefiltert in den
Google-Eintrag; beim **Zahnarzt** gilt ein Preisnennungsverbot für
Privatleistungen (bei Ärzten nicht – die Regel darf nicht pauschal gelten).

**Nicht annehmen:** Formulare, in denen der Patient beschreibt, was ihm fehlt;
Vorher-Nachher-Bilder von Behandlungen; Patientenstimmen ohne schriftliche
Zustimmung; ästhetische Behandlungen (eigenes Gesetz, Strafen bis 25.000 €,
verbietet u. a. „kostenloses Erstgespräch" – ausgerechnet der Knopf, den ein
Design typischerweise liefert).

**Drei Fragen gehören zu einem Anwalt, nicht in eine Einschätzung:** der Wortlaut
der Einwilligung, ob eine Datenschutz-Folgenabschätzung nötig ist, und ob der
Zustellweg mit der ärztlichen Verschwiegenheitspflicht vereinbar ist (§ 54
ÄrzteG kennt – anders als Deutschland – keine allgemeine Ausnahme für
IT-Dienstleister; die Ausnahme in Abs. 3 gilt nur der Honorarabrechnung).

## Vorgemerkt: Sanity-Anschluss (noch NICHT gebaut)

Recherchiert und entworfen am 2026-07-27, bewusst **nicht umgesetzt**. Auslöser
zum Bauen: sobald ein **zweiter** Kunde eine Liste pflegt, die sich **wöchentlich
oder öfter** ändert **und Bilder enthält** (Fahrzeugbestand, Immobilien, Blog,
Kursplan). Bis dahin gilt: Kunde schickt die Änderung, ein Chat pflegt sie ein.

**Warum nicht jetzt** (Zahlen aus der Recherche):
- Einrichtung ~3,5 h pro Kunde, Chat-Pflege ~8 min pro Änderung →
  Break-even bei ~26 Änderungen. Ein Beisl ändert 2–4× im Jahr.
- Sanity Free kennt nur „Administrator" oder „Nur-Lesen" – der Kunde bekäme
  Löschrechte auf seine Inhalte. Die Rolle „darf nur bearbeiten" kostet
  ~165 €/Jahr pro Kunde.
- Drei Hauptversionen in elf Monaten. Das widerspricht dem Klon-Gedanken
  (ein Klon von heute muss in fünf Jahren noch bauen).

**Der Entwurf, falls es so weit ist** – Kernsatz: *Sanity wird nie zur Bauzeit
von Astro angefragt. Sanity schreibt Dateien, der Motor baut aus Dateien* –
genau das Muster, das `npm run preisliste` schon hat.
- Ein Vorlauf-Skript (`inhalt-holen`) holt die Daten, prüft sie gegen das
  Motor-Schema, lädt Bilder nach `fotos/` und schreibt `daten/inhalt.ts` plus
  einen Schnappschuss ins Repo. Danach baut Astro komplett offline.
- Der Schnappschuss ist die Versicherung: Die Seite bleibt baubar, auch wenn
  das Sanity-Projekt Jahre später gelöscht ist.
- Bilder dürfen NIE vom Sanity-CDN kommen (fremder Server beim Besucher →
  das Prüf-Tor blockt es zu Recht, und die Seite wäre nicht mehr cookiefrei).
- In Sanity gehören nur: Preisliste, Öffnungszeiten, Team, Galerie, Aktuelles.
  Niemals: Rechtstexte, SEO-Titel, Design-Tokens, Formulare.
- Im Standard-Klon existiert davon **nichts** – kein Paket, kein Code, keine
  Verzweigung. Nur ein Rezept, das liest, wer es braucht.

## Verlauf

- **2026-07-29** – **Rückfluss Teil 5: Recht und Einwilligung.** Vier Punkte,
  bei denen der Motor etwas anderes behauptete, als er tat:

  **Impressum.** Der Seitentext nannte „Offenlegung gemäß § 5 ECG, § 14 UGB und
  § 25 Mediengesetz" – und ließ den **Unternehmensgegenstand** aus, der auch in
  der abgespeckten Fassung für kleine Websites Pflicht ist (§ 25 Abs. 5). Eine
  Pflichtnorm zu nennen und nicht zu erfüllen ist schlechter, als sie gar nicht
  zu nennen. Neu: `unternehmensgegenstand` (Pflichtfeld), dazu `blattlinie` und
  `beteiligungen` für Gesellschaften (§ 25 Abs. 4 und Abs. 2).

  **Drittland je Dienst.** Der Absatz „Übermittlung in die USA" entstand allein
  daraus, DASS überhaupt ein zustimmungspflichtiger Dienst eingetragen war –
  ohne jede Länderangabe. Bei einem amerikanischen Anbieter stimmte das
  zufällig; bei einem europäischen Werkzeug hätte die Erklärung eine
  Datenübermittlung behauptet, die es nicht gibt, samt falscher
  Rechtsgrundlage. Neu: `drittland` je Dienst; der Absatz nennt nur die
  betroffenen Dienste, und zwar namentlich. Fehlt die Angabe, warnt das Tor.

  **Einwilligung wird von selbst ungültig.** Der Stand hing an einer
  handgepflegten `VERSION = 1` in einer Baustein-Datei, mit dem Kommentar
  „hochzählen, wenn sich die Dienste ändern". Die Dienste stehen aber in der
  Config, und beim Ausbau öffnet niemand eine Baustein-Datei – im Kundenprojekt
  blieb die Zahl auf 1, während ein Dienst eingetragen und später sein Zweck
  geändert wurde. Gleichzeitig versprach die Erklärung wörtlich, dann erneut zu
  fragen. Jetzt entsteht die Kennung beim Bauen aus Kennung, Kategorie,
  Anbieter, Zweck, Quelle und Land jedes Dienstes. **Gegengeprüft:** nur den
  Zweck geändert → neue Kennung → wird neu gefragt.

  **Datenschutztext gegen die Wirklichkeit.** Der Einbettungs-Absatz kannte nur
  den Kartenfall und hing an einem Handschalter; ein eingebettetes Video kam
  darin gar nicht vor. Im Kundenprojekt war die Karte zwanzig Minuten online,
  während die Erklärung „Es wird keine Karte eingebettet" behauptete. Der
  Schalter ist **ersatzlos weg**: Die Erklärung durchsucht den Quelltext der
  Seiten und schreibt je tatsächlich eingebettetem Anbieter einen Absatz.
  Dazu die Absätze, die beschreiben, was der MOTOR ohnehin tut und die nirgends
  standen – die IP-Zählung beim Absenden, die automatische Empfangsbestätigung,
  die technisch mitgesendeten Felder, Inhalt und Lebensdauer des
  Einwilligungs-Eintrags.

  **Drei neue Prüf-Regeln**, alle absichtlich zum Anschlagen gebracht:
  Einbettung im Build ohne Absatz (und umgekehrt), Dienst ohne Drittland-Angabe,
  Dienste ohne Kennung am Banner.

- **2026-07-29** – **Rückfluss Teil 4: die restlichen Muss-Punkte.** Fünf
  Bereiche, jeder einzeln geprüft:

  **Katalog-Mechanik in die Bibliothek.** `filterGruppen()`, `regler()` und
  `sortierOptionen()` stehen jetzt in `src/lib/katalog.ts`, nicht mehr in der
  Komponente. Grund: Ein echtes Design ersetzt nicht nur die Karte, sondern die
  ganze Filterleiste – im Kundenprojekt wurde die Komponente deshalb gar nicht
  benutzt und die Liste von Hand neu gebaut. Damit erbt so ein Klon **keine**
  Motor-Korrektur mehr. Dabei fiel ein echter Rechenfehler auf: Der
  Schieberegler setzte seine Obergrenze auf den echten Höchstwert, aber ein
  Regler erlaubt nur Werte auf dem Raster `min + n × step` – der Browser rundete
  still ab, und **der teuerste Eintrag war ab der ersten Sekunde ausgefiltert**.
  Nachgerechnet an vier realistischen Bereichen: in dreien trat der Fehler auf.
  Jetzt wird aufs nächste Raster-Vielfache aufgerundet.

  **Die Merkliste hatte kein Ziel.** Der Baustein lieferte Knöpfe, Zähler und
  den Filter „nur Vorgemerkte" – aber keinen Weg, die Liste zu ÖFFNEN. Jetzt
  genügt ein gewöhnlicher Link (`/fahrzeuge#merkliste`): Der Baustein schaltet
  den Filter beim Ankommen selbst ein, und die Sprungmarke sorgt dafür, dass
  der Link auch ohne JavaScript an der richtigen Stelle landet. Dazu der
  Merk-Knopf auf der **Detailseite** – er fehlte ausgerechnet dort, wo man sich
  entscheidet.

  **Drei Bewegungsfehler**, alle im Motor, alle vom Auftraggeber gemeldet statt
  von einer Prüfung:
  1. Beim exklusiven Zuklappen rutschte die angeklickte Frage unter dem Finger
     weg. Jetzt wird ihre Position vorher/nachher gemessen und ausgeglichen –
     **sofort**, nicht weich: Die Seite hat `scroll-behavior: smooth`, und ohne
     `behavior: instant` wird aus dem Ausgleich selbst eine sichtbare Bewegung.
  2. `<details>` klappt beim Klick sofort auf, das Ereignis kommt erst danach –
     Doppelsprung 68 px hinunter, 48 zurück. Die Sperre sitzt jetzt schon im
     `click`, vor der nativen Reaktion; und die Innenabstände laufen mit.
  3. Der Assistent scrollte bei **jedem** Schrittwechsel, auch wenn das Formular
     ganz sichtbar war – und schob den Anfang unter die klebende Kopfleiste.

  **Neu: `npm run interaktion` misst jetzt BEWEGUNG.** Bleibt das angeklickte
  Element dort, wo der Finger es berührt hat? Beim ersten Lauf meldete die
  Messung 62 px – und war damit selbst im Unrecht: Sie klickte mitten in eine
  laufende Scroll-Animation. Jetzt wartet sie, bis die Seite still steht.
  Gegengeprüft: Ausgleich abgeschaltet → rot (62 px), wieder an → grün.

  **Die Fehlerseite hat Kopf und Fuß.** Vorher rendete sie nur den Rumpf, und
  die Ausnahme dafür stand **im Prüf-Tor** („außer 404.html"). Beide Ausnahmen
  sind raus. Daraus ein Grundsatz in CLAUDE.md: *Eine Ausnahme im Prüf-Tor, die
  einen Mangel des Motors deckt, ist keine Ausnahme, sondern ein unerledigter
  Fehler.*

  **Zwei CSS-Fallen geschlossen.** `:global()` in einer eigenständigen
  `.css`-Datei ist ungültig – der Browser verwirft die **ganze** Regel; im
  Kundenprojekt war dadurch `object-fit: cover` seitenweit wirkungslos. Das
  Prüf-Tor meldet es jetzt. Und `[hidden]` verliert gegen jede Klasse mit
  `display`; deshalb steht in `global.css` jetzt `[hidden] { display: none
  !important; }` – sonst zeigt der Merklisten-Zähler eine „0", obwohl nichts
  vorgemerkt ist.

- **2026-07-29** – **Rückfluss Teil 3: die Bildzeichen.** Ein Claude Design
  bindet Symbole **per Name** aus einer Bibliothek ein. Der Motor verbietet
  externe Requests zu Recht – sagte aber nicht, woher die Zeichen dann kommen.
  Im Kundenprojekt wurden sie daraufhin **selbst gezeichnet**; danach sah jedes
  Zeichen der Seite anders aus als im Design, und die ganze Seite wirkte fremd.

  **Lucide liegt jetzt vollständig im Motor: 2007 Symbole, Version 1.27.0,
  im Repo.** `<Symbol name="car-front" />` – fertig. Beim Portieren muss niemand
  mehr überlegen, welche Zeichen gebraucht werden, und es kann nicht mehr
  passieren, dass eines fehlt und jemand zum Stift greift.

  Die fünf Bedingungen des Auftraggebers, jede geprüft:
  1. **Nur Angefordertes landet im Build.** Die Bibliothek ist Datenquelle im
     Repo (420 KB), kein Auslieferungsgut. Das Prüf-Tor misst nach und nennt
     die Zahl in seiner Ergebniszeile („1 Bildzeichen"). Zwei Regeln dahinter:
     Die Bibliotheksdatei darf nirgends in `dist/` liegen, und mehr als 150
     verschiedene Zeichen im Build gelten als ausgeschüttete Bibliothek.
     **Gegengeprüft:** Datei nach `dist/` kopiert → rot.
  2. **Feste Version, kein „latest"** – in `package.json` (`iconBibliothek`),
     in `scripts/icons.mjs` und hier.
  3. **Lizenz (ISC) liegt bei** (`icons/lucide.LICENSE`).
  4. **Ein falscher Name scheitert laut.** `<Symbol name="autoo" />` hält den
     Build an und schlägt ähnliche Namen vor. **Gegengeprüft:** Build bricht ab.
  5. **Andere Bibliotheken bleiben möglich:**
     `npm run icons -- --set heroicons --namen "…"` holt dort nur die genannten
     Zeichen. **Gegengeprüft:** heroicons geholt, Datei entstand, wieder entfernt.

  **Kein neues npm-Paket.** Die eiserne Regel bleibt gewahrt: `lucide-static`
  wird von `npm run icons` einmalig in einen Wegwerf-Ordner geholt, ausgelesen
  und wieder gelöscht. Im Projekt liegt nur die erzeugte JSON-Datei – ein Klon
  bleibt damit auch dann vollständig, wenn es den Anbieter nicht mehr gibt.

  **Version:** Sie steht bereits auf dem heutigen Datum (2026.7.29) – das
  Kalender-Schema kennt nur einen Stand je Tag, und das ist heute schon der
  dritte Rückfluss.

- **2026-07-29** – **Rückfluss Teil 2: die Regeln.** Der teuerste Einzelbefund
  des Kundenberichts war kein Fehler im Code, sondern **ein Satz im Regelwerk**.

  **Der Vorrang stand falsch herum.** CLAUDE.md Abschnitt 4 sagte: „Diese Werte
  werden **niemals** übernommen", der `/port`-Skill „Jeder Pixelwert wird zum
  Token", und der Kopfkommentar von `global.css` dasselbe noch einmal. Zusammen
  liest sich das als Einladung, das Design frei zu übersetzen. Im Kundenprojekt
  entstand daraus eine Seite mit **richtigen Bauteilen in falscher Anordnung** –
  Knöpfe und Karten stimmten aufs Pixel, aber Bänder hatten die falsche
  Grundfarbe, Bedienelemente standen falsch, Abschnitte fehlten und andere waren
  erfunden. Der Auftraggeber musste dreimal darauf hinweisen. Die Tücke: **Eine
  Seite aus lauter korrekten Komponenten wirkt fertig** – erst neben der
  Design-Datei sieht man, dass es eine andere Seite ist.

  Alle drei Fundstellen tragen jetzt dieselbe Regel: **Wo das Design einen Wert
  nennt, gewinnt der Wert.** Die Token-Skala ist der Rückfall, nicht die
  Vorschrift. Dazu übernommen:
  - **Zwei Dateien, beide verbindlich.** Das Design-System (`_ds_bundle.js`)
    sagt, wie ein Bauteil aussieht; die `.dc.html` sagt, welche Bauteile wo
    stehen. Wer nur eines liest, baut garantiert falsch. Die `.dc.html` ist
    Bauanleitung, nicht Inspiration – Block für Block, Wert für Wert, keine
    Ergänzungen. Komponenten-Definitionen werden **gelesen**, nicht vom
    Bildschirmfoto abgeleitet.
  - **Wenn der Motor dem Design widerspricht:** Mindest-Schriftgröße (12 px) und
    Mindest-Kontrast schlagen das Design. Abweichen ist dort **Pflicht** – und
    gehört begründet in den Bericht, sonst kann der Inhaber es dem Kunden nicht
    erklären.
  - **Stufe 6 der Launch-Prüfung: Abgleich mit der Vorlage.** Grüne
    Technikprüfungen sagen nichts über Design-Treue. Geprüft werden **beide**
    Richtungen – fehlt etwas aus dem Design, und steht etwas auf der Seite, das
    dort nicht vorkommt? Letzteres sieht man selbst am schwersten, weil eigene
    Ergänzungen „sinnvoll" wirken.
  - **CSS-Falle bei dunklen Abschnitten:** Abgeleitete Farb-Token frieren im
    `:root` ein. Wer ein Basis-Token dunkel neu setzt, muss alle davon
    abgeleiteten mitsetzen – sonst liegt eine helle Haarlinie um jede Karte auf
    schwarzem Grund. Im Kundenprojekt auf jeder Seite sichtbar, elf Runden lang
    niemandem aufgefallen.
  - **Katalog:** Die Schnittstelle sind die `data`-Attribute, **nicht** die
    Komponente. Ein echtes Design ersetzt nicht nur die Karte, sondern die ganze
    Filterleiste. Und: Erscheint ein Bedienelement, das im Design nicht vorkommt,
    ist das der **Motor** (er leitet Filter automatisch aus den Daten ab), kein
    Einfall des Ports.
  - **Weiterleitungen mit Verfahren statt aus dem Gedächtnis:** alte
    `sitemap.xml` holen, jede Adresse zuordnen, keine auf eine Fehlerseite. Das
    Prüf-Tor kann eine vergessene Adresse prinzipiell nicht sehen.
  - **Repo sofort bei Vertragsabschluss**, nicht am Live-Tag. Dazwischen liegen
    Tage bis Wochen mit der meisten Arbeit – bisher ohne Backup.
  - **Anleitungen für den Nutzer:** keine Befehlszeile, und Bezeichnungen fremder
    Oberflächen nie aus dem Gedächtnis. Eine falsche Klickanleitung ist teurer
    als gar keine.
  - **Eine übersprungene Prüfung ist kein grünes Tor** – auch wenn unten ein
    Haken steht.
  - **Namenswiderspruch aufgelöst:** CLAUDE.md nannte ein eigenes Präfix, der
    Deploy-Skill ein anderes. Jetzt gilt die Namenstabelle des Deploy-Skills;
    das Prüf-Tor wird scharf, sobald der Name nicht mehr der Template-Name ist.

- **2026-07-29** – **Abnahme des Rückflusses: drei Blocker in meiner eigenen
  Arbeit gefunden.** Zehn Prüfer haben den Umbau vom Vortag auseinandergenommen,
  jeder Befund wurde von einem Gegenprüfer widerlegt oder bestätigt (zwei
  Befunde fielen dabei durch). Was standhielt:
  - **Der zentrale Kunstgriff funktionierte nicht.** Das Muster „einfacher
    Ersatzwert, moderne Zeile darunter" wirkt NICHT, wenn die moderne Zeile ein
    `var()` enthält – der Browser kann sie beim Einlesen nicht prüfen, behält
    sie, merkt später die Ungültigkeit und setzt die Eigenschaft auf **nichts**.
    Der Ersatzwert löscht also genau das, was er retten soll. Im Browser
    nachgemessen: Rahmen 0px statt 1px. Und dieses falsche Muster stand bereits
    als Regel in CLAUDE.md und im Port-Skill – es wäre in jeden künftigen Port
    gewandert. **Behoben, indem `color-mix()` ganz aus dem Motor verschwindet:**
    `src/lib/theme.ts` rechnet die abgeleiteten Farben als `rgba()` aus den
    Design-Farben (`--farbe-linie`, `--farbe-grund-92`, …). Rechnerisch
    dasselbe, funktioniert überall, braucht keinen Ersatzwert.
  - **Die JavaScript-Prüfung war nur halb.** Sie meldete ausschließlich, was
    der Übersetzer NICHT umwandeln kann. Alles, was er umwandeln KÖNNTE (`?.`,
    `??`), wandelte er brav um, das Ergebnis wurde weggeworfen – und ein
    `<script is:inline>` mit `?.` ging grün durch, obwohl es unverändert in der
    Seite landet und dort jedes Skript killt. Der erste Reparaturversuch (zwei
    Übersetzungen vergleichen) war zu grob und meldete Backticks gegen
    Anführungszeichen als Verstoß. Jetzt: benannte Liste `JS_MERKMALE`, wie
    beim CSS auch.
  - **Das fünfte Tor lief in keiner Kette mit** – weder in `npm run check` noch
    in der Deploy-Checkliste. Genau eine vergessene Ausführung hätte gereicht.
    Jetzt hängt es in `check-lauf.mjs` und steht in beiden Checklisten.

  Dazu bestätigte Kleinigkeiten, alle behoben: `istAbgesichert` sah nur die
  Zeile davor, während der Verdichter umsortiert (meldete `dvh` als Ausfall,
  den es nicht gab); `vollstaendig_ab_safari` wanderte als vermeintlicher
  Browsername in die CSS-Ziele, und `<< 16` verwarf Nachkommastellen (aus 15.4
  wurde 15.0 – genau das Auseinanderlaufen, das die eine gemeinsame Datei
  verhindern soll); der Namens-Wächter las `astro.config.ts` und JSON-Dateien
  gar nicht, also ausgerechnet die neu angelegten; die Gewichtsregel für
  Ersatzfassungen lief über Elementgrenzen hinweg. **Neue Regel:** Design-Farben
  müssen Hex-Werte sein – sonst fällt die Farbrechnung still auf Schwarz zurück
  und die Trennlinie ist auf dunklen Designs unsichtbar.

  **Kundenfrei bestätigt:** In den versionierten Dateien steht kein Betriebsname,
  kein Ort, keine Fahrzeugdaten, keine kundenspezifische Zahl.

- **2026-07-28** – **Browser-Untergrenze: der Fall „überall grün, beim Besucher
  kaputt".** Rückfluss aus einem Kundenprojekt. Dort war die bereits abgenommene
  Seite auf einem älteren Gerät des Auftraggebers unbenutzbar – **keine
  Navigation, auf keiner Seite** –, während alle vier Prüfungen grün waren.
  Das ist bauartbedingt: Alle vier fahren dasselbe aktuelle Chromium, und es gab
  nirgends eine Zusage, welche Browser überhaupt unterstützt werden. Ohne Soll
  gibt es nichts zu prüfen. Die Ursache war eine **fehlende Angabe**, kein
  fehlerhafter Quelltext:
  - Der CSS-Verdichter schrieb `@media (min-width: 900px)` in die Kurzform
    `@media (width>=900px)` um – verständlich erst ab Safari 16.4 (2023). Wer
    sie nicht kennt, verwirft **den ganzen Regelblock**. Betroffen war unter
    anderem der Block, der den Menü-Knopf sichtbar macht.
  - Das Skriptbündel entstand als „esnext". Eine Schreibweise, die der Browser
    nicht LESEN kann, ist kein Ausfall eines Bausteins: Er bricht beim Einlesen
    ab – Menü, Filter, Merkliste, Formular und Lightbox sind gleichzeitig tot.
  - Bilder gingen nur als WebP ohne Ersatzfassung hinaus. Auf Macs mit älterem
    Betriebssystem erscheint dort **kein einziges Foto**.

  **Übernommen (die sieben Punkte aus der Rückmeldung):** `browser-untergrenze.json`
  als einzige Stelle für die Zusage, Weitergabe in `astro.config.ts` (Falle
  dabei: `environments.client.build.target` klingt richtig, wirkt aber nicht –
  nur der `vite`-Schlüssel greift), `npm run browser` als **fünftes Tor** und in
  der Definition of Done, fünf Zerlege-Stellen in `filter.ts`/`oeffnungsstatus.ts`
  ausgeschrieben, Bilder auf `<Picture>` mit JPEG-Ersatzfassung samt
  `picture { display: contents }`, Ersatzwerte vor `color-mix()` und `dvh` in
  den Motor-Bausteinen, und die Grenzen des Tors ehrlich dokumentiert.

  **Dazu zwei eigene Wächter:** eine Quelltext-Regel gegen das Zerlegen in
  Klammern (sagt es an der Stelle, an der es zu ändern ist, statt im fertigen
  Bündel) und ein eigenes Gewichtsmaß für Ersatzfassungen – die alte Regel
  unterstellt, jeder Besucher lade jedes Bild; bei einem `<picture>` lädt die
  Ersatzfassung praktisch niemand.

  **`npm run altgeraet`** zeigt in 30 Sekunden, wie die Seite auf einem alten
  Browser AUSSIEHT, ohne dass ein altes Gerät da sein muss. Es kam dazu, weil
  das Tor nur sagt, WAS fehlt – im Kundenprojekt las sich das als „ärmer, aber
  bedienbar", während auf dem echten Gerät Elemente aneinanderklebten.
  Nachgesehen: bei 350 px eng, aber vollständig lesbar und bedienbar, Menü-Knopf
  sichtbar. Das ist die Zusage.

  **Die Grenze ist bewusst gesetzt:** vollständig ab Safari 15.4 (Frühjahr 2022,
  jedes iPhone ab 6s). Darunter bedienbar, aber karg – kein offener Punkt,
  sondern eine Entscheidung. Auch das Aussehen bis Safari 12 zu retten wurde im
  Kundenprojekt geprüft und verworfen: Aufwand für weit unter ein Prozent der
  Besucher. Zum Vergleich: Vite hätte von sich aus Safari 16.4 gewählt.

- **2026-07-27** – **Vorarbeit für den ersten Zeittest.** Sechs Befunde aus der
  Praxis-Prüfung abgearbeitet, damit die gemessene Zahl etwas wert ist:
  - **Bestätigungsmail entschärft.** Sie schickte dem Absender alle Angaben
    zurück – an eine Adresse, die niemand überprüft. Wer den Endpunkt direkt
    anspricht (der Ursprungs-Kopf lässt sich weglassen, Honeypot und Zeitfalle
    sind trivial zu umgehen), ließ damit die Domain des Kunden beliebigen Text
    an beliebige Adressen schicken. Der teure Ausgang wäre keine gestohlene
    Datei, sondern die Absender-Domain auf einer Sperrliste – ab dann kommt
    KEINE echte Anfrage mehr an. Jetzt nur noch Empfangsbestätigung, und eine
    Prüf-Tor-Regel schaut in genau diesen Block.
    **Vorher geprüft: Auf keinem der drei Motor-Projekte ist ein Schlüssel
    gesetzt** (`vercel env ls` → „No Environment Variables found"), es war also
    nie ausnutzbar. Scharf geworden wäre es beim ersten Live-Gang.
  - **Formular ist in der Vorschau sichtbar und bedienbar**, Versand
    strukturell gesperrt (kein `action`, `data-formular-vorschau` statt
    `data-formular`). Ein Klick auf Senden wird ehrlich beantwortet. Vorher
    schrieb der Port das Formular-Aussehen blind, beide Prüfungen sahen es nie,
    und beim Live-Gang erschien ein nie geprüftes Bedienelement.
  - **Vier Datenschutz-Lücken:** Merklisten-Absatz ergänzt (die Lücke war mit
    dem Katalog selbst entstanden); der Satz über dem Senden-Knopf behauptete
    eine Einwilligung, während die Erklärung eine andere Rechtsgrundlage nennt –
    vereinheitlicht; `besucherzaehlung` schrieb einen Absatz über eine Messung,
    die nirgends stattfindet – Feld und Absatz entfernt; ohne JavaScript
    landeten Feldbeschriftungen in der Adresszeile – jetzt nur noch ein
    Kurzzeichen, den Satz baut die Danke-Seite.
  - **Messregel im Port-Ablauf:** Start, Ende, Nachbesserungsrunden und die
    grobe Aufteilung der Zeit sind ab jetzt Pflicht im Bericht und in STAND.md.
    Ohne festen Schlussstrich sind zwei Ports nicht vergleichbar.

  Drei neue Schutzregeln, alle absichtlich zum Anschlagen gebracht. Die
  Sichtprüfung mit eigenen Augen fand danach noch zwei Textfehler, die keine
  Messung findet: „Telefon(optional)" ohne Leerzeichen und einen Hinweis, der
  weiter „deaktiviert" behauptete, obwohl das Formular jetzt da ist.

  **Nächster Schritt: der Zeittest an einem Nagelstudio (Relaunch).**

- **2026-07-27** – **Der Motor kann jetzt Kataloge.** Bisher konnte er Seiten mit
  Inhalt, aber keine Betriebe abbilden, die *viele gleichartige Dinge* zeigen –
  Fahrzeuge, Immobilien, Maschinen, Kurse, Zimmer. Genau daran wäre eine
  Autohaus-Seite gescheitert. Neu, alles branchenneutral:
  - **Katalog** (`katalog` in der Config): eine Übersicht **und je Eintrag eine
    eigene Adresse** mit eigenem Titel, eigener Description, eigenem
    Vorschaubild (1200×630 aus dem ersten Foto) und Produkt-Schema samt Preis
    und Verfügbarkeit. Ohne das findet Google eine Seite statt zweihundert.
    Verkauftes verschwindet aus der Liste, die Seite bleibt erreichbar –
    sonst liefe jeder alte Google-Treffer ins Leere.
  - **Kombinierter Filter**: mehrere Merkmale gleichzeitig (innerhalb einer
    Gruppe ODER, zwischen den Gruppen UND), Preisregler, Sortierung,
    Trefferzähler, Zurücksetzen. Filtergruppen und Regler entstehen
    **automatisch aus den Daten** – ein neues Merkmal ist sofort filterbar,
    und es steht nie eine Auswahl da, die null Treffer hätte.
  - **Merkliste** (Vormerken/Favoriten) – bleibt auf dem Gerät, kein Server,
    kein Banner; gehört aber in die Datenschutzerklärung.
  - **Dialog** als Baustein (natives `<dialog>`, trägt den Eintrag mit in die
    Anfrage) und **Lightbox mit Blättern** (Pfeile, Tastatur, Wischen, Zähler).
  - **Assistent**: langes Formular in Schritten mit Fortschritt. Gelöst ist
    dabei die Falle, an der solche Formulare üblicherweise scheitern – ein
    Pflichtfeld in einem *ausgeblendeten* Schritt bricht das Absenden ab, ohne
    dass der Besucher etwas sieht. Der Assistent springt zuerst dorthin zurück.
  - **AGB-Seite** (`rechtstexte.agb`), nur wenn wirklich verkauft wird. Den
    Text erfindet der Motor nicht – das ist Vertragsrecht.

  **Zwei Fehler in den Wächtern selbst gefunden und behoben:**
  - Das Prüf-Tor meldete `@media (min-width: 800px)` und das `sizes`-Attribut
    responsiver Bilder als „feste Breite" – also genau das Muster, das
    CLAUDE.md Abschnitt 4 vorschreibt. Ein Wachhund, der den Briefträger
    durchlässt und den Hausherrn beißt.
  - Die Bedien-Prüfung übersah den Katalog-Filter vollständig (sie kannte nur
    `data-kategorie`). Jetzt fährt sie jede Merkmalsgruppe, jeden Regler, jede
    Sortierrichtung, Zurücksetzen, Trefferzähler, Merkliste, Dialog und
    Assistent – und jede dieser Prüfungen wurde absichtlich zum Anschlagen
    gebracht, bevor sie als fertig galt.

  Die Sichtprüfung fand zwei echte Fehler in den neuen Komponenten (das
  Listenbild lud verzögert, obwohl es den ersten Eindruck bestimmt; ein
  Einzelbild wurde hochskaliert angezeigt). Mit eigenen Augen fielen zusätzlich
  drei Textfehler auf, die keine Messung findet: „2 von2" ohne Leerzeichen,
  „Gruen" statt „Grün" (die Filterschlüssel sind Adressbausteine, keine
  Anzeigetexte – dafür gibt es jetzt `katalog.beschriftungen`) und eine schief
  gebeugte Zählzeile.

  Ein **Muster-Katalog** steht bewusst im Template: So läuft die ganze Kette
  bei jedem Build durch – aus demselben Grund, aus dem die Referenzseite ein
  echtes Bild einbindet. Beim Kunden meldet ihn das Prüf-Tor als zu ersetzen.

- **2026-07-27** – **Motor-Vollprüfung umgesetzt.** 73 Prüfer hatten den Motor auf
  SEO, Sicherheit, Responsiveness, Recht, Vollständigkeit, Prüf-Tor-Qualität und
  Wartbarkeit untersucht; 63 Befunde wurden gegengeprüft bestätigt. In vier Blöcken
  abgearbeitet:
  - **Recht & Prüf-Tor:** Impressum/Datenschutz sind jetzt Pflicht (waren die
    EINZIGEN Seiten ohne Kontrolle), Platzhalter und Musterdaten werden im fertigen
    HTML gesucht, tote interne Links und Weiterleitungsziele fallen auf,
    Kartenlizenz wird erzwungen.
  - **Verkauf:** Das WhatsApp-Vorschaubild funktioniert (zeigte auf eine Domain,
    die es noch nicht gab – Leads sahen eine graue Zeile).
  - **Sicherheit:** 0 statt 4 hohe Lücken (sharp, svgo, Astro 5→7), Formular mit
    fünf Schranken gegen Missbrauch, Clickjacking-Schutz, JSON-LD maskiert.
  - **Bausteine:** Kopf/Fuß mit funktionierender Handy-Navigation (jeder Klon baute
    ~150 Zeilen von Hand nach), Öffnungszeiten mit Feiertagen/Betriebsurlaub,
    „Jetzt geöffnet"-Anzeige, Team/FAQ/Referenzen/Stellen als Datenmodelle,
    Formularfelder für Mehrfachauswahl und Zustimmung, Danke-Seite.
  - **Blinde Prüfungen geschärft:** Das Prüf-Tor las kein JavaScript und 80 % des
    CSS nicht; Kontrast wurde an zwei Config-Werten statt am echten Text gerechnet;
    die Filter-Prüfung war ein Zirkelschluss. Alles behoben und je einmal
    absichtlich zum Anschlagen gebracht.
  - **Zweisprachigkeit** funktioniert jetzt (war eine Sackgasse: englische Seiten
    hätten sich als deutsch ausgewiesen und auf die deutsche Fassung kanonisiert).

  Version 2026.7.27. Verifikation je Änderung: Positiv- und Negativprobe, dazu
  build/check/sicht/interaktion grün und ein live geschalteter Nachbau.

<!-- Eine Zeile pro Arbeitssitzung: Datum – was passiert ist. Neueste oben. -->

- **2026-07-21** – Signatur-Baustein (Kanbuk-Backlink) samt Anker-Rotation je Kunde
  und Prüf-Tor-Zwang (Marken-Anker, kein nofollow, keine Money-Keywords);
  Karten-Erzeuger um Stile hell/dunkel/dezent + Retina + echte Standort-Nadel
  erweitert, 2-Klick-Google-Maps als Rezept; Sichtprüfung erkennt jetzt
  hochskalierte (verpixelte) Bilder; toter EU-Streitbeilegungs-Link entfernt
  plus Prüf-Tor-Regel dagegen. **Wichtigster Fund: Der Ein-Rutsch-Grundsatz war
  seit dem Piloten nie eingelöst** – eine Erlaubnis-LISTE wird nie vollständig,
  jede neue Befehlsform fragte nach und unterbrach den Nutzer. Behoben mit
  permissions.defaultMode = 'auto' (Version 2026.7.21). Läuft: Komplett-Audit
  einer Gastro-Referenz (41 Befunde, Gegenprüfung offen).
- **2026-07-17** – Großer Ausbau-Tag: (1) Rückfluss aus dem Gastro-Piloten eingearbeitet
  (10 Motor-Fixes, 9 Beschleuniger, Version 2026.7.17). (2) Demo-Bote v2:
  Projekt-Archiv (Zip) als Standardweg, echte Mehrseiten-Demos, Bildfelder des
  Design-Editors stillgelegt, Marken-Domain demo-<kunde>.kanbuk.com automatisch
  (als Projekt-Domain, nie alias – Vercel-SSO-Falle). (3) Adress-Stufen-Konvention:
  demo-<kunde> → <kunde>.kanbuk.com → eigene Domain; Wildcard-DNS bei World4You
  eingerichtet. (4) Formular-Crash auf Vercel behoben (.js-Endungen in der
  Import-Kette, auch im Preislisten-Generator). (5) Toten EU-Streitbeilegungs-
  Link entfernt + Prüf-Tor-Regel. (6) Port-Regeln: Rechtsseiten mit Kopf/Fuß,
  SocialLinks nie als Buchstaben. Zwei Piloten als Demos live (einer mit vier
  Seiten, einer als Onepager); **gemessene Demo-Zeit 2 min 26 s** (vorher 19 min
  über Standalone-Umweg).
