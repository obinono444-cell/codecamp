const COURSES = [
  {
    id: "js-base",
    title: "JavaScript — Les bases",
    icon: "⚡",
    color: "#f0db4f",
    description: "Les fondamentaux de la programmation : variables, conditions, boucles et fonctions.",
    lessons: [
      {
        id: "premier-programme",
        title: "Ta première ligne de code",
        theory: [
          { type: "text", md: "Bienvenue sur **CodeCamp** ! Le premier réflexe de tout programmeur est d'afficher un message à l'écran. En JavaScript, on utilise la fonction `console.log()`." },
          { type: "code", code: "console.log(\"Bonjour\");\nconsole.log(42);" },
          { type: "tip", md: "`console.log()` affiche tout ce que tu lui donnes : du **texte** (entre guillemets), des **nombres** (sans guillemets), et même plusieurs valeurs à la fois, séparées par des virgules." }
        ],
        quiz: [
          { q: "Qu'affiche `console.log(\"Salut\")` ?", options: ["Rien du tout", "Salut", "\"Salut\" avec les guillemets"], answer: 1 },
          { q: "Quand utilise-t-on les guillemets ?", options: ["Pour les nombres", "Pour le texte", "Jamais"], answer: 1 }
        ],
        exercise: {
          prompt: "Affiche exactement le texte « Bonjour, monde ! » dans la console.",
          starter: "// Écris ton code ici\n",
          check: { kind: "run", expected: ["Bonjour, monde !"] }
        }
      },
      {
        id: "variables",
        title: "Les variables",
        theory: [
          { type: "text", md: "Une **variable** est une boîte étiquetée dans laquelle on range une valeur pour la réutiliser. On la crée avec `let` (qu'on peut modifier) ou `const` (fixe, on ne peut pas la changer)." },
          { type: "code", code: "const ville = \"Paris\";\nlet meteo = \"soleil\";\n\nmeteo = \"pluie\";\n\nconsole.log(ville);\nconsole.log(meteo);\nconsole.log(ville + \" - \" + meteo);" },
          { type: "tip", md: "Règle d'or : utilise toujours `const` par défaut, et `let` seulement si la valeur doit changer. Une chaîne de caractères (du texte) se note toujours entre guillemets." }
        ],
        quiz: [
          { q: "Quelle déclaration interdit de modifier la valeur ?", options: ["let", "const", "var"], answer: 1 },
          { q: "Que vaut l'expression `\"5\" + \"!\"` ?", options: ["5!", "Une erreur", "50"], answer: 0 }
        ],
        exercise: {
          prompt: "Crée une constante `ville` qui contient le texte « Lyon », puis affiche-la avec console.log.",
          starter: "// Déclare la constante puis affiche-la\n",
          check: {
            kind: "run",
            tests: [{ code: "console.log(typeof ville, ville);", expect: ["string Lyon"] }]
          }
        }
      },
      {
        id: "fonctions",
        title: "Les fonctions",
        theory: [
          { type: "text", md: "Une **fonction** est un bloc de code réutilisable : on lui donne des **paramètres** en entrée, elle retourne un résultat avec `return`." },
          { type: "code", code: "function doubler(nombre) {\n  return nombre * 2;\n}\n\nconsole.log(doubler(4));\nconsole.log(doubler(10));\n\nconst fleche = (a, b) => a + b;\nconsole.log(fleche(2, 3));" },
          { type: "tip", md: "`return` renvoie la valeur ET arrête la fonction. Sans `return`, une fonction renvoie `undefined`. La version `=>` s'appelle une fonction fléchée, c'est un raccourci moderne." }
        ],
        quiz: [
          { q: "Que vaut `doubler(doubler(3))` avec la fonction ci-dessus ?", options: ["9", "12", "6"], answer: 1 },
          { q: "Que renvoie une fonction sans `return` ?", options: ["null", "0", "undefined"], answer: 2 }
        ],
        exercise: {
          prompt: "Écris une fonction `saluer(nom)` qui retourne « Bonjour, nom ! » (en remplaçant nom par la valeur reçue). Exemple : saluer(\"Alice\") doit retourner « Bonjour, Alice ! ».",
          starter: "function saluer(nom) {\n  // ton code ici\n}\n",
          check: {
            kind: "run",
            tests: [
              { code: "console.log(saluer(\"Alice\"));", expect: ["Bonjour, Alice !"] },
              { code: "console.log(saluer(\"Bob\"));", expect: ["Bonjour, Bob !"] }
            ]
          }
        }
      },
      {
        id: "conditions",
        title: "Les conditions",
        theory: [
          { type: "text", md: "Avec `if` / `else`, ton programme prend des **décisions** : il exécute un bloc seulement si une condition est vraie." },
          { type: "code", code: "const temperature = 28;\n\nif (temperature > 25) {\n  console.log(\"Il fait chaud\");\n} else {\n  console.log(\"Il fait frais\");\n}" },
          { type: "tip", md: "Opérateurs de comparaison : `===` (égal à), `!==` (différent de), `>` `<` `>=` `<=`. Combine-les avec `&&` (et) et `||` (ou). Attention : `===` compare aussi le type, c'est lui qu'on utilise." }
        ],
        quiz: [
          { q: "Quelle comparaison teste l'égalité stricte ?", options: ["=", "==", "==="], answer: 2 },
          { q: "`if (false) { A } else { B }` exécute…", options: ["A", "B", "Les deux"], answer: 1 }
        ],
        exercise: {
          prompt: "Écris une fonction `majeur(age)` qui retourne `true` si age vaut 18 ou plus, `false` sinon.",
          starter: "function majeur(age) {\n  // ton code ici\n}\n",
          check: {
            kind: "run",
            tests: [
              { code: "console.log(majeur(20));", expect: ["true"] },
              { code: "console.log(majeur(17));", expect: ["false"] },
              { code: "console.log(majeur(18));", expect: ["true"] }
            ]
          }
        }
      },
      {
        id: "boucles",
        title: "Les boucles",
        theory: [
          { type: "text", md: "Une **boucle** permet de répéter des instructions sans les réécrire. Le `for` est la plus utilisée : il répète un compteur de 0 jusqu'à une limite." },
          { type: "code", code: "for (let i = 1; i <= 3; i++) {\n  console.log(\"Tour n°\" + i);\n}\n\nlet total = 0;\nconst notes = [12, 15, 9];\nfor (const note of notes) {\n  total = total + note; \n}\nconsole.log(total);" },
          { type: "tip", md: "`i++` augmente i de 1 à chaque tour. La boucle `for...of` parcourt directement chaque élément d'un tableau, c'est plus lisible." }
        ],
        quiz: [
          { q: "Combien de tours fait `for (let i = 0; i < 4; i++)` ?", options: ["3", "4", "5"], answer: 1 },
          { q: "Que vérifie la condition `i <= 10` ?", options: ["i strictement inférieur à 10", "i inférieur ou égal à 10", "i égal à 10"], answer: 1 }
        ],
        exercise: {
          prompt: "Écris une fonction `somme(n)` qui additionne tous les nombres de 1 à n avec une boucle. Exemple : somme(5) vaut 1+2+3+4+5 = 15.",
          starter: "function somme(n) {\n  // ton code ici\n}\n",
          check: {
            kind: "run",
            tests: [
              { code: "console.log(somme(5));", expect: ["15"] },
              { code: "console.log(somme(100));", expect: ["5050"] },
              { code: "console.log(somme(1));", expect: ["1"] }
            ]
          }
        }
      },
      {
        id: "objets",
        title: "Les objets",
        theory: [
          { type: "text", md: "Un **objet** regroupe plusieurs informations sur une même chose : chaque info a un nom (**propriété**) et une valeur. On accède aux propriétés avec le point `.`" },
          { type: "code", code: "const hero = {\n  nom: \"Nova\",\n  vie: 100\n};\n\nconsole.log(hero.nom);  // \"Nova\"\nconsole.log(hero.vie);  // 100\n\nhero.xp = 0;  // on peut ajouter une propriété plus tard" },
          { type: "tip", md: "Un objet, c'est comme une fiche d'identité : `nom`, `vie`, `xp`… et pour lire une info on écrit `hero.nom`. On peut aussi y ranger des fonctions, on les appelle alors des **méthodes**." }
        ],
        quiz: [
          { q: "Comment lire la propriété `nom` de l'objet `hero` ?", options: ["hero.nom", "nom(hero)", "hero->nom"], answer: 0 },
          { q: "Un objet regroupe…", options: ["une seule valeur", "plusieurs propriétés nommées", "seulement des textes"], answer: 1 }
        ],
        exercise: {
          prompt: "Écris une fonction `presente(hero)` qui retourne « nom a vie points de vie ! » à partir de l'objet reçu. Exemple : presente({nom: \"Nova\", vie: 100}) → « Nova a 100 points de vie ! ».",
          starter: "function presente(hero) {\n  // ton code ici\n}\n",
          check: {
            kind: "run",
            tests: [
              { code: "console.log(presente({ nom: \"Nova\", vie: 100 }));", expect: ["Nova a 100 points de vie !"] },
              { code: "console.log(presente({ nom: \"Zed\", vie: 80 }));", expect: ["Zed a 80 points de vie !"] }
            ]
          }
        }
      }
    ]
  },
  {
    id: "html-base",
    title: "HTML — Structurer une page",
    icon: "🧱",
    color: "#ff7043",
    description: "Crée le squelette des pages web avec les balises essentielles.",
    lessons: [
      {
        id: "premieres-balises",
        title: "Les premières balises",
        theory: [
          { type: "text", md: "Le **HTML** décrit le contenu d'une page avec des **balises**. Une balise s'ouvre `<h1>` et se ferme `</h1>`, et englobe le contenu qu'elle met en forme." },
          { type: "code", code: "<h1>Mon blog de voyage</h1>\n<h2>Étape 1 : Lyon</h2>\n<p>Voici mon premier paragraphe de texte.</p>\n<button>Cliquez ici</button>" },
          { type: "tip", md: "`h1` = titre principal (un seul par page), `h2` à `h6` = sous-titres, `p` = paragraphe de texte, `button` = bouton." }
        ],
        quiz: [
          { q: "Quelle balise crée un paragraphe ?", options: ["<text>", "<p>", "<para>"], answer: 1 },
          { q: "Comment ferme-t-on la balise h2 ?", options: ["</h2>", "<h2/>", "<close h2>"], answer: 0 }
        ],
        exercise: {
          type: "dom",
          prompt: "Ajoute un titre principal h1 avec le texte de ton choix dans le document.",
          starter: "<!-- Écris ta balise ici -->\n",
          check: { kind: "dom", testCode: "const h1 = document.querySelector('h1');\nconst ok = h1 && h1.textContent.trim().length > 0;\ncm(ok, 'Je vois un h1 contenant du texte !');" }
        }
      },
      {
        id: "listes",
        title: "Texte et listes",
        theory: [
          { type: "text", md: "Pour lister des éléments, on utilise `<ul>` (liste à puces) ou `<ol>` (liste numérotée), qui contient des `<li>` (éléments)." },
          { type: "code", code: "<ul>\n  <li>Pommes</li>\n  <li>Bananes</li>\n  <li>Fraises</li>\n</ul>\n\n<strong>Texte important</strong>\n<em>texte en italique</em>" },
          { type: "tip", md: "`strong` met en gras, `em` en italique. Chaque élément de liste doit être à l'intérieur de la balise de liste." }
        ],
        quiz: [
          { q: "Quelle balise pour une liste à puces ?", options: ["<ol>", "<ul>", "<li>"], answer: 1 },
          { q: "Où va chaque élément de liste ?", options: ["Dans une <li>", "Directement dans <ul>", "Dans un <p>"], answer: 0 }
        ],
        exercise: {
          type: "dom",
          prompt: "Crée une liste ul contenant exactement 3 éléments li.",
          starter: "<ul>\n  <!-- tes éléments ici -->\n</ul>\n",
          check: { kind: "dom", src: "", testCode: "const items = document.querySelectorAll('ul li');\ncm(items.length === 3, 'La liste contient 3 éléments (trouvé : ' + items.length + ')');" }
        }
      },
      {
        id: "liens-images",
        title: "Liens et images",
        theory: [
          { type: "text", md: "Un **lien** se crée avec `<a>` et son attribut `href`. Une **image** se crée avec `<img>` et ses attributs `src` (le chemin de l'image) et `alt` (sa description) : c'est une balise auto-fermée, elle n'a pas de balise de fin." },
          { type: "code", code: "<a href=\"https://example.com\">Visiter le site</a>\n\n<img src=\"chat.jpg\" alt=\"Un chat endormi\">\n\n<a href=\"https://example.com\">\n  <img src=\"banniere.jpg\" alt=\"Bannière\">\n</a>" },
          { type: "tip", md: "L'attribut `alt` est obligatoire : il décrit l'image pour les non-voyants et remplace l'image si elle ne charge pas." }
        ],
        quiz: [
          { q: "Quel attribut contient l'adresse d'un lien ?", options: ["src", "link", "href"], answer: 2 },
          { q: "À quoi sert l'attribut alt d'une image ?", options: ["La décrire", "La redimensionner", "Changer sa couleur"], answer: 0 }
        ],
        exercise: {
          type: "dom",
          prompt: "Ajoute un lien vers https://example.com (href) avec un texte visible.",
          starter: "<!-- Ton lien ici -->\n",
          check: { kind: "dom", testCode: "const link = document.querySelector('a[href*=\"example.com\"]');\nconst ok = link && link.textContent.trim().length > 0;\ncm(ok, 'Le lien vers example.com est bien là, avec un texte visible !');" }
        }
      }
    ]
  },
  {
    id: "css-base",
    title: "CSS — Styliser",
    icon: "🎨",
    color: "#4f8cff",
    description: "Donne couleurs, espaces et mise en page à tes pages avec le CSS.",
    lessons: [
      {
        id: "selecteurs",
        title: "Couleurs et sélecteurs",
        theory: [
          { type: "text", md: "Le **CSS** cible des éléments HTML avec des **sélecteurs** puis applique des propriétés. On cible une balise par son nom, une classe avec `.`, un id avec `#`." },
          { type: "code", code: "h1 { color: tomato; }\n\n.titre-rouge { color: crimson; }\n#menu { background: black; }\n\np {\n  color: white;\n  background-color: #1e6fd9;\n}" },
          { type: "tip", md: "Les couleurs s'écrivent en mots-clés (`tomato`), en hexadécimal (`#1e6fd9`) ou en rgb. Pour ce cours, CSS est déjà relié à la page : tes règles s'appliquent directement." }
        ],
        quiz: [
          { q: "Comment cible-t-on la classe `carte` ?", options: ["carte {}", ".carte {}", "#carte {}"], answer: 1 },
          { q: "Quelle propriété change la couleur du texte ?", options: ["background-color", "text-color", "color"], answer: 2 }
        ],
        exercise: {
          type: "dom",
          prompt: "Mets le titre (h1.titre) en couleur tomato.",
          fixedHtml: "<h1 class=\"titre\">Ma page stylée</h1>\n<p>Un paragraphe.</p>",
          starter: "/* ton CSS ici */\n",
          check: { kind: "dom", testCode: "const h1 = document.querySelector('h1.titre');\ncm(h1 && getComputedStyle(h1).color === 'rgb(255, 99, 71)', 'Le titre est bien tomato !');" }
        }
      },
      {
        id: "box-model",
        title: "Le modèle de boîte",
        theory: [
          { type: "text", md: "Chaque élément est une **boîte** : le contenu, entouré de `padding` (espace intérieur), d'une `border` (bordure), puis de `margin` (espace extérieur)." },
          { type: "code", code: ".carte {\n  padding: 16px;\n  border: 2px solid black;\n  margin: 24px;\n  border-radius: 8px;\n}" },
          { type: "tip", md: "`border: 2px solid black` réunit en une ligne l'épaisseur, le style et la couleur. Astuce : `margin: 10px 20px` = 10 en haut/bas, 20 à gauche/droite." }
        ],
        quiz: [
          { q: "Le padding c'est l'espace…", options: ["extérieur à la bordure", "intérieur, entre bordure et contenu", "entre deux pages"], answer: 1 },
          { q: "Quelle propriété arrondit les coins ?", options: ["corner-radius", "border-radius", "rounded"], answer: 1 }
        ],
        exercise: {
          type: "dom",
          prompt: "Donne à .carte un padding de 16px et une bordure noire continue de 2px.",
          fixedHtml: "<div class=\"carte\">Une carte sympa</div>",
          starter: "/* ton CSS ici */\n",
          check: { kind: "dom", testCode: "const c = document.querySelector('.carte');\nconst s = c && getComputedStyle(c);\ncm(s && s.paddingTop === '16px' && s.borderTopWidth === '2px' && s.borderTopStyle === 'solid', 'Padding 16px et bordure 2px solid appliqués !');" }
        }
      },
      {
        id: "typo",
        title: "Texte et polices",
        theory: [
          { type: "text", md: "Le **CSS** contrôle aussi le texte : sa **taille** (`font-size`), sa **police** (`font-family`), sa **graisse** (`font-weight`) et son **alignement** (`text-align`)." },
          { type: "code", code: "p {\n  font-size: 18px;\n  font-family: Georgia, serif;\n  font-weight: bold;\n  text-align: center;\n}" },
          { type: "tip", md: "`font-weight: bold` (ou `700`) met en gras. `text-align` accepte `center`, `left` ou `right`. Combine deux polices avec une complémentaire : `Georgia, serif` = Georgia d'abord, sinon la police serif par défaut." }
        ],
        quiz: [
          { q: "Quelle propriété met le texte en gras ?", options: ["text-bold", "font-weight", "weight"], answer: 1 },
          { q: "`text-align: center` sert à…", options: ["centrer le texte", "changer la police", "agrandir le texte"], answer: 0 }
        ],
        exercise: {
          type: "dom",
          prompt: "Rends le paragraphe .annonce en gras (font-weight: bold) et centré (text-align: center).",
          fixedHtml: "<p class=\"annonce\">Le site ouvre samedi !</p>",
          starter: "/* ton CSS ici */\n",
          check: { kind: "dom", testCode: "const p = document.querySelector('.annonce');\nconst s = p && getComputedStyle(p);\ncm(s && (s.fontWeight === 'bold' || s.fontWeight === '700') && s.textAlign === 'center', 'Texte en gras et centré, parfait !');" }
        }
      },
      {
        id: "flexbox",
        title: "Flexbox : aligner",
        theory: [
          { type: "text", md: "**Flexbox** permet d'aligner et de répartir facilement des éléments : on déclare `display: flex` sur le parent, puis on contrôle l'arrangement." },
          { type: "code", code: ".menu {\n  display: flex;\n  gap: 12px;\n  justify-content: space-between;\n  align-items: center;\n}" },
          { type: "tip", md: "`justify-content` aligne sur l'axe principal, `align-items` sur l'axe secondaire. `gap` crée un espace régulier entre les éléments." }
        ],
        quiz: [
          { q: "Où met-on `display: flex` ?", options: ["Sur chaque enfant", "Sur le parent", "Sur body obligatoirement"], answer: 1 },
          { q: "Quelle propriété espace les éléments entre eux ?", options: ["space", "gap", "margin-auto"], answer: 1 }
        ],
        exercise: {
          type: "dom",
          prompt: "Rends la barre .barre flexible avec display: flex.",
          fixedHtml: "<nav class=\"barre\"><a>Accueil</a><a>Contact</a></nav>",
          starter: "/* ton CSS ici */\n",
          check: { kind: "dom", testCode: "const b = document.querySelector('.barre');\ncm(b && getComputedStyle(b).display === 'flex', 'La barre est passée en flex !');" }
        }
      }
    ]
  }
];
