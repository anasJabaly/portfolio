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
    // Animate small content units, never a whole tall section or a pinned ancestor.
    const targets = gsap.utils.toArray('.section-title, .section-lead, .ov-card, .stat-cell, .case-copy, .case-feature-grid article, .case-metrics > div, .case-gallery figure, .tl-card, .featured-copy, .contact-title, .contact-sub');
    targets.forEach(el => {
      // Content already above the fold (or restored scroll position) stays visible.
      if (el.getBoundingClientRect().top < innerHeight * 0.9) return;
      gsap.from(el, { opacity: 0, y: 20, duration: 0.65, ease: 'power2.out',
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
    document.querySelectorAll('.timeline').forEach(timeline => {
      gsap.fromTo(timeline, { '--timeline-progress': 0 }, { '--timeline-progress': 1, ease: 'none',
        scrollTrigger: { trigger: timeline, start: 'top 70%', end: 'bottom 75%', scrub: true } });
    });
  });
  media.add('(min-width: 1024px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)', () => {
    const intro = document.querySelector('.featured-intro');
    const list = document.querySelector('.featured-list');
    if (intro && list) {
      ScrollTrigger.create({ trigger: intro, start: 'top 112px', endTrigger: list,
        end: () => `bottom ${112 + intro.offsetHeight}px`, pin: intro, pinSpacing: false, invalidateOnRefresh: true });
    }
    document.querySelectorAll('.featured-art, .proj-visual, .case-gallery img').forEach(visual => {
      gsap.fromTo(visual, { y: 8, scale: 0.985 }, { y: -8, scale: 1, ease: 'none',
        scrollTrigger: { trigger: visual, start: 'top bottom', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true } });
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
