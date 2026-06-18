(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuToggle = qs('[data-menu-toggle]');
    var mobileNav = qs('[data-mobile-nav]');
    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    qsa('[data-hero]').forEach(function (hero) {
        var slides = qsa('.hero-slide', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle('active', idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle('active', idx === current);
            });
        }

        function start() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, idx) {
            dot.addEventListener('click', function () {
                show(idx);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        show(0);
        start();
    });

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilter(input) {
        var scope = input.closest('main') || document;
        var list = qs('[data-filter-list]', scope) || scope;
        var cards = qsa('.searchable-card', list);
        var empty = qs('[data-empty-state]', scope);
        var query = normalize(input.value);
        var shown = 0;

        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-search') || card.textContent);
            var matched = !query || haystack.indexOf(query) !== -1;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                shown += 1;
            }
        });

        if (empty) {
            empty.style.display = shown ? 'none' : 'block';
        }
    }

    qsa('[data-filter-input]').forEach(function (input) {
        if (input.hasAttribute('data-url-query')) {
            var params = new URLSearchParams(window.location.search);
            var initial = params.get('q');
            if (initial) {
                input.value = initial;
            }
        }
        input.addEventListener('input', function () {
            applyFilter(input);
        });
        applyFilter(input);
    });

    function attachStream(video) {
        var stream = video.getAttribute('data-stream');
        if (!stream) {
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
        } else {
            video.src = stream;
        }
    }

    qsa('.movie-video').forEach(function (video) {
        attachStream(video);
    });

    qsa('[data-player-button]').forEach(function (button) {
        button.addEventListener('click', function () {
            var shell = button.closest('.video-shell');
            var video = shell ? qs('video', shell) : null;
            if (!video) {
                return;
            }
            var playResult = video.play();
            button.classList.add('hidden');
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {
                    button.classList.remove('hidden');
                });
            }
        });
    });
})();
