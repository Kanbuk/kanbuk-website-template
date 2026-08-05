# VORLAGE: Umstelltag – Relaunch auf eine Adresse, die schon läuft

> **Diese Datei ist die Vorlage, nicht der Plan.**
>
> Beim Port in den Kundenordner kopieren (`UMSTELLTAG.md`), die `<…>`-Lücken
> füllen und die Häkchen am Umstelltag wirklich abarbeiten. Was hier steht, ist
> an einer echten Domainumstellung erprobt – die Reihenfolge ist der Inhalt.

**Wann dieser Plan gilt:** Der Betrieb hatte schon eine Website unter dieser
Adresse. Der Fall „Adresse ist frei" braucht ihn nicht (dann `/deploy` Weg B,
Schritt 6).

**Der teuerste Fehler ist nicht die Website, sondern die Geschäftspost.** Ein
angenommener Nameserver-Wechsel oder ein gelöschter MX-Eintrag nimmt dem
Betrieb die E-Mail – und das sieht niemand sofort. Der zweitteuerste: zuerst
die Adresse umhängen und damit eine noch gesperrte Vorschau unter der
Kundendomain veröffentlichen.

---

## Die eine Regel, die über allem steht

> **Erst umschalten und prüfen. DANN die Adresse umhängen.**

Nicht umgekehrt. Alles andere in diesem Plan ist Handwerk; das hier entscheidet,
ob der Umzug ein Umzug ist oder ein Ausfall.

---

## Beteiligte und Zugänge (vor dem Vorabend ausfüllen)

| | |
| --- | --- |
| Domain | `<domain>` |
| Domain-Anbieter (dort liegt die DNS-Zone) | `<anbieter>` |
| Wer kann dort Einträge ändern? | `<person / zugang>` |
| Läuft die Geschäftspost über dieselbe Domain? | `<ja / nein>` |
| Bisheriges Hosting (bleibt 4–6 Wochen an!) | `<hoster>` |
| Zugang zur Search Console der alten Domain | `<ja / nein / bei wem>` |
| Wunschtermin der Umstellung | `<datum, uhrzeit>` |
| Vercel-Projekt | `<projektname>` |
| Vorschau-Adresse zum Gegenprüfen | `<kunde>.kanbuk.com` |

---

## Am Vorabend

- [ ] **Komplette DNS-Zone exportieren** und als `dns-vorher-<datum>.txt` ins
      Repo legen. Das ist der Wiederherstellungspunkt.

      **Exportieren, nicht von außen abfragen.** Eine Abfrage zeigt, was gerade
      beantwortet wird; der Export zeigt, was eingetragen ist. Bei einer echten
      Umstellung: Abfrage sieben Einträge, Export acht – es fehlte ein
      `imap.`-Eintrag, ohne den kein Mailprogramm mehr funktioniert, bei völlig
      unverändertem MX.

      Oben in die Datei zwei Sätze schreiben: was geändert wird und was
      ausdrücklich **nicht**.

- [ ] **Gültigkeitsdauer (TTL) der Web-Einträge auf 300 Sekunden senken.**
      Damit dauert ein Rückweg fünf Minuten statt Stunden.

      > Manche Anbieter-Masken bieten gar keine TTL-Einstellung an. Dann läuft
      > der Umzug ohne gesenkte Gültigkeitsdauer – der Rückweg verlängert sich
      > auf bis zu eine Stunde. **Das jetzt sagen, nicht am Morgen entdecken.**

- [ ] **Search-Console-Export der alten Domain ziehen** und ins Repo legen
      (`daten/search-console/`). Er zeigt, was Google wirklich ausliefert –
      mehr, als in der alten Sitemap steht. Und er ist der Ausgangsstand, ohne
      den vier Wochen später keine Aussage über gehaltene Sichtbarkeit möglich
      ist.

- [ ] **Weiterleitungen vollständig?** Alte Adressen aus Sitemap UND Export in
      `weiterleitungen` (CLAUDE.md 7b). Nicht vergessen:
      `{ von: '/sitemap_index.xml', nach: '/sitemap-index.xml' }` – WordPress
      mit Yoast nennt Google die Adresse mit **Unterstrich**.

---

## Am Umstelltag

### Schritt 1 – Umschalten (als Commit, nicht nur lokal)

- [ ] `mode: 'live'` in `content.config.ts`
- [ ] `domain` steht auf der echten Kundendomain
- [ ] **committen und pushen**

> **Warum ein Commit:** Ein nur lokal ausgelöstes Deploy hält bis zum nächsten
> Build. Danach – Redaktions-Sicherung, Textkorrektur, irgendein Push – baut der
> Hoster wieder aus dem Repo, und dort steht noch `demo`. Die Seite fällt dann
> lautlos in den Vorschau-Betrieb zurück, mit `noindex`, und niemand merkt es.

### Schritt 2 – Prüfen, solange die alte Seite noch läuft

- [ ] `npm run check -- --live` grün
- [ ] Deployen und auf der **Vorschau-Adresse** ansehen:
  - [ ] kein `noindex` (weder im Kopf der Seite noch als HTTP-Kopfzeile)
  - [ ] `robots.txt` gibt die Seite frei
  - [ ] `sitemap-index.xml` da und gefüllt
  - [ ] Canonical nennt die **Kundendomain**, nicht die Vorschau-Adresse
  - [ ] `npm run endpunkt` – der Formular-Empfänger lebt

### Schritt 3 – Die Adresse umhängen

- [ ] Nur die **Web-Einträge** ändern (A/AAAA/CNAME für die Domain selbst und
      für `www`), auf die Werte, die Vercel nennt.
- [ ] **Nichts löschen. Keinen Typ wechseln.**

> **Nicht anfassen:**
> alle MX-Einträge · SPF · DKIM-Schlüssel · DMARC · die Versand-Unterdomain des
> Formulars · `imap.` · `mail.` · `smtp.` · `ftp.` · alle Bestätigungszeilen
> (TXT), auch die, die nach nichts aussehen.

> **Zwei Angebote ausschlagen:**
> - Der Vorschlag, die **Nameserver** zu übernehmen: **nein**. Das nimmt dem
>   Betrieb die E-Mail.
> - Der Knopf **„Standardwerte wiederherstellen"** beim Domain-Anbieter: nie.
>   Er löscht genau den Kasten darüber.

- [ ] **Keine eigene Weiterleitung „Kurzform → www" in `vercel.json`.** Der
      Hoster kennt dieselbe Weiterleitung als Einstellung an der Domain. Zwei
      Mechanismen für dieselbe Sache sind kein doppelter Boden: Zeigen sie in
      verschiedene Richtungen, ist es eine Endlosschleife und die Seite ist
      vollständig weg.

### Schritt 4 – Warten und gegenprüfen

- [ ] Zertifikat ausgestellt (der Hoster zeigt das an)
- [ ] **An den Zwischenspeichern vorbei prüfen.** Der eigene Rechner kennt die
      alte Adresse noch bis zu eine Stunde. Wer normal im Browser nachsieht,
      liest den Titel der ALTEN Seite und hält den Umzug für gescheitert.
- [ ] Drei bis fünf **alte Adressen** von Hand aufrufen und sehen, wo sie
      landen. Dass ein Eintrag in `weiterleitungen` steht, heißt nicht, dass er
      trifft.

      > **Zwei Sprünge bei Adressen mit Schrägstrich am Ende sind normal** und
      > kein Fehler: Die Normalisierung des Hosters läuft vor den
      > Weiterleitungen. Beide Sprünge sind dauerhaft, das Ranking vererbt sich.

- [ ] **Echte Testanfrage über das Formular** – und die Mail im Postfach
      ansehen, nicht nur den Statuscode.

### Schritt 5 – Aufräumen

- [ ] Abnahme-Vorschau `<kunde>.kanbuk.com` **auf die Kundendomain weiterleiten**
      (nicht entfernen – der verschickte Abnahme-Link bleibt sonst tot; und die
      noindex-Sperre hängt am `mode`, nicht an der Adresse: ab „live" stünde
      derselbe Inhalt sonst zweimal offen im Netz).
- [ ] **Firewall-Regel** auf `/api/contact` setzen (siehe `/deploy`-Skill,
      Weg B, Schritt 9).
- [ ] Neue Sitemap in der Search Console einreichen, alte entfernen.
- [ ] TTL wieder anheben.

---

## Der Rückweg

Zwei Voraussetzungen, sonst gibt es ihn nicht:

1. **Das alte Hosting läuft 4–6 Wochen weiter.** Nicht kündigen, nicht löschen.
2. **Die alte Seite muss verschlüsselt erreichbar sein.** Die neue Seite gibt
   eine Zwei-Jahres-Zusage auf verschlüsselte Verbindungen (HSTS) ab; Browser,
   die einmal dort waren, verweigern danach eine unverschlüsselte Verbindung.

Der Weg selbst: die exportierten Web-Einträge aus `dns-vorher-<datum>.txt`
zurückschreiben. Bei TTL 300 dauert das fünf Minuten.

---

## In den vier Wochen danach

- [ ] Den **404-Bericht** der Search Console mitlesen. Dort tauchen die alten
      Adressen auf, an die vorher niemand gedacht hat – jede davon ist eine
      fehlende Zeile in `weiterleitungen`.
- [ ] Nach vier Wochen die Zahlen gegen den Ausgangsstand halten. Ohne die
      Vorher-Zahlen aus dem Export ist jede Aussage über gehaltene Sichtbarkeit
      geraten.
- [ ] Erst dann das alte Hosting abschalten.
