# CodeCamp — Apprends à coder

Application web statique (HTML/CSS/JS vanilla, aucun build, aucune dépendance) pour apprendre les bases du code en français.

## Fonctionnalités

- **3 cours** : JavaScript — Les bases, HTML — Structurer une page, CSS — Styliser (11 leçons).
- **Leçons interactives** : théorie, exemples de code, quiz corrigés.
- **Éditeur de code intégré** avec exécution en bac à sable (iframe `sandbox`, isolée de la page).
- **Correction automatique** :
  - JavaScript : le code s'exécute dans le bac à sable et des tests comparent la sortie console attendue.
  - HTML/CSS : l'exercice est rendu dans un aperçu en direct et vérifié par des tests sur le DOM réel (structure, couleurs calculées, padding, flexbox…).
- **Suivi de progression** : leçons terminées, XP, série de jours consécutifs, sauvegardés dans `localStorage`.
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
css/styles.css  thème sombre, styles de l'éditeur et des pages
js/lessons.js   contenu des cours (théorie, quiz, exercices, tests)
js/app.js       logique : rendu, quiz, éditeur, correcteur, progression
```

## Ajouter une leçon

Tout le contenu vit dans `js/lessons.js` : ajouter un objet dans `lessons` d'un cours suffit.

- Exercice JavaScript : `check: { kind: "run", tests: [{ code, expect }] }` (le test s'exécute dans le même scope que le code de l'apprenant) ou `check: { kind: "run", expected: [...] }` pour comparer la sortie directe.
- Exercice HTML : `type: "dom"` + `check: { kind: "dom", testCode }` (fonction `cm(pass, message)` disponible).
- Exercice CSS : `type: "dom"` + `fixedHtml` = page HTML sur laquelle le CSS de l'apprenant s'applique.
