/* CodeCamp — Mini-jeux : Serpent du Code, Mémoire du Dev, Vitesse de frappe, Simon */
window.CodeCampGames = (function () {
  "use strict";

  var BEST_SNAKE = "codecamp-snake-best-v1";
  var BEST_MEM = "codecamp-memory-best-v1";
  var BEST_TYPE = "codecamp-type-best-v1";
  var BEST_SIMON = "codecamp-simon-best-v1";

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function setActiveNav(name) {
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      a.classList.toggle("active", a.dataset.nav === name);
    });
  }

  function getBest(key) {
    try { return Number(JSON.parse(localStorage.getItem(key) || "0")) || 0; } catch (e) { return 0; }
  }

  function saveBestIf(key, score, lowerBetter) {
    var b = getBest(key);
    if ((lowerBetter && (b === 0 || score < b)) || (!lowerBetter && score > b)) {
      try { localStorage.setItem(key, JSON.stringify(score)); } catch (e) {}
      return true;
    }
    return false;
  }

  function addXp(amount) {
    if (amount <= 0) return;
    try {
      var st = JSON.parse(localStorage.getItem("codelearn-stats-v1") || "{}");
      st.xp = (st.xp || 0) + amount;
      localStorage.setItem("codelearn-stats-v1", JSON.stringify(st));
    } catch (e) {}
    window.dispatchEvent(new Event("codecamp-xp"));
  }

  function arena() { return document.getElementById("games-arena"); }

  /* ================= SERPENT ================= */
  var snakeTimer = null;
  function snake() {
    stopGames();
    var el = arena();
    el.innerHTML =
      '<div class="game-card">' +
      '<div class="game-head"><h3>🐍 Serpent du Code</h3><span class="game-best">🏆 ' + getBest(BEST_SNAKE) + '</span></div>' +
      '<p class="game-sub">Mange les bugs 🐛 sans te mordre ni toucher les murs. Flèches ⬅️⬆️➡️⬇️ ou boutons.</p>' +
      '<canvas id="snake-canvas" width="360" height="360"></canvas>' +
      '<div class="game-hud"><span class="game-score" id="snake-score">0 pt</span>' +
      '<span class="game-lives" id="snake-estado"></span></div>' +
      '<div class="dpad">' +
      '<span></span><button class="dp" data-dy="-1">⬆️</button><span></span>' +
      '<button class="dp" data-dx="-1">⬅️</button><button class="dp" data-dy="1">⬇️</button><button class="dp" data-dx="1">➡️</button>' +
      '</div>' +
      '<button class="btn btn-primary" id="snake-again1">▶️ Lancer</button>' +
      '</div>';
    el.querySelector("#snake-again1").addEventListener("click", function () { snakeRun(); });
    el.querySelectorAll(".dp").forEach(function (b) {
      b.addEventListener("click", function () {
        var dx = Number(b.dataset.dx || 0), dy = Number(b.dataset.dy || 0);
        if (window.__snakeDir && !(dx === -window.__snakeDir.x && dy === -window.__snakeDir.y)) window.__snakeNext = { x: dx, y: dy };
      });
    });
    var ctx = el.querySelector("#snake-canvas").getContext("2d");
    drawIdle(ctx, "Appuie sur Lancer ▶️");
  }

  function drawIdle(ctx, msg) {
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, 360, 360);
    ctx.fillStyle = "#9cc0ff";
    ctx.font = "18px monospace";
    ctx.textAlign = "center";
    ctx.fillText(msg, 180, 180);
  }

  function snakeRun() {
    var el = arena();
    var canvas = el.querySelector("#snake-canvas");
    var ctx = canvas.getContext("2d");
    var CELL = 24, N = 15;
    var sq = [{ x: 7, y: 7 }, { x: 6, y: 7 }];
    window.__snakeDir = { x: 1, y: 0 };
    window.__snakeNext = { x: 1, y: 0 };
    var food = spawnFood();
    var score = 0, ms = 140, dead = false;

    function spawnFood() {
      var p;
      do {
        p = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) };
      } while (sq.some(function (s) { return s.x === p.x && s.y === p.y; }));
      return p;
    }

    function draw() {
      ctx.fillStyle = "#0d1117";
      ctx.fillRect(0, 0, 360, 360);
      ctx.fillStyle = "rgba(79,140,255,0.06)";
      for (var i = 0; i <= N; i++) {
        ctx.fillRect(i * CELL, 0, 1, 360);
        ctx.fillRect(0, i * CELL, 360, 1);
      }
      ctx.font = CELL - 4 + "px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🐛", food.x * CELL + CELL / 2, food.y * CELL + CELL / 2);
      sq.forEach(function (s, i) {
        ctx.fillStyle = i === 0 ? "#4f8cff" : "rgba(157, 92, 255, " + (0.9 - i / sq.length * 0.6) + ")";
        ctx.beginPath();
        ctx.roundRect(s.x * CELL + 2, s.y * CELL + 2, CELL - 4, CELL - 4, 6);
        ctx.fill();
      });
      el.querySelector("#snake-score").textContent = score + " pt" + (score > 1 ? "s" : "");
    }

    function tick() {
      if (!document.getElementById("snake-canvas")) { clearInterval(snakeTimer); snakeTimer = null; return; }
      if (window.__snakeNext) { window.__snakeDir = window.__snakeNext; window.__snakeNext = null; }
      var d = window.__snakeDir;
      var head = { x: sq[0].x + d.x, y: sq[0].y + d.y };
      if (head.x < 0 || head.y < 0 || head.x >= N || head.y >= N || sq.some(function (s) { return s.x === head.x && s.y === head.y; })) {
        return gameOver();
      }
      sq.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score += 1;
        food = spawnFood();
        if (ms > 60) { ms -= 4; clearInterval(snakeTimer); snakeTimer = setInterval(tick, ms); }
      } else {
        sq.pop();
      }
      draw();
    }

    function gameOver() {
      dead = true;
      clearInterval(snakeTimer);
      snakeTimer = null;
      var isBest = saveBestIf(BEST_SNAKE, score);
      addXp(score);
      window.CodeCampAchieve && window.CodeCampAchieve.mark("__game");
      if (score >= 10) window.CodeCampAchieve && window.CodeCampAchieve.mark("__snake10");
      draw();
      ctx.fillStyle = "rgba(4,8,16,0.82)";
      ctx.fillRect(0, 0, 360, 360);
      ctx.fillStyle = dead ? "#ff7043" : "#9cc0ff";
      ctx.font = "bold 22px monospace";
      ctx.fillText("💀 Fini : " + score + " pts", 180, 160);
      ctx.font = "14px monospace";
      ctx.fillStyle = "#ffd88a";
      ctx.fillText(isBest && score > 0 ? "🎉 Nouveau record !" : "Record : " + getBest(BEST_SNAKE), 180, 190);
      ctx.fillStyle = "#9cc0ff";
      ctx.fillText("+" + score + " XP gagné" + (score > 1 ? "s" : ""), 180, 214);
      el.querySelector("#snake-again1").textContent = "🔁 Rejouer";
    }

    clearInterval(snakeTimer);
    snakeTimer = setInterval(tick, ms);
    draw();
    el.querySelector("#snake-again1").textContent = "▶️ Relancer";
  }

  document.addEventListener("keydown", function (e) {
    var canvas = document.getElementById("snake-canvas");
    if (!canvas || e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    var map = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 } };
    var d = map[e.key];
    if (!d) return;
    e.preventDefault();
    if (window.__snakeDir && !(d.x === -window.__snakeDir.x && d.y === -window.__snakeDir.y)) window.__snakeNext = d;
  });

  function stopGames() {
    if (snakeTimer) { clearInterval(snakeTimer); snakeTimer = null; }
    window.__snakeDir = null;
    window.__snakeNext = null;
  }

  /* ================= MÉMOIRE ================= */
  var MEM_SYMBOLS = ["{", "}", "<", ">", ";", "=", "(", ")", "[]", "&&", "==", "=>"];

  function memoire() {
    stopGames();
    var el = arena();
    var picks = MEM_SYMBOLS.slice();
    for (var i = picks.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = picks[i]; picks[i] = picks[j]; picks[j] = t;
    }
    picks = picks.slice(0, 8);
    var cards = picks.concat(picks);
    for (var k = cards.length - 1; k > 0; k--) {
      var m = Math.floor(Math.random() * (k + 1));
      var tt = cards[k]; cards[k] = cards[m]; cards[m] = tt;
    }
    var moves = 0, found = 0, first = null, lock = false;
    el.innerHTML =
      '<div class="game-card">' +
      '<div class="game-head"><h3>🧩 Mémoire du Dev</h3><span class="game-best">🏆 ' + getBest(BEST_MEM) + ' coups</span></div>' +
      '<p class="game-sub">Retrouve les paires de symboles de code. Le moins de coups possible !</p>' +
      '<div class="mem-grid" id="mem-grid"></div>' +
      '<div class="game-hud"><span class="game-score" id="mem-moves">0 coup</span></div>' +
      '</div>';
    var gridEl = el.querySelector("#mem-grid");
    cards.forEach(function (sym, i) {
      var c = document.createElement("button");
      c.className = "mem-card";
      c.dataset.sym = sym;
      c.innerHTML = '<span class="mem-front">❓</span><span class="mem-back">' + esc(sym) + '</span>';
      c.addEventListener("click", function () { flip(c); });
      gridEl.appendChild(c);
    });

    function flip(card) {
      if (lock || card.classList.contains("on") || card.classList.contains("win")) return;
      card.classList.add("on");
      if (!first) { first = card; return; }
      moves++;
      el.querySelector("#mem-moves").textContent = moves + " coup" + (moves > 1 ? "s" : "");
      if (first.dataset.sym === card.dataset.sym) {
        first.classList.add("win");
        card.classList.add("win");
        first = null;
        found++;
        if (found === 8) {
          var isBest = saveBestIf(BEST_MEM, moves, true);
          addXp(Math.max(5, 40 - moves));
          window.CodeCampAchieve && window.CodeCampAchieve.mark("__game");
          window.CodeCampUI && window.CodeCampUI.spawnConfetti && window.CodeCampUI.spawnConfetti();
          setTimeout(function () {
            var sub = el.querySelector(".game-sub");
            sub.innerHTML = (isBest ? "🎉 <strong>Nouveau record !</strong> " : "") + "Gagné en " + moves + " coups · <strong>+" + Math.max(5, 40 - moves) + " XP</strong> ⚡";
          }, 350);
        }
      } else {
        lock = true;
        var a = first, b = card;
        first = null;
        setTimeout(function () {
          a.classList.remove("on");
          b.classList.remove("on");
          lock = false;
        }, 650);
      }
    }
  }

  /* ================= VITESSE DE FRAPPE ================= */
  var SNIPPETS = [
    'console.log("Bonjour");',
    'const xp = 20;',
    'for (let i = 0; i < 3; i++) {}',
    'if (age >= 18) { console.log("OK"); }',
    'let fruits = ["kiwi", "mangue"];',
    'function double(n) { return n * 2; }',
    '.hero { display: flex; }',
    '<button class="go">GO</button>',
    'document.querySelector("h1");',
    'const jeu = { titre: "CodeCamp" };'
  ];

  function frappe() {
    stopGames();
    var el = arena();
    var rounds = [], i = 0, results = [];
    var pool = SNIPPETS.slice();
    for (var k = pool.length - 1; k > 0; k--) {
      var m = Math.floor(Math.random() * (k + 1));
      var t = pool[k]; pool[k] = pool[m]; pool[m] = t;
    }
    rounds = pool.slice(0, 5);
    el.innerHTML =
      '<div class="game-card">' +
      '<div class="game-head"><h3>⚡ Vitesse de frappe</h3><span class="game-best">🏆 ' + (getBest(BEST_TYPE) ? getBest(BEST_TYPE) + " s" : "—") + '</span></div>' +
      '<p class="game-sub">Tape exactement le code affiché, le plus vite possible. 5 lignes à défoncer 💪</p>' +
      '<div class="type-round" id="type-round"></div>' +
      '<div class="game-hud"><span class="game-score" id="type-info">—</span></div>' +
      '</div>';
    showRound();

    function showRound() {
      var box = el.querySelector("#type-round");
      var code = rounds[i];
      var chars = code.split("").map(function (ch, ci) {
        return '<span class="tch' + (ch === " " ? " tsp" : "") + '" data-ci="' + ci + '">' + esc(ch) + '</span>';
      }).join("");
      box.innerHTML = '<div class="type-target mono">' + chars + '</div>' +
        '<input id="type-input" class="type-input mono" spellcheck="false" autocomplete="off" placeholder="Tape le code ici puis Entrée ↵">';
      var inp = box.querySelector("#type-input");
      el.querySelector("#type-info").textContent = "Ligne " + (i + 1) + "/5 · 0 s";
      var t0 = null, iv = setInterval(function () {
        if (!document.getElementById("type-input")) { clearInterval(iv); return; }
        if (!t0) return;
        el.querySelector("#type-info").textContent = "Ligne " + (i + 1) + "/5 · " + ((Date.now() - t0) / 1000).toFixed(1) + " s";
      }, 100);
      inp.addEventListener("input", function () { if (!t0) t0 = Date.now(); colorize(code, inp.value); });
      inp.addEventListener("keydown", function (e) {
        if (e.key !== "Enter") return;
        e.preventDefault();
        if (inp.value !== code) {
          box.classList.add("typeish");
          setTimeout(function () { box.classList.remove("typeish"); }, 350);
          return;
        }
        var dur = (Date.now() - t0) / 1000;
        results.push(dur);
        clearInterval(iv);
        i++;
        if (i >= rounds.length) return end();
        showRound();
      });
      setTimeout(function () { inp.focus(); }, 60);

      function colorize(code, val) {
        box.querySelectorAll(".tch").forEach(function (spn) {
          var ci = Number(spn.dataset.ci);
          spn.classList.toggle("okc", ci < val.length && val[ci] === code[ci]);
          spn.classList.toggle("badc", ci < val.length && val[ci] !== code[ci]);
        });
      }
    }

    function end() {
      var total = results.reduce(function (a, b) { return a + b; }, 0);
      var xp = Math.max(10, Math.round(60 - total * 2));
      var isBest = saveBestIf(BEST_TYPE, Math.round(total * 10) / 10);
      addXp(xp);
      window.CodeCampAchieve && window.CodeCampAchieve.mark("__game");
      window.CodeCampUI && window.CodeCampUI.spawnConfetti && window.CodeCampUI.spawnConfetti();
      el.querySelector("#type-round").innerHTML =
        '<div class="quiz-end-icon">⌨️</div>' +
        '<h2 class="type-end-h">Terminé !</h2>' +
        '<div class="quiz-end-score">' + total.toFixed(1) + ' s</div>' +
        '<p class="game-sub">' + (isBest ? "🎉 Nouveau record ! " : "") + "Récompense : <strong>+" + xp + " XP</strong> ⚡</p>" +
        '<button class="btn btn-primary" id="type-again">🔁 Rejouer</button>';
      el.querySelector("#type-again").addEventListener("click", frappe);
    }
  }

  /* ================= SIMON ================= */
  var simonTimers = [];
  function simon() {
    stopGames();
    clearSimon();
    var el = arena();
    var pads = [
      { c: "#ff5a5f", n: "🔴" }, { c: "#4f8cff", n: "🔵" },
      { c: "#3fd96a", n: "🟢" }, { c: "#e3b341", n: "🟡" }
    ];
    var seq = [], pos = 0, playing = false;
    el.innerHTML =
      '<div class="game-card">' +
      '<div class="game-head"><h3>🎵 Simon du Code</h3><span class="game-best">🏆 ' + getBest(BEST_SIMON) + '</span></div>' +
      '<p class="game-sub">Mémorise la séquence lumineuse et répète-la. Elle grandit à chaque tour !</p>' +
      '<div class="simon-grid">' +
      pads.map(function (p, i) { return '<button class="spad" data-pi="' + i + '" style="--pc:' + p.c + '"><span>' + p.n + '</span></button>'; }).join("") +
      '</div>' +
      '<div class="game-hud"><span class="game-score" id="simon-round">—</span></div>' +
      '<button class="btn btn-primary" id="simon-again">▶️ Lancer</button>' +
      '</div>';
    el.querySelectorAll(".spad").forEach(function (b) {
      b.addEventListener("click", function () {
        if (playing) return;
        if (!seq.length) return;
        flash(Number(b.dataset.pi));
        if (Number(b.dataset.pi) === seq[pos]) {
          pos++;
          if (pos >= seq.length) {
            el.querySelector("#simon-round").textContent = "✅ Tour " + (seq.length) + " réussi !";
            setTimeout(next, 700);
          }
        } else {
          gameOver();
        }
      });
    });
    el.querySelector("#simon-again").addEventListener("click", function () {
      seq = []; pos = 0;
      el.querySelector("#simon-again").textContent = "▶️ Relancer";
      next();
    });

    function flash(i) {
      var b = el.querySelector('.spad[data-pi="' + i + '"]');
      b.classList.add("lit");
      setTimeout(function () { b.classList.remove("lit"); }, 320);
    }

    function next() {
      pos = 0;
      seq.push(Math.floor(Math.random() * 4));
      playing = true;
      el.querySelector("#simon-round").textContent = "Regarde… tour " + seq.length;
      clearSimon();
      seq.forEach(function (p, t) {
        simonTimers.push(setTimeout(function () {
          if (!document.getElementById("simon-round")) return;
          flash(p);
          if (t === seq.length - 1) {
            simonTimers.push(setTimeout(function () {
              playing = false;
              var r = el.querySelector("#simon-round");
              if (r) r.textContent = "À toi ! (tour " + seq.length + ")";
            }, 420));
          }
        }, 500 + t * 550));
      });
    }

    function gameOver() {
      var score = seq.length - 1;
      var isBest = saveBestIf(BEST_SIMON, score);
      addXp(score * 3);
      window.CodeCampAchieve && window.CodeCampAchieve.mark("__game");
      clearSimon();
      playing = true;
      el.querySelector("#simon-round").innerHTML = (isBest && score > 0 ? "🎉 <strong>Nouveau record !</strong> " : "") + "💀 Séquence perdue au tour " + (score + 1) + " · +" + (score * 3) + " XP";
      el.querySelector("#simon-again").textContent = "🔁 Rejouer";
      setTimeout(function () { playing = false; }, 400);
    }
  }

  function clearSimon() {
    simonTimers.forEach(clearTimeout);
    simonTimers = [];
  }

  /* ================= PAGE ================= */
  var GAMES = [
    { id: "snake", icon: "🐍", name: "Serpent du Code", desc: "Mange les bugs, grandis, survis" },
    { id: "memoire", icon: "🧩", name: "Mémoire du Dev", desc: "Les paires de symboles de code" },
    { id: "frappe", icon: "⌨️", name: "Vitesse de frappe", desc: "Tape le code au chrono" },
    { id: "simon", icon: "🎵", name: "Simon du Code", desc: "Mémorise la séquence" }
  ];

  function render() {
    stopGames();
    clearSimon();
    setActiveNav("games");
    var app = document.getElementById("app");
    app.innerHTML =
      '<section class="hero">' +
      '<h1>🎮 Salle d\'arcade</h1>' +
      '<p>Des mini-jeux de code pour progresser en s\'amusant — et gagner de l\'XP ⚡</p>' +
      '</section>' +
      '<div class="quiz-grid">' +
      GAMES.map(function (g, i) {
        return '<button class="quiz-cat" data-g="' + g.id + '" style="animation:fadeUp .4s ease backwards ' + (i * 0.06) + 's">' +
          '<span class="quiz-cat-icon">' + g.icon + '</span>' +
          '<span class="quiz-cat-name">' + g.name + '</span>' +
          '<span class="quiz-cat-n">' + g.desc + '</span>' +
          '</button>';
      }).join("") +
      '</div>' +
      '<div id="games-arena"></div>';
    setActiveNav("games");
    app.querySelectorAll("[data-g]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.dataset.g;
        if (id === "snake") snake();
        if (id === "memoire") memoire();
        if (id === "frappe") frappe();
        if (id === "simon") simon();
        setTimeout(function () {
          var a = arena();
          if (a) a.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 60);
      });
    });
    window.scrollTo(0, 0);
  }

  window.addEventListener("codecamp-route", stopGames);

  return { render: render, stop: stopGames };
})();
