# Hackathon Team Balancer ⚡

Application web ultra-rapide hébergée sur **Vercel** pour organiser et animer des hackathons : enregistrement en direct des participants, récupération automatique des commits GitHub du mois d'octobre avec auto-complétion, classement en temps réel et composition d'équipes de 3 personnes équilibrées (mixité des compétences et parité de genre).

---

## 🚀 Fonctionnalités Clés

### 1. Enregistrement Hyper-Interactif (Modale Popup)
- **Déclenchement rapide** : Bouton `+ Nouveau Participant` ou raccourci clavier global <kbd>N</kbd>.
- **Assistance GitHub (Auto-complétion)** : Saisie assistée du pseudo GitHub avec suggestions d'utilisateurs et avatars en temps réel.
- **Filtre Commits d'Octobre** : Calcul automatique et instantané des commits réalisés exclusivement entre le **1er et le 31 octobre** via l'API GitHub.
- **Switch Homme ♂ / Femme ♀** : Bascule interactive et visuelle pour assurer l'équilibrage de parité.
- **Saisie à la chaîne** : Touche <kbd>Entrée</kbd> pour valider, ou bouton « Ajouter et suivant » pour enregistrer des dizaines de participants à la chaîne sans fermer la modale.
- **Fallback manuel** : Possibilité d'éditer ou de saisir le nombre de commits manuellement à tout moment.

### 2. Tableau Réactif & Classement en Temps Réel
- Classement dynamique et automatique par nombre de commits décroissant.
- Podiums mis en valeur avec badges médailles (#1 🥇, #2 🥈, #3 🥉).
- Avatars GitHub officiels et liens vers les profils.
- Switch de genre interactif directement modifiable dans chaque ligne du tableau.
- Édition inline rapide (nom et commits) et suppression de participants.
- Barre de recherche instantanée par nom.

### 3. Matchmaking & Algorithme d'Équipes de 3
- **Snake Draft par 3 Chapeaux** : Segmentation des participants en 3 niveaux (Forts / Moyens / Faibles) pour garantir un équilibre de compétences dans chaque équipe.
- **Optimisation de la Parité** : Permutations intra-chapeaux pour maximiser la mixité de genre sans altérer l'équilibre des commits.
- **Gestion des restes ($N \pmod 3 \neq 0$)** : Prise en charge automatique via des équipes de 4 ou 2 sans laisser de participant exclu.
- **Visualisation Bento Grid** : Cartes d'équipes avec statistiques détaillées (moyenne de l'équipe, total de commits, jauge de parité).
- **Export & Partage** : Copie au format Markdown prêt pour Discord/Slack et export CSV.

### 4. Persistance & Import / Export
- Sauvegarde locale automatique dans le `localStorage` du navigateur (SSR-safe, zéro perte au rechargement).
- Modale d'exportation (CSV et JSON) et d'importation de fichiers.
- Bouton pour charger 18 participants d'exemple (Démo) en un clic.

---

## 🛠️ Stack Technique

- **Framework** : [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/)
- **Typage** : [TypeScript](https://www.typescriptlang.org/) (mode strict)
- **Styling** : [Tailwind CSS v4](https://tailwindcss.com/)
- **Iconographie** : [Lucide React](https://lucide.dev/)
- **Animations & Effets** : [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Hébergement cible** : [Vercel](https://vercel.com/)

---

## 💻 Démarrage Rapide

### Prérequis
- [Node.js](https://nodejs.org/) (v18.17+ ou v20+)
- npm, yarn, pnpm ou bun

### Installation

1. Cloner le projet :
   ```bash
   git clone git@github.com:charles-kamga/class_particips.git
   cd class_particips
   ```

2. Installer les dépendances :
   ```bash
   npm install
   ```

3. (Optionnel) Configurer un token GitHub pour augmenter les quotas de l'API :
   Créer un fichier `.env.local` :
   ```bash
   GITHUB_TOKEN=ghp_votre_token_ici
   ```

4. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```
   L'application est accessible sur [http://localhost:3000](http://localhost:3000).

---

## 🧪 Tests & Build

- **Exécuter les simulations d'algorithme d'équilibrage** :
  ```bash
  npm test
  ```

- **Compiler le build de production pour Vercel** :
  ```bash
  npm run build
  ```

---

## 🌐 Déploiement sur Vercel

Le projet est nativement optimisé pour Vercel :
1. Importez votre dépôt sur [vercel.com](https://vercel.com).
2. (Optionnel) Ajoutez la variable d'environnement `GITHUB_TOKEN`.
3. Cliquez sur **Deploy**.
