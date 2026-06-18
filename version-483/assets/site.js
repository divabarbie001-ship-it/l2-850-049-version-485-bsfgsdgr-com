(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupImages() {
    all('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('image-off');
      });
    });
  }

  function setupNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-main-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = all('[data-hero-slide]', root);
    var dots = all('[data-hero-dot]', root);
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function setSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    }
    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        setSlide(i);
        restart();
      });
    });
    root.addEventListener('mouseenter', function () {
      if (timer) {
        window.clearInterval(timer);
      }
    });
    root.addEventListener('mouseleave', start);
    setSlide(0);
    start();
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function setupFilters() {
    all('[data-filter-scope]').forEach(function (scope) {
      var search = scope.querySelector('[data-filter-search]');
      var region = scope.querySelector('[data-filter-region]');
      var type = scope.querySelector('[data-filter-type]');
      var year = scope.querySelector('[data-filter-year]');
      var genre = scope.querySelector('[data-filter-genre]');
      var category = scope.querySelector('[data-filter-category]');
      var list = document.querySelector('[data-card-list]');
      var empty = document.querySelector('[data-empty-state]');
      if (!list) {
        return;
      }
      var cards = all('[data-movie-card]', list);
      function apply() {
        var q = normalize(search && search.value);
        var r = normalize(region && region.value);
        var t = normalize(type && type.value);
        var y = normalize(year && year.value);
        var g = normalize(genre && genre.value);
        var c = normalize(category && category.value);
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.dataset.title + ' ' + card.dataset.region + ' ' + card.dataset.type + ' ' + card.dataset.year + ' ' + card.dataset.genre + ' ' + card.dataset.tags);
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (r && normalize(card.dataset.region) !== r) {
            ok = false;
          }
          if (t && normalize(card.dataset.type) !== t) {
            ok = false;
          }
          if (y && normalize(card.dataset.year) !== y) {
            ok = false;
          }
          if (g && normalize(card.dataset.genre).indexOf(g) === -1) {
            ok = false;
          }
          if (c && normalize(card.dataset.category) !== c) {
            ok = false;
          }
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }
      [search, region, type, year, genre, category].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      var params = new URLSearchParams(window.location.search);
      if (search && params.get('q')) {
        search.value = params.get('q');
      }
      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupImages();
    setupNav();
    setupHero();
    setupFilters();
  });
})();
