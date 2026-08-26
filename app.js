/* ============================================================
   Urban Alchemist — interaction
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.documentElement.classList.add('js-on');

  var hdr = document.getElementById('hdr');
  var onScroll = function () { hdr.classList.toggle('stuck', window.scrollY > 40); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* reveals — hidden state is gated on JS so a no-JS visitor gets the whole page */
  var rvs = document.querySelectorAll('.rv');
  if (reduce || !('IntersectionObserver' in window)) {
    rvs.forEach(function (el) { el.classList.add('in'); });
  } else {
    document.documentElement.classList.add('js-rv');
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
    rvs.forEach(function (el) { rio.observe(el); });
  }

  /* shelf cards — disclosure, collapsed only when JS is on */
  Array.prototype.slice.call(document.querySelectorAll('.card__more')).forEach(function (b) {
    var panel = document.getElementById(b.getAttribute('aria-controls'));
    if (!panel) return;
    var label = b.querySelector('.card__more-t');
    b.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (label) label.textContent = open ? 'Close' : 'See this shelf';
    });
  });

  /* anchor offset for the fixed header */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || id === '#top') return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 76, behavior: reduce ? 'auto' : 'smooth' });
    });
  });
})();

/* ============ AGE GATE — injected after content so the page stays crawlable ============ */
(function () {
  'use strict';
  var KEY = 'ua_age_ok_v2';
  try { if (sessionStorage.getItem(KEY) === '1') return; } catch (e) { /* storage blocked — show the gate */ }

  var g = document.createElement('div');
  g.className = 'gate';
  g.setAttribute('role', 'dialog');
  g.setAttribute('aria-modal', 'true');
  g.setAttribute('aria-labelledby', 'ag-t');
  g.innerHTML =
    '<div class="gate__p">' +
      '<img src="assets/logo-mark.webp" width="360" height="359" alt="">' +
      '<h2 class="d3" id="ag-t">Are you 21 or older?</h2>' +
      '<p>Urban Alchemist is an adults-only wellness boutique in Lincoln Park, Chicago.</p>' +
      '<div class="gate__b">' +
        '<button class="btn btn--fill" data-yes><span>Yes, I am 21+</span></button>' +
        '<button class="btn btn--line" data-no>No</button>' +
      '</div>' +
      '<p class="fine">We check ID for anyone who appears under 30, every time.<br>' +
      'Nothing on this site is offered for sale online.</p>' +
    '</div>';
  document.body.appendChild(g);

  var html = document.documentElement, prev = html.style.overflow;
  html.style.overflow = 'hidden';

  var behind = [];
  Array.prototype.forEach.call(document.body.children, function (el) {
    if (el === g || el.tagName === 'SCRIPT' || el.tagName === 'NOSCRIPT') return;
    behind.push([el, el.getAttribute('aria-hidden')]);
    el.setAttribute('aria-hidden', 'true');
    try { el.inert = true; } catch (e) {}
  });
  function release() {
    behind.forEach(function (p) {
      if (p[1] === null) p[0].removeAttribute('aria-hidden'); else p[0].setAttribute('aria-hidden', p[1]);
      try { p[0].inert = false; } catch (e) {}
    });
  }

  var yes = g.querySelector('[data-yes]'), no = g.querySelector('[data-no]');
  yes.focus();
  yes.addEventListener('click', function () {
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    release();
    g.style.transition = 'opacity .45s cubic-bezier(.16,.84,.3,1)';
    g.style.opacity = '0';
    html.style.overflow = prev;
    setTimeout(function () { g.remove(); }, 470);
  });
  no.addEventListener('click', function () {
    var panel = g.querySelector('.gate__p');
    panel.setAttribute('tabindex', '-1');
    panel.innerHTML =
      '<img src="assets/logo-mark.webp" width="360" height="359" alt="">' +
      '<h2 class="d3">Come back when you\'re 21.</h2>' +
      '<p>You must be 21 or older to enter this site. Thanks for stopping by.</p>';
    panel.focus();
  });
  g.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var f = g.querySelectorAll('button');
    if (!f.length) { e.preventDefault(); return; }
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();
