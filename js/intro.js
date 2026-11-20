/* CodeCamp — intro "boot hacker" à l'arrivée sur le site */
window.CodeCampIntro = (function () {
  "use strict";

  var LINES = [
    "CodeCamp Boot v1.0 — initialisation…",
    "> chargement des cours………… OK ✅",
    "> préparation de l'éditeur…… OK ✅",
    "> réveil de CodeBot 🤖………… OK ✅",
    "> calibration de la matrice…… OK ✅",
    "ACCÈS AUTORISÉ — bienvenue à bord 🚀"
  ];

  var reduced = false;
  try { reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

  function build() {
    var el = document.createElement("div");
    el.id = "boot-screen";
    el.innerHTML =
      '<div class="boot-card">' +
      '<div class="boot-logo">&lt;/&gt;</div>' +
      '<h1>CodeCamp</h1>' +
      '<p class="boot-tag">apprendre à coder · mode hacker activé</p>' +
      '<div class="boot-lines" id="boot-lines" aria-hidden="true"></div>' +
      '<p class="boot-skip">clique pour entrer</p>' +
      '</div>';
    document.body.appendChild(el);
    return el;
  }

  function play() {
    var seen = null;
    try { seen = sessionStorage.getItem("codecamp-intro-v1"); } catch (e) {}
    if (seen || reduced) return;

    var el = build();
    var linesEl = el.querySelector("#boot-lines");
    var done = false;

    function kill() {
      if (done) return;
      done = true;
      el.classList.add("out");
      setTimeout(function () { if (el.parentNode) el.remove(); }, 650);
      el.removeEventListener("click", kill);
      try { sessionStorage.setItem("codecamp-intro-v1", "1"); } catch (e) {}
    }

    el.addEventListener("click", kill);

    var i = 0;
    var iv = setInterval(function () {
      if (done) { clearInterval(iv); return; }
      var line = document.createElement("div");
      line.textContent = LINES[i];
      line.className = "boot-line" + (i === LINES.length - 1 ? " final" : "");
      linesEl.appendChild(line);
      i++;
      if (i >= LINES.length) {
        clearInterval(iv);
        setTimeout(kill, 900);
      }
    }, 260);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", play);
  } else {
    play();
  }

  return { play: play };
})();
