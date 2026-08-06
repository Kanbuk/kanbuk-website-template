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
- [ ] **48 Befunde der Gesamtprüfung sind noch offen.** *(kein Blocker für den
      Demo-Weg)* Die Gesamtprüfung vom 02.08.2026 (144 Agenten, 13 Blöcke, jeder
      Fund gegengeprüft) fand 154 Befunde. **106 davon sind am 03.08.2026
      behoben** – zehn Blöcke, jeder einzeln mit allen sechs Toren abgeschlossen.
      Was bleibt, steht vollständig in `OFFEN.md`:

      | Block | offen | davon schwer |
      | --- | --- | --- |
      | 10 Zugesagt, nie gemessen | 8 | 3 |
      | 1 Neutralität (Rest) | 7 | 2 |
      | 6 Live-Weg | 8 | 3 |
      | 8 Frischer Klon | 8 | 1 |
      | 9 Alte Reste / Over-Engineering | 7 | 1 |
      | 11 Abgleich gegen den echten Port | 10 | 2 |
      | Vollständigkeits-Kritiker | 9 | – |

      Etliche sind durch die zehn erledigten Blöcke schon miterledigt (bei 1, 6
      und 8 die schweren Punkte). Realistisch bleiben 25 bis 30.
      **Reihenfolge:** 11 → 6 → 10 → 9 → 1 → 8. Block 11 zuerst, weil er als
      einziger NEUE Erkenntnis bringt – was musste der echte Port selbst bauen?
      Alles andere ist Aufräumen.

      **Die Gegenprüfung der Reparatur-Sitzung selbst ist abgeschlossen**
      (03.08., Nacht): 40 Befunde behoben, 26 in zwei Angriffs-Durchgängen
      widerlegt. Aus diesem Block ist nichts mehr offen; Einzelheiten mit
      Commits in `OFFEN.md`. **Offen bleibt allein der Restbestand oben.**

- [ ] **Die Belegbasis des Motors ist EIN Port.** *(kein Blocker)* Alle Sätze
      der Form „in einem Kundenprojekt", „im Piloten", „an einer echten
      Kundenseite belegt" – 28 Stellen allein in CLAUDE.md – meinen denselben
      Klon: ein Autohaus mit Katalog. Dazu ein paar Verkaufs-Demos, die nie live
      gingen. Steht seit 03.08.2026 im Kopf von CLAUDE.md. Ob eine Regel beim
      Wirt oder in einer Praxis genauso greift, ist damit **nicht erwiesen** –
      was bei diesem Port schiefgegangen ist, aber sehr wohl eine bewiesene
      Falle. Der nächste echte Relaunch ist der Test.
- [ ] **Vier Bausteine vergrößern Tippziele auch am Zeigegerät.** *(kein
      Blocker)* Navigation, Kopf, Fuß und Einbettung setzen `min-height: 44px`
      ohne Handy-Medienabfrage. Nach der eigenen Regel („NUR am Handy") eine
      Abweichung, praktisch folgenlos. Bewusst offen gelassen.
- [ ] **Auftragsverarbeitung Kanbuk ↔ Kunde.** Wer den Versand-Schlüssel hält und
      deployt, ist Auftragsverarbeiter und braucht mit jedem Kunden einen Vertrag
      nach Art. 28 DSGVO.

      **Entschieden am 05.08.2026:** Der Inhaber schließt ihn beim Onboarding
      mit jedem Kunden ab. Damit ist es keine offene Motor-Frage mehr, sondern
      ein Schritt im Ablauf – er steht jetzt im `/deploy`-Skill (Weg B) vor dem
      Umschalten auf live.

      **Nicht zu verwechseln mit dem Vertrag, den die Datenschutzerklärung
      bereits nennt.** Der betrifft den HOSTER (Kunde ↔ Vercel) und steht dort
      als Aussage über die Grundlage des Hostings. Der hier gemeinte ist der
      zwischen Kanbuk und dem Kunden – zwei verschiedene Verträge, und der
      Satz in der Erklärung deckt den zweiten nicht ab.
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

## Offen aus dem Rückfluss vom 06.08.2026

Die Reihenfolge stammt aus der Rückmeldung selbst. Punkt 1, 3 und 5 sind
erledigt (siehe Verlauf); das hier ist der Rest.

### Der grosse Punkt: doppelte Anmeldung (Double Opt-in)

**Gebaut am 06.08.2026** – der Weg läuft vollständig: Signaturen
(`src/lib/mail-links.ts`), beide Endpunkte (`api/bestaetigen.ts`,
`api/abmelden.ts`), der Abzweig in `kontakt.ts`, die Opt-in-Mail, der
Listeneintrag samt Abmeldelink, fünf Antwortseiten und drei Sicherungen im
Prüf-Tor. Kein neues Paket – `node:crypto` reicht.

**Zwei Reste, beide klein:**

- [ ] **Die Datenschutzerklärung beschreibt die Verteilerliste noch nicht von
      selbst.** Trägt ein Formular Adressen ein, müssten zwei Sätze automatisch
      entstehen: dass die Adresse an einen Versanddienst geht, und wie man sich
      abmeldet. Heute müsste ein Port sie tippen – also wieder ein Handschalter,
      und genau die hat der Motor bei Diensten und Einbettungen längst
      abgeschafft. *(kein Blocker, solange kein Kunde eine Liste führt)*
- [ ] **Das neunte Tor kennt die zwei neuen Endpunkte nicht.** Es ruft nur
      `/api/contact` an. Beide neuen liessen sich nebenwirkungsfrei prüfen:
      ohne gültige Signatur passiert nichts. *(kein Blocker)*

**Sieben Stellen, an denen die Klon-Lösung zu eng war** – sie kannte genau
einen Betriebstyp. Wer weiterbaut, braucht sie alle:

1. **Der Endpunkt nahm `formulare[0]`.** Ein Betrieb mit Kontakt- *und*
   Anmeldeformular bestätigt damit das falsche. Die Formular-Kennung gehört
   in den Link **und in die Signatur** – sonst lässt sie sich tauschen.
   *(erledigt in `mail-links.ts`)*
2. **Der Bestätigungslink lief nie ab.** Wer ihn in einem weitergeleiteten
   Mailverlauf findet, kann die Adresse erneut eintragen. Vierzehn Tage.
   Der **Abmeldelink** bleibt ausdrücklich unbegrenzt – ein abgelaufener
   wäre ein Rechtsproblem. *(erledigt in `mail-links.ts`)*
3. **Der Listeneintrag hing allein an der Umgebungsvariablen.** Damit landet
   jeder, der ein Kontaktformular ausfüllt, in der Verteilerliste – und es
   sieht hinterher so aus, als hätte er zugestimmt. Er gehört an eine
   ausdrückliche Angabe am Formular (`inVerteilerliste`). *(Feld angelegt)*
4. **Der Abmeldelink hing an jeder Bestätigungsmail**, auch der eines reinen
   Kontaktformulars. Von einer Anfrage kann man sich nicht abmelden.
5. **Die Erfolgsmeldung hing an einem handgesetzten Prop.** Wer ihn vergisst,
   sagt „gesendet", während nichts passiert ist. Der Standard muss sich aus
   `doppelteAnmeldung` ableiten, nicht aus Sorgfalt.
6. **Der Weg OHNE JavaScript ist auch im Klon falsch geblieben:** Er landet
   auf `/danke`, und dort steht „Wir haben Ihre Anfrage erhalten". Bei einer
   doppelten Anmeldung ist das die Unwahrheit. Es braucht eine eigene Route
   (`/postfach-pruefen`) – die Adresszeile kann eine statische Seite nicht
   lesen.
7. **Die Opt-in-Mail duzte fest.** Sie ist die erste Mail, die ein
   Interessent überhaupt bekommt; beim Standardfall `ansprache: 'sie'` ist
   das falsch.

### Die restlichen Funde (hängen an Betriebstypen)

- [ ] **Fund 1:** Eine **einsprachig englische** Website ist nicht baubar –
      `sprache="en"` erzwingt ein `/en`-Präfix. *(kein Blocker)*
- [ ] **Fund 2 + 10:** `<Rechtslinks />` kann nur Deutsch und zielt immer auf
      die deutschen Rechtsseiten. Steht schon in OFFEN.md. *(kein Blocker)*
- [ ] **Fund 3:** Ein Formular mit **Icon-Absendeknopf** ist nicht baubar –
      jede naheliegende Behelfslösung fällt bei einem Tor durch. *(kein Blocker)*
- [ ] **Fund 4:** Der Datenschutz-Hinweis kann doppelt stehen, im zweiten
      Fall falsch. *(kein Blocker)*
- [ ] **Fund 5:** Die Erfolgsmeldung ist nicht je Formular setzbar.
      *(kein Blocker)*
- [ ] **Fund 6:** Der Motor kann nur **Betriebe** abbilden, keine
      Privatpersonen – `LocalBusiness` mit Wohnadresse, Impressum mit
      Angaben, die auf eine Privatperson nicht anwendbar sind. *(kein Blocker)*
- [ ] **Fund 7:** Zweck, Rechtsgrundlage und Speicherdauer sind nicht **je
      Formular** setzbar. Ein Kontaktformular und eine Anmeldeliste haben
      verschiedene – die Erklärung behauptet für beide dasselbe.
      *(kein Blocker)*
- [ ] **Fund 8:** Eine Anmeldeliste ohne Abmeldeweg. Hängt am selben Bau wie
      die doppelte Anmeldung. *(kein Blocker)*

## Motor-Meldungen (fürs Master-Template)

<!-- PFLICHT bei Motor-Schwächen (Bug, irreführende Doku, fehlendes Rezept), die
     JEDEN frischen Klon beträfen: Was, Datei, warum allgemein, ggf. Fix-Commit.
     Details: CLAUDE.md Abschnitt 0 → „Motor-Meldung". Der Inhaber trägt diese
     Punkte ins Master-Template zurück – NICHT selbst am Template arbeiten. -->

- **Das Design-Tor kennt nur EINE Export-Form.** `npm run abgleich` erwartet
  alle Seiten in einer Datei, jede unter `<sc-if value="{{ isX }}">` direkt in
  `<main>`. Claude Design liefert aber auch eine zweite Form: **eine Datei je
  Seite**, und der Schalter im Inneren steht dort für etwas anderes (bei einem
  vorbereiteten Gastro-Design: die Sprache, `{{ de }}` / `{{ en }}`).

  In dieser Form erkennt das Tor **null Seiten** – und lief bis 05.08.2026
  trotzdem grün durch. Also derselbe Zustand, den der Kasten für die FEHLENDE
  Design-Datei längst abstellt, nur eine Ebene später und deshalb übersehen.
  Punkt 3c der Definition of Done galt damit als erfüllt, ohne dass ein
  einziger Block verglichen wurde.

  *Vorläufig behoben:* Null erkannte Seiten sind jetzt ein Abbruch mit
  Diagnose, kein Haken (`scripts/abgleich.mjs`, gegengeprüft an beiden
  Export-Formen: alte Form 11 Seiten/43 Blöcke unverändert, neue Form bricht ab
  und nennt die Dateien). *Offen bleibt:* Das Tor auf die zweite Form zu
  erweitern – eine Datei je Seite, Zuordnung über den Dateinamen. Bis dahin
  ersetzt Punkt 3d (das eigene Auge) den Vergleich, und der ist ohnehin Pflicht.

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

- **2026-08-06** – **Rückfluss aus einem abgeschlossenen Kundenprojekt
  (Künstler/Label, einsprachig englisch, mit Anmeldeliste).** 14 Motor-Funde,
  ein neuer Baustein und ein Vorschlag zur Auffindbarkeit in KI-Antworten.
  Motor auf 2026.8.6. **Sechs Punkte eingearbeitet, jeder mit Gegenprobe:**

  **Fund 11 + 12 (blockierten den Live-Gang).** Die Ausnahmeliste für
  noindex-Hilfsseiten prüfte den *Pfadanfang* – und `/en/danke` beginnt mit
  `en`. Damit meldete das Prüf-Tor beim Live-Gang **jeder zweisprachigen
  Seite** einen Fehler für eine Seite, die der Motor selbst absichtlich
  sperrt. Dieselbe Liste stand zweimal da (Tor + Sitemap-Filter), mit dem
  Kommentar „wer eine ergänzt, muss BEIDE anfassen" – genau das ging zweimal
  schief. **Ein Kommentar ist kein Mechanismus:** jetzt `hilfsseiten.json`,
  eine Liste, zwei Leser, verglichen wird der letzte Pfadteil. Dazu die
  UID-Warnung, die auch bei leerem Feld feuerte – dem richtigen Wert für
  jeden ohne Gewerbe. Sie liess sich nur durch eine erfundene Nummer im
  Impressum abstellen. Warnungen, die man nicht erfüllen kann, bringt man
  sich bei zu überlesen.

  **Fund 9 – und die zweite Zeitbombe daneben.** Die Jahreszahl der Fusszeile
  wurde beim Bauen gerechnet; am 1. Jänner steht auf jeder Seite jedes Klons
  das Vorjahr. Beim Nachsehen fiel eine zweite Stelle derselben Klasse auf,
  die *nicht* gemeldet war und schwerer wiegt: Ein Datumsfeld mit
  `minDatum: 'heute'` bekam seine untere Grenze ebenfalls beim Bauen – eine
  im Juni gebaute Seite liess im Dezember eine Reservierung für einen Tag im
  Juni zu. Beide ziehen jetzt im Browser nach, in der Zeitzone des Betriebs.
  Die Referenzseite fährt dafür ein Datumsfeld mit; sonst prüft es kein Tor.

  **Fund 13 + 14 + Markenkopf.** Die Rechtsform stand im Fuss jeder Mail,
  auch bei einer Privatperson – § 14 UGB gilt für eingetragene Unternehmen.
  Erkannt wird es jetzt an der Firmenbuchnummer. Dazu ein Kommentar an der
  Stelle, an der `List-Unsubscribe`-Kopfzeilen sonst landen: Sie stufen eine
  Mail als Massenversand ein, während eine Bestätigung die Quittung für eine
  einzelne Handlung ist; in einem Kundenprojekt landete sie deshalb im Spam.
  Der Kommentar nennt ausdrücklich **beide** Fälle – für ein echtes
  Rundschreiben sind die Kopfzeilen Pflicht. Und der Markenkopf der Mails
  liegt jetzt an einer Stelle statt an dreien, mit den zwei Fallen, die in
  echten Postfächern aufliefen (die Farbe am Bild ist die Farbe des
  *Alternativtextes*; ein Name, der wie eine Domain aussieht, wird von Gmail
  selbst verlinkt).

  **Fund 2a – der KI-Schalter.** `robots.txt` schrieb `User-agent: *`: Jeder
  KI-Crawler durfte, ohne dass es jemand entschieden hätte. Jetzt
  `ki-crawler.json` mit 24 Kennungen, jede bei ihrem Anbieter nachgesehen und
  mit Quelle und Datum hinterlegt. **Drei Stufen statt der vorgeschlagenen
  zwei:** Beim Nachschlagen kam heraus, dass die Anbieter ihre Crawler nach
  Zweck trennen. Damit wird `kiSuche: 'nur-suche'` möglich – sichtbar in
  KI-Antworten, aber kein Trainingsmaterial. Das ist die Wahl, die die
  meisten Betriebe eigentlich meinen.

  **Fund 2b – `llms.txt`.** Gebaut und ehrlich eingeordnet: **Kein grosser
  Anbieter sagt zu, sie zu lesen**, Google hat sich ausdrücklich dagegen
  geäussert, und die grosse Mehrheit der vorhandenen Dateien sieht null
  Abrufe. Sie kostet nichts und ist da, falls sich das ändert – der
  Dateikopf sagt in dieser Deutlichkeit, dass die Wirkung unbelegt ist.

  **Der grosse Punkt ist NICHT fertig:** die doppelte Anmeldung. Gebaut ist
  bisher nur der Baustein für die signierten Links (`src/lib/mail-links.ts`,
  Bordmittel, kein neues Paket) – mit drei Verallgemeinerungen gegenüber dem
  Klon, der nur einen Betriebstyp kannte. Was noch fehlt, steht unten unter
  „Motor-Meldungen".
- **2026-08-05** – **Unabhängige Nachprüfung der Grenze Design/Motor.** Sechs
  Prüfer je eine Dimension, danach je ein Skeptiker gegen ihre Funde. Ergebnis:
  Die unsichtbare Schicht ist vollständig, die Design-Werte kommen an und
  schlagen die Motor-Skala, die Fußzeile ist zerlegt. **Neun Funde behoben**,
  jeder am Code oder im Browser nachgemessen – darunter: `--kopf-hoehe` setzte
  niemand (jede Sprungmarke landete hinter der klebenden Leiste, auf jeder
  Seite jedes Kunden); das Design-Tor maß die zwei Seiten in verschiedener
  Fensterbreite und konnte grün melden, ohne eine Seite verglichen zu haben;
  der Zustimmungs-Häkchen-Test klickte das Kästchen statt den Text daneben und
  maß damit eine Selbstverständlichkeit; die Fußzeilen-Regel konnte
  rechnerisch nie anschlagen; `:where()` konnte das Browser-Tor nicht rot
  machen. **Zwei Lehren über die Gegenproben selbst:** Eine frühere eigene
  Messung war unrealistisch (Fußzeile ohne die Pflichtteile nachgestellt), und
  ein erster Gegentest blieb grün, weil er nach dem falschen Text suchte –
  eine grüne Gegenprobe muss selbst gegengeprobt werden. **Offen geblieben:**
  drei Stellen, an denen der Motor seine EIGENEN sichtbaren Texte nur deutsch
  liefert (Rechtslinks-Ziele, Einwilligungs-Banner, die drei Zeit-Bausteine).
  Blockiert einen einsprachigen Piloten nicht, gehört vor den nächsten
  zweisprachigen Kunden erledigt. Einzelheiten in OFFEN.md.
- **2026-08-05** – **Paket 6 des Motor-Umbaus: „offene Fehler".** Als Kleinkram
  geplant, zwei der Punkte waren keiner. (1) Der Slider trug Reiter-Rollen
  (`role="tab"`, `aria-selected`) ohne die Mechanik dazu – ein Vorleseprogramm
  kündigte Registerkarten an, die Pfeiltaste tat nichts. Jetzt `role="group"`
  und `aria-current`. Dabei kam heraus, dass **das Bedien-Tor die falsche
  Auszeichnung erzwang**: Es prüfte auf `aria-selected`. Aufgefallen ist es
  erst, weil die Referenzseite jetzt einen Slider hat – vorher stand er in
  jedem Lauf unter „NICHT GEPRÜFT". (2) Die Verpixelungs-Regel im Sicht-Tor war
  nicht doppelt, sondern **tot**: Bei `srcset` meldet `naturalWidth` immer die
  Anzeigebreite, die Rechnung kommt nie über die Schwelle. Am echten Fall
  gemessen: null Funde bei fünf Breiten, während `npm run bildschaerfe`
  denselben Fall überall fand. Raus, mit Begründung an ihrer Stelle.
  (3) `npm run karte` beendete sich bei nicht gefundener Adresse mit einem
  Haken und legte ein graues Gitter als „Karte" ab – jetzt lauter Fehler.
  (4) `stock.mjs` bleibt bewusst.
  **(5) Der Fund, der nicht geplant war:** In der Fußzeile jeder Seite stand
  „ImpressumDatenschutz" in einem Wort. Ursache war die Astro-Abgrenzung – die
  Anordnung lag im Elternteil, das Element gehört dem Baustein, die Regel fand
  nichts. Kein Tor meldete es; gefunden hat es das Auge im Kontaktbogen.
  Nachgemessen: **alle zwölf Bausteine mit `class`-Eingang** waren betroffen,
  jede Design-Regel auf einen von ihnen wäre wirkungslos geblieben. Alle
  reichen die Kennung jetzt durch, einzeln im Browser gemessen; eine
  Prüf-Tor-Regel hält es fest.
- **2026-08-05** – **Rückfluss aus einem zweisprachigen Beauty-Relaunch, zweiter
  Testlauf des Motors.** Ein strukturierter Befund über 66 Posten, davon 60
  bestätigt. Er stammt aus dem ZWEITEN vollständig durchgezogenen Port
  überhaupt – und der ist ein anderer Betriebstyp als der erste: zweisprachig,
  Relaunch auf eine Adresse mit laufender Geschäftspost, echter Adressumzug,
  **ohne Katalog**. Deshalb ist auch der Beleg-Kasten in CLAUDE.md Abschnitt 0
  fortgeschrieben; er behauptete bis heute, hinter allen Sätzen stehe derselbe
  eine Port.

  **Drei neue Tore, damit es jetzt neun sind:** `unterlaengen` (abgeschnittene
  g, j, p, q, y bei Verlaufs-Überschriften – nichts läuft über, nichts meldet
  sich, und auf einem Bildschirmfoto sieht ein halbes „g" aus wie ein „g"),
  `bildschaerfe` (kommt auf einem 2×-Bildschirm genug Auflösung an?) und
  `endpunkt` (ruft den Formular-Empfänger wirklich an; läuft in
  `check -- --live` mit). Das letzte hat den teuersten Anlass: Der Empfänger
  war in einem Klon DREIMAL tot, jedes Mal bei komplett grünen Toren – alle
  anderen Tore sehen sich die gebaute Website an und rufen nie den Server an.

  **Redaktionssystem, 13 von 15 Posten.** Der Weg HINEIN war eine Einbahnstraße
  (`npm run studio`, `npm run erstbefuellung`), die Abfrage las aus dem
  Zwischenspeicher und backte verworfene Stände ein, die nächtliche Sicherung
  meldete Erfolg auch ohne etwas geholt zu haben. Dazu die Bildbeschreibungen:
  Ein selbst hochgeladenes Foto heißt nach seiner Prüfsumme und hätte sonst
  nirgends einen Alt-Text – jedes Fotofeld verlangt jetzt ein
  `beschreibungsfeld` daneben, und beim Abholen wird gewarnt, wenn ein Foto
  getauscht wurde und seine Beschreibung nicht. Und das Prüf-Tor liest die
  Feldzugehörigkeit jetzt aus `DOKUMENTE`, statt sie am Punkt im Pfad zu raten.

  **Vier Rechtsbefunde.** Kammer und Gewerbebezeichnung standen in EINEM Feld,
  dessen Musterwert die Kammer war – wer den Registerwortlaut korrekt einträgt,
  löschte damit eine Pflichtangabe. Der Widerruf nach Art. 7 Abs. 2 fehlte in
  der Rechteliste, obwohl der Widerruf-Knopf in der Seite steht. Die
  Datenschutzerklärung führte die erhobenen Daten unter dem Betreff der
  internen Mail auf. Und Zustimmungs-Häkchen verlinken jetzt, was sie nennen
  (`labelLinks`), mit zwei Toren dahinter – eines davon klickt mit dem Zeiger
  und misst nach, dass der Link das Häkchen NICHT setzt.

  **Zweisprachigkeit, acht Posten.** Der Motor BAUT zweisprachige Seiten, aber
  alles, was er selbst dazutat, war deutsch: Sprachverweise fehlten auf allen
  Rechtsseiten (die Bedingung fragte `site.seiten`, dort steht die
  Datenschutzerklärung nie), der Sprungmarken-Link, die Antworten des
  Formular-Servers, die Bestätigungsmail, der 2-Klick-Hinweis. Alles hängt
  jetzt an einer Stelle: `src/lib/sprachrouten.ts` liest das Verzeichnis
  `src/pages/en/` – eine Liste in der Config würde beim nächsten Verschieben
  einer Datei driften. Die Datenschutzerklärung steht seither EINMAL da, in
  beiden Sprachen nebeneinander; die bisherige Handkopie kam mit dem Warnsatz
  „muss mitgeändert werden" und wäre schon durch die Änderungen dieser Woche
  zurückgefallen. Der deutsche Text ist dabei Wort für Wort unverändert –
  maschinell verglichen.

  **Regelwerk, 18 Posten.** Neu: `vorlagen/UMSTELLTAG-VORLAGE.md`, ein Ablauf
  für den Relaunch (die eine Regel obenauf: erst umschalten und prüfen, DANN
  die Adresse umhängen). Im `/deploy`-Skill der Abschnitt B2, die
  Firewall-Regel als Ablaufschritt und die Weiterleitung der Abnahme-Adresse.
  Im `/port`-Skill ist die falsche Dreierliste „nur noch drei Dinge" ersetzt –
  CLAUDE.md hatte genau diesen Satz längst als falsch markiert, während er im
  Skill unverändert stand, und der Skill liegt näher am Handeln. In CLAUDE.md
  neu: Abschnitt 6d (die vollständige Zweisprachigkeits-Liste), 16 px als
  dritte Motor-Untergrenze, die Gewerbe-Regel, die `.js`-Endung für alles, was
  der Server liest, und die Rubrik „Nach dem Live-Gang (blockiert nicht)".

  **Zwei Funde stammen aus dem eigenen Auge, nicht aus einem Tor:** In der
  Datenschutzerklärung stand das Zustimmungs-Häkchen als ganzer Satz mitten in
  der Datenaufzählung („Name, E-Mail, Telefon, Nachricht, Ich habe die
  Datenschutzerklärung gelesen."). Und das Häkchen selbst stand auf der Seite
  UNTER seinem Satz, bei 1440 px mittig im Nichts – der Formular-Baustein
  hatte bis heute nie ein Ankreuzfeld zu sehen bekommen, weil die
  Referenzseite keines hatte. Beides beim Lesen von `pruefung/texte.md` und
  beim Ansehen der Kontaktbögen gefunden. Die Referenzseite führt das Häkchen
  jetzt mit, damit der Weg nicht wieder ungeprüft bleibt.

  Alle neun Tore grün, Kontaktbögen angesehen.

  **Nachprüfung desselben Tages, und sie hat sich gelohnt.** Jeder der sechs
  Befund-Abschnitte wurde einzeln gegen den Template-Stand gehalten, danach ein
  Skeptiker auf jedes „erledigt" angesetzt. Ergebnis: neun Posten waren nur
  halb da – und die Hälfte davon in Dingen, die als fertig gemeldet waren.

  - **Die Sprache lief an drei Stellen aus.** Die häufigste Formularmeldung
    überhaupt („Bitte ausfüllen: …") nannte die DEUTSCHEN Feldnamen, auch auf
    einer englischen Seite; die Ausfall-Meldung hängte „Telefon …" in einen
    englischen Satz; und die Angaben-Liste der Bestätigungsmail war die einzige
    Textstelle der Datei ohne Sprachparameter. Dazu der Weg OHNE JavaScript:
    Dort wird der Meldungstext verworfen (der Browser bekommt eine SEITE), also
    landete ein englischer Absender trotz `?lang=en` auf der deutschen
    Fehlerseite. Das Formular sagt dem Server jetzt mit `&en=1`, ob es die
    englischen Antwortseiten überhaupt gibt – nachsehen kann der Server das
    nicht, er läuft in Node ohne Bau-Werkzeug.
  - **Der Motor hatte seine eigene Zeitbombe.** `Oeffnungszeiten.astro`
    rechnete beim BAUEN aus, welche Abweichung noch bevorsteht – genau das,
    was CLAUDE.md Abschnitt 5 seit heute verbietet. Ein Betriebsurlaub, der
    nach dem letzten Bau endet, wäre für immer stehengeblieben. Jetzt
    entscheidet der Browser, in der Zeitzone des Betriebs. Gegengeprüft mit
    vorgestellter Uhr: vorher sichtbar, nachher weg, dazwischen genau der eine
    abgelaufene Eintrag ausgeblendet.
  - **Der Grund, warum es niemand sah:** Die Referenzseite baute den Baustein
    gar nicht – kein `<Oeffnungszeiten />`, keine `sonderzeiten` in der Config.
    Beides steht jetzt drin. Was die Referenzseite nicht baut, prüft kein Tor.
  - **Zwei tote Regeln.** Die Abbruchbedingung der Erstbefüllung zählte
    Dokument-TYPEN statt Inhalte und war damit konstant falsch; `--probe` stürzte
    im leeren Fall ab. Und meine erste Fassung der Feiertags-Regel suchte im
    gebauten HTML nach abgelaufenen Terminen – die der Bau vorher wegfiltert.
    Sie liest jetzt die Config.
  - **Der Link im Zustimmungs-Häkchen hatte keine einzige Stilregel.** Setzt
    eine Design-Datei `a { text-decoration: none }`, ist er von Text nicht mehr
    zu unterscheiden – und beide Tore bleiben grün, weil das eine `<a href=`
    sucht und das andere klickt.
  - **Die Tor-Zählung war durch die drei neuen Tore selbst falsch geworden:**
    Überschrift „die sechs Tore" über neun Zeilen, und die Definition of Done
    kannte `unterlaengen`, `bildschaerfe` und `endpunkt` gar nicht. Genau die
    Verwirrung, gegen die die Nummerierung einmal eingeführt wurde.
  - Dazu: Danke- und Fehlerseite siezten in Titel und Beschreibung hart; die
    Search-Console-Auswertung, der 16-px-Vorrang, das Unterlängen-Rezept und
    die Rubrik „Nach dem Live-Gang" fehlten in den Skills; die
    Anleitungs-Vorlage behauptete eine Wartezeit, die ohne Webhook falsch ist.

  Version bleibt **2026.8.5** – sie folgt dem Kalender, und ein zwischendurch
  gesetztes 2026.8.6 hätte den Motor auf morgen datiert.

  **Zwei Entscheidungen des Inhabers, gleicher Tag:**

  - **Lighthouse bleibt bei ≥ 95** – die Zusage wird nicht abgeschwächt, weil
    sie hält: gemessen durchgehend 99/100. Geändert hat sich nur die
    Ehrlichkeit darüber, WER sie prüft. Es ist der einzige Punkt der Definition
    of Done, den kein Tor misst, und er stand zwischen neun automatischen
    Prüfungen – das las sich, als liefe er mit. CLAUDE.md sagt es jetzt
    ausdrücklich, und der `/deploy`-Skill hat den Messschritt.
  - **Der Auftragsverarbeitungsvertrag wird beim Onboarding je Kunde
    geschlossen.** Damit ist er keine offene Motor-Frage mehr, sondern ein
    Ablaufschritt vor dem Umschalten (`/deploy`, Weg B, Schritt 0a). Dabei
    festgehalten, weil es sonst irgendwann jemand verwechselt: Der Vertrag, den
    die Datenschutzerklärung nennt, betrifft den HOSTER. Der hier ist der
    zwischen Kanbuk und dem Betrieb – zwei verschiedene, und der Satz in der
    Erklärung deckt den zweiten nicht ab.

- **2026-08-03 (abends)** – **Rückfluss aus einem zweisprachigen Beauty-Piloten
  (Relaunch, Deutsch + Englisch, 16 Seiten).** Elf Funde, alle im Klon zuerst
  behoben und hier nachgezogen. Zwei davon machten die PRÜFUNG selbst
  unzuverlässig – das ist die schlimmste Sorte, weil man sich an falsche rote
  Meldungen gewöhnt und darin die echte übersieht:

  - **Die Kontrast-Prüfung konnte modernes Farb-Syntax nicht lesen.**
    `zuRgb` in `sicht.mjs` las aus `color(srgb 1 1 1 / .72)` – also reinem Weiß –
    die Werte 1,1,1 und damit fast Schwarz. Chrome rechnet JEDES `color-mix()`
    genau dahin aus. Ergebnis im Piloten: **268 gemeldete Kontrastfehler** auf
    Text, der in Wahrheit bei 10,6:1 liegt. Gegenprobe nach dem Fix: 1,00:1 →
    10,54:1, und `rgba()` liefert unverändert dasselbe.
  - **Der Ganzseiten-Screenshot zeigte lazy geladene Bilder als leere Kästen.**
    `fullPage: true` fotografiert alles, stößt aber kein Nachladen an. Damit war
    ausgerechnet der Bogen unbrauchbar – das Bild, mit dem laut Ablauf „mit
    eigenen Augen" geprüft wird. Im Piloten sahen fünf Produktfotos aus wie
    fehlende Bilder. Umgekehrt genauso schlimm: Ein wirklich fehlendes Bild
    erkennt man nicht mehr, weil leere Kästen normal aussehen. Jetzt werden
    Bilder vor dem Auslösen auf `eager` gestellt und über `decode()` abgewartet.
  - **Descriptions mit Apostroph wurden zu kurz gemessen.** Die Regel las
    `content=["']([^"']*)["']` – die Zeichenklasse bricht am ersten Apostroph ab.
    Eine 139 Zeichen lange englische Description galt als 43 Zeichen und wurde
    beanstandet. Gegenprobe: 38 → 77 Zeichen.

  Dazu acht Funde am Motor selbst:

  - **Zweisprachigkeit hörte bei den Motor-Texten auf.** Der Motor baut seit
    Juli englische Routen – sein eigenes Formular blieb deutsch: „Vorname",
    „Senden", deutscher Datenschutzhinweis. Neu: englische Fassung in
    `texte.ts`, `sprache`-Prop am Formular, optionales `labelEn` je Feld.
  - **Das FAQ-Schema ignorierte die Sprache.** Die englische Seite übergibt
    denselben `pfad` und bekam die deutschen Fragen ins JSON-LD, während
    sichtbar die englischen standen – genau das, was Google als „Markup, das
    der Nutzer nicht sieht" verbietet. Neu: `faq`-Prop am BaseLayout.
  - **`og:image:alt` war fest deutsch** und nannte den Betrieb doppelt (er
    steht schon in `og:site_name` direkt darüber). Folgt jetzt der Seitensprache.
  - **Das Mobilmenü hatte keine Fokus-Sperre.** Bei einem vollflächigen Panel –
    im modernen Design der Normalfall – wanderte der Tastatur-Fokus nach dem
    letzten Menüpunkt unsichtbar in die Seite dahinter. Jetzt `inert`.
  - **Die AGB-Seite nummerierte nach Array-Position.** Trägt der übernommene
    Text seine Nummern selbst, stand „1. 1. Allgemeines" auf der Seite. Und
    springt die Nummerierung des Originals (im Piloten 9 → 11, eine Klausel war
    gestrichen worden), nummerierte die Seite einen **Vertragstext
    stillschweigend um**. Jetzt bleibt eine vorhandene Nummer stehen.
  - **`telefon` war Pflichtfeld – ist aber keines.** Nicht jeder Betrieb
    veröffentlicht eine Nummer, und § 5 ECG verlangt keine (die E-Mail-Adresse
    genügt). Die Regel zwang dazu, eine Nummer zu erfinden oder dauerhaft einen
    PLATZHALTER stehen zu lassen, der den Live-Gang blockiert. Impressum,
    Danke-Seite, Fehler-Seite, Kontakt-Text und JSON-LD lassen den Punkt jetzt
    weg, wenn das Feld leer ist.
  - **Im Impressum fehlte § 5 Abs. 1 Z 6 ECG** – die anwendbaren
    berufsrechtlichen Vorschriften samt Zugang dazu. Von acht Punkten war das
    der einzige fehlende, ausgerechnet auf einer Seite, die die Norm selbst
    zitiert. Neuer Abschnitt mit RIS-Link.
  - **`npm run platzhalter` überschrieb ein vorhandenes OG-Bild.** Das
    Port-Rezept lässt erst `npm run og` mit einem echten Foto laufen und danach
    `platzhalter` fürs Favicon – genau dann war das Vorschaubild wieder weg.
    Gemerkt hätte man es erst beim Verschicken per WhatsApp. Jetzt wie
    `karte.jpg`: Vorhandenes bleibt (mit `--force` weiterhin überschreibbar).

  Beim Einpflegen hat das Template selbst zugeschlagen: Die Kundenfrei-Regel
  fand den Namen des Piloten in meinen Kommentaren und machte den Check rot.
  Genau dafür gibt es sie – die Stellen heißen jetzt „Beauty-Pilot".

  `check`, `sicht` und `interaktion` sind grün; beide Prüf-Fixes wurden mit
  Positiv- UND Negativprobe belegt.

- **2026-08-03 (Nacht, später)** – **Der Redaktions-Baustein hat einen Weg
  HINEIN** (Block 11 der Gesamtprüfung, `5f60c89`).

  Anlass: Der nächste Relaunch bekommt Redaktionszugang. Damit waren die zwei
  Block-11-Punkte keine Werkstatt mehr, sondern Blocker.

  Der Baustein war eine **Einbahnstraße**: Er las aus dem Dienst, aber nichts
  brachte etwas hinein. Zwei Lücken, die zweite ist die gefährlichere:

  - **`npm run studio`** legt das Eingabe-Studio als Nachbarordner an. Vorher
    verwies die Anleitung auf einen Ordner, den niemand anlegt – `npm run
    maske` brach mit „Studio-Ordner stimmt nicht?" ab, und was dazwischen
    fehlte, hätte der Auftraggeber selbst tippen müssen. Nebenan und nicht im
    Projekt, weil die Abhängigkeiten des Studios sonst in jedem Build und
    jeder Sicherheitsmeldung der Website steckten.

  - **`npm run erstbefuellung`** bringt den vorhandenen Bestand samt Fotos
    einmalig hinein. Ohne ihn startet das Studio leer, `npm run inhalte` holt
    nichts – **und das sieht nach Erfolg aus**, weil die Sicherung „eine leere
    Antwort überschreibt nie" genau wie vorgesehen greift. Sie verdeckt hier
    aber, dass nie jemand die Inhalte hineingegeben hat. Wer nicht misstrauisch
    wird, übergibt ein leeres Studio mit „ab jetzt können Sie selbst pflegen".
    Die Alternative wäre Abtippen – bei zweihundert Einträgen heißt das: Der
    Baustein bleibt ungenutzt.

  Drei Sicherungen wie beim Holen: schreibt nie über Bestehendes (es ist die
  *Erst*befüllung, kein Abgleich), ohne Schreib-Zugang passiert nichts,
  `-- --probe` zeigt alles ohne Token und ohne Netz. Gegengeprüft an einem
  nachgestellten Dienst: leer → 4 Bilder und 3 Dokumente geschrieben; fünf
  vorhandene Einträge → Abbruch **vor** jedem Schreibzugriff.

  **Neu und über den Baustein hinaus nützlich:** `scripts/lib/ts-aufloeser.mjs`.
  Werkzeuge unter `scripts/` liefen bisher nur auf TEXT – für eine Prüfung
  reicht das, für die Erstbefüllung nicht. Node 24 kann TypeScript von sich
  aus; es fehlten die `.js`-Schreibweise des Motors und `import.meta.glob`.
  Beides in einer Datei nachgereicht, **ohne neues npm-Paket**. Damit liest
  jedes künftige Werkzeug die ECHTE Config statt einer zweiten, still
  abweichenden Fassung.

- **2026-08-03 (Nacht)** – **Die Gegenprüfung der Reparatur-Sitzung ist
  vollständig abgearbeitet: 40 Befunde behoben, 26 widerlegt.**

  Die Rohliste (51 mittlere Befunde) wurde aus den Prüf-Journalen
  rekonstruiert, zu 16 Bündeln gefasst und **gegen den heutigen Code**
  gehalten; jeder Treffer danach von einem Skeptiker angegriffen. Die dabei neu
  gefundenen 41 Punkte gingen durch denselben Angriff plus die Frage *„richtet
  die Reparatur woanders Schaden an?"*. Zusammen 79 Agenten.

  **Das Ergebnis, das den Ausschlag gibt: Jeder dritte Befund hielt nicht.**
  26 Stellen, an denen sonst gesunder Code angefasst worden wäre – und genau
  daraus entstanden die 40 neuen Fehler des Vormittags. Der Angriff auf die
  eigenen Befunde ist damit nicht Gründlichkeit, sondern die billigste Maßnahme
  gegen die Fehlerquelle Nummer eins.

  **Der lehrreichste Fund war ein Fix von derselben Sitzung** (`b8b39c8`, drei
  Stunden alt): `right: var(--raum-s, 1rem)` sollte den Kontaktknopf auf altem
  Gerät an seinem Platz halten. Der Ersatzwert in der Klammer greift aber nur
  bei einer Variablen, die GAR NICHT gesetzt ist – und eine Custom Property
  überlebt jeden Zeichenstrom. Grün ausgesehen hat es, weil `npm run altgeraet`
  Token-Zeilen mit unbekannten Merkmalen LÖSCHTE: In der Nachbildung war die
  Variable ungesetzt, und nur dort wirkte der Ersatzwert. **Das Werkzeug hat die
  Absicherung bestätigt, die in Wirklichkeit nicht wirkt.** Behoben in beide
  Richtungen (`66a5de7`): `@supports` im Bauteil, und das Werkzeug macht
  Token-Zeilen jetzt unauflösbar statt sie zu entfernen. Gemessen, Browser ohne
  `clamp()`: vorher 1224 px vom rechten Rand, jetzt 16.

  **Was ein Kunde von den Reparaturen merkt:** Ein Lokal mit Silvester-Zeit
  18:00–02:00 zeigt nicht mehr den ganzen Abend „Geschlossen". Auf älterem
  Safari lässt sich das Anfrage-Fenster wieder schließen (und steht nicht mehr
  dauerhaft mitten auf der Seite). „Alle akzeptieren" lädt die Karte wirklich.
  Der Anfrage-Dialog nennt nicht mehr den Eintrag des vorigen Klicks. Am Abend
  vor dem Betriebsurlaub steht nicht mehr „öffnet Mo 08:00". Fällt ein Foto
  beim Abholen aus, verrutschen nicht mehr alle Bildbeschreibungen dahinter.

  **Und was an den Toren selbst falsch war** – die Klasse, die am längsten
  unsichtbar bleibt: Das dritte Tor schloss den Dialog per Browser-Aufruf statt
  mit dem Knopf des Bausteins (`data-dialog-schliessen` kam in keiner einzigen
  Prüfung vor). Die `@media`-Kurzform-Regel – der Fall, für den das fünfte Tor
  gebaut wurde – erkannte zwei von fünf Schreibweisen. Die Bau-Marke kannte
  weder den Symbol-Ordner noch `package-lock.json`. Der Vorcheck grenzte einen
  Block über die EINRÜCKUNG ab. Die Hineingeh-Schleife des Design-Tores lief
  nur einen Durchlauf, obwohl der Kommentar drei Ebenen zusagt.

  Neun Commits, jeder mit einer Messung, die **ohne** den Fix fehlschlägt.
  Vollständige Liste in `OFFEN.md`. Offen bleibt nur noch Block B der
  Gesamtprüfung (11 → 6 → 10 → 9 → 1 → 8).

- **2026-08-03 (abends)** – **Die sieben schweren Rückschläge der Tagesarbeit
  behoben, einzeln und je mit eigener Gegenprobe.** Die Gegenprüfung derselben
  Sitzung hatte 40 von 91 Befunden als *neu eingebaut* eingestuft – fast die
  Hälfte dessen, was am Vormittag repariert wurde, hatte etwas beschädigt.
  Sieben davon waren schwer; alle sieben sind erledigt (Liste mit Commits in
  `OFFEN.md`).

  **Die Regel dieser Runde, und sie hat sich bezahlt gemacht:** Keine Änderung
  ohne eine Messung, die **ohne** den Fix fehlschlägt. Bei sieben Befunden hat
  das dreimal die Diagnose korrigiert, bevor Code entstand:
  - Die erste Gegenprobe zu `dialog.ts` war **ungültig** – die Referenzseite hat
    keinen einzigen `data-dialog`, also lief die Absturzzeile nie. Genau deshalb
    hatte auch nie ein Tor etwas gemerkt. Erst eine Probeseite mit Dialog *und*
    Merken-Knopf zeigte es: alt → Merkliste tot, neu → sie reagiert.
  - `browser.mjs` hatte **drei** Ursachen statt einer. Die schwerste: Der von
    CLAUDE.md 4a vorgeschriebene Weg 3 (`@supports`) wurde selbst als Verstoß
    gemeldet – er war überhaupt nicht sauber begehbar.
  - Beim `faq`-Abbruch war nicht die Darstellung das Problem, sondern der
    **Abbruch selbst**: Ein fehlendes Google-Schema darf keine Veröffentlichung
    verhindern. Jetzt Hinweis beim Bauen + harter Fehler im Prüf-Tor.

  **Was kein Tor gefunden hat:** Auf altem Gerät sprang der Schwebeknopf an den
  linken Rand und lag auf den Formularfeldern (`right: var(--raum-s)` ohne
  Ersatzwert *in* der Klammer). Aufgefallen allein beim Ansehen der Bilder aus
  `npm run altgeraet` – die Pflicht aus Punkt 3b der Definition of Done hat sich
  hier zum ersten Mal wirklich ausgezahlt.

  **Neu im Motor:** `src/lib/motorfehler.ts`. Jeder absichtliche Build-Abbruch
  zeigt jetzt einen roten Satz und einen gelben Handlungshinweis statt zehn
  Zeilen Stapelabzug in Dateien, die es gar nicht wirklich gibt. Umgestellt sind
  alle sechs Abbruchstellen (Katalog, Symbole).

  **Offen bleiben ~83 Ursachen, davon 12 schwer** – als Nächstes die zwölf
  mittleren aus der Gegenprüfung, dann Block 11.

- **2026-08-03** – **Die Gesamtprüfung, und zehn von sechzehn Blöcken behoben.**
  Vorlauf war die Prüfung selbst (02.08., 144 Agenten über 13 Blöcke, jeder
  schwere und mittlere Fund von einem zweiten Durchgang angegriffen): **154
  Befunde, 28 schwer.** Die vollständige Liste liegt in `OFFEN.md`.
  Heute abgearbeitet: **106 Befunde in zehn Blöcken**, jeder Block einzeln mit
  allen sechs Toren abgeschlossen und committet.

  **Die Reihenfolge war eine Entscheidung, keine Bequemlichkeit:** zuerst die
  TORE. Über hundert Änderungen zu machen und dabei einem Messgerät zu trauen,
  von dem 22 Befunde sagen, dass es lügt, wäre dieselbe Falle wie beim
  Sprung-Link am 31.07. Erst danach Doku, dann Code.

  **Was die Tore verschwiegen (Block 0a/0b/2b):**
  - Die Blocker-Erkennung in STAND.md las nur die ERSTE ZEILE eines Punktes.
    Einträge sind mehrzeilig, also rutschte „(kein Blocker)" auf die Folgezeile
    und wurde nie gesehen: `check --live` meldete vier Probleme, DREI davon
    Punkte des Motors, zwei mit der Markierung. Jeder Klon startete mit rotem
    Live-Tor. (Beim ersten Reparaturversuch prompt in dieselbe Falle getreten:
    `$` ist unter /m das Ende einer ZEILE, nicht des Textes.)
  - **Fünf der sechs Tore massen `dist/` blind** – nur `check` kannte die
    Bau-Marke. Wer eine Seite ändert und danach `sicht` startet, mass den ALTEN
    Build und bekam grün. Die Marke liegt jetzt in `scripts/lib/bau-marke.mjs`
    und wird von allen benutzt; nachgestellt und bestätigt.
  - Das sechste Tor meldete OHNE Design-Datei Erfolg – Punkt 3c der Definition
    of Done war erfüllt, solange niemand die `.dc.html` ablegt.
  - Die Abschneide-Messung übersah ihre eigene Zielgruppe gleich zweifach: Sie
    warf jeden Knopf mit Symbol raus, und ihr Mehrzeilig-Filter rechnete mit der
    AUSSENhöhe – ein einzeiliger Knopf mit Innenabstand galt als mehrzeilig.
    Der Anlass der ganzen Messung war ein Knopf.
  - Die Bedien-Prüfung sagt jetzt, was sie NICHT geprüft hat: **zehn von
    siebzehn** Prüfungen sind auf der Referenzseite nie gelaufen.
  - Die Kartenlizenz-Regel schlug bei `speisekarte.jpg`, `weinkarte.png` und
    `visitenkarte.jpg` an – beim Wirt ein harter Fehler wegen einer
    Kartenlizenz. Der Dienste-Block fiel bei anderer Einrückung still auf „null
    Dienste" zurück und nahm die halbe DSGVO-Prüfung mit.

  **Was die Doku verschwieg (Block 7/12a/12b):**
  - Das Port-Rezept nannte das sechste Tor „vorgemerkt" – es existiert seit dem
    29.07. Etappe 5 hiess „sechs Stufen, alle Pflicht" und zählte vier auf.
  - Der Deploy-Skill behauptete ZWEIMAL, im Demo-Modus sei das Formular aus.
    Wer das beim Wort nimmt, baut es aus dem Design gar nicht erst nach.
  - Er vergab ausserdem `demo-<betrieb>.kanbuk.com` für die Abnahme-Vorschau –
    dieselbe Adresse, die `npm run demo` für die Verkaufs-Demo belegt.
  - Die README empfahl ein Config-Feld, das es nicht mehr gibt
    (`besucherzaehlung`), samt der Zusage, es ergänze „automatisch den passenden
    Absatz in der Datenschutzerklärung" – und nannte „kein Selbst-Bearbeiten"
    als Grenze, während der Redaktions-Baustein im Repo liegt.
  - „Die einzigen drei Dinge" beim Live-Gang standen wortgleich in beiden
    Pflichtdateien; der Skill kennt deutlich mehr.
  - **Der Port räumte STAND.md nie auf.** Ein Klon trug 834 Zeilen
    Template-Geschichte mit sich, gelesen als „Gedächtnis dieses Kunden".
    Etappe 0 räumt jetzt auf – mit der Einschränkung, dass ein Motor-Punkt, der
    JEDE Kundenseite betrifft, als eigener Punkt übernommen wird.

  **Was den Besucher wirklich getroffen hätte (Block 2a/3/4/5):**
  - Das Mobilmenü rief `matchMedia.addEventListener` (ab Safari 14), zugesagt
    ist Safari 12. Es fällt nicht nur das Menü aus: Der Aufruf wirft, und ALLE
    danach eingehängten Bausteine starten nicht mehr. Drei weitere Fälle
    derselben Art gefunden – genau die, die CLAUDE.md 4a als blinde Flecken
    benennt. Alle hängen jetzt an `src/lib/verhalten/browserluecke.ts`.
  - Der Öffnungs-Status meldete „Geschlossen", solange ein Lokal über
    Mitternacht offen hat – für die Leitbranche des Motors, zur
    Hauptgeschäftszeit, im Kopf jeder Seite.
  - **Bei einer Katalog-Anfrage stand in der Mail an den Betrieb nicht, worum
    es ging.** Das Feld `bezug` hatte kein Ziel im Markup UND wurde in der Mail
    nicht ausgegeben – zwei Fehler in einer Kette, die die Detailseite
    ausdrücklich verspricht.
  - Das Gehalt einer Stellenanzeige diente nur als Schalter; `baseSalary`
    entstand ohne Wert, Google verwirft das Feld.
  - Vier Abweisungen im Türsteher lieferten ohne JavaScript eine rohe
    Datenzeile. Die Grössengrenze zählte Zeichen statt Bytes (Faktor bis 4).
  - Die Datenschutzerklärung behauptete unbedingt, die Bestätigungsmail
    enthalte keine Angaben – ein Schalter kehrt das um. Der Karten-Absatz
    erschien auch ohne Karte, der Merklisten-Absatz hing am Katalog statt am
    Markup. Die AGB-Seite schrieb selbst zwei Vertragsklauseln, obwohl ihr
    eigener Kopf zusagt, keine zu erfinden. Und „Ihre IP wird nach wenigen
    Minuten verworfen" stimmte nicht – hier war der Text richtig und der Code
    falsch, also wurde der Code angepasst.

  **Und ein Fund, der mich selbst betrifft:** In `PRUEFPLAN.md` stand der Name
  eines echten Auftraggebers – von mir am 31.07. eingecheckt, also im
  öffentlichen Repo und ab dem nächsten `degit` in jedem Kundenordner. Die
  Ursache wiegt schwerer als der Fehler: Die Kundenfrei-Prüfung las eine
  HANDGEPFLEGTE Dateiliste, dreimal nachgetragen, beim vierten Mal ging es
  schief. Sie fragt jetzt `git ls-files` – also genau die Menge, die `degit`
  kopiert. Beim allerersten Lauf über die neu erreichten Dateien fand sie
  sofort ein zweites Leck.

- **2026-07-31 (zweiter Teil)** – **Die Punkteliste des Auftrags gegen den echten
  Stand gehalten.** Nicht der Bericht, sondern die *Arbeitsanweisung* selbst:
  17 Punkte, zerlegt in **89 einzelne Anforderungen**. Ergebnis: 44 ganz
  erledigt, 34 halb, 11 offen – und **21 „erledigt" hielten der Gegenprobe
  nicht stand**. Der erste Durchgang hatte Kommentare für Umsetzung gehalten.

  **Zwei Regressionen aus Teil 7 gefunden, beide sofort behoben:**
  - Die Typprüfung, am 30.07. „eingeschaltet", lag INNERHALB der Bedingung
    „nur bauen, wenn sich Quellen geändert haben". Sie lief einmal und danach
    nie wieder – **ohne ein Wort**. Der Wiederholungslauf war damit leiser als
    der alte Zustand: vorher „⚠ übersprungen", danach gar nichts und ein „✓
    Prüf-Tor bestanden" darunter. Dazu kennt die Bau-Marke `api/`, `scripts/`
    und `redaktion/` nicht – wer nur `api/contact.ts` ändert, wurde nie
    geprüft, und das ist bei statischem Bau die einzige Stelle, an der diese
    Datei lokal überhaupt geprüft wird.
  - Das Prüf-Tor kannte `/anfrage-fehler` nicht. Beim Bau der Seite wurde die
    Sitemap gefiltert, die Ausnahmeliste des Tors nicht: **jeder Klon wäre beim
    Live-Gang rot geworden**, für eine Seite, die der Motor selbst absichtlich
    auf noindex baut. Im Live-Modus nachgestellt und geprüft.

  **Punkt 0b nachgeholt:** Der Abgleich sammelte sechs Merkmale ein und sah
  keines davon an – darunter die Innenabstände, die CLAUDE.md Abschnitt 4
  ausdrücklich Wert für Wert verlangt. Sie werden jetzt verglichen (nur bei
  glattem Pixelwert, Toleranz 8 px). Bauteile und Klick-Zustände gehen an das
  Auge, statt weggeworfen zu werden. Der Kopf der Datei führt jetzt die
  **vollständige Liste**: was verglichen wird, was ans Auge geht, was bewusst
  nicht verglichen wird und warum.

  **Punkt 9 – das Template hielt seine eigene Regel an acht Stellen nicht ein.**
  „Keine Bezeichnungen fremder Oberflächen aus dem Gedächtnis" steht in
  CLAUDE.md und im deploy-Skill – drei Zeilen darunter stand ein
  Vercel-Menüpfad. Alle acht beschreiben jetzt das ZIEL statt den Klickweg.
  Die Tarif-Behauptung ist bewusst **nicht** mehr zitiert: Sie steht in den
  Nutzungsbedingungen, nicht in der Doku, und wäre aus dem Gedächtnis dasselbe
  wie eine falsche Paragraphenangabe.

  **Was NICHT angefasst wurde, mit Absicht:** Vier Bausteine (Navigation, Kopf,
  Fuß, Einbettung) setzen Tippziele auf 44 px auch am Zeigegerät statt nur am
  Handy. Nach der eigenen Regel eine Abweichung, praktisch ohne Wirkung –
  niemand sieht es, nichts geht kaputt. *(kein Blocker)* Bewusst stehen
  gelassen, um nicht die nächste Runde daraus zu machen.

  **Die Lehre dieser Sitzung, und sie wiegt mehr als jeder Einzelfund:** Die
  letzten beiden Runden fanden fast nur Fehler, die **die Runde davor erzeugt
  hatte**. Teil 7 waren 28 Dateien und 1.800 Zeilen an einem Tag; jedes Paket
  dieser Größe bringt seine eigene Fehlerquote mit. Die Kur ist nicht mehr
  Prüfung, sondern kleinere Pakete – und **kein Template-Durchgang mehr ohne
  Anlass aus einem echten Kundenprojekt.** Eine Prüfung ohne Auslöser findet
  immer etwas; solange „es wird nichts mehr gefunden" das Abbruchkriterium ist,
  endet es nie. Das Abbruchkriterium ist ab jetzt: **ein Port erzeugt keine
  Motor-Meldung mehr.** Bei ASC waren es 19.

  **Stand danach:** Der Demo-Weg ist frei – von den 33 verbliebenen Punkten
  betreffen 13 den Live-Gang, 10 den (standardmäßig ausgeschalteten)
  Redaktions-Baustein, 7 die Doku und 3 den Abgleich. Keiner blockiert das
  Erstellen einer Vorschau.

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

  **Nächster Schritt war ein Relaunch-Zeittest** – nie durchgeführt; der einzige
  echte Port blieb der Katalog-Pilot. Damit ist die Zeitangabe oben ungeprüft.

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
  permissions.defaultMode = 'auto' (Version 2026.7.21).
  (Das damals laufende Komplett-Audit einer Gastro-Referenz – 41 Befunde,
  Gegenprüfung offen – wurde nie abgeschlossen. Der Verlauf hatte es als
  „läuft" stehen lassen, und ein frischer Chat konnte nicht erkennen, ob die
  Befunde noch offen sind. Sie sind es nicht: Die Gesamtprüfung vom 02.08.2026
  hat den Motor vollständig neu vermessen.)
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
