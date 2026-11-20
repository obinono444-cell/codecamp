(() => {
  "use strict";

  const KEY = "codelearn-ui-v1";

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(ui)); } catch (e) { /* pas de stockage */ }
  }

  let ui = load();

  const overlay = document.createElement("div");
  overlay.className = "ui-overlay";
  overlay.setAttribute("aria-modal", "true");
  document.body.appendChild(overlay);

  const spot = document.createElement("div");
  spot.className = "tour-spot";
  document.body.appendChild(spot);

  const tip = document.createElement("div");
  tip.className = "tour-tip";
  document.body.appendChild(tip);

  function hideChrome() {
    overlay.classList.remove("visible");
    spot.classList.remove("visible");
    tip.classList.remove("visible");
  }

  window.addEventListener("keydown", e => {
    if (e.key === "Escape" && overlay.classList.contains("visible")) {
      hideChrome();
      modal = null;
    }
  });

  let modal = null;

  function showModal({ heading, html, actions, icon }) {
    modal = { heading, actions: actions || [{ label: "Fermer" }] };
    overlay.innerHTML = `
      <div class="modal-card pop-in" role="dialog">
        ${icon ? `<div class="modal-icon">${icon}</div>` : ""}
        <h2>${heading}</h2>
        <div class="modal-body">${html || ""}</div>
        <div class="modal-actions">
          ${modal.actions.map((a, i) =>
            `<button class="btn ${a.primary ? "btn-primary" : ""}" data-modal-act="${i}">${a.label}</button>`
          ).join("")}
        </div>
      </div>`;
    overlay.classList.add("visible");
    overlay.querySelectorAll("[data-modal-act]").forEach(btn => {
      btn.addEventListener("click", () => {
        const action = modal.actions[Number(btn.dataset.modalAct)];
        hideChrome();
        modal = null;
        if (action && action.href) location.hash = action.href;
        if (action && action.onClick) action.onClick();
      });
    });
  }

  overlay.addEventListener("click", e => {
    if (e.target === overlay && modal) {
      hideChrome();
      modal = null;
    }
  });

  function getEl(step) {
    if (typeof step.el === "string") return document.querySelector(step.el);
    return step.el || null;
  }

  function placeStep(step, el) {
    const r = el.getBoundingClientRect();
    const pad = 10;
    spot.style.top = (r.top - pad) + "px";
    spot.style.left = (r.left - pad) + "px";
    spot.style.width = (r.width + pad * 2) + "px";
    spot.style.height = (r.height + pad * 2) + "px";

    const tipW = Math.min(320, window.innerWidth - 32);
    let top = r.bottom + 16;
    if (top + tip.offsetHeight > window.innerHeight - 12) {
      top = r.top - tip.offsetHeight - 16;
      tip.classList.remove("below");
      tip.classList.add("above");
    } else {
      tip.classList.add("below");
      tip.classList.remove("above");
    }
    if (top < 12) top = 12;
    let left = r.left + r.width / 2 - tipW / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - tipW - 16));
    tip.style.top = top + "px";
    tip.style.left = left + "px";
    tip.style.width = tipW + "px";

    tip.dataset.current = "";
    requestAnimationFrame(() => tip.dataset.current = "in");
    spot.dataset.current = "";
    requestAnimationFrame(() => spot.dataset.current = "in");
  }

  function runTour(steps, opts) {
    opts = opts || {};
    let i = 0;
    function show() {
      const step = steps[i];
      const el = getEl(step);
      if (!el) { next(); return; }
      if (el.scrollIntoView) el.scrollIntoView({ block: "center", behavior: "smooth" });
      setTimeout(() => {
        if (i >= steps.length) return;
        tip.innerHTML = `
          <div class="tour-step">${i + 1}/${steps.length}</div>
          <h3>${step.title}</h3>
          <p>${step.text}</p>
          <div class="tour-actions">
            <button class="btn btn-ghost" data-tour="skip">${opts.skip || "Passer"}</button>
            <button class="btn btn-primary" data-tour="next">${i === steps.length - 1 ? (opts.finish || "Terminé !") : "Suivant →"}</button>
          </div>`;
        tip.offsetHeight;
        placeStep(step, el);
        tip.querySelectorAll("[data-tour]").forEach(btn => {
          btn.addEventListener("click", ev => {
            if (btn.dataset.tour === "skip") stop();
            else next();
          });
        });
      }, 350);
    }
    function next() {
      i += 1;
      if (i < steps.length) show();
      else stop(true);
    }
    function stop(done) {
      clearTimeout(timer);
      hideChrome();
      if (done && opts.onFinish) opts.onFinish();
    }
    overlay.classList.add("visible");
    let timer = setTimeout(() => { /* filet de sécurité si le scroll ne se fait pas */ show(); }, 0);
    show();
  }

  function spawnConfetti(count) {
    count = count || 90;
    const colors = ["#4f8cff", "#9d5cff", "#2ea043", "#e3b341", "#ff7043", "#39c5cf"];
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "confetti";
      p.style.left = (Math.random() * 100) + "vw";
      p.style.background = colors[i % colors.length];
      p.style.width = (6 + Math.random() * 8) + "px";
      p.style.height = (10 + Math.random() * 8) + "px";
      p.style.setProperty("--drift", (Math.random() * 160 - 80) + "px");
      p.style.setProperty("--spin", (Math.random() * 720 - 360) + "deg");
      p.style.animationDuration = (0.9 + Math.random() * 1.6) + "s";
      p.style.animationDelay = (Math.random() * 0.25) + "s";
      document.body.appendChild(p);
      p.addEventListener("animationend", () => p.remove());
    }
  }

  function showWelcome(manual) {
    showModal({
      icon: "🎓",
      heading: "Bienvenue sur CodeCamp !",
      html: `
        <p style="color:var(--muted)">Tu ne sais pas coder ? Parfait, tu es au bon endroit. Voici comment ça marche :</p>
        <div class="step-cards">
          <div class="step-card"><span>📖</span><strong>Lis</strong>la leçon : concept + exemple de code</div>
          <div class="step-card"><span>⌨️</span><strong>Code</strong>dans l'éditeur intégré, comme un vrai développeur</div>
          <div class="step-card"><span>✅</span><strong>Vérifie</strong>ton code est corrigé instantanément : +20 XP !</div>
          <div class="step-card"><span>🤖</span><strong>Demande</strong>à CodeBot, l'IA qui répond à tes questions</div>
          <div class="step-card"><span>⌨️</span><strong>Pratique</strong>les commandes page Terminal (CMD, PowerShell, Bash)</div>
        </div>
        <p style="color:var(--muted);font-size:14px">Enchaîne les leçons, gagne de l'XP et garde ta série 🔥 — le tout sauvegardé automatiquement.</p>`,
      actions: [
        { label: "🚀 Faire la visite guidée", primary: true, onClick: () => {
            ui.welcome = true; save(); startHomeTour();
          } },
        { label: "Commencer l'apprentissage", onClick: () => {
            ui.welcome = true; save();
            const first = document.querySelector(".hero .btn-primary");
            if (first) first.click();
          } }
      ]
    });
  }

  function startHomeTour() {
    runTour([
      { el: "#app .course-card", title: "📚 Choisis un cours", text: "Trois parcours t'attendent : JavaScript, HTML et CSS. Clique sur une carte pour voir ses leçons." },
      { el: "#app .hero .btn-primary", title: "🎯 Continue d'où tu t'es arrêté", text: "Ce bouton t'emmène directement à ta prochaine leçon à valider." },
      { el: "[data-nav=\"terminal\"]", title: "⌨️ Le Terminal", text: "Les commandes CMD, PowerShell et Git Bash expliquées, plus un mini-terminal simulé pour t'entraîner sans risque." },
      { el: "#ai-fab", title: "🤖 CodeBot, ton IA", text: "Un assistant qui explique les notions, te pose des quiz et t'ouvre les bonnes pages. Clique sur le robot en bas à droite." },
      { el: "#app .stat-chips", title: "📊 Ta progression, en direct", text: "Leçons finies, XP, série de jours : tout est sauvegardé dans ton navigateur." },
      { el: ".topbar-right .streak", title: "🔥 La série (streak)", text: "Code au moins une leçon chaque jour pour faire grandir ta flamme." }
    ], { finish: "C'est parti 🚀", skip: "Passer", onFinish: () => {} });
  }

  if (document.getElementById("btn-help")) {
    document.getElementById("btn-help").addEventListener("click", () => showWelcome(true));
  }

  if (!ui.welcome) {
    setTimeout(() => showWelcome(false), 900);
  }

  window.CodeCampUI = { showModal, runTour, spawnConfetti, startHomeTour, marks: ui, saveMarks: save };
})();
