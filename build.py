#!/usr/bin/env python3
"""Baut aus src/ zwei Dateien:
- index.html            eigenständige Seite für GitHub Pages (mit <head>, Manifest, Icons)
- dist/fragment.html    gleiche App ohne <html>/<head>-Gerüst (für Claude-Artifacts)
"""
from pathlib import Path
import hashlib

root = Path(__file__).parent
shell = (root / "src/shell.html").read_text(encoding="utf-8")
script = "\n".join((root / f"src/{n}.js").read_text(encoding="utf-8") for n in ("data", "app", "features", "diary", "init"))

fragment = f"{shell}\n<script>\n{script}\n</script>\n"
(root / "dist").mkdir(exist_ok=True)
(root / "dist/fragment.html").write_text(fragment, encoding="utf-8")

# Für die eigenständige Seite: Artifact-spezifische Meta entfernen, echtes Dokument drumherum bauen
body = fragment.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', "")
title_end = body.index("</title>") + len("</title>")
title, rest = body[:title_end], body[title_end:]
head_extra = """
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Persönlicher Reiseplaner für Athen: Sehenswürdigkeiten, vegane und vegetarische Lokale, Events, Preise und Routen.">
<meta name="theme-color" content="#0B0E10" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#F2F4F3" media="(prefers-color-scheme: light)">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Athen-Kompass">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icon-180.png">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
"""
# <link>/<style> aus dem Fragment gehören in den <head>
style_end = rest.index("</style>") + len("</style>")
head_part, body_part = rest[:style_end], rest[style_end:]
index = f"<!doctype html>\n<html lang=\"de\">\n<head>{head_extra}{title}{head_part}\n</head>\n<body>{body_part}</body>\n</html>\n"
# Service Worker nur für die GitHub-Pages-Version (im Artifact nicht möglich)
SW_REGISTER = """<script>
if("serviceWorker" in navigator&&(location.protocol==="https:"||location.hostname==="localhost")){window.addEventListener("load",function(){
  var first=!navigator.serviceWorker.controller;
  navigator.serviceWorker.register("sw.js").then(function(){return navigator.serviceWorker.ready;}).then(function(reg){
    var urls=performance.getEntriesByType("resource").map(function(e){return e.name;}).filter(function(u){return /fonts\\.(googleapis|gstatic)\\.com/.test(u);});
    if(reg.active)reg.active.postMessage({type:"cache-urls",urls:urls});
    if(first){try{if(!localStorage.getItem("ak-offline-ok")){localStorage.setItem("ak-offline-ok","1");toast("Offline gespeichert – die App funktioniert jetzt auch im Flugmodus");}}catch(e){}}
  }).catch(function(){});
});}
</script>
"""
index = index.replace("</body>", SW_REGISTER + "</body>")
(root / "index.html").write_text(index, encoding="utf-8")

assets = index.encode() + b"".join((root / f).read_bytes() for f in ("manifest.webmanifest", "icon.svg", "icon-180.png", "icon-192.png", "icon-512.png"))
version = hashlib.sha256(assets).hexdigest()[:12]
sw = (root / "src/sw.js").read_text(encoding="utf-8").replace("__VERSION__", version)
(root / "sw.js").write_text(sw, encoding="utf-8")
print("index.html", len(index), "| dist/fragment.html", len(fragment), "| sw.js", version)
