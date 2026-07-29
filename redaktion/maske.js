/**
 * ERZEUGT von `npm run maske` – NICHT von Hand ändern.
 *
 * Die Feldliste steht in redaktion/felder.mjs. Ein Feld dort ergänzen, dieses
 * Skript laufen lassen, im Studio veröffentlichen – fertig. Wer stattdessen
 * hier ändert, hat beim nächsten Lauf nichts mehr davon, und die Abfrage weiß
 * von dem Feld ohnehin nichts.
 *
 * Stand der Feldliste: 31 Felder in 3 Dokumenten.
 */
export const schemaTypes = [
  {
    name: "betrieb",
    title: "Betriebsdaten",
    type: "document",
    fields: [
      {
        name: "telefon",
        title: "Telefonnummer",
        description: "International: +43 1 2345678",
        type: "string"
      },
      {
        name: "email",
        title: "E-Mail-Adresse",
        type: "string"
      },
      {
        name: "claim",
        title: "Slogan",
        description: "Ein kurzer Satz unter dem Namen.",
        type: "string"
      },
      {
        name: "kurzbeschreibung",
        title: "Kurzbeschreibung",
        description: "1–2 Sätze. Erscheint auch in der Google-Ergebnisliste.",
        type: "text",
        rows: 5
      },
      {
        name: "strasse",
        title: "Straße und Hausnummer",
        type: "string"
      },
      {
        name: "plz",
        title: "Postleitzahl",
        type: "string"
      },
      {
        name: "ort",
        title: "Ort",
        type: "string"
      },
      {
        name: "oeffnungszeiten",
        title: "Öffnungszeiten",
        description: "Eine Zeile je Tag oder Tagesgruppe.",
        type: "array",
        of: [
          {
            type: "object",
            fields: [
              {
                name: "tag",
                title: "Tag",
                type: "string",
                description: "z. B. Mo–Fr oder Samstag"
              },
              {
                name: "zeit",
                title: "Zeit",
                type: "string",
                description: "z. B. 08:00–18:00 oder geschlossen"
              },
              {
                name: "tageISO",
                title: "Für Google: Tageskürzel",
                type: "array",
                of: [
                  {
                    type: "string"
                  }
                ],
                description: "Mo Tu We Th Fr Sa Su"
              },
              {
                name: "vonISO",
                title: "Für Google: von",
                type: "string",
                description: "z. B. 08:00"
              },
              {
                name: "bisISO",
                title: "Für Google: bis",
                type: "string",
                description: "z. B. 18:00"
              }
            ]
          }
        ]
      },
      {
        name: "sonderzeiten",
        title: "Feiertage und Betriebsurlaub",
        description: "Abweichungen vom Wochenrhythmus. Werden auch an Google gemeldet.",
        type: "array",
        of: [
          {
            type: "object",
            fields: [
              {
                name: "anlass",
                title: "Anlass",
                type: "string",
                description: "z. B. Weihnachten, Betriebsurlaub"
              },
              {
                name: "datum",
                title: "Einzelner Tag",
                type: "string",
                description: "JJJJ-MM-TT"
              },
              {
                name: "von",
                title: "Zeitraum von",
                type: "string",
                description: "JJJJ-MM-TT"
              },
              {
                name: "bis",
                title: "Zeitraum bis",
                type: "string",
                description: "JJJJ-MM-TT, einschließlich"
              },
              {
                name: "zeit",
                title: "Zeit",
                type: "string",
                description: "z. B. geschlossen oder 09:00–15:00"
              },
              {
                name: "vonISO",
                title: "Für Google: von",
                type: "string"
              },
              {
                name: "bisISO",
                title: "Für Google: bis",
                type: "string"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "impressum",
    title: "Impressum",
    type: "document",
    fields: [
      {
        name: "firmenwortlaut",
        title: "Firmenwortlaut",
        description: "Genau wie im Firmenbuch.",
        type: "string"
      },
      {
        name: "rechtsform",
        title: "Rechtsform",
        description: "z. B. Einzelunternehmen, GmbH",
        type: "string"
      },
      {
        name: "adresse",
        title: "Anschrift laut Firmenbuch",
        type: "string"
      },
      {
        name: "uid",
        title: "UID-Nummer",
        description: "z. B. ATU12345678",
        type: "string"
      },
      {
        name: "firmenbuchnummer",
        title: "Firmenbuchnummer",
        type: "string"
      },
      {
        name: "firmenbuchgericht",
        title: "Firmenbuchgericht",
        type: "string"
      },
      {
        name: "gewerbe",
        title: "Gewerbeberechtigung",
        type: "string"
      },
      {
        name: "aufsichtsbehoerde",
        title: "Aufsichtsbehörde",
        type: "string"
      },
      {
        name: "unternehmensgegenstand",
        title: "Unternehmensgegenstand",
        description: "Was der Betrieb tut – Pflichtangabe nach § 25 Mediengesetz.",
        type: "string"
      }
    ]
  },
  {
    name: "eintrag",
    title: "Katalog-Eintrag",
    type: "document",
    fields: [
      {
        name: "id",
        title: "Kennung",
        description: "Wird zur Internetadresse. Nach dem Live-Gang NICHT mehr ändern – sonst ist der Google-Treffer tot.",
        type: "string",
        validation: Rule => Rule.required()
      },
      {
        name: "titel",
        title: "Titel",
        type: "string",
        validation: Rule => Rule.required()
      },
      {
        name: "kurz",
        title: "Ein Satz für die Übersicht",
        type: "string"
      },
      {
        name: "beschreibung",
        title: "Beschreibung",
        description: "Absätze mit einer Leerzeile trennen.",
        type: "text",
        rows: 5
      },
      {
        name: "preis",
        title: "Preis",
        description: "Nur die Zahl, ohne €. Leer lassen = „auf Anfrage\".",
        type: "number"
      },
      {
        name: "preisHinweis",
        title: "Zusatz beim Preis",
        description: "z. B. inkl. USt.",
        type: "string"
      },
      {
        name: "bilder",
        title: "Fotos",
        description: "Das erste Foto ist das Hauptbild.",
        type: "array",
        of: [
          {
            type: "image"
          }
        ],
        options: {
          layout: "grid"
        }
      },
      {
        name: "bildAlt",
        title: "Bildbeschreibungen",
        description: "Für Blinde und für Google. Gleiche Reihenfolge wie die Fotos.",
        type: "array",
        of: [
          {
            type: "string"
          }
        ]
      },
      {
        name: "merkmale",
        title: "Merkmalstabelle",
        type: "array",
        of: [
          {
            type: "object",
            fields: [
              {
                name: "name",
                title: "Bezeichnung",
                type: "string"
              },
              {
                name: "wert",
                title: "Wert",
                type: "string"
              }
            ]
          }
        ]
      },
      {
        name: "verfuegbar",
        title: "Verfügbar",
        description: "Aus = raus aus der Liste. Die Seite bleibt erreichbar, damit alte Google-Treffer nicht ins Leere laufen.",
        type: "boolean",
        initialValue: true
      },
      {
        name: "statusText",
        title: "Hinweis statt Preis",
        description: "z. B. bereits verkauft",
        type: "string"
      },
      {
        name: "filter",
        title: "Merkmale zum Filtern",
        type: "array",
        of: [
          {
            type: "object",
            fields: [
              {
                name: "schluessel",
                title: "Merkmal",
                type: "string",
                options: {
                  list: [
                    {
                      title: "Art",
                      value: "art"
                    },
                    {
                      title: "Farbe",
                      value: "farbe"
                    },
                    {
                      title: "Blau",
                      value: "blau"
                    },
                    {
                      title: "Grün",
                      value: "gruen"
                    },
                    {
                      title: "Preis",
                      value: "preis"
                    },
                    {
                      title: "Baujahr",
                      value: "baujahr"
                    }
                  ]
                }
              },
              {
                name: "wert",
                title: "Wert",
                type: "string"
              }
            ]
          }
        ]
      },
      {
        name: "zahlen",
        title: "Merkmale zum Sortieren",
        type: "array",
        of: [
          {
            type: "object",
            fields: [
              {
                name: "schluessel",
                title: "Merkmal",
                type: "string",
                options: {
                  list: [
                    {
                      title: "Art",
                      value: "art"
                    },
                    {
                      title: "Farbe",
                      value: "farbe"
                    },
                    {
                      title: "Blau",
                      value: "blau"
                    },
                    {
                      title: "Grün",
                      value: "gruen"
                    },
                    {
                      title: "Preis",
                      value: "preis"
                    },
                    {
                      title: "Baujahr",
                      value: "baujahr"
                    }
                  ]
                }
              },
              {
                name: "wert",
                title: "Wert",
                type: "string"
              }
            ]
          }
        ]
      }
    ]
  }
];

export default schemaTypes;
