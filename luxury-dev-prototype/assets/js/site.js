/* ===========================================================================
   Everything the pages do at runtime: the construction replay, the sticky
   header, scroll reveals, the mobile menu, the gallery lightbox and the
   contact form's inline confirmation.

   Nothing here is required to read the site. With JavaScript disabled the
   drawing shows its finished frame, the menu still opens (it is a <details>),
   and all content is visible; only the lightbox and the replay are lost.
   =========================================================================== */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* --- the construction drawing ------------------------------------------
     `is-armed` is what switches the animation on. Removing it, forcing a
     reflow and re-adding it is what restarts the sequence. */
  var drawing = document.querySelector(".constr");
  var replay = document.querySelector(".replay");

  function arm() {
    if (!drawing || reduced.matches) return;
    drawing.classList.remove("is-armed");
    void drawing.getBoundingClientRect();     // force reflow so the restart takes
    drawing.classList.add("is-armed");
  }
  if (drawing) arm();
  if (replay) replay.addEventListener("click", arm);

  /* --- header ------------------------------------------------------------- */
  var head = document.querySelector(".site-head");
  var hero = document.querySelector(".hero, .prop-hero");
  if (head) {
    var onScroll = function () {
      var past = hero ? hero.getBoundingClientRect().bottom <= 72 : window.scrollY > 40;
      head.classList.toggle("is-stuck", past);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* --- scroll reveals, staggered 60ms between siblings, once only --------- */
  var revealables = document.querySelectorAll(".reveal");
  if (revealables.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = el.parentNode ? el.parentNode.querySelectorAll(":scope > .reveal") : [];
        var index = Array.prototype.indexOf.call(siblings, el);
        el.style.transitionDelay = (index > 0 ? index * 60 : 0) + "ms";
        el.classList.add("is-in");
        io.unobserve(el);                       // one time only
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
    Array.prototype.forEach.call(revealables, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add("is-in"); });
  }

  /* --- mobile menu: a <details>, so Escape and scroll lock are all JS adds - */
  var menu = document.querySelector(".menu");
  if (menu) {
    menu.addEventListener("toggle", function () {
      document.body.style.overflow = menu.open ? "hidden" : "";
    });
    Array.prototype.forEach.call(menu.querySelectorAll(".menu-panel a"), function (a) {
      a.addEventListener("click", function () { menu.open = false; });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.open) {
        menu.open = false;
        var summary = menu.querySelector("summary");
        if (summary) summary.focus();
      }
    });
  }

  /* --- contact form: prevents default and swaps in a confirmation --------- */
  var form = document.querySelector(".contact-form form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var done = document.createElement("div");
      done.className = "form-done";
      done.setAttribute("role", "status");
      done.innerHTML =
        '<p class="eyebrow" style="margin-bottom:12px">Message received</p>' +
        '<p class="body">Thank you — this is a prototype, so nothing was sent. ' +
        'On a live site this note would reach the team and you would hear back within two working days.</p>';
      form.replaceWith(done);
      done.setAttribute("tabindex", "-1");
      done.focus();
    });
  }

  /* --- gallery lightbox --------------------------------------------------- */
  var box = document.querySelector(".lightbox");
  var shots = document.querySelectorAll(".shot");
  if (box && shots.length) {
    var stage = box.querySelector(".lightbox-stage");
    var count = box.querySelector(".lightbox-count");
    var closeBtn = box.querySelector("[data-lb='close']");
    var current = 0;
    var lastFocused = null;

    function show(i) {
      current = (i + shots.length) % shots.length;
      var source = shots[current].querySelector(".ph");
      var figure = source.cloneNode(true);
      figure.removeAttribute("style");
      stage.replaceChildren(figure);
      count.textContent = (current + 1) + " / " + shots.length;
    }
    function open(i) {
      lastFocused = document.activeElement;
      show(i);
      box.hidden = false;
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }
    function close() {
      box.hidden = true;
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    }
    Array.prototype.forEach.call(shots, function (shot, i) {
      shot.addEventListener("click", function () { open(i); });
    });
    box.addEventListener("click", function (e) {
      if (e.target === box || e.target === stage) close();      // click outside
    });
    Array.prototype.forEach.call(box.querySelectorAll("[data-lb]"), function (b) {
      b.addEventListener("click", function () {
        var act = b.getAttribute("data-lb");
        if (act === "close") close();
        else show(current + (act === "next" ? 1 : -1));
      });
    });
    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") { close(); return; }
      if (e.key === "ArrowRight") { show(current + 1); return; }
      if (e.key === "ArrowLeft") { show(current - 1); return; }
      if (e.key !== "Tab") return;
      // trap focus inside the lightbox
      var focusables = box.querySelectorAll("button");
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
}());
