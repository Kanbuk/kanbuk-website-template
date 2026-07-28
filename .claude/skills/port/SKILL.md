---
name: port
description: >-
  Setzt ein Claude-Design-Projekt technisch als fertige Website um. Auslösen, sobald
  der Nutzer einen claude.ai/design-Link schickt oder sinngemäß sagt „bau das Design
  um / setz das um / port das". Liest das Design, entgiftet es (Schriften lokal,
  Maps-Rahmen raus), baut echte Unterseiten mit Meta-Tags, macht alles responsiv
  und meldet die offenen Lücken. Erfindet niemals Daten.
argument-hint: "[claude.ai/design-Link] [+ Betriebsdaten]"
---

# Port – Design → fertige Website

Du setzt ein fertiges Design technisch um. **Das Design ist die Wahrheit fürs Aussehen,
das Regelwerk (CLAUDE.md) ist die Wahrheit für die Technik.** Beides gilt gleichzeitig.

**Ziel:** Vorschau-Stand in ~30 Minuten. Sie ist die fertige Seite – nur ohne Zugänge
(E-Mail, Domain, echte Rechtstexte). Die kommen erst, wenn der Kunde bucht.

---

## Etappe -1: Eingangs-Check (die EINZIGE erlaubte Frage-Runde)

Prüfe, ob die Pflicht-Infos vorliegen. Fehlt etwas, frage es **EINMAL, gebündelt,
ganz am Anfang** – danach gilt Ein-Rutsch ohne jede Unterbrechung:

1. **Claude-Design-Link** (ohne ihn geht nichts)
2. **Kundenname** (für `package.json`, Berichte, STAND.md)
3. **Betriebsdaten**, soweit nicht im Design: Adresse, Telefon, E-Mail, Öffnungszeiten
4. **Gab es eine alte Website?** (deren Adressen → Weiterleitungen, Abschnitt 7b)
5. **Gewünschte Zusätze:** Pixel/Tracking? Bediente Karte? (Standard: nein → cookiefrei)

Was danach immer noch fehlt, wird NICHT nachgefragt, sondern improvisiert oder als
klar markierter Platzhalter gesetzt und in STAND.md eingetragen.

---

## Die wichtigste Regel: EIN RUTSCH

**Bau von Anfang bis Ende durch, ohne zwischendurch zu fragen.** Ein Prompt, ein
Design-Link → am Ende eine fertige Seite. Keine Zwischenfragen zu Design, Layout,
Farben, Struktur oder Vorgehen. Keine „Passt das? Weiter?"-Punkte. Keine
Zwischenstände zum Abnicken.

**Deckt der Motor etwas nicht ab: improvisiere.** Du entscheidest selbst und baust es.
Danach steht die Entscheidung im Abschlussbericht – falsch entschieden ist besser als
nicht entschieden, weil eine Änderung zwei Minuten dauert und eine Rückfrage den
ganzen Ablauf blockiert.

**Fragen darfst du nur**, wenn du es selbst unmöglich entscheiden kannst und die
Entscheidung nicht nachträglich änderbar ist. Typisch: eine Rechtsangabe fehlt (die
darfst du **nie** erfinden) oder der Kunde muss zwischen zwei echten Optionen wählen.
Bei Rechtsangaben gilt aber: **nicht fragen, sondern klar markierten Platzhalter
setzen** (`PLATZHALTER: UID`) und in den Bericht schreiben. Das Prüf-Tor blockt sie
später beim Live-Gang.

Improvisier-Beispiele – so wird entschieden, nicht gefragt:
- Design zeigt einen Blocktyp, den es so nicht gibt → mit vorhandenen Bausteinen und
  Tokens nachbauen.
- Handy-Umbruch unklar → Standardregel anwenden (Abschnitt „Etappe 4").
- Foto fehlt → Stock-Platzhalter, ab in den Bericht.
- Text unvollständig → weglassen statt erfinden, ab in den Bericht.
- Zwei Design-Seiten wirken zu dünn → zusammenlegen, im Bericht begründen.

---

## Etappe 0 – Vorbereitung

1. `npm install`, falls `node_modules` fehlt.

(Die Umbenennung von `package.json → name` passiert bewusst erst am ENDE von
Etappe 3 – sie schaltet das Prüf-Tor scharf, und das ist erst sinnvoll, wenn
die Referenzdaten aus der Config raus sind. Vorher wäre Rot kein Signal.)

---

## Etappe 1 – Inventar (erst lesen, dann bauen)

> ### Schritt 0: Bauanleitung sichern – **vor allem anderen**
>
> Ein Design-Projekt liefert **zwei** Dateien, und beide sind verbindlich
> (CLAUDE.md Abschnitt 4):
>
> | Datei | sagt dir |
> | --- | --- |
> | `<Projekt>.dc.html` | **welche Bauteile wo stehen** – Seiten, Blöcke, Reihenfolge, Abstände, Texte, Grundfarben |
> | `_ds_bundle.js` + `tokens/*.css` | **wie ein Bauteil aussieht** – je Komponente das exakte Style-Objekt |
>
> **Beide lokal ablegen** (z. B. unter `design/`). Aus dem Bundle die
> Style-Objekte **jeder verwendeten** Komponente herausziehen und als Merkzettel
> speichern. **Erst danach anfangen zu bauen.**
>
> **Warum das ganz vorne steht:** In einem Kundenprojekt wurde das Design-System
> sauber ausgelesen und die Sache damit für erledigt gehalten – die `.dc.html`
> nur überflogen. Ergebnis: richtige Bauteile in falscher Anordnung. Der
> Auftraggeber musste dreimal darauf hinweisen. Die Tücke: **Eine Seite aus
> lauter korrekten Komponenten wirkt fertig.** Erst wer sie neben die
> Design-Datei hält, sieht, dass es eine andere Seite ist.

Design-Projekt mit **DesignSync** auslesen: `get_project` → `list_files` → `get_file`
für die Hauptdatei (`*.dc.html`). Bei großen Dateien gezielt analysieren statt alles
in den Kontext zu laden.

**Notiere:**
- **Seiten:** Oft sind es Klick-Zustände (`goTo('speisekarte')`, `state.page`), keine
  echten Routen. Liste alle → daraus werden echte Unterseiten.
- **Design-Tokens:** Farben (Hex), Schriften (Familien + Schnitte), Radius.
- **Externe Ressourcen:** CDN-Schriften, Maps-Rahmen, Fremdbilder → Entgiftungsliste.
- **Verhalten:** Tabs? Filter? Slider? Sprachumschalter? Vergleich? Anfrage-Fenster?
  Vormerken/Favoriten? → Bausteine anschließen, **nie neu bauen** (CLAUDE.md Abschnitt 5).
- **Katalog?** Zeigt das Design eine Liste gleichartiger Dinge, die man einzeln
  ansieht (Fahrzeuge, Objekte, Maschinen, Kurse, Zimmer)? Dann gehört das in
  `katalog` – nicht in die Preisliste. Der Motor baut daraus die Übersicht **und
  je Eintrag eine eigene Seite** (CLAUDE.md Abschnitt 6a). Notiere: nach welchen
  Merkmalen wird gefiltert, was steht in der Merkmalstabelle, gibt es mehrere Fotos
  je Eintrag.
- **Langes Formular?** Ab etwa acht Feldern `formulare[].schritte` setzen und die
  Felder auf Schritte verteilen – der Motor macht daraus einen Assistenten mit
  Fortschritt. Persönliche Daten gehören in den letzten Schritt.
- **Verkauf/Buchung?** Wird über die Seite verbindlich bestellt oder gebucht,
  braucht es AGB (`rechtstexte.agb`, CLAUDE.md Abschnitt 6b). **Text nie selbst
  schreiben** – Platzhalter setzen und ins Lücken-Inventar.
- **Daten:** Speisekarte/Preisliste (oft eigene Datei wie `data/menu.js`), Allergene,
  Öffnungszeiten, Adresse, Telefon, E-Mail.
- **Alte Adressen – mit Verfahren, nicht aus dem Gedächtnis.** Gab es eine
  Vorgänger-Website? Dann deren **`sitemap.xml`** holen (auch `/wp-sitemap.xml`,
  `/sitemap_index.xml`, notfalls das Web-Archiv) und **jede** alte Adresse einer
  neuen zuordnen. Ohne Entsprechung führt sie auf die nächstliegende Übersicht –
  **nie auf eine Fehlerseite**. Ergebnis nach `weiterleitungen` (CLAUDE.md 7b).
  **Warum als Pflichtschritt:** Das Prüf-Tor kann eine VERGESSENE Adresse
  prinzipiell nicht sehen – es prüft nur, ob eingetragene Ziele existieren. Im
  Kundenprojekt wurde die alte Sitemap erst am letzten Abend gelesen; fünf von
  dreizehn Adressen hatten sich geändert, darunter alle Detailseiten. Der
  Schaden – über Nacht verlorene Google-Treffer – trifft ausgerechnet die
  Kunden mit der längsten Historie und fällt erst Wochen später auf.
- **Lücken:** Platzhalterbilder? Fehlende Preise? Fehlende Rechtsdaten?

**Nichts erfinden.** Was nicht im Design oder in den Unterlagen steht, fehlt – und
kommt ins Lücken-Inventar.

---

## Etappe 2 – Entgiften & Assets

- **Bildzeichen:** **NIEMALS selbst zeichnen.** Lucide liegt vollständig im
  Motor (2007 Symbole) – jedes Zeichen, das das Design per Name einbindet,
  ist unter diesem Namen da: `<Symbol name="car-front" />`. Der `<script
  src="…lucide…">` aus dem Design fliegt ersatzlos raus.
  Fehlt ein Symbol wirklich, ist das eine **Motor-Meldung** – kein Anlass, den
  Stift zu nehmen. Nennt das Design eine andere Bibliothek:
  `npm run icons -- --set heroicons --namen "…"`.
  **Warum das hier so deutlich steht:** In einem Kundenprojekt wurden die
  Symbole mangels Alternative nachgezeichnet. Danach sah jedes Zeichen der
  Seite anders aus als im Design – und die ganze Seite wirkte fremd.
- **Schriften:** je Familie `npm run schrift -- --familie "<Name>" --schnitte <…>`.
  Danach in `content.config.ts → design.schriften` eintragen. Nie eine CDN-Schrift
  verlinken.
- **Karte:** `npm run karte -- --adresse "<echte Adresse>" --primaer "<Akzentfarbe>"`.
  Der Maps-Rahmen fliegt raus – Bild + Link zu Google Maps. Der Hinweis
  „Kartendaten © OpenStreetMap-Mitwirkende" gehört sichtbar daneben (Lizenzpflicht).
- **Bilder** – alle liegen in **`fotos/`** (ein einziger Ordner, auch für den Nutzer).

  **Zuerst nachsehen, was schon da ist:** `ls fotos/`. Der Nutzer legt seine Fotos
  dort ab – oft schon vor dem Port. Diese haben **immer Vorrang**.

  Reihenfolge der Beschaffung:
  1. **Was in `fotos/` liegt** – vom Nutzer abgelegt.
  2. **Aus dem Design-Projekt** – dort liegen meist die Uploads des Kunden
     (`uploads/…`, `assets/photos/…`). Mit DesignSync auflisten und holen.
  3. **Von der bestehenden Website des Betriebs** – mit `npm run holen -- --url <…>
     --ziel fotos/<name>.jpg` (lädt UND prüft die Datei). Die Rechte liegen beim
     Betrieb, für seine eigene Demo in Ordnung; vor dem Live-Gang bestätigen lassen.
  4. `npm run stock -- --thema "<passend>"` – **nur Platzhalter**, muss ins
     Lücken-Inventar.
  5. `npm run platzhalter -- …` als letzte Wahl.

  **Verbindliche Transfer-Regeln (im Piloten gingen so 2 Logos und 1 PDF kaputt):**
  - **Binärdaten NIEMALS als Base64 durch den Chat tragen** – beim Abtippen gehen
    zuverlässig Bytes verloren, und die Datei sieht trotzdem gültig aus (Header
    heil, Inhalt kaputt).
  - DesignSync-Ergebnisse landen als „persisted output"-Dateien auf der Platte –
    von DORT per kleinem Skript dekodieren, nie aus dem Chatfenster.
  - **Jede geholte Datei sofort prüfen:** `npm run holen` macht das automatisch
    (volle Bild-Dekodierung, PDF-`%%EOF`, keine HTML-Fehlerseite). Händisch geholte
    Dateien nachprüfen.
  - `get_file` kappt bei 256 KiB – gekappte Dateien am Original der bestehenden
    Kundenwebsite per `npm run holen` neu ziehen.

  **Foto-Sichtpflicht: Dateinamen können lügen.** Vor der Zuordnung
  `npm run bogen -- --fotos` laufen lassen und die Kontaktbögen ANSEHEN – jedes
  Kundenfoto wird mit eigenen Augen geprüft, bevor es einem Platz zugeordnet wird.
  (Im Piloten waren 2 von 19 Fotos vertauscht; ohne Sichtung wäre das online
  gegangen.) Zuordnung dann selbst entscheiden und im Bericht nennen – nicht fragen.

  Einbinden ausschließlich über `astro:assets` und `bild('name.jpg')` aus
  `src/lib/bilder.ts` – nie als rohes `<img src>`. Unterordner in `fotos/` sind
  erlaubt; `bild()` findet die Datei auch dort.

  **Jedes Platzhalter-Bild kommt ins Lücken-Inventar** – der Nutzer muss am Ende
  genau wissen, welche Bilder vor dem Live-Gang echt werden müssen.

- **OG-Bild + Favicon (Pflicht, wird sonst vergessen):** `public/og.jpg`,
  `public/favicon.svg` und `public/apple-touch-icon.png` gehören zum Template-Muster
  und MÜSSEN beim Port ersetzt werden – sonst zeigt WhatsApp beim Verschicken der
  Demo das Musterbild. Der einfache Weg: `npm run og -- --bild fotos/<hero>.jpg`
  (schneidet das Foto auf 1200×630 zu). Ohne brauchbares Foto:
  `npm run platzhalter -- --name "<Kunde>" --claim "<Claim>" --primaer '<#…>'
  --sekundaer '<#…>' --hintergrund '<#…>' --force` (erzeugt OG + Favicon + Icon
  aus den Design-Farben).

---

## Etappe 3 – Config füllen

`content.config.ts`: Betriebsdaten, Design-Tokens, **Seiten samt eigener Meta-Angaben**,
Formulare, Preisliste, Rechtstexte, **`weiterleitungen`** (alte Adressen der
Vorgänger-Website – „wird gern vergessen", CLAUDE.md 7b), **`dienste`** (nur wenn im
Eingangs-Check Pixel/Tracking gewünscht wurde – Banner, Parken und Datenschutz-Absatz
entstehen dann automatisch, CLAUDE.md 7a), `branche`, `ansprache`, `sprachen`,
`domain`, `mode: 'demo'`.

- **Meta je Seite** ist Pflicht: eigener Titel und eigene Description (120–160 Zeichen).
  Nichts doppeln – das Prüf-Tor lässt gleiche Titel/Descriptions nicht durch.
- **Öffnungszeiten** zusätzlich maschinenlesbar (`tageISO`, `vonISO`, `bisISO`) – sonst
  fehlen sie im JSON-LD.
- **Allergene** bei Gastro nicht vergessen (österreichische Pflicht).
- **Große Preislisten** nach `daten/preisliste.ts` auslagern und importieren.
- Fehlende Rechtsdaten als **klar markierte Platzhalter** (`PLATZHALTER: UID`) – das
  Prüf-Tor blockt sie beim Umschalten auf `live`.

**Als LETZTER Schritt dieser Etappe:** `package.json → name` auf `kanbuk-<kunde>`
setzen. Das schaltet das Prüf-Tor scharf – ab jetzt sind Referenz-Reste in der
Config ein echter Fehler, kein Rauschen.

---

## Etappe 4 – Seiten bauen (die eigentliche Arbeit)

Je Unterseite eine Datei in `src/pages/`, je Sektion eine Komponente in
`src/components/`. Die Referenz in `src/pages/index.astro` zeigt die Bauweise – sie
wird dabei ersetzt.

> ### Die Design-Datei gewinnt
>
> **Wo die `.dc.html` einen Wert nennt, wird dieser übernommen.** Die
> Token-Skala greift nur, wo sie schweigt – und dort, wo etwas sonst am Handy
> überliefe (Seitenrand, Sektionshöhe, Spaltenzahl).
>
> Hier stand früher „Jeder Pixelwert wird zum Token". Genau dieser Satz war im
> Kundenprojekt die Ursache des größten Fehlschlags: Er liest sich wie „übersetze
> frei in die Motor-Skala". Herausgekommen ist eine Seite mit richtigen Bauteilen
> in falscher Anordnung.
>
> Konkret heißt das:
> - **Block für Block** aus der `.dc.html` abarbeiten. Kein Block wird
>   zusammengefasst, umsortiert, weggelassen oder **ergänzt** – auch kein
>   „sinnvoller" zusätzlicher.
> - Inline-Stile **Wert für Wert** übernehmen: Innenabstände, Höhen,
>   Schriftgrößen, Radien, Zeilenhöhen, Sperrungen, Farben, Verläufe, Deckkraft.
> - Bringt das Design eigene `clamp()` mit, werden **die** übernommen.
> - Für jede Komponente die Definition im `_ds_bundle.js` lesen – **nicht** vom
>   Bildschirmfoto ableiten.
> - **Jede Abweichung beim Entstehen notieren und begründen.** Sie gehört in den
>   Abschlussbericht. Zwei Abweichungen sind sogar Pflicht und brauchen keine
>   Diskussion: Schrift unter 12 px und zu geringer Kontrast – da schlägt der
>   Motor das Design (CLAUDE.md Abschnitt 4).

**Beim Übertragen gilt außerdem:**
- Wo das Design schweigt: Token statt fester Pixel (**Umrechnungstabelle in
  CLAUDE.md Abschnitt 4**).
- Jede Farbe wird zu `var(--farbe-…)`. Nie ein Hex-Wert im Markup.
- Inline-Styles aus dem Design → Astro-`<style>`-Block. (Inline-Styles können keine
  Media-Queries – sie zu übernehmen macht Responsiveness unmöglich.)
- **Die Handy-Ansicht ist deine Entscheidung** – im Design gibt es sie nicht.
  Zweispalter → einspaltig, Vierer-Grid → zwei → eins, Bild neben Text → Bild über Text.
- Verhalten über die Bausteine anschließen (`data-tabs`, `data-slider`, …).
- Formulare über `<Formular id="…" />` – nie von Hand nachbauen.
- Social-Media-Icons über `<SocialLinks />` (Daten in `betrieb.socialLinks`) –
  keine Icon-Dateien erfinden, keine Icons aus dem Design-Export kopieren.
  Zeigt das Design Icon-Kreise o. Ä., den Baustein per `:global(.social-links…)`
  in diese Optik kleiden – nie Buchstaben („IG") als Icon-Ersatz stehen lassen.
- **`vorschauDomain` in der Config setzen**, sobald die Vorschau-Adresse
  feststeht (z. B. `https://<kunde>.kanbuk.com`). Ohne sie holt WhatsApp das
  Vorschaubild von der künftigen Kundendomain, die es noch gar nicht gibt – der
  Lead sieht beim Verschicken eine graue Zeile ohne Foto. Das Prüf-Tor meldet
  es, wenn Bild und Seite auf verschiedenen Servern liegen.
- **PDFs werden GEÖFFNET, nicht heruntergeladen.** Speisekarte, Preisliste,
  Kursplan: Der Gast will kurz hineinschauen, nicht eine Datei sammeln. Also
  `<a href="/karte.pdf" target="_blank" rel="noopener">Karte als PDF öffnen</a>`
  – **kein** `download`-Attribut, und im Text „öffnen"/„ansehen" statt
  „herunterladen". Ein `download` gehört nur an Dateien, die man wirklich
  behalten will (ausfüllbares Formular, Angebot). Das Prüf-Tor meldet jeden
  PDF-Link, dessen Text etwas anderes verspricht als er tut. Bei großen Dateien
  die Größe danebenschreiben („PDF, 2 MB") – am Handy zählt das.
- **Kopf und Fuß kommen aus dem Motor:** `<Kopf aktuell={pfad} />` und `<Fuss />`
  (src/components/). Sie bringen Handy-Navigation, Rechtslinks, Social-Icons und
  Signatur fertig mit – das Design malt sie per `:global(.kopf…)` / `:global(.fuss…)`
  an. Nur wenn das Design eine grundlegend andere Leiste verlangt, wird sie eigen
  gebaut; dann aber Rechtslinks und Signatur NICHT vergessen (das Prüf-Tor blockt).
  Eigene Inhalte in der Fußzeile (Adresse, Öffnungszeiten, Spalten) kommen als
  Kindelemente in `<Fuss>…</Fuss>`.
- **`zeigtPreisliste: true`** bei der Seite setzen, auf der die Karte steht – sonst
  landen die strukturierten Speisekarten-Daten auf der Startseite statt dort.
- **`karteEingebettet: true`** setzen, wenn eine 2-Klick-Karte eingebaut wird. Dann
  beschreibt die Datenschutzerklärung die Google-Übermittlung; ohne das Feld
  behauptet sie, es werde keine Karte eingebettet.
- **Die Fußzeile bekommt `<Signatur />`** (dezenter Kanbuk-Backlink, neben © und
  Rechtslinks). Das ist Geschäftsmodell, keine Deko – das Prüf-Tor blockt bei
  `--live` jede Seite ohne Signatur. Den Ankertext wählt der Baustein selbst
  (markenbasierte Rotation, stabil je Kunde) – `text="…"` nur setzen, wenn es
  einen Grund gibt, und dann IMMER mit „Kanbuk" im Text (das Tor prüft Anker,
  rel und Money-Keywords).
- **Rechtsseiten sind kein Sonderbereich:** Sobald Kopf- und Fußzeile des Kunden
  gebaut sind, beide in `src/layouts/RechtsLayout.astro` einbinden (Kopf + Fuss
  um den Textblock, Zurück-Link und Mini-Footer entfernen). Impressum und
  Datenschutz müssen aussehen wie jede andere Unterseite der Website.
- **Zweisprachiges Design?** So geht es (seit 2026-07-27 durchgetestet):
  1. Je Seite eine Datei unter `src/pages/en/…` anlegen.
  2. Darin `<BaseLayout pfad="/kontakt" sprache="en" titel="Contact" beschreibung="…">`
     – `pfad` bleibt der DEUTSCHE Pfad (daraus entstehen Adresse und
     Sprachverweise automatisch), `sprache="en"` setzt Sprachauszeichnung,
     Adresse und Teilen-Angaben richtig. **`titel` und `beschreibung` immer
     mitgeben** – ohne sie erbt die englische Seite die deutschen Meta-Texte
     und ist für Google eine Dublette.
  3. Erst danach `sprachen: ['de','en']` setzen.
  Niemals `'en'` setzen, ohne die Seiten zu bauen – das Prüf-Tor blockt
  Sprachverweise ins Leere. Für eine Demo reicht `['de']`; die zweite Sprache
  kommt dann als offener Punkt in STAND.md.

---

> **Inhaltsbilder mit `<Picture formats={['webp']} fallbackFormat="jpeg">`**,
> nicht mit `<Image>` – sonst sehen Rechner mit älterem Betriebssystem kein
> einziges Foto (CLAUDE.md Abschnitt 4a). Logos bleiben `<Image>`.

## Etappe 5 – Die Launch-Prüfung (sechs Stufen, alle Pflicht)

**Stufe 5 ist `npm run browser`** – sie hält den Build gegen die
Browser-Untergrenze (CLAUDE.md Abschnitt 4a). Sie kam dazu, weil eine
abgenommene Seite auf einem älteren Gerät unbenutzbar war, während alle vier
anderen Stufen grün waren: Die fahren alle dasselbe aktuelle Chromium.

Dazu einmal **`npm run altgeraet`** und die Bilder **ansehen**. Das Tor sagt,
WAS fehlt – nicht, wie schlimm es aussieht. Erwartet wird „ärmer, aber lesbar
und bedienbar"; alles andere ist ein Befund.

Beim Bauen der Seiten deshalb von Anfang an:
`<Picture formats={['webp']} fallbackFormat="jpeg">` statt `<Image>` für
Inhaltsbilder, kein Zerlegen in Klammern in Browser-Code, Ersatzwert vor jedem
modernen CSS-Merkmal.

> ### Stufe 6: Abgleich mit der Vorlage – **von Hand, und ohne Abkürzung**
>
> **Grüne Technikprüfungen sagen nichts über Design-Treue.** Im Kundenprojekt
> waren alle Tore grün, während ein Abschlussband die falsche Grundfarbe hatte,
> Bedienelemente an der falschen Stelle standen, Abschnitte fehlten und andere
> erfunden waren.
>
> Also: Seite für Seite die `.dc.html` neben die Umsetzung legen und **beide
> Richtungen** prüfen.
>
> 1. **Ist jeder Block des Designs da?** In der richtigen Reihenfolge, mit der
>    richtigen Grundfarbe, den richtigen Abständen, Radien, Schriftgrößen?
> 2. **Steht auf der Seite etwas, das im Design nicht vorkommt?** Das ist der
>    Fehler, den man selbst am schwersten sieht – eigene Ergänzungen wirken
>    „sinnvoll". Dazu zählen auch Bedienelemente, die der MOTOR erzeugt hat:
>    Filtergruppen und Regler entstehen automatisch aus den Daten und entsprechen
>    nicht zwangsläufig dem Design (CLAUDE.md Abschnitt 6a).
> 3. **Jede verbleibende Abweichung** steht mit Grund im Bericht.
>
> Diese Stufe ist heute Handarbeit. Ein Werkzeug dafür ist vorgemerkt
> (STAND.md) – bis es da ist, ersetzt nichts das Nebeneinanderlegen.



**Vorbedingung:** `package.json → name` ist nicht mehr `kanbuk-website-template`
– sonst prüft das Tor im Template-Modus und Referenz-Reste rutschen durch. Auf
welchen Namen er wechselt, sagt die Namenstabelle im `/deploy`-Skill.

**1. `npm run check` muss grün sein.** Vorprüfung in Sekunden (Pflichtfelder,
referenzierte Dateien existieren, Binär-Integrität aller Bilder/PDFs), dann Build
und die volle Prüfung der fertigen Seite: externe Requests, Meta je Seite,
Alt-Texte, feste Breiten, JSON-LD, Bildgewicht, Lesbarkeits-Kontrast, Header,
mode-Konsistenz, Referenz-Reste.

**2. `npm run sicht` muss grün sein.** Öffnet jede Seite im echten Browser bei
350/768/1440 px und misst: horizontaler Überlauf (nennt die schuldigen Elemente),
JS-Fehler, kaputte Ressourcen. Erzeugt dabei nach `pruefung/`: die Screenshots,
die **Screen-Bögen** (alle Breiten einer Seite nebeneinander) und den **Text-Dump
`texte.md`** (aller sichtbarer Text inkl. zugeklappter Tabs/Akkordeons, plus Titel
und Descriptions). (Erster Lauf auf einem Rechner lädt einmalig den Prüf-Browser.)

**3. `npm run interaktion` muss grün sein.** Fährt jeden Verhaltens-Baustein der
Seite real im Browser (Tabs umschalten, Filter klicken, Mobilmenü öffnen/Escape,
Akkordeon, Lightbox, Slider, Vergleich, Formular-Hinweis im demo-Modus) – bei
350 px und 1440 px. Was klickbar ist, muss klicken.

**4. Mit eigenen Augen und Verstand prüfen – Arbeitsteilung:**
- **Text** (Rechtschreibung, ß, österreichisches Deutsch, Ansprache konsistent,
  Tippfehler): über `pruefung/texte.md` lesen – Text statt Pixel, das prüft auch
  Inhalte, die Screenshots nie zeigen (zugeklappte Panels).
- **Layout** (Überlappungen, kaputte Abstände, springende Grids, Design-Treue zum
  Claude Design): über die **Bögen** (`pruefung/bogen-screens-*.png`) – alle
  Breiten nebeneinander, 1 Read je Seite statt 3.
- **Text in Bildern** (Logos, Fotos mit Schrift) und jeder Verdachtsfall aus den
  Bögen: den betreffenden **Einzel-Screenshot** in voller Größe ansehen.
- **Vollständigkeit:** fehlt sichtbar etwas (leere Sektionen, Platzhalter-Reste)?

Jeder Fund wird behoben und die betroffene Stufe wiederholt, bis alles sauber
ist. Erst dann gilt die Seite als launch-fertig.

---

## Zeit messen (Pflicht bei jedem Port)

Ohne festen Start- und Schlussstrich sind zwei Ports nicht vergleichbar, und
jede Ausbau-Entscheidung am Motor ist geraten. Deshalb bei JEDEM Port:

| | |
| --- | --- |
| **Start** | Sekunde, in der der Port-Prompt abgeschickt wurde |
| **Ende** | `npm run check`, `npm run sicht` und `npm run interaktion` sind grün **und** STAND.md ist gefüllt |
| **Nachbesserungsrunden** | Wie oft musste der Nutzer nachbessern lassen, nachdem du „fertig" gemeldet hattest? |
| **Wo die Zeit hinging** | Grobe Aufteilung: Inventar / Assets / Config / Seiten bauen / Prüfen |

Die vier Werte gehören in den Abschlussbericht **und** in die Verlaufszeile in
STAND.md. Nicht schätzen – tatsächliche Uhrzeiten nennen. Wenn du die Startzeit
nicht kennst, frag sie einmal ab; das ist die Ausnahme vom Ein-Rutsch-Grundsatz.

**Zielwert: 30–40 Minuten.** Liegt der Wert deutlich darüber, gehört in die
Motor-Meldung, WO die Zeit hingegangen ist – das ist die einzige belastbare
Grundlage dafür, was als Nächstes in den Motor gebaut wird.

---

## Etappe 6 – STAND.md + Bericht

**Zuerst STAND.md ausfüllen (Pflicht):** Kunde, Phase („Portiert (Vorschau)"),
Design-Link, komplettes Lücken-Inventar als `- [ ]`-Punkte (jedes Platzhalter-Bild
mit Dateinamen, fehlende Rechtsdaten, fehlende Texte), getroffene Entscheidungen,
Verlaufszeile. Diese Datei ist das Gedächtnis des Projekts – der nächste Chat
(z. B. bei Buchung, Wochen später) kennt NUR sie. `npm run check -- --live`
blockiert den Live-Gang, solange dort offene Punkte stehen.

Dann der Bericht an den Nutzer, kurz und ehrlich:
- **Vorschau-URL** (lokal), was gebaut wurde (Seiten, Sprachen, Funktionen)
- **Design-Abweichungen:** wo du am Handy anders entschieden hast als das Desktop-Design
- **Lücken-Inventar:** Welche Bilder sind Platzhalter? Welche Daten fehlen? Was muss vor
  dem Live-Gang zwingend echt sein (Rechtstexte!)?
- Angebot: `/deploy` für die Vorschau-Domain.

---

## Bei Buchung (Stufe 3)

Zuerst STAND.md lesen – dort steht, was offen ist. Dann nur noch drei Dinge,
kein Basteln an Technik:
1. `mode: 'live'` setzen und neu bauen (`vercel.json` entsteht
   automatisch richtig – nichts von Hand ändern)
2. Echte **Rechtstexte** (UID, Firmenbuch – Impressumspflicht) + alle offenen
   Punkte aus STAND.md abarbeiten und abhaken
3. `RESEND_API_KEY` + `CONTACT_FROM` setzen, Domain verbinden

Dann `npm run check -- --live` (blockt bei offenen STAND.md-Punkten) und
`npx vercel --prod`. STAND.md-Phase auf „Live" stellen.

---

## Grenzen

Keine neuen npm-Pakete ohne Rückfrage. Keine Tracking-Skripte **direkt im Markup**
und keine festen `<iframe>` – wünscht der Kunde Pixel oder bediente Karte, geht das
ausschließlich über die Anschlüsse des Motors (`dienste` bzw. `<Einbettung>`,
CLAUDE.md 7a). Ohne diesen Wunsch bleibt die Seite cookiefrei und banner-frei.
Alle Regeln in CLAUDE.md gelten – das Prüf-Tor setzt sie durch.
