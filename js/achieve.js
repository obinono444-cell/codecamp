/* CodeCamp — Succès : trophées auto-débloqués (leçons, XP, série, quiz, CodeBot, compte) */
window.CodeCampAchieve = (function () {
  "use strict";

  var SHOWN_KEY = "codecamp-ach-shown-v1";
  var DONE_KEY = "codecamp-ach-done-v1";

  var LIST = [
    { id: "first-lesson", icon: "🐣", name: "Premier pas", desc: "Terminer 1 leçon", test: function (s) { return s.done >= 1; } },
    { id: "five-lessons", icon: "📚", name: "Étudiant assidu", desc: "Terminer 5 leçons", test: function (s) { return s.done >= 5; } },
    { id: "ten-lessons", icon: "🎓", name: "Déterminé", desc: "Terminer 10 leçons", test: function (s) { return s.done >= 10; } },
    { id: "xp-100", icon: "⚡", name: "100 XP", desc: "Ramelasser 100 XP", test: function (s) { return s.xp >= 100; } },
    { id: "xp-300", icon: "🚀", name: "300 XP", desc: "Ramelasser 300 XP", test: function (s) { return s.xp >= 300; } },
    { id: "streak-3", icon: "🔥", name: "Sur le feu", desc: "Série de 3 jours d'affilée", test: function (s) { return s.streak >= 3; } },
    { id: "quiz-80", icon: "🧠", name: "Cerveau turbo", desc: "Faire 80 pts ou plus au Quiz Arcade", test: function (s) { return s.quizBest >= 80; } },
    { id: "quiz-any", icon: "🎯", name: "Premier quiz", desc: "Terminer un quiz", test: function (s) { return s.quizPlayed; } },
    { id: "account", icon: "👑", name: "Membre officiel", desc: "Créer un compte visiteur", test: function (s) { return s.account; } },
    { id: "codebot", icon: "🤖", name: "Esprit curieux", desc: "Poser une question à CodeBot", test: function (s) { return s.codebot; } },
    { id: "arcade", icon: "🎮", name: "Joueur", desc: "Jouer à un mini-jeu d'arcade", test: function () { return flags(DONE_KEY, "__game"); } },
    { id: "snake-10", icon: "🐍", name: "Serpent pro", desc: "Faire 10 points au Serpent du Code", test: function () { return flags(DONE_KEY, "__snake10"); } }
  ];

  function loadJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || "null") || fallback; } catch (e) { return fallback; }
  }

  function saveJson(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  function flags(key, id, on) {
    var arr = loadJson(key, []);
    if (on) {
      if (arr.indexOf(id) === -1) { arr.push(id); saveJson(key, arr); return true; }
      return false;
    }
    return arr.indexOf(id) !== -1;
  }

  function snapshot() {
    var xp = 0, streak = 0, doneC = 0, quizBest = 0, quizPlayed = false;
    try {
      var st = JSON.parse(localStorage.getItem("codelearn-stats-v1") || "{}");
      xp = st.xp || 0;
      streak = st.streak || 0;
      doneC = Object.keys(JSON.parse(localStorage.getItem("codelearn-progress-v1") || "{}")).length;
      quizBest = Number(JSON.parse(localStorage.getItem("codecamp-quiz-best-v1") || "0")) || 0;
      quizPlayed = localStorage.getItem("codecamp-quiz-best-v1") != null;
    } catch (e) {}
    var account = false;
    try { account = !!(JSON.parse(localStorage.getItem("codecamp-accounts-v1") || "{}") && Object.keys(JSON.parse(localStorage.getItem("codecamp-accounts-v1") || "{}")).length); } catch (e) {}
    var codebot = flags(DONE_KEY, "__codebot");
    return { done: doneC, xp: xp, streak: streak, quizBest: quizBest, quizPlayed: quizPlayed, account: account, codebot: codebot };
  }

  function toast(msg) {
    var box = document.getElementById("toast-box");
    if (!box) {
      box = document.createElement("div");
      box.id = "toast-box";
      document.body.appendChild(box);
    }
    var t = document.createElement("div");
    t.className = "toast toast-ach";
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(function () { t.classList.add("gone"); }, 4200);
    setTimeout(function () { if (t.parentNode) t.remove(); }, 4700);
  }

  function check() {
    var s = snapshot();
    var gained = [];
    LIST.forEach(function (a) {
      if (!a.test(s)) return;
      if (flags(DONE_KEY, a.id, true)) gained.push(a);
    });
    gained.forEach(function (a, i) {
      setTimeout(function () {
        toast("🏆 Succès débloqué : " + a.icon + " " + a.name);
        window.CodeCampUI && window.CodeCampUI.spawnConfetti && window.CodeCampUI.spawnConfetti(50);
      }, i * 600);
    });
    return gained;
  }

  function grid() {
    var s = snapshot();
    return '<div class="ach-grid">' +
      LIST.map(function (a) {
        var on = flags(DONE_KEY, a.id) || a.test(s);
        return '<span class="ach' + (on ? " on" : "") + '" title="' + a.name + ' — ' + a.desc + '">' +
          '<span class="ach-icon">' + (on ? a.icon : "🔒") + '</span>' +
          '<span class="ach-name">' + a.name + '</span>' +
          '</span>';
      }).join("") +
      '</div>';
  }

  function unlockedCount() {
    var s = snapshot();
    return LIST.filter(function (a) { return flags(DONE_KEY, a.id) || a.test(s); }).length;
  }

  window.addEventListener("codecamp-xp", check);
  window.addEventListener("codecamp-ai-open", function () { flags(DONE_KEY, "__codebot", true); check(); });
  window.addEventListener("codecamp-account", check);
  window.addEventListener("hashchange", check);
  document.addEventListener("DOMContentLoaded", check);

  function mark(flag) {
    flags(DONE_KEY, flag, true);
    check();
  }

  return { grid: grid, check: check, unlockedCount: unlockedCount, total: LIST.length, mark: mark };
})();
