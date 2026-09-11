/* ============================================================
   BENJAIRE — shared behaviour
   Progressive: if this file fails to load, every page still
   renders and navigates. Reveal elements are un-hidden by a
   no-JS fallback in site.css's companion rule below.
   ============================================================ */
(function () {
  'use strict';

  /* ─── MOBILE MENU ─── */
  var toggle = document.getElementById('navToggle');
  var menu   = document.getElementById('mobileMenu');

  if (toggle && menu) {
    var setMenu = function (open) {
      toggle.classList.toggle('open', open);
      menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'mobileMenu');

    toggle.addEventListener('click', function () {
      setMenu(!menu.classList.contains('open'));
    });

    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        setMenu(false);
        toggle.focus();
      }
    });

    var wide = window.matchMedia('(min-width: 1025px)');
    wide.addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }

  /* ─── SCROLL PROGRESS ─── */
  var progress = document.getElementById('scrollProgress');
  if (progress) {
    var sync = function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      progress.value = max > 0 ? (window.scrollY / max) * 100 : 0;
    };
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }

  /* ─── REVEAL ON SCROLL ─── */
  var targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
    return;
  }

  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(function (el) { obs.observe(el); });
})();
