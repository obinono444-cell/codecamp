# CodeCamp — Apprends à coder

Application web statique (HTML/CSS/JS vanilla, aucun build, aucune dépendance) pour apprendre les bases du code en français.

## Fonctionnalités

- **3 cours** : JavaScript — Les bases, HTML — Structurer une page, CSS — Styliser (13 leçons).
- **Leçons interactives** : théorie, exemples de code, quiz corrigés.
- **Éditeur de code intégré** avec exécution en bac à sable (iframe `sandbox`, isolée de la page).
- **Correction automatique** :
  - JavaScript : le code s'exécute dans le bac à sable et des tests comparent la sortie console attendue.
  - HTML/CSS : l'exercice est rendu dans un aperçu en direct et vérifié par des tests sur le DOM réel (structure, couleurs calculées, padding, flexbox…).
- **Suivi de progression** : leçons terminées, XP, série de jours consécutifs, sauvegardés dans `localStorage`.
- **Intro « boot hacker »** : séquence de démarrage animée (logo pulsant, lignes de boot, ACCÈS AUTORISÉ) à la première visite de chaque session — clic pour passer.
- **Recherche de leçons** : barre de recherche dans la barre du haut (ou touche `/`) — résultats en direct, navigation clavier flèches + Entrée.
- **Onboarding** : modal de bienvenue + visite guidée interactive (spotlight), rejouable via le bouton « ? » de la barre de navigation.
- **Mode hacker** : pluie Matrix sur l'accueil, plein écran via le bouton `>_` de la barre de navigation (préférence mémorisée).
- **Page Terminal** (`#/terminal`) : cheat sheets CMD / PowerShell / Git Bash avec bouton « Copier », + terminal simulé interactif (tape `help`, `neofetch`, `matrix`, `hack`…).
- **CodeBot, IA intégrée** : assistant local qui explique les notions, lance des quiz et navigue pour toi (« ouvre JavaScript ») — 100 % local, aucune API externe, aucune donnée envoyée.
- **Panneau Admin (invisible pour les visiteurs)** : accès réservé à l'admin — raccourci **Ctrl+Alt+A** ou tape secrètement « admin » au clavier. Connexion par **adresse mail + mot de passe** (stockés hachés), notifications toast, avatar admin ; permet de fermer le site (écran de verrouillage avec message personnalisé pour les visiteurs) et de le rouvrir, de changer le mot de passe et de réinitialiser la progression. Note : le verrou est appliqué par navigateur ; pour fermer le site pour tous, désactiver GitHub Pages.
- **Animations** : transitions de pages, compteurs animés, confettis et modal de célébration à la fin d'une leçon, coloration syntaxique des exemples.
- Brouillons de code conservés par leçon, navigation leçon précédente / suivante, plans de cours.

## Lancer l'application

Aucune installation nécessaire :

```bash
# option 1 : ouvrir directement index.html dans un navigateur
xdg-open index.html

# option 2 : petit serveur local
python3 -m http.server 8000
# puis http://localhost:8000
```

## Structure

```
index.html      page principale (SPA, routage par hash)
css/styles.css  thème sombre, styles de l'éditeur et des pages, animations
js/lessons.js   contenu des cours (théorie, quiz, exercices, tests)
js/app.js       logique : rendu, quiz, éditeur, correcteur, progression
js/tour.js      onboarding : modal de bienvenue, visite guidée, confettis, modals
js/matrix.js    pluie Matrix : accueil + mode hacker plein écran (bouton >_)
js/terminal.js  page Terminal : cheat sheets CMD/PowerShell/Bash + simulateur
js/ai.js        CodeBot : assistant IA local (explications, quiz, navigation)
js/intro.js     intro « boot hacker » au premier chargement de la session
js/search.js    recherche globale des leçons (touche /)
```

## Ajouter une leçon

Tout le contenu vit dans `js/lessons.js` : ajouter un objet dans `lessons` d'un cours suffit.

- Exercice JavaScript : `check: { kind: "run", tests: [{ code, expect }] }` (le test s'exécute dans le même scope que le code de l'apprenant) ou `check: { kind: "run", expected: [...] }` pour comparer la sortie directe.
- Exercice HTML : `type: "dom"` + `check: { kind: "dom", testCode }` (fonction `cm(pass, message)` disponible).
- Exercice CSS : `type: "dom"` + `fixedHtml` = page HTML sur laquelle le CSS de l'apprenant s'applique.
