(function () {
  'use strict';

  var section = document.getElementById('featured');
  var viewport = document.getElementById('featured-window');
  var track = document.getElementById('featured-track');
  var previous = document.getElementById('featured-prev');
  var next = document.getElementById('featured-next');
  var motion = document.getElementById('featured-motion');
  var status = document.getElementById('featured-status');
  if (!section || !viewport || !track || !previous || !next || !motion || !status) return;

  var cards = Array.prototype.slice.call(track.querySelectorAll('article.product-tile'));
  if (!cards.length) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var userPaused = reduce.matches;
  var hovered = section.matches ? section.matches(':hover') : false;
  var focused = section.contains(document.activeElement);
  var interacting = false;
  var visible = true;
  var stops = [];
  var current = 0;
  var timer;
  var scrollTimer;
  var delay = 4500;

  function sectionIsVisible() {
    var rect = section.getBoundingClientRect();
    var height = window.innerHeight || document.documentElement.clientHeight;
    var width = window.innerWidth || document.documentElement.clientWidth;
    return rect.bottom > 0 && rect.top < height && rect.right > 0 && rect.left < width;
  }

  function canPlay() {
    return stops.length > 1 && !userPaused && !hovered && !focused && !interacting && !document.hidden && visible;
  }

  function schedule() {
    window.clearTimeout(timer);
    if (canPlay()) {
      timer = window.setTimeout(function () {
        move(current + 1, false);
      }, delay);
    }
  }

  function updateMotion() {
    motion.hidden = stops.length < 2;
    motion.textContent = userPaused ? 'Play slideshow' : 'Pause slideshow';
    motion.setAttribute('aria-pressed', String(userPaused));
    previous.disabled = stops.length < 2;
    next.disabled = stops.length < 2;
  }

  function nearestStop() {
    var position = viewport.scrollLeft;
    var best = 0;
    stops.forEach(function (stop, index) {
      if (Math.abs(stop.left - position) < Math.abs(stops[best].left - position)) best = index;
    });
    return best;
  }

  function updateStatus() {
    var bounds = viewport.getBoundingClientRect();
    var showing = [];
    cards.forEach(function (card, index) {
      var rect = card.getBoundingClientRect();
      if (rect.right > bounds.left + 2 && rect.left < bounds.right - 2) showing.push(index + 1);
    });
    if (!showing.length) showing.push(stops.length ? stops[current].card + 1 : 1);
    var first = showing[0];
    var last = showing[showing.length - 1];
    status.textContent = 'Showing product' + (first === last ? ' ' + first : 's ' + first + '–' + last) + ' of ' + cards.length + '.';
  }

  function refresh() {
    var firstLeft = cards[0].getBoundingClientRect().left;
    var limit = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    stops = [];
    cards.forEach(function (card, index) {
      var left = Math.max(0, Math.min(limit, card.getBoundingClientRect().left - firstLeft));
      if (!stops.length || Math.abs(left - stops[stops.length - 1].left) > 1) stops.push({ left: left, card: index });
    });
    current = nearestStop();
    updateMotion();
    updateStatus();
    schedule();
  }

  function move(index, manual) {
    if (stops.length < 2) return;
    current = (index + stops.length) % stops.length;
    /* Automatic movement updates the visible counter without repeated live announcements. */
    status.setAttribute('aria-live', manual ? 'polite' : 'off');
    var options = { left: stops[current].left, behavior: reduce.matches ? 'auto' : 'smooth' };
    if (typeof viewport.scrollTo === 'function') viewport.scrollTo(options);
    else viewport.scrollLeft = options.left;
    updateStatus();
    schedule();
  }

  previous.addEventListener('click', function () { move(current - 1, true); });
  next.addEventListener('click', function () { move(current + 1, true); });
  motion.addEventListener('click', function () {
    userPaused = !userPaused;
    updateMotion();
    schedule();
  });

  section.addEventListener('mouseenter', function () { hovered = true; schedule(); });
  section.addEventListener('mouseleave', function () { hovered = false; schedule(); });
  section.addEventListener('focusin', function () { focused = true; schedule(); });
  section.addEventListener('focusout', function (event) {
    focused = !!event.relatedTarget && section.contains(event.relatedTarget);
    schedule();
  });
  viewport.addEventListener('pointerdown', function () {
    interacting = true;
    status.setAttribute('aria-live', 'polite');
    schedule();
  });
  function releasePointer() {
    if (!interacting) return;
    interacting = false;
    schedule();
  }
  window.addEventListener('pointerup', releasePointer);
  window.addEventListener('pointercancel', releasePointer);
  window.addEventListener('blur', releasePointer);

  viewport.addEventListener('scroll', function () {
    window.clearTimeout(timer);
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(function () {
      current = nearestStop();
      updateStatus();
      schedule();
    }, 160);
  }, { passive: true });
  document.addEventListener('visibilitychange', schedule);

  function motionPreferenceChanged() {
    if (reduce.matches) userPaused = true;
    updateMotion();
    schedule();
  }
  if (typeof reduce.addEventListener === 'function') reduce.addEventListener('change', motionPreferenceChanged);
  else if (typeof reduce.addListener === 'function') reduce.addListener(motionPreferenceChanged);

  visible = sectionIsVisible();
  var observed = false;
  if ('IntersectionObserver' in window) {
    try {
      var observer = new window.IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.target !== section) return;
          visible = entry.isIntersecting && entry.intersectionRatio > 0;
          schedule();
        });
      }, { threshold: [0, 0.05] });
      observer.observe(section);
      observed = true;
    } catch (error) { /* The visibility fallback below keeps motion off screen paused. */ }
  }
  function resized() {
    if (!observed) visible = sectionIsVisible();
    refresh();
  }
  if (!observed) {
    window.addEventListener('scroll', function () {
      visible = sectionIsVisible();
      schedule();
    }, { passive: true });
  }
  window.addEventListener('resize', resized, { passive: true });
  if ('ResizeObserver' in window) {
    var resizeObserver = new window.ResizeObserver(resized);
    resizeObserver.observe(viewport);
    resizeObserver.observe(track);
  }
  status.setAttribute('aria-live', 'off');
  refresh();
})();
