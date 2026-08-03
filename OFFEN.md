# Was noch offen ist — Stand 03.08.2026 (abends)

> ## Zusammenfassung obenauf
>
> **Aus der Gegenprüfung der Reparatur-Sitzung ist nichts mehr offen.**
> Zwei adversariale Durchgänge (79 Agenten), Ergebnis:
>
> | | |
> | --- | --- |
> | Befunde geprüft | 25 + 41 |
> | **widerlegt** | 8 + 18 = **26** |
> | schon erledigt / von Anfang an falsch | 2 |
> | **behoben** | **40**, in 9 Commits, jeder mit eigener Gegenprobe |
>
> **Jeder dritte Befund hat nicht gehalten.** Das ist das eigentliche Ergebnis:
> 26 Stellen, an denen sonst gesunder Code „repariert" worden wäre. Genau daraus
> entstanden die 40 neuen Fehler des Vormittags.
>
> Offen bleibt nur noch **Block B** (Restbestand der Gesamtprüfung vom 02.08.),
> Reihenfolge 11 → 6 → 10 → 9 → 1 → 8.

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
den linken Rand. Aufgefallen beim Ansehen der Bilder aus `npm run altgeraet`
(`b8b39c8`).

> **Und dieser Fix war falsch — die zweite Gegenprüfung hat ihn gekippt
> (`66a5de7`).** `right: var(--raum-s, 1rem)` ist ein Placebo: Der Ersatzwert
> in der Klammer greift nur bei einer Variablen, die GAR NICHT gesetzt ist.
> Eine Custom Property nimmt jeden Zeichenstrom an; `--raum-s: clamp(…)`
> überlebt auch in einem Browser ohne `clamp()`, und die Eigenschaft fällt
> erst beim Einsetzen auf `auto`.
>
> **Warum es trotzdem grün aussah, ist der wertvollere Teil:**
> `npm run altgeraet` LÖSCHTE Token-Zeilen mit unbekannten Merkmalen — damit
> war die Variable in der Nachbildung ungesetzt, und genau dann wirkt der
> Ersatzwert. Das Werkzeug hat die Absicherung bestätigt, die in Wirklichkeit
> nicht wirkt.
>
> Behoben in beide Richtungen: `@supports` (Weg 3) im Bauteil, und das
> Werkzeug macht Token-Zeilen jetzt unauflösbar statt sie zu entfernen.
> Gemessen, Browser ohne `clamp()`: vorher 1224 px vom rechten Rand, jetzt 16.

### Mittel und Leicht — **erledigt am 03.08.2026 abends**

Die Rohliste (51 Befunde) wurde aus den Prüf-Journalen rekonstruiert, zu 16
Bündeln gefasst und **gegen den heutigen Code** gehalten. Danach griff ein
Skeptiker jeden Treffer an, und die dabei neu gefundenen 41 Punkte gingen durch
denselben Angriff plus die Frage *„richtet die Reparatur woanders Schaden an?"*

**Was dabei WIDERLEGT wurde** — die 26 Stellen, an denen sonst gesunder Code
angefasst worden wäre. Vier Beispiele, weil das Muster wiederkehrt:

- *„Der Schwebeknopf ist in der Vorschau nicht mit der Tastatur erreichbar."*
  → Richtig so. In der Vorschau ist er kein Link, sondern ein Hinweis.
- *„`karteBild` wird nirgends gelesen."* → Falsch, es steuert seit heute den
  Karten-Absatz der Datenschutzerklärung.
- *„CLAUDE.md und der `/port`-Skill nummerieren die Tore unterschiedlich."*
  → Kein Widerspruch; beide sagen dasselbe mit anderen Worten. (Der Skill
  widersprach dagegen SICH SELBST — das hielt und ist behoben.)
- *„Das Formular blendet auf jeder Katalog-Detailseite eine ungestaltete
  Textzeile ein."* → Zitat richtig, Bewertung falsch.

**Behoben, nach Wirkung sortiert.** Kundenwirksam:

| | Commit |
| --- | --- |
| Silvester 18:00–02:00 zeigte den ganzen Abend „Geschlossen" (8 falsche Stunden → 0) | `7407737` |
| Auf älterem Safari ließ sich das Anfrage-Fenster nicht schließen — und stand dauerhaft mitten auf der Seite | `70af1fb` |
| „Alle akzeptieren" lud die Karte nie; der Code dafür war an zwei Stellen tot | `f16b898` |
| Der Anfrage-Dialog nannte den Eintrag des vorigen Klicks | `6d062a5` |
| Ausläufer über Mitternacht ignorierte die Sonderzeiten des Vortags | `6d062a5` |
| „öffnet Mo 08:00" am Abend vor zwei Wochen Betriebsurlaub | `6d062a5` |
| Unter Safari 15 verschwand eine Einbettung samt Lade-Knopf | `5d3dc6a` |
| Zwei Einbettungen: die eine löschte die Pflicht-Lizenzzeile der anderen | `5d3dc6a` |
| Fiel ein Foto beim Holen aus, verrutschten alle Bildbeschreibungen dahinter | `99a28cd` |

An den Toren selbst — die Klasse, die am längsten unsichtbar bleibt:

| | Commit |
| --- | --- |
| Das dritte Tor schloss den Dialog per Browser-Aufruf statt mit dem Knopf des Bausteins | `5d3dc6a` |
| Die `@media`-Kurzform-Regel erkannte 2 von 5 Schreibweisen | `5d3dc6a` |
| Die Bau-Marke kannte weder `icons/` noch `package-lock.json` | `7407737`, `5d3dc6a` |
| Der Vorcheck grenzte einen Block über die EINRÜCKUNG ab | `66a5de7` |
| Die Bedien-Prüfung meldete 3 von 10 „nicht geprüft"-Punkten dauerhaft falsch | `66a5de7` |
| `npm run altgeraet` deckte den Fehler, statt ihn zu zeigen | `66a5de7` |
| Die Hineingeh-Schleife des Design-Tores lief nur einen Durchlauf | `99a28cd` |

Dazu Doku und Kleinteile: Schwebeknopf in CLAUDE.md/README, `/deploy` ohne
`altgeraet`, doppelte Nummerierung im `/port`-Skill, Fehlerseite mit zwei von
drei Ursachen, Server-Meldungen ohne Du-Form, `preisHinweis` als Freitextfeld,
`data-katalog-eintrag` ohne Wert im Beispiel, tote Marker-Konstante.

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

**Die zwei wertvollsten standen in Block 11** — die Antwort auf *„was musste
der einzige echte Port selbst bauen?"*. **Beide erledigt am 03.08.2026
(`5f60c89`).**

- ~~Der Motor liefert die Eingabemaske, aber nicht das Studio.~~
  → **`npm run studio`** legt es als Nachbarordner an, holt die
  Abhängigkeiten und trägt den Pfad in `dienst.json` ein.
- ~~Kein Weg, den vorhandenen Bestand einmalig in den Dienst zu bekommen.~~
  → **`npm run erstbefuellung`**, samt Fotos. Schreibt nie über Bestehendes,
  `-- --probe` zeigt es vorher ohne Token und ohne Netz. Und `npm run inhalte`
  sagt jetzt laut, wenn Dienst und Projekt beide leer sind.

  Gegengeprüft an einem nachgestellten Dienst: leer → 4 Bilder und 3 Dokumente
  geschrieben; 5 vorhandene Einträge → Abbruch **vor** jedem Schreibzugriff.

Damit ist Block 11 bis auf Kleinteiliges durch. **Für einen Kunden mit
Redaktionszugang ist der Weg jetzt vollständig** — anlegen, Maske, befüllen,
holen, bauen.

---

## Reihenfolge

1. ~~**Die 7 schweren aus A**~~ — erledigt am 03.08.2026.
2. ~~**Die mittleren und leichten aus A**~~ — erledigt am 03.08.2026 abends,
   nach zwei Angriffs-Durchgängen. 26 von 66 Befunden hielten nicht.
3. **Block 11**, dann 6 → 10 → 9 → 1 → 8. ← *hier weiter*
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
