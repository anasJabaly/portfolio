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

`psso-modern.html` beschreibt das Produkt und verlinkt die veröffentlichte Chrome-Web-Store-Erweiterung. `psso-datenschutz.html` ist die öffentliche Datenschutzseite. Die installierte Erweiterung enthält zusätzlich eine offline lesbare Datenschutzseite. Keine erfundene Store-ID und kein ZIP-Download als angebliche Ein-Klick-Installation.

`scripts/package-psso-extension.py` validiert Paketdateien und erstellt `downloads/psso-modern-extension.zip` mit dem Manifest direkt im ZIP-Stamm. Das ZIP ist das Store-Uploadpaket und zugleich öffentlich lesbarer Quellcode. Die Store-Grafiken und Beschreibung werden separat vorbereitet.

`psso-demo.html` verwendet dieselbe UI mit fiktiven Beispielzeilen. Die Web-Demo passt lediglich den Einstellungszugriff an Website-localStorage an. Sie ist keine Anmeldung und enthält keine echten Studierendendaten. Die frühere `.user.js`-Datei bleibt als Kompatibilitätsdatei für bereits bestehende Installationen erhalten; sie ist nicht der Installationsweg der neuen Erweiterung.

Produktübersicht und Detailseite bieten den direkten Installationslink zur freigegebenen Erweiterung. Für lokale Entwicklung kann das entpackte ZIP über „Entpackte Erweiterung laden“ geprüft werden; dieser Entwicklerweg wird auf der Produktseite nicht als normale Installation angeboten.

Chrome Web Store: Version 1.0.0 am 15. Oktober 2026 öffentlich veröffentlicht und geprüft: https://chromewebstore.google.com/detail/psso-modern/fhddhachicfdeihdlefjjhapalklgkng. Artikel-ID: `fhddhachicfdeihdlefjjhapalklgkng`.

## PSSO Modern 1.1.0 · vorbereitetes Update

Zusätzlich zum bisherigen Notenspiegel gestaltet `portal.js` mit `portal.css` die angemeldete Startseite und die nativen Verwaltungs-, Menü- und Auswahlseiten um. Erkannt werden die am 20. Oktober 2026 lesend geprüften PSSO-Container `.content` und `.content_max_portal_qis`, die Seitennavigation `#makronavigation` und die Bereichsauswahl `.divlinks`.

Navigation, Originalformulare, versteckte Formularfelder, Links und Ereignisbehandlung werden nicht ersetzt oder in andere Formulare verschoben. Die Startkarten lösen lediglich den bereits vorhandenen Navigationslink aus. Passworteingaben und unbekannte Seitenlayouts bleiben unberührt. Die Originalansicht ist jederzeit erreichbar. Downtime- und andere vorhandene Meldungen bleiben sichtbar. Es bleiben dieselben Host-Matches und ausschließlich die Berechtigung `storage`; gespeichert wird weiterhin nur das Farbschema.

Die verschachtelte Prüfungs-Baumansicht (`ul.treelist`) wurde zusätzlich auf der echten Seite lesend geprüft. Modulname und vorhandene Statusangaben werden optisch getrennt; eine lokale Suche zeigt Treffer samt übergeordnetem Pfad. Sie durchsucht ausschließlich bereits geladene Einträge, lädt keine Zweige nach und führt keine Prüfungsaktionen aus. Die Originalansicht zeigt auch bei aktiver Suche alle geladenen Zeilen.

`review-portal.html` bietet lokale fiktive Start-, Formular-, Prüfungsbaum-, Tabellen- und Downloadansichten. Der Demo-Adapter wird ausschließlich von dieser Vorschauseite geladen und ist kein Inhaltsscript. Formularwerte und Auswahlzustände wurden beim Ansichtswechsel geprüft; die Darstellung wurde außerdem gegen eine anonymisierte Original-Startseite samt Original-Styles und bei 360 px Breite kontrolliert. Der bisherige Notenspiegel mit sechs Beispielmodulen und Suche ist geprüft. Der neue Code wurde im verfügbaren Browser nicht als installierte Erweiterung auf produktiven Prüfungsformularen ausgeführt. Keine echten An-/Abmeldungen wurden ausgelöst.

Der Chrome Web Store bleibt bei der oben dokumentierten Version 1.0.0, bis 1.1.0 dort als Update eingereicht und freigegeben ist. Die öffentliche Produktseite wird deshalb noch nicht als auf 1.1.0 aktualisiert ausgegeben. Die anonymisierten Original-Testseiten und TH-Styles liegen nur im Arbeitsverzeichnis und werden nicht ins Erweiterungspaket aufgenommen.

## Produktseiten

`produkte.html` bietet für beide Erweiterungen eine kompakte Übersicht mit Installationslink und „Mehr erfahren“. Die ausführlichen Informationen stehen auf `psso-modern.html` und `fokus.html`. Beide Detailseiten führen zurück zur Produktübersicht; vorhandene Übersicht-Anker bleiben erhalten.

## Campus Flow

`campus-flow.html` stellt das kostenlose Notion-Template als eigenständige Produktgeschichte vor. `css/campus-flow.css` und `js/campus-flow.js` sind auf diese Seite begrenzt. Die Scroll-Illustration ordnet auf ausreichend großen Bildschirmen vier Karten und blendet eine echte Vorschau ein. Auf kleinen Bildschirmen, bei reduced motion und ohne JavaScript bleiben die Geschichte und Screenshots normal lesbar. Es gibt keine Scroll-Übernahme. Die Preview-Tabs unterstützen Tastaturbedienung.

Die Bilder unter `img/products/campus-flow/` stammen ausschließlich aus der separaten öffentlichen Vorlage. `dashboard-v12.webp` und `quick-actions-v12.webp` zeigen Version 1.2 mit fünf Schnellaktionen; `tasks.webp` und `modules.webp` bleiben ausdrücklich gekennzeichnete, ausgefüllte Beispiele mit fiktiven Inhalten. Keine privaten Seiten-URLs, Kontodetails oder persönlichen Studienunterlagen werden veröffentlicht. Version 1.2 ergänzt am 18. Oktober 2026 die Semesterverwaltung, eine Standardvorlage für Module und die direkt sichtbaren Verknüpfungen zu Aufgaben und Terminen. Alle fünf Original-Datenbanken starten ohne Einträge (0 Semester, 0 Module, 0 Aufgaben, 0 Termine, 0 Projekte); geprüft über ihre ungefilterten Ansichten. Die fünf Erstellen-Buttons sind in der eigenen duplizierten Notion-Kopie nutzbar, die öffentliche Seite bleibt eine Leseansicht. Ausfüllbeispiele stehen ausschließlich als Anleitungstext unter den jeweiligen Bereichen und im Startguide. Die am 17. Oktober 2026 mit aktivierter Duplizierbarkeit veröffentlichte URL bleibt bestehen: https://fortunate-lifter-b49.notion.site/Campus-Flow-Study-Life-Planner-c78effff73d18260a9be01594fbf0cbe. Die Produktübersicht und Detailseite führen direkt dorthin. Kein Zahlungsprozess und keine behauptete automatische Kalender-Synchronisation. Eine vollständige Duplizierung in einen fremden Workspace ist weiterhin separat zu prüfen.
