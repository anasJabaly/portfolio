// PSSO Modern 1.1.0 · Anas Jabaly
// Reads the loaded PSSO table locally. Only the color scheme is persisted.
(async function () {
  'use strict';

  const ROOT_ID = 'psso-modern';
  const ACTIVE_CLASS = 'psso-modern-active';
  const DARK_CLASS = 'psso-modern-dark';
  const STORAGE_THEME = 'psso-modern-theme';

  if (document.getElementById(ROOT_ID) || document.querySelector('input[type="password"]')) return;

  const clean = (value) => String(value || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  const cellText = (row, index) => clean(row?.cells?.[index]?.textContent);
  const hasCellClass = (row, className) => row.cells[0]?.classList.contains(className);

  const gradeTable = [...document.querySelectorAll('table')].find((table) => {
    const headers = [...table.querySelectorAll('th')].map((cell) => clean(cell.textContent));
    return headers.includes('PNR') && headers.includes('Prüfungstext') && headers.includes('Note');
  });

  if (!gradeTable) return;

  const statusMeta = {
    BE: { label: 'Bestanden', tone: 'success' },
    AN: { label: 'Angemeldet', tone: 'registered' },
    PV: { label: 'Vorgesehen', tone: 'planned' },
    NB: { label: 'Nicht bestanden', tone: 'danger' },
  };

  const requirementMeta = {
    PF: 'Pflicht',
    WP: 'Wahlpflicht',
  };



  const rows = [...gradeTable.rows].slice(1);
  const summaryRow = rows.find((row) => hasCellClass(row, 'qis_kontoOnTop'));
  const modules = [];
  const groups = [];
  let currentGroup = 'Module';
  let currentModule = null;

  const isGroupRow = (row) => {
    const title = cellText(row, 1);
    return /^(Pflichtmodule|Wahlmodule)/i.test(title);
  };

  rows.forEach((row) => {
    if (row === summaryRow) return;

    if (hasCellClass(row, 'qis_konto')) {
      if (isGroupRow(row)) {
        currentGroup = cellText(row, 1) || 'Module';
        if (!groups.includes(currentGroup)) groups.push(currentGroup);
        currentModule = null;
        return;
      }

      currentModule = {
        pnr: cellText(row, 0),
        name: cellText(row, 1),
        requirement: cellText(row, 2),
        examType: cellText(row, 3),
        semester: cellText(row, 4),
        grade: cellText(row, 5),
        status: cellText(row, 6),
        credits: cellText(row, 7),
        note: cellText(row, 8),
        attempt: cellText(row, 9),
        date: cellText(row, 10),
        group: currentGroup,
        assessments: [],
      };
      modules.push(currentModule);
      if (!groups.includes(currentGroup)) groups.push(currentGroup);
      return;
    }

    if (currentModule && row.cells.length >= 2) {
      currentModule.assessments.push({
        pnr: cellText(row, 0),
        name: cellText(row, 1),
        requirement: cellText(row, 2),
        examType: cellText(row, 3),
        semester: cellText(row, 4),
        grade: cellText(row, 5),
        status: cellText(row, 6),
        credits: cellText(row, 7),
        note: cellText(row, 8),
        attempt: cellText(row, 9),
        date: cellText(row, 10),
      });
    }
  });

  if (!modules.length) return;

  modules.forEach((module, index) => {
    const registeredAssessment = module.assessments.find((item) => item.status === 'AN');
    module.sourceIndex = index;
    module.registeredAssessment = registeredAssessment || null;
    module.effectiveStatus = registeredAssessment ? 'AN' : module.status;
    module.effectiveSemester = registeredAssessment?.semester || module.semester;
    module.hasULP = module.assessments.some((item) => /\bULP\b/i.test(item.name));
    module.hasOpenGrade = !module.grade && module.status !== 'BE';
    module.searchText = clean([
      module.pnr,
      module.name,
      module.semester,
      module.effectiveSemester,
      module.status,
      ...module.assessments.flatMap((item) => [item.pnr, item.name, item.semester, item.status, item.date]),
    ].join(' ')).toLocaleLowerCase('de');
  });

  const average = cellText(summaryRow, 5) || '–';
  const credits = cellText(summaryRow, 7) || '0';
  const passedModules = modules.filter((module) => module.status === 'BE' && Number(module.credits.replace(',', '.')) > 0).length;
  const registeredExams = modules.reduce(
    (count, module) => count + module.assessments.filter((item) => item.status === 'AN').length,
    0,
  );

  const semesters = [...new Set(modules.map((module) => module.semester).filter(Boolean))];

  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  };

  const makeButton = (label, className = 'pm-button') => {
    const button = make('button', className, label);
    button.type = 'button';
    return button;
  };

  const safeLink = (source, label, className) => {
    if (!source?.href) return null;
    const link = make('a', className, label);
    link.href = source.href;
    if (source.target) link.target = source.target;
    return link;
  };

  const root = make('main');
  root.id = ROOT_ID;

  const topbar = make('header', 'pm-topbar');
  const topbarInner = make('div', 'pm-topbar-inner');
  const originalHome = document.querySelector('a[title="Startseite"]');
  const brand = safeLink(originalHome, '', 'pm-brand') || make('div', 'pm-brand');
  const brandMark = make('span', 'pm-brand-mark', 'PM');
  const brandCopy = make('span', 'pm-brand-copy');
  brandCopy.append(make('strong', '', 'PSSO Modern'), make('span', '', 'Notenspiegel der TH Köln'));
  brand.append(brandMark, brandCopy);

  const topActions = make('nav', 'pm-top-actions');
  topActions.setAttribute('aria-label', 'Schnellnavigation');
  const themeButton = makeButton('◐', 'pm-icon-button');
  themeButton.title = 'Hell/Dunkel umschalten';
  themeButton.setAttribute('aria-label', 'Farbschema umschalten');
  const logoutSource = document.querySelector('a[href*="auth.logout"]');
  const logout = safeLink(logoutSource, 'Abmelden', 'pm-button pm-top-link');
  topActions.append(themeButton);
  if (logout) topActions.append(logout);
  topbarInner.append(brand, topActions);
  topbar.append(topbarInner);

  const shell = make('div', 'pm-shell');
  const hero = make('section', 'pm-hero');
  const heroCopy = make('div');
  heroCopy.append(
    make('p', 'pm-eyebrow', 'Notenspiegel'),
    make('h1', '', 'Dein Studium auf einen Blick'),
    make('p', '', 'Module, Noten und Prüfungsanmeldungen – übersichtlich aus den vorhandenen PSSO-Daten aufbereitet.'),
  );
  const heroActions = make('div', 'pm-hero-actions');
  const selectionLinkSource = document.querySelector('a[href*="state=notenspiegelStudent"][href*="next=tree.vm"]');
  const selectionInput = document.querySelector('input[name="auswahlButton"]');
  const selectionLink = safeLink(selectionLinkSource, '← Auswahlseite', 'pm-button');
  if (selectionLink) {
    heroActions.append(selectionLink);
  } else if (selectionInput) {
    const selectionButton = makeButton('← Auswahlseite', 'pm-button');
    selectionButton.addEventListener('click', () => selectionInput.click());
    heroActions.append(selectionButton);
  }
  const printButton = makeButton('Drucken', 'pm-button pm-button-primary');
  printButton.addEventListener('click', () => window.print());
  heroActions.append(printButton);
  hero.append(heroCopy, heroActions);

  const stats = make('section', 'pm-stats');
  stats.setAttribute('aria-label', 'Studienfortschritt');
  [
    ['Notendurchschnitt', average, 'Bisheriger PSSO-Gesamtwert', 'brand'],
    ['ECTS', credits, 'Bisher erreicht', 'success'],
    ['Bestandene Module', String(passedModules), 'Module mit ECTS', 'success'],
    ['Prüfungsanmeldungen', String(registeredExams), 'Aktuell mit Status AN', 'registered'],
  ].forEach(([label, value, note, tone]) => {
    const stat = make('article', 'pm-stat');
    stat.dataset.tone = tone;
    const statTop = make('div', 'pm-stat-top');
    statTop.append(make('span', 'pm-stat-label', label), make('span', 'pm-stat-dot'));
    stat.append(statTop, make('div', 'pm-stat-value', value), make('div', 'pm-stat-note', note));
    stats.append(stat);
  });

  const toolbar = make('section', 'pm-toolbar');
  toolbar.setAttribute('aria-label', 'Module filtern');
  const searchWrap = make('label', 'pm-search');
  const searchInput = make('input');
  searchInput.type = 'search';
  searchInput.placeholder = 'Modul oder PNR suchen …';
  searchInput.setAttribute('aria-label', 'Module suchen');
  searchWrap.append(searchInput);

  const sortSelect = make('select', 'pm-select');
  sortSelect.setAttribute('aria-label', 'Module sortieren');
  [
    ['RECOMMENDED', 'Sortieren: Empfohlen'],
    ['SEMESTER_NEW', 'Semester: neu nach alt'],
    ['SEMESTER_OLD', 'Semester: alt nach neu'],
    ['NAME', 'Name: A bis Z'],
    ['GRADE_BEST', 'Note: beste zuerst'],
    ['GRADE_WORST', 'Note: schlechteste zuerst'],
    ['CREDITS', 'ECTS: höchste zuerst'],
  ].forEach(([value, label]) => {
    const option = make('option', '', label);
    option.value = value;
    sortSelect.append(option);
  });

  const groupingSelect = make('select', 'pm-select');
  groupingSelect.setAttribute('aria-label', 'Module gruppieren');
  [
    ['STATUS', 'Gruppieren: Status'],
    ['SEMESTER', 'Gruppieren: Semester'],
    ['TYPE', 'Gruppieren: Modulart'],
    ['NONE', 'Keine Gruppierung'],
  ].forEach(([value, label]) => {
    const option = make('option', '', label);
    option.value = value;
    groupingSelect.append(option);
  });

  const filterRow = make('div', 'pm-filter-row');
  filterRow.append(make('span', 'pm-filter-label', 'Anzeigen:'));
  const filterDefinitions = [
    ['ALL', 'Alle'],
    ['AN', 'Angemeldet'],
    ['OPEN', 'Note offen'],
    ['BE', 'Bestanden'],
    ['ULP', 'Mit ULP'],
  ];
  const filterButtons = [];
  filterDefinitions.forEach(([value, label], index) => {
    const button = makeButton(label, 'pm-filter');
    button.dataset.filter = value;
    button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
    filterButtons.push(button);
    filterRow.append(button);
  });
  const semesterSelect = make('select', 'pm-select');
  semesterSelect.setAttribute('aria-label', 'Semester auswählen');
  const allSemester = make('option', '', 'Alle Semester');
  allSemester.value = 'ALL';
  semesterSelect.append(allSemester);
  semesters.forEach((semester) => {
    const option = make('option', '', semester);
    option.value = semester;
    semesterSelect.append(option);
  });
  filterRow.append(semesterSelect);
  toolbar.append(searchWrap, sortSelect, groupingSelect, filterRow);

  const sectionsContainer = make('div', 'pm-sections');
  const moduleCards = [];

  const statusPill = (code) => {
    const meta = statusMeta[code] || { label: code || 'Offen', tone: 'planned' };
    const pill = make('span', `pm-status pm-status-${meta.tone}`, meta.label);
    pill.title = code ? `PSSO-Status: ${code}` : 'Kein Status hinterlegt';
    return pill;
  };

  modules.forEach((module) => {
      const card = make('article', 'pm-module');
      card.dataset.status = module.effectiveStatus || '';
      card.dataset.semester = module.effectiveSemester || '';
      card.dataset.search = module.searchText;
      card.dataset.visible = 'true';

      const main = make('div', 'pm-module-main');
      const moduleTop = make('div', 'pm-module-top');
      const nameWrap = make('div');
      nameWrap.append(
        make('h3', 'pm-module-name', module.name),
        make('span', 'pm-pnr', `PNR ${module.pnr}${module.hasULP ? ' · mit ULP' : ''}`),
      );
      moduleTop.append(nameWrap, statusPill(module.effectiveStatus));

      const meta = make('div', 'pm-module-meta');
      const gradeLabel = module.grade || (module.status === 'BE' ? 'Unbenotet' : 'Offen');
      const gradeValue = make('span', `pm-meta-value ${module.grade ? 'pm-grade-good' : 'pm-grade-empty'}`, gradeLabel);
      const finalMeta = module.registeredAssessment?.date
        ? ['Prüfung', module.registeredAssessment.date]
        : ['ECTS', module.credits || '0'];
      const metaValues = [
        ['Semester', module.effectiveSemester || '–'],
        ['Note', gradeValue],
        finalMeta,
      ];
      metaValues.forEach(([label, value]) => {
        const item = make('div', 'pm-meta');
        item.append(make('span', 'pm-meta-label', label));
        item.append(value instanceof Node ? value : make('span', 'pm-meta-value', value));
        meta.append(item);
      });
      main.append(moduleTop, meta);
      card.append(main);

      if (module.assessments.length) {
        const details = make('details', 'pm-details');
        details.append(make('summary', '', `${module.assessments.length} Prüfungsleistung${module.assessments.length === 1 ? '' : 'en'} anzeigen`));
        const assessmentList = make('div', 'pm-assessments');
        module.assessments.forEach((assessment) => {
          const row = make('div', 'pm-assessment');
          const assessmentName = make('div', 'pm-assessment-name', assessment.name);
          assessmentName.title = `PNR ${assessment.pnr}`;
          const requirement = requirementMeta[assessment.requirement] || assessment.requirement || '–';
          const values = [
            [requirement, assessment.examType || '–'],
            ['Note', assessment.grade || '–'],
            ['Status', statusMeta[assessment.status]?.label || assessment.status || '–'],
            ['Datum', assessment.date || '–'],
          ];
          row.append(assessmentName);
          values.forEach(([label, value], index) => {
            const item = make('span', 'pm-assessment-cell');
            if (index === 0) {
              item.textContent = `${label} · ${value}`;
            } else {
              item.append(`${label} `, make('strong', '', value));
            }
            row.append(item);
          });
          assessmentList.append(row);
        });
        details.append(assessmentList);
        card.append(details);
      }

      moduleCards.push({ card, module });
  });

  const emptyState = make('div', 'pm-empty');
  emptyState.append(make('strong', '', 'Keine passenden Module gefunden'), make('span', '', 'Ändere die Suche oder setze die Filter zurück.'));

  const panels = make('section', 'pm-panels');
  const infoBar = document.querySelector('.InfoLeiste');
  const documentLinks = infoBar
    ? [...infoBar.querySelectorAll('a[href]')].map((link) => ({
        href: link.href,
        label: clean(link.previousElementSibling?.textContent || link.querySelector('img')?.alt || 'PDF-Dokument'),
      }))
    : [];

  if (documentLinks.length) {
    const documentsPanel = make('details', 'pm-panel');
    documentsPanel.append(make('summary', '', `PDF-Dokumente (${documentLinks.length})`));
    const panelContent = make('div', 'pm-panel-content');
    const documentList = make('div', 'pm-document-list');
    documentLinks.forEach((item) => {
      const link = make('a', 'pm-document');
      link.href = item.href;
      link.append(make('span', '', item.label), make('span', '', '↗'));
      documentList.append(link);
    });
    panelContent.append(documentList);
    documentsPanel.append(panelContent);
    panels.append(documentsPanel);
  }

  const profileTable = document.querySelector('table[summary="Liste der Stammdaten des Studierenden"]');
  if (profileTable) {
    const profilePanel = make('details', 'pm-panel');
    profilePanel.append(make('summary', '', 'Stammdaten'));
    const panelContent = make('div', 'pm-panel-content');
    const profile = make('dl', 'pm-profile');
    [...profileTable.rows].forEach((row) => {
      const label = clean(row.querySelector('th')?.textContent);
      const value = clean(row.querySelector('td')?.textContent);
      if (label) profile.append(make('dt', '', label), make('dd', '', value || '–'));
    });
    panelContent.append(profile);
    profilePanel.append(panelContent);
    panels.append(profilePanel);
  }

  const legend = make('p', 'pm-legend', 'BE = bestanden · AN = angemeldet · PV = vorgesehen · PF = Pflicht · WP = Wahlpflicht. Alle Angaben werden unverändert aus PSSO gelesen.');

  shell.append(hero, stats, toolbar, sectionsContainer, emptyState);
  if (panels.children.length) shell.append(panels);
  shell.append(legend);
  root.append(topbar, shell);

  const content = gradeTable.closest('.content') || document.body;
  content.prepend(root);

  const viewToggle = makeButton('Originalansicht');
  viewToggle.id = 'psso-view-toggle';
  viewToggle.title = 'Zwischen moderner und ursprünglicher PSSO-Ansicht wechseln';
  document.body.append(viewToggle);

  let activeFilter = 'ALL';

  const semesterScore = (semester) => {
    const match = clean(semester).match(/^(WS|SS)\s+(\d{2})/i);
    if (!match) return -1;
    const year = 2000 + Number(match[2]);
    return year * 2 + (match[1].toUpperCase() === 'WS' ? 1 : 0);
  };

  const numericGrade = (module) => {
    if (!module.grade) return Number.POSITIVE_INFINITY;
    const value = Number(module.grade.replace(',', '.'));
    return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
  };

  const statusPriority = (module) => ({ AN: 0, NB: 1, PV: 2, BE: 3 }[module.effectiveStatus] ?? 2);

  const matchesActiveFilter = (module) => {
    if (activeFilter === 'AN') return module.effectiveStatus === 'AN';
    if (activeFilter === 'OPEN') return module.hasOpenGrade;
    if (activeFilter === 'BE') return module.status === 'BE';
    if (activeFilter === 'ULP') return module.hasULP;
    return true;
  };

  const groupNameFor = (module) => {
    if (groupingSelect.value === 'SEMESTER') return module.effectiveSemester || 'Ohne Semester';
    if (groupingSelect.value === 'TYPE') return module.group || 'Module';
    if (groupingSelect.value === 'NONE') return 'Alle Module';
    if (module.effectiveStatus === 'AN') return 'Angemeldete Prüfungen';
    if (module.effectiveStatus === 'NB') return 'Nicht bestanden';
    if (module.status === 'BE') return 'Bestanden';
    return 'Offen & geplant';
  };

  const sortEntries = (entries) => {
    const mode = sortSelect.value;
    return entries.sort((left, right) => {
      const a = left.module;
      const b = right.module;
      if (mode === 'NAME') return a.name.localeCompare(b.name, 'de', { sensitivity: 'base' });
      if (mode === 'SEMESTER_NEW') return semesterScore(b.effectiveSemester) - semesterScore(a.effectiveSemester) || a.sourceIndex - b.sourceIndex;
      if (mode === 'SEMESTER_OLD') return semesterScore(a.effectiveSemester) - semesterScore(b.effectiveSemester) || a.sourceIndex - b.sourceIndex;
      if (mode === 'GRADE_BEST' || mode === 'GRADE_WORST') {
        const gradeA = numericGrade(a);
        const gradeB = numericGrade(b);
        if (!Number.isFinite(gradeA) && !Number.isFinite(gradeB)) return a.sourceIndex - b.sourceIndex;
        if (!Number.isFinite(gradeA)) return 1;
        if (!Number.isFinite(gradeB)) return -1;
        return (mode === 'GRADE_BEST' ? gradeA - gradeB : gradeB - gradeA) || a.sourceIndex - b.sourceIndex;
      }
      if (mode === 'CREDITS') return Number((b.credits || '0').replace(',', '.')) - Number((a.credits || '0').replace(',', '.')) || a.sourceIndex - b.sourceIndex;
      return statusPriority(a) - statusPriority(b)
        || semesterScore(b.effectiveSemester) - semesterScore(a.effectiveSemester)
        || a.sourceIndex - b.sourceIndex;
    });
  };

  const renderSections = (visibleEntries) => {
    const grouped = new Map();
    visibleEntries.forEach((entry) => {
      const groupName = groupNameFor(entry.module);
      if (!grouped.has(groupName)) grouped.set(groupName, []);
      grouped.get(groupName).push(entry);
    });

    let orderedGroups = [...grouped.entries()];
    if (groupingSelect.value === 'STATUS') {
      const order = ['Angemeldete Prüfungen', 'Nicht bestanden', 'Offen & geplant', 'Bestanden'];
      orderedGroups.sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
    } else if (groupingSelect.value === 'SEMESTER') {
      orderedGroups.sort((a, b) => semesterScore(b[0]) - semesterScore(a[0]));
    } else if (groupingSelect.value === 'TYPE') {
      orderedGroups.sort((a, b) => groups.indexOf(a[0]) - groups.indexOf(b[0]));
    }

    const sectionNodes = orderedGroups.map(([groupName, entries]) => {
      const section = make('section', 'pm-section');
      const sectionHead = make('div', 'pm-section-head');
      const title = make('h2', 'pm-section-title', groupName);
      title.append(make('span', 'pm-section-count', `· ${entries.length}`));
      sectionHead.append(title);
      const grid = make('div', 'pm-module-grid');
      sortEntries(entries).forEach(({ card }) => {
        card.hidden = false;
        grid.append(card);
      });
      section.append(sectionHead, grid);
      return section;
    });
    sectionsContainer.replaceChildren(...sectionNodes);
  };

  const updateVisibility = () => {
    const query = clean(searchInput.value).toLocaleLowerCase('de');
    const selectedSemester = semesterSelect.value;
    const visibleEntries = moduleCards.filter(({ module }) => {
      const matchesSearch = !query || module.searchText.includes(query);
      const matchesSemester = selectedSemester === 'ALL' || module.semester === selectedSemester || module.assessments.some((item) => item.semester === selectedSemester);
      return matchesSearch && matchesSemester && matchesActiveFilter(module);
    });

    renderSections(visibleEntries);
    emptyState.style.display = visibleEntries.length ? 'none' : 'block';
  };

  searchInput.addEventListener('input', updateVisibility);
  semesterSelect.addEventListener('change', updateVisibility);
  sortSelect.addEventListener('change', updateVisibility);
  groupingSelect.addEventListener('change', updateVisibility);
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      filterButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      updateVisibility();
    });
  });

  const setTheme = (theme) => {
    const dark = theme === 'dark';
    document.body.classList.toggle(DARK_CLASS, dark);
    themeButton.textContent = dark ? '☀' : '◐';
    themeButton.title = dark ? 'Helles Farbschema' : 'Dunkles Farbschema';
  };

  let storedTheme = 'light';
  try {
    storedTheme = (await chrome.storage.local.get(STORAGE_THEME))[STORAGE_THEME] || 'light';
  } catch (_) {}
  setTheme(storedTheme);

  themeButton.addEventListener('click', async () => {
    const nextTheme = document.body.classList.contains(DARK_CLASS) ? 'light' : 'dark';
    setTheme(nextTheme);
    try { await chrome.storage.local.set({ [STORAGE_THEME]: nextTheme }); } catch (_) {}
  });

  viewToggle.addEventListener('click', () => {
    const willBeActive = !document.body.classList.contains(ACTIVE_CLASS);
    document.body.classList.toggle(ACTIVE_CLASS, willBeActive);
    viewToggle.textContent = willBeActive ? 'Originalansicht' : 'Moderne Ansicht';
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });

  document.body.classList.add(ACTIVE_CLASS);
  updateVisibility();
})();
