(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function activateHero(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activateHero(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        activateHero(current + 1);
      }, 5200);
    }
  }

  var queryParams = new URLSearchParams(window.location.search);
  var query = (queryParams.get('q') || '').trim();
  var pageSearchInput = document.querySelector('[data-search-page-input]');

  if (pageSearchInput && query) {
    pageSearchInput.value = query;
  }

  var localSearchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-local-search]'));
  var filterSelects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
  var resultLine = document.querySelector('[data-result-line]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-list] [data-title]'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function cardText(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-year'),
      card.getAttribute('data-type'),
      card.getAttribute('data-region'),
      card.getAttribute('data-tags'),
      card.textContent
    ].join(' '));
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var terms = [];

    if (query) {
      terms.push(query);
    }

    localSearchInputs.forEach(function (input) {
      if (input.value.trim()) {
        terms.push(input.value.trim());
      }
    });

    var filters = {};
    filterSelects.forEach(function (select) {
      if (select.value) {
        filters[select.getAttribute('data-filter-select')] = select.value;
      }
    });

    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = cardText(card);
      var matchesTerms = terms.every(function (term) {
        return haystack.indexOf(normalize(term)) !== -1;
      });
      var matchesFilters = Object.keys(filters).every(function (name) {
        return normalize(card.getAttribute('data-' + name)) === normalize(filters[name]);
      });
      var show = matchesTerms && matchesFilters;
      card.classList.toggle('is-hidden', !show);

      if (show) {
        visibleCount += 1;
      }
    });

    if (resultLine) {
      resultLine.textContent = '当前显示 ' + visibleCount + ' 部影片';
    }
  }

  localSearchInputs.forEach(function (input) {
    if (query && !input.value) {
      input.value = query;
    }
    input.addEventListener('input', applyFilters);
  });

  filterSelects.forEach(function (select) {
    select.addEventListener('change', applyFilters);
  });

  applyFilters();
})();
