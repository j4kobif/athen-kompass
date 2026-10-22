# Athen-Kompass

Persönlicher Reiseplaner für Athen als Web-App: Sehenswürdigkeiten, vegetarische und vegane Lokale, Events im Reisezeitraum, Preise und Routenplanung.

**Live:** https://j4kobif.github.io/athen-kompass/

## Funktionen

- **Entdecken:** Sehenswürdigkeiten, Museen, Aussichtspunkte, Cafés, Restaurants, Bars, Aktivitäten und Tagesausflüge als Liste oder auf einer schematischen Karte mit den Metrolinien
- **Events & Termine:** Feiertage, Gratis-Eintrittstage und Veranstaltungen passend zum gewählten Zeitraum
- **Essen:** Typische griechische Gerichte mit Filtern für vegetarisch, vegan und laktosefrei, Lokale nach Küche filterbar (Frühstück, Griechisch, Street Food, Asiatisch, Italienisch, Orientalisch, Süßes, Kaffee …), dazu eine kleine Sprachhilfe
- **Plan › Tripliste:** Ziele pro Tag (einklappbar), Route automatisch optimiert oder in eigener Reihenfolge, zu Fuß, mit Öffis oder mit dem Auto, Ende offen, als Rundweg oder an einem Wunschort, Vorschläge für Orte auf dem Weg und Links zu Google Maps
- **Plan › Tagesvorschlag:** Tag, Startzeit, Dauer, Tempo, Interessen, Pausen und Events wählen – die App baut einen Zeitplan unter Berücksichtigung von Öffnungszeiten, Auslastung, Sonnenuntergang und Gratis-Tagen
- **Plan › Routen:** Routen als Favoriten speichern, später umbenennen, umsortieren, Stopps hinzufügen oder entfernen, optimieren, kopieren oder per WhatsApp teilen
- **Plan › Erlebt:** Reisetagebuch – abhaken, was du erlebt hast, eigene Sterne und Notizen, eigene Erlebnisse eintragen, als Text kopieren oder per WhatsApp teilen
- **Öffnungszeiten & Auslastung:** auf jeder Karte Öffnungszeiten (Winter/Sommer), Status „jetzt geöffnet“, beste Uhrzeit und beste Tage im Reisezeitraum
- **Praktisch:** Tickets und Öffis, Preisrichtwerte gegen Abzocke, Sicherheit, Bräuche und nützliche Apps
- **Regentag-Modus:** Drinnen-Ziele zuerst, Alternativen für Outdoor-Ziele
- **Standort:** Über den Zielscheiben-Button oben zeigt jede Karte die geschätzte Wegzeit zu Fuß, mit Öffis und mit dem Auto. Sortierung nach Nähe, „Am nächsten“-Tipp auf der Startseite und Route ab dem eigenen Standort. Der Standort wird nicht gespeichert.

Die Zeitangabe „ca. 1,5 h vor Ort“ ist die geschätzte Aufenthaltsdauer und fließt in die Tagesplanung ein.

Preise: Ein fester Preis ist recherchiert (Stand Oktober 2026), ein Preis mit ≈ ist eine Schätzung, „Preis prüfen“ verlinkt auf die Quelle.

Plan, Routen und Tagebuch werden im `localStorage` des Browsers gespeichert, also nur auf dem jeweiligen Gerät.

## Als App aufs Handy

iPhone: Seite in Safari öffnen → Teilen → „Zum Home-Bildschirm“.
Android: Chrome → Menü → „App installieren“.

## Aufbau

```
src/shell.html   Markup, Styles, Icons
src/data.js      Orte, Events, Gerichte, Metrostationen
src/app.js       Grundlogik: Filter, Karte, Routing, Rendering
src/features.js  Öffnungszeiten, Auslastung, Tagesvorschlag, gespeicherte Routen, Teilen
src/diary.js     Tagebuch: erlebt, Bewertungen, Notizen
src/init.js      Start der App
build.py         baut index.html (GitHub Pages) und dist/fragment.html
```

Nach Änderungen in `src/` einmal `python3 build.py` ausführen.
