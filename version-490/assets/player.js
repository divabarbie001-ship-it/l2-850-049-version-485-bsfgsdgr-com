(function() {
  window.initMoviePlayer = function(source) {
    var video = document.querySelector('.video-player');
    var cover = document.querySelector('.player-cover');
    var started = false;
    var hlsInstance = null;

    if (!video || !cover || !source) {
      return;
    }

    function attach() {
      if (started) {
        return Promise.resolve();
      }
      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return Promise.resolve();
      }

      return import('./hls.js').then(function(module) {
        var LocalHls = module.H;
        if (LocalHls && LocalHls.isSupported()) {
          window.Hls = LocalHls;
          hlsInstance = new LocalHls();
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }).catch(function() {
        video.src = source;
      });
    }

    function play() {
      attach().then(function() {
        cover.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function() {
            cover.classList.remove('is-hidden');
          });
        }
      });
    }

    cover.addEventListener('click', play);
    video.addEventListener('click', function() {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function() {
      cover.classList.add('is-hidden');
    });
    window.addEventListener('beforeunload', function() {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  };
})();
