# Prüfplan: die große Motor-Prüfung

> **Wozu diese Datei:** Sie hält den Auftrag und die schon gesicherten Fakten
> fest, damit die Prüfung in einer frischen Sitzung **sofort losläuft** statt
> alles neu herzuleiten. Angelegt am 31.07.2026, als das Sitzungsbudget für die
> Durchführung nicht mehr reichte.
>
> **Nach der Prüfung: diese Datei löschen.** Die Ergebnisse gehören nach
> STAND.md, nicht hierher. Sonst ist sie in drei Monaten der nächste alte Rest.

---

## Der Maßstab

Nicht „ist alles perfekt", sondern:

> **Was davon müsste ein Chat bei einem echten Kunden selbst bauen oder selbst
> herausfinden?**

Alles, was diese Frage mit Ja beantwortet, ist ein Befund. Alles andere ist
Politur — wird benannt, aber nicht angefasst.

Hintergrund: Ein Klon bekommt **nie** Updates. Was beim Klonen fehlt, muss in
jedem Kundenordner einzeln nachgebaut werden.

---

## Die sechs Achsen

1. **Vollständigkeit** – Gibt es für jede wiederkehrende Aufgabe einen Baustein,
   oder muss ein Chat improvisieren?
2. **Auffindbarkeit** – Kennt das Rezept den Baustein? *Ein Baustein, den kein
   Rezept nennt, existiert praktisch nicht.*
3. **Richtigkeit** – Tut er, was er verspricht? Besonders: meldet eine Prüfung
   grün, wo sie nicht hingesehen hat?
4. **Ehrlichkeit der Zusagen** – Behauptet Doku oder Kommentar etwas, das der
   Code nicht tut?
5. **Live-Tauglichkeit** – Kommt eine Durchschnittsseite ohne Extra-Bau durch?
6. **Neutralität und Kundenfreiheit** – nichts Branchen-Spezifisches im Kern,
   keine echten Kundendaten.

**Dazu, ausdrücklich verlangt:**

7. **Over-Engineering** – Was ist gebaut und trägt sich nicht? Kandidaten unten.
8. **Alte Reste** – überholte Stände, toter Code, Erkenntnisse, die inzwischen
   falsch sind.

---

## Schon gemessen am 31.07.2026 (nicht neu erheben)

### Größenverhältnisse

| Teil | Umfang |
| --- | --- |
| `scripts/` (Prüfmaschinerie + Werkzeuge) | **8.057 Zeilen**, davon 1.706 Kommentar · 21 Dateien · 25 npm-Befehle |
| `src/lib/verhalten/` (die eigentliche Mechanik) | 1.894 Zeilen · 16 Bausteine |
| `content.config.ts` (die Schnittstelle) | 1.263 Zeilen |
| `src/components/` | 13 Komponenten |
| `redaktion/` | 437 Zeilen, **standardmäßig aus** |
| `CLAUDE.md` + `STAND.md` (Pflichtlektüre jedes Chats) | **1.981 Zeilen** |

> **Die auffälligste Zahl:** Die Prüf- und Werkzeugmaschinerie ist rund
> **2,5-mal so groß wie der Motor, den sie prüft.** Das ist nicht automatisch
> falsch – die Tore haben echte Fehler gefunden, die sonst beim Kunden gelandet
> wären. Es ist aber die erste Frage, die die Prüfung beantworten muss.

### Harte Befunde (schon belegt)

- **6 von 25 npm-Befehlen stehen in keiner einzigen `.md`:** `build`, `preview`,
  `deploy`, `astro`, `vorcheck`, **`maillogo`**. Bei `maillogo` ist das
  folgenreich: Es erzeugt das Logo der Bestätigungsmail und wird deshalb nie
  ausgeführt.
- **2 Komponenten werden von keiner Seite benutzt:** `Oeffnungsstatus.astro`,
  `Oeffnungszeiten.astro`. Sie sind als Bausteine für den Port gedacht – das ist
  legitim –, aber damit hat sie **kein Tor je ausgeführt**.
- **`CLAUDE.md:870` behauptet, der Live-Gang seien „die einzigen drei Dinge".**
  Der `/deploy`-Skill kennt mindestens acht. Ein Chat, der CLAUDE.md folgt,
  lässt fünf weg.
- **`/port`-Skill Zeile 404** nennt ein Werkzeug für den Design-Abgleich
  „vorgemerkt". Es existiert seit 29.07. als sechstes Tor.

### Over-Engineering – die Kandidaten

Zu prüfen, nicht vorverurteilt:

1. **Das Redaktionssystem.** 437 Zeilen plus Anteile in `scripts/`, standardmäßig
   aus, **noch nie gegen einen echten Dienst gelaufen**, und 10 der 33 offenen
   Punkte stecken darin. Frage: Trägt es seinen Wartungsaufwand, oder gehört es
   erst gebaut, wenn ein Kunde es wirklich bezahlt?
2. **Die Zahl der Werkzeuge.** 25 Befehle. Welche wurden je bei einem echten
   Kunden benutzt? Was nie lief, ist ungeprüfter Code mit Wartungslast.
3. **Der Katalog** (11 Dateien). Laut CLAUDE.md optional – ist er das wirklich,
   oder hängt der Kern daran?
4. **Die Pflichtlektüre.** ~2.000 Zeilen, die jeder Chat liest, bevor er
   irgendetwas tut. Das kostet bei jedem Kundenprojekt Geld und Zeit. Was davon
   ist Regel, was ist Anekdote, die einmal wichtig war?
5. **`src/lib/verhalten/`** – 16 Bausteine. Welche hat je ein Design verlangt?

### Was wirklich fehlt (schon bekannt, muss nicht gesucht werden)

**Motor-Lücken, Live-Weg:**
- `api/contact.ts`: fünf Abweisungspfade liefern ohne JavaScript eine rohe
  Datenzeile auf weißem Grund, ohne Weg zurück.
- Bestätigungsmail: an der Logo-Zelle fehlt die Schriftfarbe → bei blockiertem
  Bild steht der Betriebsname schwarz auf der Markenfarbe (Outlook).
- Bestätigungsmail: meldet `color-scheme: light dark`, liefert aber keine
  Dunkel-Stile.
- Bestätigungsmail: § 14 UGB verlangt fünf Angaben, ausgegeben werden vier.

**Rezept-Lücken:**
- Die Live-Liste steht in vier Dateien mit unterschiedlichem Inhalt.
- DNS-Export hängt als Unterpunkt an „gab es eine Vorgängerseite?" – gebraucht
  wird er bei **jedem** Domainwechsel.

**Kein Code, nur du:**
- Auftragsverarbeitung nach Art. 28 DSGVO (steht als Blocker in STAND.md).

---

## Reihenfolge

**Erst Theorie, dann Praxis** – in dieser Reihenfolge, aber **in getrennten
Sitzungen**:

1. **Sitzung A – die Prüfung.** Ergebnis: eine Befundliste in STAND.md, nach den
   acht Achsen sortiert, jeder Fund mit Datei und Zeile, jeder Fund
   gegengeprüft. **Noch nichts reparieren.**
2. **Sitzung B – reparieren**, was Sitzung A als „müsste ein Chat selbst bauen"
   eingestuft hat. Kleine Pakete, nach jedem Paket alle sechs Tore.
3. **Sitzung C – der nächste echte Relaunch**, im eigenen Klon. Jeder Motor-Fund
   dort geht als **Motor-Meldung** in dessen STAND.md, nicht in eine neue
   Template-Runde.

> **Warum getrennt:** Am 30.07. wurden 28 Dateien und 1.800 Zeilen an einem Tag
> geändert. Die beiden folgenden Prüfungen fanden fast nur Fehler, die genau
> dieses Paket erzeugt hatte. Große Pakete bringen ihre eigene Fehlerquote mit.

---

## Vorher: drei Entscheidungen, die nur der Inhaber treffen kann

Ohne sie prüft Sitzung A ins Blaue – bei Over-Engineering ist die Frage nicht
technisch, sondern geschäftlich.

1. **Bleibt das Redaktionssystem?** Es kostet Wartung, war nie an einem echten
   Dienst, und 10 der 33 offenen Punkte stecken darin. Drei mögliche Antworten:
   *bleibt und wird fertiggemacht* · *bleibt, wird aber eingefroren und erst bei
   einem zahlenden Kunden angefasst* · *fliegt raus*.
2. **Welche der 25 Werkzeuge wurden je an einem echten Kunden benutzt?** Was nie
   lief, ist ungeprüfter Code mit Wartungslast. Die Liste steht in
   `package.json → scripts`.
3. **Wie viel Pflichtlektüre ist gerechtfertigt?** ~2.000 Zeilen liest jeder
   Chat, bevor er irgendetwas tut – bei jedem Kundenprojekt, jedes Mal. Soll die
   Prüfung vorschlagen, was Regel bleibt und was in ein Archiv wandert?

## Was ohne Claude schon vorbereitet werden kann

Spart in Sitzung C (der nächste Relaunch) direkt Zeit:

- **Auftragsverarbeitungsvertrag nach Art. 28 DSGVO** besorgen (Anwalt, WKO).
  Steht als echter Blocker in STAND.md und betrifft **jeden** zahlenden Kunden,
  sobald Kanbuk den Versand-Schlüssel hält und deployt. Kein Code – nur der
  Inhaber kann das.
- **Design-Projekt vollständig ablegen:** `<Projekt>.dc.html` **und**
  `_ds_bundle.js` samt `tokens/*.css`. Wer nur eines von beidem hat, baut
  garantiert falsch (CLAUDE.md Abschnitt 4).
- **Fotos** in den Ordner `fotos/` legen – sie haben Vorrang vor allem anderen.
- **Von der bestehenden Website:** Adressliste der alten Seiten, dazu den
  Search-Console-Export (nicht nur die Sitemap – der Export zeigt, was Google
  wirklich ausliefert).
- **DNS-Zone beim Anbieter exportieren**, bevor irgendetwas umgestellt wird.
  Exportieren, nicht von außen abfragen: Im letzten Projekt zeigte die Abfrage
  sieben Einträge, der Export acht – der fehlende war der für das Mailprogramm.

## Das Abbruchkriterium

Nicht „Claude findet nichts mehr" – eine Prüfung ohne Auslöser findet **immer**
etwas, das ist eine Eigenschaft der Methode.

Sondern: **Ein Port erzeugt keine Motor-Meldung mehr.** Ablesbar in der STAND.md
des Kundenprojekts. Beim letzten echten Durchgang waren es 19.
