/* Browser-saved, in-person snack offers. The reference is not a server-validated coupon. */
(function () {
  'use strict';
  var section = document.getElementById('spin-break');
  if (!section) return;

  var KEY = 'ua_snack_spin_offer_v1';
  var DAY = 24 * 60 * 60 * 1000;
  var prizes = [5, 10, 5, 10, 5, 10];
  var wheel = section.querySelector('.spin-wheel');
  var disc = section.querySelector('.spin-wheel__disc');
  var button = document.getElementById('spin-start');
  var status = document.getElementById('spin-status');
  var offer = document.getElementById('spin-offer');
  var discount = document.getElementById('spin-discount');
  var issued = document.getElementById('spin-issued');
  var expires = document.getElementById('spin-expires');
  var reference = document.getElementById('spin-reference');
  var validity = document.getElementById('spin-validity');
  var instruction = document.getElementById('spin-instruction');
  var current = null;
  var busy = false;
  var rotation = 0;
  var finishTimer = null;
  var expiryTimer = null;
  var storageWarning = false;
  var dateFormat = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', second: '2-digit', timeZoneName: 'short'
  });

  function readSaved() {
    try {
      var value = JSON.parse(localStorage.getItem(KEY));
      if (!value || value.version !== 1 || !Number.isInteger(value.index) || value.index < 0 || value.index >= prizes.length ||
          value.percent !== prizes[value.index] || !/^UA-[A-F0-9]{8}$/.test(value.reference) ||
          !Number.isFinite(value.issuedAt) || value.issuedAt < 0 || value.issuedAt > Date.now() + 60000 ||
          value.expiresAt !== value.issuedAt + DAY || !Number.isFinite(value.expiresAt)) return null;
      return value;
    } catch (error) { return null; }
  }

  function active(value) { return value && value.expiresAt > Date.now(); }

  function randomNumber() {
    if (window.crypto && window.crypto.getRandomValues) {
      var bytes = new Uint32Array(1);
      window.crypto.getRandomValues(bytes);
      return bytes[0] / 4294967296;
    }
    return Math.random();
  }

  function makeClaim() {
    var index = Math.floor(randomNumber() * prizes.length);
    var now = Date.now();
    var code = '';
    for (var i = 0; i < 8; i += 1) code += Math.floor(randomNumber() * 16).toString(16).toUpperCase();
    return { version: 1, index: index, percent: prizes[index], reference: 'UA-' + code, issuedAt: now, expiresAt: now + DAY };
  }

  function setRestingWheel(index) {
    rotation = (360 - index * 60) % 360;
    disc.style.setProperty('--wheel-turn', rotation + 'deg');
  }

  function show(value, focus) {
    clearTimeout(expiryTimer);
    current = value;
    var isActive = active(value);
    offer.hidden = false;
    offer.classList.toggle('is-expired', !isActive);
    discount.textContent = value.percent + '%';
    issued.dateTime = new Date(value.issuedAt).toISOString();
    issued.textContent = dateFormat.format(value.issuedAt);
    expires.dateTime = new Date(value.expiresAt).toISOString();
    expires.textContent = dateFormat.format(value.expiresAt);
    reference.textContent = value.reference;
    instruction.textContent = isActive ? 'Take a screenshot of this offer and show it in person at Urban Alchemist to claim.' + (storageWarning ? ' Keep your screenshot now; this offer may not be saved if you leave this page.' : '') : 'This offer has expired. Spin again for a new 24-hour offer.';
    button.disabled = isActive;
    button.textContent = isActive ? 'Your offer is ready' : 'Spin for a new offer';
    updateValidity();
    if (isActive) expiryTimer = setTimeout(updateValidity, Math.max(0, value.expiresAt - Date.now()));
    status.textContent = isActive ? 'You got ' + value.percent + '% off snacks and non-alcoholic drinks. Screenshot your offer below; it expires in 24 hours from issue.' : 'Your previous offer has expired. A new spin is available.';
    if (focus) {
      offer.focus({ preventScroll: true });
      offer.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }

  function updateValidity() {
    if (!current || busy) return;
    var left = current.expiresAt - Date.now();
    if (left <= 0) {
      validity.textContent = 'Expired · no longer valid';
      if (!offer.classList.contains('is-expired')) show(current, false);
      return;
    }
    var minutes = Math.ceil(left / 60000);
    var hours = Math.floor(minutes / 60);
    validity.textContent = 'Valid · ' + (hours ? hours + 'h ' : '') + (minutes % 60) + 'm remaining';
  }

  function chooseClaim() {
    var saved = readSaved();
    if (active(saved)) return { value: saved, isNew: false };
    if (active(current)) return { value: current, isNew: false };
    var value = makeClaim();
    current = value;
    // Save before animating so a reload preserves the same prize and expiry.
    try { localStorage.setItem(KEY, JSON.stringify(value)); storageWarning = false; }
    catch (error) { storageWarning = true; /* The open page still retains its offer. */ }
    return { value: value, isNew: true };
  }

  function finish() {
    if (!busy) return;
    clearTimeout(finishTimer);
    busy = false;
    wheel.classList.remove('is-spinning');
    wheel.removeAttribute('aria-busy');
    if (current) show(current, true);
  }

  async function spin() {
    if (busy) return;
    busy = true;
    button.disabled = true;
    button.textContent = 'Finding your treat…';
    status.textContent = 'Spinning for your next break…';
    var choice;
    try {
      // Coordinate issuance across tabs where Web Locks are supported.
      if (navigator.locks && navigator.locks.request) choice = await navigator.locks.request(KEY, chooseClaim);
      else choice = chooseClaim();
    } catch (error) { choice = chooseClaim(); }
    current = choice.value;
    if (!choice.isNew || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRestingWheel(current.index);
      finish();
      return;
    }
    offer.hidden = true;
    wheel.classList.add('is-spinning');
    wheel.setAttribute('aria-busy', 'true');
    // Wedge zero is centered at the top. Negating its 60-degree index aligns it with the pointer.
    var target = (360 - current.index * 60) % 360;
    rotation += 5 * 360 + ((target - rotation % 360 + 360) % 360);
    disc.style.setProperty('--wheel-turn', rotation + 'deg');
    finishTimer = setTimeout(finish, 4400);
  }

  disc.addEventListener('transitionend', function (event) {
    if (event.target === disc && event.propertyName === 'transform') finish();
  });
  button.addEventListener('click', spin);
  window.addEventListener('storage', function (event) {
    if (event.key !== KEY) return;
    var saved = readSaved();
    if (!saved || (current && current.reference === saved.reference)) return;
    clearTimeout(finishTimer);
    busy = false;
    wheel.classList.remove('is-spinning');
    wheel.removeAttribute('aria-busy');
    setRestingWheel(saved.index);
    show(saved, false);
  });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') updateValidity();
  });
  setInterval(updateValidity, 30000);
  var saved = readSaved();
  if (saved) { setRestingWheel(saved.index); show(saved, false); }
  else {
    button.disabled = false;
    status.textContent = 'Every spin reveals 5% or 10% off. Your offer lasts 24 hours.';
  }
})();
