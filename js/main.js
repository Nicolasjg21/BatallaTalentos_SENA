/* =====================================================
   BATALLA DE TALENTOS 2026 — main.js
===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── 1. AOS Init ─────────────────────────────── */
  AOS.init({
    duration: 750,
    once: true,
    easing: 'ease-out-cubic',
    offset: 60,
  });

  /* ─── 2. Navbar scroll effect ─────────────────── */
  const nav = document.getElementById('mainNav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run on load
  }

  /* ─── 3. Active nav-link highlight ────────────── */
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('#navbarNav .nav-link');

  const highlightNav = () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
  };
  window.addEventListener('scroll', highlightNav, { passive: true });

  /* ─── 4. Gallery Modal ─────────────────────────── */
  const galModal = document.getElementById('galModal');
  if (galModal) {
    const modalImg = document.getElementById('galModalImg');
    const modalCap = document.getElementById('galModalCap');

    document.querySelectorAll('.g-item').forEach(item => {
      item.addEventListener('click', () => {
        const src   = item.dataset.img;
        const capEs = item.dataset.capEs || '';
        const capEn = item.dataset.capEn || '';
        if (modalImg) modalImg.src = src;
        if (modalCap) {
          const lang = document.documentElement.dataset.lang || 'es';
          modalCap.textContent = lang === 'en' ? capEn : capEs;
        }
      });
    });

    // Clear src on close to stop any preloading
    galModal.addEventListener('hidden.bs.modal', () => {
      if (modalImg) modalImg.src = '';
    });
  }

  /* ─── 5. Navbar collapse on mobile link click ── */
  const navbarCollapse = document.getElementById('navbarNav');
  if (navbarCollapse) {
    document.querySelectorAll('#navbarNav .nav-link').forEach(link => {
      link.addEventListener('click', () => {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse) bsCollapse.hide();
      });
    });
  }

  /* ─── 6. Counter animation (stats) ────────────── */
  const statNums = document.querySelectorAll('.stat-n');
  const observeStats = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const raw = el.textContent.trim();
      const num = parseInt(raw.replace(/\D/g, ''), 10);
      if (isNaN(num)) return;
      const suffix = raw.replace(/[\d]/g, '');
      const duration = 900;
      const start    = performance.now();
      const animate  = (now) => {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
        el.textContent = Math.round(eased * num) + suffix;
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
      observeStats.unobserve(el);
    });
  }, { threshold: 0.6 });

  statNums.forEach(el => {
    const txt = el.textContent.trim();
    // Only animate purely numeric values (skip "SENA", "2026", etc.)
    if (/^\d+[\+\%]?$/.test(txt)) observeStats.observe(el);
  });

});

/* ─── 7. Language toggle (global) ───────────────── */
function setLang(lang) {
  document.documentElement.dataset.lang = lang;

  // Toggle button active state
  document.querySelectorAll('.lpill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.id === 'btn-' + lang);
  });

  // Toggle all ES/EN elements
  // Convention: id ends in "-es" / "-en"  OR class "d-none" toggled by data-lang
  const esEls = document.querySelectorAll('[id$="-es"]:not(.lpill-btn), [id^="es-"]');
  const enEls = document.querySelectorAll('[id$="-en"]:not(.lpill-btn), [id^="en-"]');

  esEls.forEach(el => el.classList.toggle('d-none', lang === 'en'));
  enEls.forEach(el => el.classList.toggle('d-none', lang === 'es'));

  // Update open gallery modal caption if modal is visible
  const galModal = document.getElementById('galModal');
  if (galModal && galModal.classList.contains('show')) {
    const activeItem = document.querySelector('.g-item[data-bs-target="#galModal"]');
    if (activeItem) {
      const cap = lang === 'en' ? activeItem.dataset.capEn : activeItem.dataset.capEs;
      const capEl = document.getElementById('galModalCap');
      if (capEl && cap) capEl.textContent = cap;
    }
  }
}

/* ─── 8. Glossary filter & search (glossary.html) ─ */
function initGlossary() {
  const searchInput = document.getElementById('glossSearch');
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const rows        = document.querySelectorAll('#glossTable tbody tr');

  if (!rows.length) return;

  let currentFilter = 'all';
  let currentQuery  = '';

  const applyFilters = () => {
    rows.forEach(row => {
      const category  = (row.dataset.category || '').toLowerCase();
      const rowText   = row.textContent.toLowerCase();
      const matchCat  = currentFilter === 'all' || category === currentFilter;
      const matchQuery= !currentQuery || rowText.includes(currentQuery);
      row.style.display = matchCat && matchQuery ? '' : 'none';
    });
  };

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentQuery = searchInput.value.toLowerCase().trim();
      applyFilters();
    });
  }
}

document.addEventListener('DOMContentLoaded', initGlossary);
