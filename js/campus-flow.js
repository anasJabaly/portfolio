/* A page-local story: native scroll, no remote assets, readable static fallback. */
document.addEventListener('DOMContentLoaded', () => {
  const tabs = [...document.querySelectorAll('.campus-preview-tabs [role="tab"]')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  const select = (index, focus = false) => {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    if (focus) tabs[index].focus();
    window.ScrollTrigger?.refresh();
  };
  if (tabs.length && panels.every(Boolean)) {
    document.querySelector('.campus-preview-tabs').hidden = false;
    select(0);
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(i));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (i + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault(); select(next, true);
      });
    });
  }
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const chapterLinks = [...document.querySelectorAll('.campus-chapter-nav a')];
  const chapters = [...document.querySelectorAll('.campus-chapter')];
  const activate = index => chapterLinks.forEach((link, i) => {
    if (i === index) link.setAttribute('aria-current', 'step');
    else link.removeAttribute('aria-current');
  });
  chapters.forEach((chapter, index) => ScrollTrigger.create({
    trigger: chapter, start: 'top 58%', end: 'bottom 58%',
    onToggle: self => { if (self.isActive) activate(index); }
  }));
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const hero = document.querySelector('.campus-hero');
    if (scrollY < 40 && !location.hash) {
      gsap.from('.campus-hero-copy > *', { y: 18, opacity: 0, duration: .65, stagger: .065, ease: 'power3.out', clearProps: 'all' });
      gsap.from('.campus-hero-visual', { y: 24, scale: .98, opacity: 0, duration: .9, delay: .2, ease: 'power3.out', clearProps: 'all' });
    }
    document.querySelectorAll('.campus-feature-grid, .campus-start-steps').forEach(group => {
      gsap.from(group.children, { opacity: 0, y: 22, stagger: .08, duration: .65, ease: 'power2.out', clearProps: 'opacity,transform',
        scrollTrigger: { trigger: group, start: 'top 90%', once: true } });
    });
    document.querySelectorAll('.campus-section-intro, .campus-principle h2').forEach(el => {
      if (el.getBoundingClientRect().top < innerHeight * .9) return;
      gsap.from(el, { opacity: 0, y: 18, duration: .65, ease: 'power2.out', clearProps: 'opacity,transform', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });
  });
  media.add('(min-width: 901px) and (min-height: 651px) and (prefers-reduced-motion: no-preference)', () => {
    const board = document.querySelector('.campus-flow-board');
    const notes = [...board.querySelectorAll('.campus-note')];
    const final = board.querySelector('.campus-flow-final');
    const heading = board.querySelector('.campus-board-heading > span');
    const status = board.querySelector('.campus-board-status');
    const layout = document.querySelector('.campus-story-layout');
    board.classList.add('campus-flow-motion');
    const x = [-.23, .22, -.19, .24];
    const y = [-.23, -.18, .18, .24];
    const rotations = [-13, 9, 6, -9];
    gsap.set(notes, { xPercent: -50, yPercent: -50, x: i => board.clientWidth * x[i], y: i => board.clientHeight * y[i], rotation: i => rotations[i] });
    gsap.set(final, { opacity: 0, scale: .9, y: 20 });
    const timeline = gsap.timeline({ scrollTrigger: {
      trigger: layout, start: 'top 38%', end: 'bottom 76%', scrub: .65, invalidateOnRefresh: true,
      onUpdate: self => {
        const phase = self.progress < .35 ? 0 : self.progress < .72 ? 1 : 2;
        heading.textContent = ['Alles auf einmal.', 'Ein Platz für alles.', 'Dein nächster Schritt.'][phase];
        status.textContent = ['Lose Enden', 'Zusammenhang', 'Campus Flow'][phase];
      }
    }});
    timeline.to(notes, { x: i => board.clientWidth * (i % 2 ? .235 : -.235), y: i => i < 2 ? -75 : 75, rotation: 0, duration: 1.5, ease: 'power2.inOut' })
      .to({}, { duration: .45 })
      .to(notes, { opacity: 0, scale: .9, stagger: .05, duration: .55 }, 'reveal')
      .to(final, { opacity: 1, scale: 1, y: 0, duration: .75, ease: 'power2.out' }, 'reveal+=.15');
    gsap.to('.campus-hero-visual', { y: 22, ease: 'none', scrollTrigger: { trigger: '.campus-hero', start: 'top top', end: 'bottom top', scrub: .6 } });
    return () => { board.classList.remove('campus-flow-motion'); heading.textContent = 'Alles auf einmal.'; status.textContent = 'Lose Enden'; };
  });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
});
