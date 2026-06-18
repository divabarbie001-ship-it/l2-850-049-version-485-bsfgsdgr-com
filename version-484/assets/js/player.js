import { H as Hls } from './hls.js';

var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));

function bindPlayer(root) {
  var video = root.querySelector('video');
  var trigger = root.querySelector('.play-trigger');
  var url = root.getAttribute('data-play-url');
  var started = false;
  var hlsInstance = null;

  function attachSource() {
    if (!video || !url || started) {
      return;
    }

    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
    } else {
      video.src = url;
    }
  }

  function playVideo() {
    attachSource();
    root.classList.add('is-playing');
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        root.classList.remove('is-playing');
      });
    }
  }

  if (trigger) {
    trigger.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('play', function () {
      root.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        return;
      }
      root.classList.remove('is-playing');
    });
    video.addEventListener('click', function () {
      if (!started) {
        playVideo();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

players.forEach(bindPlayer);
