/* CodeCamp — CodeBot, assistant IA local (aucune donnée envoyée) */
window.CodeCampAI = (function () {
  "use strict";

  var QUIZ = [
    { q: "En JavaScript, quel mot-clé crée une variable dont la valeur ne change pas ?", o: ["let", "const", "var"], ok: 1 },
    { q: "Quelle commande affiche du texte dans la console ?", o: ["print(texte)", "echo(texte)", "console.log(texte)"], ok: 2 },
    { q: "En HTML, quelle balise crée un lien cliquable ?", o: ["<a>", "<link>", "<url>"], ok: 0 },
    { q: "En CSS, quelle propriété change la couleur du texte ?", o: ["text-color", "color", "font-color"], ok: 1 },
    { q: "Quel symbole termine chaque instruction JavaScript ?", o: ["Le point-virgule ;", "Le point .", "Les deux-points :"], ok: 0 },
    { q: "En HTML, quelle balise affiche une image ?", o: ["<img>", "<image>", "<src>"], ok: 0 },
    { q: "En CSS, Flexbox sert à…", o: [" changer la police", " aligner et répartir des éléments", " créer des variables"], ok: 1 },
    { q: "Quelle boucle répète 10 fois en JavaScript ?", o: ["for (let i = 0; i < 10; i++)", "loop 10 times", "repeat(10)"], ok: 0 }
  ];

  var KB = [
    { k: ["variable", "let", "const", "decla"], a: "📦 **Une variable** est une boîte avec une étiquette : tu y ranges une valeur pour la réutiliser.\n```js\nlet prenom = \"Léa\";\nconst annee = 2025;\nprenom = \"Sam\";  // OK, let peut changer\n```\nÀ retenir : `let` = peut changer, `const` = fixe pour toujours. Essaie la leçon “Les variables” du cours JavaScript !" },
    { k: ["fonction", "function"], a: "🧬 **Une fonction** est une recette réutilisable : elle prend des ingrédients (paramètres) et renvoie un résultat.\n```js\nfunction double(n) {\n  return n * 2;\n}\ndouble(5); // 10\n```\nLa leçon “Créer des fonctions” du cours JS t'attend ✊" },
    { k: ["boucle", "for", "while", "loop"], a: "🔁 **Une boucle** répète des instructions pour toi.\n```js\nfor (let i = 1; i <= 3; i++) {\n  console.log(\"Tour n°\" + i);\n}\n```\nElle se lit : démarre à 1, continue tant que i ≤ 3, ajoute 1 à chaque tour. Cours JS, leçon “Les boucles” !" },
    { k: ["condition", "if", "else"], a: "🚦 **Une condition** laisse ton code choisir.\n```js\nlet age = 15;\nif (age >= 18) {\n  console.log(\"Majeur\");\n} else {\n  console.log(\"Mineur\");\n}\n```\nSi la condition est vraie → bloc 1, sinon → bloc 2. La leçon “Les conditions” détaille tout." },
    { k: ["tableau", "array", "push"], a: "🧮 **Un tableau** range plusieurs valeurs dans une seule variable.\n```js\nlet fruits = [\"pomme\", \"kiwi\"];\nfruits.push(\"banane\");   // ajoute à la fin\nconsole.log(fruits[0]);  // \"pomme\"\n```\nOn compte à partir de 0 en code — piège classique !" },
    { k: ["objet", "object", "propri"], a: "🪪 **Un objet** décrit une chose avec des propriétés.\n```js\nlet hero = {\n  nom: \"Nova\",\n  vie: 100\n};\nconsole.log(hero.nom); // \"Nova\"\n```\nComme une fiche d'identité : chaque info a son nom." },
    { k: ["dom", "queryselector", "getelementbyid"], a: "👁 **Le DOM** = ta page vue par JavaScript. Tu peux lire et modifier n'importe quel élément :\n```js\ndocument.querySelector(\"h1\").textContent = \"Nouveau titre\";\n```\nC'est comme ça que les sites réagissent aux clics !" },
    { k: ["console.log", "console"], a: "💻 `console.log()` affiche une information dans la console — le poste de contrôle du développeur.\n```js\nconsole.log(\"Bonjour, monde !\");\n```\nC'est ton meilleur ami pour espionner ce que fait ton code." },
    { k: ["balise", "html", "href", "img", "attribut"], a: "🧱 **Le HTML** structure la page avec des balises :\n```html\n<h1>Titre</h1>\n<a href=\"https://exemple.fr\">Un lien</a>\n<img src=\"chat.png\" alt=\"Un chat\">\n```\nOn ouvre `<...>` et on referme `</...>` (sauf `<img>`, auto-fermée). Le cours HTML t'explique tout dans l'ordre." },
    { k: ["css", "couleur", "style", "style"], a: "🎨 **Le CSS** habille la page :\n```css\nh1 {\n  color: #4f8cff;\n  font-size: 32px;\n}\n```\nOn choisit la cible (le sélecteur `h1`), puis on liste les propriétés. Le cours CSS commence doucement, promis." },
    { k: ["flexbox", "flex", "aligner"], a: "🔧 **Flexbox** aligne et répartit des éléments sans effort :\n```css\n.menu {\n  display: flex;\n  justify-content: space-between;\n}\n```\nUn seul mot-clé (`display: flex`) et ta liste devient une rangée pilotable. Leçon “Flexbox” du cours CSS !" },
    { k: ["classe", "class", "sélecteur", "selecteur"], a: "🏷 **Les classes** CSS : tu colles une étiquette en HTML, tu la vises en CSS.\n```html\n<button class=\"important\">GO</button>\n```\n```css\n.important { background: gold; }\n```\nLa classe commence par un point en CSS, sans point en HTML." },
    { k: ["cmd", "powershell", "terminal", "commande"], a: "⌨ Rendez-vous page **Terminal** : cheat sheets CMD, PowerShell et Git Bash + un simulateur pour t'entraîner sans risque. Et tape la commande `hack` dans le simulateur… ;)" },
    { k: ["git", "github"], a: "🌍 **Git** sauvegarde l'historique de ton code, **GitHub** l'héberge en ligne : `git add` → `git commit` → `git push`. Les commandes Git sont dans la page Terminal (onglet Git Bash)." },
    { k: ["xp", "série", "streak", "niveau"], a: "⚡ Chaque exercice réussi = **+20 XP**, et si tu reviens chaque jour ta **série 🔥** augmente. Tout est sauvegardé automatiquement dans ton navigateur, sur ce site." },
    { k: ["commencer", "début", "comment ça marche", "par où", "démarrer", "apprendre"], a: "🧭 **Par où commencer ?** 1) Ouvre le cours **JavaScript**, 2) lis la leçon, 3) tape ton code dans l'éditeur, 4) clique **Vérifier**. Enchaîne les leçons dans l'ordre : c'est conçu pour ! Tu peux aussi t'entraîner aux commandes page Terminal." }
  ];

  var JOKES = [
    "Pourquoi les développeurs confondent Halloween et Noël ?\nParce que OCT 31 == DEC 25 😂 (le vrai sens dépend de la base !)",
    "Un SQL entre dans un bar, s'approche de deux tables et demande :\n« Je peux vous joindre ? » 🍺",
    "99 petits bugs dans le code, 99 petits bugs…\ntu corriges un, re-testes : 127 petits bugs 🎶",
    "« Ça marche sur ma machine » — phrase officielle de plaidoyer du développeur, reconnue par tous les tribunaux du web ⚖️"
  ];

  var GREETINGS = [
    "Salut ! 👋 Moi c'est CodeBot, ton copilote code. Demande : « explique les variables », « c'est quoi le CSS », « quiz », ou « ouvre JavaScript ».",
    "Hello ! 🤖 Prêt(e) à progresser ? Pose ta question sur JS, HTML, CSS, le terminal… ou tape « quiz » pour te tester !",
    "Bonjour ! 👋 Je connais les leçons du site par cœur. Une explication ? Un quiz ? Ou « ouvre le terminal » ?"
  ];

  var JOKES_KW = ["blague", "fun", "rigole"];

  var panel, msgs, chipsEl, inputEl, opened = false, pending = null, currentQ = null;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function kbMd(s) {
    return esc(s)
      .replace(/```js\n([\s\S]*?)```/g, function (_, c) { return "<pre>" + c + "</pre>"; })
      .replace(/```([\s\S]*?)```/g, function (_, c) { return "<pre>" + c + "</pre>"; })
      .replace(/`([^`\n]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
  }

  function build() {
    if (panel) return;
    var fab = document.createElement("button");
    fab.id = "ai-fab";
    fab.className = "ai-fab";
    fab.title = "CodeBot, ton assistant IA";
    fab.setAttribute("aria-label", "Ouvrir CodeBot");
    fab.innerHTML = '<span class="ai-fab-icon">🤖</span><span class="ai-fab-dot"></span>';

    panel = document.createElement("div");
    panel.id = "ai-panel";
    panel.className = "ai-panel";
    panel.hidden = true;
    panel.innerHTML =
      '<div class="ai-head">' +
      '<span class="ai-avatar">🤖</span>' +
      '<div class="ai-titles"><strong>CodeBot</strong><em class="ai-status">en ligne · 100 % local, rien n\'est envoyé</em></div>' +
      '<button id="ai-close" class="ai-close" aria-label="Fermer">×</button>' +
      '</div>' +
      '<div class="ai-msgs" id="ai-msgs" aria-live="polite"></div>' +
      '<div class="ai-chips" id="ai-chips"></div>' +
      '<div class="ai-inputbar">' +
      '<input id="ai-input" placeholder="Pose ta question… (ex : c\'est quoi une boucle ?)" autocomplete="off">' +
      '<button id="ai-send" class="ai-send" aria-label="Envoyer">➜</button>' +
      '</div>';

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    msgs = panel.querySelector("#ai-msgs");
    chipsEl = panel.querySelector("#ai-chips");
    inputEl = panel.querySelector("#ai-input");

    fab.addEventListener("click", open);
    panel.querySelector("#ai-close").addEventListener("click", close);
    panel.querySelector("#ai-send").addEventListener("click", send);
    inputEl.addEventListener("keydown", function (e) { if (e.key === "Enter") send(); });
  }

  function setChips(list) {
    chipsEl.innerHTML = "";
    (list || []).forEach(function (c) {
      var b = document.createElement("button");
      b.className = "ai-chip";
      b.innerHTML = esc(c.label);
      b.addEventListener("click", function () {
        chipsEl.innerHTML = "";
        if (c.text === "__quiz__") { askQuiz(); return; }
        if (c.text && c.text.indexOf("__answer__") === 0) { checkAnswer(parseInt(c.text.slice(10), 10)); return; }
        ask(c.text || c.label);
      });
      chipsEl.appendChild(b);
    });
  }

  function open(greet) {
    build();
    panel.hidden = false;
    setTimeout(function () { panel.classList.add("on"); }, 10);
    if (!opened) {
      opened = true;
      botSay(typeof greet === "string" ? greet : GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
      setChips([
        { label: "🧭 Comment ça marche ?", text: "Comment ça marche ?" },
        { label: "📦 C'est quoi une variable ?", text: "explique les variables" },
        { label: "🎯 Quiz moi !", text: "__quiz__" },
        { label: "⌨ Commandes CMD", text: "commande CMD" }
      ]);
    } else if (typeof greet === "string") {
      botSay(greet);
    }
    inputEl.focus();
  }

  function close() {
    panel.classList.remove("on");
    setTimeout(function () { panel.hidden = true; }, 180);
  }

  function toggle() { if (panel && !panel.hidden) close(); else open(); }

  function userSay(text) {
    var d = document.createElement("div");
    d.className = "ai-msg me";
    d.innerHTML = esc(text);
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function botSay(md) {
    var d = document.createElement("div");
    d.className = "ai-msg bot";
    d.innerHTML = kbMd(md);
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function thinking() {
    var d = document.createElement("div");
    d.className = "ai-msg bot typing";
    d.innerHTML = "<span></span><span></span><span></span>";
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }

  function send() {
    var v = inputEl.value.trim();
    if (!v) return;
    inputEl.value = "";
    ask(v);
  }

  function ask(text) {
    userSay(text);
    if (pending) return;
    var t = thinking();
    pending = setTimeout(function () {
      pending = null;
      t.remove();
      answer(text);
    }, 420 + Math.random() * 480);
  }

  function answer(text) {
    var low = text.toLowerCase();

    if (low.replace(/[^a-zà-ÿ]/g, "").indexOf("quiz") !== -1) {
      askQuiz();
      return;
    }
    if (/(ouvre|ouvrir|montre|affiche|amène|amene)/.test(low)) {
      var targets = [
        { r: /javascript|\bjs\b/, h: "#/course/js-base", n: "JavaScript" },
        { r: /\bhtml\b/, h: "#/course/html-base", n: "HTML" },
        { r: /\bcss\b/, h: "#/course/css-base", n: "CSS" },
        { r: /terminal/, h: "#/terminal", n: "Terminal" },
        { r: /plan|progres/, h: "#/plan", n: "mon plan" }
      ];
      for (var i = 0; i < targets.length; i++) {
        if (targets[i].r.test(low)) {
          location.hash = targets[i].h;
          botSay("🚀 Ok, j'ouvre " + targets[i].n + " ! Bonne séance de code.");
          return;
        }
      }
    }
    for (var j = 0; j < JOKES_KW.length; j++) {
      if (low.indexOf(JOKES_KW[j]) !== -1) {
        botSay(JOKES[Math.floor(Math.random() * JOKES.length)]);
        return;
      }
    }
    if (/^(bonjour|salut|bonsoir|hey|coucou|hello|yo)\b/.test(low)) {
      botSay(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
      return;
    }
    if (/^(merci|thanks)/.test(low)) {
      botSay("Avec plaisir 😊 Continue comme ça — et clique ✓ Vérifier sur ton exercice pour empocher les XP !");
      return;
    }
    if (/^(au revoir|bye|ciao|a\+)/.test(low)) {
      botSay("À bientôt 👋 Le prochain fichier a un nom : le tien !");
      return;
    }

    var best = null, bestScore = 0;
    KB.forEach(function (t) {
      var score = 0;
      t.k.forEach(function (kw) { if (low.indexOf(kw) !== -1) score += kw.length; });
      if (score > bestScore) { bestScore = score; best = t; }
    });

    if (best && bestScore >= 3) {
      botSay(best.a);
      return;
    }

    botSay("🤔 Je ne suis pas sûr de ce qu'il faut répondre à ça — je suis un bot local, très volontaire mais un peu tête-en-l'air. Essaie par exemple :\n- « explique les variables » / « les boucles » / « les fonctions »\n- « c'est quoi flexbox ? » / « une balise HTML »\n- « quiz moi » ou « raconte une blague »\n- « ouvre JavaScript » / « ouvre le terminal »");
    setChips([
      { label: "📦 Variables", text: "explique les variables" },
      { label: "🔁 Boucles", text: "explique les boucles" },
      { label: "🧱 HTML", text: "explique les balises html" },
      { label: "🎯 Quiz moi !", text: "__quiz__" }
    ]);
  }

  function askQuiz() {
    currentQ = QUIZ[Math.floor(Math.random() * QUIZ.length)];
    botSay("🎯 **Quiz !** " + currentQ.q);
    setChips(currentQ.o.map(function (o, i) { return { label: o, text: "__answer__" + i }; }));
  }

  function checkAnswer(i) {
    var ok = currentQ && i === currentQ.ok;
    var good = currentQ ? currentQ.o[currentQ.ok] : "?";
    currentQ = null;
    if (ok) {
      botSay("✅ **Bravo, c'est exact !** Le vrai XP se gagne dans l'éditeur : +20 par exercice validé ⚡");
      setChips([{ label: "🎯 Encore !", text: "__quiz__" }, { label: "▶ La prochaine leçon", text: "ouvre JavaScript" }]);
    } else {
      botSay("❌ Pas tout à fait — la bonne réponse était : **" + good + "**.\nRien de grave : l'erreur, c'est justement comme ça que le cerveau apprend. On réessaie ?");
      setChips([{ label: "🔁 Rejouer", text: "__quiz__" }, { label: "📖 Revoir la leçon", text: "ouvre JavaScript" }]);
    }
  }

  window.addEventListener("hashchange", function () { if (panel && !panel.hidden) close(); });

  build();

  return { open: open, close: close, toggle: toggle };
})();
