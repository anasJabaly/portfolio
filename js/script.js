/* Progressive enhancement: every page remains readable without JavaScript or GSAP. */
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('js-ready');
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  const closeMenu = () => {
    links?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  };
  if (toggle && links) {
    links.id = 'navigation';
    toggle.setAttribute('aria-controls', links.id);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', String(links.classList.toggle('open')));
    });
    links.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && links.classList.contains('open')) {
        closeMenu(); toggle.focus();
      }
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('.nav')) closeMenu();
    });
    window.matchMedia('(min-width: 721px)').addEventListener('change', closeMenu);
    links.querySelector('a.active')?.setAttribute('aria-current', 'page');
  }

  const filterBtns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.proj-item');
  filterBtns.forEach(btn => {
    btn.setAttribute('aria-pressed', String(btn.classList.contains('active')));
    btn.addEventListener('click', () => {
      filterBtns.forEach(other => {
        other.classList.toggle('active', other === btn);
        other.setAttribute('aria-pressed', String(other === btn));
      });
      items.forEach(item => {
        const hidden = btn.dataset.filter !== 'all' && !item.dataset.cat.split(' ').includes(btn.dataset.filter);
        item.hidden = hidden;
        item.classList.toggle('hidden', hidden);
      });
      window.ScrollTrigger?.refresh();
    });
  });

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.innerHTML = '<span></span>';
  document.body.prepend(progress);
  const bar = progress.firstElementChild;
  const nav = document.querySelector('.nav');
  if (!window.gsap || !window.ScrollTrigger) {
    let queued = false;
    const update = () => {
      bar.style.transform = `scaleX(${window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)})`;
      queued = false;
    };
    window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
    return;
  }
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => {
    bar.style.transform = `scaleX(${self.progress})`;
    nav?.classList.toggle('nav-scrolled', self.scroll() > 18);
  }});

  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const compact = window.matchMedia('(max-width: 720px)').matches;
    const hero = document.querySelector('.hero');
    if (hero && window.scrollY < 40 && !window.location.hash) {
      gsap.from(hero.querySelectorAll('.hero-meta, .hero-title, .hero-tagline, .hero-cta, .hero-experience, .scroll-hint, .hero-portrait'), {
        opacity: 0, y: compact ? 12 : 22, stagger: 0.075, duration: 0.7,
        ease: 'power3.out', clearProps: 'opacity,transform'
      });
    }
    // Reveal related cards together; each row uses the same restrained rhythm.
    const grouped = new Set();
    document.querySelectorAll('.overview-grid, .stat-strip, .skills-grid, .teaching-path').forEach(group => {
      const children = [...group.children];
      children.forEach(child => grouped.add(child));
      const pending = children.filter(child => child.getBoundingClientRect().top >= innerHeight * 0.9);
      if (pending.length) gsap.from(pending, {
        opacity: 0, y: compact ? 12 : 24, stagger: compact ? 0.045 : 0.09,
        duration: 0.6, ease: 'power3.out', clearProps: 'opacity,transform',
        scrollTrigger: { trigger: pending[0], start: 'top 92%', once: true }
      });
    });
    // Animate small content units, never a whole tall section or a pinned ancestor.
    const targets = gsap.utils.toArray('.section-title, .section-lead, .ov-card, .stat-cell, .case-copy, .case-feature-grid article, .case-metrics > div, .case-gallery figure, .featured-copy, .contact-title, .contact-sub');
    targets.forEach(el => {
      // Content already above the fold (or restored scroll position) stays visible.
      if (grouped.has(el) || el.getBoundingClientRect().top < innerHeight * 0.9) return;
      gsap.from(el, { opacity: 0, y: compact ? 12 : 20, duration: 0.65, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true }, clearProps: 'opacity,transform' });
    });
    document.querySelectorAll('.skill-box').forEach(box => {
      gsap.from(box.querySelectorAll('li'), { opacity: 0, x: 12, stagger: 0.065, duration: 0.45,
        scrollTrigger: { trigger: box, start: 'top 90%', once: true }, clearProps: 'opacity,transform' });
    });
    const hint = document.querySelector('.scroll-hint span');
    if (hint) {
      const bounce = gsap.to(hint, { y: 6, repeat: -1, yoyo: true, duration: 0.9, ease: 'sine.inOut' });
      ScrollTrigger.create({ trigger: '.hero', start: 'top bottom', end: 'bottom top', onToggle: self => self.isActive ? bounce.play() : bounce.pause() });
    }
    const counters = [...document.querySelectorAll('[data-count]')];
    const counterLabels = counters.map(el => el.textContent);
    counters.forEach(el => {
      const value = { number: 0 };
      const decimals = Number(el.dataset.decimals || 0);
      gsap.to(value, { number: Number(el.dataset.count), duration: 1.3, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => { el.textContent = value.number.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }); }
      });
    });
    document.querySelectorAll('.tl-card').forEach(card => {
      if (card.getBoundingClientRect().top < innerHeight * .9) return;
      gsap.from(card, { opacity: 0, x: compact ? -12 : -24, y: 12, duration: .8, ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 88%', once: true }, clearProps: 'opacity,transform' });
    });
    const timelineEntries = [...document.querySelectorAll('.tl-entry')];
    timelineEntries.forEach(entry => ScrollTrigger.create({
      trigger: entry, start: 'top 75%', toggleClass: 'timeline-reached'
    }));
    document.querySelectorAll('.timeline').forEach(timeline => {
      gsap.fromTo(timeline, { '--timeline-progress': 0 }, { '--timeline-progress': 1, ease: 'none',
        scrollTrigger: { trigger: timeline, start: 'top 70%', end: 'bottom 75%', scrub: true } });
    });
    return () => {
      timelineEntries.forEach(entry => entry.classList.remove('timeline-reached'));
      counters.forEach((el, i) => { el.textContent = counterLabels[i]; });
    };
  });
  media.add('(min-width: 1024px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)', () => {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) gsap.to(heroContent, {
      y: -24, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
    });
    const portrait = document.querySelector('.portrait-image');
    if (portrait) gsap.fromTo(portrait, { scale: 1 }, { scale: 1.07, y: 12, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .8 } });
    const beats = gsap.utils.toArray('.approach-title span');
    if (beats.length) gsap.from(beats, { opacity: .25, x: 24, stagger: .22, ease: 'none',
      scrollTrigger: { trigger: '.approach-section', start: 'top 72%', end: 'bottom 58%', scrub: .5 } });
    const intro = document.querySelector('.featured-intro');
    const list = document.querySelector('.featured-list');
    if (intro && list) {
      ScrollTrigger.create({ trigger: intro, start: 'top 112px', endTrigger: list,
        end: () => `bottom ${112 + intro.offsetHeight}px`, pin: intro, pinSpacing: false, invalidateOnRefresh: true });
    }
    document.querySelectorAll('.project-window img, .proj-visual, .case-gallery img').forEach(visual => {
      gsap.fromTo(visual, { y: 8, scale: 0.985 }, { y: -8, scale: 1, ease: 'none',
        scrollTrigger: { trigger: visual, start: 'top bottom', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true } });
    });
  });
  const projectLinks = [...document.querySelectorAll('.project-index a')];
  document.querySelectorAll('.featured-project').forEach(card => {
    ScrollTrigger.create({ trigger: card, start: 'top 55%', end: 'bottom 55%',
      onToggle: self => {
        if (self.isActive) projectLinks.forEach(link => {
          if (link.hash === '#' + card.id) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      }
    });
  });
  // Focused links must never remain inside a pending reveal.
  document.addEventListener('focusin', event => {
    let node = event.target;
    while (node && node !== document.body) {
      gsap.getTweensOf(node).forEach(tween => { if (!tween.scrollTrigger?.vars.scrub) tween.progress(1); });
      node = node.parentElement;
    }
  });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  window.addEventListener('pageshow', () => ScrollTrigger.refresh());
});
