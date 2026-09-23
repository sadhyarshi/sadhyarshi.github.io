/* ============================================================
   SADHYARSHI — Monochrome Studio Portfolio
   GSAP + ScrollTrigger. No build step.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(pointer: coarse)').matches;
  var isDesktop = window.matchMedia('(min-width: 901px)').matches && !reduceMotion;
  var gsapReady = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (gsapReady) gsap.registerPlugin(ScrollTrigger);

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     LOADER — fill 0→100, then a white flash, then reveal hero
  --------------------------------------------------------- */
  (function loader() {
    var loaderEl = document.getElementById('loader');
    var fill = document.getElementById('loaderFill');
    var pct = document.getElementById('loaderPct');
    var flash = document.getElementById('flash');
    if (!loaderEl) { playHeroIntro(); return; }

    document.documentElement.style.overflow = 'hidden';
    var duration = reduceMotion ? 350 : 1500;
    var start = performance.now();

    function tick(now) {
      var elapsed = now - start;
      var progress = Math.min(100, Math.round((elapsed / duration) * 100));
      if (fill) fill.style.width = progress + '%';
      if (pct) pct.textContent = String(progress).padStart(2, '0');
      if (progress < 100) requestAnimationFrame(tick);
      else finish();
    }
    requestAnimationFrame(tick);

    function finish() {
      if (gsapReady) {
        gsap.timeline()
          .to(loaderEl, { opacity: 0, duration: 0.3, ease: 'power1.out' })
          .set(loaderEl, { display: 'none' })
          .to(flash, { opacity: 1, duration: 0.12, ease: 'power1.in' })
          .to(flash, { opacity: 0, duration: 0.5, ease: 'power2.out' })
          .call(function () {
            document.documentElement.style.overflow = '';
            playHeroIntro();
            if (gsapReady) ScrollTrigger.refresh();
          });
      } else {
        loaderEl.style.display = 'none';
        document.documentElement.style.overflow = '';
        playHeroIntro();
      }
    }
  })();

  /* ---------------------------------------------------------
     CUSTOM CURSOR — dot + ring, expands on hover
  --------------------------------------------------------- */
  (function cursor() {
    if (isTouch) return;
    var ring = document.getElementById('cursorRing');
    var dot = document.getElementById('cursorDot');
    if (!ring || !dot) return;
    var mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    }, { passive: true });

    function raf() {
      rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    document.addEventListener('mouseover', function (e) {
      if (e.target.closest('.device-wrap, .project-panel')) ring.classList.add('project-hover');
      else if (e.target.closest('a, [data-magnetic]')) ring.classList.add('hover');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest('.device-wrap, .project-panel')) ring.classList.remove('project-hover');
      if (e.target.closest('a, [data-magnetic]')) ring.classList.remove('hover');
    });
  })();

  /* ---------------------------------------------------------
     MAGNETIC LINKS
  --------------------------------------------------------- */
  (function magnetic() {
    if (isTouch || reduceMotion || !gsapReady) return;
    var els = document.querySelectorAll('[data-magnetic]');
    els.forEach(function (el) {
      var moveX = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
      var moveY = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var relX = e.clientX - (r.left + r.width / 2);
        var relY = e.clientY - (r.top + r.height / 2);
        moveX(relX * 0.35);
        moveY(relY * 0.35);
      });
      el.addEventListener('mouseleave', function () { moveX(0); moveY(0); });
    });
  })();

  /* ---------------------------------------------------------
     NAV — scroll progress
  --------------------------------------------------------- */
  (function progressBar() {
    var bar = document.getElementById('scrollProgress');
    function onScroll() {
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var y = window.scrollY;
      if (bar) bar.style.width = (docH > 0 ? Math.min(100, (y / docH) * 100) : 0) + '%';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ---------------------------------------------------------
     MOUSE PARALLAX (panel-inner tilt)
  --------------------------------------------------------- */
  (function mouseParallax() {
    if (isTouch || reduceMotion || !gsapReady) return;
    var inners = document.querySelectorAll('.panel-inner');
    var quickFns = [];
    inners.forEach(function (el) {
      quickFns.push({
        rx: gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power2.out' }),
        ry: gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power2.out' })
      });
    });
    window.addEventListener('mousemove', function (e) {
      var nx = (e.clientX / window.innerWidth) - 0.5;
      var ny = (e.clientY / window.innerHeight) - 0.5;
      quickFns.forEach(function (q) { q.ry(nx * 3.5); q.rx(-ny * 3.5); });
    }, { passive: true });
  })();

  /* ---------------------------------------------------------
     HERO INTRO
  --------------------------------------------------------- */
  function playHeroIntro() {
    if (!gsapReady) return;
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('#heroObject', { opacity: 1, duration: 1, ease: 'power2.out' }, 0)
      .to('.hero-headline .hl', { opacity: 1, y: 0, duration: 0.9, stagger: 0.14 }, 0.3)
      .to('.scroll-cta', { opacity: 0.7, duration: 0.7 }, 1.2);

    if (!reduceMotion) {
      gsap.to('#heroObject', { rotationY: 360, duration: 22, repeat: -1, ease: 'none' });
      gsap.to('.ho-ring.r1', { rotation: 360, duration: 30, repeat: -1, ease: 'none' });
      gsap.to('.ho-ring.r2', { rotation: -360, duration: 40, repeat: -1, ease: 'none' });
    }
  }

  /* ---------------------------------------------------------
     HERO EXIT
  --------------------------------------------------------- */
  if (gsapReady && isDesktop) {
    gsap.timeline({
      scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=100%', scrub: 1, pin: true, anticipatePin: 1 }
    })
      .to('.hero-text', { opacity: 0, z: 300, scale: 1.25, duration: 1, ease: 'none' }, 0)
      .to('#heroObject', { z: -400, scale: 0.6, opacity: 0, duration: 1, ease: 'none' }, 0.1)
      .to('.scroll-cta', { opacity: 0, duration: 0.3, ease: 'none' }, 0);
  } else if (gsapReady) {
    ScrollTrigger.create({
      trigger: '#hero', start: 'bottom bottom', end: 'bottom top',
      onEnter: function () { gsap.to('.hero-text', { opacity: 0, duration: 0.4 }); }
    });
  }

  /* ---------------------------------------------------------
     GENERIC PROJECT SCENE BUILDER
  --------------------------------------------------------- */
  function buildScene(panelSelector, opts) {
    opts = opts || {};
    var panel = document.querySelector(panelSelector);
    if (!panel || !gsapReady) return;

    var deviceWrap = panel.querySelector('.device-wrap');
    var frags = panel.querySelectorAll('.ui-frag');
    var capIndex = panel.querySelector('.cap-index');
    var capTitle = panel.querySelector('.cap-title');
    var capSub = panel.querySelector('.cap-sub');

    if (isDesktop) {
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: panel, start: 'top top', end: '+=' + (opts.scrollLength || 170) + '%',
          scrub: 1, pin: true, anticipatePin: 1
        }
      });

      var enterRotY = opts.enterRotY != null ? opts.enterRotY : -22;
      var exitRotY = opts.exitRotY != null ? opts.exitRotY : 22;
      var enterRotX = opts.enterRotX || 0;

      tl.fromTo(deviceWrap,
        { opacity: 0, scale: 0.05, z: -1500, rotationY: enterRotY, rotationX: enterRotX },
        { opacity: 1, scale: 1, z: 0, rotationY: 0, rotationX: 0, duration: 1.3, ease: 'none' }, 0);

      if (frags.length) {
        tl.fromTo(frags, { opacity: 0, scale: 0.75 }, { opacity: 1, scale: 1, stagger: 0.08, duration: 0.7, ease: 'none' }, 1.1);
      }
      if (capIndex) tl.fromTo(capIndex, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'none' }, 1.3);
      if (capTitle) tl.fromTo(capTitle, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.7, ease: 'none' }, 1.4);
      if (capSub) tl.fromTo(capSub, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'none' }, 1.55);

      var holdEnd = 2.6;
      if (capIndex) tl.to(capIndex, { opacity: 0, duration: 0.4, ease: 'none' }, holdEnd);
      if (capTitle) tl.to(capTitle, { opacity: 0, duration: 0.4, ease: 'none' }, holdEnd);
      if (capSub) tl.to(capSub, { opacity: 0, duration: 0.4, ease: 'none' }, holdEnd);
      if (frags.length) tl.to(frags, { opacity: 0, duration: 0.5, stagger: 0.03, ease: 'none' }, holdEnd);

      tl.to(deviceWrap, { opacity: 0, scale: 0.05, z: -1500, rotationY: exitRotY, rotationX: opts.exitRotX || 0, duration: 1.1, ease: 'none' }, holdEnd + 0.15);

      if (typeof opts.extend === 'function') opts.extend(tl, panel, holdEnd);

    } else {
      gsap.set(deviceWrap, { opacity: 0, scale: 1, z: 0, rotationY: 0 });
      var stl = gsap.timeline({
        scrollTrigger: { trigger: panel, start: 'top 75%', toggleActions: 'play none none reverse' },
        defaults: { ease: 'power2.out' }
      });
      stl.to(deviceWrap, { opacity: 1, duration: 0.8 }, 0);
      if (capIndex) stl.to(capIndex, { opacity: 1, y: 0, duration: 0.6 }, 0.15);
      if (capTitle) stl.to(capTitle, { opacity: 1, y: 0, duration: 0.6 }, 0.25);
      if (capSub) stl.to(capSub, { opacity: 1, y: 0, duration: 0.6 }, 0.35);
    }
  }

  buildScene('#p-milimeter', { enterRotY: -26, exitRotY: 20, scrollLength: 170 });
  buildScene('#p-amritanshu', { enterRotY: 46, exitRotY: -30, scrollLength: 170 });
  buildScene('#p-mms', { enterRotY: -18, exitRotY: 0, scrollLength: 170 });
  buildScene('#p-hrms', {
    enterRotY: 0, enterRotX: 14, exitRotY: 0, exitRotX: -10, scrollLength: 190,
    extend: function (tl, panel) {
      var flyFrags = panel.querySelectorAll('.fly-frag');
      if (!flyFrags.length) return;
      tl.fromTo(flyFrags, { z: -260, opacity: 0 }, { z: 520, opacity: 1, stagger: 0.12, duration: 1.4, ease: 'none' }, 1.6);
      tl.to(flyFrags, { z: 900, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'none' }, 2.6);
    }
  });
  buildScene('#p-pms', {
    enterRotY: -14, exitRotY: 18, scrollLength: 170,
    extend: function (tl, panel) {
      var depthFrags = panel.querySelectorAll('.depth-frag');
      depthFrags.forEach(function (f, i) {
        tl.fromTo(f, { z: -200 + i * 60, opacity: 0 }, { z: 60 - i * 40, opacity: 1, duration: 0.8, ease: 'none' }, 1.3 + i * 0.1);
      });
    }
  });

  /* ---------------------------------------------------------
     OFFERX — signature sequence
  --------------------------------------------------------- */
  (function offerx() {
    var panel = document.querySelector('#p-offerx');
    if (!panel || !gsapReady) return;
    var deviceWrap = panel.querySelector('.device-wrap');
    var capIndex = panel.querySelector('.cap-index');
    var capTitle = panel.querySelector('.cap-title');
    var capSub = panel.querySelector('.cap-sub-big');
    var sideLeft = panel.querySelector('.side-left');
    var sideRight = panel.querySelector('.side-right');
    var cards = panel.querySelectorAll('.card-1, .card-2, .card-3');

    if (isDesktop) {
      var tl = gsap.timeline({
        scrollTrigger: { trigger: panel, start: 'top top', end: '+=260%', scrub: 1, pin: true, anticipatePin: 1 }
      });

      tl.fromTo(deviceWrap,
        { opacity: 0, scale: 0.03, z: -2200, rotationY: -70, rotationX: 10 },
        { opacity: 1, scale: 1, z: 0, rotationY: 0, rotationX: 0, duration: 1.4, ease: 'none' }, 0);

      tl.fromTo(capIndex, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'none' }, 0.3);
      tl.fromTo(capTitle, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'none' }, 0.4);
      tl.fromTo(capSub, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'none' }, 1.0);
      tl.to([capIndex, capTitle, capSub], { opacity: 0, duration: 0.4, ease: 'none' }, 1.7);

      tl.to(deviceWrap, { scale: 1.55, duration: 1.2, ease: 'none' }, 1.8);

      tl.fromTo(sideLeft, { opacity: 0, x: 0, z: -100 }, { opacity: 1, x: -60, z: 80, duration: 1.1, ease: 'none' }, 2.1);
      tl.fromTo(sideRight, { opacity: 0, x: 0, z: -100 }, { opacity: 1, x: 60, z: 80, duration: 1.1, ease: 'none' }, 2.1);

      cards.forEach(function (c, i) {
        tl.fromTo(c, { opacity: 0, z: -300, scale: 0.7 }, { opacity: 1, z: 420, scale: 1.15, duration: 1.3, ease: 'none' }, 2.4 + i * 0.15);
        tl.to(c, { opacity: 0, z: 760, duration: 0.7, ease: 'none' }, 3.5 + i * 0.15);
      });

      tl.to([sideLeft, sideRight], { opacity: 0, x: 0, z: -100, duration: 0.7, ease: 'none' }, 3.9);
      tl.to(deviceWrap, { scale: 1, duration: 0.8, ease: 'none' }, 3.9);
      tl.to(deviceWrap, { opacity: 0, rotationY: 95, scale: 0.4, z: -300, duration: 1, ease: 'none' }, 4.6);

    } else {
      gsap.set(deviceWrap, { opacity: 0 });
      var stl = gsap.timeline({
        scrollTrigger: { trigger: panel, start: 'top 75%', toggleActions: 'play none none reverse' },
        defaults: { ease: 'power2.out' }
      });
      stl.to(deviceWrap, { opacity: 1, duration: 0.8 }, 0);
      stl.to(capIndex, { opacity: 1, duration: 0.5 }, 0.1);
      stl.to(capTitle, { opacity: 1, duration: 0.5 }, 0.2);
      stl.to(capSub, { opacity: 1, duration: 0.5 }, 0.3);
    }
  })();

  buildScene('#p-admin', {
    enterRotY: -90, exitRotY: 0, scrollLength: 190,
    extend: function (tl, panel) {
      var unfoldFrags = panel.querySelectorAll('.unfold-frag');
      if (!unfoldFrags.length) return;
      tl.fromTo(unfoldFrags, { y: 50, opacity: 0, rotationX: -20 }, { y: 0, opacity: 1, rotationX: 0, stagger: 0.1, duration: 0.8, ease: 'none' }, 1.5);
    }
  });

  /* ---------------------------------------------------------
     STATEMENT — projects shrink into a constellation, then text
  --------------------------------------------------------- */
  (function statement() {
    var panel = document.querySelector('#statement');
    if (!panel || !gsapReady) return;
    var constellation = panel.querySelector('#constellation');
    var nodes = panel.querySelectorAll('.const-node');
    var lines = panel.querySelectorAll('.st-line');

    if (isDesktop) {
      var tl = gsap.timeline({
        scrollTrigger: { trigger: panel, start: 'top top', end: '+=200%', scrub: 1, pin: true, anticipatePin: 1 }
      });
      tl.fromTo(constellation, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'none' }, 0);
      tl.fromTo(nodes, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, stagger: 0.08, duration: 1, ease: 'none' }, 0.1);
      tl.to(nodes, { opacity: 0, scale: 0.3, stagger: 0.04, duration: 0.6, ease: 'none' }, 1.6);
      tl.to(constellation, { opacity: 0, duration: 0.4, ease: 'none' }, 2.0);

      lines.forEach(function (line, i) {
        tl.fromTo(line, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'none' }, 2.2 + i * 0.6);
      });
      tl.to(lines, { opacity: 0, duration: 0.5, ease: 'none' }, 4.6);
    } else {
      gsap.set(constellation, { opacity: 0 });
      var stl = gsap.timeline({ scrollTrigger: { trigger: panel, start: 'top 70%', toggleActions: 'play none none reverse' } });
      lines.forEach(function (line, i) {
        stl.to(line, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, i * 0.15);
      });
    }
  })();

  /* ---------------------------------------------------------
     TECHNOLOGY WALL — typographic reveal, mixed scale
  --------------------------------------------------------- */
  (function techWall() {
    var wall = document.getElementById('techWall');
    if (!wall) return;
    var words = ['JAVA', 'SPRING BOOT', 'REACT', 'REACT NATIVE', 'JAVASCRIPT', 'PYTHON', 'NODE.JS', 'POSTGRESQL', 'MYSQL', 'MONGODB', 'DOCKER', 'KUBERNETES', 'GOOGLE CLOUD'];
    var sizes = [56, 22, 40, 18, 30, 20, 26, 16, 34, 18, 44, 22, 28];
    words.forEach(function (w, i) {
      var span = document.createElement('span');
      span.className = 'tech-word';
      span.textContent = w;
      span.style.fontSize = sizes[i % sizes.length] + 'px';
      wall.appendChild(span);
    });

    if (!gsapReady) return;
    var spans = wall.querySelectorAll('.tech-word');
    if (isDesktop) {
      var tl = gsap.timeline({
        scrollTrigger: { trigger: '#tech', start: 'top top', end: '+=140%', scrub: 1, pin: true, anticipatePin: 1 }
      });
      spans.forEach(function (s, i) {
        var dir = i % 2 === 0 ? -1 : 1;
        tl.fromTo(s, { opacity: 0, y: 24, x: dir * 16 }, { opacity: 1, y: 0, x: 0, duration: 0.6, ease: 'none' }, i * 0.12);
      });
      // gentle continual drift
      if (!reduceMotion) {
        spans.forEach(function (s, i) {
          gsap.to(s, { x: '+=' + (i % 2 === 0 ? 10 : -10), duration: 5 + (i % 4), repeat: -1, yoyo: true, ease: 'sine.inOut' });
        });
      }
    } else {
      gsap.set(spans, { opacity: 0, y: 20 });
      var stl = gsap.timeline({ scrollTrigger: { trigger: '#tech', start: 'top 70%', toggleActions: 'play none none reverse' } });
      stl.to(spans, { opacity: 1, y: 0, stagger: 0.04, duration: 0.5, ease: 'power2.out' }, 0);
    }
  })();

  /* ---------------------------------------------------------
     ABOUT — reveal
  --------------------------------------------------------- */
  (function about() {
    if (!gsapReady) return;
    ['.about-name', '.about-roles', '.about-desc'].forEach(function (sel, i) {
      var el = document.querySelector(sel);
      if (!el) return;
      gsap.to(el, {
        opacity: 1, duration: 0.9, ease: 'power3.out', delay: i * 0.1,
        scrollTrigger: { trigger: '#about', start: 'top 75%', toggleActions: 'play none none reverse' }
      });
    });
  })();

  /* ---------------------------------------------------------
     CONTACT — reveal + cursor distortion on headline
  --------------------------------------------------------- */
  (function contact() {
    var panel = document.querySelector('#contact');
    if (!panel || !gsapReady) return;
    var kicker = panel.querySelector('.contact-kicker');
    var headline = panel.querySelector('.contact-headline');
    var links = panel.querySelector('.contact-links');
    var footer = panel.querySelector('.footer');

    var stl = gsap.timeline({ scrollTrigger: { trigger: panel, start: 'top 70%', toggleActions: 'play none none reverse' } });
    stl.to(kicker, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0)
      .to(headline, { opacity: 1, duration: 0.7, ease: 'power2.out' }, 0.15)
      .to(links, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.3)
      .to(footer, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.45);

    if (!isTouch && !reduceMotion) {
      var skewX = gsap.quickTo(headline, 'skewX', { duration: 0.5, ease: 'power3.out' });
      var moveX = gsap.quickTo(headline, 'x', { duration: 0.6, ease: 'power3.out' });
      panel.addEventListener('mousemove', function (e) {
        var r = panel.getBoundingClientRect();
        var relX = (e.clientX - (r.left + r.width / 2)) / r.width;
        skewX(relX * 6);
        moveX(relX * 14);
      });
      panel.addEventListener('mouseleave', function () { skewX(0); moveX(0); });
    }
  })();

  /* ---------------------------------------------------------
     Resize
  --------------------------------------------------------- */
  window.addEventListener('resize', function () { if (gsapReady) ScrollTrigger.refresh(); });

  /* ---------------------------------------------------------
     Pause heavy work when tab hidden (continuous tweens only;
     scrub timelines are scroll-driven and cost nothing when idle)
  --------------------------------------------------------- */
  document.addEventListener('visibilitychange', function () {
    if (!gsapReady) return;
    if (document.hidden) gsap.globalTimeline.pause();
    else gsap.globalTimeline.resume();
  });

})();
