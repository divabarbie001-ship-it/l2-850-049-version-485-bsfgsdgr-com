(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;
    var timer = null;

    var setHero = function (nextIndex) {
      if (!slides.length) {
        return;
      }
      activeIndex = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === activeIndex);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === activeIndex);
      });
    };

    var startHero = function () {
      timer = window.setInterval(function () {
        setHero(activeIndex + 1);
      }, 5200);
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        setHero(index);
        startHero();
      });
    });

    setHero(0);
    startHero();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterCount = document.querySelector('[data-filter-count]');
  if (filterInput) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
    var applyFilter = function () {
      var keyword = filterInput.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (filterCount) {
        filterCount.textContent = visible + ' 部影片';
      }
    };
    filterInput.addEventListener('input', applyFilter);
    applyFilter();
  }

  var searchRoot = document.querySelector('[data-search-results]');
  if (searchRoot && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = document.querySelector('[data-search-page-input]');
    if (input) {
      input.value = query;
    }

    var renderMovie = function (movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card">'
        + '<a class="poster" href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">'
        + '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">'
        + '<span class="poster-mask">▶</span>'
        + '<span class="year-badge">' + escapeHtml(movie.year) + '</span>'
        + '</a>'
        + '<div class="movie-card-body">'
        + '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>'
        + '<p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>'
        + '<p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>'
        + '<div class="tag-row">' + tags + '</div>'
        + '</div>'
        + '</article>';
    };

    var normalized = query.toLowerCase();
    var results = window.SEARCH_MOVIES.filter(function (movie) {
      var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, movie.tags.join(' ')].join(' ').toLowerCase();
      return !normalized || text.indexOf(normalized) !== -1;
    }).slice(0, 120);

    if (results.length) {
      searchRoot.innerHTML = results.map(renderMovie).join('');
    } else {
      searchRoot.innerHTML = '<div class="empty-results">没有找到匹配的影片，请尝试更换关键词。</div>';
    }
  }

  var player = document.querySelector('[data-player]');
  if (player) {
    var video = player.querySelector('video[data-video]');
    var button = player.querySelector('[data-play-button]');
    var hlsInstance = null;
    var mediaReady = false;
    var hlsLoading = null;

    var loadHls = function () {
      if (window.Hls) {
        return Promise.resolve();
      }
      if (hlsLoading) {
        return hlsLoading;
      }
      hlsLoading = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      return hlsLoading;
    };

    var attachMedia = function () {
      if (!video || mediaReady) {
        return Promise.resolve();
      }
      var source = video.getAttribute('data-video');
      if (!source) {
        return Promise.resolve();
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        mediaReady = true;
        return Promise.resolve();
      }
      return loadHls().then(function () {
        return new Promise(function (resolve) {
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              mediaReady = true;
              resolve();
            });
            hlsInstance.on(window.Hls.Events.ERROR, function () {
              mediaReady = true;
              resolve();
            });
          } else {
            video.src = source;
            mediaReady = true;
            resolve();
          }
        });
      }).catch(function () {
        video.src = source;
        mediaReady = true;
      });
    };

    var startPlayback = function () {
      attachMedia().then(function () {
        var playPromise = video.play();
        if (playPromise && playPromise.then) {
          playPromise.then(function () {
            if (button) {
              button.classList.add('is-hidden');
            }
          }).catch(function () {
            if (button) {
              button.classList.remove('is-hidden');
            }
          });
        } else if (button) {
          button.classList.add('is-hidden');
        }
      });
    };

    if (button) {
      button.addEventListener('click', startPlayback);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (button && video.currentTime === 0) {
          button.classList.remove('is-hidden');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
