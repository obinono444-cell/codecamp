/* CodeCamp — pluie Matrix (mode hacker) */
window.CodeCampMatrix = (function () {
  "use strict";
  var GLYPHS = "\u30a2\u30a4\u30a6\u30a8\u30aa\u30ab\u30ad\u30af\u30b1\u30b3\u30b5\u30b7\u30b9\u30bb\u30bd\u30bf\u30c1\u30c4\u30c6\u30c8\u30ca\u30cb\u30cc\u30cd\u30ce0123456789<>{}[]/$#=+*";
  var canvas, ctx, cols, drops, timer, running = false, mode = "off", heroEl = null;
  var reduced = false;
  try { reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

  function ensureCanvas() {
    if (canvas) return canvas;
    canvas = document.createElement("canvas");
    canvas.id = "matrix-canvas";
    canvas.setAttribute("aria-hidden", "true");
    ctx = canvas.getContext("2d");
    document.body.prepend(canvas);
    return canvas;
  }

  function size() {
    if (!canvas || !ctx) return;
    var w, h;
    if (mode === "hero" && heroEl) {
      w = heroEl.offsetWidth; h = heroEl.offsetHeight;
    } else {
      w = window.innerWidth; h = window.innerHeight;
    }
    canvas.width = Math.max(300, w);
    canvas.height = Math.max(200, h);
    cols = Math.floor(canvas.width / 16);
    drops = [];
    for (var i = 0; i < cols; i++) drops[i] = Math.floor(Math.random() * -(canvas.height / 16));
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function draw() {
    if (!ctx) return;
    ctx.fillStyle = "rgba(13, 17, 23, 0.14)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "15px monospace";
    for (var i = 0; i < cols; i++) {
      var ch = GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
      var y = drops[i] * 16;
      ctx.fillStyle = Math.random() > 0.975 ? "#d8ffe2" : "#12b83c";
      ctx.fillText(ch, i * 16, y);
      if (y > canvas.height && Math.random() > 0.976) drops[i] = 0;
      drops[i]++;
    }
  }

  function start() {
    if (running || reduced || !canvas) return;
    running = true;
    timer = setInterval(draw, 55);
  }

  function stop() {
    running = false;
    if (timer) { clearInterval(timer); timer = null; }
  }

  function place() {
    ensureCanvas();
    canvas.className = "matrix-" + mode;
    if (mode === "hero" && heroEl && heroEl.parentNode) {
      heroEl.prepend(canvas);
    }
    canvas.style.display = mode === "off" ? "none" : "block";
    if (mode !== "off" && ctx) { size(); start(); } else { stop(); }
  }

  function onRoute(page) {
    page = page || "home";
    if (mode === "hero" && page !== "home") { mode = "off"; place(); }
    else if (mode === "off" && page === "home" && !canvas) { place(); }
  }

  function heroHome(el) {
    heroEl = el || null;
    if (!heroEl) return;
    if (mode === "off") { mode = "hero"; place(); }
    else if (mode === "hero") { place(); }
  }

  function isHacker() { return mode === "full"; }

  function toggleHacker() {
    mode = (mode === "full") ? "off" : "full";
    place();
    try {
      var ui = JSON.parse(localStorage.getItem("codelearn-ui-v1") || "{}");
      ui.hacker = mode === "full";
      localStorage.setItem("codelearn-ui-v1", JSON.stringify(ui));
    } catch (e) {}
    return mode === "full";
  }

  function burst(ms) {
    if (reduced) return;
    var prev = mode;
    mode = "full";
    place();
    setTimeout(function () { mode = prev === "full" ? "off" : prev; place(); }, ms || 5000);
  }

  window.addEventListener("resize", function () { if (running) size(); });
  document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else if (mode !== "off" && !reduced) start(); });

  function wireButton() {
    var b = document.getElementById("btn-hacker");
    if (!b) return;
    b.addEventListener("click", function () {
      var on = toggleHacker();
      b.classList.toggle("active", on);
    });
  }

  try {
    var saved = JSON.parse(localStorage.getItem("codelearn-ui-v1") || "{}");
    if (saved.hacker && !reduced) { mode = "full"; place(); }
  } catch (e) {}
  wireButton();

  return {
    onRoute: onRoute,
    heroHome: heroHome,
    toggleHacker: toggleHacker,
    isHacker: isHacker,
    burst: burst
  };
})();
