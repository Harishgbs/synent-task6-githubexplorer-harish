(function () {
  'use strict';

  // ============================================================
  // Config
  // ============================================================
  var CONFIG = {
    dotSize: 2,
    spacing: 28,
    radius: 150,
    maxTranslate: 15,
    maxScale: 1.8,
    baseOpacity: 0.35,
    springStiffness: 0.035,
    springDamping: 0.88,
    color: '124, 77, 245'
  };

  var canvas = document.getElementById('dot-canvas');
  if (!canvas) return;

  // ============================================================
  // State
  // ============================================================
  var dots = [];
  var mouse = { x: -9999, y: -9999, active: false };
  var rafId = null;
  var bounds = { w: 0, h: 0 };

  // ============================================================
  // Generate dots
  // ============================================================
  function build() {
    var rect = canvas.getBoundingClientRect();
    bounds.w = rect.width;
    bounds.h = rect.height;

    var cols = Math.ceil(bounds.w / CONFIG.spacing);
    var rows = Math.ceil(bounds.h / CONFIG.spacing);
    var total = cols * rows;

    // Clear old
    dots.forEach(function (d) { d.el.remove(); });
    dots = [];
    canvas.innerHTML = '';

    var frag = document.createDocumentFragment();

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var x = c * CONFIG.spacing + CONFIG.spacing / 2;
        var y = r * CONFIG.spacing + CONFIG.spacing / 2;

        var el = document.createElement('div');
        el.className = 'dot-particle';
        el.style.cssText = [
          'position:absolute',
          'width:' + CONFIG.dotSize + 'px',
          'height:' + CONFIG.dotSize + 'px',
          'border-radius:50%',
          'background:rgba(' + CONFIG.color + ',' + CONFIG.baseOpacity + ')',
          'box-shadow:0 0 4px rgba(' + CONFIG.color + ',0.25)',
          'left:' + x + 'px',
          'top:' + y + 'px',
          'transform:translate3d(0,0,0) scale(1)',
          'will-change:transform',
          'pointer-events:none'
        ].join(';');

        frag.appendChild(el);

        dots.push({
          el: el,
          ox: x,
          oy: y,
          x: 0,
          y: 0,
          scale: 1,
          vx: 0,
          vy: 0
        });
      }
    }

    canvas.appendChild(frag);
  }

  // ============================================================
  // Animation loop
  // ============================================================
  function animate() {
    var m = mouse;
    var cfg = CONFIG;
    var len = dots.length;

    for (var i = 0; i < len; i++) {
      var d = dots[i];
      var dx = d.ox + d.x - m.x;
      var dy = d.oy + d.y - m.y;
      var dist = Math.sqrt(dx * dx + dy * dy);

      var tx = 0, ty = 0, ts = 1;

      if (m.active && dist < cfg.radius) {
        var strength = 1 - dist / cfg.radius;
        var eased = strength * strength;
        var t = eased * cfg.maxTranslate;
        var angle = Math.atan2(dy, dx);
        tx = -Math.cos(angle) * t;
        ty = -Math.sin(angle) * t;
        ts = 1 + eased * (cfg.maxScale - 1);
      }

      // spring toward target
      var fx = (tx - d.x) * cfg.springStiffness;
      var fy = (ty - d.y) * cfg.springStiffness;
      d.vx = (d.vx + fx) * cfg.springDamping;
      d.vy = (d.vy + fy) * cfg.springDamping;
      d.x += d.vx;
      d.y += d.vy;
      d.scale += (ts - d.scale) * 0.12;

      // opacity & glow
      var opacity = ts > 1
        ? cfg.baseOpacity + (ts - 1) * 0.65
        : cfg.baseOpacity;
      var glow = ts > 1
        ? '0 0 ' + (4 + (ts - 1) * 14) + 'px rgba(' + cfg.color + ',' + (0.25 + (ts - 1) * 0.55) + ')'
        : '0 0 4px rgba(' + cfg.color + ',0.25)';

      d.el.style.transform = 'translate3d(' + d.x.toFixed(1) + 'px,' + d.y.toFixed(1) + 'px,0) scale(' + d.scale.toFixed(3) + ')';
      d.el.style.opacity = opacity.toFixed(3);
      d.el.style.boxShadow = glow;
    }

    rafId = requestAnimationFrame(animate);
  }

  // ============================================================
  // Events
  // ============================================================
  function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }

  function onMouseLeave() {
    mouse.active = false;
  }

  function onTouchMove(e) {
    var touch = e.touches[0];
    mouse.x = touch.clientX;
    mouse.y = touch.clientY;
    mouse.active = true;
  }

  function onTouchEnd() {
    mouse.active = false;
  }

  function onResize() {
    build();
  }

  // ============================================================
  // Init
  // ============================================================
  function init() {
    build();
    animate();

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);
    window.addEventListener('resize', onResize);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
