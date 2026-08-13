  document.getElementById('year').textContent = new Date().getFullYear();
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

  // project video cards: hover to preview (muted, silent), click to open real lightbox playback
  const lightbox = document.getElementById('lightbox');
  const lightboxInner = document.getElementById('lightboxInner');
  const lightboxVideo = document.getElementById('lightboxVideo');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  function openLightbox(src, caption, portrait){
    lightboxVideo.src = src;
    lightboxCaption.textContent = caption || '';
    lightboxInner.classList.toggle('wide', !portrait);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lightboxVideo.currentTime = 0;
    lightboxVideo.play().catch(()=>{});
  }
  function closeLightbox(){
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lightboxVideo.pause();
    lightboxVideo.removeAttribute('src');
    lightboxVideo.load();
  }
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  document.querySelectorAll('[data-video]').forEach(card => {
    const video = card.querySelector('video');
    const portrait = card.classList.contains('portrait');

    card.addEventListener('mouseenter', () => { video.play().catch(()=>{}); });
    card.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; });

    card.addEventListener('click', () => {
      video.pause();
      openLightbox(card.dataset.full, card.dataset.caption, portrait);
    });
  });

  // ---- contact page: service search + filter ----
  (function () {
    const searchInput = document.getElementById('serviceSearch');
    const filterSelect = document.getElementById('serviceFilter');
    const chips = document.querySelectorAll('#serviceChips .chip');
    const noResults = document.getElementById('noResults');
    const messageField = document.querySelector('.contact-form textarea[name="message"]');
    if (!searchInput || !filterSelect || !chips.length) return;

    function applyFilters() {
      const query = searchInput.value.trim().toLowerCase();
      const category = filterSelect.value;
      let visibleCount = 0;

      chips.forEach(chip => {
        const matchesText = chip.textContent.toLowerCase().includes(query);
        const matchesCategory = category === 'all' || chip.dataset.category === category;
        const show = matchesText && matchesCategory;
        chip.classList.toggle('hidden', !show);
        if (show) visibleCount++;
      });

      noResults.classList.toggle('show', visibleCount === 0);
    }

    searchInput.addEventListener('input', applyFilters);
    filterSelect.addEventListener('change', applyFilters);

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        if (!messageField) return;
        const service = chip.textContent.trim();
        const prefix = `I'm interested in ${service}. `;
        if (!messageField.value.startsWith(prefix)) {
          messageField.value = prefix + messageField.value;
        }
        messageField.focus();
      });
    });
  })();

  // ---- credibility stats count-up ----
  (function () {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function animate(el) {
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      if (prefersReduced) { el.textContent = target + suffix; return; }
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const value = Math.round(target * eased);
        el.textContent = value + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    counters.forEach(el => io.observe(el));
  })();

  // ---- smooth (inertia) scroll, Podcutz-style ----
  (function () {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

    // Keep native scroll on touch devices and reduced-motion — inertia scroll
    // fights with mobile touch scrolling and violates the user's motion setting.
    if (prefersReduced || isCoarsePointer) {
      document.body.classList.add('no-smooth-scroll');
      return;
    }

    const content = document.getElementById('smooth-content');
    let current = window.scrollY;
    let target = window.scrollY;
    const ease = 0.09;

    function setBodyHeight() {
      document.body.style.height = content.getBoundingClientRect().height + 'px';
    }
    setBodyHeight();
    window.addEventListener('resize', setBodyHeight);
    new ResizeObserver(setBodyHeight).observe(content);

    window.addEventListener('scroll', () => { target = window.scrollY; }, { passive: true });

    function raf() {
      current += (target - current) * ease;
      if (Math.abs(target - current) < 0.05) current = target;
      content.style.transform = `translateY(${-current}px)`;
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  })();
