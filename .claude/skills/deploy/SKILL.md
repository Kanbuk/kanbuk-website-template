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
- **Tarif:** Der kostenlose Tarif des Hosters ist für private Projekte gedacht
  und schließt kommerzielle Nutzung aus. Ein bezahltes Kundenprojekt fällt
  darunter. **Vor dem ersten Deploy prüfen, auf welchem Tarif das Ziel-Team
  läuft**, und den Nutzer darauf hinweisen, bevor etwas hochgeht.
  > Die genaue Formulierung steht in den Nutzungsbedingungen des Anbieters,
  > nicht in seiner technischen Doku – **hier bewusst nicht zitiert.** Eine aus
  > dem Gedächtnis wiedergegebene Vertragsklausel sieht geprüft aus, und der
  > Inhaber gibt sie im Zweifel gegenüber seinem Kunden weiter (gleiche Regel
  > wie bei Paragraphenangaben, CLAUDE.md Abschnitt 6b). Im Zweifelsfall beim
  > Anbieter nachlesen und das Ergebnis mit Datum hierher.
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
4a. **`npm run abgleich` grün** (nur bei portierten Kundenseiten) – das SECHSTE
   Tor, seit 29.07.2026. Es hält die gebaute Seite gegen die `.dc.html`:
   Blockzahl, Überschriften-Folge, Reihenfolge, dunkle Bänder, Innenabstände.
   Fehlt die Design-Datei, bricht es ab – ein grünes Tor ohne Vergleich gibt es
   nicht mehr.
4b. **Und danach mit eigenen Augen:** Seite für Seite die `.dc.html` daneben
   legen. Ist jeder Block da, an der richtigen Stelle, mit der richtigen
   Grundfarbe? Und steht umgekehrt etwas auf der Seite, das im Design nicht
   vorkommt? **Grüne Technikprüfungen sagen nichts über Design-Treue** – im
   Kundenprojekt waren alle Tore grün, während Bänder die falsche Farbe hatten
   und Abschnitte fehlten. Das Werkzeug findet „Block fehlt / Block erfunden",
   das Auge alles darin; beides ist Pflicht. Verbleibende Abweichungen gehören
   begründet in den Bericht (`/port`-Skill, Etappe 5).
5. Beim Live-Gang zusätzlich: `npm run check -- --live` (Platzhalter, offene
   STAND.md-Punkte, Sitemap) und `npm audit --omit=dev` – Funde mit Schweregrad
   high/critical stoppen den Launch (dem Nutzer melden)

---

## A) Demo-Vorschau veröffentlichen (schnell, ohne GitHub)

> **Nicht zu verwechseln mit `npm run demo`.** Das ist der andere Weg: Es
> hostet ein Design-Projekt-Archiv als **Verkaufs**-Demo, bevor überhaupt ein
> Klon existiert, und belegt dabei selbst `demo-<betrieb>.kanbuk.com`.
> Hier geht es um den **gebauten Klon** vor der Abnahme.
>
> **Adress-Stufen (CLAUDE.md Abschnitt 7), damit sich die beiden nicht ins
> Gehege kommen:**
>
> | Stufe | Adresse | wodurch |
> | --- | --- | --- |
> | Verkaufs-Demo | `demo-<betrieb>.kanbuk.com` | `npm run demo` |
> | Abnahme-Vorschau des Klons | `<betrieb>.kanbuk.com` | dieser Abschnitt |
> | live | eigene Domain des Kunden | Weg B |

Für Vorschau-Demos wird **kein** GitHub-Repo angelegt – direkt zu Vercel:

1. Sicherstellen: `content.config.ts` hat `mode: 'demo'`.
   Das heißt: Demo-Balken oben, `noindex` als Meta **und** als HTTP-Kopfzeile,
   Telefonnummer nicht als `tel:`-Link, `robots.txt` sperrt alles.
   **Das Formular ist NICHT aus.** Es ist sichtbar und bedienbar, mit einem
   Hinweis darüber und ohne Versandziel im Markup. Hier stand zweimal
   „Formular aus" – wer das beim Wort nimmt, baut es aus dem Design gar nicht
   erst nach. Dann sieht der Kunde bei der Abnahme nicht, was er bekommt, und
   beide Prüfungen fahren es nie an (CLAUDE.md Abschnitt 7).
2. `npx vercel` ausführen. Beim ersten Mal führt Vercel durch Login + Projekt-Setup
   (Framework „Astro" wird erkannt, Output `dist`). **Als Projektnamen `demo-<betrieb>`
   eingeben – NICHT den vorgeschlagenen Ordnernamen bestätigen.** Der Ordner heißt
   ohne Präfix, das Vercel-Projekt braucht es (siehe Namensregeln oben).
   Nicht-interaktiv: `npx vercel link --yes --project demo-<betrieb>`.
3. Für die teilbare URL: `npx vercel --prod`.
4. **Marken-Adresse anbinden** (Adress-Stufen, CLAUDE.md Abschnitt 7):
   `npx vercel domains add <betrieb>.kanbuk.com demo-<betrieb>`

   **Ohne `demo-` davor** – das ist die ABNAHME-Stufe. `demo-<betrieb>.kanbuk.com`
   gehört der Verkaufs-Demo aus `npm run demo`; wer sie hier vergibt, weist
   dieselbe Adresse einem zweiten Vercel-Projekt zu und schießt die laufende
   Verkaufs-Demo ab.

   Immer als **Projekt-Domain**, nie per `alias set` (ein Alias landet hinter
   dem Zugriffsschutz und zeigt Fremden eine Anmeldemaske). Danach die Adresse
   selbst abrufen: Sie muss ohne Login mit HTTP 200 antworten.

   **Erst abrufen, dann herausgeben.** `*.kanbuk.com` ist eine DNS-Wildcard: jeder
   erfundene Name löst auf, auch ohne Projekt. Zusammen mit HSTS `includeSubDomains`
   auf kanbuk.com heißt das – solange Vercel kein Zertifikat ausgestellt hat, bricht
   der Browser die Verbindung hart ab, ohne „Trotzdem fortfahren". Eine Adresse, die
   im DNS auflöst, ist also noch lange nicht zeigbar.
5. Die URL an den Nutzer geben. Keine Umgebungsvariablen noetig: Das Formular
   ist sichtbar und bedienbar, verschickt aber nichts (kein `action` im Markup).

**Welche URL man dem Lead schickt:** Immer den **kurzen** Alias
(`https://<projekt>.vercel.app`), nie eine der längeren Adressen einzelner
Bereitstellungen. Der Hoster kann einen Zugriffsschutz aktiv haben; dann führen
die längeren Adressen Fremde auf eine Anmeldemaske, während der kurze Alias
öffentlich bleibt. Der Lead sieht dann eine Anmeldung statt seiner Seite.

> **Wie der Schutz beim Anbieter heißt, steht hier bewusst nicht** – das ändert
> sich, und die Bezeichnung aus dem Gedächtnis wäre eine Vermutung im
> Anleitungston (CLAUDE.md Abschnitt 0). Es braucht sie auch nicht: Der
> verlässliche Test ist ohnehin der nächste Satz.

**Und deshalb Pflicht, egal wie es heißt:** Die Adresse **einmal selbst in einem
privaten Fenster öffnen**, bevor sie hinausgeht. Das prüft die Wirkung statt der
Einstellung – und es ist der einzige Schritt, der auch dann noch stimmt, wenn
der Anbieter morgen etwas umbenennt.

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
   - Vercel-Projekt umbenennen: `demo-<betrieb>` → `kunde-<betrieb>`. Das geht
     in den Einstellungen des Projekts beim Hoster, im allgemeinen Bereich (der
     Menüpfad steht hier absichtlich nicht – siehe Kasten oben). Risikofrei:
     Domains, Umgebungsvariablen und Deploy-Verlauf hängen an der Projekt-ID,
     nicht am Namen.
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
   - Im eigenen Projektverzeichnis (Notion o. ä.) den Lead als gewonnen und das
     Projekt als Kundenprojekt kennzeichnen. Wie die Felder dort genau heißen,
     weiß nur das jeweilige Verzeichnis – hier nicht aus dem Gedächtnis nennen.
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

   **Die Werte NICHT aus dieser Tabelle abschreiben.** Der Versanddienst zeigt
   nach dem Anlegen der Unterdomain seine eigene Liste an – **die** ist die
   Quelle, sie ist kontobezogen und kann sich ändern. Die Tabelle hier sagt nur,
   **wie viele** Einträge zu erwarten sind und **wofür** jeder da ist, damit
   niemand einen übersieht:

   | Typ | wofür | typische Form des Namens |
   | --- | --- | --- |
   | TXT | Signatur der Mails (DKIM) | ein Schlüsselname vor der Versand-Unterdomain |
   | MX  | Empfang für den Versanddienst | ein eigener Name unter der Versand-Unterdomain |
   | TXT | Absender-Berechtigung (SPF) | derselbe Name wie der MX, Wert beginnt mit `v=spf1`, endet mit `~all` |

   *(Zwei Fallen bei der Eingabe: Manche Anbieter hängen die Domain selbst an –
   dann darf im Formular nur der vordere Teil stehen, nicht der volle Name. Und
   der SPF-Wert endet auf `~all`, nicht `-all`; siehe Warnung unten.)*

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

   **Und die Bestätigung an den Absender einrichten – sie geht sonst nackt raus.**
   Jeder, der das Formular ausfüllt, bekommt eine Mail zurück; das ist die
   einzige Nachricht vom Betrieb, bevor jemand persönlich antwortet.

   1. `npm run maillogo` – erzeugt aus **derselben** Logo-Datei, die die
      Fußzeile zeigt, eine PNG-Fassung in doppelter Größe
      (`public/logo-mail.png`). Ein SVG zeigen Gmail und Outlook nicht an, und
      ein von Hand exportiertes PNG läuft beim nächsten Logo-Wechsel weg.
      Nach einem Build laufen lassen: Dann nimmt es die Schriftfarbe, die auch
      die Website auf der Markenfarbe benutzt.
   2. In `content.config.ts` den `bestaetigung`-Block setzen:
      ```ts
      bestaetigung: {
        logo: 'logo-mail.png',
        betreff: 'Ihre Anfrage bei <Betriebsname>',   // aus SICHT DES ABSENDERS
        angabenWiederholen: false,                     // siehe unten
      },
      ```
   3. **`angabenWiederholen` ist eine Entscheidung PRO KUNDE.** `true` ist ein
      Service (der Absender sieht seinen Vertipper). `false` ist Pflicht,
      sobald die Anfragen inhaltlich heikel sind – bei einem Gesundheitsberuf
      gehören Anfrageinhalte nicht in ein unbestätigtes Postfach. Standard ist
      `false`. Beide Begründungen stehen ausführlich am Config-Feld.
   4. **Einmal wirklich absenden** und die Mail im Postfach ansehen – auch die
      Bestätigung, nicht nur die Benachrichtigung an den Betrieb.

   > ### ⚠ Wenn die Variable im Dashboard steht und die Funktion sie trotzdem nicht sieht
   >
   > **Beobachtet am 30.07.2026 an einer echten Kundenseite** – so und nicht
   > mehr: Beide Variablen standen im Dashboard, ein Skript las sie beim Bauen
   > einwandfrei, `/api/contact` sah sie als leer. Neu angelegt **ohne** das
   > Häkchen „Sensitive" → sofort `HTTP 200`.
   >
   > **Die Ursache ist damit NICHT bewiesen, und hier stand sie trotzdem als
   > Tatsache** („Sensitive erreicht den Build, aber nicht die Funktion").
   > Die Vercel-Dokumentation sagt das nicht: Dort heißt es nur, dass solche
   > Variablen im Dashboard verborgen sind und in Produktion und Vorschau zur
   > Verfügung stehen. Beim Neuanlegen wurde außerdem mehr als nur das Häkchen
   > verändert – jede der Ursachen unten passt genauso gut zur Beobachtung.
   >
   > **Wenn der Versand still tot ist, in dieser Reihenfolge prüfen:**
   >
   > 1. **Wurde nach dem Eintragen neu deployt?** Umgebungsvariablen greifen
   >    für eine Bereitstellung, die es schon gibt, nicht rückwirkend. Das ist
   >    die häufigste Ursache und die, die am plausibelsten hinter der
   >    Beobachtung oben steckt.
   > 2. **Stimmt die Umgebung?** Eine nur für „Production" hinterlegte Variable
   >    fehlt in jeder Vorschau-Bereitstellung – und getestet wird meist an
   >    einer Vorschau.
   > 3. **Stimmt die Schreibweise exakt**, einschließlich Groß-/Kleinschreibung?
   > 4. **Erst dann**: einmal ohne „Sensitive" neu anlegen und erneut deployen.
   >    Hilft es, ist der Zusammenhang für diesen Fall belegt – dann gehört er
   >    als Motor-Meldung zurück, mit dem Beleg.
   >
   > Der Motor schreibt bei diesem Fehler eine Protokollzeile mit genau dieser
   > Liste – sonst sucht man den Fehler nie an der richtigen Stelle.

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
   - In den Einstellungen des Repos beim Hoster die Berechtigung für
     automatische Abläufe auf **Lesen UND Schreiben** stellen. (Kein Klickpfad
     – der Menüaufbau ändert sich, und eine falsche Klickanleitung ist teurer
     als gar keine, siehe Regel oben. In der Suche der Repo-Einstellungen nach
     „workflow" suchen.) Ohne Schreibrecht kann die Sicherung Inhalte holen,
     aber nicht einchecken – und genau das ist ihr Zweck.
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
