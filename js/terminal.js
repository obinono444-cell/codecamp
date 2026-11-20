/* CodeCamp — Terminal : cheat sheets CMD / PowerShell / Bash + simulateur */
window.CodeCampTerminal = (function () {
  "use strict";

  var SHELLS = {
    cmd: {
      label: "\ud83e\uddfa CMD",
      name: "Invite de commandes",
      os: "Windows",
      prompt: "C:\\Users\\toi>",
      intro: "Tape help pour la liste des commandes simul\u00e9es.",
      commands: [
        { c: "dir", d: "Liste les fichiers du dossier" },
        { c: "cd nom-dossier", d: "Entre dans un dossier" },
        { c: "cd ..", d: "Remonte d'un niveau" },
        { c: "mkdir projet", d: "Cr\u00e9e un dossier" },
        { c: "echo salut", d: "Affiche du texte" },
        { c: "type note.txt", d: "Affiche un fichier" },
        { c: "copy a.txt b.txt", d: "Copie un fichier" },
        { c: "del note.txt", d: "Supprime un fichier" },
        { c: "ren a.txt b.txt", d: "Renomme un fichier" },
        { c: "cls", d: "Efface l'\u00e9cran" },
        { c: "ipconfig", d: "Configuration r\u00e9seau" },
        { c: "ping google.com", d: "Teste une connexion" },
        { c: "tasklist", d: "Programmes en cours" },
        { c: "whoami", d: "Nom de l'utilisateur" },
        { c: "systeminfo", d: "Infos sur le PC" }
      ]
    },
    powershell: {
      label: "\ud83d\udcab PowerShell",
      name: "PowerShell",
      os: "Windows / macOS / Linux",
      prompt: "PS C:\\Users\\toi>",
      intro: "Tape Get-Help pour la liste des commandes simul\u00e9es.",
      commands: [
        { c: "Get-ChildItem", d: "Liste les fichiers (comme dir)" },
        { c: "Set-Location docs", d: "Change de dossier (comme cd)" },
        { c: "New-Item -ItemType Directory -Name projet", d: "Cr\u00e9e un dossier" },
        { c: "\"salut\" | Write-Output", d: "Affiche du texte" },
        { c: "Get-Content note.txt", d: "Affiche un fichier" },
        { c: "Copy-Item a.txt b.txt", d: "Copie un fichier" },
        { c: "Remove-Item note.txt", d: "Supprime un fichier" },
        { c: "Clear-Host", d: "Efface l'\u00e9cran" },
        { c: "Get-Process", d: "Programmes en cours" },
        { c: "Get-Date", d: "Date et heure" },
        { c: "Get-ComputerInfo", d: "Infos sur le PC" },
        { c: "Test-Connection google.com", d: "Ping un serveur" },
        { c: "Get-Service", d: "Liste les services" },
        { c: "$env:USERNAME", d: "Nom de l'utilisateur" },
        { c: "Get-Help", d: "Liste les commandes simul\u00e9es" }
      ]
    },
    bash: {
      label: "\ud83d\udc27 Git Bash",
      name: "Bash",
      os: "macOS / Linux / Git pour Windows",
      prompt: "toi@camp:~$",
      intro: "Tape help pour la liste des commandes simul\u00e9es.",
      commands: [
        { c: "ls", d: "Liste les fichiers du dossier" },
        { c: "ls -la", d: "Liste d\u00e9taill\u00e9e (fichiers cach\u00e9s)" },
        { c: "cd nom-dossier", d: "Entre dans un dossier" },
        { c: "cd ..", d: "Remonte d'un niveau" },
        { c: "pwd", d: "Affiche le dossier actuel" },
        { c: "mkdir projet", d: "Cr\u00e9e un dossier" },
        { c: "echo salut", d: "Affiche du texte" },
        { c: "cat note.txt", d: "Affiche un fichier" },
        { c: "cp a.txt b.txt", d: "Copie un fichier" },
        { c: "mv a.txt b.txt", d: "D\u00e9place ou renomme" },
        { c: "rm note.txt", d: "Supprime un fichier" },
        { c: "clear", d: "Efface l'\u00e9cran" },
        { c: "whoami", d: "Nom de l'utilisateur" },
        { c: "date", d: "Date et heure" },
        { c: "touch fichier.txt", d: "Cr\u00e9e un fichier vide" }
      ]
    }
  };

  var current = "cmd";
  var hist = [], histIdx = -1;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function activeShell() { return SHELLS[current]; }

  function cheatRows() {
    return activeShell().commands.map(function (c) {
      return '<div class="cheat-row">' +
        '<code>' + esc(c.c) + '</code>' +
        '<span>' + esc(c.d) + '</span>' +
        '<button class="cheat-copy" data-copy="' + esc(c.c) + '" data-code="' + esc(c.c) + '" title="Copier">Copier</button>' +
        '</div>';
    }).join("");
  }

  function render() {
    var app = document.getElementById("app");
    var nav = document.querySelectorAll("[data-nav]");
    nav.forEach(function (a) { a.classList.toggle("active", a.dataset.nav === "terminal"); });

    app.innerHTML =
      '<section class="term-page">' +
      '<h1>\u2328\ufe0f Terminal \u2014 parle \u00e0 ta machine</h1>' +
      '<p class="term-sub">Les vraies commandes des pros, expliqu\u00e9es simplement. Clique <strong>Copier</strong>, vois la description\u2026 et entra\u00eene-toi dans le terminal simul\u00e9 en bas : impossible de casser quoi que ce soit. \ud83d\udee1\ufe0f</p>' +
      '<div class="term-tabs" role="tablist">' +
      Object.keys(SHELLS).map(function (k) {
        return '<button class="term-tab' + (k === current ? " active" : "") + '" data-shell="' + k + '" role="tab">' + esc(SHELLS[k].label) + '</button>';
      }).join("") +
      '</div>' +
      '<p class="term-tabdesc">' + esc(activeShell().name) + ' \u2014 ' + esc(activeShell().os) + '. ' + esc(activeShell().intro) + '</p>' +
      '<div class="cheat-grid" id="cheat-grid">' + cheatRows() + '</div>' +
      '<div class="term-win">' +
      '<div class="term-titlebar"><span></span><span></span><span></span><em>' + esc(activeShell().label.replace(/^\S+\s/, "")) + ' (simul\u00e9)</em></div>' +
      '<div class="term-body">' +
      '<div id="term-out" class="term-out"></div>' +
      '<div class="term-line">' +
      '<span class="term-prompt" id="term-prompt">' + esc(activeShell().prompt) + '</span>' +
      '<input id="term-in" class="term-in" autocomplete="off" spellcheck="false" aria-label="Commande">' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<p class="term-note">\ud83e\uddec Astuce : essaie <code>neofetch</code>, <code>matrix</code>, <code>hack</code> ou <code>ai</code>\u2026</p>' +
      '</section>';

    var out = document.getElementById("term-out");
    print(out, "\ud83d\udc4b Bienvenue dans le terminal simul\u00e9 CodeCamp (" + activeShell().name + ").\nCe n'est pas un vrai terminal : n'importe quoi que tu tape ici est sans danger.", "dim");
    print(out, activeShell().intro + "\n", "dim");

    bindShell();
    resetShellState();
  }

  function resetShellState() {
    hist = [];
    histIdx = -1;
    var input = document.getElementById("term-in");
    if (input) input.focus();
  }

  function bindShell() {
    var app = document.getElementById("app");

    app.querySelectorAll(".term-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        current = btn.dataset.shell;
        render();
      });
    });

    app.addEventListener("click", function (e) {
      var cp = e.target.closest ? e.target.closest(".cheat-copy") : null;
      if (!cp) return;
      var txt = cp.dataset.code;
      function done() {
        cp.textContent = "Copi\u00e9 \u2713";
        cp.classList.add("ok");
        setTimeout(function () { cp.textContent = "Copier"; cp.classList.remove("ok"); }, 1400);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(done, function () { done(); });
      } else { done(); }
    });

    var input = document.getElementById("term-in");
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var line = input.value.trim();
        input.value = "";
        if (!line) return;
        hist.push(line);
        histIdx = hist.length;
        exec(line);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (histIdx > 0) { histIdx--; input.value = hist[histIdx]; }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (histIdx < hist.length - 1) { histIdx++; input.value = hist[histIdx]; }
        else { histIdx = hist.length; input.value = ""; }
      }
    });
  }

  function outEl() { return document.getElementById("term-out"); }

  function print(target, text, cls) {
    var t = target || outEl();
    if (!t) return;
    var div = document.createElement("div");
    div.className = "term-line-out" + (cls ? " " + cls : "");
    div.innerHTML = esc(text).replace(/\n/g, "<br>");
    t.appendChild(div);
    t.scrollTop = t.scrollHeight;
  }

  function echoCmd(line) {
    var t = outEl();
    if (!t) return;
    var div = document.createElement("div");
    div.className = "term-line-out";
    div.innerHTML = '<span class="term-prompt">' + esc(activeShell().prompt) + '</span> ' + esc(line);
    t.appendChild(div);
    t.scrollTop = t.scrollHeight;
  }

  function exec(line) {
    echoCmd(line);
    var low = line.toLowerCase();
    var shell = current;
    var parts = low.split(/\s+/);
    var cmd = parts[0];

    if (shell === "powershell" && low === '"salut" | write-output') cmd = "echo";

    if (["cls", "clear", "clear-host"].indexOf(cmd) !== -1) {
      outEl().innerHTML = "";
      return;
    }
    if (["help", "get-help"].indexOf(cmd) !== -1) {
      print(null, "Commandes simul\u00e9es disponibles :\n" +
        "  dir / ls            liste des fichiers\n" +
        "  cd dossier / cd ..  navigation\n" +
        "  echo texte          affiche du texte\n" +
        "  whoami              qui es-tu\n" +
        "  date                heure et date\n" +
        "  ipconfig / ping     r\u00e9seau\n" +
        "  tree / neofetch     pour le fun\n" +
        "  matrix / hack / ai  secrets ;)\n" +
        "  cls / clear         efface l'\u00e9cran");
      return;
    }
    if (["dir", "ls", "get-childitem"].indexOf(cmd) !== -1) {
      print(null, " CodeCamp                projets\n notes.txt               readme.md\n style.css               app.js");
      return;
    }
    if (["cd", "set-location"].indexOf(cmd) !== -1) {
      if (parts[1] === "..") print(null, "Dossier pr\u00e9c\u00e9dent. Chemin : " + (shell === "bash" ? "/home/toi" : "C:\\Users\\toi"));
      else if (parts[1]) print(null, (parts[1] === "projets" || parts[1] === "docs" ? "Ok !" : "Dossier \"" + parts[1] + "\" introuvable.") + (parts[1] === "projets" || parts[1] === "docs" ? " Chemin : " + (shell === "bash" ? "~/": "C:\\Users\\toi\\") + parts[1] : ""));
      else print(null, shell === "bash" ? "/home/toi" : "C:\\Users\\toi");
      return;
    }
    if (["pwd", "echo"].indexOf(cmd) !== -1 || low === "$env:username" || low === "get-date" || cmd === "date") {
      if (cmd === "pwd") { print(null, shell === "bash" ? "/home/toi" : "C:\\Users\\toi"); return; }
      if (cmd === "echo") {
        var rest = line.slice((shell === "cmd" ? 4 : 4)).replace(/"/g, "");
        print(null, rest);
        return;
      }
      print(null, new Date().toLocaleString("fr-FR"));
      return;
    }
    if (cmd === "whoami" || low === "get-service") {
      if (low === "get-service") { print(null, "Nom              Statut\n----             ------\nCodeCampAgent    Running\nStreakKeeper     Running"); return; }
      print(null, shell === "bash" ? "toi" : "codecamp\\toi");
      return;
    }
    if (["ipconfig", "ping", "test-connection"].indexOf(cmd) !== -1) {
      if (cmd === "ipconfig") {
        print(null, "Carte Ethernet Wi-Fi :\n   Adresse IPv4. . . . . . . . . . . : 192.168.1.42\n   Masque de sous-r\u00e9seau . . . . . . : 255.255.255.0\n   Passerelle par d\u00e9faut . . . . . . : 192.168.1.1");
        return;
      }
      print(null, "Envoi d'une requ\u00eate 'Ping' \u2026");
      var host = parts[1] || "google.com";
      var n = 0;
      var iv = setInterval(function () {
        n++;
        print(null, "R\u00e9ponse de " + host + " : octets=32 temps=" + (10 + Math.floor(Math.random() * 25)) + " ms TTL=118");
        if (n >= 3) { clearInterval(iv); print(null, ""); }
      }, 450);
      return;
    }
    if (["tasklist", "get-process"].indexOf(cmd) !== -1) {
      print(null, "Nom du process            PID\n=========================\nexplorer.exe              1024\ncode.exe                  2048\nmatrixir: greenpill.exe    1337");
      return;
    }
    if (["systeminfo", "get-computerinfo"].indexOf(cmd) !== -1) {
      print(null, "Nom de l'h\u00f4te :              CODECAMP-PC\nSyst\u00e8me :                    Apprendre-\u00e0-coder Edition\nM\u00e9moire physique :           Illimit\u00e9e (c'est du carton)\nSessions ouvertes :          1 (toi \ud83d\udc68\u200d\ud83d\udcbb)");
      return;
    }
    if (["mkdir", "new-item", "touch"].indexOf(cmd) !== -1) {
      print(null, "Cr\u00e9\u00e9 : " + (parts[parts.length - 1] || "nouveau"));
      return;
    }
    if (["del", "rm", "remove-item"].indexOf(cmd) !== -1) {
      print(null, "(Simulation) Rien n'a vraiment \u00e9t\u00e9 supprim\u00e9 \ud83d\udee1\ufe0f");
      return;
    }
    if (["copy", "cp", "copy-item", "mv", "move", "ren", "rename"].indexOf(cmd) !== -1) {
      print(null, "(Simulation) 1 \u00e9l\u00e9ment copi\u00e9/d\u00e9plac\u00e9.");
      return;
    }
    if (["type", "cat", "get-content"].indexOf(cmd) !== -1) {
      print(null, "Bonjour, monde !\nLa suite au prochain \u00e9pisode\u2026");
      return;
    }
    if (cmd === "tree") {
      print(null, "C:.\n\u251c\u2500\u2500\u2500 js\n\u2502   \u251c\u2500\u2500\u2500 app.js\n\u2502   \u251c\u2500\u2500\u2500 lessons.js\n\u2502   \u251c\u2500\u2500\u2500 tour.js\n\u2502   \u251c\u2500\u2500\u2500 terminal.js\n\u2502   \u2514\u2500\u2500\u2500 ai.js\n\u251c\u2500\u2500\u2500 css\n\u2502   \u2514\u2500\u2500\u2500 styles.css\n\u2514\u2500\u2500\u2500 index.html");
      return;
    }
    if (cmd === "neofetch") {
      print(null,
        "       .--------.        toi@codecamp\n      /  ______  \\       --------------\n     |  /      \\  |      OS: CodeCamp Web\n     |  | () () | |      Uptime: tant que tu apprends\n     |  |   __  | |      Shell: " + shell + "\n      \\  \\____/  /       XP: collect\u00e9 \u26a1\n       '--------'        Motto: coder > regarder");
      return;
    }
    if (cmd === "matrix" || cmd === "hack") {
      if (cmd === "hack") {
        print(null, "Lancement du protocole\u2026");
        var steps = ["Connexion au r\u00e9seau\u2026 OK", "Contournement du pare-feu (fictif)\u2026 OK", "D\u00e9cryption\u2026 62%", "ACC\u00c8S ACCORD\u00c9 \ud83d\udfe2\n(Super, tu as tap\u00e9 une commande \u2014 c'est \u00e7a le hacking : lire, comprendre, essayer \ud83d\ude00)"];
        steps.forEach(function (s, i) {
          setTimeout(function () { print(null, s); }, 500 * (i + 1));
        });
        if (window.CodeCampMatrix) setTimeout(function () { CodeCampMatrix.burst(6000); }, 2300);
        return;
      }
      print(null, "Pluie num\u00e9rique activ\u00e9e pendant 6 secondes\u2026");
      if (window.CodeCampMatrix) CodeCampMatrix.burst(6000);
      return;
    }
    if (cmd === "ai" || cmd === "codebot") {
      print(null, "Ouverture de CodeBot\u2026");
      if (window.CodeCampAI) CodeCampAI.open("Salut ! Je suis CodeBot \ud83e\udd16 Demande-moi d'expliquer une notion (variables, boucles, flexbox\u2026) ou dis \u201cquiz\u201d pour \u00eatre test\u00e9 !");
      return;
    }
    if (["exit", "quit"].indexOf(cmd) !== -1) {
      print(null, "Fermeture simul\u00e9e. Tu peux fermer l'onglet, ou continuer \u00e0 apprendre \ud83d\ude80");
      return;
    }
    if (["ver", "$psversiontable"].indexOf(cmd) !== -1) {
      print(null, "CodeCamp Shell Simulator v1.0");
      return;
    }
    print(null, "'" + line + "' n'est pas reconnu ici. Tape help \u2014 ou clique Copier sur une commande de la cheat sheet.");
  }

  return { render: render };
})();
