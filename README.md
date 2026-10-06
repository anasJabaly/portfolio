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

`js/script.js` steuert Fortschritt, Reveals, Skill-Staffelung, Hero-Hinweis und Timeline. Ab 1024 px Breite und 650 px Höhe bleibt die Projekt-Einleitung während der drei ausgewählten Projekte angeheftet; Projektvisuals erhalten dezente Parallax-/Scale-Effekte. Kleinere Ansichten verwenden den normalen Dokumentfluss. `gsap.matchMedia` räumt Animationen und Pinning beim Wechsel der Einstellungen auf. Bei `prefers-reduced-motion` bleiben alle Inhalte sichtbar; nur der direkte Lesefortschritt wird aktualisiert. Ohne JavaScript oder bei fehlender Animationsbibliothek bleibt die Website lesbar.

## Inhaltlicher Stand: Oktober 2026

- PP (Java & C), Oktober 2026 bis Februar 2027, separat von PI2.
- Keine BVS1-Stelle eingetragen.
- PeerLearn: bestätigte Studienpreis-Einreichung und Posterwalk, keine behauptete Auszeichnung.
- Reihenfolge: PeerLearn TH, Fokus für YouTube, SWP/WAWI4, weitere Projekte.
