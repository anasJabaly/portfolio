/* ============================================================
   ANAS JABALY — PORTFOLIO
   Gemeinsames JavaScript (Start, Werdegang, Projekte)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Mobile-Menü Toggle ---- */
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
    // Menü schließen beim Klick auf einen Link (mobil)
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('open'));
    });
  }

  /* ---- Scroll-Reveal ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  }

  /* ---- Smooth-Scroll für Anker auf gleicher Seite ---- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  /* ---- Projekt-Filter (nur auf projekte.html) ---- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projItems  = document.querySelectorAll('.proj-item');
  if (filterBtns.length && projItems.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.filter;

        // aktiven Button setzen
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Projekte filtern
        projItems.forEach(item => {
          const cats = (item.dataset.cat || '').split(' ');
          if (cat === 'all' || cats.includes(cat)) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });
  }

});
