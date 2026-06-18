function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

function setupMenu() {
  var button = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (!button || !panel) {
    return;
  }
  button.addEventListener('click', function () {
    panel.classList.toggle('is-open');
  });
}

function setupHero() {
  var hero = document.querySelector('[data-hero]');
  if (!hero) {
    return;
  }
  var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  var timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function start() {
    if (slides.length <= 1) {
      return;
    }
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5000);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      window.clearInterval(timer);
      show(Number(dot.getAttribute('data-hero-dot')) || 0);
      start();
    });
  });

  show(0);
  start();
}

function normalize(value) {
  return String(value || '').toLowerCase().trim();
}

function setupPageFilter() {
  var input = document.querySelector('[data-page-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-chip]'));
  if (!input || cards.length === 0) {
    return;
  }
  var chipValue = '';

  function apply() {
    var keyword = normalize(input.value);
    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type')
      ].join(' '));
      var matchKeyword = keyword === '' || haystack.indexOf(keyword) !== -1;
      var matchChip = chipValue === '' || haystack.indexOf(normalize(chipValue)) !== -1;
      card.style.display = matchKeyword && matchChip ? '' : 'none';
    });
  }

  input.addEventListener('input', apply);
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chipValue = chip.getAttribute('data-chip') || '';
      chips.forEach(function (item) {
        item.classList.toggle('is-active', item === chip);
      });
      apply();
    });
  });
}

function setupSearchForms() {
  Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || input.value.trim() === '') {
        event.preventDefault();
      }
    });
  });
}

function cardHtml(movie) {
  var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
    return '<span>' + escapeHtml(tag) + '</span>';
  }).join('');
  return [
    '<article class="movie-card">',
    '<a href="' + escapeHtml(movie.url) + '" class="card-link" aria-label="' + escapeHtml(movie.title) + '">',
    '<div class="card-poster">',
    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
    '<div class="card-overlay"><p>' + escapeHtml(movie.oneLine || '') + '</p></div>',
    '<div class="card-badges"><span class="badge badge-year">' + escapeHtml(movie.year || '') + '</span></div>',
    '<span class="card-play">▶</span>',
    '</div>',
    '<div class="card-body">',
    '<h3>' + escapeHtml(movie.title) + '</h3>',
    '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
    '<div class="card-tags">' + tags + '</div>',
    '</div>',
    '</a>',
    '</article>'
  ].join('');
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, function (char) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char];
  });
}

function setupSearchPage() {
  var results = document.querySelector('[data-search-results]');
  var title = document.querySelector('[data-search-title]');
  var input = document.querySelector('[data-search-page-input]');
  if (!results || typeof MOVIE_INDEX === 'undefined') {
    return;
  }
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  if (input) {
    input.value = query;
  }

  function render(value) {
    var keyword = normalize(value);
    var list = MOVIE_INDEX.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.category,
        movie.genre,
        movie.year,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' '));
      return keyword === '' || haystack.indexOf(keyword) !== -1;
    }).slice(0, 120);
    if (title) {
      title.textContent = keyword ? '搜索结果' : '精选影片';
    }
    results.innerHTML = list.map(cardHtml).join('');
  }

  render(query);
  if (input) {
    input.addEventListener('input', function () {
      render(input.value);
    });
  }
}

function setupPlayer() {
  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var url = player.getAttribute('data-play');
    var hls = null;

    function attach() {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }
      video.setAttribute('data-ready', '1');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        return;
      }
      video.src = url;
    }

    function start() {
      attach();
      player.classList.add('is-playing');
      video.controls = true;
      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (video.getAttribute('data-ready') !== '1') {
        start();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
}

function setupBackTop() {
  var button = document.querySelector('[data-back-top]');
  if (!button) {
    return;
  }
  window.addEventListener('scroll', function () {
    button.classList.toggle('is-visible', window.scrollY > 320);
  });
  button.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

ready(function () {
  setupMenu();
  setupHero();
  setupPageFilter();
  setupSearchForms();
  setupSearchPage();
  setupPlayer();
  setupBackTop();
});
