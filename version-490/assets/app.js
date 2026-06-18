(function() {
  var toggle = document.querySelector('[data-nav-toggle]');
  var menu = document.querySelector('[data-nav-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function() {
      menu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        show(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        show(index + 1);
      }, 5600);
    }
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var scope = document.querySelector('[data-filter-scope]');
  var count = document.querySelector('[data-filter-count]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function runFilter(value) {
    if (!scope) {
      return;
    }
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var query = normalize(value);
    var visible = 0;

    cards.forEach(function(card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
      var matched = !query || haystack.indexOf(query) !== -1;
      card.classList.toggle('is-filtered-out', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = query ? '筛选到 ' + visible + ' 部影片' : '';
    }
  }

  if (filterInput && scope) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (q) {
      filterInput.value = q;
    }
    filterInput.addEventListener('input', function() {
      runFilter(filterInput.value);
    });
    runFilter(filterInput.value);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-preset]')).forEach(function(button) {
    button.addEventListener('click', function() {
      if (filterInput) {
        filterInput.value = button.getAttribute('data-preset') || '';
        runFilter(filterInput.value);
        filterInput.focus();
      }
    });
  });

  Array.prototype.slice.call(document.images).forEach(function(img) {
    img.addEventListener('error', function() {
      img.style.opacity = '0';
    }, { once: true });
  });
})();
