/* ============================================================
   SADHYARSHI — Cinematic Portfolio
   GSAP + ScrollTrigger driven. No build step.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(pointer: coarse)').matches;
  var isDesktop = window.matchMedia('(min-width: 901px)').matches && !reduceMotion;

  var gsapReady = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (gsapReady) {
    gsap.registerPlugin(ScrollTrigger);
  }

  document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());

  /* ---------------------------------------------------------
     LOADER
  --------------------------------------------------------- */
  var loaderDone = false;
  (function loader() {
    var loaderEl = document.getElementById('loader');
    var bar = document.getElementById('loaderBar');
    var pct = document.getElementById('loaderPct');
    if (!loaderEl) { loaderDone = true; return; }

    document.documentElement.classList.add('no-scroll-lock');
    document.documentElement.style.overflow = 'hidden';

    var progress = 0;
    var duration = reduceMotion ? 400 : 1400;
    var start = performance.now();

    function tick(now) {
      var elapsed = now - start;
      progress = Math.min(100, Math.round((elapsed / duration) * 100));
      if (bar) bar.style.width = progress + '%';
      if (pct) pct.textContent = progress;
      if (progress < 100) {
        requestAnimationFrame(tick);
      } else {
        finish();
      }
    }
    requestAnimationFrame(tick);

    function finish() {
      loaderEl.classList.add('done');
      document.documentElement.style.overflow = '';
      loaderDone = true;
      setTimeout(function () {
        loaderEl.style.display = 'none';
        playHeroIntro();
        if (gsapReady) ScrollTrigger.refresh();
      }, 820);
    }
  })();

  /* ---------------------------------------------------------
     CUSTOM CURSOR
  --------------------------------------------------------- */
  (function cursor() {
    if (isTouch) return;
    var el = document.getElementById('cursor');
    if (!el) return;
    var mx = window.innerWidth / 2, my = window.innerHeight / 2, cx = mx, cy = my;

    window.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });

    function raf() {
      cx += (mx - cx) * 0.22;
      cy += (my - cy) * 0.22;
      el.style.transform = 'translate(' + (cx - 4) + 'px,' + (cy - 4) + 'px)';
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    var hoverSel = 'a, .side-nav-dot, .contact-link, .footer';
    document.addEventListener('mouseover', function (e) { if (e.target.closest(hoverSel)) el.classList.add('hover'); });
    document.addEventListener('mouseout', function (e) { if (e.target.closest(hoverSel)) el.classList.remove('hover'); });
  })();

  /* ---------------------------------------------------------
     AMBIENT PARTICLE + GRID BACKGROUND
  --------------------------------------------------------- */
  (function bg() {
    var canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w, h, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var particles = [];
    var running = true;
    var count = isDesktop ? 60 : 22;

    function resize() {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function init() {
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w, y: Math.random() * h,
          r: Math.random() * 1.3 + 0.3,
          vx: (Math.random() - 0.5) * 0.06, vy: (Math.random() - 0.5) * 0.06,
          a: Math.random() * 0.4 + 0.12
        });
      }
    }
    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,224,164,' + p.a * 0.5 + ')';
        ctx.fill();
      }
      if (!reduceMotion) requestAnimationFrame(draw);
    }
    resize(); init(); draw();
    window.addEventListener('resize', function () { resize(); init(); });
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running && !reduceMotion) requestAnimationFrame(draw);
    });
  })();

  /* ---------------------------------------------------------
     SCROLL PROGRESS + BRAND MARK
  --------------------------------------------------------- */
  (function progressBar() {
    var bar = document.getElementById('scrollProgress');
    var brand = document.getElementById('brandMark');
    var hero = document.getElementById('hero');
    function onScroll() {
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var y = window.scrollY;
      if (bar) bar.style.width = (docH > 0 ? Math.min(100, (y / docH) * 100) : 0) + '%';
      if (brand && hero) {
        var heroBottom = hero.getBoundingClientRect().bottom;
        brand.classList.toggle('visible', heroBottom < 0);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ---------------------------------------------------------
     SIDE NAV — dots + smooth scroll + active tracking
  --------------------------------------------------------- */
  (function sideNav() {
    var dots = document.querySelectorAll('.side-nav-dot');
    if (!dots.length) return;

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var target = document.getElementById(dot.getAttribute('data-target'));
        if (!target) return;
        var top = target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });

    if (!gsapReady) return;
    dots.forEach(function (dot) {
      var target = document.getElementById(dot.getAttribute('data-target'));
      if (!target) return;
      ScrollTrigger.create({
        trigger: target,
        start: 'top center',
        end: 'bottom center',
        onToggle: function (self) {
          if (self.isActive) {
            dots.forEach(function (d) { d.classList.remove('active'); });
            dot.classList.add('active');
          }
        }
      });
    });
  })();

  /* ---------------------------------------------------------
     SUBTLE MOUSE PARALLAX ON PANEL-INNER (camera tilt)
  --------------------------------------------------------- */
  (function mouseParallax() {
    if (isTouch || reduceMotion || !gsapReady) return;
    var inners = document.querySelectorAll('.panel-inner');
    var quickFns = [];
    inners.forEach(function (el) {
      quickFns.push({
        el: el,
        rx: gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power2.out' }),
        ry: gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power2.out' })
      });
    });
    window.addEventListener('mousemove', function (e) {
      var nx = (e.clientX / window.innerWidth) - 0.5;
      var ny = (e.clientY / window.innerHeight) - 0.5;
      quickFns.forEach(function (q) {
        q.ry(nx * 4);
        q.rx(-ny * 4);
      });
    }, { passive: true });
  })();

  /* ---------------------------------------------------------
     HERO INTRO (autoplay once loader finishes)
  --------------------------------------------------------- */
  function playHeroIntro() {
    if (!gsapReady) return;
    var frags = document.querySelectorAll('#heroCam .world-frag');
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('#heroLine1', { opacity: 0.85, duration: 0.9 }, 0.1)
      .to('.hero-line2 .lw', { opacity: 1, y: 0, duration: 1, stagger: 0.18 }, 0.5)
      .to(frags, { opacity: 0.85, duration: 1.2, stagger: 0.09 }, 0.4)
      .to('.scroll-hint', { opacity: 0.7, duration: 0.8 }, 1.6);

    // gentle continuous float for hero fragments
    if (!reduceMotion) {
      frags.forEach(function (f, i) {
        gsap.to(f, {
          y: '+=' + (12 + (i % 3) * 6),
          duration: 4 + (i % 4),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.2
        });
      });
    }
  }

  /* ---------------------------------------------------------
     HERO — scroll-driven exit (camera moves forward through scene)
  --------------------------------------------------------- */
  if (gsapReady && isDesktop) {
    gsap.timeline({
      scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=100%', scrub: 1, pin: true, anticipatePin: 1 }
    })
      .to('.hero-text', { opacity: 0, z: 300, scale: 1.3, duration: 1, ease: 'none' }, 0)
      .to('#heroCam .world-frag', { z: 600, opacity: 0, stagger: 0.03, duration: 1, ease: 'none' }, 0.1)
      .to('.scroll-hint', { opacity: 0, duration: 0.3, ease: 'none' }, 0);
  } else if (gsapReady) {
    // mobile / reduced-motion: simple fade only, no pin
    ScrollTrigger.create({
      trigger: '#hero', start: 'bottom bottom', end: 'bottom top', scrub: false,
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
    var extra = opts.extraNodes ? panel.querySelectorAll(opts.extraNodes) : null;

    if (isDesktop) {
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: panel,
          start: 'top top',
          end: '+=' + (opts.scrollLength || 170) + '%',
          scrub: 1,
          pin: true,
          anticipatePin: 1
        }
      });

      var enterRotY = opts.enterRotY != null ? opts.enterRotY : -22;
      var exitRotY = opts.exitRotY != null ? opts.exitRotY : 22;
      var enterRotX = opts.enterRotX || 0;

      tl.fromTo(deviceWrap,
        { opacity: 0, scale: 0.05, z: -1500, rotationY: enterRotY, rotationX: enterRotX },
        { opacity: 1, scale: 1, z: 0, rotationY: 0, rotationX: 0, duration: 1.3, ease: 'none' }, 0);

      if (extra) {
        tl.fromTo(extra, { opacity: 0 }, { opacity: 0.9, duration: 0.8, stagger: 0.1, ease: 'none' }, 1.0);
      }

      if (frags.length) {
        tl.fromTo(frags, { opacity: 0, scale: 0.75 },
          { opacity: 1, scale: 1, stagger: 0.08, duration: 0.7, ease: 'none' }, 1.1);
      }

      if (capIndex) tl.fromTo(capIndex, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'none' }, 1.3);
      if (capTitle) tl.fromTo(capTitle, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.7, ease: 'none' }, 1.4);
      if (capSub) tl.fromTo(capSub, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'none' }, 1.55);

      // hold
      var holdEnd = 2.6;

      // exit
      if (capIndex) tl.to(capIndex, { opacity: 0, duration: 0.4, ease: 'none' }, holdEnd);
      if (capTitle) tl.to(capTitle, { opacity: 0, duration: 0.4, ease: 'none' }, holdEnd);
      if (capSub) tl.to(capSub, { opacity: 0, duration: 0.4, ease: 'none' }, holdEnd);
      if (frags.length) tl.to(frags, { opacity: 0, duration: 0.5, stagger: 0.03, ease: 'none' }, holdEnd);
      if (extra) tl.to(extra, { opacity: 0, duration: 0.4, ease: 'none' }, holdEnd);

      tl.to(deviceWrap, {
        opacity: 0, scale: 0.05, z: -1500, rotationY: exitRotY, rotationX: opts.exitRotX || 0,
        duration: 1.1, ease: 'none'
      }, holdEnd + 0.15);

      if (typeof opts.extend === 'function') opts.extend(tl, panel, holdEnd);

    } else {
      // Mobile / reduced-motion: simple reveal, no pin, no scrub
      gsap.set(deviceWrap, { opacity: 0, scale: 1, z: 0, rotationY: 0 });
      var stl = gsap.timeline({
        scrollTrigger: { trigger: panel, start: 'top 75%', toggleActions: 'play none none reverse' },
        defaults: { ease: 'power2.out' }
      });
      stl.to(deviceWrap, { opacity: 1, duration: 0.8 }, 0);
      if (capIndex) stl.to(capIndex, { opacity: 1, y: 0, duration: 0.6 }, 0.15);
      if (capTitle) stl.to(capTitle, { opacity: 1, y: 0, duration: 0.6 }, 0.25);
      if (capSub) stl.to(capSub, { opacity: 1, y: 0, duration: 0.6 }, 0.35);
      if (extra) stl.to(extra, { opacity: 0.9, duration: 0.6 }, 0.3);
    }
  }

  /* Project 01 — Milimeter: browser rises from distance */
  buildScene('#p-milimeter', { enterRotY: -26, exitRotY: 20, scrollLength: 170 });

  /* Project 02 — Amritanshu: rotates in from the side */
  buildScene('#p-amritanshu', { enterRotY: 46, exitRotY: -30, scrollLength: 170 });

  /* Project 03 — MMS: dissolves into connected nodes at the end */
  buildScene('#p-mms', {
    enterRotY: -18, exitRotY: 0, scrollLength: 180, extraNodes: '.node-dot',
    extend: function (tl, panel, holdEnd) {
      var dots = panel.querySelectorAll('.node-dot');
      if (!dots.length) return;
      tl.to(dots, { opacity: 1, scale: 1.4, stagger: 0.06, duration: 0.5, ease: 'none' }, holdEnd - 0.2);
    }
  });

  /* Project 04 — HRMS: dashboard expands, camera flies through (frags fly past) */
  buildScene('#p-hrms', {
    enterRotY: 0, enterRotX: 14, exitRotY: 0, exitRotX: -10, scrollLength: 190,
    extend: function (tl, panel) {
      var flyFrags = panel.querySelectorAll('.fly-frag');
      if (!flyFrags.length) return;
      tl.fromTo(flyFrags, { z: -260, opacity: 0 }, { z: 520, opacity: 1, stagger: 0.12, duration: 1.4, ease: 'none' }, 1.6);
      tl.to(flyFrags, { z: 900, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'none' }, 2.6);
    }
  });

  /* Project 05 — PMS: cards move forward/back in depth */
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
     MAIN EVENT — OFFERX (signature sequence)
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
        scrollTrigger: {
          trigger: panel, start: 'top top', end: '+=260%', scrub: 1, pin: true, anticipatePin: 1
        }
      });

      // Phone rapidly approaches, rotating in from the dark distance
      tl.fromTo(deviceWrap,
        { opacity: 0, scale: 0.03, z: -2200, rotationY: -70, rotationX: 10 },
        { opacity: 1, scale: 1, z: 0, rotationY: 0, rotationX: 0, duration: 1.4, ease: 'none' }, 0);

      tl.fromTo(capIndex, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'none' }, 0.3);
      tl.fromTo(capTitle, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'none' }, 0.4);

      // Headline "A MARKETPLACE BUILT FOR MOBILE" appears, then clears
      tl.fromTo(capSub, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'none' }, 1.0);
      tl.to([capIndex, capTitle, capSub], { opacity: 0, duration: 0.4, ease: 'none' }, 1.7);

      // Screen "expands beyond the device" — the whole device scales up to fill the frame
      tl.to(deviceWrap, { scale: 1.55, duration: 1.2, ease: 'none' }, 1.8);

      // BUY moves left, SELL moves right — the marketplace opens up around the viewer
      tl.fromTo(sideLeft, { opacity: 0, x: 0, z: -100 }, { opacity: 1, x: -60, z: 80, duration: 1.1, ease: 'none' }, 2.1);
      tl.fromTo(sideRight, { opacity: 0, x: 0, z: -100 }, { opacity: 1, x: 60, z: 80, duration: 1.1, ease: 'none' }, 2.1);

      // Product cards travel toward the camera, as if passing the viewer
      cards.forEach(function (c, i) {
        tl.fromTo(c, { opacity: 0, z: -300, scale: 0.7 },
          { opacity: 1, z: 420, scale: 1.15, duration: 1.3, ease: 'none' }, 2.4 + i * 0.15);
        tl.to(c, { opacity: 0, z: 760, duration: 0.7, ease: 'none' }, 3.5 + i * 0.15);
      });

      // Everything collapses back into the phone
      tl.to([sideLeft, sideRight], { opacity: 0, x: 0, z: -100, duration: 0.7, ease: 'none' }, 3.9);
      tl.to(deviceWrap, { scale: 1, duration: 0.8, ease: 'none' }, 3.9);

      // Phone rotates sideways in preparation for becoming the admin monitor
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

  /* Project 07 — OfferX Admin: rotates in from sideways, unfolds like a machine */
  buildScene('#p-admin', {
    enterRotY: -90, exitRotY: 0, scrollLength: 190,
    extend: function (tl, panel, holdEnd) {
      var unfoldFrags = panel.querySelectorAll('.unfold-frag');
      if (!unfoldFrags.length) return;
      tl.fromTo(unfoldFrags, { y: 50, opacity: 0, rotationX: -20 },
        { y: 0, opacity: 1, rotationX: 0, stagger: 0.1, duration: 0.8, ease: 'none' }, 1.5);
    }
  });

  /* ---------------------------------------------------------
     ARCHITECTURE / STACK
  --------------------------------------------------------- */
  (function architecture() {
    var panel = document.querySelector('#architecture');
    if (!panel || !gsapReady) return;

    var chipsData = ['Java', 'Spring Boot', 'React', 'React Native', 'Node.js', 'PostgreSQL', 'MySQL', 'MongoDB', 'Docker', 'Kubernetes', 'Google Cloud'];
    var cloud = document.getElementById('techCloud');
    chipsData.forEach(function (c) {
      var span = document.createElement('span');
      span.className = 'tech-chip';
      span.textContent = c;
      cloud.appendChild(span);
    });

    var nodes = panel.querySelectorAll('.arch-node');
    var lines = panel.querySelectorAll('.arch-line');
    var flowSpans = panel.querySelectorAll('.arch-flow span');
    var flow = panel.querySelector('.arch-flow');
    var chips = panel.querySelectorAll('.tech-chip');

    if (isDesktop) {
      var tl = gsap.timeline({
        scrollTrigger: { trigger: panel, start: 'top top', end: '+=220%', scrub: 1, pin: true, anticipatePin: 1 }
      });

      tl.fromTo(nodes, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, stagger: 0.08, duration: 1, ease: 'none' }, 0);
      tl.fromTo(lines, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'none' }, 0.5);

      tl.to([nodes, lines], { opacity: 0, duration: 0.6, ease: 'none' }, 1.6);

      tl.fromTo(flow, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'none' }, 1.8);
      tl.fromTo(flowSpans, { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.18, duration: 0.5, ease: 'none' }, 1.9);
      tl.to(flow, { opacity: 0, duration: 0.5, ease: 'none' }, 3.1);

      tl.fromTo(cloud, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'none' }, 3.3);
      tl.fromTo(chips, { opacity: 0, y: 20, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, stagger: 0.03, duration: 0.6, ease: 'none' }, 3.4);
    } else {
      gsap.set([nodes, lines, flow], { opacity: 0 });
      var stl = gsap.timeline({ scrollTrigger: { trigger: panel, start: 'top 70%', toggleActions: 'play none none reverse' } });
      stl.to(cloud, { opacity: 1, duration: 0.8 }, 0);
      stl.to(chips, { opacity: 1, y: 0, stagger: 0.03, duration: 0.5 }, 0.1);
    }
  })();

  /* ---------------------------------------------------------
     ABOUT — independent line reveals
  --------------------------------------------------------- */
  (function about() {
    if (!gsapReady) return;
    var lines = document.querySelectorAll('.about-line');
    lines.forEach(function (line, i) {
      gsap.fromTo(line, { opacity: 0, y: 40, rotationX: -30 }, {
        opacity: 1, y: 0, rotationX: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: line, start: 'top 80%', toggleActions: 'play none none reverse' }
      });
    });
  })();

  /* ---------------------------------------------------------
     CONTACT — point expands into headline
  --------------------------------------------------------- */
  (function contact() {
    var panel = document.querySelector('#contact');
    if (!panel || !gsapReady) return;
    var point = panel.querySelector('.contact-point');
    var headline = panel.querySelector('.contact-headline');
    var sub = panel.querySelector('.contact-sub');
    var links = panel.querySelector('.contact-links');
    var footer = panel.querySelector('.footer');

    if (isDesktop) {
      var tl = gsap.timeline({
        scrollTrigger: { trigger: panel, start: 'top top', end: '+=120%', scrub: 1, pin: true, anticipatePin: 1 }
      });
      tl.fromTo(point, { scale: 0.4, opacity: 0.4 }, { scale: 14, opacity: 1, duration: 1, ease: 'none' }, 0)
        .to(point, { opacity: 0, duration: 0.3, ease: 'none' }, 1.0)
        .fromTo(headline, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'none' }, 1.1)
        .fromTo(sub, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'none' }, 1.5)
        .fromTo(links, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'none' }, 1.8)
        .fromTo(footer, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'none' }, 2.1);
    } else {
      gsap.set(point, { scale: 1, opacity: 1 });
      var stl = gsap.timeline({ scrollTrigger: { trigger: panel, start: 'top 70%', toggleActions: 'play none none reverse' } });
      stl.to(headline, { opacity: 1, y: 0, duration: 0.6 }, 0)
        .to(sub, { opacity: 1, y: 0, duration: 0.6 }, 0.15)
        .to(links, { opacity: 1, y: 0, duration: 0.6 }, 0.3)
        .to(footer, { opacity: 1, duration: 0.6 }, 0.45);
    }
  })();

  /* ---------------------------------------------------------
     Resize handling
  --------------------------------------------------------- */
  window.addEventListener('resize', function () {
    if (gsapReady) ScrollTrigger.refresh();
  });

})();
