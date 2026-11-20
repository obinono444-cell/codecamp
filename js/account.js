/* CodeCamp — Comptes visiteurs : inscription, connexion, profil, niveaux, XP */
window.CodeCampAccount = (function () {
  "use strict";

  var ACC_KEY = "codecamp-accounts-v1";
  var SESS_KEY = "codecamp-user-sess";
  var modal = null, drop = null;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function hash(str) {
    var a = 5381, b = 52711, salt = "codecamp::user::";
    var s = salt + String(str) + salt;
    for (var r = 0; r < 256; r++) {
      for (var i = 0; i < s.length; i++) {
        a = ((a << 5) + a + s.charCodeAt(i) + r) >>> 0;
        b = ((b << 5) ^ b ^ s.charCodeAt(i) * (i + 7)) >>> 0;
      }
      s = a.toString(36) + b.toString(36);
    }
    return "h" + a.toString(36) + "_" + b.toString(36);
  }

  function accounts() {
    try { return JSON.parse(localStorage.getItem(ACC_KEY) || "{}"); } catch (e) { return {}; }
  }

  function saveAccounts(a) {
    try { localStorage.setItem(ACC_KEY, JSON.stringify(a)); } catch (e) {}
  }

  function current() {
    try {
      var p = sessionStorage.getItem(SESS_KEY);
      if (!p) return null;
      return JSON.parse(p);
    } catch (e) { return null; }
  }

  function setCurrent(user) {
    try {
      if (user) sessionStorage.setItem(SESS_KEY, JSON.stringify(user));
      else sessionStorage.removeItem(SESS_KEY);
    } catch (e) {}
  }

  function stats() {
    try { return JSON.parse(localStorage.getItem("codelearn-stats-v1") || "{}"); } catch (e) { return {}; }
  }

  function doneCount() {
    try { return Object.keys(JSON.parse(localStorage.getItem("codelearn-progress-v1") || "{}")).length; } catch (e) { return 0; }
  }

  function quizBest() {
    try { return Number(JSON.parse(localStorage.getItem("codecamp-quiz-best-v1") || "0")) || 0; } catch (e) { return 0; }
  }

  function levelOf(xp) {
    if (xp >= 800) return { name: "Légende", icon: "🐉", color: "#ff7043" };
    if (xp >= 400) return { name: "Expert", icon: "🦅", color: "#e3b341" };
    if (xp >= 150) return { name: "Codeur", icon: "🚀", color: "#39c5cf" };
    if (xp >= 50) return { name: "Apprenti", icon: "🌱", color: "#3fd96a" };
    return { name: "Débutant", icon: "🐣", color: "#9cc0ff" };
  }

  function nextThreshold(xp) {
    if (xp >= 800) return null;
    if (xp >= 400) return 800;
    if (xp >= 150) return 400;
    if (xp >= 50) return 150;
    return 50;
  }

  /* ---------- Éléments de la topbar ---------- */
  function renderButton() {
    var host = document.querySelector(".topbar-right");
    if (!host) return;
    if (drop) { drop.remove(); drop = null; }
    var old = document.getElementById("account-btn");
    if (old) old.remove();
    var user = current();
    var btn = document.createElement("button");
    btn.id = "account-btn";
    btn.className = "account-btn";
    if (user) {
      var lv = levelOf(stats().xp || 0);
      btn.innerHTML = '<span class="acc-avatar">' + esc(user.avatar) + '</span><span class="acc-name">' + esc(user.pseudo) + '</span>';
    } else {
      btn.innerHTML = '<span class="acc-avatar">👤</span><span class="acc-name">Se connecter</span>';
    }
    host.insertBefore(btn, host.firstChild);
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (current()) toggleDrop();
      else openModal("login");
    });
    if (user) buildDrop(user);
  }

  function buildDrop(user) {
    var st = stats();
    var lv = levelOf(st.xp || 0);
    var nx = nextThreshold(st.xp || 0);
    drop = document.createElement("div");
    drop.id = "account-drop";
    drop.innerHTML =
      '<div class="drop-head">' +
      '<span class="drop-avatar">' + esc(user.avatar) + '</span>' +
      '<div><strong>' + esc(user.pseudo) + '</strong>' +
      '<em style="color:' + lv.color + '">' + lv.icon + ' ' + lv.name + '</em></div>' +
      '</div>' +
      '<div class="drop-xp">⭐ ' + (st.xp || 0) + ' XP' + (nx ? ' · encore ' + Math.max(0, nx - (st.xp || 0)) + ' XP avant ' + levelOf(nx).name : ' · niveau max !') + '</div>' +
      '<div class="drop-stats">' +
      '<span>📖 ' + doneCount() + ' leçons</span>' +
      '<span>🏆 ' + quizBest() + ' pts au quiz</span>' +
      '<span>🔥 ' + (st.streak || 0) + ' jour(s)</span>' +
      '</div>' +
      '<div class="drop-avatars">' +
      '<span class="drop-avatars-t">Choisis ton avatar :</span>' +
      '<div class="drop-avatar-row">' +
      ["🐱", "🦊", "🐸", "🐼", "🦄", "🐙", "🤖", "👾"].map(function (a) {
        return '<button class="av" data-av="' + a + '">' + a + '</button>';
      }).join("") +
      '</div></div>' +
      '<button class="drop-btn" id="drop-pass">🔑 Changer de mot de passe</button>' +
      '<button class="drop-btn danger" id="drop-logout">🚪 Se déconnecter</button>';
    document.body.appendChild(drop);
    drop.addEventListener("click", function (e) { e.stopPropagation(); });
    drop.querySelectorAll(".av").forEach(function (b) {
      b.classList.toggle("sel", b.dataset.av === user.avatar);
      b.addEventListener("click", function () {
        updateUser(user.pseudo, { avatar: b.dataset.av });
        renderButton();
        toast("🎨 Avatar mis à jour !");
      });
    });
    drop.querySelector("#drop-pass").addEventListener("click", function () {
      toggleDrop();
      openModal("pass");
    });
    drop.querySelector("#drop-logout").addEventListener("click", function () {
      setCurrent(null);
      renderButton();
      toast("👋 À bientôt, " + user.pseudo + " !");
    });
  }

  function updateUser(pseudo, patch) {
    var a = accounts();
    if (a[pseudo]) {
      Object.assign(a[pseudo], patch);
      saveAccounts(a);
      var u = current();
      if (u && u.pseudo === pseudo) setCurrent(Object.assign(u, patch));
    }
  }

  function toggleDrop() {
    if (!drop) return;
    var c = drop.classList.toggle("show");
    if (!c) return;
    document.addEventListener("click", closeOnOutside);
  }

  function closeOnOutside() {
    if (drop) drop.classList.remove("show");
    document.removeEventListener("click", closeOnOutside);
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

  /* ---------- Modale connexion / inscription ---------- */
  function openModal(mode) {
    closeModal();
    modal = document.createElement("div");
    modal.id = "account-modal";
    modal.innerHTML =
      '<div class="acc-overlay"></div>' +
      '<div class="acc-card pop-card">' +
      '<button class="ai-close acc-close" aria-label="Fermer">×</button>' +
      '<div class="acc-icon">🧑‍🚀</div>' +
      '<div class="acc-tabs">' +
      '<button class="acc-tab' + (mode !== "signup" ? " on" : "") + '" data-mode="login">Se connecter</button>' +
      '<button class="acc-tab' + (mode === "signup" ? " on" : "") + '" data-mode="signup">S\'inscrire</button>' +
      '</div>' +
      '<div class="acc-body" id="acc-body"></div>' +
      '</div>';
    document.body.appendChild(modal);
    modal.querySelector(".acc-overlay").addEventListener("click", closeModal);
    modal.querySelector(".acc-close").addEventListener("click", closeModal);
    modal.querySelectorAll(".acc-tab").forEach(function (t) {
      t.addEventListener("click", function () { openModal(t.dataset.mode); });
    });
    showForm(mode === "signup" ? formSignup : formLogin);
  }

  function closeModal() {
    if (modal) { modal.remove(); modal = null; }
  }

  function showForm(html) {
    var body = modal.querySelector("#acc-body");
    body.innerHTML = html;
    var first = body.querySelector("input");
    if (first) setTimeout(function () { first.focus(); }, 150);
    var btn = body.querySelector("button[type=submit]");
    if (btn) btn.addEventListener("click", btn.dataset.act === "login" ? tryLogin : btn.dataset.act === "signup" ? trySignup : tryPass);
  }

  function formLogin() {
    return '<input id="acc-pseudo" placeholder="Ton pseudo" autocomplete="username">' +
      '<input id="acc-pass" type="password" placeholder="Ton mot de passe" autocomplete="current-password">' +
      '<p id="acc-err" class="lock-err"></p>' +
      '<button type="submit" data-act="login" class="panel-btn primary">Se connecter ⚡</button>' +
      '<p class="panel-muted">Pas encore de compte ? Clique « S\'inscrire » ci-dessus ✨</p>';
  }

  function formSignup() {
    return '<input id="acc-pseudo" placeholder="Choisis un pseudo" autocomplete="username">' +
      '<input id="acc-pass" type="password" placeholder="Mot de passe (4 caractères min.)" autocomplete="new-password">' +
      '<input id="acc-pass2" type="password" placeholder="Confirme le mot de passe" autocomplete="new-password">' +
      '<p id="acc-err" class="lock-err"></p>' +
      '<button type="submit" data-act="signup" class="panel-btn primary">Créer mon compte 🚀</button>' +
      '<p class="panel-muted">Ton compte reste dans ce navigateur, en privé. Personne d\'autre ne le voit.</p>';
  }

  function formPass() {
    return '<input id="acc-old" type="password" placeholder="Mot de passe actuel">' +
      '<input id="acc-new" type="password" placeholder="Nouveau mot de passe (4 min.)">' +
      '<input id="acc-new2" type="password" placeholder="Confirme le nouveau">' +
      '<p id="acc-err" class="lock-err"></p>' +
      '<button type="submit" data-act="pass" class="panel-btn primary">Mettre à jour 🔑</button>';
  }

  function tryLogin() {
    var body = modal.querySelector("#acc-body");
    var pseudo = (body.querySelector("#acc-pseudo").value || "").trim();
    var pass = body.querySelector("#acc-pass").value || "";
    var a = accounts();
    if (!a[pseudo]) return err("❌ Ce pseudo n'existe pas. Inscris-toi d'abord !");
    if (a[pseudo].pass !== hash(pass)) return err("❌ Mot de passe incorrect.");
    setCurrent({ pseudo: pseudo, avatar: a[pseudo].avatar || "🐱" });
    closeModal();
    renderButton();
    levelUpCheck(pseudo);
    toast("⚡ Bon retour, " + pseudo + " !");
  }

  function trySignup() {
    var body = modal.querySelector("#acc-body");
    var pseudo = (body.querySelector("#acc-pseudo").value || "").trim();
    var pass = body.querySelector("#acc-pass").value || "";
    var pass2 = body.querySelector("#acc-pass2").value || "";
    if (pseudo.length < 2) return err("❌ Pseudo : au moins 2 caractères.");
    if (/\s/.test(pseudo)) return err("❌ Pas d'espaces dans le pseudo.");
    if (pass.length < 4) return err("❌ Mot de passe : 4 caractères minimum.");
    if (pass !== pass2) return err("❌ Les deux mots de passe ne sont pas identiques.");
    var a = accounts();
    if (a[pseudo]) return err("❌ Ce pseudo est déjà pris.");
    a[pseudo] = { pass: hash(pass), avatar: "🐱", created: Date.now() };
    saveAccounts(a);
    setCurrent({ pseudo: pseudo, avatar: "🐱" });
    closeModal();
    renderButton();
    toast("🎉 Compte créé — bienvenue " + pseudo + " !");
    window.CodeCampUI && window.CodeCampUI.spawnConfetti && window.CodeCampUI.spawnConfetti();
  }

  function tryPass() {
    var body = modal.querySelector("#acc-body");
    var old = body.querySelector("#acc-old").value || "";
    var n1 = body.querySelector("#acc-new").value || "";
    var n2 = body.querySelector("#acc-new2").value || "";
    var user = current();
    var a = accounts();
    if (!user || !a[user.pseudo]) return err("❌ Connecte-toi d'abord.");
    if (a[user.pseudo].pass !== hash(old)) return err("❌ Mot de passe actuel incorrect.");
    if (n1.length < 4) return err("❌ Nouveau mot de passe : 4 caractères minimum.");
    if (n1 !== n2) return err("❌ Les deux mots de passe ne sont pas identiques.");
    a[user.pseudo].pass = hash(n1);
    saveAccounts(a);
    closeModal();
    toast("🔑 Mot de passe mis à jour !");
  }

  function levelUpCheck(pseudo) {
    var a = accounts();
    if (a[pseudo] && !a[pseudo].lvl) {
      a[pseudo].lvl = true;
      saveAccounts(a);
    }
  }

  function err(msg) {
    modal.querySelector("#acc-err").textContent = msg;
    var card = modal.querySelector(".acc-card");
    card.classList.remove("shake");
    void card.offsetWidth;
    card.classList.add("shake");
  }

  window.addEventListener("codecamp-xp", renderButton);

  document.addEventListener("DOMContentLoaded", function () {
    renderButton();
    window.CodeCampUI = window.CodeCampUI || {};
  });

  document.addEventListener("pointerdown", function (e) {
    var b = e.target.closest("#account-btn");
    var d = e.target.closest("#account-drop");
    if (!b && !d && drop && drop.classList.contains("show")) {
      drop.classList.remove("show");
    }
  });

  return { open: function () { openModal(current() ? "pass" : "login"); }, renderButton: renderButton, levelOf: levelOf };
})();
