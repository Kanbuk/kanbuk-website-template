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
**Stand 03.08.2026 abends: die 7 schweren aus A sind erledigt — bleiben ~83, davon 12 schwer.**

Die wichtigste Zahl steht in A: **40 von 91 Befunden sind `neuer_fehler`** —
frisch eingebaut in der Sitzung, die 106 andere Befunde behoben hat. Fast die
Hälfte dessen, was repariert wurde, hat etwas Neues beschädigt.

---

## A · Was die Sitzung selbst kaputt gemacht hat

**Diese kommen zuerst.** Sie treffen jeden Klon, sie sind heute entstanden, und
sie sind der Beweis, dass das Paket zu groß war.

### Schwer (7) — **alle sieben erledigt am 03.08.2026**

Jeder mit einer Messung, die **ohne** den Fix fehlschlägt. Das ist die Regel,
die für diese Phase gilt: Grüne Tore sind kein Nachweis, sondern nur die
Abwesenheit von Rot.

| # | Datei | Commit | Gegenprobe |
| --- | --- | --- | --- |
| 1 | `scripts/lib/bau-marke.mjs` | `b9718c4` | Nullbytes in die Marke → Exit 1 in sicht/interaktion/browser; wiederhergestellt → Exit 0 |
| 2 | `src/lib/verhalten/dialog.ts` | `dcb3b73` | Probeseite mit Dialog **und** Merken-Knopf, `HTMLDialogElement` im Browser entfernt: alt → Merkliste TOT, neu → REAGIERT |
| 3 | `src/pages/datenschutz.astro` | `5c8e717` | Klon ohne Katalog: 0 Seiten mit `data-merken`, kein Absatz. Absatz eingeschmuggelt → Tor rot |
| 4 | `src/layouts/BaseLayout.astro` | `ba7bfdf` | `faq` ohne `zeigtFaq` → Build läuft durch, eine Warnung, Tor rot. Mit `zeigtFaq` → Schema da, Tor grün |
| 5 | `src/components/Schwebeknopf.astro` | `c9c4bfc` | Backlink 44/42/36 % verdeckt → 0/0/0 % |
| 6 | `scripts/browser.mjs` | `dd3f09a` | sieben CSS-Fälle, alle wie erwartet (drei Ursachen, nicht eine) |
| 7 | `scripts/inhalte.mjs` | `7449cb7` | fünf Bestandslagen, alte gegen neue Zählung |

Drei Dinge, die dabei anders waren als gedacht — der Vollständigkeit halber,
damit die Zahlen oben nicht falsch gelesen werden:

- **Nr. 5 war zu scharf beschrieben.** Der Backlink blieb in der Mitte
  anklickbar; verdeckt waren 44 % der Tippfläche, nicht die Erreichbarkeit.
- **Nr. 6 hatte drei Ursachen**, nicht eine. Neben dem Blockende zählten auch
  `@supports` ohne Ersatzwert und die `@supports`-Bedingung selbst als Verstoß —
  der von CLAUDE.md 4a vorgeschriebene Weg 3 war überhaupt nicht begehbar.
- **Nr. 4 war doppelt falsch.** Nicht nur die Darstellung: Ein Abbruch war für
  ein fehlendes Google-Schema die falsche Antwort. Jetzt Hinweis beim Bauen +
  harter Fehler im Prüf-Tor. Die Darstellung ist gleich für **alle** Abbrüche
  des Motors repariert (neu: `src/lib/motorfehler.ts`).

**Dazu gefunden, von keinem Tor:** Auf altem Gerät sprang der Schwebeknopf an
den linken Rand und lag auf den Formularfeldern — `right: var(--raum-s)` ohne
Ersatzwert in der Klammer. Aufgefallen beim Ansehen der Bilder aus
`npm run altgeraet` (`b8b39c8`).

### Mittel (12) · Leicht (14) — **als Nächstes dran**

Unter anderem: Die Bedien-Prüfung meldet Formular-Prüfungen als „nicht
geprüft", die gerade durchgelaufen sind. Das Formular blendet auf jeder
Katalog-Detailseite eine ungestaltete Textzeile ein. CLAUDE.md und der
`/port`-Skill nummerieren die Tore **unterschiedlich**. Block 3 schreibt
„`karteBild` wird nirgends gelesen", Block 4 macht es zum Schalter.

*Miterledigt:* Das Zeichen des Schwebeknopfs, das wie ein Verbotsschild aussah
(Unicode statt Lucide) — mit `c9c4bfc`, weil die Datei ohnehin offen war.

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

1. ~~**Die 7 schweren aus A**~~ — erledigt am 03.08.2026, jeder mit eigener
   Gegenprobe und eigenem Commit.
2. **Die 12 mittleren aus A** — überwiegend Doku-Widersprüche. ← *hier weiter*
3. **Block 11**, dann 6 → 10 → 9 → 1 → 8.
4. **Ein Durchgang, ein Fix, eine Gegenprobe.** Keine Sammelcommits mehr — das
   war die Ursache dieser ganzen Liste.

> **Was sich in Durchgang 1 als Regel bewährt hat, wörtlich:** Keine Änderung
> ohne eine Messung, die **ohne** den Fix fehlschlägt. Bei sieben Befunden hat
> das dreimal die Diagnose korrigiert, bevor Code geschrieben wurde — die erste
> Gegenprobe zu `dialog.ts` war ungültig (die Referenzseite hat keinen Dialog),
> `browser.mjs` hatte drei Ursachen statt einer, und bei `faq` war nicht die
> Darstellung das Problem, sondern der Abbruch selbst.

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
