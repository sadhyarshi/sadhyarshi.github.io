/* ============================================================
   SADHYARSHI — Editorial Light Portfolio
   GSAP + ScrollTrigger. Vanilla JS. No build step.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(pointer: coarse)').matches;
  var gsapReady = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (gsapReady) gsap.registerPlugin(ScrollTrigger);

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     SCROLL PROGRESS
  --------------------------------------------------------- */
  (function progress() {
    var bar = document.getElementById('progress');
    function onScroll() {
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var y = window.scrollY;
      if (bar) bar.style.width = (docH > 0 ? Math.min(100, (y / docH) * 100) : 0) + '%';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ---------------------------------------------------------
     HOVER TAG — follows cursor over a project row
  --------------------------------------------------------- */
  (function hoverTag() {
    if (isTouch) return;
    var tag = document.getElementById('hoverTag');
    if (!tag) return;
    var projects = document.querySelectorAll('.project');
    var tx = 0, ty = 0, cx = 0, cy = 0, active = false;

    function raf() {
      cx += (tx - cx) * 0.25;
      cy += (ty - cy) * 0.25;
      tag.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%) scale(' + (active ? 1 : 0.8) + ')';
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    projects.forEach(function (p) {
      p.addEventListener('mouseenter', function () { active = true; tag.classList.add('visible'); });
      p.addEventListener('mouseleave', function () { active = false; tag.classList.remove('visible'); });
      p.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; });
    });
  })();

  /* ---------------------------------------------------------
     HERO — line-by-line reveal + growing rule + subtle drift
  --------------------------------------------------------- */
  (function hero() {
    if (!gsapReady) {
      document.querySelectorAll('.hl').forEach(function (el) { el.style.opacity = 1; el.style.transform = 'none'; });
      var sub = document.querySelector('.hero-sub'); if (sub) sub.style.opacity = 1;
      var cta = document.querySelector('.scroll-cta'); if (cta) cta.style.opacity = 1;
      return;
    }
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.hl', { opacity: 1, y: 0, duration: 1, stagger: 0.12 }, 0.15)
      .to('.hero-sub', { opacity: 1, duration: 0.8 }, 0.8)
      .to('#heroLine', { width: '100%', duration: 1.2, ease: 'power2.inOut' }, 0.9)
      .to('.scroll-cta', { opacity: 1, duration: 0.7 }, 1.2);

    if (!reduceMotion) {
      gsap.to('#heroLine', {
        width: '18%', duration: 3.5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2.4
      });
    }
  })();

  /* ---------------------------------------------------------
     INTRO reveal
  --------------------------------------------------------- */
  (function intro() {
    if (!gsapReady) return;
    gsap.set('.intro-label, .intro-text', { opacity: 0, y: 20 });
    gsap.to('.intro-label, .intro-text', {
      opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: '.intro', start: 'top 75%', toggleActions: 'play none none reverse' }
    });
  })();

  /* ---------------------------------------------------------
     PROJECTS — editorial reveal (image sharpens + scales,
     title shifts up, number resets, line-by-line meta reveal)
  --------------------------------------------------------- */
  (function projects() {
    var items = document.querySelectorAll('.project');
    if (!items.length) return;

    items.forEach(function (item) {
      var frame = item.querySelector('.project-frame');
      var num = item.querySelector('.project-num');
      var title = item.querySelector('.project-title');
      var meta = item.querySelectorAll('.project-meta, .project-url, .project-link');

      if (!gsapReady) {
        if (frame) { frame.style.opacity = 1; frame.style.filter = 'none'; frame.style.transform = 'none'; }
        return;
      }

      gsap.set(num, { opacity: 0, y: 10 });
      gsap.set(title, { opacity: 0, y: 24 });
      gsap.set(meta, { opacity: 0, y: 14 });

      var tl = gsap.timeline({
        scrollTrigger: { trigger: item, start: 'top 78%', toggleActions: 'play none none reverse' },
        defaults: { ease: 'power2.out' }
      });

      tl.to(frame, { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'power2.out' }, 0)
        .to(num, { opacity: 1, y: 0, duration: 0.6 }, 0.1)
        .to(title, { opacity: 1, y: 0, duration: 0.8 }, 0.2)
        .to(meta, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.35);

      // subtle scale-back as it leaves the viewport upward
      if (!isTouch && !reduceMotion) {
        gsap.to(frame, {
          scale: 0.97,
          ease: 'none',
          scrollTrigger: { trigger: item, start: 'bottom 60%', end: 'bottom -20%', scrub: true }
        });
      }
    });
  })();

  /* ---------------------------------------------------------
     FEATURED — OfferX (phone) & OfferX Admin (dashboard)
  --------------------------------------------------------- */
  (function featured() {
    if (!gsapReady) return;

    var offerx = document.querySelector('#offerx');
    if (offerx) {
      var phone = offerx.querySelector('.mock-phone');
      var ftitle = offerx.querySelector('.featured-title');
      var fmeta = offerx.querySelector('.featured-meta');
      gsap.set([ftitle, fmeta], { opacity: 0, y: 24 });

      var tl1 = gsap.timeline({
        scrollTrigger: { trigger: offerx, start: 'top 70%', toggleActions: 'play none none reverse' },
        defaults: { ease: 'power2.out' }
      });
      tl1.to(ftitle, { opacity: 1, y: 0, duration: 0.9 }, 0)
        .fromTo(phone, { opacity: 0, y: 60, scale: 0.92, rotate: -4 }, { opacity: 1, y: 0, scale: 1, rotate: 0, duration: 1.1 }, 0.15)
        .to(fmeta, { opacity: 1, y: 0, duration: 0.7 }, 0.5);

      if (!isTouch && !reduceMotion) {
        gsap.to(phone, {
          y: -40, ease: 'none',
          scrollTrigger: { trigger: offerx, start: 'bottom 70%', end: 'bottom -10%', scrub: true }
        });
      }
    }

    var admin = document.querySelector('#offerx-admin');
    if (admin) {
      var aframe = admin.querySelector('.admin-frame');
      var atitle = admin.querySelector('.featured-title');
      gsap.set(atitle, { opacity: 0, y: 24 });

      var tl2 = gsap.timeline({
        scrollTrigger: { trigger: admin, start: 'top 70%', toggleActions: 'play none none reverse' },
        defaults: { ease: 'power2.out' }
      });
      tl2.to(atitle, { opacity: 1, y: 0, duration: 0.9 }, 0)
        .fromTo(aframe, { opacity: 0, y: 40, scale: 0.94, x: -30 }, { opacity: 1, y: 0, scale: 1, x: 0, duration: 1.1 }, 0.15);

      if (!isTouch && !reduceMotion) {
        gsap.to(aframe, {
          x: 30, ease: 'none',
          scrollTrigger: { trigger: admin, start: 'top 40%', end: 'bottom -10%', scrub: true }
        });
      }
    }
  })();

  /* ---------------------------------------------------------
     TECHNOLOGIES — editorial grid reveal
  --------------------------------------------------------- */
  (function tech() {
    var grid = document.getElementById('techGrid');
    if (!grid) return;
    var words = ['JAVA', 'SPRING BOOT', 'REACT', 'REACT NATIVE', 'JAVASCRIPT', 'PYTHON', 'NODE.JS', 'POSTGRESQL', 'MYSQL', 'MONGODB', 'DOCKER', 'KUBERNETES', 'GOOGLE CLOUD'];
    words.forEach(function (w) {
      var div = document.createElement('div');
      div.className = 'tech-item';
      div.textContent = w;
      grid.appendChild(div);
    });

    if (!gsapReady) {
      grid.querySelectorAll('.tech-item').forEach(function (el) { el.style.opacity = 1; el.style.transform = 'none'; });
      return;
    }
    gsap.to(grid.querySelectorAll('.tech-item'), {
      opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'power2.out',
      scrollTrigger: { trigger: '.technologies', start: 'top 75%', toggleActions: 'play none none reverse' }
    });
  })();

  /* ---------------------------------------------------------
     EXPERIENCE — timeline reveal
  --------------------------------------------------------- */
  (function experience() {
    if (!gsapReady) return;
    gsap.to('.timeline-item', {
      opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out',
      scrollTrigger: { trigger: '.experience', start: 'top 75%', toggleActions: 'play none none reverse' }
    });
  })();

  /* ---------------------------------------------------------
     STATEMENT — independent line reveals
  --------------------------------------------------------- */
  (function statement() {
    if (!gsapReady) return;
    gsap.to('.st-1', {
      opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: '.statement', start: 'top 70%', toggleActions: 'play none none reverse' }
    });
    gsap.to('.st-2', {
      opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.15,
      scrollTrigger: { trigger: '.statement', start: 'top 60%', toggleActions: 'play none none reverse' }
    });
    gsap.to('.sl-item', {
      opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: '.statement-list', start: 'top 85%', toggleActions: 'play none none reverse' }
    });
  })();

  /* ---------------------------------------------------------
     CONTACT reveal
  --------------------------------------------------------- */
  (function contact() {
    if (!gsapReady) return;
    var tl = gsap.timeline({
      scrollTrigger: { trigger: '.contact', start: 'top 75%', toggleActions: 'play none none reverse' },
      defaults: { ease: 'power2.out' }
    });
    tl.to('.contact-kicker', { opacity: 1, duration: 0.6 }, 0)
      .to('.contact-headline', { opacity: 1, duration: 0.8 }, 0.15)
      .to('.contact-links', { opacity: 1, duration: 0.6 }, 0.35)
      .to('.footer', { opacity: 1, duration: 0.6 }, 0.5);
  })();

  /* ---------------------------------------------------------
     Resize + visibility handling
  --------------------------------------------------------- */
  window.addEventListener('resize', function () { if (gsapReady) ScrollTrigger.refresh(); });
  document.addEventListener('visibilitychange', function () {
    if (!gsapReady) return;
    if (document.hidden) gsap.globalTimeline.pause();
    else gsap.globalTimeline.resume();
  });

})();
