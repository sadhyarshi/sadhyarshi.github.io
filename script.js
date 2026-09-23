/* ============================================================
   SADHYARSHI — Portfolio interactions
   Vanilla JS. No dependencies.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(pointer: coarse)').matches;
  var isMobile = window.innerWidth <= 640;

  /* ---------------------------------------------------------
     Year
  --------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     Custom cursor
  --------------------------------------------------------- */
  (function cursor() {
    if (isTouch) return;
    var cursorEl = document.getElementById('cursor');
    var dotEl = document.getElementById('cursorDot');
    if (!cursorEl || !dotEl) return;

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var cx = mx, cy = my;

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dotEl.style.left = mx + 'px';
      dotEl.style.top = my + 'px';
    }, { passive: true });

    function raf() {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursorEl.style.left = cx + 'px';
      cursorEl.style.top = cy + 'px';
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    var hoverSelector = 'a, button, .project-nav-item, .tech-chip, .stage-btn, .scene-link';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(hoverSelector)) cursorEl.classList.add('hover');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(hoverSelector)) cursorEl.classList.remove('hover');
    });
  })();

  /* ---------------------------------------------------------
     Ambient background canvas (particles + faint grid)
  --------------------------------------------------------- */
  (function bg() {
    var canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w, h, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var particles = [];
    var running = true;

    var count = isMobile ? 28 : 70;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.4 + 0.3,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.08,
          a: Math.random() * 0.5 + 0.15
        });
      }
    }

    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      // faint grid
      ctx.strokeStyle = 'rgba(255,255,255,0.02)';
      ctx.lineWidth = 1;
      var gap = 90;
      for (var gx = 0; gx < w; gx += gap) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
      }
      for (var gy = 0; gy < h; gy += gap) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
      }

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

    resize();
    init();
    draw();

    window.addEventListener('resize', function () {
      resize(); init();
    });

    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running && !reduceMotion) requestAnimationFrame(draw);
    });
  })();

  /* ---------------------------------------------------------
     Nav: glassmorphism on scroll + active link + progress bar
  --------------------------------------------------------- */
  (function nav() {
    var navEl = document.getElementById('siteNav');
    var progress = document.getElementById('scrollProgress');
    var links = document.querySelectorAll('.nav-links a');
    var sections = ['projects', 'about', 'contact'].map(function (id) {
      return document.getElementById(id);
    });

    function onScroll() {
      var y = window.scrollY;
      if (navEl) navEl.classList.toggle('scrolled', y > 40);

      var docH = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.width = docH > 0 ? Math.min(100, (y / docH) * 100) + '%' : '0%';

      var activeIdx = -1;
      sections.forEach(function (sec, i) {
        if (!sec) return;
        var rect = sec.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.2) {
          activeIdx = i;
        }
      });
      links.forEach(function (l, i) { l.classList.toggle('active', i === activeIdx); });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ---------------------------------------------------------
     Hero: parallax on mouse move
  --------------------------------------------------------- */
  (function heroParallax() {
    if (isTouch || reduceMotion) return;
    var scene = document.getElementById('heroScene');
    var hero = document.getElementById('hero');
    if (!scene || !hero) return;
    var objs = scene.querySelectorAll('.hero-obj');

    var tx = 0, ty = 0, cx2 = 0, cy2 = 0;
    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      tx = (e.clientX - rect.left) / rect.width - 0.5;
      ty = (e.clientY - rect.top) / rect.height - 0.5;
    });

    function raf() {
      cx2 += (tx - cx2) * 0.05;
      cy2 += (ty - cy2) * 0.05;
      objs.forEach(function (o) {
        var depth = parseFloat(o.getAttribute('data-depth')) || 0.5;
        var moveX = cx2 * 40 * depth;
        var moveY = cy2 * 40 * depth;
        o.style.transform = 'translate3d(' + moveX + 'px,' + moveY + 'px,0)';
      });
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  })();

  /* ---------------------------------------------------------
     Project data
  --------------------------------------------------------- */
  var projects = [
    {
      id: 'milimeter',
      theme: 'theme-milimeter',
      device: 'laptop',
      title: 'Milimeter.co',
      role: 'E-commerce · Shopify',
      tags: ['Shopify', 'E-commerce', 'Liquid', 'Storefront'],
      link: '#',
      brand: 'MILIMETER',
      cards: [
        { title: 'Cart', sub: '3 items' },
        { title: 'New Drop', sub: 'Live now' },
        { title: 'Checkout', sub: 'Secure' }
      ]
    },
    {
      id: 'amritanshu',
      theme: 'theme-amritanshu',
      device: 'browser',
      title: 'AmritanshuPrajwal.com',
      role: 'Personal Portfolio · Ceramicist & Photographer',
      tags: ['React', 'Vite', 'Editorial UI'],
      link: '#',
      brand: 'AMRITANSHU',
      cards: [
        { title: 'Gallery', sub: 'Ceramics' },
        { title: 'Milimeter', sub: 'Founder' },
        { title: 'Journal', sub: 'Latest' }
      ]
    },
    {
      id: 'ngo',
      theme: 'theme-ngo',
      device: 'laptop',
      title: 'Mahila Mukti Sanstha',
      role: 'NGO Website · Community Platform',
      tags: ['Organization', 'Outreach', 'Web'],
      link: '#',
      brand: 'MMS.ORG',
      cards: [
        { title: 'Programs', sub: '12 active' },
        { title: 'Volunteers', sub: '340+' },
        { title: 'Impact', sub: 'Reports' }
      ]
    },
    {
      id: 'hrms',
      theme: 'theme-hrms',
      device: 'monitor',
      title: 'HRMS',
      role: 'hrms.mahilamuktisanstha.com',
      tags: ['Java', 'Spring Boot', 'HRMS', 'Dashboard'],
      link: '#',
      brand: 'HRMS',
      cards: [
        { title: 'Employees', sub: '128 active' },
        { title: 'Attendance', sub: '97% today' },
        { title: 'Leave', sub: '6 pending' }
      ]
    },
    {
      id: 'pms',
      theme: 'theme-pms',
      device: 'monitor',
      title: 'PMS',
      role: 'pms.mahilamuktisanstha.com',
      tags: ['Java', 'Spring Boot', 'Project Monitoring'],
      link: '#',
      brand: 'PMS',
      cards: [
        { title: 'Projects', sub: '14 running' },
        { title: 'Timelines', sub: 'On track' },
        { title: 'Field Team', sub: '22 members' }
      ]
    },
    {
      id: 'offerx',
      theme: 'theme-offerx',
      device: 'phone',
      title: 'OfferX',
      role: 'Marketplace Mobile Application',
      tags: ['React Native', 'Java', 'API', 'Marketplace'],
      link: '#',
      brand: 'OFFERX',
      cards: [
        { title: 'Buy', sub: '2,400 listings' },
        { title: 'Sell', sub: 'Post free' },
        { title: 'Offers', sub: 'Live deals' }
      ]
    },
    {
      id: 'offerx-admin',
      theme: 'theme-admin',
      device: 'monitor',
      title: 'OfferX Admin Panel',
      role: 'Marketplace Administration & Analytics',
      tags: ['Java', 'Spring Boot', 'Analytics', 'Moderation'],
      link: '#',
      brand: 'OFFERX / ADMIN',
      cards: [
        { title: 'Users', sub: '18,200' },
        { title: 'Approvals', sub: '32 queued' },
        { title: 'Analytics', sub: 'Realtime' }
      ]
    }
  ];

  /* ---------------------------------------------------------
     Device markup builders
  --------------------------------------------------------- */
  function screenContentHTML(p) {
    return '' +
      '<div class="ui-glow"></div>' +
      '<div class="ui-screen">' +
        '<div class="ui-nav"><span class="ui-brand">' + p.brand + '</span><div class="ui-dot-row"><span></span><span></span><span></span></div></div>' +
        '<div class="ui-bar accent" style="width:40%;margin-bottom:10px;"></div>' +
        '<div class="ui-grid ui-cols-3" style="margin-bottom:8px;">' +
          '<div class="ui-card tall"></div><div class="ui-card tall"></div><div class="ui-card tall"></div>' +
        '</div>' +
        '<div class="ui-grid ui-cols-2">' +
          '<div class="ui-card short"></div><div class="ui-card short"></div>' +
        '</div>' +
        '<div class="ui-badge" style="margin-top:10px;">' + (p.tags[0] || '') + '</div>' +
      '</div>';
  }

  function orbitCardsHTML(p) {
    if (isMobile) return '';
    var classes = ['c1', 'c2', 'c3'];
    return p.cards.map(function (c, i) {
      return '<div class="orbit-card ' + classes[i] + '"><b>' + c.title + '</b>' + c.sub + '</div>';
    }).join('');
  }

  function deviceHTML(p) {
    if (p.device === 'phone') {
      return '' +
        '<div class="device-phone ' + p.theme + '">' +
          '<div class="phone-frame"><div class="phone-screen">' + screenContentHTML(p) + '</div></div>' +
          orbitCardsHTML(p) +
        '</div>';
    }
    if (p.device === 'browser') {
      return '' +
        '<div class="device-monitor ' + p.theme + '" style="width:min(96%,520px);">' +
          '<div class="monitor-frame">' +
            '<div class="monitor-screen"><div class="ui-nav" style="position:absolute;top:0;left:0;right:0;padding:8px 12px;background:rgba(255,255,255,0.03);z-index:2;">' +
              '<div class="ui-dot-row"><span></span><span></span><span></span></div><span class="ui-brand"></span></div>' +
              screenContentHTML(p) +
            '</div>' +
          '</div>' +
          '<div class="monitor-stand"></div><div class="monitor-base"></div>' +
          orbitCardsHTML(p) +
        '</div>';
    }
    if (p.device === 'monitor') {
      return '' +
        '<div class="device-monitor ' + p.theme + '">' +
          '<div class="monitor-frame">' +
            '<div class="monitor-screen">' + screenContentHTML(p) + '</div>' +
          '</div>' +
          '<div class="monitor-stand"></div><div class="monitor-base"></div>' +
          orbitCardsHTML(p) +
        '</div>';
    }
    // laptop (default)
    return '' +
      '<div class="device-laptop ' + p.theme + '">' +
        '<div class="laptop-lid"><div class="laptop-screen">' + screenContentHTML(p) + '</div></div>' +
        '<div class="laptop-base"></div>' +
        orbitCardsHTML(p) +
      '</div>';
  }

  function sceneHTML(p, index) {
    return '' +
      '<div class="scene-visual">' + deviceHTML(p) + '</div>' +
      '<div class="scene-info">' +
        '<span class="scene-index">' + String(index + 1).padStart(2, '0') + '</span>' +
        '<h3 class="scene-title">' + p.title + '</h3>' +
        '<p class="scene-role">' + p.role + '</p>' +
        '<div class="scene-tags">' + p.tags.map(function (t) { return '<span class="scene-tag">' + t + '</span>'; }).join('') + '</div>' +
        '<a href="' + p.link + '" class="scene-link" target="_blank" rel="noopener"><span>View Project</span> →</a>' +
      '</div>';
  }

  /* ---------------------------------------------------------
     Stage controller
  --------------------------------------------------------- */
  (function stageController() {
    var stage = document.getElementById('stage');
    var projectNav = document.getElementById('projectNav');
    var stageCurrent = document.getElementById('stageCurrent');
    var stageTotal = document.getElementById('stageTotal');
    var prevBtn = document.getElementById('prevBtn');
    var nextBtn = document.getElementById('nextBtn');
    var showcase = document.querySelector('.showcase');
    if (!stage) return;

    var current = 0;
    var animating = false;
    var total = projects.length;
    if (stageTotal) stageTotal.textContent = String(total).padStart(2, '0');

    // Build side nav
    projects.forEach(function (p, i) {
      var item = document.createElement('div');
      item.className = 'project-nav-item' + (i === 0 ? ' active' : '');
      item.setAttribute('data-index', i);
      item.innerHTML = '<span class="num">' + String(i + 1).padStart(2, '0') + '</span><span class="bar"></span><span class="label">' + p.title.split('.')[0].toUpperCase() + '</span>';
      item.addEventListener('click', function () { goTo(i); });
      projectNav.appendChild(item);
    });

    function renderInitial() {
      var scene = document.createElement('div');
      scene.className = 'scene active';
      scene.innerHTML = sceneHTML(projects[0], 0);
      stage.appendChild(scene);
    }
    renderInitial();

    function updateSideNav() {
      var items = projectNav.querySelectorAll('.project-nav-item');
      items.forEach(function (it, i) { it.classList.toggle('active', i === current); });
    }

    function goTo(index, dir) {
      if (animating || index === current || index < 0 || index >= total) return;
      animating = true;
      dir = dir || (index > current ? 'next' : 'prev');

      var oldScene = stage.querySelector('.scene');
      var newScene = document.createElement('div');
      newScene.className = 'scene ' + (dir === 'next' ? 'enter-next' : 'enter-prev');
      newScene.innerHTML = sceneHTML(projects[index], index);
      stage.appendChild(newScene);

      // force reflow
      void newScene.offsetWidth;

      requestAnimationFrame(function () {
        if (oldScene) {
          oldScene.classList.remove('active');
          oldScene.classList.add(dir === 'next' ? 'leave-next' : 'leave-prev');
        }
        newScene.classList.remove('enter-next', 'enter-prev');
        newScene.classList.add('active');
      });

      var cleanupDelay = reduceMotion ? 50 : 900;
      setTimeout(function () {
        if (oldScene && oldScene.parentNode) oldScene.parentNode.removeChild(oldScene);
        animating = false;
      }, cleanupDelay);

      current = index;
      if (stageCurrent) stageCurrent.textContent = String(current + 1).padStart(2, '0');
      updateSideNav();
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1, 'prev'); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1, 'next'); });

    /* Show side nav only while showcase section is in view */
    function checkVisible() {
      if (!showcase) return;
      var rect = showcase.getBoundingClientRect();
      var visible = rect.top < window.innerHeight * 0.6 && rect.bottom > window.innerHeight * 0.4;
      projectNav.classList.toggle('visible', visible);
      return visible;
    }
    window.addEventListener('scroll', checkVisible, { passive: true });
    checkVisible();

    /* Keyboard navigation */
    document.addEventListener('keydown', function (e) {
      if (!checkVisible()) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goTo(Math.min(current + 1, total - 1), 'next'); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goTo(Math.max(current - 1, 0), 'prev'); }
    });

    /* Wheel navigation within the showcase (throttled) */
    var wheelLock = false;
    showcase && showcase.addEventListener('wheel', function (e) {
      if (!checkVisible()) return;
      // allow normal page scroll to move between major sections at the edges
      if ((current === 0 && e.deltaY < 0) || (current === total - 1 && e.deltaY > 0)) return;
      e.preventDefault();
      if (wheelLock) return;
      wheelLock = true;
      if (e.deltaY > 12) goTo(Math.min(current + 1, total - 1), 'next');
      else if (e.deltaY < -12) goTo(Math.max(current - 1, 0), 'prev');
      setTimeout(function () { wheelLock = false; }, 700);
    }, { passive: false });

    /* Touch swipe */
    var touchStartX = 0, touchStartY = 0;
    stage.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - touchStartX;
      var dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) goTo(Math.min(current + 1, total - 1), 'next');
        else goTo(Math.max(current - 1, 0), 'prev');
      }
    }, { passive: true });
  })();

  /* ---------------------------------------------------------
     Tech chips
  --------------------------------------------------------- */
  (function techChips() {
    var cloud = document.getElementById('techCloud');
    if (!cloud) return;
    var chips = [
      'Java', 'Spring Boot', 'React', 'React Native', 'JavaScript', 'Python',
      'Node.js', 'PostgreSQL', 'MySQL', 'MongoDB', 'Docker', 'Kubernetes', 'Google Cloud'
    ];
    chips.forEach(function (c, i) {
      var el = document.createElement('span');
      el.className = 'tech-chip';
      el.textContent = c;
      el.style.animationDelay = (-(i % 6) * 0.9) + 's';
      cloud.appendChild(el);
    });
  })();

  /* ---------------------------------------------------------
     Mobile nav toggle (simple in-place, no menu markup needed
     beyond existing links; toggles a class for small screens)
  --------------------------------------------------------- */
  (function mobileNav() {
    var toggle = document.getElementById('navToggle');
    var links = document.querySelector('.nav-links');
    if (!toggle || !links) return;
    toggle.style.display = 'none'; // links collapse via CSS media query already hides them on small screens;
    // toggle kept minimal/hidden to avoid adding unused UI per spec's minimalism.
  })();

})();
