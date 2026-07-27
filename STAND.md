# STAND – das Gedächtnis dieses Projekts

> **Für Claude Code:** Diese Datei ZUERST lesen, bei JEDER Arbeit an diesem Projekt
> aktuell halten (Pflicht, siehe CLAUDE.md). Sie ist das einzige Gedächtnis über
> Chat-Grenzen hinweg – ein Bericht im Chat ist nach dem Chat weg, diese Datei nicht.
>
> **Für Menschen:** Hier steht immer, wo dieses Projekt gerade steht und was noch
> fehlt. Einfach öffnen und lesen – oder Claude Code fragen: „Wie ist der Stand?"

---

## Projekt

| | |
| --- | --- |
| **Kunde** | – (noch Referenz-Template) |
| **Phase** | Vorlage – noch kein Kundenprojekt |
| **Design-Quelle** | – (Claude-Design-Link hier eintragen) |
| **Vorschau-URL** | – |
| **Live-Domain** | – |
| **Motor-Stand** | siehe `package.json → version` *(bei jeder Änderung dort hochgezogen; ein Klon erbt den Stand seines Klon-Zeitpunkts)* |

Phasen: `Vorlage → Portiert (Vorschau) → Beim Kunden vorgestellt → Gebucht → Live`

## Lücken-Inventar (vor dem Live-Gang zu erledigen)

<!-- Beim Port füllt Claude Code diese Liste. Erledigtes abhaken [x], nie löschen. -->

- [ ] *(wird beim Port gefüllt – z. B.: „hero.jpg ist ein Stock-Platzhalter, echtes Foto nötig")*

## Getroffene Entscheidungen

<!-- Improvisationen und Abweichungen vom Design, mit kurzer Begründung. -->

- *(wird beim Port gefüllt)*

## Motor-Meldungen (fürs Master-Template)

<!-- PFLICHT bei Motor-Schwächen (Bug, irreführende Doku, fehlendes Rezept), die
     JEDEN frischen Klon beträfen: Was, Datei, warum allgemein, ggf. Fix-Commit.
     Details: CLAUDE.md Abschnitt 0 → „Motor-Meldung". Der Inhaber trägt diese
     Punkte ins Master-Template zurück – NICHT selbst am Template arbeiten. -->

- *(keine)*

## Vorgemerkt: Sanity-Anschluss (noch NICHT gebaut)

Recherchiert und entworfen am 2026-07-27, bewusst **nicht umgesetzt**. Auslöser
zum Bauen: sobald ein **zweiter** Kunde eine Liste pflegt, die sich **wöchentlich
oder öfter** ändert **und Bilder enthält** (Fahrzeugbestand, Immobilien, Blog,
Kursplan). Bis dahin gilt: Kunde schickt die Änderung, ein Chat pflegt sie ein.

**Warum nicht jetzt** (Zahlen aus der Recherche):
- Einrichtung ~3,5 h pro Kunde, Chat-Pflege ~8 min pro Änderung →
  Break-even bei ~26 Änderungen. Ein Beisl ändert 2–4× im Jahr.
- Sanity Free kennt nur „Administrator" oder „Nur-Lesen" – der Kunde bekäme
  Löschrechte auf seine Inhalte. Die Rolle „darf nur bearbeiten" kostet
  ~165 €/Jahr pro Kunde.
- Drei Hauptversionen in elf Monaten. Das widerspricht dem Klon-Gedanken
  (ein Klon von heute muss in fünf Jahren noch bauen).

**Der Entwurf, falls es so weit ist** – Kernsatz: *Sanity wird nie zur Bauzeit
von Astro angefragt. Sanity schreibt Dateien, der Motor baut aus Dateien* –
genau das Muster, das `npm run preisliste` schon hat.
- Ein Vorlauf-Skript (`inhalt-holen`) holt die Daten, prüft sie gegen das
  Motor-Schema, lädt Bilder nach `fotos/` und schreibt `daten/inhalt.ts` plus
  einen Schnappschuss ins Repo. Danach baut Astro komplett offline.
- Der Schnappschuss ist die Versicherung: Die Seite bleibt baubar, auch wenn
  das Sanity-Projekt Jahre später gelöscht ist.
- Bilder dürfen NIE vom Sanity-CDN kommen (fremder Server beim Besucher →
  das Prüf-Tor blockt es zu Recht, und die Seite wäre nicht mehr cookiefrei).
- In Sanity gehören nur: Preisliste, Öffnungszeiten, Team, Galerie, Aktuelles.
  Niemals: Rechtstexte, SEO-Titel, Design-Tokens, Formulare.
- Im Standard-Klon existiert davon **nichts** – kein Paket, kein Code, keine
  Verzweigung. Nur ein Rezept, das liest, wer es braucht.

## Verlauf

- **2026-07-27** – **Motor-Vollprüfung umgesetzt.** 73 Prüfer hatten den Motor auf
  SEO, Sicherheit, Responsiveness, Recht, Vollständigkeit, Prüf-Tor-Qualität und
  Wartbarkeit untersucht; 63 Befunde wurden gegengeprüft bestätigt. In vier Blöcken
  abgearbeitet:
  - **Recht & Prüf-Tor:** Impressum/Datenschutz sind jetzt Pflicht (waren die
    EINZIGEN Seiten ohne Kontrolle), Platzhalter und Musterdaten werden im fertigen
    HTML gesucht, tote interne Links und Weiterleitungsziele fallen auf,
    Kartenlizenz wird erzwungen.
  - **Verkauf:** Das WhatsApp-Vorschaubild funktioniert (zeigte auf eine Domain,
    die es noch nicht gab – Leads sahen eine graue Zeile).
  - **Sicherheit:** 0 statt 4 hohe Lücken (sharp, svgo, Astro 5→7), Formular mit
    fünf Schranken gegen Missbrauch, Clickjacking-Schutz, JSON-LD maskiert.
  - **Bausteine:** Kopf/Fuß mit funktionierender Handy-Navigation (jeder Klon baute
    ~150 Zeilen von Hand nach), Öffnungszeiten mit Feiertagen/Betriebsurlaub,
    „Jetzt geöffnet"-Anzeige, Team/FAQ/Referenzen/Stellen als Datenmodelle,
    Formularfelder für Mehrfachauswahl und Zustimmung, Danke-Seite.
  - **Blinde Prüfungen geschärft:** Das Prüf-Tor las kein JavaScript und 80 % des
    CSS nicht; Kontrast wurde an zwei Config-Werten statt am echten Text gerechnet;
    die Filter-Prüfung war ein Zirkelschluss. Alles behoben und je einmal
    absichtlich zum Anschlagen gebracht.
  - **Zweisprachigkeit** funktioniert jetzt (war eine Sackgasse: englische Seiten
    hätten sich als deutsch ausgewiesen und auf die deutsche Fassung kanonisiert).

  Version 2026.7.27. Verifikation je Änderung: Positiv- und Negativprobe, dazu
  build/check/sicht/interaktion grün und ein live geschalteter Nachbau.

<!-- Eine Zeile pro Arbeitssitzung: Datum – was passiert ist. Neueste oben. -->

- **2026-07-21** – Signatur-Baustein (Kanbuk-Backlink) samt Anker-Rotation je Kunde
  und Prüf-Tor-Zwang (Marken-Anker, kein nofollow, keine Money-Keywords);
  Karten-Erzeuger um Stile hell/dunkel/dezent + Retina + echte Standort-Nadel
  erweitert, 2-Klick-Google-Maps als Rezept; Sichtprüfung erkennt jetzt
  hochskalierte (verpixelte) Bilder; toter EU-Streitbeilegungs-Link entfernt
  plus Prüf-Tor-Regel dagegen. **Wichtigster Fund: Der Ein-Rutsch-Grundsatz war
  seit dem Piloten nie eingelöst** – eine Erlaubnis-LISTE wird nie vollständig,
  jede neue Befehlsform fragte nach und unterbrach den Nutzer. Behoben mit
  permissions.defaultMode = 'auto' (Version 2026.7.21). Läuft: Komplett-Audit
  der Daylounge-Referenz (41 Befunde, Gegenprüfung offen).
- **2026-07-17** – Großer Ausbau-Tag: (1) Pilot-Rückfluss daylounge eingearbeitet
  (10 Motor-Fixes, 9 Beschleuniger, Version 2026.7.17). (2) Demo-Bote v2:
  Projekt-Archiv (Zip) als Standardweg, echte Mehrseiten-Demos, Bildfelder des
  Design-Editors stillgelegt, Marken-Domain demo-<kunde>.kanbuk.com automatisch
  (als Projekt-Domain, nie alias – Vercel-SSO-Falle). (3) Adress-Stufen-Konvention:
  demo-<kunde> → <kunde>.kanbuk.com → eigene Domain; Wildcard-DNS bei World4You
  eingerichtet. (4) Formular-Crash auf Vercel behoben (.js-Endungen in der
  Import-Kette, auch im Preislisten-Generator). (5) Toten EU-Streitbeilegungs-
  Link entfernt + Prüf-Tor-Regel. (6) Port-Regeln: Rechtsseiten mit Kopf/Fuß,
  SocialLinks nie als Buchstaben. Piloten: Phönixhof (4 Seiten) und The Epos
  (Onepager) als Demos live; **gemessene Demo-Zeit 2 min 26 s** (vorher 19 min
  über Standalone-Umweg).
