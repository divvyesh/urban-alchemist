/* ============================================================
   Urban Alchemist — interaction
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* the four keys */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.ktab'));
  var bodies = Array.prototype.slice.call(document.querySelectorAll('.kbody'));
  var specs = Array.prototype.slice.call(document.querySelectorAll('.spec'));
  function selectKey(i) {
    tabs.forEach(function (t, n) {
      t.setAttribute('aria-selected', n === i ? 'true' : 'false');
      t.setAttribute('tabindex', n === i ? '0' : '-1');
    });
    bodies.forEach(function (b, n) {
      b.classList.toggle('on', n === i);
      if (n === i) b.removeAttribute('hidden'); else b.setAttribute('hidden', '');
    });
    specs.forEach(function (s, n) { s.classList.toggle('on', n === i); });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectKey(i); });
    t.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = (i + 1) % tabs.length;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
      if (n !== null) { e.preventDefault(); selectKey(n); tabs[n].focus(); }
    });
  });
  var keysSection = document.getElementById('keys');
  if (!reduce && tabs.length && keysSection) {
    var idx = 0, visible = false, timer = null;
    function stopAuto() {
      if (timer) { clearInterval(timer); timer = null; }
      ['pointerenter', 'focusin', 'click', 'keydown'].forEach(function (ev) {
        keysSection.removeEventListener(ev, stopAuto);
      });
    }
    ['pointerenter', 'focusin', 'click', 'keydown'].forEach(function (ev) {
      keysSection.addEventListener(ev, stopAuto);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: 0.4 }).observe(keysSection);
    }
    timer = setInterval(function () {
      if (!visible || document.hidden) return;
      idx = (idx + 1) % tabs.length;
      selectKey(idx);
    }, 5200);
  }

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
