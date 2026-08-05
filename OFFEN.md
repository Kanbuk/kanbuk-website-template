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

## Der Weg zum fertigen Motor (Stand 05.08.2026)

**Ziel:** Der Motor gibt das Aussehen ab. Dann ein Restaurant-Port als Pilot 3
— und die Zahl der Motor-Meldungen sagt, ob es gewirkt hat (Port 1: 19,
Port 2: 30).

Sieben Pakete, jedes einzeln mit Gegenprobe, in dieser Reihenfolge. Grundlage
ist `ZUSTAENDIGKEIT.md`.

| # | Paket | warum in dieser Reihenfolge |
| --- | --- | --- |
| ~~**1**~~ | ~~**Spezifität** — `scopedStyleStrategy` setzen~~ **→ verworfen am 05.08.2026, siehe unten.** Der Motor gibt stattdessen sein Aussehen ab (Pakete 2–4). | Der Weg über die Gewichtung ist an zwei Messungen gescheitert. |
| **2** | **Token** — Werte kommen aus dem Design, in beiden Lieferformen (benannt oder literal) | Der größte Brocken. Die Motor-Skala wird zum Rückfall für Stellen, an denen das Design schweigt. |
| **3** | **Bewegung** — Akkordeon, Slider und Einblendung geben ihre Werte ab | Erst nach 1 wirksam. Beseitigt die doppelten Animationen. |
| **4** | **Rahmen** — Kopf und Fuß zerlegbar machen, Rechtslinks platzierbar | Der Fußzeilen-Fall kann danach nicht wiederkehren. |
| ~~**5**~~ | ~~**Design-Tor reparieren**~~ **✓ erledigt 05.08.2026** — beide Export-Formen, alle Dateien, Kopf/Fuß getrennt, Fußzeilen-Regel | Form B: vorher 0 Seiten, jetzt 4 Seiten / 16 Blöcke / 2 Rahmen-Teile. Form A unverändert 11/43/1. |
| ~~**6**~~ | ~~**Offene Fehler**~~ **✓ erledigt 05.08.2026** — Slider-ARIA, tote Verpixelungs-Regel raus, `karte.mjs` scheitert jetzt laut, Fußzeilen-Falle in allen zwölf Bausteinen zu | Als „Kleinkram" geplant. Zwei der Funde waren keiner (siehe unten). |
| **7** | **Pilot 3: Restaurant** | Die Messung. Wenn kaum noch Nacharbeit anfällt, ist der Motor fertig. |

> ### Warum Paket 1 verworfen wurde – zweimal gemessen
>
> **Der Befund stimmt:** Motor-Komponenten-Stile wiegen schwerer als
> Design-Stile. Astro hängt ohne besondere Angabe an jeden Selektor ein
> Attribut (`.klasse[data-astro-cid-…]`), das Design bringt nur eine Klasse
> mit. Gemessen am gebauten Ergebnis: Eine Design-Regel
> `.formular__label-link { text-decoration: none }` blieb wirkungslos.
>
> **Der Fix funktioniert trotzdem nicht.** `scopedStyleStrategy: 'where'`
> macht beide Regeln gleich schwer – dann entscheidet die Reihenfolge, und
> Astro bündelt globale Stile VOR die Komponenten-Stile. Nachgemessen: Das
> Design verlor weiterhin, beide Male.
>
> **Und er wäre gefährlich.** Astro schreibt damit jeden Komponenten-Selektor
> als `.klasse:where(…)`. `:where()` gibt es erst ab Safari 14 – darunter
> verwirft der Browser den Selektor und damit **jeden Stil jeder
> Motor-Komponente**: Navigation, Fußzeile, Formular, alles ohne Gestaltung.
> Der Motor sagt „bedienbar ab Safari 12" zu. Gezählt: 3 Vorkommen heute
> gegen 104 mit der Einstellung.
>
> **Auch „Design-CSS zuletzt laden" geht nicht.** Astro legt einen Teil der
> Komponenten-Stile als `<style>` HINTER die verlinkten Bündel – ein
> Design-Stylesheet kann gar nicht zuverlässig zuletzt stehen.
>
> **Die richtige Antwort ist deshalb keine Gewichtung, sondern Verzicht:**
> Nimmt man den Bausteinen ihr Aussehen (Pakete 2–4), gibt es nichts mehr zu
> überschreiben. Für die wenige strukturelle CSS, die bleiben muss, ist
> `!important` im Design-CSS der dokumentierte Ausweg – der wirkt in jedem
> Browser.

**Was der Inhaber dabei tut:** nichts lesen. Nach jedem Paket sieht er das
Ergebnis an der Referenzseite oder am Port, nicht im Code. Zwei bis drei echte
Entscheidungen kommen als einzelne Frage in normaler Sprache.

**Arbeitsregel, aus dem 05.08. gelernt:** ein Paket, eine Gegenprobe, ein
Commit. An diesem Tag entstanden in einem Rutsch neun halbe Sachen, die eine
Nachprüfung erst finden musste.

> ### Was Paket 6 wirklich war – jeder Punkt gemessen
>
> Geplant als „Kleinkram". Zwei der vier Punkte waren keiner, und ein fünfter
> kam dazu, den kein Tor gemeldet hatte.
>
> **1. Slider-ARIA — und das Tor, das den Fehler erzwang.** Die Punkte trugen
> `role="tab"` und `aria-selected`; zu Reitern gehören aber Panels,
> `aria-controls` und Pfeiltasten – nichts davon gab es. Ein Vorleseprogramm
> kündigte „Registerkarte 1 von 5" an, die Pfeiltaste tat nichts. Richtig ist
> `role="group"` am Behälter und `aria-current` am aktuellen Punkt.
>
> **Der eigentliche Fund steckt daneben:** Das Bedien-Tor prüfte auf
> `aria-selected`. Es hat die falsche Auszeichnung nicht bloß durchgelassen,
> sondern **erzwungen** – wer den Baustein richtig umgestellt hätte, wäre rot
> geworden und hätte es zurückgedreht. Aufgefallen ist das erst, weil die
> Referenzseite jetzt einen Slider hat; vorher stand er in jedem Lauf unter
> „NICHT GEPRÜFT" und die Regel lief nie. **Ein Baustein ohne Vorkommen auf
> der Referenzseite ist ein ungeprüfter Baustein.**
>
> **2. Die Verpixelungs-Regel im Sicht-Tor war tot, nicht doppelt.** Geplant
> war, sie als Doppelung zu streichen. Die Messung sagt etwas Schlimmeres: Am
> echten Fall (400-px-Datei auf 1440 px Anzeige) meldete sie bei **keiner** der
> fünf Breiten etwas. Grund: Bei `srcset` teilt der Browser die Bildbreite
> durch die Dichte der gewählten Fassung – `naturalWidth` meldet daraufhin
> genau die Anzeigebreite, die Rechnung kommt immer auf 100 %. Da CLAUDE.md 9a
> rohe `<img src>` verbietet, hat **jedes** Bild im Motor ein `srcset`. Die
> Regel konnte nie anschlagen und stand in jedem Bericht mit „0 Funde".
> `npm run bildschaerfe` fand denselben Fall bei allen fünf Breiten.
>
> **3. `npm run karte` beendete sich bei Misserfolg mit einem Haken.** Findet
> es die Adresse nicht oder ist der Kartenserver stumm, legt es ein graues
> Gitter mit Nadel an – und meldete Erfolg. Auf der Seite sieht das aus wie
> eine stilisierte Karte. Jetzt endet der Lauf mit einem Fehler; das Bild
> bleibt liegen, wer es bewusst will, kann es benutzen. Gegengeprobt an einer
> erfundenen Adresse: Ausgang 1, Text nennt Datei und Ursache.
>
> **4. `stock.mjs` bleibt.** Geplant war, es zu entfernen. Es hängt an vier
> Stellen (package.json, /port-Skill, CLAUDE.md, README) – ein Entfernen wäre
> Aufräumen ohne Fehler dahinter. Bewusst gelassen.
>
> **5. Der Fund, der nicht geplant war: „ImpressumDatenschutz".** In der
> Fußzeile jeder Seite standen die beiden Rechtslinks ohne Abstand in einem
> Wort. Ursache: Die Anordnung lag in `Fuss.astro`, das `<nav>` gehört aber
> `Rechtslinks.astro` – Astro grenzt Stile über ein Attribut ab, die Regel fand
> nichts. **Kein Tor meldete es** (nichts lief über, nichts abgeschnitten,
> Kontrast in Ordnung, beide Links klickbar). Gefunden hat es das Auge im
> Kontaktbogen, Definition of Done Punkt 3d.
>
> Nachgemessen, wie weit die Falle reicht: **Alle zwölf Bausteine** mit
> `class`-Eingang waren betroffen – jede Design-Regel auf einen von ihnen wäre
> wirkungslos geblieben. Astros eigene `<Image>`/`<Picture>` sind es nicht
> (sie reichen die Kennung durch); die Motor-Bausteine taten es nicht. Jetzt
> tun sie es alle, einzeln im Browser gemessen. Eine Regel im Prüf-Tor hält es
> fest, gegengeprobt durch Entfernen.

---

## Nachprüfung der Grenze Design/Motor (05.08.2026, unabhängig)

Sechs Prüfer haben je eine Dimension untersucht, danach hat je ein Skeptiker
versucht, ihre Funde zu widerlegen. **Antwort auf die Ausgangsfrage:
weitgehend ja** – die unsichtbare Schicht ist vollständig, die Werte des
Designs kommen an und schlagen die Motor-Skala, die Fußzeile ist zerlegt.

**Neun Funde wurden am Code oder im Browser nachgemessen und behoben:**

| # | Fund | Nachgemessen |
| --- | --- | --- |
| 1 | **`--kopf-hoehe` setzte niemand.** Kopf.astro sagte zu, sie zu liefern; global.css sagte, das Design setze sie. Beide verließen sich auf die andere, der Rückfall `0px` galt auf jeder Seite jedes Kunden. Jede Sprungmarke und der Skip-Link landeten hinter der klebenden Leiste. | Leiste misst sich jetzt selbst: 69/73/77 px bei 350/768/1440 – Sprungziel liegt darunter |
| 2 | **Das Design-Tor maß die zwei Seiten in verschiedener Fensterbreite** (Design 1280, gebaut 1440). Jeder fluide Wert weicht dadurch ab – Fehlalarme beim Schriftvergleich. | beide jetzt 1440 |
| 3 | **Das Design-Tor konnte grün melden, ohne eine Seite verglichen zu haben.** Der Entwurf schreibt jeden Schalter mit `""`, und `""` heißt „überspringen". Wer den Entwurf liegen lässt, bekommt einen Haken für null Vergleiche. | bricht jetzt laut ab |
| 4 | **Der Zustimmungs-Häkchen-Test war eine Tautologie.** Er klickte auf Position 4/8 im Label – das Kästchen sitzt bei 0/4 und ist 13×13 px groß, der Punkt lag mitten darin. Gemessen wurde also, dass ein Klick aufs Kästchen es ankreuzt. | Klickpunkt wird jetzt aus der Lage des Kästchens abgeleitet; Tor weiter grün |
| 5 | **Die Fußzeilen-Regel des Design-Tors konnte rechnerisch nie anschlagen.** Die gebaute Fußzeile trägt immer drei Pflichtlinks, die es oben nie gibt – über 80 % Überschneidung bräuchte ein Kopf-Menü mit über zwölf Punkten. *(Die frühere Gegenprobe war unrealistisch: Sie stellte eine Fußzeile ohne die Pflichtteile nach.)* | Pflichtlinks zählen nicht mehr mit |
| 6 | **`:where()` konnte das Tor nicht rot machen.** Es wurde eigens aufgenommen, weil es die Gestaltung ALLER Bausteine kippt – und landete wegen „ab Safari 14 < 15.4" im Hinweis-Topf. | jetzt rot, gegengeprobt in beide Richtungen |
| 7 | **„Bewegung reduzieren" wurde an zwei Stellen übergangen** (Assistent-Schritt, Merklisten-Umschalter). | beide fragen jetzt |
| 8 | **Falsche Zusage in CLAUDE.md:** „Vergisst ein Port sie, blockt das Prüf-Tor jede Seite" galt nur für die Rechtslinks. Signatur blockt erst live, Social-Icons gar nicht. | Tabelle richtiggestellt; neuer Hinweis, wenn Social-Adressen gepflegt sind, aber auf keiner Seite verlinkt |
| 9 | **`{...rest}` stand doppelt** in neun Bausteinen – Folge eines zweimal gelaufenen Hilfsskripts. | bereinigt |

> **Zwei Lehren über die Gegenproben selbst.** Bei Fund 5 war meine eigene
> frühere Messung unrealistisch – sie stellte den Fall ohne die Pflichtteile
> nach, die in Wahrheit immer da sind. Bei Fund 6 war der erste Gegentest
> grün, weil das Suchmuster nach dem falschen Text suchte: Astro schreibt
> `:where(.astro-<hash>)`, nicht das Attribut. **Eine Gegenprobe, die grün
> ist, muss selbst gegengeprobt werden** – sonst beweist sie nur, dass sie
> nichts findet.

### Was offen bleibt: Zweisprachigkeit der Motor-eigenen Texte

**Blockiert den Restaurant-Piloten nicht** (einsprachig), gehört aber vor den
nächsten zweisprachigen Kunden erledigt:

- [ ] **Die Rechtslinks in der Fußzeile zeigen immer auf die deutschen
      Adressen.** Auf einer englischen Seite führt „Datenschutz" damit zur
      deutschen Erklärung, obwohl die englische gebaut wird. Das Formular
      leitet die richtige Adresse bereits selbst ab – dieser Baustein fragt
      nicht.
- [ ] **Der Einwilligungs-Banner ist immer deutsch.** Sobald ein Kunde einen
      Dienst einträgt und zweisprachig fährt, entscheidet ein englischer
      Besucher in einer Sprache, die er nicht versteht. Der Motor kennt das
      Argument selbst – bei der 2-Klick-Einbettung steht es wörtlich.
- [ ] **Die drei Zeit-Bausteine bleiben deutsch** (Öffnungszeiten,
      Öffnungs-Status, Zeitenzeile). Der Status wäre ein Handgriff; die
      eingetragenen Zeiten und Anlässe („Mo–Fr", „Weihnachten") stehen in der
      Config und brauchen dort ein zweites Feld. **Das ist Motor-Arbeit, keine
      Konfiguration.** Abschnitt 6d nennt diese drei Bausteine bisher nicht –
      ein Port kann die Liste vollständig abarbeiten und fährt trotzdem
      deutsch aus.

### Vier Verdachtsfälle haben sich als falsch erwiesen

Damit sind sie geprüft und sauber: dass die Werte-Datei irreführend
beschrieben sei; dass das Design Rundungen nicht setzen könne; dass
Anfrage-Fenster und Bildergalerie eine Design-Vorgabe brechen; dass das
Empfänger-Tor am Live-Tag fälschlich grün meldet.

---

## Reihenfolge (Restbestand der Gesamtprüfung)

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

- ~~**Lighthouse ≥ 95** steht in der Definition of Done, **kein Werkzeug misst
  es.**~~ **Erledigt am 05.08.2026.** Die Zusage wird NICHT abgeschwächt: Der
  Betreiber misst bei seinen Läufen durchgehend **99/100**, der Motor hält sie
  also. Umgesetzt ist stattdessen die Ehrlichkeit darüber, wer sie prüft —
  CLAUDE.md Punkt 4 sagt jetzt ausdrücklich „von Hand gemessen, das einzige
  Ziel dieser Liste, das kein Tor prüft", und der `/deploy`-Skill hat den
  Messschritt (4e). Vorher stand die Zusage zwischen neun automatischen
  Prüfungen und las sich, als würde sie mitgemessen. Kein neues npm-Paket.
- ~~**Auftragsverarbeitungsvertrag nach Art. 28 DSGVO**~~ **Entschieden am
  05.08.2026:** Der Inhaber schließt ihn beim Onboarding mit jedem Kunden ab.
  Damit ist es keine offene Frage mehr, sondern ein Ablaufschritt — er steht
  im `/deploy`-Skill als Weg B, Schritt 0a, vor dem Umschalten auf live.
  Bleibt ein Live-Blocker je Kunde, aber ein zugeteilter.
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
