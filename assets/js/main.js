(function () {
  'use strict';

  var VIEWS = ['bemutatkozas', 'szolgaltatasok', 'kapcsolat', 'adatvedelem'];
  var body = document.body;
  var views = document.querySelectorAll('.lk-view');
  var menuToggle = document.getElementById('menu-toggle');
  var menuOverlay = document.getElementById('menu-overlay');
  var homeSnap = document.querySelector('.lk-snap');
  var form = document.getElementById('contact-form');
  var submitBtn = form.querySelector('button[type="submit"]');
  var submitLabel = document.getElementById('submit-label');
  var DEFAULT_LABEL = submitLabel.textContent;
  var SENDING_LABEL = 'Küldés...';
  var SENT_LABEL = 'Köszönöm, üzeneted megérkezett.';
  var ERROR_LABEL = 'Hiba történt, próbáld újra.';
  var submitted = false;

  function currentView() {
    var hash = (location.hash || '').replace('#', '');
    return VIEWS.indexOf(hash) !== -1 ? hash : 'home';
  }

  function closeMenu() {
    menuOverlay.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  function render() {
    var view = currentView();
    body.dataset.view = view;
    body.classList.toggle('is-home', view === 'home');
    views.forEach(function (el) {
      el.classList.toggle('is-active', el.dataset.view === view);
    });
    closeMenu();
    window.scrollTo(0, 0);
    if (view === 'home' && homeSnap) homeSnap.scrollTop = 0;
    if (view !== 'kapcsolat' && submitted) {
      form.reset();
      submitLabel.textContent = DEFAULT_LABEL;
      submitBtn.disabled = false;
      submitted = false;
    }
  }

  window.addEventListener('hashchange', render);
  render();

  menuToggle.addEventListener('click', function () {
    var open = menuOverlay.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  menuOverlay.addEventListener('click', function (e) {
    if (e.target.tagName !== 'A') closeMenu();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (form.elements.botcheck && form.elements.botcheck.checked) return;

    submitBtn.disabled = true;
    submitLabel.textContent = SENDING_LABEL;

    fetch(form.action, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form)
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.success) {
          submitLabel.textContent = SENT_LABEL;
          submitted = true;
          gtag('event', 'generate_lead');
        } else {
          submitLabel.textContent = ERROR_LABEL;
          submitBtn.disabled = false;
        }
      })
      .catch(function () {
        submitLabel.textContent = ERROR_LABEL;
        submitBtn.disabled = false;
      });
  });

  // ---- Sütihozzájárulás (Consent Mode v2) ----
  var CONSENT_KEY = 'lk-consent';
  var banner = document.getElementById('consent-banner');
  var storedConsent = null;
  try { storedConsent = localStorage.getItem(CONSENT_KEY); } catch (e) {}
  if (storedConsent !== 'granted' && storedConsent !== 'denied') banner.hidden = false;

  function setConsent(state) {
    gtag('consent', 'update', {
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state,
      analytics_storage: state
    });
  }

  // Withdrawing consent must also drop the _ga cookies set while it was granted.
  function deleteAnalyticsCookies() {
    var host = location.hostname.replace(/^www\./, '');
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name.indexOf('_ga') !== 0) return;
      [location.hostname, '.' + host].forEach(function (domain) {
        document.cookie = name + '=; Max-Age=0; path=/; domain=' + domain;
      });
      document.cookie = name + '=; Max-Age=0; path=/';
    });
  }

  banner.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-consent]');
    if (!btn) return;
    var choice = btn.dataset.consent;
    if (choice === 'granted') {
      setConsent('granted');
    } else if (storedConsent === 'granted') {
      setConsent('denied');
      deleteAnalyticsCookies();
    }
    storedConsent = choice;
    try { localStorage.setItem(CONSENT_KEY, choice); } catch (err) {}
    banner.hidden = true;
  });

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-consent-open]')) banner.hidden = false;
  });

  // ---- Cal.com popup + események ----
  document.addEventListener('click', function (e) {
    if (window.lkCalReady && e.target.closest('a[data-cal-link]')) e.preventDefault();
    if (e.target.closest('a[href^="tel:"]')) gtag('event', 'click_to_call');
  });

  Cal('on', {
    action: 'bookingSuccessful',
    callback: function () { gtag('event', 'book_appointment'); }
  });
})();
