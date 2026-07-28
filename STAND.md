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
