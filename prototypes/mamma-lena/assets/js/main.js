/* Mamma Lena — prototype interactions.
   Vanilla JS, no dependencies. Everything degrades gracefully without it. */
(function () {
  'use strict';

  var header   = document.getElementById('siteHeader');
  var toggle   = document.getElementById('navToggle');
  var mobileNav= document.getElementById('mobileNav');
  var sticky   = document.getElementById('stickyCta');
  var modal    = document.getElementById('modal');
  var hero     = document.querySelector('.hero');
  var reduced  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- year ---------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ------------- header state ------------ */
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 40);
    if (sticky && hero) {
      // Reveal the sticky bar once the hero's own Reserve button is off screen.
      var past = window.scrollY > hero.offsetHeight * 0.75;
      sticky.classList.toggle('is-visible', past);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------- mobile nav -------------- */
  function closeNav() {
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    mobileNav.classList.remove('is-open');
    header.classList.remove('is-scrolled-lock');
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      if (open) { closeNav(); return; }
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
      mobileNav.classList.add('is-open');
      header.classList.add('is-scrolled');
    });
    mobileNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
  }

  /* --------------- modal ----------------- */
  var COPY = {
    reserve: {
      title: 'Reserve a table',
      body: [
        'In the finished site this button opens a live booking flow — OpenTable, Resy, ' +
        'or a simple in-house form — so a guest never leaves the page.',
        'Today, the fastest way to book is still the phone.'
      ]
    },
    story: {
      title: 'Our story',
      body: [
        'In the finished site this opens a longer story page — the family, Naples, the ' +
        'move to Maryland, and the photographs that go with it.',
        'It is the page that turns a first-time visitor into someone who books.'
      ]
    },
    menu: {
      title: 'The full menu',
      body: [
        'In the finished site this opens a full menu page — every section, updated by the ' +
        'kitchen without a developer, and readable on a phone at the table.',
        'For the prototype, the preview above stands in for it.'
      ]
    }
  };

  var lastFocus = null;

  function openModal(kind) {
    if (!modal) return;
    var copy = COPY[kind] || COPY.reserve;
    modal.querySelector('.modal__title').textContent = copy.title;
    var bodies = modal.querySelectorAll('.modal__body');
    for (var i = 0; i < bodies.length; i++) {
      bodies[i].textContent = copy.body[i] || '';
      bodies[i].hidden = !copy.body[i];
    }
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('is-locked');
    var close = modal.querySelector('.modal__close');
    if (close) close.focus();
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('is-locked');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('click', function (e) {
    var res = e.target.closest('[data-reserve]');
    if (res) { e.preventDefault(); closeNav(); openModal('reserve'); return; }

    var proto = e.target.closest('[data-proto]');
    if (proto) { e.preventDefault(); openModal(proto.getAttribute('data-proto')); return; }

    if (e.target.closest('[data-close]')) { e.preventDefault(); closeModal(); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeModal(); closeNav(); }
    // Keep tab focus inside the dialog while it is open.
    if (e.key === 'Tab' && modal && !modal.hidden) {
      var f = modal.querySelectorAll('button, a[href]');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ------------ scroll reveals ----------- */
  var items = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    for (var j = 0; j < items.length; j++) items[j].classList.add('is-visible');
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        // Stagger siblings slightly so grids resolve rather than snap.
        var parent = entry.target.parentElement;
        var sibs = parent ? Array.prototype.filter.call(parent.children, function (c) {
          return c.classList.contains('reveal');
        }) : [];
        var idx = Math.max(0, sibs.indexOf(entry.target));
        entry.target.style.transitionDelay = Math.min(idx * 80, 320) + 'ms';
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    for (var k = 0; k < items.length; k++) io.observe(items[k]);
  }
})();
