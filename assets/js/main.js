/*
 * Interactive enhancements for ianwu.co.uk.
 * The page is fully readable without this script; everything here is optional
 * polish and respects the visitor's reduced-motion preference.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');

  function each(selector, fn, scope) {
    Array.prototype.forEach.call((scope || document).querySelectorAll(selector), fn);
  }

  /* ---------- Scroll progress bar and back-to-top button ---------- */
  var progress = document.getElementById('scroll-progress');
  var toTop = document.getElementById('back-to-top');
  if (toTop) toTop.hidden = false;
  var scrollQueued = false;

  function updateScroll() {
    scrollQueued = false;
    var max = root.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    if (progress) progress.style.transform = 'scaleX(' + ratio + ')';
    if (toTop) toTop.classList.toggle('is-shown', window.scrollY > 700);
  }

  window.addEventListener('scroll', function () {
    if (!scrollQueued) {
      scrollQueued = true;
      window.requestAnimationFrame(updateScroll);
    }
  }, { passive: true });
  updateScroll();

  /* ---------- Highlight the navigation link for the section in view ---------- */
  var navLinks = document.querySelectorAll('.nav-link');
  if ('IntersectionObserver' in window && navLinks.length) {
    var linkFor = {};
    each('.nav-link', function (link) { linkFor[link.getAttribute('href').slice(1)] = link; });
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        each('.nav-link', function (link) { link.removeAttribute('aria-current'); });
        var active = linkFor[entry.target.id];
        if (active) active.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(linkFor).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) navObserver.observe(section);
    });
  }

  /* ---------- Reveal sections and cards as they scroll into view ---------- */
  each('[data-reveal-stagger]', function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.setAttribute('data-reveal', '');
      child.style.setProperty('--reveal-delay', (i * 90) + 'ms');
    });
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    each('[data-reveal]', function (el) { revealObserver.observe(el); });
  } else {
    each('[data-reveal]', function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Hero typing effect ---------- */
  var typed = document.getElementById('typed-word');
  if (typed && !reduceMotion) {
    var words = typed.getAttribute('data-words').split('|');
    var wordIndex = 0;
    var text = words[0];
    var deleting = true;

    var tick = function () {
      var word = words[wordIndex];
      if (deleting) {
        text = text.slice(0, -1);
        if (!text) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
        }
      } else {
        text = word.slice(0, text.length + 1);
        if (text === word) deleting = true;
      }
      typed.textContent = text;
      var delay = deleting ? 55 : 95;
      if (!deleting && !text) delay = 300;
      if (deleting && text === words[wordIndex]) delay = 1800;
      window.setTimeout(tick, delay);
    };
    window.setTimeout(tick, 2200);
  }

  /* ---------- Project filters ---------- */
  var filterButtons = document.querySelectorAll('[data-filter]');
  var projectCards = document.querySelectorAll('[data-tags]');
  var filterStatus = document.getElementById('filter-status');

  function tagsOf(card) {
    return card.getAttribute('data-tags').split(' ');
  }

  function applyFilter(tag) {
    var shown = 0;
    each('[data-tags]', function (card) {
      var match = tag === 'all' || tagsOf(card).indexOf(tag) !== -1;
      card.hidden = !match;
      if (match) {
        shown += 1;
        card.classList.add('is-visible');
      }
    });
    each('[data-filter-group]', function (group) {
      group.hidden = !group.querySelector('[data-tags]:not([hidden])');
    });
    each('[data-filter]', function (button) {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-filter') === tag));
    });
    if (filterStatus) filterStatus.textContent = 'Showing ' + shown + (shown === 1 ? ' project' : ' projects');
  }

  if (filterButtons.length) {
    each('[data-filter]', function (button) {
      var tag = button.getAttribute('data-filter');
      var count = tag === 'all' ? projectCards.length : Array.prototype.filter.call(projectCards, function (card) {
        return tagsOf(card).indexOf(tag) !== -1;
      }).length;
      var badge = document.createElement('span');
      badge.className = 'ml-0.5 text-xs opacity-70';
      badge.textContent = count;
      button.appendChild(document.createTextNode(' '));
      button.appendChild(badge);
      button.addEventListener('click', function () { applyFilter(tag); });
    });
  }

  /* ---------- CO2 chart: animated bars and a Top 5 / Top 10 toggle ---------- */
  var co2Chart = document.getElementById('co2-chart');
  if (co2Chart) {
    var bars = co2Chart.querySelectorAll('[data-bar]');
    var co2Title = document.getElementById('co2-chart-title');
    var growBars = function () {
      Array.prototype.forEach.call(bars, function (bar) { bar.style.width = bar.getAttribute('data-bar') + '%'; });
    };

    if (!reduceMotion && 'IntersectionObserver' in window) {
      Array.prototype.forEach.call(bars, function (bar) { bar.style.width = '0%'; });
      var chartObserver = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        window.setTimeout(growBars, 150);
        chartObserver.disconnect();
      }, { threshold: 0.4 });
      chartObserver.observe(co2Chart);
    }

    each('[data-co2-view]', function (button) {
      button.addEventListener('click', function () {
        var showAll = button.getAttribute('data-co2-view') === '10';
        each('[data-co2-extra]', function (row) {
          row.hidden = !showAll;
          var bar = row.querySelector('[data-bar]');
          if (showAll && !reduceMotion) {
            bar.style.width = '0%';
            window.requestAnimationFrame(function () {
              window.requestAnimationFrame(function () { bar.style.width = bar.getAttribute('data-bar') + '%'; });
            });
          }
        }, co2Chart);
        each('[data-co2-view]', function (b) { b.setAttribute('aria-pressed', String(b === button)); });
        if (co2Title) co2Title.textContent = 'Top ' + (showAll ? '10' : '5') + ' CO₂ emitters, 2022';
      });
    });
  }

  /* ---------- Interactive least-squares regression playground ---------- */
  var svg = document.getElementById('playground');
  if (svg) initPlayground(svg);

  function initPlayground(plot) {
    var NS = 'http://www.w3.org/2000/svg';
    var W = 640, H = 380;
    var M = { top: 16, right: 16, bottom: 44, left: 44 };
    var MAX = 10;
    var MAX_POINTS = 80;
    var px = function (x) { return M.left + (x / MAX) * (W - M.left - M.right); };
    var py = function (y) { return H - M.bottom - (y / MAX) * (H - M.top - M.bottom); };
    var round = function (v) { return Math.round(v * 10) / 10; };

    // Seeded pseudo-random generator so the starting data is the same for every visitor.
    var seed = 42;
    var random = function () {
      seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    var normal = function () {
      return Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());
    };
    var clamp = function (v) { return Math.min(MAX - 0.2, Math.max(0.2, v)); };
    var samplePoint = function () {
      var x = 0.5 + random() * 9;
      return { x: round(x), y: round(clamp(1.5 + 0.65 * x + normal() * 1.1)) };
    };
    var initialPoints = function () {
      seed = 42;
      var pts = [];
      for (var i = 0; i < 14; i += 1) pts.push(samplePoint());
      return pts;
    };

    var points = initialPoints();
    var history = [];
    var residualLayer, fitLine, pointLayer;

    function el(name, attrs, parent) {
      var node = document.createElementNS(NS, name);
      Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
      if (parent) parent.appendChild(node);
      return node;
    }

    // Draw the frame at the plot's real width so text stays legible on phones.
    function layout() {
      var width = Math.round(plot.getBoundingClientRect().width) || 640;
      W = Math.max(300, Math.min(640, width));
      H = Math.round(W * (W < 480 ? 0.8 : 0.6));
      plot.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      while (plot.firstChild) plot.removeChild(plot.firstChild);

      var defs = el('defs', {}, plot);
      var clip = el('clipPath', { id: 'pg-clip' }, defs);
      el('rect', { x: M.left, y: M.top, width: W - M.left - M.right, height: H - M.top - M.bottom }, clip);
      var area = el('rect', {
        x: M.left, y: M.top, width: W - M.left - M.right, height: H - M.top - M.bottom,
        fill: 'transparent', 'class': 'cursor-crosshair'
      }, plot);
      area.addEventListener('click', onAreaClick);

      var grid = el('g', { 'aria-hidden': 'true', 'pointer-events': 'none' }, plot);
      for (var t = 0; t <= MAX; t += 2) {
        el('line', { x1: px(t), x2: px(t), y1: M.top, y2: H - M.bottom, stroke: '#374151', 'stroke-width': 1 }, grid);
        el('line', { x1: M.left, x2: W - M.right, y1: py(t), y2: py(t), stroke: '#374151', 'stroke-width': 1 }, grid);
        el('text', { x: px(t), y: H - M.bottom + 18, 'text-anchor': 'middle', fill: '#9ca3af', 'font-size': 12 }, grid).textContent = t;
        el('text', { x: M.left - 10, y: py(t) + 4, 'text-anchor': 'end', fill: '#9ca3af', 'font-size': 12 }, grid).textContent = t;
      }
      el('text', { x: (M.left + W - M.right) / 2, y: H - 6, 'text-anchor': 'middle', fill: '#d1d5db', 'font-size': 13 }, grid).textContent = 'x';
      el('text', { x: 12, y: (M.top + H - M.bottom) / 2, 'text-anchor': 'middle', fill: '#d1d5db', 'font-size': 13 }, grid).textContent = 'y';

      residualLayer = el('g', { 'clip-path': 'url(#pg-clip)', 'aria-hidden': 'true', 'pointer-events': 'none' }, plot);
      fitLine = el('line', { stroke: '#a78bfa', 'stroke-width': 2, 'stroke-linecap': 'round', 'clip-path': 'url(#pg-clip)', 'pointer-events': 'none' }, plot);
      pointLayer = el('g', {}, plot);
      render();
    }

    var stats = {
      n: document.getElementById('pg-n'),
      slope: document.getElementById('pg-slope'),
      intercept: document.getElementById('pg-intercept'),
      r: document.getElementById('pg-r'),
      r2: document.getElementById('pg-r2'),
      equation: document.getElementById('pg-equation')
    };
    var residualToggle = document.getElementById('pg-residuals');
    var undoButton = document.getElementById('pg-undo');

    function fit(pts) {
      var n = pts.length;
      if (n < 2) return null;
      var mx = 0, my = 0;
      pts.forEach(function (p) { mx += p.x; my += p.y; });
      mx /= n; my /= n;
      var sxx = 0, syy = 0, sxy = 0;
      pts.forEach(function (p) {
        sxx += (p.x - mx) * (p.x - mx);
        syy += (p.y - my) * (p.y - my);
        sxy += (p.x - mx) * (p.y - my);
      });
      if (sxx === 0) return null;
      var slope = sxy / sxx;
      var r = syy === 0 ? 0 : sxy / Math.sqrt(sxx * syy);
      return { slope: slope, intercept: my - slope * mx, r: r };
    }

    function format(v) {
      return (v < 0 ? '−' : '') + Math.abs(v).toFixed(2);
    }

    function render() {
      while (pointLayer.firstChild) pointLayer.removeChild(pointLayer.firstChild);
      while (residualLayer.firstChild) residualLayer.removeChild(residualLayer.firstChild);
      var model = fit(points);

      points.forEach(function (p, i) {
        var dot = el('circle', {
          cx: px(p.x), cy: py(p.y), r: 6, fill: '#3b82f6', stroke: '#111827', 'stroke-width': 2, 'class': 'pg-point'
        }, pointLayer);
        el('title', {}, dot).textContent = '(' + p.x.toFixed(1) + ', ' + p.y.toFixed(1) + ') — click to remove';
        dot.addEventListener('click', function (e) {
          e.stopPropagation();
          history.push(points.slice());
          points.splice(i, 1);
          render();
        });
      });

      if (model) {
        fitLine.setAttribute('x1', px(0));
        fitLine.setAttribute('x2', px(MAX));
        fitLine.setAttribute('y1', py(model.intercept));
        fitLine.setAttribute('y2', py(model.intercept + model.slope * MAX));
        fitLine.style.display = '';
        if (residualToggle && residualToggle.checked) {
          points.forEach(function (p) {
            el('line', {
              x1: px(p.x), x2: px(p.x), y1: py(p.y), y2: py(model.intercept + model.slope * p.x),
              stroke: '#9ca3af', 'stroke-width': 1, opacity: 0.7
            }, residualLayer);
          });
        }
        stats.slope.textContent = format(model.slope);
        stats.intercept.textContent = format(model.intercept);
        stats.r.textContent = format(model.r);
        stats.r2.textContent = (model.r * model.r).toFixed(2);
        stats.equation.textContent = 'ŷ = ' + model.intercept.toFixed(2) + (model.slope < 0 ? ' − ' : ' + ') + Math.abs(model.slope).toFixed(2) + 'x';
      } else {
        fitLine.style.display = 'none';
        ['slope', 'intercept', 'r', 'r2'].forEach(function (k) { stats[k].textContent = '—'; });
        stats.equation.textContent = 'Add at least two points with different x values.';
      }
      stats.n.textContent = points.length;
      if (undoButton) undoButton.disabled = !history.length;
    }

    function addPoint(p) {
      if (points.length >= MAX_POINTS) return;
      history.push(points.slice());
      points.push(p);
      render();
    }

    function onAreaClick(e) {
      var ctm = plot.getScreenCTM();
      if (!ctm) return;
      var pt = plot.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      var local = pt.matrixTransform(ctm.inverse());
      var x = ((local.x - M.left) / (W - M.left - M.right)) * MAX;
      var y = ((H - M.bottom - local.y) / (H - M.top - M.bottom)) * MAX;
      addPoint({ x: round(x), y: round(y) });
    }

    document.getElementById('pg-add').addEventListener('click', function () { addPoint(samplePoint()); });
    document.getElementById('pg-reset').addEventListener('click', function () {
      history.push(points.slice());
      points = initialPoints();
      render();
    });
    document.getElementById('pg-clear').addEventListener('click', function () {
      history.push(points.slice());
      points = [];
      render();
    });
    if (undoButton) {
      undoButton.addEventListener('click', function () {
        if (history.length) points = history.pop();
        render();
      });
    }
    if (residualToggle) residualToggle.addEventListener('change', render);

    layout();
    if ('ResizeObserver' in window) {
      var lastWidth = W;
      new ResizeObserver(function () {
        var width = Math.max(300, Math.min(640, Math.round(plot.getBoundingClientRect().width)));
        if (width !== lastWidth) {
          lastWidth = width;
          layout();
        }
      }).observe(plot);
    }
  }

  /* ---------- Lightbox for chart images ---------- */
  var lightbox = document.getElementById('lightbox');
  if (lightbox && typeof lightbox.showModal === 'function') {
    var lightboxImg = document.createElement('img');
    lightboxImg.className = 'h-auto max-h-[80vh] w-full bg-white object-contain';
    lightbox.appendChild(lightboxImg);
    var lightboxCaption = lightbox.querySelector('[data-lightbox-caption]');
    var lightboxOpen = lightbox.querySelector('[data-lightbox-open]');

    each('a[data-lightbox]', function (link) {
      link.addEventListener('click', function (e) {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        var caption = link.getAttribute('data-lightbox');
        lightboxImg.src = link.href;
        lightboxImg.alt = caption;
        lightboxCaption.textContent = caption;
        lightboxOpen.href = link.href;
        lightbox.showModal();
      });
    });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) lightbox.close();
    });
    lightbox.querySelector('[data-lightbox-close]').addEventListener('click', function () { lightbox.close(); });
  }

  /* ---------- Copy email address ---------- */
  each('[data-copy]', function (button) {
    if (!navigator.clipboard) return;
    button.hidden = false;
    var label = button.querySelector('[data-copy-label]');
    var original = label.textContent;
    button.addEventListener('click', function () {
      navigator.clipboard.writeText(button.getAttribute('data-copy')).then(function () {
        label.textContent = 'Copied!';
        window.setTimeout(function () { label.textContent = original; }, 2000);
      }, function () {
        label.textContent = 'Copy failed';
        window.setTimeout(function () { label.textContent = original; }, 2000);
      });
    });
  });

  /* ---------- Cursor spotlight on cards (mouse and trackpad only) ---------- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    each('.spotlight', function (card) {
      card.addEventListener('pointermove', function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
      });
    });
  }
})();
