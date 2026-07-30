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

<!-- Beim Port füllt Claude Code diese Liste. Erledigtes abhaken [x], nie löschen.

     KONVENTION: Ein offener Punkt `- [ ]` SPERRT den Live-Gang.
     Soll er bewusst offen bleiben und trotzdem nicht verloren gehen, gehört
     `(kein Blocker)` in die Zeile – dann macht das Prüf-Tor einen Hinweis
     daraus statt eines Fehlers. Die Entscheidung steht damit schriftlich hier
     und nicht im Gedächtnis einer Person. -->

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
- [x] **Werkzeug für den Abgleich mit dem Design – gebaut am 29.07.2026.**
      `npm run abgleich` ist das sechste Tor. Es liest die `.dc.html` mit einem
      echten DOM, zerlegt sie in Seiten und Blöcke und hält das gegen die
      gebaute Seite: Blockzahl, Überschriften-Folge, Reihenfolge, dunkle Bänder,
      fest stehende Elemente. Die Zuordnung Seite→Adresse steht in
      `design/abgleich.json` **im Klon** – genau daran war ein früherer Versuch
      gescheitert (Liste im Skript, damit nicht ins Template hebbar).
      **Was es kann und was nicht, gemessen statt behauptet:** Von elf schweren
      Befunden eines Handabgleichs findet es drei zuverlässig – die der Klasse
      „Block fehlt / Block erfunden", also die teuerste. Feinheiten INNERHALB
      eines Blocks, Textinhalte und Klick-Zustände sieht es nicht.
      Verworfen wurde bewusst der naheliegende Weg, beide Seiten als Bild
      übereinanderzulegen: Die `.dc.html` ist eine Schablone und lässt sich ohne
      den Laufzeit-Teil von Claude Design (`support.js`, kommt beim Export nicht
      mit) gar nicht rendern. Ihn nachzubauen hieße, eine zweite Fassung von
      Claude Design zu pflegen. Und ein Pixelvergleich erstickte ohnehin am
      Rauschen: Das Design zeigt Musterinhalte, die Seite echte.
- [ ] **Das sechste Tor rauscht noch.** *(kein Blocker)* Im Testklon meldet es neben den echten
      Befunden rund acht, die keine sind – meist „ein Block zu viel", weil die
      Regel zum Erkennen eines reinen Rahmens (mehrere Kinder, keine eigene
      Polsterung) auf beiden Seiten leicht verschieden greift. Es ist damit ein
      Hinweisgeber, kein Blocker: Es endet nur bei „Block fehlt/erfunden" rot.
      Nachschärfen, sobald ein zweites Design vorliegt – an einem einzigen
      Design lässt sich die Regel nicht sauber eichen.
- [ ] **Kein Ort für bewusste Design-Abweichungen im Klon.** *(kein Blocker)* Die Regel sagt
      jetzt, dass Mindest-Schriftgröße und Kontrast das Design schlagen und die
      Abweichung in den Bericht gehört. Ein maschinenlesbarer Ort dafür
      (`design-abweichungen.md`) fehlt – im Kundenprojekt landete die Ausnahme
      in einer fest einprogrammierten Liste im Prüfskript, mit Kundenfarbwerten
      darin. Das ist der falsche Ort: Ein Klon bekommt keine Template-Updates,
      und ins Template dürfen keine Kundenwerte.
- [ ] **`npm run sicht` kann einmalig zu Unrecht rot werden.** *(kein Blocker)* Beobachtet am
      2026-07-28: ein roter Lauf, danach sechs grüne ohne jede Änderung. Ursache
      ist mit hoher Wahrscheinlichkeit die LCP-Messung (`scripts/sicht.mjs`,
      Zeile 89 ff.): Welches Element als „größtes sichtbares" gewinnt, hängt am
      Ladezeitpunkt – auf einem langsamen Moment kann ein verzögert geladenes
      Bild gewinnen, das sonst nie gewinnt. Nicht nachstellbar, deshalb nicht
      behoben. **Regel bis dahin: Ein einzelner roter Lauf der Sichtprüfung
      wird wiederholt, bevor daran etwas geändert wird.** Bleibt er rot, ist er
      echt.
- [ ] **Browser-Untergrenze nie auf einem ECHTEN alten Gerät nachgestellt.** *(kein Blocker)*
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
- [ ] **Der Redaktions-Anschluss war noch nie an einem echten Dienst.** *(kein Blocker)* Bewiesen
      ist er gegen einen selbst gestellten Server, der die Schnittstelle
      nachbildet – 21 Prüfungen plus die ganze Kette bis aufs gebaute HTML. Was
      das nicht beweist: dass die Abfragesprache beim echten Anbieter genau so
      antwortet. Beim ersten echten Einsatz mitschreiben und das Ergebnis
      hierher. (Gleiche Ehrlichkeit wie bei der Browser-Untergrenze.)
- [ ] **Zwei Bedienelemente kleben auf der Referenzseite aneinander** *(kein Blocker)*
      („MerkenMeine Merkliste ansehen", Detailseite des Katalogs, in allen drei
      Breiten). Kein Fehler in der Mechanik – die Referenzseite ist bewusst
      fast ungestaltet, weil das Design vom Kunden kommt. Trotzdem sieht ein
      frischer Klon das als Erstes und liest es als kaputt. Ein Abstand im
      Motor-Grundstil würde reichen.

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

## Redaktions-Baustein: gebaut am 2026-07-29

Die frühere Vormerkung ist **eingelöst** – der Auslöser („ein zweiter Kunde
pflegt eine wöchentlich wechselnde Liste mit Bildern") ist eingetreten, und
zwei Kundenklone haben den Anschluss unabhängig voneinander von Grund auf
gebaut. Der Kernsatz von damals hat sich gehalten und steht jetzt als Regel in
CLAUDE.md 6c:

> **Der Dienst schreibt Dateien, der Motor baut aus Dateien.**

**Was der Motor jetzt mitbringt** (`redaktion/`, `scripts/inhalte.mjs`,
`scripts/maske.mjs`, `src/lib/inhalte.ts`, `.github/workflows/`):

- Eine Feldliste (`redaktion/felder.mjs`), aus der Eingabemaske **und** Abfrage
  entstehen; gelesen wird ohnehin alles, was ankommt.
- `npm run inhalte` – Texte und Bilder holen, JSON schreiben (nie Code).
- `npm run maske` – Eingabemaske erzeugen und ins Studio legen, kein `cp`.
- Die **nächtliche Sicherung** als fertiger Ablauf, mit Bildern, nur bei
  Änderung, zusätzlich auf Webhook und Knopfdruck auslösbar.
- Fünf Prüf-Regeln, die die vier Stellen gegeneinander halten.

**Was von der Vormerkung nicht mehr gilt:** Die Bedenken zu Rollenrechten und
Versionswechseln sind unverändert richtig, betreffen aber die **Entscheidung**
pro Kunde, nicht die Bauweise. Der Motor ist paketfrei angeschlossen (nur
HTTP), ein Versionswechsel des Dienstes trifft ihn deshalb nicht. Der Satz
„im Standard-Klon existiert davon nichts" gilt weiter: Ohne
`redaktion/dienst.json` ist der Baustein aus.

**Offen:** Der Anschluss ist gegen einen selbst gestellten Server bewiesen
(21 Prüfungen plus die ganze Kette bis auf die Seite), aber **noch nie gegen
ein echtes Sanity-Projekt gelaufen**. Der erste echte Einsatz gehört
beobachtet – vor allem, ob die Abfragesprache genau so antwortet.

## Verlauf

- **2026-07-31** – **Gegenprüfung des Rückflusses Teil 7 – und die Ernte.** Die
  Änderungen des Vortags wurden von 103 Prüfläufen gegengelesen, jeder Fund von
  einem zweiten Lauf mit dem Auftrag, ihn zu widerlegen. Ergebnis: **74 bestätigte
  Funde, davon 24 schwere.** Alle behoben, jeder mit Gegenprobe.
  **Der schlimmste war selbstgemacht.** Die neue Tippflächen-Regel setzte
  `position: relative` auf den Sprung-Link – der ist aber `position: absolute;
  top: -4rem` und wartet damit über dem sichtbaren Bereich. Als `relative` fiel
  er in den Textfluss: auf JEDER Seite jedes Klons unter 640 px eine um ~41 px
  nach unten gerutschte Kopfleiste und ein angeschnittener dunkler Kasten
  darüber. Kein Tor meldet so etwas – es ist kein Überlauf und kein Skriptfehler.
  Lehre, die jetzt im Kopf der Regel steht: **In eine Regel, die `position`
  setzt, gehören nur Elemente, die im normalen Fluss stehen.**
  **Drei der neuen Messungen waren selbst kaputt** – und das ist der teurere
  Befund, weil eine falsche Messung schlimmer ist als keine: Die
  Tippflächen-Messung scrollte nie (sie sah nur den ersten Bildschirm und meldete
  darunter grün), sie übersprang jedes `<a>` in einem `<li>` und damit die
  komplette Navigation, und sie prüfte nur senkrecht nach – ein quadratisches
  Symbol konnte sie nie freisprechen. Die Abschneide-Messung kannte
  `text-overflow: ellipsis` nicht und hätte jede Katalogkarte mit
  Auslassungspunkten rot gemeldet.
  **Repariert fand sie sofort echte Fehler**, die vorher unter dem Bildschirmrand
  lagen: die Social-Icons der Fußzeile mit 20 × 20 px (auf jeder Seite) und die
  Brotkrumen der Detailseite mit 31 × 20 px. Nebenbei belegt, dass der sonst
  übliche Trick mit dem unsichtbaren Pseudo-Element bei einer REIHE kleiner
  Zeichen nicht trägt: Die vergrößerten Flächen überlappen sich, und der Fund
  blieb trotz Fläche bestehen. Dort werden die Ziele wirklich groß.
  **Drei Behauptungen waren falsch und stehen jetzt als das da, was sie sind.**
  „§ 9b KSchG" – die Bestimmung ist zum 31.12.2021 entfallen; es steht jetzt gar
  keine Fundstelle mehr da, nach derselben Regel wie bei Menüpunkten fremder
  Oberflächen. „Alle Katalog-Schematypen sind Unterklassen von `Product`" – für
  die Mehrheit falsch, die Immobilien- und Zimmertypen stammen von `Place` ab und
  kennen `offers` gar nicht; wer dem Satz glaubte, wartete vergeblich auf den
  Preis im Google-Treffer. Die Vercel-„Sensitive"-Falle stand als bewiesene
  Ursache da, obwohl die Dokumentation sie nicht stützt – jetzt steht die
  Beobachtung als Beobachtung und davor die wahrscheinlicheren Ursachen
  (allen voran: nach dem Eintragen nicht neu deployt).
  **`novalidate` wurde wahr gemacht statt weggeschrieben.** Der Kommentar sagte,
  das Skript setze es – im Markup stand es unbedingt. Damit hatten Besucher ohne
  Skript gar keine Feldprüfung mehr. Jetzt setzt es wirklich das Skript, und zwar
  erst, wenn es die Prüfung übernimmt.
  **Und der eigentliche Bestandsschutz fehlte.** Die Plausibilitätsschwelle nannte
  „3 statt 4" als Beispiel und fing genau das nicht (3 ist mehr als die Hälfte).
  Eine Schwelle kann das auch nicht: Ein einzelner Abgang ist von einem echten
  Verkauf nicht zu unterscheiden. Stattdessen wird ein im Dienst verschwundener
  Eintrag jetzt auf „nicht verfügbar" übertragen statt gelöscht – das ist
  „Verkauft ist nicht gelöscht" (CLAUDE.md 6a) endlich als Mechanik.
  Dazu aufgeräumt: `npm run studio` entfernt (es doppelte `npm run maske`, dessen
  Nachprüfung dorthin gewandert ist), der Marker-Zähler steht als
  `scripts/lib/quelltext.mjs` nur noch an einer Stelle (Vorcheck und Prüf-Tor
  meldeten vorher verschiedene Zahlen für dieselbe Datei), toter Code und ein
  doppelter 24-Zeilen-Kommentar raus, zwei Typ-Umgehungen weg – eine davon hatte
  für die § 14-UGB-Pflichtangaben genau die Prüfung abgeschaltet, deren Fehlen
  die Lehre des Vortags war.
  **Alle sechs Tore grün, Typprüfung 0 Fehler.**

- **2026-07-30** – **Rückfluss Teil 7: der Live-Gang selbst.** Abschnitt 000 des
  Berichts plus zwei alte Muss-Punkte. Alles davon ist beim UMSCHALTEN einer
  echten Kundenseite aufgefallen, nicht beim Bauen – und keine der Prüfungen
  hätte es gefunden.
  **Die Typprüfung lief nie** (sie hing an einer Bedingung und meldete
  „übersprungen"): erster Lauf, 50 Fehler. Darunter die Geo-Koordinaten, die
  unter einem Feldnamen gelesen wurden, den es nie gab – der ganze geo-Block
  fiel still weg, obwohl `npm run karte` die Werte extra ausgibt. Dazu eine
  kaputte Frontmatter-Grenze und ein Katalog-Eintrag, der auf der ganzen Seite
  typlos war (39 Folgefehler aus einem Wort).
  **Der Versand** liegt jetzt auf einer eigenen Unterdomain (der SPF-Eintrag
  der Hauptdomain trägt die gesamte Geschäftspost), die „Sensitive"-Falle steht
  als Warnkasten in der Anleitung, und die Resend-Region hängt am Rechtstext.
  **Vier Fehlalarme** abgestellt, darunter der teuerste: Die Marker-Suche fand
  „XXX" in der BIC jeder Bank – **jeder Kunde mit Bankverbindung** wäre am
  Live-Gang gehindert worden.
  **Die Bestätigungsmail** ist gestaltet und trägt nicht mehr den Betreff der
  internen Benachrichtigung; **die Sichtprüfung** misst jetzt abgeschnittenen
  Text und Tippflächen und fährt eine vierte Breite (430 px); **das
  Redaktionssystem** schließt Entwürfe aus, schreibt Kennungen um statt sie zu
  verwerfen und hält bei einem Schwund um mehr als die Hälfte an.
  Zwölf Commits, jeder Punkt gegengeprüft.

- **2026-07-29** – **Erster Testlauf mit einem echten Kundendesign.** Ein
  Autohaus-Design (11 Seiten, 23 Blöcke, 19 Komponenten) wurde aus der frischen
  Vorlage portiert – Klon per `degit` über GitHub, also genau der Weg des
  Kunden. Ergebnis: 15 Routen, alle fünf Tore grün.
  **Sieben Motor-Fehler gefunden und behoben** (Commits d2bb67b, 4444d4a,
  b6f7c47, c53496b): Die Sichtprüfung erfand Kontrastwerte für Verläufe
  (78 von 85 Befunden waren Geister, mit einem Rat, der ein einwandfreies
  Design kaputtmacht); Konturschrift galt als unlesbar; das Prüf-Tor wurde an
  seiner eigenen Dokumentation rot; `bild()` kannte kein SVG, also kam das Logo
  nie an; die Vorlage lieferte eine erzeugte Datei mit, die jeden Klon rot
  machte; das Mobilmenü schloss an einer fest verdrahteten Breite; fehlende
  `-webkit-`-Schreibweise beim Milchglas des Kopfes.
  **Der eigentliche Befund ist aber keiner davon.** Nach fünf Korrekturrunden
  waren alle Tore grün – und ein Abgleich mit der Design-Vorlage fand danach
  **65 weitere Befunde (11 schwer)**, von denen **kein einziger** von einem Tor
  gemeldet worden war: ein fehlender Schwebeknopf auf allen Seiten, zwei
  Rechtsseiten ohne Kopfband, eine fehlende und eine erfundene FAQ-Frage, ein
  nicht gebauter Formular-Zustand, drei Kartenplätze mit zwei Karten, eine
  Einblend-Bewegung ohne Schalter. Vollständig in `ABGLEICH.md` des Testklons.

- **2026-07-29** – **Rückfluss Teil 6: Der Betrieb pflegt selbst.** Der Motor
  hatte dazu kein Rezept – in einem Kundenklon entstanden rund 1.170 Zeilen von
  Grund auf, ein zweiter baute dasselbe anders und mit derselben Lücke. Jetzt
  ein branchenneutraler Baustein (`redaktion/`, CLAUDE.md 6c), paketfrei über
  die HTTP-Schnittstelle. Kernsatz: *Der Dienst schreibt Dateien, der Motor
  baut aus Dateien* – beim Bauen wird nichts abgefragt.
  **Der Kernpunkt war die fehlende Sicherung:** Beide Klone versprachen in
  ihrer Doku, die Website lebe auch ohne den Dienst weiter – und in beiden gab
  es nichts, was den gepflegten Stand je ins Projekt zurückgeschrieben hätte.
  Der Motor liefert jetzt den nächtlichen Ablauf mit (Bilder inbegriffen, nur
  bei Änderung, zusätzlich per Webhook und Knopfdruck), und das Prüf-Tor hält
  den Live-Gang an, wenn er fehlt. Dazu behoben, bevor es zum ersten Mal
  auftreten konnte: Fotoname aus dem Bildinhalt statt aus der Position (ein
  getauschtes Foto kam sonst nie an), jeder Netzzugriff mit Zeitlimit und
  zweitem Versuch, JSON statt erzeugtem Code, eine einzige Zusammenführung
  statt Handverdrahtung je Feld, Eingabemaske erzeugt statt handkopiert.
  Zwei Fehler beim Bauen selbst gefunden und gemessen: `process.exit()` bei
  offener Netzverbindung stürzt unter Windows ab (der gemeldete Ausfall wäre
  als Absturz angekommen), und `git add` mit zwei Pfaden bricht ganz ab, wenn
  einer noch fehlt – ein Betrieb, der nur Texte pflegt, hätte nie eine
  Sicherung bekommen. Bewiesen: 21 Prüfungen gegen einen selbst gestellten
  Server, die ganze Kette vom Eingabefeld bis aufs gebaute HTML, und jede der
  fünf neuen Prüf-Regeln absichtlich zum Anschlagen gebracht.
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
