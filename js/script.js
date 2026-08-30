/* ============================================================
   ANAS JABALY — PORTFOLIO
   Gemeinsames JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Mobile-Menü Toggle ---- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Bestehende Scroll-Reveals ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (!('IntersectionObserver' in window) || reduceMotion) {
      revealEls.forEach((el) => el.classList.add('visible'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealEls.forEach((el) => io.observe(el));
    }
  }

  /* ---- Smooth-Scroll für Anker auf gleicher Seite ---- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      if (id && id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          event.preventDefault();
          target.scrollIntoView({
            behavior: reduceMotion ? 'auto' : 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  /* ---- Projekt-Filter (nur auf projekte.html) ---- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projItems = document.querySelectorAll('.proj-item');
  if (filterBtns.length && projItems.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.filter;
        filterBtns.forEach((item) => item.classList.remove('active'));
        btn.classList.add('active');

        projItems.forEach((item) => {
          const cats = (item.dataset.cat || '').split(' ');
          item.classList.toggle('hidden', cat !== 'all' && !cats.includes(cat));
        });
      });
    });
  }

  /* ---- Erweiterte Animationen auf der Startseite ---- */
  const homePage = document.body.classList.contains('home-page');
  if (homePage) {
    const nav = document.querySelector('.nav');
    const hero = document.querySelector('.hero');
    const overviewSection = document.querySelector('.home-scroll-section');

    // Dezenter Lesefortschritt, passend zu den Case Studies.
    const progress = document.createElement('div');
    progress.className = 'home-progress';
    progress.setAttribute('aria-hidden', 'true');
    progress.innerHTML = '<span></span>';
    document.body.prepend(progress);
    const progressBar = progress.firstElementChild;

    const revealGroups = [
      '.section .section-tag',
      '.section .section-title',
      '.section .section-lead',
      '.overview-grid .ov-card',
      '.stat-strip .stat-cell',
      '.feat-grid .feat-card',
      '.center-cta',
      '.contact .section-tag, .contact-title, .contact-sub, .contact-mail, .contact-links'
    ];

    const homeRevealEls = [];
    revealGroups.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el, index) => {
        // Der Schwerpunkte-Abschnitt wird als kompletter Block eingeblendet.
        if (el.closest('.home-scroll-section')) return;
        el.classList.add('home-reveal');
        const stagger = el.matches('.ov-card, .stat-cell') ? (index % 4) * 90 : 0;
        el.style.setProperty('--home-reveal-delay', `${stagger}ms`);
        homeRevealEls.push(el);
      });
    });
    document.body.classList.add('home-motion-ready');

    // Verhindert den isolierten Abschnittstitel am unteren Fensterrand:
    // Der gesamte Block wird erst nach einer bewussten Scrollbewegung sichtbar.
    if (overviewSection) {
      if (!('IntersectionObserver' in window) || reduceMotion) {
        overviewSection.classList.add('is-visible');
      } else {
        let overviewObserver;
        const showOverview = () => {
          overviewSection.classList.add('is-visible');
          overviewObserver?.unobserve(overviewSection);
          window.removeEventListener('scroll', revealOverviewAfterScroll);
        };
        const revealOverviewAfterScroll = () => {
          if (window.scrollY <= 16) return;
          const rect = overviewSection.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.82 && rect.bottom > 0) {
            showOverview();
          }
        };

        overviewObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && window.scrollY > 16) showOverview();
          });
        }, { rootMargin: '0px 0px -18% 0px', threshold: 0.08 });

        overviewObserver.observe(overviewSection);
        window.addEventListener('scroll', revealOverviewAfterScroll, { passive: true });
        revealOverviewAfterScroll();
      }
    }

    const animateNumber = (element) => {
      if (element.dataset.counted === 'true') return;
      const raw = element.textContent.trim();
      const decimalPlaces = raw.includes(',') ? raw.split(',')[1].length : 0;
      const target = Number.parseFloat(raw.replace(',', '.'));
      if (!Number.isFinite(target)) return;

      element.dataset.counted = 'true';
      if (reduceMotion) return;

      const duration = 1050;
      const start = performance.now();
      const easeOut = (value) => 1 - Math.pow(1 - value, 3);

      const tick = (now) => {
        const progressValue = Math.min(1, (now - start) / duration);
        const current = target * easeOut(progressValue);
        element.textContent = current
          .toFixed(decimalPlaces)
          .replace('.', ',');
        if (progressValue < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window) || reduceMotion) {
      homeRevealEls.forEach((el) => el.classList.add('is-visible'));
      document.querySelectorAll('.stat-cell .num').forEach(animateNumber);
    } else {
      const homeObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          if (entry.target.classList.contains('stat-cell')) {
            const number = entry.target.querySelector('.num');
            if (number) animateNumber(number);
          }
          homeObserver.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -9% 0px', threshold: 0.12 });
      homeRevealEls.forEach((el) => homeObserver.observe(el));
    }

    // Lichtreflex folgt auf Geräten mit Maus den Karten und dem Hero.
    if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      document.querySelectorAll('.ov-card, .stat-cell, .feat-card').forEach((card) => {
        card.addEventListener('pointermove', (event) => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--home-spot-x', `${event.clientX - rect.left}px`);
          card.style.setProperty('--home-spot-y', `${event.clientY - rect.top}px`);
        });
      });

      hero?.addEventListener('pointermove', (event) => {
        const rect = hero.getBoundingClientRect();
        const x = Math.max(12, Math.min(90, ((event.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(5, Math.min(88, ((event.clientY - rect.top) / rect.height) * 100));
        document.body.style.setProperty('--home-pointer-x', `${x}%`);
        document.body.style.setProperty('--home-pointer-y', `${y}%`);
      });
    }

    let homeTicking = false;
    const updateHomeScrollEffects = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const ratio = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      progressBar.style.transform = `scaleX(${ratio})`;
      nav?.classList.toggle('nav-scrolled', window.scrollY > 18);

      if (!reduceMotion && window.innerWidth > 720) {
        const heroShift = Math.min(28, window.scrollY * 0.07);
        document.body.style.setProperty('--home-hero-shift', `${heroShift}px`);
      }
      homeTicking = false;
    };

    const requestHomeScrollUpdate = () => {
      if (!homeTicking) {
        requestAnimationFrame(updateHomeScrollEffects);
        homeTicking = true;
      }
    };

    window.addEventListener('scroll', requestHomeScrollUpdate, { passive: true });
    window.addEventListener('resize', requestHomeScrollUpdate, { passive: true });
    updateHomeScrollEffects();
  }

  /* ---- Gemeinsame Case-Study-Animationen ---- */
  const casePage = document.body.classList.contains('case-page');
  if (casePage) {
    const nav = document.querySelector('.nav');
    const hero = document.querySelector('.case-hero');

    // Lesefortschritt erzeugen, ohne zusätzliches HTML in jeder Case Study.
    const progress = document.createElement('div');
    progress.className = 'case-progress';
    progress.setAttribute('aria-hidden', 'true');
    progress.innerHTML = '<span></span>';
    document.body.prepend(progress);
    const progressBar = progress.firstElementChild;

    // Inhalte automatisch gruppieren und mit gestaffelten Delays versehen.
    const revealGroups = [
      '.case-section .section-tag, .case-soft .section-tag',
      '.case-section .section-title, .case-soft .section-title',
      '.case-copy',
      '.case-feature-grid article',
      '.case-metrics div',
      '.case-gallery figure',
      '.contact .section-tag, .contact-title, .contact-sub, .contact-mail, .contact-links'
    ];

    const caseRevealEls = [];
    revealGroups.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el, index) => {
        el.classList.add('case-reveal');
        // Karten/Galerien staffeln, große Textblöcke bleiben direkt.
        const stagger = el.matches('article, .case-metrics div, figure') ? (index % 4) * 85 : 0;
        el.style.setProperty('--reveal-delay', `${stagger}ms`);
        caseRevealEls.push(el);
      });
    });

    document.body.classList.add('motion-ready');

    if (!('IntersectionObserver' in window) || reduceMotion) {
      caseRevealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
      const caseObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-visible', entry.isIntersecting);
        });
      }, { rootMargin: '0px 0px -9% 0px', threshold: 0.12 });
      caseRevealEls.forEach((el) => caseObserver.observe(el));
    }

    // Spotlight folgt dem Mauszeiger innerhalb der Karten.
    if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      document.querySelectorAll('.case-feature-grid article, .case-metrics div, .case-gallery figure')
        .forEach((card) => {
          card.addEventListener('pointermove', (event) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
            card.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
          });
        });

      if (hero) {
        hero.addEventListener('pointermove', (event) => {
          const rect = hero.getBoundingClientRect();
          const x = Math.max(15, Math.min(88, ((event.clientX - rect.left) / rect.width) * 100));
          const y = Math.max(5, Math.min(82, ((event.clientY - rect.top) / rect.height) * 100));
          document.body.style.setProperty('--case-pointer-x', `${x}%`);
          document.body.style.setProperty('--case-pointer-y', `${y}%`);
        });
      }
    }

    const galleryImages = [...document.querySelectorAll('.case-gallery figure')];
    let ticking = false;

    const updateScrollEffects = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const ratio = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      progressBar.style.transform = `scaleX(${ratio})`;
      nav?.classList.toggle('nav-scrolled', window.scrollY > 18);

      if (!reduceMotion && window.innerWidth > 720) {
        galleryImages.forEach((figure) => {
          const rect = figure.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top < window.innerHeight) {
            const centerOffset = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
            const y = Math.max(-18, Math.min(18, centerOffset * -34));
            figure.style.setProperty('--parallax-y', `${y}px`);
          }
        });
      }
      ticking = false;
    };

    const requestScrollUpdate = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollEffects);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    window.addEventListener('resize', requestScrollUpdate, { passive: true });
    updateScrollEffects();
  }
});
