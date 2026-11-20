(() => {
  "use strict";

  const app = document.getElementById("app");
  const sandboxFrame = document.getElementById("sandbox");
  const STORE_PROGRESS = "codelearn-progress-v1";
  const STORE_STATS = "codelearn-stats-v1";
  const STORE_DRAFTS = "codelearn-drafts-v1";
  const XP_PER_LESSON = 20;

  let state = {
    done: load(STORE_PROGRESS, {}),
    stats: load(STORE_STATS, { xp: 0, streak: 0, lastDay: null }),
    drafts: load(STORE_DRAFTS, {}),
    quizAnswers: {}
  };

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? Object.assign({}, fallback, JSON.parse(raw)) : Object.assign({}, fallback);
    } catch (e) {
      return Object.assign({}, fallback);
    }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* stockage indisponible */ }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function md(text) {
    return escapeHtml(text)
      .replace(/`([^`]+)`/g, '<code class="inline">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  }

  function highlightGeneric(code, re, classes) {
    let out = "";
    let pos = 0;
    let m;
    while ((m = re.exec(code)) !== null) {
      out += escapeHtml(code.slice(pos, m.index));
      let cls = null;
      for (let g = 0; g < classes.length; g++) {
        if (m[g + 1] !== undefined) { cls = classes[g]; break; }
      }
      out += cls ? `<span class="${cls}">${escapeHtml(m[0])}</span>` : escapeHtml(m[0]);
      pos = m.index + m[0].length;
    }
    out += escapeHtml(code.slice(pos));
    return out;
  }

  function highlightJs(code) {
    const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(const|let|var|function|return|if|else|for|of|while|new|typeof|true|false|null|undefined|console)\b|\b(\d+(?:\.\d+)?)\b/g;
    return highlightGeneric(code, re, ["tok-com", "tok-str", "tok-kw", "tok-num"]);
  }

  function highlightCss(code) {
    const re = /(\/\*[\s\S]*?\*\/)|([.#]?[a-zA-Z][\w-]*(?=\s*\{))|([a-z-]+(?=\s*:))|(#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|em|%|rem|s)?\b)/g;
    return highlightGeneric(code, re, ["tok-com", "tok-tag", "tok-attr", "tok-num"]);
  }

  function highlightHtml(code) {
    let out = "";
    let pos = 0;
    const re = /(<!--[\s\S]*?-->)|(<\/?[a-zA-Z][^>]*>)/g;
    let m;
    while ((m = re.exec(code)) !== null) {
      out += escapeHtml(code.slice(pos, m.index));
      if (m[1]) {
        out += `<span class="tok-com">${escapeHtml(m[1])}</span>`;
      } else {
        let tag = escapeHtml(m[2]);
        tag = tag.replace(/([a-zA-Z-]+)=(&quot;|')([^&]*)(&quot;|')/g, '<span class="tok-attr">$1</span>=$2<span class="tok-str">$3</span>$4');
        out += `<span class="tok-tag">${tag}</span>`;
      }
      pos = m.index + m[0].length;
    }
    out += escapeHtml(code.slice(pos));
    return out;
  }

  function highlight(code, lang) {
    if (lang === "html") return highlightHtml(code);
    if (lang === "css") return highlightCss(code);
    return highlightJs(code);
  }

  function guessLang(code) {
    if (/<\/?[a-zA-Z]|<!--/.test(code)) return "html";
    if (/^[ \t]*[.#]?[a-zA-Z][\w-]*\s*\{/.test(code) && /:\s*[^;]+;/.test(code) && !/\b(function|const|let|console)\b/.test(code)) return "css";
    return "js";
  }


  function dateKey(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function todayKey() { return dateKey(new Date()); }
  function yesterdayKey() { const d = new Date(); d.setDate(d.getDate() - 1); return dateKey(d); }

  function lessonKey(courseId, lessonId) { return courseId + "/" + lessonId; }
  function isDone(courseId, lessonId) { return !!state.done[lessonKey(courseId, lessonId)]; }

  function courseProgress(course) {
    const total = course.lessons.length;
    const done = course.lessons.filter(l => isDone(course.id, l.id)).length;
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }

  function completeLesson(courseId, lessonId) {
    const key = lessonKey(courseId, lessonId);
    if (state.done[key]) return;
    state.done[key] = true;
    save(STORE_PROGRESS, state.done);
    state.stats.xp += XP_PER_LESSON;
    const today = todayKey();
    if (state.stats.lastDay !== today) {
      state.stats.streak = state.stats.lastDay === yesterdayKey() ? state.stats.streak + 1 : 1;
      state.stats.lastDay = today;
    }
    save(STORE_STATS, state.stats);
    refreshBadges();
  }

  function refreshBadges() {
    const xpEl = document.getElementById("xp-total");
    if (xpEl.textContent !== String(state.stats.xp)) {
      xpEl.textContent = state.stats.xp;
      const badge = xpEl.closest(".xp");
      if (badge) {
        badge.classList.remove("bump");
        void badge.offsetWidth;
        badge.classList.add("bump");
      }
    }
    document.getElementById("streak-days").textContent = state.stats.streak;
  }

  function countUp(el, to, ms) {
    const from = 0;
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / ms);
      el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function findCourse(id) { return COURSES.find(c => c.id === id); }
  function findLesson(course, id) { return course.lessons.find(l => l.id === id); }

  function route() {
    const parts = (location.hash || "#/").replace(/^#\//, "").split("/").filter(Boolean);
    window.scrollTo(0, 0);
    replayRouteAnimation();
    if (window.CodeCampMatrix) CodeCampMatrix.onRoute(parts[0] || "home");
    if (parts[0] === "course" && parts[1] && findCourse(parts[1])) return renderCourse(findCourse(parts[1]));
    if (parts[0] === "lesson" && parts[1] && parts[2]) {
      const course = findCourse(parts[1]);
      const lesson = course && findLesson(course, parts[2]);
      if (course && lesson) return renderLesson(course, lesson);
    }
    if (parts[0] === "plan") return renderPlan();
    if (parts[0] === "terminal" && window.CodeCampTerminal) return CodeCampTerminal.render();
    renderHome();
  }

  function replayRouteAnimation() {
    app.classList.remove("route-fade");
    void app.offsetWidth;
    app.classList.add("route-fade");
  }

  function setActiveNav(name) {
    document.querySelectorAll("[data-nav]").forEach(a => {
      a.classList.toggle("active", a.dataset.nav === name);
    });
  }

  function doneCount() { return Object.keys(state.done).length; }

  function findNextLesson() {
    for (const c of COURSES) {
      for (const l of c.lessons) {
        if (!isDone(c.id, l.id)) return { course: c, lesson: l };
      }
    }
    return null;
  }

  function lessonRows(course) {
    return course.lessons.map((l, i) => {
      const done = isDone(course.id, l.id);
      return `
      <a class="lesson-row ${done ? "done" : ""}" href="#/lesson/${course.id}/${l.id}">
        <span class="num">${done ? "✓" : i + 1}</span>
        <span class="title">${escapeHtml(l.title)}</span>
        <span class="state">${done ? "Terminée" : "À faire"}</span>
      </a>`;
    }).join("");
  }

  function renderHome() {
    setActiveNav("home");
    const nextUp = findNextLesson();
    if (window.CodeCampMatrix) setTimeout(() => CodeCampMatrix.heroHome(document.querySelector(".hero")), 0);
    app.innerHTML = `
      <section class="hero">
        <h1>Apprends à coder, pas à pas</h1>
        <p class="typing">Des cours interactifs de JavaScript, HTML et CSS : lis la théorie, code dans l'éditeur intégré, et tes exercices sont corrigés instantanément.</p>
        <div class="stat-chips">
          <span class="stat-chip">📚 <strong id="stat-lessons">0</strong> leçons</span>
          <span class="stat-chip">✅ <strong id="stat-done">0</strong> terminées</span>
          <span class="stat-chip">⭐ <strong id="stat-xp">0</strong> XP</span>
          <span class="stat-chip">🔥 <strong id="stat-streak">0</strong> j d'affilée</span>
        </div>
        ${nextUp
          ? `<a class="btn btn-primary" href="#/lesson/${nextUp.course.id}/${nextUp.lesson.id}">${doneCount() > 0 ? "▶ Continuer : " : "🚀 Commencer : "}${escapeHtml(nextUp.lesson.title)}</a>`
          : `<a class="btn btn-primary" href="#/plan">🎉 Tout le parcours est terminé — voir mon plan</a>`}
      </section>
      <section class="courses">
        ${COURSES.map(c => {
          const p = courseProgress(c);
          return `
          <a class="course-card" href="#/course/${c.id}">
            <div class="_icon">${c.icon}</div>
            <h2>${escapeHtml(c.title)}</h2>
            <p>${escapeHtml(c.description)}</p>
            <div class="progress-track"><div class="progress-fill" style="width:${p.pct}%"></div></div>
            <div class="course-meta"><span>${p.done}/${p.total} leçons</span><span>${p.pct}%</span></div>
          </a>`;
        }).join("")}
      </section>`;
    countUp(document.getElementById("stat-lessons"), COURSES.reduce((n, c) => n + c.lessons.length, 0), 700);
    countUp(document.getElementById("stat-done"), doneCount(), 700);
    countUp(document.getElementById("stat-xp"), state.stats.xp, 900);
    document.getElementById("stat-streak").textContent = state.stats.streak;
  }

  function renderCourse(course) {
    setActiveNav("");
    const p = courseProgress(course);
    app.innerHTML = `
      <a class="breadcrumb" href="#/">← Accueil</a>
      <div class="theory-block">
        <h2>${course.icon} ${escapeHtml(course.title)}</h2>
        <p class="lesson-sub">${escapeHtml(course.description)} — ${p.done}/${p.total} leçons terminées (${p.pct}%)</p>
        <div class="progress-track"><div class="progress-fill" style="width:${p.pct}%"></div></div>
      </div>
      <div class="lesson-list">${lessonRows(course)}</div>`;
  }

  function renderPlan() {
    setActiveNav("plan");
    const totalLessons = COURSES.reduce((n, c) => n + c.lessons.length, 0);
    const done = doneCount();
    const pct = totalLessons ? Math.round((done / totalLessons) * 100) : 0;
    app.innerHTML = `
      <section class="hero">
        <h1>Mon plan</h1>
        <p>${done > 0 ? "Bravo, tu continues d'avancer !" : "Ton parcours commence ici."}</p>
        <div class="progress-track" style="max-width:420px;margin:8px auto 6px"><div class="progress-fill" style="width:${pct}%"></div></div>
        <p class="lesson-sub">${done}/${totalLessons} leçons · ⭐ ${state.stats.xp} XP · 🔥 ${state.stats.streak} jour(s) d'affilée</p>
        <a class="btn btn-primary" href="#/">Revenir aux cours</a>
      </section>
      ${COURSES.map(c => {
        const p = courseProgress(c);
        return `
        <section class="plan-section">
          <h2>${c.icon} ${escapeHtml(c.title)} <span style="color:var(--muted);font-size:14px;font-weight:500">${p.done}/${p.total}</span></h2>
          <div class="lesson-list">${lessonRows(c)}</div>
        </section>`;
      }).join("")}`;
  }

  function renderQuiz(course, lesson) {
    const quiz = lesson.quiz || [];
    if (!quiz.length) return "";
    const answers = state.quizAnswers[lessonKey(course.id, lesson.id)];
    return `
      <section class="quiz" id="quiz">
        <h3>🧠 Quiz express</h3>
        ${quiz.map((q, qi) => `
          <div class="quiz-q">${qi + 1}. ${escapeHtml(q.q)}</div>
          ${q.options.map((opt, oi) => {
            let cls = "";
            if (answers) {
              if (oi === q.answer) cls = "correct";
              else if (answers[qi] === oi) cls = "wrong";
            }
            return `
            <label class="quiz-opt ${cls}">
              <input type="radio" name="q${qi}" value="${oi}" ${answers && answers[qi] === oi ? "checked" : ""} ${answers ? "disabled" : ""}>
              <span>${escapeHtml(opt)}</span>
            </label>`;
          }).join("")}`).join("")}
        <div class="quiz-feedback" id="quiz-feedback"></div>
        ${answers ? "" : `<div style="margin-top:12px"><button class="btn" id="quiz-check">Vérifier mes réponses</button></div>`}
      </section>`;
  }

  function bindQuiz(course, lesson) {
    const btn = document.getElementById("quiz-check");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const quiz = lesson.quiz;
      const answers = quiz.map((q, qi) => {
        const sel = app.querySelector(`input[name="q${qi}"]:checked`);
        return sel ? Number(sel.value) : -1;
      });
      const fb = document.getElementById("quiz-feedback");
      if (answers.some(a => a < 0)) {
        fb.textContent = "⚠️ Réponds à toutes les questions d'abord.";
        fb.className = "quiz-feedback ko";
        return;
      }
      state.quizAnswers[lessonKey(course.id, lesson.id)] = answers;
      renderLesson(course, lesson);
      const correct = quiz.filter((q, qi) => answers[qi] === q.answer).length;
      const fb2 = document.getElementById("quiz-feedback");
      fb2.textContent = correct === quiz.length
        ? `✅ Excellent : ${correct}/${quiz.length} !`
        : `❌ ${correct}/${quiz.length} — les bonnes réponses sont surlignées.`;
      fb2.className = "quiz-feedback " + (correct === quiz.length ? "ok" : "ko");
    });
  }

  const HARNESS_DOC = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><script>
parent.postMessage({ kind: 'ready' }, '*');
window.addEventListener('message', function (e) {
  var d = e.data;
  if (!d || d.kind !== 'run') return;
  var reply = function (p) { p.kind = 'run-result'; p.id = d.id; parent.postMessage(p, '*'); };
  var fmt = function (v) { return (typeof v === 'object' && v !== null) ? JSON.stringify(v) : String(v); };
  var userLines = [];
  var testLines = [];
  (d.tests || []).forEach(function () { testLines.push([]); });
  var __i = -1;
  var route = function () {
    var s = Array.prototype.map.call(arguments, fmt).join(' ');
    if (__i < 0) userLines.push(s);
    else if (testLines[__i]) testLines[__i].push(s);
  };
  var con = { log: route, info: route, warn: route, error: route };
  window.__set = function (i) { __i = i; };
  window.__terr = function (i, m) { testLines[i].push('Erreur : ' + m); };
  var body = (d.code || '')
    + (d.tests || []).map(function (t, i) {
        return '\\n;__set(' + i + ');\\ntry{\\n' + t.code + '\\n} catch (e) { __terr(' + i + ', String(e)); }';
      }).join('')
    + '\\n;__set(-1);';
  var fn = null, syn = null;
  try { fn = new Function('console', body); } catch (ex) { syn = String(ex && ex.message || ex); }
  if (fn) {
    try { fn(con); } catch (ex) { userLines.push('Erreur : ' + String(ex && ex.message || ex)); }
  }
  reply({
    output: userLines,
    error: syn,
    tests: (d.tests || []).map(function (t, i) { return { lines: testLines[i], expect: t.expect }; })
  });
});
<\/script></body></html>`;

  let msgId = 0;
  const pending = new Map();

  window.addEventListener("message", e => {
    const d = e.data;
    if (d && d.id !== undefined && pending.has(d.id)) {
      const entry = pending.get(d.id);
      clearTimeout(entry.timer);
      pending.delete(d.id);
      entry.resolve(d);
    }
  });

  function withWatchdog(work) {
    return new Promise(resolve => {
      const id = ++msgId;
      const timer = setTimeout(() => {
        pending.delete(id);
        resolve({ timeout: true, error: null, output: [], tests: [], results: null });
      }, 6000);
      pending.set(id, { resolve, timer });
      work(id);
    });
  }

  function installSandboxDoc(doc) {
    return new Promise(resolve => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        sandboxFrame.removeEventListener("load", onLoad);
        window.removeEventListener("message", onReady);
        resolve();
      };
      const onLoad = () => done();
      const onReady = e => { if (e.data && e.data.kind === "ready") done(); };
      const timer = setTimeout(done, 500);
      sandboxFrame.addEventListener("load", onLoad);
      window.addEventListener("message", onReady);
      sandboxFrame.srcdoc = doc;
    });
  }

  async function runUserCode(code, tests) {
    await installSandboxDoc(HARNESS_DOC);
    return withWatchdog(id => {
      sandboxFrame.contentWindow.postMessage({ kind: "run", id, code, tests: tests || [] }, "*");
    });
  }

  async function checkDom(html, css, testCode) {
    return withWatchdog(id => {
      sandboxFrame.srcdoc =
`<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body { font-family: sans-serif; padding: 14px; color: #111; margin: 0; }
img { max-width: 100%; }
</style><style>${css}</style></head><body>
${html}
<script>
var _results = [];
function cm(pass, message) { _results.push({ pass: !!pass, message: String(message) }); }
try { ${testCode}
} catch (e) { _results.push({ pass: false, message: "Erreur : " + e }); }
parent.postMessage({ kind: 'dom-result', id: ${id}, results: _results }, '*');
<\/script>
</body></html>`;
    });
  }

  function normalizeLines(arr) {
    return (arr || []).map(l => String(l).trim().replace(/\s+/g, " ")).filter(l => l.length > 0);
  }

  function evaluateResult(check, result) {
    if (result.timeout) return { pass: false, message: "⏱️ Trop long à s'exécuter : il y a peut-être une boucle infinie." };
    if (result.error) return { pass: false, message: "⛔ Erreur : " + result.error };

    if (check.kind === "dom") {
      const results = result.results || [];
      if (!results.length) return { pass: false, message: "❌ Aucun vérificateur n'a pu s'exécuter." };
      const bad = results.find(r => !r.pass);
      if (bad) return { pass: false, message: "❌ " + bad.message };
      return { pass: true, message: "✅ " + (results[0].message || "C'est validé !") + " (+20 XP)" };
    }

    if (check.expected) {
      const got = normalizeLines(result.output);
      const want = normalizeLines(check.expected);
      if (got.join("\n") !== want.join("\n")) {
        return { pass: false, message: "❌ Pas encore : attendu « " + want.join(" | ") + " », obtenu « " + (got.join(" | ") || "(rien)") + " »." };
      }
      return { pass: true, message: "✅ Bravo, c'est exact ! (+20 XP)" };
    }

    const failures = [];
    (result.tests || []).forEach((t, i) => {
      const got = normalizeLines(t.lines);
      const want = normalizeLines(t.expect);
      if (got.join("\n") !== want.join("\n")) {
        failures.push("test " + (i + 1) + " : attendu « " + want.join(" | ") + " », obtenu « " + (got.join(" | ") || "(rien)") + " »");
      }
    });
    if (failures.length) {
      return { pass: false, message: "❌ Pas encore — " + failures[0] +
        (failures.length > 1 ? " (+ " + (failures.length - 1) + " autre(s) test(s) en échec)" : "") + "." };
    }
    return { pass: true, message: "✅ Bravo, tous les tests passent ! (+20 XP)" };
  }

  function renderLesson(course, lesson) {
    setActiveNav("");
    const index = course.lessons.indexOf(lesson);
    const done = isDone(course.id, lesson.id);
    const key = lessonKey(course.id, lesson.id);
    const isDom = !!lesson.exercise && lesson.exercise.type === "dom";
    const fixedHtml = lesson.exercise && lesson.exercise.fixedHtml ? lesson.exercise.fixedHtml : "";
    const draft = state.drafts[key] ?? (lesson.exercise ? lesson.exercise.starter : "");

    app.innerHTML = `
      <a class="breadcrumb" href="#/course/${course.id}">← ${escapeHtml(course.title)}</a>
      <section class="theory">
        <h2>${escapeHtml(lesson.title)}</h2>
        <p class="lesson-sub">${course.icon} ${escapeHtml(course.title)} · Leçon ${index + 1}/${course.lessons.length}${done ? " · ✅ Terminée" : ""}</p>
        ${(lesson.theory || []).map(b => {
          const lang = b.lang || (course.id === "css-base" ? "css" : course.id === "html-base" ? "html" : guessLang(b.code));
          if (b.type === "code") return `<pre class="code-block">${highlight(b.code, lang)}</pre>`;
          if (b.type === "tip") return `<div class="tip">💡 ${md(b.md)}</div>`;
          return `<div class="theory-block"><p>${md(b.md)}</p></div>`;
        }).join("")}
      </section>
      ${renderQuiz(course, lesson)}
      ${lesson.exercise ? `
      <section class="exercise" id="exercise">
        <h3>💻 Exercice</h3>
        <p class="prompt">${md(lesson.exercise.prompt)}</p>
        <div class="editor-wrap ${isDom ? "two-col" : ""}">
          <textarea id="editor" class="editor" spellcheck="false">${escapeHtml(draft)}</textarea>
          ${isDom ? `<iframe id="preview" class="preview-frame" sandbox="" title="aperçu"></iframe>` : ""}
        </div>
        <div class="editor-actions" style="margin-top:12px">
          <button class="btn btn-primary" id="btn-check">✔ Vérifier mon code</button>
          ${!isDom ? `<button class="btn" id="btn-run">▶ Exécuter</button>` : ""}
          <button class="btn" id="btn-reset">↺ Réinitialiser</button>
        </div>
        <div class="console-out" id="result-out" style="margin-top:12px">
          ${isDom ? "L'aperçu de ta page s'affiche à droite." : "Le résultat de ton code apparaîtra ici."}
        </div>
      </section>` : ""}
      <div class="next-bar">
        ${index > 0 ? `<a class="btn" href="#/lesson/${course.id}/${course.lessons[index - 1].id}">← Leçon précédente</a>` : ""}
        ${index < course.lessons.length - 1
          ? `<a class="btn btn-primary" href="#/lesson/${course.id}/${course.lessons[index + 1].id}">Leçon suivante →</a>`
          : `<a class="btn btn-primary" href="#/plan">Voir mon plan 🎉</a>`}
      </div>`;

    bindQuiz(course, lesson);
    document.getElementById("btn-reset").addEventListener("click", () => {
      editor.value = lesson.exercise ? lesson.exercise.starter : "";
      editor.dispatchEvent(new Event("input"));
    });
    if (!lesson.exercise) return;

    const editor = document.getElementById("editor");
    const out = document.getElementById("result-out");
    const checkBtn = document.getElementById("btn-check");
    const preview = document.getElementById("preview");

    editor.addEventListener("input", () => {
      state.drafts[key] = editor.value;
      save(STORE_DRAFTS, state.drafts);
      if (isDom) updatePreview();
    });
    editor.addEventListener("keydown", e => {
      if (e.key === "Tab") {
        e.preventDefault();
        const s = editor.selectionStart, epos = editor.selectionEnd;
        editor.value = editor.value.slice(0, s) + "  " + editor.value.slice(epos);
        editor.selectionStart = editor.selectionEnd = s + 2;
        editor.dispatchEvent(new Event("input"));
      }
    });

    function isCssExercise() { return isDom && !!fixedHtml; }
    function userHtml() { return isCssExercise() ? fixedHtml : editor.value; }
    function userCss() { return isCssExercise() ? editor.value : ""; }

    function updatePreview() {
      preview.srcdoc =
`<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body { font-family: sans-serif; padding: 14px; color: #111; margin: 0; }
img { max-width: 100%; }
</style><style>${userCss()}</style></head><body>${userHtml()}</body></html>`;
    }

    async function verify() {
      checkBtn.disabled = true;
      checkBtn.textContent = "⏳ Vérification…";
      let result;
      try {
        const check = lesson.exercise.check;
        result = check.kind === "dom"
          ? await checkDom(userHtml(), userCss(), check.testCode)
          : await runUserCode(editor.value, check.tests || []);
      } finally {
        checkBtn.disabled = false;
        checkBtn.textContent = "✔ Vérifier mon code";
      }
      const verdict = evaluateResult(lesson.exercise.check, result);
      out.classList.remove("ok", "bad");
      out.classList.add(verdict.pass ? "ok" : "bad");
      if (!isDom && result.output && result.output.length && !lesson.exercise.check.expected) {
        out.textContent = "Console :\n" + result.output.map(escapeHtml).join("\n") + "\n\n" + escapeHtml(verdict.message);
      } else {
        out.textContent = verdict.message;
      }
      if (verdict.pass && !isDone(course.id, lesson.id)) completeLesson(course.id, lesson.id);
      if (verdict.pass) {
        if (window.CodeCampUI) {
          CodeCampUI.spawnConfetti();
          const next = course.lessons[index + 1];
          CodeCampUI.showModal({
            icon: "🎉",
            heading: "Leçon terminée !",
            html: `<p style="color:var(--muted)">Exercice validé : <strong style="color:var(--yellow)">+20 XP</strong> ${state.stats.streak > 1 ? "· série de " + state.stats.streak + " jours 🔥" : ""}</p>`,
            actions: next
              ? [{ label: "Leçon suivante →", primary: true, href: `#/lesson/${course.id}/${next.id}` }, { label: "Rester ici" }]
              : [{ label: "Voir mon plan 🏁", primary: true, href: "#/plan" }, { label: "Rester ici" }]
          });
        }
      }
    }

    checkBtn.addEventListener("click", verify);

    if (!isDom) {
      document.getElementById("btn-run").addEventListener("click", async () => {
        const btn = document.getElementById("btn-run");
        btn.disabled = true;
        btn.textContent = "⏳ …";
        let result;
        try { result = await runUserCode(editor.value, []); }
        finally { btn.disabled = false; btn.textContent = "▶ Exécuter"; }
        out.classList.remove("ok", "bad");
        if (result.timeout) {
          out.classList.add("bad");
          out.textContent = "⏱️ Trop long à s'exécuter : boucle infinie ?";
        } else {
          out.textContent = "Console :\n" + (result.output.length ? result.output.map(escapeHtml).join("\n") : "(aucune sortie)");
        }
      });
    } else {
      updatePreview();
    }

    if (window.CodeCampUI && !CodeCampUI.marks.hintLesson && lesson.exercise) {
      CodeCampUI.marks.hintLesson = true;
      CodeCampUI.saveMarks();
      setTimeout(() => {
        CodeCampUI.runTour([
          { el: "#exercise .theory-anchor, .exercise h3", title: "⌨️ C'est ici que tu codes", text: "Remplace les commentaires par ta solution. Tu peux taper, corriger, recommencer autant de fois que tu veux." },
          { el: "#btn-check", title: "✅ Vérification automatique", text: "Un clic et ton code est testé : réussi = +20 XP et leçon validée !" },
          { el: "#result-out", title: "👀 Résultat instantané", text: isDom ? "Ta page s'affiche en direct, et le verdict apparaît ici." : "La console affiche ce que ton code produit, et le verdict apparaît ici." }
        ], { finish: "Compris !", skip: "Passer" });
      }, 700);
    }
  }

  window.addEventListener("hashchange", route);
  refreshBadges();
  route();
})();
