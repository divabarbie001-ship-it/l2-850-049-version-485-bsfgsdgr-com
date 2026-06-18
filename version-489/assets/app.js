(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      showSlide(0);
      start();
    });

    document.querySelectorAll("[data-search-input]").forEach(function (input) {
      var scope = input.closest("main") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-item"));

      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.textContent
          ].join(" ").toLowerCase();

          card.classList.toggle("is-filtered-out", keyword && text.indexOf(keyword) === -1);
        });
      });
    });
  });
})();

function initMoviePlayer(videoUrl) {
  var player = document.querySelector("[data-player]");
  var video = document.getElementById("movie-video");
  var overlay = document.querySelector(".player-overlay");
  var loaded = false;

  if (!player || !video || !videoUrl) {
    return;
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  }

  function loadAndPlay() {
    if (!loaded) {
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        video._hlsPlayer = new window.Hls({
          maxBufferLength: 45,
          enableWorker: true
        });
        video._hlsPlayer.loadSource(videoUrl);
        video._hlsPlayer.attachMedia(video);
      } else {
        video.src = videoUrl;
      }
    }

    hideOverlay();
    var playResult = video.play();
    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      loadAndPlay();
    });
  }

  player.addEventListener("click", function (event) {
    if (event.target === video || event.target === player) {
      loadAndPlay();
    }
  });

  video.addEventListener("play", hideOverlay);
}
