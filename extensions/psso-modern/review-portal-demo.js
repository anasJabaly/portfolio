// Fictional local test screens only. Never loaded as a PSSO content script.
(() => {
  'use strict';
  if (!globalThis.chrome?.storage) {
    globalThis.chrome = { ...globalThis.chrome, storage: {local: {
      async get(key) { try { return {[key]: localStorage.getItem(key)}; } catch (_) { return {}; } },
      async set(values) { try { Object.entries(values).forEach(([key,value]) => localStorage.setItem(key,value)); } catch (_) {} },
    }}};
  }
  const source = document.getElementById('demo-native-content');
  const view = new URLSearchParams(location.search).get('view');
  if (view === 'baum') {
    const row = (label, children = '') => `<li class="treelist"><span aria-hidden="true">${children ? '▾' : '○'}</span> <a class="Konto" href="#demo-tree-result">${label}</a><a name="demo-branch"></a>${children ? `<ul class="treelist">${children}</ul>` : ''}</li>`;
    const required = row('1100 Grundlagen der Programmierung [Status: BE; Note: 1,70; Credit Points: 5; Malus: 0; Versuch: 1]') + row('1200 Datenbanken [Status: BE; Note: 2,30; Credit Points: 5; Malus: 0; Versuch: 1]') + row('1300 Betriebssysteme und Verteilte Systeme 2 (BVS2) [Status: BE; Note: 1,70; Credit Points: 6; Malus: 0; Versuch: 1]') + row('1400 IT-Sicherheit') + row('1500 Software Engineering [Status: AN; Credit Points: 5; Versuch: 1]');
    const electives = row('2100 Computergrafik') + row('2200 Mobile Anwendungen');
    source.innerHTML = '<h1>An- und Abmeldung</h1><p>Fiktiver Modulbaum: Suche und Darstellung ausprobieren. Alle Modulnamen, Noten und Status sind Beispieldaten.</p><ul class="treelist">' + row('Bachelor Informatik · Demo', row('Bachelor', row('ECTS-Konto', row('1000 Pflichtmodule', required) + row('2000 Wahlmodule', electives)))) + '</ul><p id="demo-tree-result" role="status">Demo: Ein Modulklick zeigt nur diesen Hinweis. Es wird keine Prüfung angemeldet.</p>';
    source.querySelectorAll('a.Konto').forEach(a => a.addEventListener('click', () => { document.getElementById('demo-tree-result').textContent = 'Originaler Demo-Link funktioniert. Keine Prüfungsaktion ausgeführt.'; }));
  } else if (view === 'verwaltung') {
    source.innerHTML = '<h1>Allgemeine Verwaltung</h1><p>Fiktives Formular zum Testen der Darstellung. Es werden keine Angaben an eine Hochschule übertragen.</p><form id="demo-form"><input type="hidden" name="csrf" value="fictional-test-token"><label for="demo-subject">Anliegen</label><input id="demo-subject" name="subject" value="Bescheinigung für das aktuelle Semester"><label for="demo-semester">Semester</label><select id="demo-semester" name="semester"><option>Wintersemester 2026/27</option><option>Sommersemester 2027</option></select><label><input type="checkbox" name="confirm"> Angaben in dieser Demo bestätigen</label><div class="demo-controls"><input type="submit" value="Demo-Eingaben prüfen"></div><p id="demo-result" class="demo-result" role="status"></p></form>';
  } else if (view === 'pruefungen') {
    source.innerHTML = '<h1>Prüfungsverwaltung</h1><p>Fiktive Prüfungsübersicht. In dieser Vorschau werden keine Prüfungen an- oder abgemeldet.</p><form id="demo-form"><input type="hidden" name="csrf" value="fictional-test-token"><table><thead><tr><th>Auswahl</th><th>Prüfung</th><th>Semester</th><th>Status</th></tr></thead><tbody><tr><td><input type="checkbox" name="exam" value="demo-db" aria-label="Datenbanken auswählen"></td><td>Datenbanken</td><td>WS 2026/27</td><td>Beispieltermin</td></tr><tr><td><input type="checkbox" name="exam" value="demo-se" aria-label="Software Engineering auswählen"></td><td>Software Engineering</td><td>WS 2026/27</td><td>Beispieltermin</td></tr></tbody></table><div class="demo-controls"><input type="submit" value="Demo-Auswahl prüfen"></div><p id="demo-result" class="demo-result" role="status"></p></form>';
  } else if (view === 'bescheinigungen') {
    source.innerHTML = '<h1>Bescheinigungen</h1><p>Beispiel eines unveränderten Downloadlinks in der modernen Oberfläche.</p><a href="data:text/plain;charset=utf-8,Fiktive%20Bescheinigung%20-%20keine%20Hochschulunterlage" download="demo-bescheinigung.txt">Fiktive Bescheinigung herunterladen</a>';
  } else {
    source.innerHTML = '<h1>Ihre Funktionen</h1><h2 id="hinweis">Informationen zum Studienportal</h2><p>Die Originalinformationen der Hochschule bleiben unter den Schnellzugriffen sichtbar. Diese Vorschau bildet nur eine typische Seitenstruktur nach.</p><p id="hilfe">Wichtige Meldungen, Hilfe und alle vorhandenen Navigationswege werden weiterhin angezeigt.</p>';
  }
  if (view) document.getElementById('demo-breadcrumb').textContent = source.querySelector('h1').textContent;
  document.getElementById('demo-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    document.getElementById('demo-result').textContent = data.has('exam') ? `Demo-Auswahl geprüft: ${data.getAll('exam').length} Eintrag/Einträge. Keine Anmeldung ausgeführt.` : 'Demo-Eingaben unverändert verfügbar. Es wurde nichts übertragen.';
  });
})();
