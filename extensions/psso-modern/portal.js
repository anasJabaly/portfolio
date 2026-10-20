// PSSO Modern 1.1.0 · Native portal enhancement, no copied forms or requests.
(async () => {
  'use strict';
  if (document.getElementById('psso-portal-toolbar') || document.querySelector('input[type="password"]')) return;
  const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
  const content = document.querySelector('.divcontent > .content, .divcontent > .content_max_portal_qis, .content');
  const sidebar = document.querySelector('#makronavigation');
  const logout = document.querySelector('a[href*="auth.logout"]');
  // Unknown layouts and unauthenticated pages keep their original presentation.
  if (!content || !sidebar || !logout) return;
  const gradeTable = [...content.querySelectorAll('table')].some(table => {
    const headers = [...table.querySelectorAll('th')].map(cell => clean(cell.textContent));
    return ['PNR', 'Prüfungstext', 'Note'].every(header => headers.includes(header));
  });
  if (gradeTable) return;

  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const button = (label, className) => {
    const node = make('button', className, label);
    node.type = 'button';
    return node;
  };
  const toolbar = make('div', 'pp-toolbar');
  toolbar.id = 'psso-portal-toolbar';
  const toolbarInner = make('div', 'pp-toolbar-inner');
  const brand = make('div', 'pp-brand');
  brand.append(make('span', 'pp-mark', 'PM'));
  const brandCopy = make('div');
  brandCopy.append(make('strong', '', 'PSSO Modern'), make('small', '', 'Dein Studienportal · TH Köln'));
  brand.append(brandCopy);
  const actions = make('div', 'pp-actions');
  const theme = button('◐', 'pp-icon-button');
  theme.setAttribute('aria-label', 'Farbschema umschalten');
  const toggle = button('Originalansicht', 'pp-button');
  toggle.setAttribute('aria-pressed', 'true');
  actions.append(theme, toggle);
  toolbarInner.append(brand, actions);
  toolbar.append(toolbarInner);
  document.body.prepend(toolbar);

  // Add classes only: native links, form ownership, hidden tokens and event handlers stay intact.
  content.classList.add('pp-content');
  sidebar.classList.add('pp-sidebar');
  document.querySelector('.divlinks')?.classList.add('pp-tabs');
  if (content.parentElement === sidebar.parentElement) content.parentElement.classList.add('pp-layout');
  content.querySelectorAll('table').forEach(table => {
    if (table.querySelector('th')) table.classList.add('pp-data-table');
  });
  document.querySelectorAll('.globalmessage').forEach(node => {
    if (clean(node.textContent)) node.classList.add('pp-notice');
  });
  document.querySelectorAll('div, p, td, [role="alert"]').forEach(node => {
    if (node.closest('#psso-portal-toolbar') || node.parentElement?.closest('.pp-notice') || !clean(node.textContent) || node.children.length > 5) return;
    const color = getComputedStyle(node).backgroundColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (node.getAttribute('role') === 'alert' || (color && +color[1] > 160 && +color[2] < 100 && +color[3] < 100)) node.classList.add('pp-notice');
  });

  // Native QIS trees are nested ul.treelist > li with original Konto links.
  // Filtering is local to loaded DOM rows; it never expands a branch or follows a link.
  const fold = value => clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('de');
  [...content.querySelectorAll('ul.treelist, ul.treelist1')]
    .filter(tree => !tree.parentElement.closest('ul.treelist, ul.treelist1'))
    .forEach((tree, index) => {
      const items = [...tree.querySelectorAll('li')];
      const records = items.map(li => {
        const links = [...li.querySelectorAll('a')].filter(a => a.closest('li') === li && clean(a.textContent));
        return {li, links, text: fold(links.map(a => a.textContent).join(' '))};
      });
      if (!records.some(record => record.links.length)) return;
      tree.classList.add('pp-tree');
      records.forEach(({li, links}) => {
        li.classList.add('pp-tree-item');
        links.forEach(link => {
          link.classList.add('pp-tree-link');
          // Keep the anchor and its attributes/listeners; only wrap plain label text.
          if ([...link.childNodes].every(node => node.nodeType === 3)) {
            const text = link.textContent;
            const start = text.indexOf('[Status:');
            if (start > 0) {
              link.replaceChildren(make('span', 'pp-tree-title', text.slice(0, start)), make('span', 'pp-tree-meta', text.slice(start)));
            }
          }
        });
      });
      const tools = make('section', 'pp-tree-tools');
      tools.setAttribute('aria-label', 'Modulbaum durchsuchen');
      const label = make('label', '', 'Module im geöffneten Baum suchen');
      const search = make('input');
      search.type = 'search'; search.id = `psso-tree-search-${index}`;
      search.placeholder = 'Modulname oder Prüfungsnummer';
      label.htmlFor = search.id;
      const hint = make('p', 'pp-tree-hint', 'Die Suche erfasst bereits geladene Einträge. Weitere Bereiche bitte zuerst über die PSSO-Bezeichnungen aufklappen.');
      hint.id = `psso-tree-hint-${index}`;
      search.setAttribute('aria-describedby', hint.id);
      const controls = make('div', 'pp-tree-controls');
      const reset = button('Suche löschen', 'pp-button');
      const status = make('p', 'pp-tree-status');
      status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
      controls.append(search, reset); tools.append(label, controls, hint, status);
      tree.before(tools);
      const apply = () => {
        const terms = fold(search.value).split(' ').filter(Boolean);
        const hits = records.filter(record => terms.every(term => record.text.includes(term)));
        const visible = new Set();
        const matched = new Set(hits.map(hit => hit.li));
        hits.forEach(({li}) => {
          // Reveal the path to each match without including unrelated siblings.
          let current = li;
          while (current && tree.contains(current)) {
            visible.add(current);
            current = current.parentElement.closest('li');
          }
          // A matching group also shows its already-loaded descendants.
          li.querySelectorAll('li').forEach(child => visible.add(child));
        });
        records.forEach(({li}) => li.classList.toggle('pp-tree-filtered', terms.length > 0 && !visible.has(li)));
        records.forEach(({li}) => li.classList.toggle('pp-tree-match', terms.length > 0 && matched.has(li)));
        status.textContent = terms.length ? (hits.length ? `${hits.length} ${hits.length === 1 ? 'passender Eintrag' : 'passende Einträge'} · mit zugehörigem Pfad` : 'Keine Treffer in den geladenen Einträgen. Suche löschen oder weitere Bereiche aufklappen.') : `${records.length} geladene Einträge`;
        reset.disabled = !terms.length;
      };
      search.addEventListener('input', apply);
      // Enter in the injected search must never submit a native exam form.
      search.addEventListener('keydown', event => { if (event.key === 'Enter') event.preventDefault(); });
      reset.addEventListener('click', () => { search.value = ''; apply(); search.focus(); });
      apply();
    });

  const breadcrumb = clean(document.querySelector('.breadcrumb')?.textContent);
  const nativeTitle = clean(content.querySelector('h1')?.textContent);
  const home = /(?:^|[:>›])\s*Startseite\s*$/i.test(breadcrumb) || /^Ihre Funktionen$/i.test(nativeTitle);
  if (home) {
    const intro = make('section', 'pp-home');
    intro.setAttribute('aria-label', 'Studienservice');
    intro.append(make('p', 'pp-eyebrow', 'DEIN STUDIENSERVICE'), make('h1', '', 'Was möchtest du erledigen?'), make('p', 'pp-lead', 'Wähle einen Bereich. Deine gewohnten PSSO-Funktionen sind direkt erreichbar.'));
    const cards = make('div', 'pp-service-grid');
    const used = new Set();
    [...sidebar.querySelectorAll('a[href]')].forEach(source => {
      const label = clean(source.textContent);
      if (!/^(Allgemeine Verwaltung|Prüfungsverwaltung)$/i.test(label) || used.has(label)) return;
      used.add(label);
      const card = button('', 'pp-service-card');
      card.append(make('span', 'pp-service-symbol', /^Prüfung/i.test(label) ? '↗' : '≡'), make('strong', '', label), make('span', '', /^Prüfung/i.test(label) ? 'Prüfungen und Leistungsübersichten aufrufen.' : 'Deine Verwaltungsfunktionen aufrufen.'), make('small', '', 'Bereich öffnen →'));
      card.addEventListener('click', () => source.click());
      cards.append(card);
    });
    if (cards.children.length) {
      content.querySelector('h1')?.classList.add('pp-home-original-title');
      content.querySelector('.headline')?.classList.add('pp-home-illustration');
      intro.append(cards); content.prepend(intro);
    }
  }

  const setTheme = value => {
    const dark = value === 'dark';
    document.body.classList.toggle('psso-modern-dark', dark);
    theme.textContent = dark ? '☀' : '◐';
    theme.title = dark ? 'Helles Farbschema' : 'Dunkles Farbschema';
    theme.setAttribute('aria-pressed', String(dark));
  };
  let saved = 'light';
  try { saved = (await chrome.storage.local.get('psso-modern-theme'))['psso-modern-theme'] || 'light'; } catch (_) {}
  setTheme(saved);
  theme.addEventListener('click', async () => {
    const next = document.body.classList.contains('psso-modern-dark') ? 'light' : 'dark';
    setTheme(next);
    try { await chrome.storage.local.set({'psso-modern-theme': next}); } catch (_) {}
  });
  toggle.addEventListener('click', () => {
    const active = document.body.classList.toggle('pp-enabled');
    toggle.textContent = active ? 'Originalansicht' : 'Moderne Ansicht';
    toggle.setAttribute('aria-pressed', String(active));
  });
  document.body.classList.add('pp-enabled');
})();
