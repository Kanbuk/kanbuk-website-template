# Der Weg eines Betriebs – von der Anfrage bis zur Übergabe

> **Wofür diese Datei da ist:** CLAUDE.md sagt, WIE gebaut wird. Die Skills
> sagen, wie portiert und live gegangen wird. Was nirgends stand: **in welcher
> Reihenfolge das alles passiert und welcher Ordner wann entsteht.** Genau das
> steht hier – eine Seite, ohne Fachbegriffe.

---

## Die drei Stufen

Ein Betrieb durchläuft höchstens drei Stufen. Die meisten bleiben auf Stufe 1.

| Stufe | Was entsteht | Aufwand | Wann |
| --- | --- | --- | --- |
| **1 · Verkaufs-Demo** | Standalone-HTML aus Claude Design, online zum Verschicken | ~20–30 min | Lead will etwas sehen |
| **2 · Die echte Website** | Der Motor-Klon, fertig gebaut, mit gezogenem Stecker | ~40–50 min | **erst wenn der Kunde zahlt** |
| **3 · Live** | Eigene Domain, Formular scharf, bei Google sichtbar | ~1–2 h | Rechtsdaten und Zugänge sind da |

**Warum Stufe 2 erst nach der Zahlung kommt:** Wer nicht kauft, kostet dann nur
die Demo. Das ist der ganze Grund für die Trennung – nicht Technik, sondern
Risiko.

---

## Die Ordner – lokal, GitHub, Vercel

**Ein Betrieb, ein Ordner.** `<betrieb>` ist überall derselbe kurze Bezeichner
(klein, mit Bindestrich): Ordnername, Projektname ohne Präfix, Adresse ohne
Präfix.

| Was | lokal | GitHub | Vercel | Adresse |
| --- | --- | --- | --- | --- |
| Verkaufs-Demo | `kanbuk-demos/<betrieb>` | – | `demo-<betrieb>` | `demo-<betrieb>.kanbuk.com` |
| **Zahlender Kunde** | `kanbuk-kunden/<betrieb>` | `kunde-<betrieb>` | `kunde-<betrieb>` | `<betrieb>.kanbuk.com` → eigene Domain |
| Vorzeige-Seite | `kanbuk-demos/<betrieb>` | `showcase-<betrieb>` | `showcase-<betrieb>` | `<betrieb>.kanbuk.com` |
| Redaktions-Studio | `<betrieb>-studio` daneben | – | – | beim Dienst gehostet |
| Eigenes Projekt | `kanbuk-<name>` | `kanbuk-<name>` | `kanbuk-<name>` | – |

Drei Regeln dahinter:

- **Repos liegen immer in der Organisation `Kanbuk`**, nie unter einem Privatkonto.
- **Der lokale Ordner trägt kein Präfix** – der Elternordner ist der Namensraum.
  GitHub und Vercel tragen es, weil beide flache Listen ohne Ordner sind.
- **`kanbuk-kunden/` ist die Kundenliste.** Dort liegt jeder zahlende Kunde –
  auch einer, dessen Seite nicht mit dem Motor gebaut wurde.

**Motor-Testklone** (ein Port ohne Kunden, um den Motor zu prüfen) liegen
vorübergehend in `kanbuk-demos/` und werden **nach dem Auswerten gelöscht**.
Sie bekommen kein Repo und kein Vercel-Projekt.

---

## Stufe 1 · Verkaufs-Demo

1. In Claude Design die Seite bauen.
2. `npm run demo -- --datei <archiv.zip> --kunde "<Betrieb>"`
   → hostet sie auf `demo-<betrieb>.kanbuk.com`, mit Kanbuk-Leiste, für Google
   gesperrt.
3. Link an den Lead.

**Die Design-Dateien (`.dc.html` + Bilder) gut aufheben.** Sie sind die
Bauanleitung für Stufe 2 und die Vergleichsvorlage für das sechste Tor –
danach brauchst du sie bei *jedem* künftigen Lauf wieder.

Kauft er nicht: Ordner und Vercel-Projekt löschen. Fertig.

---

## Stufe 2 · Die echte Website (nach der Zahlung)

**Neu bauen, nicht die Demo umbauen.** Warum, steht im `/deploy`-Skill – kurz:
Der Demo-Ordner schleppt Dateien mit, die der Motor selbst erzeugt, und seine
Vercel-Verknüpfung zeigt aufs Demo-Projekt. Wer die mitnimmt, veröffentlicht
die Kundenseite später versehentlich unter der Demo-Adresse.

1. **Rechtsdaten beim Kunden einholen** – Firmenwortlaut, UID, Firmenbuchnummer
   und -gericht, Gewerbebezeichnung und Kammer **wortgleich aus dem
   GISA-Auszug**, Unternehmensgegenstand.

   > **Das ist der Schritt, der Live-Gänge verzögert.** Er dauert beim Kunden
   > Tage, nicht Minuten – deshalb steht er ganz vorn und nicht am Live-Tag.
   > Erfunden wird nichts: Was fehlt, wird Platzhalter, und der Platzhalter
   > blockiert später den Live-Gang.

2. **Klon anlegen:**
   `npx degit Kanbuk/kanbuk-website-template kanbuk-kunden/<betrieb>`
3. **Design hineinlegen:** `.dc.html` nach `design/`, Fotos nach `fotos/`.
4. **Repo anlegen – jetzt, nicht am Live-Tag:**
   `gh repo create Kanbuk/kunde-<betrieb> --private --source=. --remote=origin --push`
   Zwischen „zahlt" und „live" liegt die meiste Arbeit. Ohne Repo gibt es in
   dieser Zeit kein Backup und keinen Weg zurück.
5. **Portieren:** `/port` – ein Prompt, ein Design, eine Frage-Runde.
6. **Abnahme-Vorschau schalten:**
   `npx vercel domains add <betrieb>.kanbuk.com kunde-<betrieb>`
   Die Seite steht dort vollständig, aber mit gezogenem Stecker: kein Versand,
   für Google gesperrt, Telefonnummer nicht klickbar.
7. Link an den Kunden, Änderungswünsche einarbeiten.
8. **Erst wenn diese Adresse steht:** Demo-Ordner löschen und
   `demo-<betrieb>.kanbuk.com` auf die neue Vorschau weiterleiten – der schon
   verschickte Verkaufslink soll weiter ankommen.

---

## Stufe 3 · Live

Der vollständige Ablauf steht im `/deploy`-Skill, Weg B. Was du wissen musst:

**Es gibt zwei Fälle, und sie sind verschieden schwer.**

- **Freie Domain** (der Betrieb hatte noch keine Website): Domain verbinden,
  umschalten, fertig.
- **Relaunch** (unter der Adresse läuft schon etwas): eigene Disziplin, eigene
  Vorlage – `vorlagen/UMSTELLTAG-VORLAGE.md`. Dort hängt meist die
  **Geschäftspost** an derselben DNS-Zone, und ein falscher Handgriff nimmt
  dem Betrieb die E-Mail.

> ### Die eine Regel, die über allem steht
>
> **Erst `mode: 'live'` schalten und auf der Vorschau-Adresse gegenprüfen –
> DANN die Domain umhängen.**
>
> Nicht umgekehrt. Wer zuerst umhängt, veröffentlicht unter der Kundendomain
> eine Seite, die noch auf „für Google gesperrt" steht – also genau die
> Sichtbarkeit, für die der ganze Umzug gemacht wird.

Die drei Dinge, ohne die gar nichts geht:

1. Echte Rechtstexte (Impressumspflicht)
2. `RESEND_API_KEY` + `CONTACT_FROM` (damit das Formular sendet)
3. Domain verbunden

Und der Beweis, dass es gereicht hat: `npm run check -- --live`.

Dazu vor dem Umschalten: **Auftragsverarbeitungsvertrag** mit dem Kunden
(Art. 28 DSGVO) – kein Code, aber Pflicht, sobald echte Anfragen laufen.

---

## Die neun Tore – was jedes prüft

In einem Satz, damit du weißt, was du liest:

| Tor | Befehl | prüft |
| --- | --- | --- |
| 1 | `npm run check` | Baut die Seite und prüft den Standard: Meta-Angaben, Bilder, Rechtsseiten, keine fremden Server |
| 2 | `npm run sicht` | Echter Browser bei vier Breiten: Läuft etwas über? Ist Text abgeschnitten? Sind Tippflächen groß genug? |
| 3 | `npm run interaktion` | Klickt jedes Bedienelement wirklich an – Menü, Akkordeon, Filter, Formular |
| 4 | `npm run altgeraet` | Macht Bilder davon, wie die Seite auf einem alten Browser **aussieht** |
| 5 | `npm run browser` | Hält die Seite die zugesagte Browser-Untergrenze ein |
| 6 | `npm run abgleich` | Hält die gebaute Seite gegen die Design-Datei: fehlt ein Block, ist einer erfunden |
| 7 | `npm run unterlaengen` | Schneidet die Seite g, j, p, q, y ab (Klassiker bei Verlaufs-Überschriften) |
| 8 | `npm run bildschaerfe` | Kommt auf einem feinen Bildschirm genug Auflösung an |
| 9 | `npm run endpunkt` | Lebt der Formular-Empfänger wirklich (läuft nur beim Live-Gang mit) |

**Und danach dein eigenes Auge – das ist kein Tor, aber Pflicht:**

- `pruefung/texte.md` lesen (Rechtschreibung, Ansprache)
- die Kontaktbögen ansehen (Layout über alle Breiten)
- die Design-Datei neben die Seite legen, Block für Block
- die Altgerät-Bilder ansehen
- Lighthouse einmal von Hand messen (Ziel ≥ 95; kein Tor misst es)

Grüne Tore sagen nichts über Design-Treue. Das ist die teuerste Lehre des
Projekts.

---

## Was wann gelöscht wird

| Wann | Was |
| --- | --- |
| Lead kauft nicht | Demo-Ordner + Vercel-Projekt `demo-<betrieb>` |
| Abnahme-Vorschau steht | Demo-Ordner; `demo-<betrieb>.kanbuk.com` weiterleiten |
| Motor-Test ausgewertet | Testklon komplett |
| Kunde geht live | nichts – altes Hosting läuft bei einem Relaunch noch 4–6 Wochen weiter |
