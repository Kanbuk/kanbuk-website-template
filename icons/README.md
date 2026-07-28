# Bildzeichen (Icons)

Hier liegt die **komplette Lucide-Bibliothek**: 2007 Symbole, fest im Projekt.

## Wozu

Ein Design aus Claude Design benutzt Symbole **beim Namen** – „gauge",
„car-front", „phone". Damit die auf der Website genauso aussehen wie im Design,
liegt die ganze Bibliothek hier. Wer die Seite baut, schreibt einfach:

```astro
<Symbol name="car-front" />
```

und das Zeichen ist da. **Niemand muss ein Symbol selbst zeichnen** – genau das
ist einmal passiert, und danach sah die ganze Seite fremd aus.

## Was hier nicht passiert

Diese Dateien gehen **nicht** mit auf die Website. Sie sind ein Vorrat: In die
fertige Seite kommt nur, was wirklich verwendet wird. `npm run check` zählt
nach und nennt die Zahl.

## Wenn Sie hier etwas ändern wollen

**Nichts von Hand bearbeiten.** Die Datei `lucide.json` wird erzeugt. Zum
Auffrischen (nur nötig, wenn die Bibliothek eine neue Version bekommen soll):

```
npm run icons
```

Die Version steht in `package.json` unter `iconBibliothek` – sie ist mit
Absicht festgeschrieben, damit die Seite in zwei Jahren nicht plötzlich anders
aussieht.

## Dateien

| Datei | Was das ist |
| --- | --- |
| `lucide.json` | die 2007 Symbole |
| `lucide.LICENSE` | die Lizenz (ISC). Muss mit dabei sein. |
