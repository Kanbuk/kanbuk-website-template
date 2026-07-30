---
name: deploy
description: >-
  Stellt die Seite online. Zwei Wege: (1) Demo-Vorschau schnell direkt zu Vercel,
  (2) gebuchter Kunde -> privates GitHub-Repo + Live-Schaltung. Auslösen, wenn der
  Nutzer veröffentlichen / online stellen / deployen / live gehen will.
argument-hint: ""
---

# Online stellen

Zuerst klären, welcher Fall vorliegt (kurz nachfragen, wenn unklar):
**A) Demo-Vorschau** für einen Lead, oder **B) gebuchter Kunde geht live**.

## Namensregeln (verbindlich, vor jedem Anlegen prüfen)

| Typ | Ordner | GitHub | Vercel-Projekt |
|---|---|---|---|
| Demo (Walk-in) | `kanbuk-demos/<betrieb>` | **kein Repo** | `demo-<betrieb>` |
| Vorzeige-Seite | `kanbuk-demos/<betrieb>` | `Kanbuk/showcase-<betrieb>` | `showcase-<betrieb>` |
| Zahlender Kunde | `kanbuk-kunden/<betrieb>` | `Kanbuk/kunde-<betrieb>` | `kunde-<betrieb>` |
| Eigenes | `kanbuk-<name>` | `Kanbuk/kanbuk-<name>` | `kanbuk-<name>` |

Drei Regeln dahinter:
- **Repos liegen immer in der Organisation `Kanbuk`**, nie unter einem Privatkonto.
- **Der Ordner trägt kein Präfix** – der Elternordner ist der Namensraum. GitHub und
  Vercel tragen es, weil beide flache Listen ohne Filter oder Ordner sind: das Präfix
  ist dort die einzige Gruppierung.
- **Demos bekommen kein Repo.** Der Motor steckt im Template, eine Demo ist bei Bedarf
  neu gebaut. Erst ein zahlender Kunde (oder eine dauerhafte Vorzeige-Seite) wird
  versioniert.

`<betrieb>` ist durchgehend derselbe kurze Bezeichner (klein, mit Bindestrich):
Ordnername, Projektname ohne Präfix, Subdomain ohne Präfix. Auch `package.json`
trägt den Namen inklusive Präfix, also wie das Repo.

**Vercel-Realität (im Piloten gelernt, alle drei Punkte prüfen):**
- Zugang: `npx vercel whoami` – falls nicht eingeloggt, den Nutzer durch
  `npx vercel login` führen (Firmen- bzw. eigenes Konto).
- **Plan:** Der Hobby-Plan verbietet JEDE kommerzielle Nutzung – und jedes
  Kundenprojekt ist per Vercel-Definition kommerziell („receiving payment to
  create the site"). Vor dem ersten Deploy sicherstellen, dass das Ziel-Team
  auf **Pro** läuft; sonst den Nutzer darauf hinweisen, bevor irgendetwas
  hochgeht.
- **Team bewusst wählen:** beim Erstanlegen NICHT blind `--yes` – das Projekt
  landet sonst in dem Team, das die CLI zufällig gewählt hat. Vorher
  `npx vercel switch` (bzw. `--scope <team>`).

Vor JEDEM Deploy (Demo wie Live) läuft die **komplette Launch-Prüfung**
(Details: /port-Skill, Etappe 5):
1. `npm run check` grün (Vorprüfung + Build + Prüf-Tor)
2. `npm run sicht` grün (echter Browser: Überlauf, JS-Fehler, kaputte
   Ressourcen; erzeugt Screenshots, Bögen und `pruefung/texte.md`)
3. `npm run interaktion` grün (jeder Bedien-Baustein wird real gefahren)
3a. `npm run browser` grün – die Seite hält die Browser-Untergrenze
   (CLAUDE.md Abschnitt 4a). Läuft seit 2026-07-28 in `npm run check` mit;
   der eigene Aufruf schadet nicht. **Ohne diese Stufe ging schon einmal eine
   abgenommene Seite live, die auf älteren Geräten keine Navigation hatte.**
4. **Mit eigenen Augen:** `pruefung/texte.md` lesen (Rechtschreibung, Ansprache),
   Bögen ansehen (Layout über alle Breiten), Verdachtsfälle im Einzel-Screenshot
4a. **Abgleich mit der Design-Vorlage** (nur bei portierten Kundenseiten):
   Seite für Seite die `.dc.html` daneben legen. Ist jeder Block da, an der
   richtigen Stelle, mit der richtigen Grundfarbe? Und steht umgekehrt etwas auf
   der Seite, das im Design nicht vorkommt? **Grüne Technikprüfungen sagen
   nichts über Design-Treue** – im Kundenprojekt waren alle Tore grün, während
   Bänder die falsche Farbe hatten und Abschnitte fehlten. Verbleibende
   Abweichungen gehören begründet in den Bericht (`/port`-Skill, Etappe 5).
5. Beim Live-Gang zusätzlich: `npm run check -- --live` (Platzhalter, offene
   STAND.md-Punkte, Sitemap) und `npm audit --omit=dev` – Funde mit Schweregrad
   high/critical stoppen den Launch (dem Nutzer melden)

---

## A) Demo-Vorschau veröffentlichen (schnell, ohne GitHub)

Für Vorschau-Demos wird **kein** GitHub-Repo angelegt – direkt zu Vercel:

1. Sicherstellen: `content.config.ts` hat `mode: 'demo'` (Demo-Balken, Formular aus, noindex).
2. `npx vercel` ausführen. Beim ersten Mal führt Vercel durch Login + Projekt-Setup
   (Framework „Astro" wird erkannt, Output `dist`). **Als Projektnamen `demo-<betrieb>`
   eingeben – NICHT den vorgeschlagenen Ordnernamen bestätigen.** Der Ordner heißt
   ohne Präfix, das Vercel-Projekt braucht es (siehe Namensregeln oben).
   Nicht-interaktiv: `npx vercel link --yes --project demo-<betrieb>`.
3. Für die teilbare URL: `npx vercel --prod`.
4. **Marken-Adresse anbinden** (Adress-Stufen, CLAUDE.md Abschnitt 7):
   `npx vercel domains add demo-<betrieb>.kanbuk.com demo-<betrieb>` – als
   **Projekt-Domain**, nie per `alias set` (ein Alias landet hinter dem
   Vercel-Zugriffsschutz und zeigt Fremden eine Anmeldemaske). Danach die
   Adresse selbst abrufen: Sie muss ohne Login mit HTTP 200 antworten.

   **Erst abrufen, dann herausgeben.** `*.kanbuk.com` ist eine DNS-Wildcard: jeder
   erfundene Name löst auf, auch ohne Projekt. Zusammen mit HSTS `includeSubDomains`
   auf kanbuk.com heißt das – solange Vercel kein Zertifikat ausgestellt hat, bricht
   der Browser die Verbindung hart ab, ohne „Trotzdem fortfahren". Eine Adresse, die
   im DNS auflöst, ist also noch lange nicht zeigbar.
5. Die URL an den Nutzer geben. Keine Umgebungsvariablen nötig (Formular ist im Demo aus).

**Welche URL man dem Lead schickt:** Ist im Vercel-Team „Deployment Protection"
aktiv, ist NUR der kurze Alias öffentlich (`https://<projekt>.vercel.app`) – die
längeren Deploy-URLs führen Fremde auf eine Vercel-Anmeldemaske. Deshalb immer
den kurzen Alias herausgeben und **einmal selbst im privaten Fenster öffnen**,
bevor er verschickt wird.

---

## B) Gebuchter Kunde – live schalten (mit privatem GitHub-Repo)

Sobald der Auftraggeber die Live-Schaltung freigibt (im Standardablauf: der Kunde
hat gebucht). Vorab STAND.md lesen – dort stehen die offenen Punkte.
GitHub-Zugang prüfen: `gh auth status`; falls nicht eingeloggt, den Nutzer durch
`gh auth login` führen (Firmen-Konto verwenden; Zugänge zu GitHub/Vercel/Resend
bekommt ein neuer Mitarbeiter vom Inhaber).

> **Was der Nutzer selbst klicken muss, beschreibst du klickbar.** Keine
> Befehlszeile in einer Anleitung für ihn – alles, was ein Terminal braucht,
> machst du. Und Bezeichnungen fremder Oberflächen (Menüpunkte, Rollennamen,
> Berechtigungsstufen) **nie aus dem Gedächtnis** nennen: entweder belegt
> nachgeschlagen oder bewusst unscharf („die Berechtigung mit Schreibrecht").
> Im Kundenprojekt stand der Auftraggeber vor einer Maske und suchte eine
> Option, die es dort nicht gibt. Siehe CLAUDE.md Abschnitt 0.

0. **Vom Demo zum Kundenprojekt umziehen** (einmalig, sobald der Vertrag steht).
   Aus `demo-` wird `kunde-`, der Bezeichner `<betrieb>` bleibt derselbe:
   - Ordner verschieben: `kanbuk-demos/<betrieb>` → `kanbuk-kunden/<betrieb>`
     (der Ordnername ändert sich nicht, nur der Elternordner).
   - Vercel-Projekt umbenennen: `demo-<betrieb>` → `kunde-<betrieb>`
     (Dashboard → Settings → General → Project Name). Risikofrei: Domains,
     Umgebungsvariablen und Deploy-Verlauf hängen an der Projekt-ID, nicht am Namen.
   - `package.json` → `"name": "kunde-<betrieb>"`.
   - Adresse eine Stufe weiterschalten (Adress-Stufen, CLAUDE.md Abschnitt 7):
     `npx vercel domains add <betrieb>.kanbuk.com kunde-<betrieb>` – aus der
     Verkaufs-Demo `demo-<betrieb>.kanbuk.com` wird die Abnahme-Vorschau
     `<betrieb>.kanbuk.com` ohne Präfix. Die alte Demo-Adresse kann bleiben
     oder entfernt werden; sie war nur für den Lead gedacht.
   - **Privates Repo anlegen und hochladen – JETZT, nicht am Live-Tag.**
     ```bash
     git init -b main   # falls noch kein Repo
     gh repo create Kanbuk/kunde-<betrieb> --private --source=. --remote=origin --push
     ```
     Ohne das `Kanbuk/`-Präfix landet es im Privatkonto des Angemeldeten.
     Gegenprobe: `gh repo list <privatkonto>` darf es NICHT enthalten.

     **Warum hier und nicht weiter unten:** Zwischen „Vertrag steht" und „live"
     liegen bei jedem Kunden Tage bis Wochen mit der **meisten** Arbeit – Port,
     Nachbesserungsrunden, Abnahme. Stand der Repo-Schritt erst im Live-Abschnitt,
     gab es in genau dieser Zeit weder Backup noch Verlauf noch eine Möglichkeit
     zurückzurollen. Im Kundenprojekt entstand das Repo tatsächlich erst, als die
     Seite längst auf der Abnahme-Adresse stand.
   - In Notion: Walk-in-Karte auf „Unterschrieben", Projekt-Art auf „Kundenprojekt".
   Läuft daneben ein Claude-Code-Verlauf für den Ordner, wandert er NICHT automatisch
   mit: Claude leitet den Verlaufspfad aus dem Ordnerpfad ab. Vor dem Verschieben in
   `~/.claude/projects/` nachsehen und den passenden Ordner mitbenennen, sonst sind
   Verlauf und Projektgedächtnis nicht mehr erreichbar (gelöscht sind sie nicht).

1. **Live-Konfiguration** in `content.config.ts`:
   - `mode: 'live'` setzen (Formular an, `tel:` verlinkt, Indexierung + Sitemap).
     `vercel.json` erzeugt der nächste Build **automatisch** ohne
     Sperr-Header – dort ist NICHTS von Hand zu ändern.
   - Rechtstexte vollständig und echt (UID/Firmenbuch etc.), echte Bilder eingesetzt,
     alle offenen Punkte in STAND.md abgehakt.
   - Fußzeile enthält `<Signatur />` (Kanbuk-Backlink – Schritt 2 blockt sonst rot).
2. **Neu bauen:** `npm run check -- --live` muss grün sein (blockt bei offenen
   STAND.md-Punkten und Platzhaltern).
3. **Formular-Versand – über eine EIGENE Unterdomain, nie über die Hauptdomain.**

   > **Warum das keine Feinheit ist.** Der SPF-Eintrag der Hauptdomain trägt die
   > **gesamte Geschäftspost** des Betriebs. Bei einem Kunden stand er auf `-all`
   > („alles, was nicht hier steht, ist Fälschung") – ihn zu erweitern, damit ein
   > Kontaktformular senden darf, wäre das teuerste Risiko des ganzen Umzugs
   > gewesen: Ein Tippfehler, und die Rechnungen des Betriebs landen im Spam.
   > Mit einer eigenen Unterdomain bleibt der Eintrag der Hauptdomain **unberührt**.

   **Unterdomain:** `formular.<kundendomain>` (frei wählbar, aber einheitlich halten).

   **Die drei DNS-Einträge, die der Kunde bei seinem Anbieter anlegt.** Ohne diese
   Liste ist der Punkt ein Hinweis und keine Anleitung – die genauen Werte zeigt
   der Versanddienst nach dem Eintragen der Unterdomain an:

   | Typ | Name | Wert |
   | --- | --- | --- |
   | TXT | `resend._domainkey.formular` | der lange Schlüssel aus dem Dienst (DKIM) |
   | MX  | `send.formular` | der vom Dienst genannte Empfangsserver, Priorität 10 |
   | TXT | `send.formular` | `v=spf1 include:<vom Dienst genannt> ~all` |

   *(Der Anbieter hängt die Domain meist selbst an – dann heißt der Name im
   Formular nur `resend._domainkey.formular`, nicht `…formular.kundendomain.at`.
   Zeigt seine Maske den vollen Namen an, den vollen eintragen.)*

   > **Der MX-Eintrag sieht gefährlicher aus, als er ist – das dem Kunden sagen.**
   > Er steht auf `send.formular.<domain>`, also auf einem **anderen Namen** als
   > der MX der Hauptdomain. Die Geschäftspost läuft unverändert weiter. Wer das
   > nicht dazusagt, bekommt an dieser Stelle einen berechtigten Schreck – und im
   > schlimmsten Fall bricht der Kunde den Umzug ab.

   **Zwei Dinge, die der Dienst anbietet und die NICHT gemacht werden:**

   - **Kein DMARC-Eintrag.** Der Dienst bietet ihn an, aber er läge auf der
     **Hauptdomain** und wäre damit eine Richtlinie für die **gesamte
     Geschäftspost**. Ohne Berichtsadresse ist er wirkungslos, aber folgenreich.
     Das ist eine Entscheidung des Betriebs über seine Mail-Infrastruktur, nicht
     ein Nebenschritt beim Website-Umzug.
   - **Klick-Zählung AUS.** Sie schreibt jeden Link in der Mail auf einen
     Zählserver um. Das widerspricht der cookiefreien Zusage, gehört sonst in die
     Datenschutzerklärung – und macht aus jeder Bestätigungsmail eine Messung.

   **Region festlegen** (im Dienst beim Freischalten): EU oder USA. Danach
   `versandRegion: 'EU'` bzw. `'USA'` in `content.config.ts` eintragen – die
   Datenschutzerklärung formuliert den Absatz danach. Ohne diesen Schritt
   behauptet sie eine Übermittlung in ein Drittland, die es womöglich gar nicht
   gibt.

   **Dann die zwei Umgebungsvariablen** im Vercel-Dashboard (bzw.
   `vercel env add`): `RESEND_API_KEY` und `CONTACT_FROM` (Absender auf der
   Unterdomain, z. B. `anfrage@formular.<kundendomain>`).

   > ### ⚠ „Sensitive" NICHT ankreuzen – der teuerste stille Fehler des Live-Gangs
   >
   > Eine bei Vercel als **Sensitive** markierte Variable erreicht den **Build**,
   > aber **nicht die Serverless-Funktion**. Der Formularversand ist danach
   > vollständig tot, und im Dashboard sieht alles korrekt aus.
   >
   > Am 30.07.2026 an einer echten Kundenseite belegt: Ein Skript las mit
   > derselben Variable beim Bauen einwandfrei seine Daten (und hat keinen fest
   > eingebauten Ersatzwert), während `/api/contact` beide Werte als leer sah.
   > Ohne die Markierung neu angelegt → sofort `HTTP 200`.
   >
   > Jeder kreuzt „Sensitive" bei einem Schlüssel aus gutem Grund an. Genau
   > deshalb steht es hier. Der Motor schreibt bei diesem Fehler eine
   > Protokollzeile, die den Verdacht ausdrücklich nennt.

   **Danach einmal WIRKLICH senden** und die Mail im Postfach ansehen – nicht nur
   den Statuscode. Solange das nicht passiert ist, ist der Versand der einzige
   unbewiesene Teil der Seite.
4. **Stand hochladen.** Das private Repo steht seit Schritt B.0 – hier genügt
   `git add -A && git commit && git push`. Falls es wider Erwarten noch keines
   gibt, jetzt nachholen (Befehle siehe B.0) und im Bericht als versäumten
   Schritt nennen: Die Arbeit lag bis hierher ohne Backup.
5. **Live deployen:** `npx vercel --prod`. (Optional im Vercel-Dashboard das GitHub-Repo
   verbinden, dann deployt jeder `git push` automatisch neu.)
6. **Echte Kunden-Domain verbinden:** `npx vercel domains add <kundendomain> <projektname>`.
   Zeigt die Ausgabe nötige DNS-Einträge, dem Nutzer eine einfache
   Klick-Anleitung für den Domain-Anbieter des Kunden mitgeben. Die
   `<kunde>.kanbuk.com`-Abnahme-Adresse kann bleiben oder entfernt werden.
7. **Nur bei Redaktionssystem** (`redaktion/dienst.json` vorhanden, CLAUDE.md 6c):
   die nächtliche Sicherung scharfstellen. **Das ist kein Zubehör** – ohne sie
   driftet der eingecheckte Stand ab dem ersten Tag ab, an dem der Betrieb
   selbst pflegt, und die Zusage „die Website läuft auch ohne den Dienst
   weiter" stimmt nicht mehr. `npm run check -- --live` blockt deshalb, wenn
   die Ablaufdatei fehlt.
   - Im Repo unter *Settings → Actions → General* das Schreibrecht für Abläufe
     einschalten (die Option mit Lese- **und** Schreibrecht).
   - Nur bei privatem Datensatz: Geheimnis `REDAKTION_TOKEN` hinterlegen.
   - Einen Lauf von Hand auslösen und nachsehen, dass er grün ist. **Erst dann
     ist die Zusage belegt** – ein Ablauf, den nie jemand hat laufen sehen, ist
     genau die Art Sicherung, die im Ernstfall nicht da ist.
   - Webhook im Redaktionsdienst einrichten, damit „Veröffentlichen" sofort
     wirkt statt erst in der Nacht (Adresse in `redaktion/README.md`).
   - Aus `redaktion/ANLEITUNG-VORLAGE.md` die fertige Anleitung für den Betrieb
     machen: die `<…>`-Lücken **am echten Bildschirm nachsehen**, nicht raten.
8. Live-URL an den Nutzer.

---

## Nur Vercel
Der Motor zielt bewusst auf einen einzigen Host. Die frühere Cloudflare-/Netlify-
Schiene (zweiter Formular-Endpunkt, `_headers`, `_redirects`) ist entfernt – sie
wurde nie ausgeliefert, musste aber mitgepflegt werden und war dabei still
kaputt. Bei einem Host-Wechsel aus der Versionsgeschichte zurückholen.
