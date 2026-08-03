# Was noch offen ist — Stand 03.08.2026

> Diese Datei ersetzt `PRUEFPLAN.md` (Auftrag erledigt) und die nie dauerhaft
> vorhandene `pruefung/BEFUNDE.md` — dieser Ordner wird von `npm run sicht` bei
> jedem Lauf gelöscht, ein Befundbericht darin überlebt keine Stunde.
>
> **Beim Portieren löschen** (Etappe 0 des `/port`-Skills): Sie ist die
> Werkstattliste des Motors, nicht das Gedächtnis eines Kunden.

---

## Die Zahlen

Zwei Prüfungen liegen zugrunde. Beide mit Gegenprobe — jeder Fund wurde von
einem zweiten Durchgang angegriffen, der ihn zu widerlegen versuchte.

| | erhoben | bestätigt | eigenständige Ursachen |
| --- | --- | --- | --- |
| **A · Gegenprüfung der Sitzung vom 03.08.** | 99 | 91 | **33** |
| **B · Gesamtprüfung vom 02.08., Restbestand** | – | 48 + 9 | **57** |

**Zusammen rund 90 offene Ursachen, davon 19 schwer.**

Die wichtigste Zahl steht in A: **40 von 91 Befunden sind `neuer_fehler`** —
frisch eingebaut in der Sitzung, die 106 andere Befunde behoben hat. Fast die
Hälfte dessen, was repariert wurde, hat etwas Neues beschädigt.

---

## A · Was die Sitzung selbst kaputt gemacht hat

**Diese kommen zuerst.** Sie treffen jeden Klon, sie sind heute entstanden, und
sie sind der Beweis, dass das Paket zu groß war.

### Schwer (7)

1. **`src/components/Schwebeknopf.astro`** — Der Knopf liegt am Seitenende
   dauerhaft auf dem Kanbuk-Backlink (gemessen: 44 % verdeckt bei 350 px, 42 %
   bei 430 px) und unterwegs auf Formularfeldern. Der Backlink ist Live-Pflicht
   und wird vom Prüf-Tor erzwungen — am Handy ist er nicht mehr anklickbar.
   *(9× gemeldet)*

2. **`src/pages/datenschutz.astro`** — `hatMerkliste` ist in **jedem** Klon wahr.
   Es liest den Quelltext *aller* Motor-Dateien, auch der unbenutzten. Ein
   Friseur bekommt „wir speichern Ihre Vormerkungen auf Ihrem Gerät" für eine
   Funktion, die es nicht gibt. Derselbe Fehlertyp, den derselbe Block beim
   Karten-Absatz gerade behoben hat. *(9×)*

3. **`src/layouts/BaseLayout.astro`** — Ein `faq`-Feld ohne `zeigtFaq` bricht
   den Build mit **rohem Stapelabzug** ab. Mein „Klartext-Abbruch" ist für
   jemanden, der nicht programmiert, unbrauchbar — und die Seite lässt sich ab
   da gar nicht mehr bauen. *(9×)*

4. **`scripts/browser.mjs`** — Die neue `var()`-Regel liest über das Blockende
   hinaus und meldet **korrekt abgesicherten** Code als Verstoß. Folge: Das Tor
   wird grundlos rot, und der nächste Chat baut die funktionierende Absicherung
   aus, um es grün zu bekommen. *(6×)*

5. **`scripts/lib/bau-marke.mjs`** — Eine unlesbare Marke lässt **alle fünf**
   abhängigen Tore still grün melden. Ich habe den Fix nur in `check-lauf.mjs`
   zu Ende gebracht, nicht im gemeinsamen Leser — genau der Zustand, den dein
   Absturz aufgedeckt hat, nur eine Ebene tiefer. *(5×)*

6. **`src/lib/verhalten/dialog.ts`** — Der neue Browserlücken-Baustein wird nie
   erreicht: Zwei Zeilen davor stürzt es weiterhin ab und reißt alle folgenden
   Bausteine mit. Die Datei, die genau das verhindern soll.

7. **`scripts/inhalte.mjs`** — Die Plausibilitätsschwelle zählt die
   übertragenen Archiv-Einträge mit und sperrt sich damit selbst zu. Der einzige
   angebotene Ausweg (`--erzwingen`) löscht das ganze Archiv — also genau die
   Detailseiten, deren Erhalt der Übertrag sichern sollte.

### Mittel (12) · Leicht (14)

Unter anderem: Der Schwebeknopf zeigt ohne Design ein Zeichen, das wie ein
**Verbotsschild** aussieht. Die Bedien-Prüfung meldet Formular-Prüfungen als
„nicht geprüft", die gerade durchgelaufen sind. Das Formular blendet auf jeder
Katalog-Detailseite eine ungestaltete Textzeile ein. CLAUDE.md und der
`/port`-Skill nummerieren die Tore **unterschiedlich**. Block 3 schreibt
„`karteBild` wird nirgends gelesen", Block 4 macht es zum Schalter.

### Bereits behoben

- **Gehalts-Erkennung** *(11× gemeldet, der meistgemeldete Befund)* — behoben
  am 03.08. mit `db1672b`. Sie riet eine Zahl aus dem Fließtext und lag bei drei
  von sieben üblichen Formulierungen falsch. Jetzt trägt der Betrieb sie als
  Zahl ein, oder es entsteht kein Gehalts-Schema.

---

## B · Restbestand der Gesamtprüfung

| Block | offen | schwer |
| --- | --- | --- |
| **11** Abgleich gegen den echten Port | 10 | 2 |
| **6** Live-Weg | 8 | 3 |
| **10** Zugesagt, nie gemessen | 8 | 3 |
| **9** Alte Reste / Over-Engineering | 7 | 1 |
| **1** Neutralität (Rest) | 7 | 2 |
| **8** Frischer Klon | 8 | 1 |
| Vollständigkeits-Kritiker | 9 | – |

Etliche sind durch die zehn erledigten Blöcke miterledigt — bei 1, 6 und 8
wurden die schweren Punkte bereits behoben. Realistisch bleiben **25 bis 30**.

**Die zwei wertvollsten stehen in Block 11** — sie sind die Antwort auf
*„was musste der einzige echte Port selbst bauen?"*:

- Der Motor liefert die Eingabemaske, **aber nicht das Studio**, in dem der
  Betrieb sie sieht. Er zeigt auf einen Nachbarordner, den er nie anlegt.
- **Es gibt keinen Weg, den vorhandenen Bestand einmalig in den Dienst zu
  bekommen.** Der Dienst startet leer, `npm run inhalte` liest nur — und die
  Sicherung „eine leere Antwort überschreibt nie" lässt das **lautlos**
  passieren.

---

## Reihenfolge

1. **Die 7 schweren aus A** — zuerst `bau-marke.mjs`, weil sie fünf Tore still
   grün melden lässt. Solange die lügt, ist jede weitere Messung wertlos.
   Danach `dialog.ts`, dann die drei mit Kundenwirkung (Merkliste,
   Schwebeknopf, `faq`-Abbruch), dann `browser.mjs` und `inhalte.mjs`.
2. **Die 12 mittleren aus A** — überwiegend Doku-Widersprüche und der
   Schwebeknopf-Feinschliff.
3. **Block 11**, dann 6 → 10 → 9 → 1 → 8.
4. **Ein Durchgang, ein Fix, eine Gegenprobe.** Keine Sammelcommits mehr — das
   war die Ursache dieser ganzen Liste.

---

## Entscheidungen, die nur der Inhaber treffen kann

- **Lighthouse ≥ 95** steht in der Definition of Done, **kein Werkzeug misst
  es.** Vereinbart am 03.08.: Zusage ehrlich abschwächen auf das, was die Tore
  wirklich prüfen, und Lighthouse als manuellen Schritt vor dem Live-Gang
  benennen. Kein neues npm-Paket. *(noch nicht umgesetzt)*
- **Auftragsverarbeitungsvertrag nach Art. 28 DSGVO** — echter Live-Blocker,
  kein Code. Anwalt oder WKO-Muster.
- **Die Pflichtlektüre kürzen?** Rund ein Fünftel der 1.147 Zeilen CLAUDE.md
  sind Fallberichte. Konkrete Archiv-Kandidaten liegen vor. Jeder gestrichene
  Absatz ist eine teuer bezahlte Lehre — deshalb nicht ohne ausdrückliches Ja.

---

## Das Abbruchkriterium

Nicht „es wird nichts mehr gefunden" — eine adversariale Prüfung findet
**immer** etwas. Sondern:

> **Ein Port erzeugt keine Motor-Meldung mehr.**

Ablesbar in der STAND.md des Kundenprojekts. Beim einzigen echten Durchgang
waren es 19.

**Und die Lehre dieser Sitzung, damit sie nicht wieder passiert:** 1.623
Zeilen an einem Tag haben 40 neue Fehler erzeugt. Kleine Pakete, jedes mit
eigener Gegenprobe — das ist keine Vorsicht, das ist die einzige Bauform, die
in diesem Projekt bisher funktioniert hat.
