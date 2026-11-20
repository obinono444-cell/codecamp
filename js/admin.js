/* CodeCamp — Panneau Admin : accès e-mail + mot de passe, fermer/rouvrir le site */
window.CodeCampAdmin = (function () {
  "use strict";

  var KEY = "codecamp-admin-v1";
  var ADMIN_MAIL = "obinono444@gmail.com";
  var state = { emailHash: null, passHash: null, closed: false, message: "", attempts: 0, cooldownUntil: 0 };
  var panel = null, lockEl = null;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) state = Object.assign(state, JSON.parse(raw));
    } catch (e) {}
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function hash(str) {
    var a = 5381, b = 52711, salt = "codecamp::v1::";
    var s = salt + String(str) + salt;
    for (var r = 0; r < 512; r++) {
      for (var i = 0; i < s.length; i++) {
        a = ((a << 5) + a + s.charCodeAt(i) + r) >>> 0;
        b = ((b << 5) ^ b ^ s.charCodeAt(i) * (i + 7)) >>> 0;
      }
      s = a.toString(36) + b.toString(36);
    }
    return "h" + a.toString(36) + "_" + b.toString(36);
  }

  function mailHash(mail) {
    return hash(String(mail || "").trim().toLowerCase());
  }

  function stats() {
    var done = 0, xp = 0, streak = 0;
    try {
      done = Object.keys(JSON.parse(localStorage.getItem("codelearn-progress-v1") || "{}")).length;
      var st = JSON.parse(localStorage.getItem("codelearn-stats-v1") || "{}");
      xp = st.xp || 0;
      streak = st.streak || 0;
    } catch (e) {}
    return { done: done, xp: xp, streak: streak };
  }

  /* ---------- Toasts ---------- */
  function toast(msg, ok) {
    var box = document.getElementById("toast-box");
    if (!box) {
      box = document.createElement("div");
      box.id = "toast-box";
      document.body.appendChild(box);
    }
    var t = document.createElement("div");
    t.className = "toast" + (ok === false ? " bad" : "");
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(function () { t.classList.add("gone"); }, 2400);
    setTimeout(function () { if (t.parentNode) t.remove(); }, 2900);
  }

  /* ---------- Écran de verrouillage (vision visiteurs) ---------- */
  function renderLock() {
    if (lockEl) { lockEl.hidden = false; return; }
    lockEl = document.createElement("div");
    lockEl.id = "lock-screen";
    lockEl.innerHTML =
      '<div class="lock-bg" aria-hidden="true"><span>t</span><span>0</span><span>1</span><span>1</span><span>0</span><span>1</span><span>{}</span><span>&lt;/&gt;</span><span>;</span><span>**</span><span>==</span><span>[]</span></div>' +
      '<div class="lock-card">' +
      '<div class="lock-icon">\ud83d\udd12</div>' +
      '<h1>CodeCamp est ferm\u00e9</h1>' +
      '<p id="lock-msg">' + esc(state.message || "Le site est momentan\u00e9ment en maintenance. Reviens plus tard !") + '</p>' +
      '<div class="lock-auth col">' +
      '<input id="lock-mail" type="email" placeholder="Adresse mail admin" autocomplete="off">' +
      '<input id="lock-pass" type="password" placeholder="Mot de passe admin" autocomplete="off">' +
      '<button id="lock-unlock">D\u00e9verrouiller</button>' +
      '</div>' +
      '<p id="lock-err" class="lock-err" role="alert"></p>' +
      '<p class="lock-foot">Acc\u00e8s r\u00e9serv\u00e9 \u00e0 l\u2019administrateur \u00b7 CodeCamp</p>' +
      '</div>';
    document.body.appendChild(lockEl);

    var mail = lockEl.querySelector("#lock-mail");
    var pass = lockEl.querySelector("#lock-pass");
    lockEl.querySelector("#lock-unlock").addEventListener("click", tryUnlock);
    pass.addEventListener("keydown", function (e) { if (e.key === "Enter") tryUnlock(); });
    mail.addEventListener("keydown", function (e) { if (e.key === "Enter") pass.focus(); });
    setTimeout(function () { mail.focus(); }, 200);

    function tryUnlock() {
      if (Date.now() < state.cooldownUntil) {
        lockErr("Trop d'essais. Patiente " + Math.ceil((state.cooldownUntil - Date.now()) / 1000) + "s.");
        return;
      }
      if (mailHash(mail.value) === state.emailHash && hash(pass.value) === state.passHash) {
        state.closed = false;
        state.attempts = 0;
        save();
        if (lockEl) { lockEl.remove(); lockEl = null; }
        location.reload();
      } else {
        state.attempts++;
        if (state.attempts >= 5) state.cooldownUntil = Date.now() + 30000;
        save();
        lockErr(state.attempts >= 5
          ? "\ud83d\udeab Trop d'essais. Nouvelle tentative dans 30 s."
          : "\u274c Mail ou mot de passe incorrect (" + state.attempts + "/5)");
        pass.value = "";
        var card = lockEl.querySelector(".lock-card");
        card.classList.remove("shake");
        void card.offsetWidth;
        card.classList.add("shake");
      }
    }

    function lockErr(t) {
      lockEl.querySelector("#lock-err").textContent = t;
    }
  }

  /* ---------- Étapes d'entrée ---------- */
  function openPanel() {
    buildPanel();
    if (!state.passHash && !state.emailHash) showSetup();
    else if (state.passHash && !state.emailHash) showLinkMail();
    else showAuth();
    openWithAnim();
  }

  function showSetup() {
    var body = panel.querySelector("#panel-body");
    body.innerHTML =
      '<div class="panel-lockicon">\ud83d\udee1\ufe0f</div>' +
      '<h3>Cr\u00e9er ton compte admin</h3>' +
      '<p class="panel-muted">Seule <strong>ton adresse mail + ton mot de passe</strong> donneront acc\u00e8s \u00e0 ce panneau. Note-les bien !</p>' +
      '<input id="admin-mail" type="email" value="obinono444@gmail.com" readonly title="Adresse admin fixe">' +
      '<input id="admin-p1" type="password" placeholder="Mot de passe (4 caract\u00e8res min.)">' +
      '<input id="admin-p2" type="password" placeholder="Confirme le mot de passe">' +
      '<button id="admin-set" class="panel-btn primary">Cr\u00e9er mon compte admin</button>' +
      '<p id="admin-err" class="lock-err"></p>';
    var mail = body.querySelector("#admin-mail"), p1 = body.querySelector("#admin-p1"), p2 = body.querySelector("#admin-p2");
    body.querySelector("#admin-set").addEventListener("click", function () {
      var m = (mail.value || "").trim();
      if (mailHash(m) !== mailHash(ADMIN_MAIL)) { body.querySelector("#admin-err").textContent = "\u274c Seule l'adresse " + ADMIN_MAIL + " est admin."; return; }
      if ((p1.value || "").length < 4) { body.querySelector("#admin-err").textContent = "\u274c Mot de passe : 4 caract\u00e8res minimum."; return; }
      if (p1.value !== p2.value) { body.querySelector("#admin-err").textContent = "\u274c Les deux mots de passe ne sont pas identiques."; return; }
      state.emailHash = mailHash(m);
      state.passHash = hash(p1.value);
      save();
      body.querySelector("#admin-err").textContent = "";
      toast("\ud83d\udd10 Compte admin cr\u00e9\u00e9 pour " + m);
      showDashboard();
    });
    mail.focus();
  }

  function showLinkMail() {
    var body = panel.querySelector("#panel-body");
    body.innerHTML =
      '<div class="panel-lockicon">\ud83d\udcec</div>' +
      '<h3>Ajoute ton adresse mail admin</h3>' +
      '<p class="panel-muted">Tu avais d\u00e9j\u00e0 un mot de passe : associe maintenant ton adresse mail pour te connecter.</p>' +
      '<input id="admin-mail" type="email" value="obinono444@gmail.com" readonly title="Adresse admin fixe">' +
      '<button id="admin-link" class="panel-btn primary">Associer mon adresse</button>' +
      '<p id="admin-err" class="lock-err"></p>';
    var mail = body.querySelector("#admin-mail");
    body.querySelector("#admin-link").addEventListener("click", function () {
      var m = (mail.value || "").trim();
      if (!/^\S+@\S+\.\S+$/.test(m)) { body.querySelector("#admin-err").textContent = "\u274c Adresse mail invalide."; return; }
      state.emailHash = mailHash(m);
      save();
      toast("\ud83d\udcec Adresse associ\u00e9e !");
      showDashboard();
    });
    mail.focus();
  }

  function showAuth() {
    var body = panel.querySelector("#panel-body");
    body.innerHTML =
      '<div class="panel-lockicon">\ud83d\udd10</div>' +
      '<h3>Espace administrateur</h3>' +
      '<p class="panel-muted">Connecte-toi avec ton adresse mail et ton mot de passe.</p>' +
      '<input id="admin-mail" type="email" value="obinono444@gmail.com" autocomplete="off">' +
      '<input id="admin-pass" type="password" placeholder="Mot de passe admin" autocomplete="off">' +
      '<button id="admin-go" class="panel-btn primary">Se connecter</button>' +
      '<p id="admin-err" class="lock-err"></p>';
    var mail = body.querySelector("#admin-mail"), pass = body.querySelector("#admin-pass");
    pass.focus();
    body.querySelector("#admin-go").addEventListener("click", function () { checkAuth(mail.value, pass.value); });
    pass.addEventListener("keydown", function (e) { if (e.key === "Enter") checkAuth(mail.value, pass.value); });
  }

  function checkAuth(mail, pass) {
    if (Date.now() < state.cooldownUntil) {
      panel.querySelector("#admin-err").textContent = "Trop d'essais. Patiente " + Math.ceil((state.cooldownUntil - Date.now()) / 1000) + "s.";
      return;
    }
    if (mailHash(mail) === state.emailHash && hash(pass) === state.passHash) {
      state.attempts = 0;
      save();
      toast("\u2705 Bienvenue, administrateur !");
      showDashboard();
    } else {
      state.attempts++;
      if (state.attempts >= 5) state.cooldownUntil = Date.now() + 30000;
      save();
      panel.querySelector("#admin-err").textContent = state.attempts >= 5 ? "\ud83d\udeab Trop d'essais. Pause de 30 s." : "\u274c Mail ou mot de passe incorrect (" + state.attempts + "/5)";
    }
  }

  /* ---------- Tableau de bord ---------- */
  function dashboardBody() {
    var s = stats();
    return '<div class="panel-me">' +
      '<span class="panel-avatar">\ud83d\udc51</span>' +
      '<div class="panel-me-txt"><strong>Administrateur</strong><em>acc\u00e8s v\u00e9rifi\u00e9 par mail \u2705</em></div>' +
      '</div>' +
      '<div class="panel-state">' +
      '<span class="state-badge ' + (state.closed ? "off" : "on") + '">' + (state.closed ? "\ud83d\udd34 Site ferm\u00e9" : "\ud83d\udfe2 Site ouvert") + '</span>' +
      '<button id="admin-toggle" class="panel-btn ' + (state.closed ? "" : "danger") + '">' + (state.closed ? "\ud83d\udd13 Rouvrir le site aux visiteurs" : "\ud83d\udeaa Fermer le site (mode maintenance)") + '</button>' +
      '</div>' +
      '<div class="panel-section">' +
      '<h4>\ud83d\udcdd Message affich\u00e9 aux visiteurs</h4>' +
      '<textarea id="admin-msg" rows="2" placeholder="Le site est en maintenance, revenez bient\u00f4t !">' + esc(state.message || "") + '</textarea>' +
      '<button id="admin-msg-save" class="panel-btn">Enregistrer le message</button>' +
      '</div>' +
      '<div class="panel-section">' +
      '<h4>\ud83d\udcca Statistiques de ce navigateur</h4>' +
      '<div class="panel-stats">' +
      '<span>\ud83d\udcd6 ' + s.done + ' le\u00e7ons finies</span>' +
      '<span>\u2b50 ' + s.xp + ' XP</span>' +
      '<span>\ud83d\udd25 ' + s.streak + ' jours de suite</span>' +
      '</div>' +
      '</div>' +
      '<div class="panel-section">' +
      '<h4>\ud83d\udd11 Changer le mot de passe</h4>' +
      '<input id="admin-new1" type="password" placeholder="Nouveau mot de passe">' +
      '<input id="admin-new2" type="password" placeholder="Confirmer">' +
      '<button id="admin-pass-save" class="panel-btn">Mettre \u00e0 jour</button>' +
      '</div>' +
      '<div class="panel-section danger-zone">' +
      '<h4>\u26a0\ufe0f Zone dangereuse</h4>' +
      '<button id="admin-reset-progress" class="panel-btn danger">R\u00e9initialiser toute la progression</button>' +
      '</div>' +
      '<div class="panel-section">' +
      '<h4>\u2139\ufe0f Port\u00e9e du verrou</h4>' +
      '<p class="panel-muted">Ce verrou fonctionne sur ce navigateur, sans serveur. Pour fermer le site <strong>pour tout le monde</strong> : GitHub \u2192 ton d\u00e9p\u00f4t \u2192 Settings \u2192 Pages \u2192 d\u00e9sactiver (ou rendre le d\u00e9p\u00f4t priv\u00e9).</p>' +
      '</div>';
  }

  function bindDashboard(body) {
    body.querySelector("#admin-toggle").addEventListener("click", function () {
      if (state.closed) {
        state.closed = false;
        save();
        if (lockEl) { lockEl.remove(); lockEl = null; }
        location.reload();
      } else {
        state.message = body.querySelector("#admin-msg").value.trim() || state.message;
        state.closed = true;
        save();
        toast("\ud83d\udeaa Site ferm\u00e9 aux visiteurs");
        closePanel();
        renderLock();
      }
    });

    body.querySelector("#admin-msg-save").addEventListener("click", function () {
      state.message = body.querySelector("#admin-msg").value.trim();
      save();
      flash(this, "Enregistr\u00e9 \u2713");
      toast("\ud83d\udcdd Message du verrou enregistr\u00e9");
    });

    body.querySelector("#admin-pass-save").addEventListener("click", function () {
      var n1 = body.querySelector("#admin-new1").value, n2 = body.querySelector("#admin-new2").value;
      if ((n1 || "").length < 4) { flash(this, "Trop court \u2717"); return; }
      if (n1 !== n2) { flash(this, "Pas identiques \u2717"); return; }
      state.passHash = hash(n1);
      save();
      body.querySelector("#admin-new1").value = "";
      body.querySelector("#admin-new2").value = "";
      flash(this, "Mot de passe \u00e0 jour \u2713");
      toast("\ud83d\udd11 Mot de passe mis \u00e0 jour");
    });

    body.querySelector("#admin-reset-progress").addEventListener("click", function () {
      if (this.dataset.confirm !== "1") {
        this.dataset.confirm = "1";
        this.textContent = "S\u00fbr ? Clique encore pour tout effacer \u26a0\ufe0f";
        return;
      }
      try {
        ["codelearn-progress-v1", "codelearn-stats-v1", "codelearn-drafts-v1"].forEach(function (k) { localStorage.removeItem(k); });
      } catch (e) {}
      location.reload();
    });
  }

  function showDashboard() {
    var body = panel.querySelector("#panel-body");
    body.innerHTML = dashboardBody();
    bindDashboard(body);
  }

  function flash(btn, t) {
    var old = btn.textContent;
    btn.textContent = t;
    setTimeout(function () { btn.textContent = old; }, 1400);
  }

  /* ---------- Squelette du panneau ---------- */
  function buildPanel() {
    if (panel) return;
    panel = document.createElement("aside");
    panel.id = "admin-panel";
    panel.setAttribute("aria-label", "Panneau administration");
    panel.innerHTML =
      '<div class="panel-head">' +
      '<span class="panel-logo">\ud83d\udd10 Admin</span>' +
      '<button id="admin-close" class="ai-close" aria-label="Fermer">\u00d7</button>' +
      '</div>' +
      '<div class="panel-body" id="panel-body"></div>';
    document.body.appendChild(panel);
    panel.querySelector("#admin-close").addEventListener("click", closePanel);
  }

  function openWithAnim() {
    panel.classList.add("open");
    var body = panel.querySelector("#panel-body");
    if (body) body.querySelectorAll(".panel-section, .panel-state, .panel-me").forEach(function (sec, i) {
      sec.style.animation = "fadeUp 0.35s ease backwards " + (i * 0.06) + "s";
    });
  }

  function closePanel() {
    if (!panel) return;
    panel.classList.remove("open");
  }

  function onHashChange() {
    if (state.closed) renderLock();
  }

  load();

  var secretBuf = "";
  function isTyping(e) {
    var t = e.target;
    return t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
  }

  document.addEventListener("keydown", function (e) {
    if (state.closed) return;
    var combo = e.ctrlKey && e.altKey && (e.code === "KeyA" || e.key === "a" || e.key === "A");
    if (combo) {
      e.preventDefault();
      openPanel();
      return;
    }
    if (e.ctrlKey || e.altKey || e.metaKey || isTyping(e) || e.key.length !== 1) return;
    if (!panel || !panel.classList.contains("open")) {
      secretBuf = (secretBuf + e.key.toLowerCase()).slice(-5);
      if (secretBuf === "admin") {
        secretBuf = "";
        openPanel();
      }
    }
  });

  window.addEventListener("hashchange", onHashChange);

  if (state.closed) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () { setTimeout(renderLock, 50); });
    } else {
      setTimeout(renderLock, 50);
    }
  }

  return { open: openPanel, close: closePanel, isClosed: function () { return state.closed; } };
})();
