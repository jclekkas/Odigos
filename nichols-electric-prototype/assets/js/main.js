(function () {
  'use strict';

  var CFG = window.SITE || {};
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------------- year -- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* --------------------------------------------------------------- phone -- */
  // Phone text and Call targets come from config so there is exactly one place
  // to update once the owner confirms the customer-facing number.
  (function applyPhone() {
    var p = CFG.phone || {};
    $$('[data-phone]').forEach(function (el) { el.textContent = p.display || '[PRIMARY PHONE]'; });

    $$('[data-call]').forEach(function (el) {
      if (p.confirmed && p.tel) {
        el.setAttribute('href', 'tel:' + p.tel);
        el.setAttribute('aria-label', 'Call Nichols Electric at ' + p.display);
      } else {
        el.setAttribute('aria-label', 'Contact Nichols Electric — phone number pending confirmation');
        el.setAttribute('data-unconfirmed', 'true');
      }
    });
  }());

  /* --------------------------------------------------------- mobile menu -- */
  (function menu() {
    var toggle = $('#menu-toggle');
    var panel  = $('#mobile-menu');
    if (!toggle || !panel) return;

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      document.body.classList.toggle('menu-open', open);
      if (open) {
        var first = panel.querySelector('a');
        // preventScroll: focusing must not jump the page out from under the menu
        if (first) first.focus({ preventScroll: true });
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setOpen(false);
    });
  }());

  /* -------------------------------------------------------- header state -- */
  (function headerScroll() {
    var header = $('.site-header');
    if (!header) return;
    var ticking = false;
    function update() {
      header.classList.toggle('is-stuck', window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }());

  /* -------------------------------------------------------------- gallery -- */
  var items = CFG.gallery || [];

  (function buildGallery() {
    var grid = $('#gallery');
    if (!grid || !items.length) return;

    items.forEach(function (item, i) {
      var li = document.createElement('li');
      li.className = 'gallery-item' + (item.tall ? ' is-tall' : '');

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gallery-btn';
      btn.setAttribute('data-index', String(i));
      btn.setAttribute('aria-label', 'Open image: ' + item.caption);

      var img = document.createElement('img');
      img.src = item.src;
      img.alt = item.placeholder
        ? item.caption + ' — placeholder image, to be replaced with a Nichols Electric photograph'
        : item.caption;
      img.loading = i < 3 ? 'eager' : 'lazy';
      img.decoding = 'async';
      if (item.w) img.width = item.w;
      if (item.h) img.height = item.h;

      var cap = document.createElement('span');
      cap.className = 'gallery-cap';
      cap.textContent = item.caption;

      btn.appendChild(img);
      btn.appendChild(cap);

      if (item.placeholder) {
        var flag = document.createElement('span');
        flag.className = 'media-flag';
        flag.textContent = 'Placeholder';
        btn.appendChild(flag);
      }

      li.appendChild(btn);
      grid.appendChild(li);
    });
  }());

  /* ------------------------------------------------------------- lightbox -- */
  (function lightbox() {
    var box     = $('#lightbox');
    var imgEl   = $('#lb-img');
    var capEl   = $('#lb-caption');
    var closeEl = $('#lb-close');
    var prevEl  = $('#lb-prev');
    var nextEl  = $('#lb-next');
    var grid    = $('#gallery');
    if (!box || !grid) return;

    var index = 0;
    var lastFocus = null;

    function show(i) {
      index = (i + items.length) % items.length;
      var item = items[index];
      imgEl.src = item.src;
      imgEl.alt = item.caption;
      capEl.textContent = item.caption + (item.placeholder ? ' — placeholder image' : '');
    }

    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      box.hidden = false;
      document.body.classList.add('lb-open');
      closeEl.focus();
    }

    function close() {
      box.hidden = true;
      document.body.classList.remove('lb-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('.gallery-btn');
      if (btn) open(Number(btn.getAttribute('data-index')));
    });

    closeEl.addEventListener('click', close);
    prevEl.addEventListener('click', function () { show(index - 1); });
    nextEl.addEventListener('click', function () { show(index + 1); });

    box.addEventListener('click', function (e) {
      if (e.target === box) close();
    });

    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') { close(); }
      else if (e.key === 'ArrowLeft') { show(index - 1); }
      else if (e.key === 'ArrowRight') { show(index + 1); }
      else if (e.key === 'Tab') {
        // keep focus inside the dialog
        var focusables = [closeEl, prevEl, nextEl];
        var pos = focusables.indexOf(document.activeElement);
        e.preventDefault();
        var next = e.shiftKey ? pos - 1 : pos + 1;
        focusables[(next + focusables.length) % focusables.length].focus();
      }
    });
  }());

  /* --------------------------------------------- service type preselect -- */
  (function preselect() {
    var select = $('#f-service');
    if (!select) return;

    $$('[data-service]').forEach(function (link) {
      link.addEventListener('click', function () {
        var wanted = link.getAttribute('data-service');
        var match = $$('option', select).filter(function (o) { return o.value === wanted || o.textContent === wanted; })[0];
        if (match) {
          select.value = match.value || match.textContent;
          select.classList.add('is-preset');
          window.setTimeout(function () { select.classList.remove('is-preset'); }, 1600);
        }
      });
    });
  }());

  /* ----------------------------------------------------------------- form -- */
  (function form() {
    var f       = $('#estimate-form');
    var success = $('#form-success');
    var detail  = $('#success-detail');
    var reset   = $('#reset-form');
    if (!f || !success) return;

    function showError(id, on) {
      var msg = $('[data-err-for="' + id + '"]');
      var input = document.getElementById(id);
      if (msg) msg.hidden = !on;
      if (input) {
        input.classList.toggle('has-error', on);
        input.setAttribute('aria-invalid', String(on));
      }
    }

    function validate() {
      var ok = true;
      var required = ['f-name', 'f-phone', 'f-address', 'f-service'];

      required.forEach(function (id) {
        var el = document.getElementById(id);
        var bad = !el.value.trim();
        showError(id, bad);
        if (bad && ok) { el.focus(); }
        if (bad) ok = false;
      });

      var email = $('#f-email');
      var badEmail = email.value.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      showError('f-email', badEmail);
      if (badEmail) { if (ok) email.focus(); ok = false; }

      return ok;
    }

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) return;

      var name = $('#f-name').value.trim().split(/\s+/)[0];
      var service = $('#f-service').value;
      detail.textContent = (name ? name + ', t' : 'T') + 'hanks for the details about your ' +
        service.toLowerCase() + ' project. Nichols Electric will follow up to talk it through.';

      f.hidden = true;
      success.hidden = false;
      success.focus();
    });

    // Clear an error as soon as the field is corrected.
    $$('#estimate-form input, #estimate-form select').forEach(function (el) {
      el.addEventListener('input', function () {
        if (el.classList.contains('has-error')) showError(el.id, false);
      });
      el.addEventListener('change', function () {
        if (el.classList.contains('has-error')) showError(el.id, false);
      });
    });

    if (reset) {
      reset.addEventListener('click', function () {
        f.reset();
        success.hidden = true;
        f.hidden = false;
        $('#f-name').focus();
      });
    }
  }());

  /* --------------------------------------------------------------- reveal -- */
  (function reveal() {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var targets = $$('[data-reveal], .section-head, .service-card, .why-item, .who-card, .gallery-item, .feature-copy, .feature-media, .area-copy, .area-media');
    if (reduce || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '120px 0px 0px 0px', threshold: 0.02 });
    targets.forEach(function (el) { el.classList.add('will-reveal'); io.observe(el); });

    // Safety net: content must never stay invisible because an observer never
    // fired (fast scrolling, print, screenshot tools, odd browsers).
    window.setTimeout(function () {
      targets.forEach(function (el) { el.classList.add('is-in'); });
      io.disconnect();
    }, 3000);
  }());
}());
