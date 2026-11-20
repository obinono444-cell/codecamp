/* CodeCamp — recherche globale de leçons (touche / pour ouvrir) */
window.CodeCampSearch = (function () {
  "use strict";

  var input, pop, wrap;
  var results = [], sel = -1;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function search(q) {
    q = q.trim().toLowerCase();
    if (typeof COURSES === "undefined") return [];
    var out = [];
    COURSES.forEach(function (c) {
      c.lessons.forEach(function (l, i) {
        var hay = (l.title + " " + c.title + " " + c.id).toLowerCase();
        if (hay.indexOf(q) !== -1) {
          out.push({ h: "#/lesson/" + c.id + "/" + l.id, icon: c.icon, course: c.title, title: l.title, num: i + 1 });
        }
      });
      if (c.title.toLowerCase().indexOf(q) !== -1) {
        out.push({ h: "#/course/" + c.id, icon: c.icon, course: "Cours complet", title: c.title, num: null });
      }
    });
    return out.slice(0, 8);
  }

  function renderPop() {
    if (!results.length) { pop.hidden = true; pop.innerHTML = ""; return; }
    pop.innerHTML = results.map(function (r, i) {
      return '<button class="gs-row' + (i === sel ? " sel" : "") + '" data-i="' + i + '">' +
        '<span class="gs-icon">' + esc(r.icon) + '</span>' +
        '<span class="gs-txt"><strong>' + esc(r.title) + '</strong><em>' + esc(r.course) + (r.num ? " · leçon " + r.num : "") + '</em></span>' +
        '<span class="gs-arrow">→</span>' +
        '</button>';
    }).join("");
    pop.hidden = false;
    pop.querySelectorAll(".gs-row").forEach(function (row) {
      row.addEventListener("click", function () { go(results[+row.dataset.i]); });
    });
  }

  function go(r) {
    if (!r) return;
    location.hash = r.h;
    close();
  }

  function close() {
    pop.hidden = true;
    input.value = "";
    sel = -1;
  }

  function onInput() {
    results = search(input.value);
    sel = results.length ? 0 : -1;
    renderPop();
  }

  function onKey(e) {
    if (pop.hidden) return;
    if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(sel + 1, results.length - 1); renderPop(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(sel - 1, 0); renderPop(); }
    else if (e.key === "Enter") { e.preventDefault(); go(results[sel]); }
    else if (e.key === "Escape") { close(); input.blur(); }
  }

  function onGlobalKey(e) {
    var t = e.target;
    var typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
    if (e.key === "/" && !typing && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      input.focus();
    }
  }

  function onDocClick(e) {
    if (wrap && !wrap.contains(e.target)) pop.hidden = true;
  }

  function onHashChange() { if (pop) pop.hidden = true; }

  function boot() {
    input = document.getElementById("gsearch");
    pop = document.getElementById("gsearch-pop");
    wrap = document.getElementById("gsearch-wrap");
    if (!input || !pop) return;
    input.addEventListener("input", onInput);
    input.addEventListener("keydown", onKey);
    input.addEventListener("focus", onInput);
    document.addEventListener("keydown", onGlobalKey);
    document.addEventListener("click", onDocClick);
    window.addEventListener("hashchange", onHashChange);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  return { search: search };
})();
