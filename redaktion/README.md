# Redaktion – der Betrieb pflegt seine Inhalte selbst

Dieser Ordner ist der **Anschluss für ein Redaktionssystem**. Er ist im
Normalfall **aus**: Ohne `dienst.json` passiert nichts, und die Inhalte stehen
wie immer in `content.config.ts`.

Gebraucht wird er, sobald ein Betrieb Bestand hat, der sich wöchentlich ändert –
Fahrzeuge, Immobilien, Maschinen, Kurse, Zimmer – und die Frage kommt: *„Kann
ich das selbst pflegen?"*

---

## Der Grundsatz

> **Der Dienst schreibt Dateien, der Motor baut aus Dateien.**

Beim Bauen der Website wird **nichts** abgefragt. `npm run inhalte` läuft
getrennt davon und legt zwei Dinge ins Projekt:

```
daten/inhalte.json     die Texte und Daten
fotos/inhalte/         die Bilder
```

Beides wird eingecheckt. Der Rest der Website liest nur noch diese Dateien.

**Warum das so gebaut ist** – drei Zusagen, die anders nicht haltbar wären:

1. **Ein Ausfall des Dienstes kann keine Veröffentlichung aufhalten.** Auch
   keine, die mit den Inhalten nichts zu tun hat: eine Textkorrektur, ein
   Rechtstext. Fragt der Build selbst ab, legt eine einzige 403-Antwort des
   Bildservers alles lahm.
2. **Ein gekündigtes Konto nimmt der Website nichts weg.** Texte *und* Fotos
   liegen im Projekt.
3. **Jeder Stand ist nachvollziehbar**, weil er als Änderung im Projekt steht.
   Man sieht, was sich wann geändert hat, und kann zurück.

---

## Drei Sicherungen

| Sicherung | Was sie verhindert |
| --- | --- |
| **Ohne Zugang passiert nichts.** | Ein Lauf ohne Zugangsdaten löscht nichts, sondern meldet es und hört auf. |
| **Eine leere Antwort überschreibt nie.** | Ein Aussetzer beim Dienst würde sonst den gesamten Bestand löschen – die Seite stünde leer da, und es sähe nach Absicht aus. |
| **Ein fehlerhafter Eintrag fällt raus, nicht die ganze Liste.** | Ein Eintrag ohne Kennung oder ohne Titel würde die Seite kaputtbauen. Er wird übersprungen und gemeldet; die übrigen bleiben online. |

Dazu: Es wird **JSON geschrieben, kein Code.** Ein Generator, der TypeScript
zusammensetzt, kann bei einer unerwarteten Eingabe ungültigen Code erzeugen –
und dann sprengt ein Laie mit „Veröffentlichen" den Build, ohne es je zu
erfahren.

---

## Die eine Feldliste

`felder.mjs` ist die **einzige** Stelle, an der steht, was der Betrieb pflegen
darf. Daraus entsteht

- die **Eingabemaske** (`npm run maske` → `maske.js`)
- die **Abfrage** (`npm run inhalte`)
- und gelesen wird ohnehin alles, was ankommt (`src/lib/inhalte.ts` überlagert
  Feld für Feld, ohne eigene Liste).

Auseinanderlaufen können sie damit nicht. **Ein Feld ergänzen:** in `felder.mjs`
eintragen → `npm run maske` → im Studio veröffentlichen. Fertig.

Das Prüf-Tor kontrolliert, dass jedes angebotene Feld im Motor wirklich
existiert, und dass die Maske zur Feldliste passt.

### Zu jedem Fotofeld gehört ein Feld für die Bildbeschreibungen

```js
{ pfad: 'bilder',  titel: 'Fotos', typ: 'bilder', beschreibungsfeld: 'bildAlt' },
{ pfad: 'bildAlt', titel: 'Bildbeschreibungen', typ: 'liste-text' },
```

`beschreibungsfeld` ist **Pflicht** bei jedem `typ: 'bilder'`; ohne die Angabe
hält `npm run maske` an.

**Warum so hart:** Ein Foto, das der Betrieb selbst hochlädt, heißt nach seiner
Prüfsumme und steht in keiner Zuordnungsliste – es gibt schlicht keinen anderen
Ort, an dem ein Alt-Text herkäme. In einem Kundenprojekt standen deshalb vier
gepflegte Fotos ohne jede Beschreibung online. Das Prüf-Tor kann das nicht
melden: Es sieht die gepflegten Bilder erst beim Bauen.

**Das Beschreibungsfeld ist ausdrücklich KEIN Pflichtfeld.** Ein Pflichtfeld
hindert den Betrieb am Veröffentlichen – und dann steht „Foto" darin, was für
ein Vorleseprogramm schlechter ist als gar nichts. Die Prüfung richtet sich an
den, der die Feldliste baut, nicht an den Betrieb.

**Die Beschreibung hängt an der Position, nicht am Bild.** `bildAlt[0]` gehört
zu Foto 1. Tauscht der Betrieb ein Foto aus und lässt die Beschreibung stehen,
steht unter dem neuen Bild der Satz zum alten – ein Alt-Text ist da, er ist nur
falsch. `npm run inhalte` vergleicht deshalb gegen den vorigen Stand und
**warnt**, wenn sich ein Foto geändert hat und seine Beschreibung nicht. Das ist
die einzige Stelle, an der sich das überhaupt bemerken lässt.

---

## Einrichten

**1. Beim Dienst ein Projekt anlegen.** Umgesetzt ist die HTTP-Schnittstelle
von Sanity – bewusst ohne npm-Paket, damit die Website frei von Abhängigkeiten
bleibt, die ein Klon nie aktualisiert bekommt. Ein anderer Dienst braucht nur
zwei Funktionen in `scripts/lib/redaktion.mjs` neu.

**2. `redaktion/dienst.json` anlegen:**

```json
{
  "dienst": "sanity",
  "projekt": "<Projektkennung>",
  "datensatz": "production",
  "privat": false,
  "studioOrdner": "../<kunde>-studio"
}
```

- `projekt` – die Projektkennung des Dienstes. Kein Geheimnis.
- `privat: true` – nur, wenn der Datensatz nicht öffentlich lesbar ist. Dann
  muss `REDAKTION_TOKEN` in der Umgebung stehen (lokal) und als
  Repository-Geheimnis (für die Sicherung).
- `studioOrdner` – wo das laufende Eingabe-Studio liegt. Trägt `npm run studio`
  von selbst ein. Steht er hier, legt `npm run maske` die Maske gleich dorthin.
  **Ohne ihn bleibt ein Kopierschritt von Hand – und genau der läuft irgendwann
  auseinander.**

**3. `npm run studio`** – legt das Eingabe-Studio als Nachbarordner an
(`../<kunde>-studio`), holt seine Abhängigkeiten und trägt den Pfad in
`dienst.json` ein.

> **Warum nebenan und nicht im Projekt:** Das Studio ist ein eigenes Programm
> mit eigenen Abhängigkeiten. Lägen die in der `package.json` der Website,
> wären sie in jedem Build, jeder Prüfung und jeder Sicherheitsmeldung dabei.
> Die Website ist rein statisch und soll es bleiben.
>
> Bis 03.08.2026 stand hier ein Verweis auf einen Ordner, **den niemand
> anlegt** – `npm run maske` brach dann mit „Studio-Ordner stimmt nicht?" ab,
> und was dazwischen fehlte, hätte der Auftraggeber selbst tippen müssen.

**4. `npm run maske`** und die Maske im Studio veröffentlichen
(`npm run deploy` im Studio-Ordner).

**5. `npm run erstbefuellung`** – bringt den **vorhandenen** Bestand aus
`content.config.ts` in den Dienst, samt Fotos.

> **Diesen Schritt gab es bis 03.08.2026 nicht, und sein Fehlen war die
> gefährlichere der beiden Lücken.** Ein frisch angelegtes Projekt ist leer;
> `npm run inhalte` liest nur. Es lief dann durch, meldete „0 Einträge" und sah
> nach Erfolg aus – die Sicherung „eine leere Antwort überschreibt nie" greift
> genau wie vorgesehen, verdeckt hier aber, dass nie jemand die Inhalte
> hineingegeben hat. Wer nicht misstrauisch wird, übergibt dem Betrieb ein
> leeres Studio mit den Worten „ab jetzt können Sie selbst pflegen".
>
> Vorher ansehen, ohne etwas zu tun: `npm run erstbefuellung -- --probe`.
> Sie schreibt **nie** über bestehende Einträge – liegt schon etwas im Dienst,
> bricht sie ab. Sie ist die *Erst*befüllung, kein Abgleich.
>
> **Ab da ist der Dienst die Quelle.** Was in `content.config.ts` unter
> `katalog` steht, wird davon überlagert; Änderungen dort wirken nicht mehr.

**6. `npm run inhalte`** – holt alles zurück ins Projekt.

**7. Die nächtliche Sicherung scharfstellen** (siehe unten). Ohne sie stimmt
die Zusage nicht.

**8. Im Dienst einen Webhook auf GitHub legen**, damit „Veröffentlichen" sofort
wirkt statt erst in der Nacht:

```
POST https://api.github.com/repos/<eigentümer>/<repo>/dispatches
Body: {"event_type": "inhalte"}
Header: Authorization: Bearer <Token mit Repo-Recht>
        Accept: application/vnd.github+json
```

---

## Die nächtliche Sicherung

`.github/workflows/inhalte-sichern.yml` liegt bei und ist der Grund, warum die
Zusage oben überhaupt haltbar ist.

Sie holt Inhalte **und Bilder**, checkt sie **nur bei einer Änderung** ein, und
der Einchecke-Vorgang stößt bei Vercel automatisch eine neue Veröffentlichung
an. Sie läuft nachts, auf Knopfdruck und auf den Webhook hin.

**Einmalig einstellen** – drei Dinge:

1. **Abläufe brauchen Schreibrecht.** In den Einstellungen des Repos gibt es
   einen Bereich für automatische Abläufe und darin die Berechtigung, mit der
   sie laufen. Sie muss auf **Lesen UND Schreiben** stehen – ohne das kann die
   Sicherung zwar Inhalte holen, sie aber nicht einchecken, und genau das ist
   ihr Zweck.
2. **Nur bei einem nicht-öffentlichen Datensatz:** Der Lesezugang des
   Redaktionsdienstes wird als verschlüsselter Wert im Repo hinterlegt (bei den
   Einstellungen für Abläufe, Abschnitt für Geheimnisse), unter dem Namen
   `REDAKTION_TOKEN`.
3. **Die Absenderadresse der Sicherung eintragen.** In
   `.github/workflows/inhalte-sichern.yml` steht bei `SICHERUNG_MAIL` ein
   Platzhalter. Dort gehört die E-Mail-Adresse des Betreuers hin – desjenigen,
   der auch sonst die Commits dieses Repos macht und beim Hoster der Website
   als Mitglied bekannt ist.

   > **Warum das kein Schönheitspunkt ist:** Vercel liefert bei einem privaten
   > Repo nur Commits aus, deren Autor ein Team-Mitglied ist. Ist er es nicht,
   > bleibt der Commit stumm liegen – und weil das Redaktionssystem immer den
   > **letzten** Commit veröffentlicht, hängt danach auch jede Änderung des
   > Betriebs fest. In einem Kundenprojekt hat ein Händler fünf Tage lang
   > Fotos hochgeladen, die nie online gingen.
   >
   > Solange der Platzhalter steht, **bricht die Sicherung absichtlich mit
   > einer Fehlermeldung ab** und schickt eine Mail, statt still das Falsche zu
   > tun. Das Prüf-Tor meldet es zusätzlich vor dem Live-Gang.

> **Warum hier keine Klickpfade stehen** (Regel aus CLAUDE.md Abschnitt 0):
> Die Menübezeichnungen des Hosters ändern sich, und eine falsche Klickanleitung
> ist teurer als gar keine – der Betreuer sucht dann eine Option, die es unter
> dem Namen nicht gibt. Beschrieben ist deshalb das ZIEL. Wer die Stelle
> tatsächlich sucht: In der Suche der Repo-Einstellungen nach „workflow" bzw.
> „secret" suchen.

**Was ehrlich dazugehört:** Läuft die Sicherung, ist der eingecheckte Stand
höchstens einen Tag alt – dann stimmt „Auch wenn der Dienst eines Tages weg
ist, bleibt die Website stehen." Läuft sie **nicht**, ist der eingecheckte
Stand der vom letzten Handgriff des Betreuers, und die Aussage gehört
abgeschwächt. Das ist kein Formalismus: Fällt der Dienst ein halbes Jahr später
aus, baut die Seite mit uraltem Bestand – Verkauftes stünde wieder als
verfügbar da, alte Preise wären wieder gültig. Das ist schlimmer als ein
sichtbarer Ausfall, weil es plausibel aussieht.

Das Prüf-Tor meldet es, wenn ein Projekt gepflegte Inhalte hat und die
Sicherung fehlt.

**Nachsehen, ob sie läuft:** Der Hoster führt die vergangenen Läufe automatischer
Abläufe im Repo auf; der hier heißt **„Inhalte sichern"** (der Name steht in
`.github/workflows/inhalte-sichern.yml` und ist damit belegbar – die Bezeichnung
des Menüpunkts drumherum absichtlich nicht, siehe Kasten oben). Schlägt ein Lauf
fehl, benachrichtigt der Hoster den Repo-Eigentümer per E-Mail – das ist der
Rückkanal, der sonst vollständig fehlt.

---

## Befehle

| Befehl | Zweck |
| --- | --- |
| `npm run inhalte` | Inhalte und Bilder holen |
| `npm run inhalte -- --probe` | Nur zeigen, was passieren würde – nichts schreiben |
| `npm run maske` | Eingabemaske aus der Feldliste erzeugen |
| `npm run maske -- --pruefen` | Nur vergleichen, ob die Maske noch passt |

## Was hier NICHT hingehört

Farben, Schriften, Seitenstruktur, der Fließtext der Rechtstexte. Das sind
Eingriffe ins Design beziehungsweise ins Recht – sie gehören in die Hand
dessen, der die Seite betreut, nicht in eine Eingabemaske.
