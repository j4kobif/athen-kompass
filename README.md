# Athen-Kompass

Persönlicher Reiseplaner für Athen als Web-App: Sehenswürdigkeiten, vegetarische und vegane Lokale, Events im Reisezeitraum, Preise und Routenplanung.

**Live:** https://j4kobif.github.io/athen-kompass/

## Funktionen

- **Entdecken:** Sehenswürdigkeiten, Museen, Aussichtspunkte, Cafés, Restaurants, Bars, Aktivitäten und Tagesausflüge als Liste oder auf einer schematischen Karte mit den Metrolinien
- **Events & Termine:** Feiertage, Gratis-Eintrittstage und Veranstaltungen passend zum gewählten Zeitraum
- **Essen:** Typische griechische Gerichte mit Filtern für vegetarisch, vegan und laktosefrei, dazu eine kleine Sprachhilfe
- **Plan:** Tripliste mit Tageszuordnung, automatisch optimierte Route zu Fuß, mit Öffis oder mit dem Auto, Vorschläge für Orte auf dem Weg und Links zu Google Maps
- **Praktisch:** Tickets und Öffis, Preisrichtwerte gegen Abzocke, Sicherheit, Bräuche und nützliche Apps
- **Regentag-Modus:** Drinnen-Ziele zuerst, Alternativen für Outdoor-Ziele

Preise: Ein fester Preis ist recherchiert (Stand Oktober 2026), ein Preis mit ≈ ist eine Schätzung, „Preis prüfen“ verlinkt auf die Quelle.

Der Plan wird im `localStorage` des Browsers gespeichert.

## Als App aufs Handy

iPhone: Seite in Safari öffnen → Teilen → „Zum Home-Bildschirm“.
Android: Chrome → Menü → „App installieren“.

## Aufbau

```
src/shell.html   Markup, Styles, Icons
src/data.js      Orte, Events, Gerichte, Metrostationen
src/app.js       Logik (Filter, Routen, Rendering)
build.py         baut index.html (GitHub Pages) und dist/fragment.html
```

Nach Änderungen in `src/` einmal `python3 build.py` ausführen.
