(function () {
  'use strict';

  var VIEWS = ['bemutatkozas', 'szolgaltatasok', 'kapcsolat'];
  var body = document.body;
  var views = document.querySelectorAll('.lk-view');
  var menuToggle = document.getElementById('menu-toggle');
  var menuOverlay = document.getElementById('menu-overlay');
  var homeSnap = document.querySelector('.lk-snap');
  var form = document.getElementById('contact-form');
  var submitLabel = document.getElementById('submit-label');
  var SENT_LABEL = 'Köszönöm, hamarosan válaszolok.';
  var DEFAULT_LABEL = submitLabel.textContent;
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
    submitLabel.textContent = SENT_LABEL;
    submitted = true;
  });
})();
