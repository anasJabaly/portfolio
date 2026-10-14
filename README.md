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

## PSSO Modern als Browser-Erweiterung

Die Manifest-V3-Erweiterung liegt in `extensions/psso-modern/`. Das Inhaltsscript wird nur auf `https://psso.th-koeln.de/qisserver/*` in einer isolierten Umgebung ausgeführt. Die einzige API-Berechtigung ist `storage`: gespeichert wird ausschließlich das Farbschema in `chrome.storage.local`, ohne Sync. Noten und eingeblendete Stammdaten werden lokal zur Darstellung verarbeitet; es gibt keine Netzwerkaufrufe oder externen Code.

`psso-modern.html` beschreibt das Produkt und zeigt vor der Store-Freigabe den tatsächlichen Veröffentlichungsstatus. `psso-datenschutz.html` ist die öffentliche Datenschutzseite. Die installierte Erweiterung enthält zusätzlich eine offline lesbare Datenschutzseite. Keine erfundene Store-ID und kein ZIP-Download als angebliche Ein-Klick-Installation.

`scripts/package-psso-extension.py` validiert Paketdateien und erstellt `downloads/psso-modern-extension.zip` mit dem Manifest direkt im ZIP-Stamm. Das ZIP ist das Store-Uploadpaket und zugleich öffentlich lesbarer Quellcode. Die Store-Grafiken und Beschreibung werden separat vorbereitet.

`psso-demo.html` verwendet dieselbe UI mit fiktiven Beispielzeilen. Die Web-Demo passt lediglich den Einstellungszugriff an Website-localStorage an. Sie ist keine Anmeldung und enthält keine echten Studierendendaten. Die frühere `.user.js`-Datei bleibt als Kompatibilitätsdatei für bereits bestehende Installationen erhalten; sie ist nicht der Installationsweg der neuen Erweiterung.

Nach Freigabe werden die Installationsstatus-Links auf die echte Chrome-Web-Store-ID umgestellt. Für lokale Entwicklung kann das entpackte ZIP über „Entpackte Erweiterung laden“ geprüft werden; dieser Entwicklerweg wird auf der Produktseite nicht als normale Installation angeboten.

Chrome Web Store: Version 1.0.0 am 14. Oktober 2026 zur Prüfung eingereicht, automatische Veröffentlichung nach Freigabe. Tatsächliche Artikel-ID: `fhddhachicfdeihdlefjjhapalklgkng`. Der Installationslink wird erst nach bestätigter öffentlicher Freigabe angezeigt.
