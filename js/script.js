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

  /* ============================================================
     REZENSIONS-FORMULAR (nur auf Startseite)
     ============================================================ */
  const reviewToggle  = document.getElementById('reviewToggle');
  const reviewWrap    = document.getElementById('reviewFormWrap');
  const reviewCancel  = document.getElementById('reviewCancel');
  const reviewForm    = document.getElementById('reviewForm');
  const reviewMsg     = document.getElementById('reviewMsg');

  if (reviewToggle && reviewWrap) {
    reviewToggle.addEventListener('click', () => {
      reviewWrap.classList.add('open');
      reviewToggle.style.display = 'none';
      setTimeout(() => {
        reviewWrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    });
  }

  if (reviewCancel) {
    reviewCancel.addEventListener('click', () => {
      reviewWrap.classList.remove('open');
      reviewToggle.style.display = 'inline-flex';
      reviewForm.reset();
      reviewMsg.className = 'form-msg';
      reviewMsg.textContent = '';
    });
  }

  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(reviewForm);
      const submitBtn = reviewForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Wird gesendet...';

      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();

        if (data.success) {
          reviewMsg.className = 'form-msg success';
          reviewMsg.textContent = '✓ Vielen Dank! Deine Bewertung wurde erfolgreich gesendet. Ich prüfe sie und stelle sie ggf. demnächst auf der Seite online.';
          reviewForm.reset();
        } else {
          throw new Error(data.message || 'Unbekannter Fehler');
        }
      } catch (err) {
        reviewMsg.className = 'form-msg error';
        reviewMsg.textContent = '✗ Das hat leider nicht funktioniert. Bitte versuche es später erneut oder schreib mir direkt eine E-Mail.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Bewertung absenden <span class="arrow">→</span>';
      }
    });
  }

});