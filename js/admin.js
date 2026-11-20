/* CodeCamp — Panneau Admin : session admin, fermer/rouvrir le site, aperçu, journal, sauvegarde */
window.CodeCampAdmin = (function () {
  "use strict";

  var KEY = "codecamp-admin-v1";
  var SESS = "codecamp-admin-sess";
  var ANNOUNCE_SESS = "codecamp-announce-dismissed";
  var ADMIN_MAIL = "obinono444@gmail.com";
  var state = { emailHash: null, passHash: null, closed: false, message: "", attempts: 0, cooldownUntil: 0, announce: "", announceOn: false, closedAt: null, log: [] };
  var panel = null, lockEl = null, maintBar = null, sinceTimer = null;

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

  function sessionActive() {
    try { return sessionStorage.getItem(SESS) === "1"; } catch (e) { return false; }
  }

  function setSession() {
    try { sessionStorage.setItem(SESS, "1"); } catch (e) {}
  }

  function fmtDate(t) {
    var d = new Date(t);
    return d.toLocaleDateString("fr-FR") + " " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }

  function logEvent(label) {
    state.log = state.log || [];
    state.log.unshift(label + " · " + fmtDate(Date.now()));
    state.log = state.log.slice(0, 8);
    save();
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

  /* ---------- Annonce pour les visiteurs ---------- */
  function renderAnnounce() {
    var old = document.getElementById("announce-bar");
    if (old) old.remove();
    if (!state.announceOn || !state.announce || state.closed) return;
    try { if (sessionStorage.getItem(ANNOUNCE_SESS) === state.announce) return; } catch (e) {}
    var bar = document.createElement("div");
    bar.id = "announce-bar";
    bar.innerHTML =
      '<span class="announce-txt">📢 ' + esc(state.announce) + '</span>' +
      '<button id="announce-hide" aria-label="Masquer l\u2019annonce">×</button>';
    document.body.insertBefore(bar, document.body.firstChild);
    bar.querySelector("#announce-hide").addEventListener("click", function () {
      try { sessionStorage.setItem(ANNOUNCE_SESS, state.announce); } catch (e) {}
      bar.classList.add("announce-out");
      setTimeout(function () { bar.remove(); }, 320);
    });
  }

  /* ---------- Écran de fermeture (ce que voient les visiteurs) ---------- */
  function renderLock(preview) {
    if (lockEl) { lockEl.hidden = false; return; }
    lockEl = document.createElement("div");
    lockEl.id = "lock-screen";
    if (preview) lockEl.classList.add("is-preview");
    lockEl.innerHTML =
      '<div class="lock-preview-bar" hidden>' +
      '<span>👀 Aperçu — voici exactement ce que voient tes visiteurs</span>' +
      '<button id="lock-preview-close">Quitter l\u2019aperçu</button>' +
      '</div>' +
      '<div class="lock-bg" aria-hidden="true"><span>t</span><span>0</span><span>1</span><span>1</span><span>0</span><span>1</span><span>{}</span><span>&lt;/&gt;</span><span>;</span><span>**</span><span>==</span><span>[]</span></div>' +
      '<div class="lock-card">' +
      '<div class="lock-icon">🔒</div>' +
      '<h1>CodeCamp est fermé</h1>' +
      '<p id="lock-msg">' + esc(state.message || "Le site est momentanément en maintenance. Reviens plus tard !") + '</p>' +
      (state.closedAt ? '<p class="lock-since">⏱ Fermé depuis <span id="lock-since-t"></span></p>' : '') +
      '<div class="lock-auth col">' +
      '<input id="lock-mail" type="email" placeholder="Adresse mail admin" autocomplete="off">' +
      '<input id="lock-pass" type="password" placeholder="Mot de passe admin" autocomplete="off">' +
      '<button id="lock-unlock">Déverrouiller</button>' +
      '</div>' +
      '<p id="lock-err" class="lock-err" role="alert"></p>' +
      '<p class="lock-foot">Accès réservé à l\u2019administrateur · CodeCamp</p>' +
      '</div>';
    document.body.appendChild(lockEl);
    if (preview) {
      var pbar = lockEl.querySelector(".lock-preview-bar");
      pbar.hidden = false;
      requestAnimationFrame(function () { pbar.classList.add("show"); });
      lockEl.querySelector("#lock-preview-close").addEventListener("click", closePreview);
    }

    if (state.closedAt && !preview) {
      var upd = function () {
        var el = lockEl && lockEl.querySelector("#lock-since-t");
        if (!el) return;
        var s = Math.max(0, Math.floor((Date.now() - state.closedAt) / 1000));
        var min = Math.floor(s / 60), h = Math.floor(min / 60);
        el.textContent = h > 0 ? h + " h " + (min % 60) + " min" : (min > 0 ? min + " min" : s + " s");
      };
      upd();
      sinceTimer = setInterval(upd, 15000);
    }

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
        setSession();
        if (preview) {
          toast("✅ Identifiants corrects (aperçu)");
          closePreview();
          return;
        }
        state.closed = false;
        state.closedAt = null;
        state.attempts = 0;
        logEvent("🔓 Site rouvert");
        save();
        if (lockEl) { lockEl.remove(); lockEl = null; if (sinceTimer) clearInterval(sinceTimer); }
        location.reload();
      } else {
        if (preview) { lockErr("❌ Mail ou mot de passe incorrect"); shake(); return; }
        state.attempts++;
        if (state.attempts >= 5) state.cooldownUntil = Date.now() + 30000;
        save();
        lockErr(state.attempts >= 5
          ? "🚫 Trop d'essais. Nouvelle tentative dans 30 s."
          : "❌ Mail ou mot de passe incorrect (" + state.attempts + "/5)");
        pass.value = "";
        shake();
      }
    }

    function shake() {
      var card = lockEl.querySelector(".lock-card");
      card.classList.remove("shake");
      void card.offsetWidth;
      card.classList.add("shake");
    }

    function lockErr(t) {
      lockEl.querySelector("#lock-err").textContent = t;
    }
  }

  function closePreview() {
    if (lockEl) { lockEl.remove(); lockEl = null; }
    if (sinceTimer) { clearInterval(sinceTimer); sinceTimer = null; }
  }

  /* ---------- Barre de maintenance (visible par l'admin connecté) ---------- */
  function renderMaintBar() {
    if (maintBar) return;
    maintBar = document.createElement("div");
    maintBar.id = "maint-bar";
    maintBar.innerHTML =
      '<span class="maint-dot"></span>' +
      '<span class="maint-txt">🚧 Mode maintenance actif — les visiteurs voient l\u2019écran de fermeture</span>' +
      '<span class="maint-actions">' +
      '<button id="maint-preview">👀 Aperçu visiteur</button>' +
      '<button id="maint-reopen">🔓 Rouvrir</button>' +
      '</span>';
    document.body.appendChild(maintBar);
    requestAnimationFrame(function () { maintBar.classList.add("show"); });
    maintBar.querySelector("#maint-preview").addEventListener("click", function () { renderLock(true); });
    maintBar.querySelector("#maint-reopen").addEventListener("click", function () {
      state.closed = false;
      state.closedAt = null;
      logEvent("🔓 Site rouvert");
      save();
      removeMaintBar();
      location.reload();
    });
  }

  function removeMaintBar() {
    if (maintBar) { maintBar.remove(); maintBar = null; }
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
      '<div class="panel-lockicon">🛡️</div>' +
      '<h3>Créer ton compte admin</h3>' +
      '<p class="panel-muted">Seule <strong>ton adresse mail + ton mot de passe</strong> donneront accès à ce panneau. Note-les bien !</p>' +
      '<input id="admin-mail" type="email" value="' + esc(ADMIN_MAIL) + '" readonly title="Adresse admin fixe">' +
      '<input id="admin-p1" type="password" placeholder="Mot de passe (4 caractères min.)">' +
      '<input id="admin-p2" type="password" placeholder="Confirme le mot de passe">' +
      '<button id="admin-set" class="panel-btn primary">Créer mon compte admin</button>' +
      '<p id="admin-err" class="lock-err"></p>';
    var mail = body.querySelector("#admin-mail"), p1 = body.querySelector("#admin-p1"), p2 = body.querySelector("#admin-p2");
    body.querySelector("#admin-set").addEventListener("click", function () {
      var m = (mail.value || "").trim();
      if (mailHash(m) !== mailHash(ADMIN_MAIL)) { body.querySelector("#admin-err").textContent = "❌ Seule l'adresse " + ADMIN_MAIL + " est admin."; return; }
      if ((p1.value || "").length < 4) { body.querySelector("#admin-err").textContent = "❌ Mot de passe : 4 caractères minimum."; return; }
      if (p1.value !== p2.value) { body.querySelector("#admin-err").textContent = "❌ Les deux mots de passe ne sont pas identiques."; return; }
      state.emailHash = mailHash(m);
      state.passHash = hash(p1.value);
      setSession();
      save();
      logEvent("👑 Compte admin créé");
      toast("🔐 Compte admin créé pour " + m);
      grantAccess();
    });
    mail.focus();
  }

  function showLinkMail() {
    var body = panel.querySelector("#panel-body");
    body.innerHTML =
      '<div class="panel-lockicon">📬</div>' +
      '<h3>Ajoute ton adresse mail admin</h3>' +
      '<p class="panel-muted">Tu avais déjà un mot de passe : associe maintenant ton adresse mail pour te connecter.</p>' +
      '<input id="admin-mail" type="email" value="' + esc(ADMIN_MAIL) + '" readonly title="Adresse admin fixe">' +
      '<button id="admin-link" class="panel-btn primary">Associer mon adresse</button>' +
      '<p id="admin-err" class="lock-err"></p>';
    var mail = body.querySelector("#admin-mail");
    body.querySelector("#admin-link").addEventListener("click", function () {
      var m = (mail.value || "").trim();
      if (!/^\S+@\S+\.\S+$/.test(m)) { body.querySelector("#admin-err").textContent = "❌ Adresse mail invalide."; return; }
      state.emailHash = mailHash(m);
      setSession();
      save();
      toast("📬 Adresse associée !");
      grantAccess();
    });
    mail.focus();
  }

  function showAuth() {
    var body = panel.querySelector("#panel-body");
    body.innerHTML =
      '<div class="panel-lockicon">🔐</div>' +
      '<h3>Espace administrateur</h3>' +
      '<p class="panel-muted">Connecte-toi avec ton adresse mail et ton mot de passe.</p>' +
      '<input id="admin-mail" type="email" value="' + esc(ADMIN_MAIL) + '" autocomplete="off">' +
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
      setSession();
      save();
      toast("✅ Bienvenue, administrateur !");
      grantAccess();
    } else {
      state.attempts++;
      if (state.attempts >= 5) state.cooldownUntil = Date.now() + 30000;
      save();
      panel.querySelector("#admin-err").textContent = state.attempts >= 5 ? "🚫 Trop d'essais. Pause de 30 s." : "❌ Mail ou mot de passe incorrect (" + state.attempts + "/5)";
    }
  }

  /* ---------- Animation d'accès hacker ---------- */
  function grantAccess() {
    var body = panel.querySelector("#panel-body");
    body.innerHTML =
      '<div class="grant">' +
      '<div class="grant-icon">🔓</div>' +
      '<div class="grant-lines" id="grant-lines"></div>' +
      '<div class="grant-bar"><span></span></div>' +
      '<div class="grant-ok" id="grant-ok">ACCÈS AUTORISÉ</div>' +
      '</div>';
    var linesEl = body.querySelector("#grant-lines");
    var lines = [
      "> vérification des identifiants…",
      "> empreinte mail : OK ✓",
      "> clé de session : OK ✓",
      "> ouverture du tableau de bord…"
    ];
    var li = 0;
    (function typeLine() {
      if (li >= lines.length) { finish(); return; }
      var line = document.createElement("div");
      line.className = "grant-line";
      linesEl.appendChild(line);
      var text = lines[li];
      var c = 0;
      var iv = setInterval(function () {
        line.textContent = text.slice(0, ++c);
        if (c >= text.length) {
          clearInterval(iv);
          li++;
          setTimeout(typeLine, 90);
        }
      }, 9);
    })();

    function finish() {
      body.querySelector(".grant-bar").classList.add("run");
      var okEl = body.querySelector("#grant-ok");
      okEl.classList.add("show");
      setTimeout(showDashboard, 850);
    }
  }

  /* ---------- Tableau de bord ---------- */
  function dashboardBody() {
    var s = stats();
    var logHtml = "";
    if (state.log && state.log.length) {
      logHtml = state.log.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("");
      logHtml = '<ul class="log-list">' + logHtml + '</ul>';
    } else {
      logHtml = '<p class="panel-muted">Aucune activité pour l\u2019instant. Les actions importantes s\u2019afficheront ici.</p>';
    }
    return '<div class="panel-me">' +
      '<span class="panel-avatar">👑</span>' +
      '<div class="panel-me-txt"><strong>Administrateur</strong><em>accès vérifié par mail ✅</em></div>' +
      '</div>' +
      '<div class="panel-state">' +
      '<span class="state-badge ' + (state.closed ? "off" : "on") + '">' + (state.closed ? "🔴 Site fermé" : "🟢 Site ouvert") + '</span>' +
      '<button id="admin-toggle" class="panel-btn ' + (state.closed ? "" : "danger") + '">' + (state.closed ? "🔓 Rouvrir le site aux visiteurs" : "🚪 Fermer le site (mode maintenance)") + '</button>' +
      '<button id="admin-preview" class="panel-btn ghost">👀 Aperçu de l\u2019écran de fermeture</button>' +
      '</div>' +
      '<div class="panel-section">' +
      '<h4>📝 Message affiché aux visiteurs</h4>' +
      '<textarea id="admin-msg" rows="2" placeholder="Le site est en maintenance, revenez bientôt !">' + esc(state.message || "") + '</textarea>' +
      '<button id="admin-msg-save" class="panel-btn">Enregistrer le message</button>' +
      '</div>' +
      '<div class="panel-section">' +
      '<h4>📢 Annonce pour les visiteurs</h4>' +
      '<textarea id="admin-announce" rows="2" placeholder="Ex. : Nouvelle leçon JavaScript dispo !">' + esc(state.announce || "") + '</textarea>' +
      '<button id="admin-announce-show" class="panel-btn primary">Afficher l\u2019annonce</button>' +
      '<button id="admin-announce-hide" class="panel-btn">Masquer l\u2019annonce</button>' +
      '</div>' +
      '<div class="panel-section">' +
      '<h4>🗓 Journal d\u2019activité</h4>' +
      logHtml +
      '</div>' +
      '<div class="panel-section">' +
      '<h4>📊 Statistiques de ce navigateur</h4>' +
      '<div class="panel-stats">' +
      '<span>📖 ' + s.done + ' leçons finies</span>' +
      '<span>⭐ ' + s.xp + ' XP</span>' +
      '<span>🔥 ' + s.streak + ' jours de suite</span>' +
      '</div>' +
      '</div>' +
      '<div class="panel-section">' +
      '<h4>💾 Sauvegarde de la progression</h4>' +
      '<button id="admin-export" class="panel-btn">⬇️ Exporter la progression (fichier)</button>' +
      '<button id="admin-import" class="panel-btn">⬆️ Restaurer une sauvegarde</button>' +
      '<input id="admin-import-file" type="file" accept="application/json" hidden>' +
      '</div>' +
      '<div class="panel-section">' +
      '<h4>🔑 Changer le mot de passe</h4>' +
      '<input id="admin-new1" type="password" placeholder="Nouveau mot de passe">' +
      '<input id="admin-new2" type="password" placeholder="Confirmer">' +
      '<button id="admin-pass-save" class="panel-btn">Mettre à jour</button>' +
      '</div>' +
      '<div class="panel-section">' +
      '<h4>🎬 Fermer / rouvrir le site</h4>' +
      '<div class="panel-steps">' +
      '<span>1. Clique sur le bouton rouge « Fermer le site » en haut du panneau.</span>' +
      '<span>2. Une barre 🚧 apparaît : tu navigues encore librement, toi.</span>' +
      '<span>3. « 👀 Aperçu visiteur » te montre l\u2019écran que voient les autres.</span>' +
      '<span>4. « 🔓 Rouvrir » remet le site en ligne pour tout le monde.</span>' +
      '</div>' +
      '</div>' +
      '<div class="panel-section danger-zone">' +
      '<h4>⚠️ Zone dangereuse</h4>' +
      '<button id="admin-reset-progress" class="panel-btn danger">Réinitialiser toute la progression</button>' +
      '</div>' +
      '<div class="panel-section">' +
      '<h4>ℹ️ Portée du verrou</h4>' +
      '<p class="panel-muted">Toi, après connexion, tu restes libre : une barre 🚧 apparaît et tu peux tout rouvrir. Les <strong>autres navigateurs et appareils</strong> voient l\u2019écran de fermeture (le verrou est enregistré dans ce navigateur, sans serveur).</p>' +
      '</div>';
  }

  function bindDashboard(body) {
    body.querySelector("#admin-toggle").addEventListener("click", function () {
      if (state.closed) {
        state.closed = false;
        state.closedAt = null;
        logEvent("🔓 Site rouvert");
        save();
        removeMaintBar();
        closePreview();
        location.reload();
      } else {
        state.message = body.querySelector("#admin-msg").value.trim() || state.message;
        state.announce = body.querySelector("#admin-announce").value.trim() || state.announce;
        state.closed = true;
        state.closedAt = Date.now();
        logEvent("🚪 Site fermé (maintenance)");
        save();
        toast("🚪 Site fermé aux visiteurs");
        closePanel();
        renderAnnounce();
        showDashboard();
        openWithAnim();
        setTimeout(function () { renderLock(true); }, 450);
      }
    });

    body.querySelector("#admin-preview").addEventListener("click", function () {
      if (lockEl) { closePreview(); return; }
      renderLock(true);
    });

    body.querySelector("#admin-msg-save").addEventListener("click", function () {
      state.message = body.querySelector("#admin-msg").value.trim();
      save();
      flash(this, "Enregistré ✓");
      toast("📝 Message du verrou enregistré");
    });

    body.querySelector("#admin-announce-show").addEventListener("click", function () {
      state.announce = body.querySelector("#admin-announce").value.trim();
      if (!state.announce) { flash(this, "Écris d'abord ✏️"); return; }
      state.announceOn = true;
      logEvent("📢 Annonce affichée");
      save();
      renderAnnounce();
      flash(this, "Annonce en ligne ✓");
      toast("📢 Annonce affichée aux visiteurs");
    });

    body.querySelector("#admin-announce-hide").addEventListener("click", function () {
      state.announceOn = false;
      logEvent("📢 Annonce masquée");
      save();
      renderAnnounce();
      flash(this, "Masquée ✓");
      toast("📢 Annonce masquée");
    });

    body.querySelector("#admin-export").addEventListener("click", function () {
      var data = {};
      ["codelearn-progress-v1", "codelearn-stats-v1", "codelearn-drafts-v1"].forEach(function (k) {
        var v = null;
        try { v = localStorage.getItem(k); } catch (e) {}
        if (v != null) data[k] = v;
      });
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "codecamp-sauvegarde-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast("💾 Sauvegarde téléchargée");
    });

    body.querySelector("#admin-import").addEventListener("click", function () {
      body.querySelector("#admin-import-file").click();
    });
    body.querySelector("#admin-import-file").addEventListener("change", function () {
      var f = this.files && this.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(String(reader.result));
          var n = 0;
          ["codelearn-progress-v1", "codelearn-stats-v1", "codelearn-drafts-v1"].forEach(function (k) {
            if (typeof data[k] === "string") { localStorage.setItem(k, data[k]); n++; }
          });
          if (!n) throw new Error("empty");
          toast("⬆️ Sauvegarde restaurée (" + n + " fichier" + (n > 1 ? "s" : "") + ")");
          setTimeout(function () { location.reload(); }, 700);
        } catch (e) {
          toast("❌ Fichier de sauvegarde invalide", false);
        }
      };
      reader.readAsText(f);
    });

    body.querySelector("#admin-pass-save").addEventListener("click", function () {
      var n1 = body.querySelector("#admin-new1").value, n2 = body.querySelector("#admin-new2").value;
      if ((n1 || "").length < 4) { flash(this, "Trop court ✗"); return; }
      if (n1 !== n2) { flash(this, "Pas identiques ✗"); return; }
      state.passHash = hash(n1);
      state.custom = true;
      logEvent("🔑 Mot de passe modifié");
      save();
      body.querySelector("#admin-new1").value = "";
      body.querySelector("#admin-new2").value = "";
      flash(this, "Mot de passe à jour ✓");
      toast("🔑 Mot de passe mis à jour");
    });

    body.querySelector("#admin-reset-progress").addEventListener("click", function () {
      if (this.dataset.confirm !== "1") {
        this.dataset.confirm = "1";
        this.textContent = "Sûr ? Clique encore pour tout effacer ⚠️";
        return;
      }
      try {
        ["codelearn-progress-v1", "codelearn-stats-v1", "codelearn-drafts-v1"].forEach(function (k) { localStorage.removeItem(k); });
      } catch (e) {}
      logEvent("⚠️ Progression réinitialisée");
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
      '<span class="panel-logo">🔐 Admin</span>' +
      '<button id="admin-close" class="ai-close" aria-label="Fermer">×</button>' +
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
    if (state.closed && !sessionActive()) renderLock();
    else if (state.closed && sessionActive()) renderMaintBar();
  }

  load();
  if (!state.custom) {
    state.emailHash = mailHash(ADMIN_MAIL);
    state.passHash = hash("noah159");
    state.attempts = 0;
    state.cooldownUntil = 0;
    save();
  }

  var secretBuf = "";
  function isTyping(e) {
    var t = e.target;
    return t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
  }

  document.addEventListener("keydown", function (e) {
    if (state.closed && !sessionActive()) return;
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

  document.addEventListener("DOMContentLoaded", function () {
    renderAnnounce();
    if (state.closed) {
      if (sessionActive()) setTimeout(renderMaintBar, 80);
      else setTimeout(function () { renderLock(); }, 50);
    }
  });

  if (state.closed && !sessionActive() && document.readyState !== "loading") {
    setTimeout(function () { renderLock(); }, 50);
  }

  return { open: openPanel, close: closePanel, isClosed: function () { return state.closed; } };
})();
