# Projekt: Athen-Kompass

## Worum es geht
Athen-Kompass ist ein persönlicher Reiseplaner für eine Athen-Reise (Ende Oktober / November 2026), gebaut als Web-App im Handy-Design und veröffentlicht über GitHub Pages.

- Repo: j4kobif/athen-kompass (öffentlich)
- Live: https://j4kobif.github.io/athen-kompass/
- Zusätzlich gibt es eine Vorschau als Claude-Artifact „Athen-Kompass“

## Regeln für Änderungen
- Jede Änderung auf einem eigenen Branch mit Pull Request, nie direkt auf `main` pushen. Gemergt wird vom Besitzer selbst.
- Nach jeder Änderung an `src/` einmal `python3 build.py` ausführen und die erzeugte `index.html` mit committen.
- Danach das Artifact „Athen-Kompass“ mit `dist/fragment.html` aktualisieren und die URL behalten.
- **Diese Datei aktuell halten:** Wenn eine Änderung Funktionen, Aufbau, Regeln oder Datenstand betrifft, `CLAUDE.md` im selben Pull Request mit anpassen.
- App und Antworten auf Deutsch.
- Preise, Öffnungszeiten und Events vorher im Web recherchieren, nicht aus dem Gedächtnis. Unsichere Angaben als Schätzung markieren („≈“, „ca.“) oder auf die Quelle verlinken („Preis prüfen“).

## Inhaltliche Leitlinien
- Essen: Schwerpunkt auf vegetarischen und veganen Lokalen und Gerichten. Die Option „laktosefrei“ bleibt erhalten, Milchprodukte werden gekennzeichnet.
- Eintritt: EU-Bürger unter 25 haben in staatlichen Stätten freien Eintritt. Das wird in der App hervorgehoben.
- Budgetbewusst: Gratis-Tage, günstige Alternativen und Preisrichtwerte gegen Abzocke zeigen.

## Aufbau des Codes
```
src/shell.html   Markup, CSS, SVG-Icons (Bottom-Tab-Leiste, Einstellungs-Sheet)
src/data.js      Küchen-Kategorien (KUECHE), Orte (ITEMS), Events (EVENTS), Gerichte (DISHES), Sprachhilfe, Metrostationen
src/app.js       Grundlogik: Filter, schematische Karte, Routing (Fuß/Öffis/Auto), Tabs, Standort
src/features.js  Öffnungszeiten (HOURS), Auslastungsmodell, Tagesvorschlag, gespeicherte Routen, Kopieren/WhatsApp
src/init.js      Start der App und Beispielplan
build.py         baut index.html (GitHub Pages, mit Manifest und Icons) und dist/fragment.html (Artifact)
```
- Kein Framework, alles landet in einer HTML-Datei.
- Gespeichert wird im `localStorage` (Schlüssel `athen-kompass-v1`): Reisedaten, Plan, Routen, Einstellungen. Der Standort wird nicht gespeichert.
- Ort hinzufügen: Eintrag in `ITEMS` in `src/data.js` (id, Kategorie, Koordinaten, drinnen/draußen, Dauer, Preis). Restaurants und Cafés brauchen zusätzlich `k` (Küchen-Kategorien aus `KUECHE`, z. B. `["fruehstueck","griechisch"]`) und `diet` (veg/vegan/lf). Öffnungszeiten optional in `HOURS` in `src/features.js` eintragen, mit `v:1` für geprüfte und `v:0` für ungefähre Zeiten. Neue Sehenswürdigkeiten bei Bedarf in `PRIO` und `KIND_OVR` (features.js) einordnen.
- Küchen-Kategorien: Frühstück & Brunch, Griechisch & Taverne, Street Food & Imbiss, Asiatisch, Italienisch & Pizza, Orientalisch, International & Bowls, Süßes & Bäckerei, Kaffee, Fine Dining, dazu der berechnete Filter „100 % vegan“.

## Funktionen (Stand: PR #1–#5)
- Tab-Leiste unten: Entdecken, Events, Essen, Plan, Praktisch. Dunkles App-Design mit mint-grünem aktivem Tab, Hell-Modus nach Systemeinstellung.
- Reisezeitraum wählbar und dauerhaft gespeichert. Filter: vegetarisch, vegan, laktosefrei, Regentag (Drinnen-Ziele zuerst, Alternativen).
- Entdecken: Startseite mit Countdown, Suche, Kategorien, Liste oder Karte. Jede Karte zeigt Preis, Aufenthaltsdauer („vor Ort“), Öffnungszeiten, „jetzt geöffnet“, beste Uhrzeit und beste Tage nach Auslastung.
- Standort: Wegzeit zu Fuß, mit Öffis und mit dem Auto, Sortierung nach Nähe, Route ab Standort, Unterkunft speicherbar.
- Essen: Küchen-Filter (Chips mit Anzahl) über Restaurants und Cafés, Küchen-Badges auf den Karten, nach Nähe sortiert, wenn der Standort aktiv ist. In Entdecken erscheint die Küchen-Leiste, sobald Restaurant oder Café gewählt ist.
- Events: Feiertage, Gratis-Tage und Konzerte im Zeitraum.
- Plan › Tripliste: „Route berechnen“ oben, Tage einklappbar, optimierte Route, Orte auf dem Weg, Google-Maps-Links.
- Plan › Tagesvorschlag: Zeitplan aus Startzeit, Dauer, Tempo, Interessen, Pausen (Frühstück, Mittag, Kaffee, Abendessen) und Events, berücksichtigt Sonnenuntergang und Öffnungszeiten.
- Plan › Routen: als Favoriten speichern, bearbeiten, kopieren, per WhatsApp teilen.
- Praktisch: Öffi-Tickets, Preisrichtwerte, Sicherheit, Bräuche, Apps.

## Datenstand
Preise, Öffnungszeiten und Events recherchiert im Oktober 2026. Rund 125 Orte, davon 30 Restaurants und 23 Cafés. Öffnungszeiten von Cafés und Bäckereien stammen meist aus Guides und sind als „ca.“ markiert.

## Offene Ideen
- Weitere Events für die genauen Reisetage recherchieren, sobald die Daten feststehen.
- Öffnungszeiten der Restaurants ergänzen (bisher meist nur ein Link zu Google Maps).
- Mehr asiatische und italienische Lokale mit klar vegetarischem Angebot.
