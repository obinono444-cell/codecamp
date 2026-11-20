/* CodeCamp — Quiz arcade : catégories, vies, timer, combo, XP */
window.CodeCampQuiz = (function () {
  "use strict";

  var BEST_KEY = "codecamp-quiz-best-v1";
  var QTIME = 15000;

  var BANK = [
    { cat: "js", q: "Quel mot-clé déclare une variable qui ne change pas ?", options: ["const", "let", "var", "fixed"], answer: 0, exp: "const déclare une constante : sa valeur ne peut pas être réattribuée." },
    { cat: "js", q: "Que vaut typeof 42 ?", options: ["\"int\"", "\"number\"", "\"float\"", "\"digit\""], answer: 1, exp: "En JavaScript, tous les nombres sont de type \"number\"." },
    { cat: "js", q: "Quel symbole marque une ligne de commentaire en JS ?", options: ["<!-- -->", "//", "##", "**"], answer: 1, exp: "// met un commentaire sur une ligne, /* */ sur plusieurs lignes." },
    { cat: "js", q: "Comment écrit-on une fonction fléchée ?", options: ["func() =>", "() => {}", "=> () {}", "lambda ()"], answer: 1, exp: "La syntaxe est : const f = () => { ... }." },
    { cat: "js", q: "Que fait Array.push(x) ?", options: ["Retire x", "Ajoute x à la fin", "Trie le tableau", "Copie le tableau"], answer: 1, exp: "push ajoute un élément à la fin du tableau." },
    { cat: "js", q: "Comment accède-t-on au premier élément de tab ?", options: ["tab(1)", "tab[1]", "tab[0]", "tab.first"], answer: 2, exp: "Les index commencent à 0 : le premier élément est tab[0]." },
    { cat: "js", q: "À quoi sert document.querySelector ?", options: ["À styliser", "À sélectionner un élément", "À créer un serveur", "À charger une image"], answer: 1, exp: "querySelector cherche le premier élément qui correspond au sélecteur CSS." },
    { cat: "js", q: "Que vaut \"5\" + 3 en JavaScript ?", options: ["8", "\"53\"", "erreur", "NaN"], answer: 1, exp: "Avec un + et du texte, JS concatène : \"5\" + 3 = \"53\"." },
    { cat: "html", q: "Quelle balise crée un lien ?", options: ["<link>", "<a>", "<href>", "<url>"], answer: 1, exp: "<a href=\"https://…\">Lien</a> crée un lien cliquable." },
    { cat: "html", q: "Quelle balise affiche une image ?", options: ["<img>", "<image>", "<pic>", "<media>"], answer: 0, exp: "<img src=\"photo.png\" alt=\"texte\"> affiche une image." },
    { cat: "html", q: "Quel attribut contient le texte alternatif d'une image ?", options: ["title", "desc", "alt", "label"], answer: 2, exp: "alt décrit l'image si elle ne peut pas être affichée." },
    { cat: "html", q: "Quelle balise contient le code visible de la page ?", options: ["<head>", "<body>", "<html>", "<main>"], answer: 1, exp: "<body> contient tout ce que l'on voit à l'écran." },
    { cat: "html", q: "Comment crée-t-on un champ de saisie de mot de passe ?", options: ["<input type=\"pwd\">", "<password>", "<input type=\"password\">", "<secret>"], answer: 2, exp: "type=\"password\" masque les caractères saisis." },
    { cat: "html", q: "Quelle balise crée une liste à puces ?", options: ["<ol>", "<ul>", "<li-list>", "<menu>"], answer: 1, exp: "<ul> + <li> font une liste à puces, <ol> une liste numérotée." },
    { cat: "css", q: "Comment cible-t-on la classe .hero ?", options: ["#hero", "hero", ".hero", "*hero"], answer: 2, exp: "Le point cible une classe : .hero { … }. Le # cible un id." },
    { cat: "css", q: "Quelle propriété change la couleur du texte ?", options: ["text-color", "font-color", "color", "color-text"], answer: 2, exp: "La propriété CSS s'appelle color." },
    { cat: "css", q: "À quoi sert display: flex ?", options: ["Rendre visible", "Aligner facilement en ligne/colonne", "Ajouter une ombre", "Masquer l'élément"], answer: 1, exp: "Flexbox aligne et répartit les éléments facilement." },
    { cat: "css", q: "Quelle unité est relative à la taille de la police du parent ?", options: ["px", "em", "vh", "cm"], answer: 1, exp: "em s'adapte à la taille du parent, rem à la racine." },
    { cat: "css", q: "Comment arrondit-on les coins ?", options: ["corner-round", "border-radius", "radius", "round"], answer: 1, exp: "border-radius arrondit les coins d'un élément." },
    { cat: "css", q: "Quelle propriété crée un espace INTERIEUR à un élément ?", options: ["margin", "padding", "gap", "space"], answer: 1, exp: "padding = à l'intérieur, margin = à l'extérieur." },
    { cat: "shell", q: "Quelle commande ouvre le dossier racine du disque C:\ en PowerShell ?", options: ["cd /", "Set-Location C:\\", "open C:", "dir.C"], answer: 1, exp: "Set-Location (alias cd) C:\\ change de dossier vers la racine." },
    { cat: "shell", q: "Quelle commande liste les fichiers d'un dossier en CMD ?", options: ["ls", "dir", "list", "show"], answer: 1, exp: "dir liste les fichiers en CMD. Le ls de Linux existe aussi dans PowerShell." },
    { cat: "shell", q: "Quelle commande vide l'écran du terminal ?", options: ["clean", "wclear", "cls (cmd) / clear (bash)", "erase-screen"], answer: 2, exp: "cls dans CMD/PowerShell, clear dans le monde Unix." },
    { cat: "shell", q: "Comment crée-t-on un dossier en PowerShell ?", options: ["New-Item -ItemType Directory", "folder new", "make dir.bat", "create <dir>"], answer: 0, exp: "New-Item -ItemType Directory monDossier (alias : mkdir)." },
    { cat: "shell", q: "À quoi sert git status ?", options: ["Envoyer le code", "Voir l'état des fichiers modifiés", "Créer un compte", "Supprimer un commit"], answer: 1, exp: "git status affiche les fichiers modifiés et en attente de commit." },
    { cat: "shell", q: "Quel raccourci terminal décrit a = a + 1 en JS ?", options: ["a + 1", "a++", "++1a", "a.add1"], answer: 1, exp: "a++ augmente a de 1 (de même a += 1)." },
    { cat: "js", q: "Comment parcourt-on tous les éléments de tab avec une boucle moderne ?", options: ["tab.each()", "tab.forEach(fn)", "loop(tab)", "for each in tab"], answer: 1, exp: "tab.forEach(fn) exécute fn pour chaque élément." },
    { cat: "html", q: "Quel attribut ouvre un lien dans un nouvel onglet ?", options: ["target=\"_blank\"", "new=\"tab\"", "open=\"new\"", "target=\"tab\""], answer: 0, exp: "target=\"_blank\" ouvre le lien dans un nouvel onglet." },
    { cat: "css", q: "Comment centre-t-on horizontalement un bloc de largeur fixe ?", options: ["align: center", "margin: 0 auto", "center: true", "float: middle"], answer: 1, exp: "margin: 0 auto pousse les côtés automatiquement : le bloc se centre." },
    { cat: "js", q: "Quelle méthode transforme du JSON en objet JavaScript ?", options: ["JSON.parse", "JSON.toObject", "JSON.stringify", "Object.make"], answer: 0, exp: "JSON.parse lit du texte JSON ; JSON.stringify fait l'inverse." },
    { cat: "shell", q: "Quelle commande montre l'historique des commits Git ?", options: ["git list", "git history", "git log", "git commits"], answer: 2, exp: "git log affiche l'historique des commits du dépôt." }
  ];

  var session = null;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function setActiveNav(name) {
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      a.classList.toggle("active", a.dataset.nav === name);
    });
  }

  function best() {
    try { return Number(JSON.parse(localStorage.getItem(BEST_KEY) || "0")) || 0; } catch (e) { return 0; }
  }

  function saveBest(score) {
    try { localStorage.setItem(BEST_KEY, JSON.stringify(score)); } catch (e) {}
  }

  function addXp(amount) {
    try {
      var st = JSON.parse(localStorage.getItem("codelearn-stats-v1") || "{}");
      st.xp = (st.xp || 0) + amount;
      localStorage.setItem("codelearn-stats-v1", JSON.stringify(st));
    } catch (e) {}
    window.dispatchEvent(new Event("codecamp-xp"));
  }

  function cats() {
    return [
      { id: "all", label: "🌈 Mélange", icon: "🎲" },
      { id: "js", label: "JavaScript", icon: "🟨" },
      { id: "html", label: "HTML", icon: "🟧" },
      { id: "css", label: "CSS", icon: "🟦" },
      { id: "shell", label: "Terminal & CMD", icon: "⌨️" }
    ];
  }

  function render() {
    setActiveNav("quiz");
    var app = document.getElementById("app");
    var catsHtml = cats().map(function (c) {
      var n = c.id === "all" ? BANK.length : BANK.filter(function (q) { return q.cat === c.id; }).length;
      return '<button class="quiz-cat" data-cat="' + c.id + '" style="animation:fadeUp .4s ease backwards ' + (c.id === "all" ? 0 : cats().indexOf(c) * 0.06) + 's">' +
        '<span class="quiz-cat-icon">' + c.icon + '</span>' +
        '<span class="quiz-cat-name">' + c.label + '</span>' +
        '<span class="quiz-cat-n">' + n + ' questions</span>' +
        '</button>';
    }).join("");
    app.innerHTML =
      '<section class="hero">' +
      '<h1>🧠 Quiz Arcade</h1>' +
      '<p>10 questions · 15 s par question · 3 vies · combo de folie ⚡</p>' +
      '<div class="quiz-best">🏆 Meilleur score : <strong>' + best() + '</strong> pts</div>' +
      '</section>' +
      '<div class="quiz-grid">' + catsHtml + '</div>' +
      '<div id="quiz-arena"></div>';
    setActiveNav("quiz");
    app.querySelectorAll(".quiz-cat").forEach(function (b) {
      b.addEventListener("click", function () { start(b.dataset.cat); });
    });
    window.scrollTo(0, 0);
  }

  function start(cat) {
    var pool = cat === "all" ? BANK.slice() : BANK.filter(function (q) { return q.cat === cat; });
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    session = { cat: cat, qs: pool.slice(0, 10), i: 0, score: 0, combo: 0, bestCombo: 0, lives: 3, correct: 0, answered: false, timeLeft: QTIME };
    renderScreen();
  }

  function renderScreen() {
    var arena = document.getElementById("quiz-arena");
    if (!arena) return;
    if (!session) return;
    if (session.i >= session.qs.length || session.lives <= 0) return end();
    var q = session.qs[session.i];
    var catLabel = (cats().filter(function (c) { return c.id === q.cat; })[0] || {}).label || q.cat;
    var hearts = "❤️".repeat(session.lives) + "🖤".repeat(3 - session.lives);
    arena.innerHTML =
      '<div class="quiz-card">' +
      '<div class="quiz-hud">' +
      '<span class="quiz-prog">Q' + (session.i + 1) + '/' + session.qs.length + '</span>' +
      '<span class="quiz-hearts">' + hearts + '</span>' +
      '<span class="quiz-score">⭐ ' + session.score + '</span>' +
      (session.combo > 1 ? '<span class="quiz-combo">🔥 x' + session.combo + '</span>' : '') +
      '</div>' +
      '<div class="quiz-timer"><span id="quiz-timer-fill"></span></div>' +
      '<div class="quiz-q-label">' + catLabel + '</div>' +
      '<div class="quiz-question">' + esc(q.q) + '</div>' +
      '<div class="quiz-opts">' +
      q.options.map(function (opt, oi) {
        return '<button class="qopt" data-oi="' + oi + '" style="animation:fadeUp .3s ease backwards ' + (oi * 0.07) + 's">' +
          '<span class="qopt-key">' + "ABCD"[oi] + '</span>' + esc(opt) + '</button>';
      }).join("") +
      '</div>' +
      '<div class="quiz-exp" id="quiz-exp"></div>' +
      '</div>';
    var fill = document.getElementById("quiz-timer-fill");
    requestAnimationFrame(function () {
      fill.style.transition = "width " + (QTIME / 1000) + "s linear";
      fill.style.width = "100%";
      requestAnimationFrame(function () { fill.style.width = "0%"; });
    });
    session.answered = false;
    session.timeLeft = QTIME;
    clearInterval(session.timer);
    session.timer = setInterval(tick, 100);
    arena.querySelectorAll(".qopt").forEach(function (b) {
      b.addEventListener("click", function () { answer(Number(b.dataset.oi), b); });
    });
  }

  function tick() {
    if (!session || session.answered) return;
    session.timeLeft -= 100;
    if (session.timeLeft <= 0) {
      session.timeLeft = 0;
      answer(-1, null);
    }
  }

  function answer(oi, btn) {
    if (!session || session.answered) return;
    session.answered = true;
    clearInterval(session.timer);
    var q = session.qs[session.i];
    var good = oi === q.answer;
    var gained = 0;
    if (good) {
      session.combo++;
      session.bestCombo = Math.max(session.bestCombo, session.combo);
      gained = 10 + Math.min(session.combo - 1, 5) * 4;
      session.score += gained;
      session.correct++;
      if (btn) btn.classList.add("good");
      window.CodeCampUI && window.CodeCampUI.spawnConfetti && session.i % 3 === 0 && window.CodeCampUI.spawnConfetti();
    } else {
      session.combo = 0;
      session.lives--;
      if (btn) btn.classList.add("bad");
    }
    var arena = document.getElementById("quiz-arena");
    arena.querySelectorAll(".qopt").forEach(function (b) {
      b.disabled = true;
      if (Number(b.dataset.oi) === q.answer) b.classList.add("good");
    });
    var exp = document.getElementById("quiz-exp");
    exp.innerHTML = (good ? '<span class="qok">✅ + ' + gained + ' pts' + (session.combo > 1 ? ' · combo x' + session.combo + ' !' : '') + '</span>' : (oi < 0 ? '<span class="qko">⏰ Temps écoulé !</span>' : '<span class="qko">❌ Raté !</span>')) +
      ' <span class="qexp">' + esc(q.exp) + '</span>' +
      '<button class="btn quiz-next" id="quiz-next">' + (session.lives <= 0 || session.i + 1 >= session.qs.length ? "Voir mon résultat 🏁" : "Question suivante →") + '</button>';
    exp.classList.add("show");
    document.getElementById("quiz-next").addEventListener("click", function () {
      session.i++;
      renderScreen();
    });
  }

  function end() {
    clearInterval(session && session.timer);
    var s = session;
    session = null;
    var isBest = s.score > best();
    if (isBest) saveBest(s.score);
    addXp(s.score);
    var arena = document.getElementById("quiz-arena");
    if (!arena) return;
    var rank = s.score >= 120 ? "🥇 Légendaire !" : s.score >= 80 ? "🥈 Super fort !" : s.score >= 40 ? "🥉 Bonne pioche !" : "🙂 Ça vient en s'exerçant !";
    arena.innerHTML =
      '<div class="quiz-card quiz-end">' +
      '<div class="quiz-end-icon">' + (s.lives > 0 ? "🏆" : "💀") + '</div>' +
      '<h2>' + (s.lives > 0 ? "Quiz terminé !" : "Plus de vies !") + '</h2>' +
      '<div class="quiz-end-score">' + s.score + ' pts</div>' +
      (isBest ? '<div class="quiz-newbest">🎉 Nouveau record !</div>' : '<div class="quiz-oldbest">Record : ' + best() + ' pts</div>') +
      '<p class="quiz-rank">' + rank + '</p>' +
      '<div class="panel-stats quiz-recap">' +
      '<span>✅ ' + s.correct + '/' + s.qs.length + ' bonnes réponses</span>' +
      '<span>⚡ Combo max x' + s.bestCombo + '</span>' +
      '<span>➕ +' + s.score + ' XP</span>' +
      '</div>' +
      '<div class="quiz-end-btns">' +
      '<button class="btn btn-primary" id="quiz-again">🔁 Rejouer</button>' +
      '<a class="btn" href="#/">🏠 Accueil</a>' +
      '</div>' +
      '</div>';
    window.CodeCampUI && window.CodeCampUI.spawnConfetti && window.CodeCampUI.spawnConfetti();
    document.getElementById("quiz-again").addEventListener("click", render);
  }

  return { render: render };
})();
