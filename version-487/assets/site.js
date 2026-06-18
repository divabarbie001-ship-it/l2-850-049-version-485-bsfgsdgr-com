(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-nav');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = panel.hasAttribute('hidden');
      if (open) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, position) {
      dot.addEventListener('click', function () {
        show(position);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var input = scope.querySelector('.filter-input');
      var year = scope.querySelector('.filter-year');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .movie-row'));

      function apply() {
        var keyword = normalize(input ? input.value : '');
        var selectedYear = year ? year.value : '';
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-category')
          ].join(' '));
          var cardYear = card.getAttribute('data-year') || '';
          var visible = true;
          if (keyword && text.indexOf(keyword) === -1) {
            visible = false;
          }
          if (selectedYear && cardYear !== selectedYear) {
            visible = false;
          }
          card.hidden = !visible;
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
    });
  }

  function createResultCard(item) {
    var tags = (item.tags || []).slice(0, 2).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<a class="movie-card" href="' + escapeHtml(item.href) + '">',
      '<div class="poster-wrap">',
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<div class="poster-mask"><span class="watch-icon">▶</span></div>',
      '<span class="type-pill">' + escapeHtml(item.type) + '</span>',
      '<span class="year-pill">' + escapeHtml(item.year) + '</span>',
      '</div>',
      '<h3>' + escapeHtml(item.title) + '</h3>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '<div class="tagline">' + tags + '</div>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initSearchPage() {
    var results = document.getElementById('search-results');
    var input = document.getElementById('search-page-input');
    if (!results || !input || !window.SEARCH_ITEMS) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render(query) {
      var keyword = normalize(query);
      if (!keyword) {
        results.innerHTML = '<div class="empty-search">请输入关键词开始搜索</div>';
        return;
      }
      var matched = window.SEARCH_ITEMS.filter(function (item) {
        return normalize(item.text).indexOf(keyword) !== -1;
      }).slice(0, 80);
      if (!matched.length) {
        results.innerHTML = '<div class="empty-search">没有找到匹配内容</div>';
        return;
      }
      results.innerHTML = '<div class="movie-grid library-grid">' + matched.map(createResultCard).join('') + '</div>';
    }

    render(initial);
    input.addEventListener('input', function () {
      render(input.value);
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));
    players.forEach(function (box) {
      var video = box.querySelector('video');
      var overlay = box.querySelector('.player-overlay');
      var source = box.getAttribute('data-video');
      var loaded = false;
      var shouldPlay = false;
      var instance = null;

      function setStatus(text) {
        box.setAttribute('data-status', text || '');
      }

      function attemptPlay() {
        if (!video) {
          return;
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            box.classList.remove('is-playing');
          });
        }
      }

      function loadVideo() {
        if (loaded || !video || !source) {
          return;
        }
        loaded = true;
        setStatus('');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.addEventListener('loadedmetadata', function () {
            if (shouldPlay) {
              attemptPlay();
            }
          }, { once: true });
          video.src = source;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          instance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          instance.loadSource(source);
          instance.attachMedia(video);
          instance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            if (shouldPlay) {
              attemptPlay();
            }
          });
          instance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('视频暂时无法播放');
            }
          });
          return;
        }
        video.addEventListener('loadedmetadata', function () {
          if (shouldPlay) {
            attemptPlay();
          }
        }, { once: true });
        video.src = source;
      }

      function play() {
        shouldPlay = true;
        box.classList.add('is-playing');
        loadVideo();
        if (video && (video.currentSrc || video.src || video.readyState > 0)) {
          attemptPlay();
        }
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('play', function () {
          box.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          if (!video.ended) {
            box.classList.remove('is-playing');
          }
        });
        video.addEventListener('click', function () {
          if (!loaded) {
            play();
          }
        });
      }
      window.addEventListener('pagehide', function () {
        if (instance) {
          instance.destroy();
          instance = null;
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
    initPlayers();
  });
})();
