# Anas Jabaly — Portfolio

Statische Website ohne notwendige Node-Abhängigkeiten.

## Lokal prüfen

```sh
python3 scripts/build.py
python3 -m http.server 8765 --directory dist
```

Der Build validiert lokale Links, Dateien, Anker und eindeutige IDs und kopiert ausschließlich öffentliche Dateien nach `dist/`. Die bestehende Bereitstellung aus dem Repository-Hauptverzeichnis bleibt möglich.

## Animationen

GSAP und ScrollTrigger 3.13.0 liegen lokal in `js/vendor/` (unverändert aus dem offiziellen npm-Paket `gsap@3.13.0`). Copyright- und Lizenzhinweise stehen in den Bibliotheken; Lizenz: https://gsap.com/standard-license/.

`js/script.js` steuert Fortschritt, Reveals, Skill-Staffelung, Hero-Hinweis und Timeline. Ab 1024 px Breite und 650 px Höhe bleibt die Projekt-Einleitung während der vier ausgewählten Projekte angeheftet; Projektvisuals erhalten dezente Parallax-/Scale-Effekte. Kleinere Ansichten verwenden den normalen Dokumentfluss. `gsap.matchMedia` räumt Animationen und Pinning beim Wechsel der Einstellungen auf. Bei `prefers-reduced-motion` bleiben alle Inhalte sichtbar; nur der direkte Lesefortschritt wird aktualisiert. Ohne JavaScript oder bei fehlender Animationsbibliothek bleibt die Website lesbar.

## Inhaltlicher Stand: Oktober 2026

- PP (Java & C), Oktober 2026 bis Februar 2027, separat von PI2.
- BVS1 seit Oktober 2026, 8 Stunden pro Woche; Betreuung bei der Entwicklung eines kleinen Lernbetriebssystems.
- PeerLearn: bestätigte Studienpreis-Einreichung und Posterwalk, keine behauptete Auszeichnung.
- Startseite: PeerLearn TH, Klausurtrainer, Fokus für YouTube, SWP/WAWI4.

## PSSO Modern

`produkte.html` stellt die Browser-Tools vor. `psso-modern.html` enthält Funktionen, Installationsanleitung, Datenverarbeitung und einen Link auf `downloads/psso-modern.user.js`. Ohne `download`-Attribut kann Tampermonkey den `.user.js`-Link als Installation erkennen. Falls der Browser keinen Installationsdialog öffnet, sind Kopieren und Datei-Download als Alternativen vorhanden. Der Build kopiert `downloads/` mit nach `dist/`.

Version 2.0.1 basiert auf dem bereitgestellten Script 2.0.0. Ergänzt wurden Autor, Homepage und Update-/Download-URLs; ein fehlender optionaler Summeneintrag wird beim Lesen toleriert. Das Script hat keine zusätzlichen Netzwerkanfragen, nutzt `@grant none` und läuft laut `@match` ausschließlich auf dem PSSO-Pfad der TH Köln. Es speichert nur das Farbschema im lokalen Speicher. Tampermonkey kann die hier veröffentlichte Datei auf Updates prüfen.

`psso-demo.html` führt denselben Code explizit auf fiktiven Beispielzeilen aus, ohne Anmeldung oder echte Studierendendaten. Die Demo wird nicht indexiert. Das WebP-Produktbild wird aus dieser Demo aufgenommen.

Offizielle Installationshinweise: https://www.tampermonkey.net/faq.php?locale=de&q=Q102 und https://www.tampermonkey.net/faq.php?locale=de&q=Q209. Das Projekt ist ein unabhängiges studentisches Angebot und kein offizielles TH-Köln-Produkt.
