# CLAUDE.md – Das Regelwerk des Motors

> Diese Datei gilt für **jeden Klon**. Sie ist für Claude Code die verbindliche
> Arbeitsanweisung. **Vor jeder Änderung lesen.**

---

## 0. Mit wem du arbeitest (**zuerst lesen**)

**Lies als Allererstes `STAND.md`** – das Gedächtnis dieses Projekts. Dort stehen
Phase, Lücken-Inventar und bisherige Entscheidungen. Nach jeder Arbeitssitzung
**aktualisierst du sie** (Pflicht): Verlaufszeile ergänzen, erledigte Punkte abhaken,
neue Lücken eintragen. Ein Chat-Bericht ist nach dem Chat weg – diese Datei nicht.

Mit dem Template arbeiten wechselnde Personen (Inhaber, Partner, Mitarbeiter).
**Gehe standardmäßig davon aus, dass die Person nicht programmiert** und die Website
ausschließlich über Claude Code verwaltet. Zeigt sich im Gespräch technisches
Verständnis, darfst du die Detailtiefe anheben – die übrigen Regeln gelten immer:

- **Du führst, der Nutzer entscheidet.** Erkläre, was du tust, in normaler Sprache –
  nicht in Dateipfaden und Fachbegriffen. Der Nutzer will wissen *was jetzt passiert* und *was er davon
  hat*, nicht welche Funktion du umgebaut hast.
- **Frag nur bei wirklich Wichtigem.** Alles, was du selbst entscheiden kannst,
  entscheidest du selbst und **sagst es hinterher**. Eine Rückfrage kostet ihn mehr
  Zeit als eine Korrektur.
- **Erfinde niemals Kundendaten.** Fehlt etwas Rechtliches oder Inhaltliches: klar
  markierten Platzhalter setzen (`PLATZHALTER: UID`) und **in den Bericht schreiben** –
  nicht mittendrin nachfragen.
- **Kein Fachjargon in Berichten.** Statt „JSON-LD-Schema für openingHoursSpecification
  ergänzt" → „Die Öffnungszeiten erscheinen jetzt direkt in der Google-Suche."
- **Sag ehrlich, wenn etwas nicht klappt.** Der Nutzer kann es oft nicht selbst nachprüfen
  und ist darauf angewiesen, dass du Probleme benennst statt sie zu überspielen.
- **Am Ende immer:** was fertig ist, die Vorschau-Adresse, und die **konkreten offenen
  Punkte für den Live-Gang** (Impressum, Platzhalter tauschen …).

**Anleitungen für den Nutzer – zwei harte Regeln.** Jede Einrichtungsanleitung,
die der Motor liefert (Domain, Dienste, Zugänge), entsteht sonst zuerst als
Entwickler-Doku und kostet dann je eine Runde beim Nutzer, der davorsitzt:

1. **Keine Befehlszeile.** Alles, was ein Terminal braucht, macht der Klon
   selbst; der Nutzer klickt nur. Eine Anleitung mit Befehlen ist für ihn
   unbrauchbar – im Kundenprojekt musste eine deshalb komplett neu geschrieben
   werden.
2. **Bezeichnungen fremder Oberflächen nie aus dem Gedächtnis nennen.**
   Menüpunkte, Rollennamen, Berechtigungsstufen: entweder belegt nachgeschlagen
   oder bewusst unscharf („die Berechtigung mit Schreibrecht"). Im
   Kundenprojekt stand der Auftraggeber vor einer Maske und suchte eine Option,
   die es dort gar nicht gibt. **Eine falsche Klickanleitung ist teurer als
   gar keine.**

Beim Bauen einer Seite gilt zusätzlich der **Ein-Rutsch-Grundsatz**: ein Prompt, ein
Design-Link → fertige Seite, ohne Zwischenfragen. Details im `/port`-Skill.

### Motor-Meldung (Pflicht)

Der Motor wird nur besser, wenn jeder Klon seine Funde zurückmeldet. Stößt du beim
Arbeiten auf eine Schwäche des MOTORS — ein Bug, eine irreführende Doku, ein
fehlendes Rezept, ein Handgriff, den das Template abnehmen könnte — dann entscheide
mit einer Frage: **„Würde das bei einem anderen Betrieb genauso auftreten, wenn man
das Template frisch klont?"**

- **Ja →** Sofort in STAND.md unter der festen Überschrift
  `## Motor-Meldungen (fürs Master-Template)` eintragen: Was, Datei, warum
  allgemein — und falls du es im Klon schon behoben hast, den Commit nennen.
  Zusätzlich bekommt der Abschlussbericht an den Nutzer einen eigenen Block
  **„🔧 Fürs Master-Template"** mit denselben Punkten.
- **Nein** (betrifft nur diesen Kunden) → normaler Eintrag unter
  „Getroffene Entscheidungen", keine Meldung.

Ein Klon bekommt keine Template-Updates — die Meldung ist der einzige Weg, auf dem
ein Fix ins Template zurückfindet.

### Vier Regeln, die in Kundenprojekten Geld gekostet haben

**1. Eine Suchanfrage ist kein Beweis, dass sie dem Kunden gehört.**
In einem Kundenprojekt hatte eine Gruppe von Anfragen mit sehr guten Werten
(dreistellige Impressionen, zweistellige Klickrate, zwei davon auf Position 1)
einem **anderen Betrieb mit ähnlichem Namen am selben Ort** gehört. Gemeldet
wurde sie als Inhaltslücke – und stellte damit eine richtige
Branchen-Entscheidung des Kunden in Frage.

> Jede Anfrage erst beim Betrieb gegenprüfen („bieten Sie das überhaupt an?"),
> bevor daraus eine Empfehlung wird. Und die Begründung einer
> Branchen-Entscheidung so festhalten, dass ein späterer Durchgang sie nicht
> aus Statistik heraus umdreht.

**2. Jede Anleitung zu einer FREMDEN Oberfläche braucht einen Beleg oder ein
Datum.** Dritter Fall in vier Tagen: Eine Anleitung behauptete, ein Dienst biete
im kostenlosen Tarif „nur Administrator oder Nur-Lesen". Am echten
Einladungsfenster nachgesehen: sechs Rollen, darunter die richtige – und eine
falsch klingende, die nur Entwürfe bearbeiten darf (und Entwürfe erscheinen
absichtlich nicht auf der Website). Wer sich auf die Doku verlässt, gibt einem
Betrieb zu viele Rechte.

> Entweder ein Beleg oder der Satz „am &lt;Datum&gt; nachgesehen". Ohne das ist
> es eine Vermutung im Anleitungston – und der Betreuer steht davor und findet
> es nicht. (Gilt zusätzlich zur Regel aus Abschnitt 0: keine Befehlszeile,
> keine Bezeichnungen aus dem Gedächtnis.)

**3. Ein Beispiel im Hilfetext wird zur Wahrheit in jedem Datensatz.**
Ein Feld für einen Preiszusatz war ein freies Textfeld, im Hilfetext stand ein
Beispiel – und genau dieser Wert stand danach bei **allen** Einträgen. Bei
mehreren war er sachlich falsch.

> Wo es genau zwei oder drei richtige Formulierungen gibt, nimm eine **Auswahl
> mit fertigen Werten**, kein Freitextfeld mit Beispiel. Bei rechtlich
> relevanten Angaben zusätzlich als Pflichtfeld – dann kann sie niemand
> übersehen.

**4. Ein Hilfetext erklärt nicht das Geschäft des Kunden.**
In einem Klon standen bei den Fotos Ratschläge zur Bildauswahl und bei der
Beschreibung die Aufforderung, nichts Falsches zu behaupten. Der Betrieb ist
Fachmann in seiner Branche – solche Sätze sind bestenfalls überflüssig und
schlimmstenfalls herablassend.

> Ein Hilfetext sagt **was** einzutragen ist (Format, Beispiel) und **was damit
> auf der Website passiert**. Nichts darüber hinaus.
> **Der Test:** Kann der Betrieb das selbst wissen? Dann weglassen. Kann er es
> NICHT wissen – etwa dass der erste Satz der Beschreibung als Google-Text dient
> und auf 158 Zeichen gekürzt wird –, dann gehört genau das hin.

---

## 1. Was dieses Repo ist

Dieses Repository ist **kein Design-Template**. Es ist der **technische Motor** für
Websites Wiener Kleinbetriebe.

Es legt fest, **wie** eine Seite gebaut sein muss: Meta-Tags, Responsiveness, Sicherheit,
Barrierefreiheit, DSGVO, Ladezeit, Recht. Es legt **nicht** fest, wie sie aussieht.

**Das Design kommt aus Claude Design.** Pro Kunde wird dort die komplette Website visuell
gebaut – mit allen Unterseiten und echten Inhalten. Der Motor setzt dieses Design
technisch sauber um.

Technik: **Astro, rein statischer Build.** Kein CMS, keine Datenbank, kein Login.

### Die Arbeitsteilung

| Claude Design liefert | Der Motor liefert |
| --- | --- |
| Layout & Komposition jeder Seite | Echte Routen mit eigener URL |
| Farben, Schriften, Bildsprache | Meta-Tags, JSON-LD, Sitemap, OG |
| Die sichtbaren Texte | Responsiveness (350–1440 px) |
| Struktur der Unterseiten | Formulare, Sicherheit, DSGVO |
| Welche Blöcke es gibt | Verhalten (Tabs, Slider, Filter …) |

**Merksatz:** Der Motor liefert die Mechanik, das Design den Lack.

### Ein Klon ist eigenständig

Sobald ein Kundenprojekt aus diesem Template entsteht, lebt es **komplett in seinem
Ordner**. Es gibt keine Updates vom Template zurück in Kundenprojekte. Das Template
bleibt hier neutral stehen und ist nur der Startpunkt.

Welchen Motor-Stand ein Klon hat, steht in `package.json → version`
(Kalender-Schema `Jahr.Monat.Tag`) und in STAND.md. **Bei jeder inhaltlichen
Änderung am Template hier die Version auf das aktuelle Datum heben** – so lässt
sich später bei jedem Kunden nachvollziehen, welchen Stand er fährt.

### Das Template bleibt kundenfrei (**strikt**)

**Niemals Daten eines echten Kunden ins Template schreiben** – auch nicht als Beispiel,
auch nicht in einem Kommentar. Kein Betriebsname, keine Adresse, keine Telefonnummer,
keine Markenfarben, kein Schriftpaar, kein Design-Link.

Der Grund ist praktisch: Das Template ist die Vorlage für **alle** Kunden. Steht dort
die Adresse von Kunde A als Beispiel, trägt Kunde B sie in seinem Ordner mit sich
herum – und irgendwann landet sie versehentlich auf seiner Seite. Kundendaten gehören
ausschließlich in den jeweiligen Kundenordner.

Für Beispiele gilt: **erfundene Musterdaten** (`Muster Betrieb`, `Musterstraße 1`,
`muster-betrieb.example`) oder Platzhalter (`"<Name>"`). Das Prüf-Tor kennt diese
Marker und meldet sie beim Kunden als „noch zu ersetzen".

Umgekehrt genauso: Aus einem Kundenordner fließt **nichts** ins Template zurück.
Verbesserungen am Motor gehören als neutraler Code hierher – die Inhalte bleiben dort.

**Die Stelle, an der es tatsächlich passiert, ist STAND.md.** Nicht der Code –
dort denkt man an die Regel. Sondern die Verlaufszeile am Ende einer Sitzung,
wo man aufschreibt, was man gemacht hat: „Rückfluss aus dem Piloten <Name>".
Genau so standen am 27.07.2026 drei Betriebsnamen im öffentlichen Repo und
damit in jedem Klon. Im Verlauf gehören **Branche und Art**, nie der Name:
„ein Gastro-Pilot", „zwei Vorschau-Piloten (vier Seiten / Onepager)".
Das Prüf-Tor liest dafür die Ordnernamen aus `kanbuk-kunden/` und
`kanbuk-demos/` und schlägt an, wenn einer davon im Template auftaucht.

---

## 2. Die eisernen Regeln

Diese Regeln sind **nicht verhandelbar**. `npm run check` erzwingt sie – eine Seite,
die dagegen verstößt, darf nicht raus.

- ❌ **Keine externen Requests beim Laden.** Keine CDN-Schriften, keine fremden Skripte,
  keine Fremdbilder. Alles liegt lokal. (Fremder Server = DSGVO-Problem + Ladezeit.)
- ❌ **Keine festen Pixelbreiten.** Alles fluid über die Token-Skala (Abschnitt 4).
- ❌ **Keine neuen npm-Pakete** ohne vorherige Rückfrage.
- ✅ **Jede Seite** braucht eigenen Titel, eigene Description, eigene Canonical, OG-Bild.
- ✅ **Jedes Bild** braucht einen Alt-Text.
- ✅ **Genau eine `<h1>`** je Seite.
- ✅ **Die Browser-Untergrenze halten** (`browser-untergrenze.json`, Abschnitt 4a).
  `npm run browser` ist das fünfte Tor und Pflicht vor jedem Live-Gang.

**Standard: cookiefrei, kein Tracking, kein Banner.** Das ist der Normalfall und ein
Verkaufsargument – kein Banner heißt bessere Bedienung und mehr Anfragen.

Will ein Kunde **ausdrücklich** einen Pixel oder eine bediente Karte, ist das möglich –
aber **nur über die Anschlüsse des Motors** (Abschnitt 7a):

- ❌ **Nie** ein Tracking-Skript direkt ins Markup. Immer über `dienste` in der Config,
  damit es bis zur Einwilligung geparkt bleibt.
- ❌ **Nie** ein `<iframe>` fest im HTML. Anfahrt = statisches Bild (`npm run karte`);
  wenn es unbedingt ein Rahmen sein muss: `<Einbettung>` (2-Klick).

Das Prüf-Tor setzt beides durch.

---

## 3. Sprachregeln für alle Kundentexte

Die Texte kommen meist aus dem Design. Wenn du welche schreibst oder korrigierst:

- **Österreichisches Standarddeutsch** („Jänner", „heuer", „Mehlspeise").
- **Korrekte ß-Schreibung** (Straße, Grüße, außerdem). Kein Schweizer „ss".
- **Ansprache** laut `ansprache: 'du' | 'sie'` (Standard `sie`). Die Motor-Texte
  (Formular) schalten automatisch mit (`src/lib/texte.ts`). Impressum und Datenschutz
  bleiben immer formal (Sie).
- Der Betrieb spricht **als „wir"**.
- **Keine erfundenen Zahlen, keine Superlative.** Nicht „die besten Schnitzel Wiens",
  keine erfundenen Bewertungen oder Jahreszahlen. Nur, was der Kunde bestätigt.
- **Kurze Sätze.** Klar, konkret, ohne Werbe-Blabla.

---

## 4. Design und Token-System (**der Kern des Portierens**)

> ### Der Vorrang – dieser Absatz kommt vor allem anderen
>
> **Wo das Design einen Wert nennt, gewinnt der Wert.** Die Token-Skala unten
> greift nur dort, wo das Design schweigt – und dort, wo etwas sonst am Handy
> überliefe (Seitenrand, Sektionshöhe, Spaltenzahl).
>
> Hier stand früher das Gegenteil: „Diese Werte werden **niemals** übernommen."
> Zusammen mit dem Satz „jeder Pixelwert wird zum Token" las sich das wie eine
> Einladung, frei zu übersetzen. **In einem Kundenprojekt war das die Ursache
> für den größten Fehlschlag des ganzen Ports:** Es entstand eine Seite mit
> richtigen Bauteilen in falscher Anordnung – Knöpfe und Karten stimmten aufs
> Pixel, aber Bänder hatten die falsche Grundfarbe, Bedienelemente standen an
> der falschen Stelle, Abschnitte fehlten und andere waren erfunden. Der
> Auftraggeber musste dreimal darauf hinweisen. Der Grund, warum es niemandem
> vorher auffiel, ist die Tücke der Sache: **Eine Seite aus lauter korrekten
> Komponenten wirkt fertig.** Erst wer sie neben die Design-Datei hält, sieht,
> dass es eine andere Seite ist.
>
> „1:1 nachbauen" ist ein **Auftrag**, keine Anregung.

### Zwei Dateien, zwei Fragen – beide verbindlich

Ein Claude-Design-Projekt liefert **zwei** Artefakte. Sie beantworten
verschiedene Fragen, und **wer nur eines liest, baut garantiert falsch**:

| Datei | Was darin steht | Beantwortet |
| --- | --- | --- |
| `_ds_bundle.js` + `tokens/*.css` | das Design-**SYSTEM**: Farbskala, Schriftskala, Abstände, und je Komponente ihre exakte Definition (Knopf, Karte, Chip …) | *Wie sieht ein einzelnes Bauteil aus?* |
| `<Projekt>.dc.html` | die **WEBSITE**: welche Seite aus welchen Blöcken besteht, in welcher Reihenfolge, mit welchen Abständen, Texten und Grundfarben | *Wie ist die Seite zusammengesetzt?* |

Im Kundenprojekt wurde das Design-System sauber ausgelesen und die Sache damit
für erledigt gehalten – die `.dc.html` nur überflogen. Genau daraus entstand die
Seite, die dem Design nur *ähnelte*.

**Die `.dc.html` ist die Bauanleitung, nicht die Inspiration:**

1. Sie wird **Block für Block** abgearbeitet. Jeder Seiten-Schalter
   (`<sc-if value="{{ isX }}">`) ist eine Seite, jede `<section>` darin ein
   Block. Kein Block wird zusammengefasst, umsortiert, weggelassen oder
   ergänzt – auch kein „sinnvoller" zusätzlicher.
2. Die **Inline-Stile jedes Blocks werden Wert für Wert übernommen**:
   Innenabstände, Höhen, Schriftgrößen, Radien, Zeilenhöhen, Sperrungen,
   Farben, Verläufe, Deckkraft, Übergänge.
3. Fluid gemacht wird **ausschließlich**, was sonst am Handy überliefe.
   Alles andere bleibt fest. Bringt das Design eigene `clamp()` mit, werden
   **die** übernommen – nicht durch eigene ersetzt.
4. Wo das Design eine Komponente einbindet
   (`<x-import component-from-global-scope="…">`), wird **ihre Definition im
   `_ds_bundle.js` gelesen** – dort steht das exakte Style-Objekt. Nicht raten,
   nicht vom Bildschirmfoto ableiten. Im Kundenprojekt lagen die Definitionen
   die ganze Zeit im Projekt, während die Karten nach Augenmaß nachempfunden
   wurden.
5. **Vor dem Bauen** wird eine Abweichungsliste geführt. Jede bewusste
   Abweichung braucht einen Grund und steht danach im Bericht.

### Wenn der Motor dem Design widerspricht

Zwei Motor-Untergrenzen **schlagen das Design**, und zwar ohne Ermessen:

- **Schrift unter 12 px** – die Sichtprüfung lässt sie nicht durch.
- **Kontrast unter dem WCAG-Wert** – ebenso.

Praktisch jedes Design unterschreitet beides irgendwo (Beschriftungen, Chips,
graue Zweittexte auf dunklem Grund). Das ist kein Fehler des Designs und kein
Fehler des Ports: **Abweichen ist hier Pflicht.** Sie gehört aber begründet in
den Bericht und in die Abweichungsliste – sonst steht der Inhaber vor dem Kunden
und kann nicht erklären, warum die Seite an einer Stelle anders aussieht.

### Umrechnungstabelle

**Diese Tabelle gilt nur, wo das Design für die jeweilige Stelle keinen eigenen
Wert liefert.** Liefert es einen, gewinnt er (siehe Vorrang oben).

Die Skala ist so gerechnet, dass sie die typischen Design-Werte bei **1280 px**
trifft – sie ist der Rückfall, nicht die Vorschrift.

| Design (fest) | Motor-Token | bei 1280 px |
| --- | --- | --- |
| `padding: 92px` (Sektion) | `var(--raum-2xl)` | ~92px |
| `padding: 64px` / `gap: 64px` | `var(--raum-l)` | ~64px |
| `gap: 40px` / Seitenrand | `var(--raum-m)` bzw. `var(--gutter)` | ~40px |
| `gap: 24px` | `var(--raum-s)` | ~24px |
| `gap: 16px` | `var(--raum-xs)` | ~16px |
| `gap: 8px` | `var(--raum-2xs)` | ~12px |
| `max-width: 1280px` | `var(--container)` (via `.container`) | 1280px |
| `font-size: 72px` (Hero) | `var(--schrift-4xl)` | ~72px |
| `font-size: 40px` (h2) | `var(--schrift-2xl)` | ~40px |
| `font-size: 28px` (h3) | `var(--schrift-xl)` | ~28px |
| `font-size: 16px` (Text) | `var(--schrift-m)` | 16px |
| `font-size: 14px` | `var(--schrift-s)` | 14px |
| jeder Hex-Wert | `var(--farbe-…)` | – |

**Farben nie direkt ins Markup.** Sie stehen in `content.config.ts → design.farben` und
werden zu `--farbe-<name>` (siehe `src/lib/theme.ts`).

### Die Falle bei dunklen Abschnitten (**abgeleitete Farb-Token**)

Fast jedes Design bringt eine Umkehr-Skala für dunkle Bereiche mit (Hero,
Fußzeile, Bänder) – und fast jedes benutzt **abgeleitete** Farben: eine
Haarlinie, ein Fokusring, ein Schatten, die sich aus Rahmen- und Flächenfarbe
errechnen.

Werden die Token wörtlich übernommen (und genau das verlangt der Vorrang oben),
kommt der Fehler mit: Die abgeleiteten Werte stehen im `:root` und **frieren
dort ein**. Im dunklen Abschnitt wird zwar die Basisfarbe neu gesetzt, die
davon abgeleitete aber nicht – und dann liegt eine helle Haarlinie um jede
Karte auf schwarzem Grund. Im Kundenprojekt war das auf **jeder Seite**
sichtbar und fiel elf Runden lang niemandem auf.

> **Regel:** Beim Übernehmen der Farb-Token jede Variable, die eine andere
> benutzt, im Umkehr-Bereich **wiederholen**. Wer ein Basis-Token dunkel neu
> setzt, muss alle davon abgeleiteten mitsetzen.

Verwandt und ebenso unsichtbar: `content.config.ts → design.farben` muss
**Hex-Werte** enthalten. Der Motor rechnet daraus Trennlinien und
halbdurchsichtige Leisten; bei einer anderen Schreibweise fällt die Rechnung
still auf Schwarz zurück (das Prüf-Tor meldet es).

### Zwei CSS-Fallen, die keine Prüfung von selbst sieht

**`:global(…)` gehört NICHT in eine eigenständige `.css`-Datei.** Es ist eine
Astro-Funktion für `<style>`-Blöcke *in Komponenten*. In einer normalen
CSS-Datei ist es ungültig – und der Browser verwirft dann **die komplette
Regel**, nicht nur den Selektor. In einem Kundenprojekt war dadurch
`object-fit: cover` auf der ganzen Seite wirkungslos: Jedes Bild, dessen
Seitenverhältnis nicht zufällig passte, bekam schwarze Balken. In einer
`.css`-Datei gilt der Selektor ohnehin überall – `:global()` einfach weglassen.
Das Prüf-Tor meldet es.

**`[hidden]` verliert gegen jede Klasse mit `display`.** Die Browser-Regel
steht in der Vorlage des Browsers und wird von jeder Autoren-Klasse
überstimmt – also von fast jeder Karte und jedem Raster aus dem Design.
Mehrere Motor-Bausteine verlassen sich aber auf das Attribut (Merklisten-Zähler,
„keine Treffer"-Hinweis, die Schritte des Assistenten). Deshalb steht in
`global.css` jetzt `[hidden] { display: none !important; }`. **Diese Zeile nicht
entfernen** – sonst zeigt der Zähler eine „0", obwohl nichts vorgemerkt ist,
und „Zu dieser Auswahl gibt es nichts" steht über der vollen Liste.

### Pflichtmuster für Responsiveness

```css
/* Grid, das nie überläuft – min() ist Pflicht */
grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));

/* Zweispalter aus dem Design: am Handy einspaltig */
.reihe { display: grid; gap: var(--raum-m); }
@media (min-width: 800px) { .reihe { grid-template-columns: 1fr 1fr; } }
```

> **Eine Inhaltsänderung darf das Layout nicht umschalten.** Eine `:has()`-Regel
> machte in einem Kundenprojekt die ANZAHL der Einträge zum Layout-Schalter:
> zwei Karten → zwei Spalten, auf jeder Breite. Am Handy stand im Knopf dann
> „DETA" statt „Details ansehen". Jede solche Regel gehört in eine
> Medienabfrage.
>
> Die zweite Lehre daraus wiegt schwerer: **Kein Tor hat es gemeldet**, weil die
> Karte `overflow: hidden` trägt. Der Text läuft dann nicht über, er wird
> ABGESCHNITTEN – und die Sichtprüfung maß Überlauf. Seit 30.07.2026 misst sie
> auch abgeschnittenen Text; wer eine ähnliche Falle baut, sollte trotzdem
> wissen, dass „kein Überlauf" nicht „passt" heißt.

**Die Handy-Ansicht ist deine Entscheidung, nicht die des Designs** – dort gibt es sie
nicht. Standardregeln: zwei Spalten → eine; vier Spalten → zwei → eine; Bild neben Text →
Bild über Text; Sticky-Leisten am Handy prüfen (verdecken sie Inhalt?).

---

## 4a. Die Browser-Untergrenze (**der Fall „grün, aber kaputt"**)

Der Motor sagt zu, **ab welchem Browser** eine Seite funktioniert. Die Zahl steht
an genau einer Stelle: `browser-untergrenze.json`. `astro.config.ts` baut danach,
`npm run browser` misst dagegen.

**Warum das eine eiserne Regel ist:** In einem Kundenprojekt war die abgenommene
Seite auf einem älteren Gerät unbenutzbar – **keine Navigation, auf keiner
Seite** –, während alle vier Prüfungen grün waren. Der Grund ist bauartbedingt:
`check`, `sicht`, `interaktion` und `abgleich` fahren alle dasselbe aktuelle
Chromium. Ohne festgeschriebene Zusage gibt es kein Soll, und ohne Soll gibt es
nichts zu prüfen. Ursache war eine **fehlende Angabe**, kein fehlerhafter
Quelltext: Der CSS-Verdichter schrieb `@media (min-width: 900px)` in die Kurzform
`@media (width>=900px)` um – die kennt Safari erst ab 16.4, und wer sie nicht
kennt, verwirft **den ganzen Regelblock**.

### Zwei Stufen, mit Absicht

| | |
| --- | --- |
| **bedienbar ab** | Safari 12 – alles automatisch übersetzbar |
| **vollständig ab** | **Safari 15.4** (Frühjahr 2022) – das ist die Zusage |

Ab 15.4 sieht die Seite aus wie gebaut. Das deckt jedes iPhone ab dem 6s ab –
nachgerechnet: Das 6s bekommt noch iOS 15.8, und Safari 15.4 kam mit iOS 15.4
im März 2022. Voraussetzung ist also nur, dass das Gerät innerhalb von iOS 15
aktuell gehalten wurde; ein 6s, das auf iOS 15.0 stehen geblieben ist, fällt in
die karge Stufe.
Darunter bleibt sie **lesbar und bedienbar, sieht aber karg aus** – vier
CSS-Merkmale (`clamp`, `aspect-ratio`, `dvh`, `padding-block`) lassen sich nicht
übersetzen. **Das ist eine Entscheidung, kein offener Punkt.** Auch das Aussehen
bis Safari 12 zu retten hieße Ersatzwerte durch das ganze Token-System zu
ziehen – geprüft und bewusst verworfen, es wäre Aufwand für weit unter ein
Prozent der Besucher. Zum Vergleich in die andere Richtung: Vite hätte von sich
aus Safari 16.4 gewählt, also 2023 statt 2022.

### Schreibweisen im Browser-Code (**Regel für Motor-Bausteine**)

Gilt für alles unter `src/lib/verhalten/` und für jedes `<script>` in einer
Seite – **nicht** für `scripts/`, das läuft in Node.

1. **Kein Zerlegen in Klammern.** `const [a, b] = …` und `const { a } = …` sind
   die einzige moderne Schreibweise, die der Übersetzer **nicht** ersetzen kann.
   Steht sie irgendwo im Browser-Code, ist das **gesamte Skriptbündel** für
   ältere Browser ein Lesefehler – dann fällt nicht ein Baustein aus, sondern
   alle gleichzeitig, ohne Meldung für den Besucher. Ausschreiben:
   `const a = x[0]; const b = x[1];`
2. **Kein modernes CSS-Merkmal ohne Absicherung – und der Ersatzwert davor
   reicht oft NICHT.** Der übliche Rat lautet: einfache Zeile davor, moderne
   danach; wer die zweite nicht versteht, behält die erste. Das stimmt **nur,
   solange die moderne Zeile kein `var()` enthält**. Im Browser nachgemessen:

   ```css
   /* WIRKT NICHT – der Ersatzwert wird gelöscht: */
   border-top: 1px solid var(--farbe-linie);
   border-top: 1px solid color-mix(in srgb, var(--farbe-text) 12%, transparent);
   ```

   Eine Zeile mit `var()` kann der Browser beim **Einlesen** nicht prüfen. Er
   behält sie, ersetzt später die Variable, stellt dann fest, dass das Ergebnis
   ungültig ist – und setzt die Eigenschaft auf **nichts**. Der Ersatzwert
   löscht also genau das, was er retten soll. Gemessen: Rahmen 0px statt 1px.

   Deshalb im Motor **drei Wege, in dieser Reihenfolge**:
   1. **Rechnen statt mischen.** `color-mix(in srgb, X 12%, transparent)` ist
      dasselbe wie `rgba(X, 0.12)`. Der Motor leitet solche Farben in
      `src/lib/theme.ts` ab (`--farbe-linie`, `--farbe-grund-92` …) und benutzt
      **nirgends** `color-mix()`. Das ist der Normalfall.
   2. **Ersatzwert davor** – aber nur, wenn die moderne Zeile **kein `var()`**
      enthält. Beispiel im Motor: `max-height: calc(100vh - 100%)` vor
      `calc(100dvh - 100%)`.
   3. **`@supports`**, wenn es beides nicht gibt. Ein alter Browser überspringt
      den Block ganz, statt die Eigenschaft zu löschen.

   Unterhalb der **Zusage** (nicht der Bedienbar-Grenze) ist eine Absicherung
   Pflicht. Zwischen den beiden Grenzen nur dann, wenn ohne sie etwas
   **unbedienbar** wird – Beispiel `dvh` im Menü: ohne Ersatzwert sind im
   Querformat die unteren Menüpunkte unerreichbar. Reines Aussehen wird dort
   bewusst nicht gerettet (Abschnitt „Zwei Stufen, mit Absicht").
3. **Bilder immer `<Picture>` mit `fallbackFormat="jpeg"`**, dazu
   `picture { display: contents }` in `global.css`. Ohne Ersatzfassung zeigen
   Macs mit älterem Betriebssystem **kein einziges Foto** – dort hängt WebP am
   System, nicht an der Safari-Version. Das sind genau die Rechner, die in
   Betrieben als Büro-Mac weiterlaufen. Bei einem Händler fällt damit aus, was
   verkauft. Logos bleiben `<Image>`: klein, oft mit Transparenz.

### Was das fünfte Tor NICHT sieht

Ehrlich benannt, damit niemand sich in falscher Sicherheit wiegt:

- **JavaScript** prüft es vollständig, **CSS** nur gegen eine benannte Liste in
  `scripts/browser.mjs`. Ein brandneues Merkmal, das dort fehlt, fällt durch –
  dann gehört es in `CSS_MERKMALE`. Ein maschinelles Auffangnetz wurde versucht
  und verworfen: Es meldete konstruktionsbedingt Falschmeldungen.
- **Funktionen, die erst im Browser fehlen**, nicht in der Datei:
  `dialog.showModal()`, `replaceChildren`, `matchMedia.addEventListener`.
  Syntaktisch sind sie einwandfrei.
- **Bild- und Schriftformate, Zertifikate, Netzwerk.**
- **Wie schlimm es aussieht.** Das Tor sagt, WAS fehlt. Das Aussehen zeigt
  `npm run altgeraet` – Bilder der Seite ohne die modernen Merkmale, ohne dass
  ein altes Gerät da sein muss. **Ansehen ist Pflicht**, genau daran ist die
  Einschätzung im Kundenprojekt einmal vorbeigegangen.
- **Ein echtes Altgerät ersetzt es nicht.** Siehe STAND.md, offener Punkt.

---

## 5. Verhaltens-Bausteine (`src/lib/verhalten/`)

Mechanik ohne Aussehen. **Branchenneutral**: „Tabs" sind Speisekarten-Kategorien beim
Wirt, Wochentage beim Yoga-Studio, Leistungsbereiche beim Installateur. Nie selbst neu
bauen – anschließen und im Design anmalen.

| Baustein | Aktiviert durch | Typischer Einsatz |
| --- | --- | --- |
| **Tabs** | `data-tabs` + `data-tab` / `data-tabpanel` | Speisekarte, Kursplan, Leistungen |
| **Filter (einfach)** | `data-filter` + `data-kategorie` | Galerie, Referenzen |
| **Filter (kombiniert)** | `data-filter-kombi` + `data-filter-gruppe` / `data-filter-max` | Katalog: mehrere Merkmale, Preisregler, Sortierung, Trefferzähler |
| **Slider** | `data-slider` + `data-slider-spur` | Galerie, Stimmen |
| **Akkordeon** | `data-akkordeon` (nativ `<details>`) | FAQ, Preisgruppen |
| **Lightbox** | `data-lightbox` (nativ `<dialog>`) | Galerie – blättert mit Pfeilen, Tastatur und Wischen |
| **Mobilmenü** | `data-menue-schalter` + `data-menue` | Navigation |
| **Vergleich** | `data-vergleich` | Vorher/Nachher |
| **Formular** | `<Formular id="…" />` | Kontakt, Reservierung, Termin |
| **Assistent** | `formulare[].schritte` + `felder[].schritt` | Langes Formular in Schritten, mit Fortschritt – ab ca. 8 Feldern |
| **Dialog** | `data-dialog` + `data-dialog-oeffnen` (nativ `<dialog>`) | Anfrage-Fenster, Hinweis; `data-dialog-bezug` trägt den Eintrag mit |
| **Merkliste** | `data-merken="id"` | Vormerken/Favoriten – bleibt auf dem Gerät (Abschnitt 6a) |
| **Katalog** | `katalog` in der Config | Fahrzeuge, Objekte, Maschinen, Kurse – Übersicht **und je Eintrag eine eigene Seite** (Abschnitt 6a) |
| **Bildzeichen** | `<Symbol name="car-front" />` | Alle Icons des Designs – Lucide liegt vollständig im Motor (Abschnitt 5a) |
| **Social-Icons** | `<SocialLinks />` (liest `betrieb.socialLinks`) | Fußzeile, Kontaktseite |
| **Signatur** | `<Signatur />` | Fußzeile – Kanbuk-Backlink (**Live-Pflicht**, Prüf-Tor erzwingt sie) |
| **Kopf / Fuß** | `<Kopf aktuell={pfad} />`, `<Fuss />` | Kopfleiste mit Handy-Navigation, Fußzeile mit Rechtslinks |
| **Öffnungszeiten** | `<Oeffnungszeiten />` | Wochenzeiten + Feiertage/Betriebsurlaub (`betrieb.sonderzeiten`) |
| **Öffnungs-Status** | `<Oeffnungsstatus />` | „Jetzt geöffnet · bis 22:00" – rechnet in der Zeitzone des Betriebs |
| **Einwilligung** | automatisch, wenn `dienste` gefüllt | Pixel/Tracking (Abschnitt 7a) |
| **Einbettung** | `<Einbettung url=… />` | Maps/YouTube per 2-Klick (Abschnitt 7a) |

Sie vergeben nur ARIA-Attribute und Zustandsklassen (`.ist-aktiv`, `.ist-offen`).
Alles funktioniert **ohne JS** sinnvoll. Details stehen im Kopf jeder Datei.

---

## 5a. Bildzeichen (**Icons werden NIEMALS selbst gezeichnet**)

Ein Claude Design bindet Symbole **per Name** aus einer Bibliothek ein
(`<script src="https://unpkg.com/lucide@latest">`, dann `Icon name="gauge"`).
Der Motor verbietet externe Requests zu Recht – sagte aber lange nicht, woher
die Zeichen dann kommen sollen.

**Was daraus im Kundenprojekt wurde:** Es wurden eigene Symbole *gezeichnet*.
Danach sah jedes Zeichen der Seite anders aus als im Design, und die ganze
Seite wirkte fremd. Das ist kein Schönheitsfehler – Symbole tragen den
Wiedererkennungswert eines Auftritts.

> **Deshalb liegt Lucide VOLLSTÄNDIG im Motor** – 2007 Symbole, feste
> Version, im Repo. Jedes Zeichen, das ein Design per Name einbindet, ist da:
>
> ```astro
> <Symbol name="car-front" />
> <Symbol name="phone" label="Anrufen" />   <!-- trägt Bedeutung -->
> ```
>
> **Fehlt eines wirklich, ist das eine Motor-Meldung – kein Anlass, den Stift
> zu nehmen.**

**Vier Dinge, die dabei geregelt sind:**

1. **Nur Angefordertes landet in der Seite.** Die Bibliothek ist Datenquelle im
   Repo (`icons/lucide.json`), kein Auslieferungsgut. `<Symbol>` gibt genau ein
   Zeichen aus. Das Prüf-Tor **misst** es und nennt die Zahl in seiner
   Ergebniszeile – 2007 ungenutzte Symbole im HTML wären ein Eigentor gegen
   die eigene Ladezeit-Regel.
2. **Feste Version, kein „latest".** Sonst sieht ein Klon von heute in zwei
   Jahren anders aus als einer von morgen. Sie steht in `package.json`
   (`iconBibliothek`), in `scripts/icons.mjs` und in STAND.md.
3. **Die Lizenz liegt bei** (`icons/lucide.LICENSE`, ISC). Sie erlaubt die
   Nutzung, verlangt aber den Text.
4. **Ein falscher Name scheitert laut.** `<Symbol name="autoo" />` hält den
   Build an und schlägt ähnliche Namen vor – statt still nichts auszugeben und
   eine Lücke auf der Seite zu hinterlassen, die niemandem auffällt.

**Andere Bibliotheken bleiben möglich.** Nennt ein Design heroicons, phosphor
oder feather:

```
npm run icons -- --set heroicons --namen "home,user,phone"
```

Dort werden **nur die genannten** Zeichen geholt (bei einer fremden Bibliothek
kennen wir weder Umfang noch Aufbau). Verwendung dann
`<Symbol set="heroicons" name="home" />`.

**Größe und Farbe** kommen aus der Umgebung: Das Symbol ist `1em` groß und
nimmt `currentColor` an – das Design setzt `font-size` und `color` wie bei
Text. Feinschliff über `.symbol` oder `[data-symbol="car-front"]`.

---

## 6. `content.config.ts` – die Motor-Schnittstelle

**Faustregel:** Steht es im Browser-Tab, in Google, in einer E-Mail oder im Impressum →
Config. Sieht man es auf der Seite → Design.

Dort stehen: Betriebsdaten (Name, Kontakt, Adresse, Öffnungszeiten), Design-Tokens,
Seiten samt SEO, Formulare, Preisliste, Rechtstexte, Steuerung (`mode`, `branche`,
`ansprache`, `sprachen`, `domain`).

**Mehrsprachigkeit:** `sprachen: ['de','en']` nur setzen, wenn die englischen Seiten
wirklich als Routen gebaut werden (`src/pages/en/…`) – sonst zeigen die automatischen
hreflang-Verweise ins Leere. Das Prüf-Tor kontrolliert das.

**Ausnahme mit Absicht:** Tabellarische Daten, die sich oft ändern (Speisekarte,
Preisliste), stehen hier – damit eine Preisänderung eine Ein-Datei-Änderung bleibt.
Bei sehr großen Karten (mehrere Kategorien, hunderte Positionen) in
`daten/preisliste.ts` auslagern und importieren.

**Allergene sind in der Gastronomie Pflicht** (österreichische Kennzeichnung A–R),
sobald Speisen gelistet sind. Feld: `PreisPosition.allergene`.

---

## 6a. Katalog – viele Einträge, jeder mit eigener Seite

**Wann:** Ein Betrieb zeigt viele gleichartige Dinge, die man einzeln ansieht und
verschickt – Fahrzeuge, Immobilien, Maschinen, Kurse, Projekte, Zimmer.

**Abgrenzung zur Preisliste:** Die Preisliste ist eine *Tabelle auf einer Seite*
(Speisekarte, Behandlungen). Der Katalog ist eine *Liste mit Detailseiten*.
Faustregel: Würde jemand einen einzelnen Eintrag per WhatsApp verschicken wollen?
Dann Katalog.

**Was der Motor daraus macht** (`katalog` in `content.config.ts` füllen – fertig):

- eine Übersicht unter `katalog.pfad` mit Filter, Preisregler, Sortierung,
  Trefferzähler und Merkliste. **Filtergruppen und Regler entstehen automatisch
  aus den Daten** – ein neues Merkmal in der Config ist sofort filterbar, und es
  steht nie eine Auswahl da, die null Treffer hätte.
- je Eintrag eine **echte Adresse** (`/fahrzeuge/bmw-320d`) mit eigenem Titel,
  eigener Description, eigener Canonical, eigenem Vorschaubild (1200×630 aus dem
  ersten Foto) und Produkt-Schema samt Preis und Verfügbarkeit.

**Warum das der größte SEO-Hebel bei einem Händler ist:** Ohne eigene Adresse je
Eintrag findet Google *eine* Seite statt zweihundert.

**Verkauft ≠ gelöscht.** `verfuegbar: false` nimmt den Eintrag aus der Liste, die
Seite bleibt erreichbar. Sonst liefe jeder alte Google-Treffer ins Leere.

**Die Kennung (`id`) ist die Adresse.** Nach dem Live-Gang nicht mehr ändern –
sonst ist der Google-Treffer tot. Muss es doch sein: Eintrag in `weiterleitungen`
(Abschnitt 7b). Der Build bricht ab bei doppelten Kennungen, bei Kennungen mit
Leerzeichen/Umlauten und bei einem `anfrageFormular`, das es nicht gibt.

**Beschriftungen.** Die Schlüssel unter `filter`/`zahlen` sind Adressbausteine
(`gruen`, `km`). Was auf der Seite stehen soll, gehört nach
`katalog.beschriftungen` (`{ gruen: 'Grün', km: 'Kilometerstand' }`) – sonst liest
der Besucher „Gruen".

**Beim Portieren – und was hier wirklich die Schnittstelle ist:**

Der Motor bringt mit `KatalogListe.astro` eine fertige Übersicht mit. Die ist
ein **Beispiel**, keine Vorschrift. In einem echten Design weicht nicht nur die
Karte ab, sondern die ganze Filterleiste: Position, Reihenfolge, Bedienart
(Knöpfe statt Kästchen), Beschriftungen. Im Kundenprojekt wurde die Komponente
deshalb gar nicht benutzt und die Liste komplett neu gebaut.

> **Die Schnittstelle des Katalogs sind die `data`-Attribute, nicht die
> Komponente.** Wer eigenes Markup schreibt, muss nur zwei Dinge einhalten:
> `{...katalogAttribute(e)}` an jede Karte, und die `data-filter-*`-Attribute
> aus Abschnitt 5 an die Bedienelemente. Daran hängen Filter, Sortierung und
> Merkliste – fehlen sie, filtert nichts mehr.

**Wichtig für den Bericht:** Der Motor erzeugt Filtergruppen und Regler
automatisch aus den Daten. Das ist für den ersten Wurf gut, entspricht aber
nicht zwangsläufig dem Design – ein Design legt seine Filterleiste immer genau
fest, die Datenlage nie. Erscheint ein Bedienelement, das im Design nicht
vorkommt, ist das **kein Einfall des Ports, sondern der Motor**. Es gehört
entfernt und in die Abweichungsliste.

### Merkliste und Datenschutz

Die Merkliste liegt im Speicher des Geräts, geht an keinen Server und braucht
**kein Banner** – sie ist funktional und wird vom Besucher selbst ausgelöst.
Zwei Pflichten bleiben: Sie **muss** in der Datenschutzerklärung stehen, und die
Aussage „wir speichern nichts" stimmt dann nicht mehr wörtlich. Richtig ist:
„keine Cookies, kein Tracking – die Merkliste bleibt auf Ihrem Gerät."

---

## 6b. AGB – nur wenn wirklich verkauft wird

`rechtstexte.agb` füllen → die Seite `/agb` samt Fußzeilen-Link entsteht.
Feld weglassen → es gibt sie nicht.

**Nötig**, sobald über die Website verkauft, verbindlich gebucht oder bestellt
wird. Ein reines Kontaktformular braucht keine AGB.

### Gewährleistung und Garantie sind ZWEI Dinge – nie „bzw."

Steht auf einer Seite „Gewährleistung bzw. Garantie", setzt sie beides gleich.
Das ist irreführend:

- **Gewährleistung** ist die *gesetzliche* Haftung für Mängel, die beim Kauf
  schon vorhanden waren. Gegenüber Verbrauchern ist sie nicht abdingbar.
- **Garantie** ist eine *freiwillige* Zusage obendrauf – oft von einem Dritten
  (Hersteller, Versicherer), nicht vom Betrieb.

> **Hier stand „(§ 9b KSchG)" – diese Bestimmung gibt es nicht mehr.** Sie ist
> mit der Gewährleistungsreform zum 31.12.2021 entfallen; seit 1.1.2022 gilt
> für Verbrauchergeschäfte das Verbrauchergewährleistungsgesetz (VGG).
>
> **Und deshalb steht hier jetzt gar keine Paragraphenangabe.** Es gilt
> dieselbe Regel wie für Menüpunkte fremder Oberflächen (Abschnitt 0): entweder
> belegt nachgeschlagen oder weggelassen. Eine falsche Fundstelle ist schlimmer
> als keine – sie sieht geprüft aus, und der Inhaber zitiert sie im Zweifel
> gegenüber seinem Kunden weiter. Wird eine Angabe wirklich gebraucht, gehört
> sie im Kundenprojekt nachgeschlagen (RIS, WKO), nicht hier aus dem Gedächtnis
> ergänzt. Der Unterschied selbst ist unstrittig und trägt den Absatz auch ohne.

**Warum das mehr wiegt als eine Formulierung:** Über das FAQ-Schema erscheint so
eine Antwort direkt im Google-Treffer – als Zusage des Betriebs, an einer Stelle,
an der niemand das Kleingedruckte danebenstellen kann.

Bei jedem Betrieb, der verkauft, gilt deshalb: die beiden Begriffe getrennt
halten und beim Kunden nachfragen, **wer** die Garantie gibt (Hersteller,
Drittanbieter, er selbst). Davon hängt ab, was auf der Seite stehen darf.

**Und generell: erst fragen, dann umschreiben.** Ein vermuteter Widerspruch
zwischen Seite und AGB löste sich in einem Kundenprojekt auf, sobald der Kunde
gefragt wurde – die Seite hatte recht. AGB sind Vertragsrecht; wer sie
„glattzieht", ändert einen Vertrag.

**Den Text erfindet der Motor nicht.** AGB sind Vertragsrecht; er kommt vom
Betrieb (Anwalt, WKO-Muster, Steuerberater). Fehlt er noch:
`PLATZHALTER: AGB-Text vom Kunden` eintragen – das Prüf-Tor hält den Live-Gang
dann an, statt eine erfundene Klausel online gehen zu lassen.

---

## 6c. Redaktion – der Betrieb pflegt selbst

**Wann:** Der Bestand ändert sich wöchentlich (Fahrzeuge, Immobilien, Kurse,
Zimmer) und der Betrieb fragt: *„Kann ich das selbst pflegen?"* Bei einer Seite,
die sich zweimal im Jahr ändert, ist die Antwort **nein** – ein
Redaktionssystem ist dann zusätzliche Technik ohne Nutzen. Zwei Anrufe pro Jahr
sind billiger als ein System, das gewartet werden will.

**Standard bleibt: kein Redaktionssystem.** Solange `redaktion/dienst.json`
fehlt, ist der Baustein aus und die Inhalte stehen in `content.config.ts`.

### Der Grundsatz

> **Der Dienst schreibt Dateien, der Motor baut aus Dateien.**

Beim Bauen wird **nichts** abgefragt. `npm run inhalte` läuft getrennt davon und
legt die Inhalte (`daten/inhalte.json`) und die Bilder (`fotos/inhalte/`) ins
Projekt; beides wird eingecheckt. Erst daraus baut die Website.

Der Umweg ist der ganze Punkt. Fragt der Build selbst ab, hängt **jede**
Veröffentlichung am fremden Dienst – auch eine Textkorrektur oder ein
Rechtstext. In einem Kundenprojekt reichte dafür eine einzige 403-Antwort des
Bildservers.

### Die drei Sicherungen

1. **Ohne Zugang passiert nichts** – kein Zugang löscht nichts.
2. **Eine leere Antwort überschreibt nie.** Sonst löscht ein Aussetzer den
   gesamten Bestand, und die Seite steht leer da – es sähe nach Absicht aus.
3. **Ein fehlerhafter Eintrag fällt raus, nicht die ganze Liste.**

Dazu: **geschrieben wird JSON, nie Code.** Ein Generator, der TypeScript
zusammensetzt, kann bei unerwarteter Eingabe ungültigen Code erzeugen – und
dann sprengt ein Laie mit „Veröffentlichen" den Build, ohne es je zu erfahren.

> **Wo ein Skript Code erzeugt, gelten dieselben Regeln wie für Handarbeit –
> erzeugte Dateien liest niemand nach.** Am 30.07.2026 an einer Kundenseite
> aufgelaufen, beide Male nur im Bau-Protokoll des Hosters sichtbar, während
> der Build als erfolgreich galt:
>
> - Ein `as const` an einem erzeugten Export machte daraus ein
>   **readonly-Tupel**, das dem Motor-Typ `string[]` nicht zuweisbar war. Es
>   war überflüssig – der Typ verlangt keine feste Wertemenge.
> - Ein erzeugter **Import ohne `.js`-Endung** – genau die Falle, vor der der
>   Kommentar in `api/contact.ts` warnt, nur eben in generiertem Code.
>
> Beides ist **zweimal** zu beheben: im Generator UND in den bereits erzeugten
> Dateien. Sonst stimmen sie beim nächsten Lauf wieder nicht überein, und
> niemand weiß, welche Fassung die richtige war.

### Eine Feldliste, drei Verbraucher

`redaktion/felder.mjs` ist die **einzige** Stelle, an der steht, was der Betrieb
pflegen darf. Daraus entstehen die Eingabemaske (`npm run maske`) und die
Abfrage (`npm run inhalte`); gelesen wird ohnehin alles, was ankommt
(`src/lib/inhalte.ts` überlagert Feld für Feld, ohne eigene Liste).

**Warum das strikt ist:** In einem Kundenprojekt bot die Maske zehn
Impressumsfelder an, verdrahtet waren sechs. Vier ließen sich ändern, ohne dass
sich je etwas änderte, und eingetragene Feiertage erschienen überhaupt nie. Der
Betrieb ändert seine Anschrift, sieht „veröffentlicht" – und die Website zeigt
weiter die alte. Bei Pflichtangaben nach § 5 ECG ist das ein Rechtsrisiko, und
es ist der schlimmste Fehlertyp überhaupt, weil alles grün aussieht.

**Nie ein Feld einzeln verdrahten.** Kommt eines dazu: in `felder.mjs`
eintragen, `npm run maske`, im Studio veröffentlichen. Sonst nichts.

### Bilder: der Name kommt aus dem Inhalt

Ein Foto heißt nach seiner Prüfsumme, nie nach seiner Position. Heißt es
`eintrag-1.jpg`, bleibt der Name beim Tauschen gleich – und die Website zeigt
für immer das alte Bild, ohne jede Fehlermeldung. Das trifft die häufigste
Pflegehandlung überhaupt: ein besseres Foto nachschieben.

### Die nächtliche Sicherung ist Teil des Bausteins, nicht Zubehör

`.github/workflows/inhalte-sichern.yml` liegt bei. Sie holt Inhalte **und
Bilder**, checkt sie **nur bei Änderung** ein, und das Einchecken stößt die
Veröffentlichung an. Ohne sie ist der eingecheckte Stand der vom letzten
Handgriff des Betreuers – und driftet ab dem ersten Tag ab, an dem der Betrieb
selbst pflegt. Fällt der Dienst ein halbes Jahr später aus, baut die Seite mit
uraltem Bestand: Verkauftes stünde wieder als verfügbar da, alte Preise wären
wieder gültig. **Das ist schlimmer als ein sichtbarer Ausfall, weil es
plausibel aussieht.**

Das Prüf-Tor hält den Live-Gang an, wenn ein Projekt gepflegte Inhalte hat und
die Sicherung fehlt. Einrichtung und der ehrliche Wortlaut der Zusage stehen in
`redaktion/README.md`.

### Die Anleitung für den Betrieb

`redaktion/ANLEITUNG-VORLAGE.md` ist eine **Vorlage mit Lücken**, keine fertige
Anleitung. Die Beschriftungen fremder Oberflächen stehen dort als `<…>` und
werden beim Einrichten **nachgesehen, nicht geraten** – wer sie aus dem
Gedächtnis behauptet, kostet den Auftraggeber eine Runde vor dem Bildschirm.
Gleiche Regel wie überall sonst: keine Befehlszeile, keine Dateipfade.


---

## 7. mode-Logik (`mode: 'demo' | 'live'`)

Der Unterschied ist **nicht die Qualität, sondern nur die Zugänge**. Die Vorschau ist
die fertige Seite – mit gezogenem Stecker.

**`demo` (Vorschau für einen Lead):**
- Kanbuk-Balken oben; das Formular ist **sichtbar und bedienbar**, mit einem Hinweis
  darüber und ohne Versandziel im Markup (`data-formular-vorschau`, kein `action`).
  So sieht der Kunde bei der Abnahme, was er bekommt, der Port schreibt das
  Formular-Aussehen nicht blind, und beide Prüfungen fahren es wirklich an.
- Telefonnummer **nicht** als `tel:`-Link
- `noindex, nofollow` als Meta **und** als HTTP-Header (`X-Robots-Tag`)
- `robots.txt` sperrt alles, keine Sitemap
- **Braucht keinen Resend-Schlüssel, keine echte Domain, keine echten Rechtstexte**
- `vorschauDomain` setzen (die Adresse, unter der die Vorschau wirklich liegt) –
  sonst zeigt WhatsApp beim Verschicken kein Vorschaubild

**Adress-Stufen (Kanbuk-Konvention):** Verkaufs-Demo auf
`demo-<kunde>.kanbuk.com` (setzt `npm run demo` automatisch) → Abnahme-Vorschau
des gebauten Klons auf `<kunde>.kanbuk.com`
(`npx vercel domains add <kunde>.kanbuk.com <projekt>` – als **Projekt-Domain**,
nie per `alias set`: ein Alias landet hinter dem Vercel-Zugriffsschutz) → live
auf der
**eigenen Domain des Kunden**. Die kanbuk.com-Unterdomains sind Vorschau-Stufen,
nie die endgültige Adresse.

**`live` (die Seite soll öffentlich sein – im Standardablauf: der Kunde hat gebucht):**
kein Balken, Formular scharf (Resend), `tel:` klickbar,
Indexierung an, Sitemap. Zusätzlich nötig – und das sind **die einzigen drei Dinge**:

1. **Echte Rechtstexte** (UID, Firmenbuch – Impressumspflicht in Österreich)
2. `RESEND_API_KEY` + `CONTACT_FROM` (damit das Formular sendet)
3. Domain verbinden

`vercel.json` erzeugt der Build **automatisch** aus dem
`mode` (siehe `astro.config.ts`) – da ist nichts von Hand zu ändern. Früher musste man
den `X-Robots-Tag` händisch aus `vercel.json` löschen; wurde das vergessen, blieb die
Seite für Google unsichtbar, ohne dass es jemandem auffiel. Solche stillen Fallen darf
ein Motor nicht haben.

---

## 7a. Ausbau: Tracking, Pixel, Einbettungen

**Der Normalfall bleibt: cookiefrei, kein Banner.** Das ist kein Zufall, sondern ein
Verkaufsargument – kein Banner heißt bessere Bedienung und mehr Anfragen. Solange
`dienste: []` leer ist, wird nichts geladen, nichts gesetzt, nichts gerendert.

Der Motor bringt die **Anschlüsse** aber fertig mit. Ein späterer Ausbau ist deshalb
Konfiguration, kein Neubau.

### Pixel / Tracking / Ads

Dienst in `content.config.ts → dienste` eintragen – fertig. Automatisch passiert dann:

- Der Einwilligungs-Banner erscheint (`src/components/Einwilligung.astro`)
- Das Skript wird als `<script type="text/plain" data-einwilligung="marketing">`
  **geparkt** – der Browser führt es **nicht** aus. Erst nach dem Ja wird daraus ein
  echtes `<script>`. Das ist Opt-in, wie es die DSGVO verlangt.
- Der Dienst erscheint **automatisch in der Datenschutzerklärung**, samt Anbieter,
  Zweck und Widerruf-Knopf.

**Nie ein Tracking-Skript direkt ins Markup schreiben.** Das Prüf-Tor blockt es.

**`drittland` ist Pflicht, sobald ein Dienst eingetragen wird** (`'keines'`,
`'USA'` oder das Land ausgeschrieben). Der Drittland-Absatz der
Datenschutzerklärung nennt dann **nur die Dienste, die ihn wirklich brauchen**,
und zwar namentlich. Vorher entstand er allein daraus, DASS überhaupt ein Dienst
eingetragen war – bei einem europäischen Werkzeug hätte die Erklärung damit eine
Datenübermittlung behauptet, die es gar nicht gibt, samt falscher
Rechtsgrundlage.

**Die Einwilligung wird von selbst ungültig, wenn sich die Dienste ändern.** Die
Kennung der Liste entsteht beim Bauen (`diensteKennung`) und steht am Banner;
ändert sich Anbieter, Zweck, Quelle oder Land, wird automatisch neu gefragt.
Das ist keine Formsache: Eine Einwilligung ist **anbieterbezogen** – ein zweiter
Dienst derselben Kategorie liefe sonst bei allen Besuchern mit, die einer
anderen Firma zugestimmt haben. Früher hing das an einer handgepflegten Zahl in
einer Baustein-Datei, die beim Ausbau niemand öffnet.

### Google Maps, Instagram, YouTube

Ein `<iframe>` lädt sofort und setzt Cookies – deshalb **nie fest ins HTML**.
Zwei zulässige Wege:

1. **Statisches Bild + Link** (`npm run karte`) – der Standard für die Anfahrt.
   Kein Rahmen, kein Klick, keine Diskussion.
2. **2-Klick-Einbettung** (`<Einbettung>`) – wenn der Kunde unbedingt eine bediente
   Karte oder ein Video will. Der Rahmen entsteht erst beim Klick; vorher geht kein
   Byte raus. Der Klick ist die Einwilligung für diesen Fall.

   **`anbieter="…"` ist dabei Pflicht und muss den echten Namen tragen.** Die
   Datenschutzerklärung sucht selbst im Markup nach Einbettungen und schreibt je
   Anbieter einen Absatz – es gibt keinen Handschalter mehr. Der alte Schalter
   ging in einem Kundenprojekt schief: Die Karte war zwanzig Minuten online,
   während die Erklärung wörtlich behauptete „Es wird keine Karte eingebettet".
   Das Prüf-Tor hält jetzt beides gegeneinander, in beide Richtungen.

**Instagram-Grid:** Kein API-Anschluss im Motor – Meta ändert die Schnittstelle
ständig, Tokens laufen ab, und ein Klon bekommt keine Updates. Das wäre eine
Zeitbombe. Stattdessen: kuratierte Fotos in der Galerie (sieht ohnehin besser aus)
oder eine 2-Klick-Einbettung.

### Was NICHT in den Motor gehört

Shop, Buchungssystem, Blog, Newsletter-Verwaltung. Zu unterschiedlich je Kunde. Wenn
ein Kunde das braucht, baut es der jeweilige Chat in seinem Ordner – der Motor liefert
die Grundlage (Routen, Formular-Motor, Token, Einwilligung), auf der das aufsetzt.

---

## 7b. Weiterleitungen (**wird gern vergessen**)

Hatte der Betrieb **schon eine Website**, haben die alten Seiten Adressen, die bei
Google stehen und auf die andere verlinken. Ohne Weiterleitung laufen die alle ins
Leere – der Kunde verliert über Nacht seine mühsam aufgebaute Sichtbarkeit.

Deshalb: alte Adressen erfassen und in `weiterleitungen` eintragen:

```ts
weiterleitungen: [
  { von: '/speisen.html', nach: '/speisekarte' },
  { von: '/kontakt.php',  nach: '/kontakt' },
],
```

Daraus entsteht beim Bauen automatisch der `redirects`-Block in `vercel.json`.
Standard ist 301 – das vererbt das Ranking. Adressen mit Fragezeichen
(`/index.php?id=670`, typisch für alte TYPO3-Seiten) werden dabei korrekt in
Pfad + `has`-Bedingung zerlegt; ohne das liefen die alten Google-Treffer still
ins Leere.

### Die Bestandsaufnahme VOR dem Umschalten – drei Pflichtschritte

„Alte Adressen erfassen" ist zu wenig. Am 30.07.2026 an einer echten
Domainumstellung nachgemessen – jeder der drei Schritte fand etwas, das die
beiden anderen nicht gefunden hätten.

**(a) Die alte Sitemap-Adresse selbst weiterleiten.** WordPress mit Yoast legt
`sitemap_index.xml` an – mit **Unterstrich** – und nennt Google diese Adresse in
seiner `robots.txt`. Der Motor erzeugt `sitemap-index.xml` mit **Bindestrich**.
Ohne Weiterleitung holt Google am Tag nach dem Umschalten eine 404 auf die
einzige Sitemap, die es kennt. Das gehört als Standard-Eintrag ins Rezept, nicht
in die Handarbeit jedes Klons:

```ts
{ von: '/sitemap_index.xml', nach: '/sitemap-index.xml' },
```

**(b) Den Search-Console-Export auswerten, nicht nur die Sitemap.** Die Sitemap
zeigt nur, was die alte Seite **heute** listet. Der Export zeigt, was Google
**ausliefert** – und das ist mehr. Im Kundenprojekt fand er drei Adressen
längst entfernter Einträge, eine davon auf der ersten Ergebnisseite. Das trifft
**jeden Betrieb mit wechselndem Angebot**: ausgelaufene Kurse, vergebene
Objekte, alte Aktionsseiten, abgesagte Termine. Genau die Adressen sind aus der
Sitemap verschwunden und stehen trotzdem noch bei Google.

**(c) Die DNS-Zone beim Anbieter EXPORTIEREN, nicht von außen abfragen.** Eine
Abfrage zeigt, was gerade beantwortet wird; der Export zeigt, was eingetragen
ist. Im Kundenprojekt: Abfrage sieben Einträge, Export acht. Es fehlte
`imap.` als CNAME – ohne den funktioniert **kein Mailprogramm mehr**, bei
völlig unverändertem MX-Eintrag. Der Export gehört als Wiederherstellungspunkt
ins Repo (`dns-vorher-<datum>.txt`), mit einem Kopf, der in zwei Sätzen sagt,
was geändert wird und was ausdrücklich **nicht**.

---

## 8. Das Portier-Rezept

Immer gleich. Details im `/port`-Skill (`.claude/skills/port/SKILL.md`).

1. **Inventar** – Design-Projekt auslesen: Seiten, Schriften, externe Ressourcen,
   Bilder, Verhalten (Tabs? Filter? Sprachen?), Lücken (Platzhalter?).
2. **Entgiften** – `npm run schrift` je Schrift, `npm run karte` für die Anfahrt,
   Maps-Rahmen raus, Fremdbilder lokal.
3. **Config füllen** – Betriebsdaten, Design-Tokens, Seiten samt SEO, Formulare,
   Preisliste, **Weiterleitungen** (falls es eine Vorgänger-Website gab, Abschnitt 7b). `package.json → name` umbenennen – **die maßgebliche Namenstabelle
   steht im `/deploy`-Skill**, damit Paket-, Repo- und Vercel-Name zusammenpassen.
   Hier stand früher ein eigenes Präfix, das der Tabelle widersprach und im
   Kundenprojekt einen Korrektur-Commit kostete. Wirkung: Das Prüf-Tor wird
   scharf, sobald der Name **nicht mehr** `kanbuk-website-template` lautet – auf
   welchen er wechselt, ist dafür gleichgültig.
4. **Seiten bauen** – je Unterseite eine Datei in `src/pages/`, je Sektion eine
   Komponente in `src/components/`. **Nur Tokens**, nie feste Pixel, nie Farbwerte.
5. **Prüfen** – `npm run check` muss grün sein. Dann Sichtprüfung bei 350/768/1440.
6. **STAND.md füllen** (Pflicht: Phase, Lücken-Inventar, Entscheidungen, Verlauf)
   und dem Nutzer berichten: Was ist Platzhalter, was fehlt vor dem Live-Gang.

---

## 9. Definition of Done

1. `npm run check` ist **grün** (baut selbst und prüft die fertige Seite).
2. `npm run dev` läuft fehlerfrei.
3. `npm run sicht` ist **grün** (echter Browser bei 350/768/1440 px: kein Überlauf,
   keine JS-Fehler, nichts kaputt) **und geprüft wurde mit eigenen Augen**:
   `pruefung/texte.md` gelesen (Rechtschreibung, Ansprache), die Bögen angesehen
   (Layout über alle Breiten), Verdachtsfälle im Einzel-Screenshot (Etappe 5).
3a. `npm run interaktion` ist **grün** – jedes Bedien-Element klickt wirklich.
3b. `npm run browser` ist **grün** – die Seite hält die Browser-Untergrenze
   (Abschnitt 4a). Dazu **einmal `npm run altgeraet` und die Bilder ansehen**:
   Erwartet wird „ärmer, aber lesbar und bedienbar" – alles andere ist ein Befund.
3c. **`npm run abgleich` ist grün** – das sechste Tor hält die gebaute Seite
   gegen die Design-Datei: Fehlt ein Block? Steht einer da, den es im Design
   nicht gibt? Stimmt die Reihenfolge? Ist ein dunkles Band hell geworden?
   Es braucht `design/<Projekt>.dc.html` und eine Zuordnung Seite→Adresse in
   `design/abgleich.json` (der erste Lauf legt einen Entwurf an).

   **Es ersetzt das Auge NICHT.** Gemessen am 29.07.2026: Von elf schweren
   Befunden eines Handabgleichs findet es die drei zuverlässig, die auf
   „Block fehlt / Block erfunden" hinauslaufen – also die teuerste Klasse.
   Feinheiten INNERHALB eines Blocks (Schriftgrößen, Radien, Abstände),
   Textinhalte und Klick-Zustände sieht es nicht. Deshalb gilt weiter:

3d. **Abgleich mit eigenen Augen.** Seite für Seite die Design-Datei neben die
   Umsetzung legen und Wert für Wert vergleichen: Ist jeder Block da? Steht er
   an der richtigen Stelle? Stimmen Grundfarbe, Abstände, Radien, Schriftgrößen?
   **Grüne Technikprüfungen sagen nichts über Design-Treue** – im Kundenprojekt
   waren alle Tore grün, während Bänder die falsche Farbe hatten und Abschnitte
   fehlten. Prüfe dabei BEIDE Richtungen: fehlt etwas aus dem Design, und steht
   auf der Seite etwas, das im Design gar nicht vorkommt?
4. Lighthouse-Ziel **≥ 95** in allen vier Kategorien.
5. **STAND.md ist aktuell** (Phase, Lücken, Verlaufszeile dieser Sitzung).
   Ein offener Punkt `- [ ]` sperrt den Live-Gang. Soll einer bewusst offen
   bleiben, gehört **`(kein Blocker)`** in die Zeile – dann wird daraus ein
   Hinweis. So steht die Entscheidung schriftlich in der Datei, statt dass
   jeder Klon sich eine eigene Handhabung ausdenkt.
6. Committen und pushen (ein Kunde = ein Repo/Branch).

> **Eine Ausnahme im Prüf-Tor, die einen Mangel des MOTORS deckt, ist keine
> Ausnahme, sondern ein unerledigter Fehler.** Wird der Motor selbst rot, gehört
> der Motor repariert – nicht die Prüfung. Die Fehlerseite kam lange ohne Kopf
> und Fuß; statt das zu beheben, stand im Prüf-Tor „außer 404.html", weil sonst
> jeder Build rot geworden wäre. Ergebnis: Jeder Klon lieferte eine Seite aus,
> auf der der Besucher weder zur Navigation zurückfand noch das Impressum sah –
> und eine 404 aus einem alten Google-Treffer ist oft der Erstkontakt.
>
> **Eine übersprungene Prüfung ist kein grünes Tor.** Meldet die Kette „↷
> übersprungen" (etwa die Typprüfung, weil ein Werkzeug fehlt), ist die
> Definition of Done **nicht** erfüllt – auch wenn unten ein Haken steht.
> Entweder das Fehlende nachinstallieren oder die Lücke ausdrücklich in
> STAND.md eintragen. Sonst verschwindet ein falsch geschriebener Config-Pfad
> lautlos: Die Stelle rendert leer, und niemand merkt es.

---

## 9a. Bilder

**Alle Bilder liegen in `fotos/`** – ein einziger Ordner im Projekt-Hauptordner.
Das ist bewusst der Ort, an dem auch der Nutzer selbst Fotos ablegt – ohne
technische Pfade kennen zu müssen.

- **Vor dem Port immer `ls fotos/`** – der Nutzer legt seine Fotos oft schon vorher
  ab. Die haben Vorrang vor allem anderen.
- Zuordnung selbst treffen (Dateiname + Bildinhalt), im Bericht nennen. Nicht fragen.
- Einbinden über `bild('name.jpg')` (`src/lib/bilder.ts`) + `<Image>` aus
  `astro:assets`. Nie ein rohes `<img src>` – dann fehlt die Optimierung.
- **Inhaltsbilder als `<Picture formats={['webp']} fallbackFormat="jpeg">`**,
  nicht als `<Image>`. Ohne Ersatzfassung zeigen Rechner mit älterem
  Betriebssystem **kein einziges Foto** – dort hängt WebP am System, nicht an
  der Browser-Version. Logos bleiben `<Image>` (klein, oft mit Transparenz;
  eine JPEG-Ersatzfassung füllt den freigestellten Hintergrund aus). Siehe
  Abschnitt 4a.
- Unterordner sind erlaubt: `bild('hero.jpg')` findet auch `fotos/galerie/hero.jpg`.
- **Jeder Platzhalter kommt ins Lücken-Inventar.**

**Binärdateien (Bilder, PDFs, Schriften) NIEMALS als Base64 durch den Chat-Kontext
tragen** — beim Abtippen gehen zuverlässig Bytes verloren, und die Datei sieht
trotzdem gültig aus (Header heil, Inhalt kaputt). Immer als Datei auf die Platte
holen und die Integrität prüfen (`npm run holen` macht beides in einem Schritt).
Im Piloten gingen so zwei Logo-Übertragungen kaputt; ein bei 256 KiB gekapptes PDF
verriet sich nur durch den fehlenden `%%EOF`-Schluss.

Die Referenzseite bindet bewusst ein Bild ein, damit die Pipeline bei jedem Build
durchlaufen wird – sonst bliebe ein kaputter Bildpfad still, bis er beim Kunden
auffällt. Das Prüf-Tor schlägt an, wenn in `fotos/` Bilder liegen, im Build aber
keines optimiert wurde.

---

## 10. Werkzeuge

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Vorschau lokal |
| `npm run check` | **Das Prüf-Tor** – baut und prüft den Standard |
| `npm run schrift -- --familie "<Name>"` | Google-Schrift lokal einbetten |
| `npm run icons` | Symbol-Bibliothek neu holen (liegt schon im Repo – nur bei Versionswechsel nötig) |
| `npm run karte -- --adresse "…"` | Statisches Kartenbild (statt Maps-Embed) |
| `npm run og -- --bild fotos/<hero>.jpg` | OG-Vorschaubild aus echtem Foto (beim Port Pflicht) |
| `npm run sicht` | **Sichtprüfung im echten Browser** – Screenshots + Überlauf-/Fehler-Messung + `pruefung/texte.md` + Bögen |
| `npm run interaktion` | **Bedien-Prüfung** – fährt jeden Verhaltens-Baustein real (350 + 1440 px) |
| `npm run browser` | **Browser-Prüfung** – hält den Build gegen `browser-untergrenze.json` (Abschnitt 4a) |
| `npm run abgleich` | **Design-Prüfung** – hält die gebaute Seite gegen die `.dc.html` (Abschnitt 9, Punkt 3c) |
| `npm run altgeraet` | Zeigt in Bildern, wie die Seite auf einem alten Browser **aussieht** |
| `npm run bogen -- --fotos` | Kontaktbögen aller Fotos (Sichtpflicht mit 1–2 Reads statt 20) |
| `npm run holen -- --url <…> --ziel <pfad>` | Download + Integritätsprüfung (nie Base64 durch den Chat!) |
| `npm run inhalte` | Gepflegte Inhalte und Bilder vom Redaktionsdienst holen (Abschnitt 6c) |
| `npm run maske` | Eingabemaske für den Betrieb aus der Feldliste erzeugen |
| `npm run preisliste` | Preislisten-JSON aus dem Design validieren → `daten/preisliste.ts` |
| `npm run demo -- --datei <archiv.zip> --kunde "…"` | Design-Projekt-Archiv (oder Standalone) als schickbare Verkaufs-Demo hosten (noindex, Kanbuk-Leiste, Handy-Hinweis, Sicht-Check) |
| `npm run sicht` | **Sichtprüfung im echten Browser** – Screenshots + Überlauf-/Fehler-Messung |
| `npm run platzhalter -- …` | Textlose Platzhalterbilder + OG + Favicon |
| `npm run stock -- --thema "…"` | Stock-Platzhalter (braucht `PEXELS_API_KEY`) |

**Stock-Bilder sind immer nur Platzhalter** – für Live-Seiten echte Kundenfotos.
