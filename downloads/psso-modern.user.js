// ==UserScript==
// @name         PSSO Modern – TH Köln
// @namespace    local.psso.th-koeln
// @version      2.0.1
// @description  Ein ruhiger, übersichtlicher Notenspiegel – ausschließlich lokal im eigenen Browser.
// @author       Anas Jabaly
// @match        https://psso.th-koeln.de/qisserver/*
// @homepageURL  https://anas-jabaly.de/psso-modern.html
// @downloadURL  https://anas-jabaly.de/downloads/psso-modern.user.js
// @updateURL    https://anas-jabaly.de/downloads/psso-modern.user.js
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const ROOT_ID = 'psso-modern';
  const ACTIVE_CLASS = 'psso-modern-active';
  const DARK_CLASS = 'psso-modern-dark';
  const STORAGE_THEME = 'psso-modern-theme';

  if (document.getElementById(ROOT_ID)) return;

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

  const style = document.createElement('style');
  style.id = 'psso-modern-styles';
  style.textContent = `
    body.${ACTIVE_CLASS} {
      --pm-bg: #f5f7fb;
      --pm-surface: #ffffff;
      --pm-surface-soft: #f8fafc;
      --pm-text: #162033;
      --pm-muted: #657083;
      --pm-line: #e3e8f0;
      --pm-brand: #c8102e;
      --pm-brand-dark: #9e0b24;
      --pm-success: #13795b;
      --pm-success-bg: #e8f6f1;
      --pm-registered: #7253b7;
      --pm-registered-bg: #f1ecfb;
      --pm-planned: #536176;
      --pm-planned-bg: #eef1f5;
      --pm-danger: #b42318;
      --pm-danger-bg: #fef0ee;
      --pm-shadow: 0 8px 28px rgba(24, 32, 48, 0.07);
      margin: 0 !important;
      min-width: 0 !important;
      color: var(--pm-text) !important;
      background: var(--pm-bg) !important;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
      font-size: 16px !important;
      line-height: 1.5 !important;
    }

    body.${ACTIVE_CLASS}.${DARK_CLASS} {
      --pm-bg: #10141c;
      --pm-surface: #181e28;
      --pm-surface-soft: #202734;
      --pm-text: #f2f5f9;
      --pm-muted: #a9b2c1;
      --pm-line: #313a49;
      --pm-brand: #f05b72;
      --pm-brand-dark: #ff8294;
      --pm-success: #67d6b1;
      --pm-success-bg: #173a31;
      --pm-registered: #c2a9ff;
      --pm-registered-bg: #30264a;
      --pm-planned: #c0c8d5;
      --pm-planned-bg: #2a313d;
      --pm-danger: #ff958c;
      --pm-danger-bg: #472725;
      --pm-shadow: 0 10px 35px rgba(0, 0, 0, 0.22);
    }

    body.${ACTIVE_CLASS} #wrapper,
    body.${ACTIVE_CLASS} .divcontent,
    body.${ACTIVE_CLASS} .content {
      box-sizing: border-box !important;
      float: none !important;
      width: 100% !important;
      max-width: none !important;
      min-width: 0 !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
      border: 0 !important;
    }

    body.${ACTIVE_CLASS} .header_hisinone,
    body.${ACTIVE_CLASS} .divloginstatus,
    body.${ACTIVE_CLASS} .divlinks,
    body.${ACTIVE_CLASS} .breadcrumb,
    body.${ACTIVE_CLASS} #makronavigation,
    body.${ACTIVE_CLASS} .divfoot,
    body.${ACTIVE_CLASS} .content > *:not(#${ROOT_ID}) {
      display: none !important;
    }

    #${ROOT_ID} { display: none; }
    body.${ACTIVE_CLASS} #${ROOT_ID} { display: block !important; color: var(--pm-text); }
    #${ROOT_ID}, #${ROOT_ID} * { box-sizing: border-box; }
    #${ROOT_ID} button, #${ROOT_ID} input, #${ROOT_ID} select { font: inherit; }
    #${ROOT_ID} a { color: inherit; }

    .pm-topbar {
      position: sticky;
      z-index: 30;
      top: 0;
      border-bottom: 1px solid var(--pm-line);
      background: color-mix(in srgb, var(--pm-surface) 92%, transparent);
      backdrop-filter: blur(16px);
    }

    .pm-topbar-inner,
    .pm-shell {
      width: min(1180px, calc(100% - 40px));
      margin: 0 auto;
    }

    .pm-topbar-inner {
      min-height: 68px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
    }

    .pm-brand { display: flex; align-items: center; gap: 12px; text-decoration: none; }
    .pm-brand-mark {
      width: 36px;
      height: 36px;
      display: grid;
      place-items: center;
      border-radius: 10px;
      color: white;
      background: var(--pm-brand);
      font-size: 14px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .pm-brand-copy { display: grid; line-height: 1.15; }
    .pm-brand-copy strong { font-size: 15px; }
    .pm-brand-copy span { margin-top: 3px; color: var(--pm-muted); font-size: 12px; }
    .pm-top-actions { display: flex; align-items: center; gap: 8px; }

    .pm-icon-button,
    .pm-button,
    .pm-filter,
    #psso-view-toggle {
      min-height: 40px;
      border: 1px solid var(--pm-line);
      border-radius: 10px;
      color: var(--pm-text);
      background: var(--pm-surface);
      cursor: pointer;
      transition: border-color 150ms ease, background 150ms ease, transform 150ms ease;
    }

    .pm-icon-button:hover,
    .pm-button:hover,
    .pm-filter:hover { border-color: color-mix(in srgb, var(--pm-brand) 45%, var(--pm-line)); }
    .pm-icon-button:active,
    .pm-button:active,
    .pm-filter:active { transform: translateY(1px); }
    .pm-icon-button:focus-visible,
    .pm-button:focus-visible,
    .pm-filter:focus-visible,
    .pm-search input:focus-visible,
    .pm-select:focus-visible,
    #psso-view-toggle:focus-visible { outline: 3px solid color-mix(in srgb, var(--pm-brand) 30%, transparent); outline-offset: 2px; }

    .pm-icon-button {
      width: 42px;
      display: grid;
      place-items: center;
      padding: 0;
      font-size: 18px;
    }
    .pm-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 8px 13px; font-weight: 650; text-decoration: none; }
    .pm-button-primary { border-color: var(--pm-brand); color: #fff !important; background: var(--pm-brand); }
    .pm-button-primary:hover { border-color: var(--pm-brand-dark); background: var(--pm-brand-dark); }

    .pm-shell { padding: 28px 0 70px; }
    .pm-hero { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 18px; }
    .pm-eyebrow { margin: 0 0 4px; color: var(--pm-brand); font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
    .pm-hero h1 { margin: 0; color: var(--pm-text); font-size: clamp(25px, 3vw, 33px); line-height: 1.15; letter-spacing: -0.03em; }
    .pm-hero p:last-child { max-width: 620px; margin: 7px 0 0; color: var(--pm-muted); font-size: 13px; }
    .pm-hero-actions { display: flex; flex-wrap: wrap; gap: 8px; }

    .pm-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 18px; }
    .pm-stat {
      min-height: 92px;
      padding: 14px 16px;
      border: 1px solid var(--pm-line);
      border-radius: 13px;
      background: var(--pm-surface);
      box-shadow: 0 3px 14px rgba(24, 32, 48, 0.04);
    }
    .pm-stat-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .pm-stat-label { color: var(--pm-muted); font-size: 13px; font-weight: 650; }
    .pm-stat-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--pm-line); }
    .pm-stat[data-tone="brand"] .pm-stat-dot { background: var(--pm-brand); }
    .pm-stat[data-tone="success"] .pm-stat-dot { background: var(--pm-success); }
    .pm-stat[data-tone="registered"] .pm-stat-dot { background: var(--pm-registered); }
    .pm-stat-value { margin-top: 7px; color: var(--pm-text); font-size: 25px; font-weight: 780; line-height: 1; letter-spacing: -0.035em; }
    .pm-stat-note { margin-top: 5px; color: var(--pm-muted); font-size: 10px; }

    .pm-toolbar {
      position: sticky;
      z-index: 20;
      top: 76px;
      display: grid;
      grid-template-columns: minmax(260px, 1fr) 210px 210px;
      gap: 9px;
      margin-bottom: 22px;
      padding: 10px;
      border: 1px solid var(--pm-line);
      border-radius: 14px;
      background: color-mix(in srgb, var(--pm-surface) 94%, transparent);
      box-shadow: var(--pm-shadow);
      backdrop-filter: blur(16px);
    }
    .pm-search { position: relative; display: block; }
    .pm-search input,
    .pm-select {
      width: 100%;
      height: 44px;
      border: 1px solid var(--pm-line);
      border-radius: 10px;
      color: var(--pm-text);
      background: var(--pm-surface-soft);
    }
    .pm-search input { padding: 0 14px; }
    .pm-search input::placeholder { color: var(--pm-muted); }
    .pm-select { min-width: 150px; padding: 0 34px 0 12px; }
    .pm-filter-row { grid-column: 1 / -1; display: flex; align-items: center; flex-wrap: wrap; gap: 7px; padding-top: 1px; }
    .pm-filter-row .pm-select { width: auto; min-width: 165px; margin-left: auto; }
    .pm-filter-label { margin-right: 2px; color: var(--pm-muted); font-size: 11px; font-weight: 700; }
    .pm-filter { min-height: 38px; padding: 7px 11px; color: var(--pm-muted); font-size: 13px; font-weight: 700; }
    .pm-filter[aria-pressed="true"] { border-color: var(--pm-brand); color: #fff; background: var(--pm-brand); }

    .pm-section { margin-top: 23px; }
    .pm-section-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
    .pm-section-title { display: flex; align-items: baseline; gap: 9px; margin: 0; color: var(--pm-text); font-size: 17px; letter-spacing: -0.02em; }
    .pm-section-count { color: var(--pm-muted); font-size: 13px; font-weight: 500; }
    .pm-module-grid { display: grid; grid-template-columns: 1fr; gap: 7px; }

    .pm-module {
      overflow: hidden;
      border: 1px solid var(--pm-line);
      border-radius: 12px;
      background: var(--pm-surface);
      box-shadow: 0 3px 16px rgba(24, 32, 48, 0.035);
      transition: border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease;
    }
    .pm-module:hover { border-color: color-mix(in srgb, var(--pm-brand) 30%, var(--pm-line)); box-shadow: 0 5px 18px rgba(24, 32, 48, 0.06); }
    .pm-module-main { display: grid; grid-template-columns: minmax(290px, 1.5fr) minmax(310px, 1fr); align-items: center; gap: 28px; min-height: 82px; padding: 13px 16px; }
    .pm-module-top { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
    .pm-module-name { margin: 0; color: var(--pm-text); font-size: 14px; line-height: 1.35; font-weight: 760; letter-spacing: -0.012em; }
    .pm-pnr { display: inline-block; margin-top: 3px; color: var(--pm-muted); font-size: 10px; font-variant-numeric: tabular-nums; }
    .pm-status { flex: 0 0 auto; display: inline-flex; align-items: center; gap: 6px; padding: 5px 8px; border-radius: 999px; font-size: 11px; font-weight: 800; }
    .pm-status::before { width: 6px; height: 6px; border-radius: 50%; background: currentColor; content: ''; }
    .pm-status-success { color: var(--pm-success); background: var(--pm-success-bg); }
    .pm-status-registered { color: var(--pm-registered); background: var(--pm-registered-bg); }
    .pm-status-planned { color: var(--pm-planned); background: var(--pm-planned-bg); }
    .pm-status-danger { color: var(--pm-danger); background: var(--pm-danger-bg); }
    .pm-module-meta { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 0; }
    .pm-meta { min-width: 0; }
    .pm-meta-label { display: block; margin-bottom: 2px; color: var(--pm-muted); font-size: 10px; font-weight: 750; letter-spacing: .05em; text-transform: uppercase; }
    .pm-meta-value { overflow: hidden; display: block; color: var(--pm-text); font-size: 13px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
    .pm-grade-good { color: var(--pm-success); }
    .pm-grade-empty { color: var(--pm-muted); font-weight: 550; }

    .pm-details { border-top: 1px solid var(--pm-line); }
    .pm-details summary { padding: 8px 16px; color: var(--pm-muted); background: var(--pm-surface-soft); cursor: pointer; font-size: 11px; font-weight: 720; list-style: none; }
    .pm-details summary::-webkit-details-marker { display: none; }
    .pm-details summary::after { float: right; content: '+'; font-size: 16px; line-height: 1; }
    .pm-details[open] summary::after { content: '–'; }
    .pm-assessments { display: grid; gap: 0; padding: 3px 18px 10px; }
    .pm-assessment { display: grid; grid-template-columns: minmax(150px, 1fr) repeat(4, auto); gap: 12px; align-items: center; padding: 11px 0; border-bottom: 1px solid var(--pm-line); font-size: 12px; }
    .pm-assessment:last-child { border-bottom: 0; }
    .pm-assessment-name { min-width: 0; color: var(--pm-text); font-weight: 680; }
    .pm-assessment-cell { color: var(--pm-muted); white-space: nowrap; }
    .pm-assessment-cell strong { color: var(--pm-text); }

    .pm-empty { display: none; padding: 54px 20px; border: 1px dashed var(--pm-line); border-radius: 16px; color: var(--pm-muted); text-align: center; }
    .pm-empty strong { display: block; margin-bottom: 5px; color: var(--pm-text); }

    .pm-panels { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 38px; }
    .pm-panel { overflow: hidden; border: 1px solid var(--pm-line); border-radius: 16px; background: var(--pm-surface); }
    .pm-panel > summary { padding: 17px 19px; color: var(--pm-text); cursor: pointer; font-weight: 760; list-style: none; }
    .pm-panel > summary::-webkit-details-marker { display: none; }
    .pm-panel > summary::after { float: right; color: var(--pm-muted); content: '+'; }
    .pm-panel[open] > summary::after { content: '–'; }
    .pm-panel-content { padding: 0 19px 18px; border-top: 1px solid var(--pm-line); }
    .pm-document-list { display: grid; gap: 8px; padding-top: 14px; }
    .pm-document { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px; border-radius: 10px; color: var(--pm-text) !important; background: var(--pm-surface-soft); text-decoration: none; font-size: 12px; font-weight: 650; }
    .pm-document:hover { color: var(--pm-brand) !important; }
    .pm-profile { display: grid; grid-template-columns: max-content 1fr; gap: 9px 18px; margin: 0; padding-top: 15px; font-size: 12px; }
    .pm-profile dt { color: var(--pm-muted); }
    .pm-profile dd { margin: 0; color: var(--pm-text); font-weight: 650; overflow-wrap: anywhere; }

    .pm-legend { margin-top: 23px; color: var(--pm-muted); font-size: 11px; text-align: center; }

    #psso-view-toggle {
      position: fixed;
      z-index: 10000;
      right: 18px;
      bottom: 18px;
      padding: 8px 12px;
      box-shadow: 0 8px 28px rgba(20, 28, 42, .16);
      font-size: 12px;
      font-weight: 750;
    }
    body.${ACTIVE_CLASS} #psso-view-toggle { color: var(--pm-text); background: var(--pm-surface); }

    @media (max-width: 900px) {
      .pm-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .pm-toolbar { position: static; grid-template-columns: 1fr; }
      .pm-toolbar > .pm-select { grid-column: 1; }
      .pm-filter-row { justify-content: flex-start; }
      .pm-module-main { grid-template-columns: minmax(230px, 1fr) minmax(260px, 1fr); gap: 18px; }
    }

    @media (max-width: 620px) {
      .pm-topbar-inner, .pm-shell { width: min(100% - 24px, 1180px); }
      .pm-topbar-inner { min-height: 60px; }
      .pm-brand-copy span, .pm-top-link { display: none; }
      .pm-shell { padding-top: 20px; }
      .pm-hero { display: block; }
      .pm-hero-actions { margin-top: 18px; }
      .pm-stats { gap: 9px; }
      .pm-stat { min-height: 88px; padding: 13px; }
      .pm-stat-value { font-size: 22px; }
      .pm-filter-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .pm-filter-label { grid-column: 1 / -1; }
      .pm-filter-row .pm-select { grid-column: 1 / -1; width: 100%; margin-left: 0; }
      .pm-module-main { display: block; min-height: 0; padding: 14px; }
      .pm-module-meta { margin-top: 14px; }
      .pm-module-meta { grid-template-columns: repeat(3, 1fr); }
      .pm-assessment { grid-template-columns: 1fr 1fr; gap: 6px 12px; }
      .pm-assessment-name { grid-column: 1 / -1; }
      .pm-panels { grid-template-columns: 1fr; }
      .pm-profile { grid-template-columns: 1fr; gap: 2px; }
      .pm-profile dd { margin-bottom: 9px; }
      #psso-view-toggle { right: 12px; bottom: 12px; }
    }

    @media print {
      body.${ACTIVE_CLASS} { --pm-bg: #fff; --pm-surface: #fff; --pm-text: #111; --pm-muted: #555; --pm-line: #ddd; }
      .pm-topbar, .pm-toolbar, .pm-hero-actions, #psso-view-toggle, .pm-panels { display: none !important; }
      .pm-shell { width: 100%; padding: 0; }
      .pm-module-grid { grid-template-columns: 1fr 1fr; }
      .pm-module, .pm-stat { break-inside: avoid; box-shadow: none; }
    }
  `;
  document.head.appendChild(style);

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
  const brandMark = make('span', 'pm-brand-mark', 'TH');
  const brandCopy = make('span', 'pm-brand-copy');
  brandCopy.append(make('strong', '', 'PSSO'), make('span', '', 'Persönliche Studienübersicht'));
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
    storedTheme = localStorage.getItem(STORAGE_THEME) || 'light';
  } catch (_) {}
  setTheme(storedTheme);

  themeButton.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains(DARK_CLASS) ? 'light' : 'dark';
    setTheme(nextTheme);
    try { localStorage.setItem(STORAGE_THEME, nextTheme); } catch (_) {}
  });

  viewToggle.addEventListener('click', () => {
    const willBeActive = !document.body.classList.contains(ACTIVE_CLASS);
    document.body.classList.toggle(ACTIVE_CLASS, willBeActive);
    viewToggle.textContent = willBeActive ? 'Originalansicht' : 'Moderne Ansicht';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.body.classList.add(ACTIVE_CLASS);
  updateVisibility();
})();
