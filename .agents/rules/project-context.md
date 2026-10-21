# Project Context — Hackathon Team Balancer

## 1. Vue d'Ensemble & Mission

L'application **Hackathon Team Balancer** est un outil web interactif conçu pour les organisateurs de hackathons et d'événements tech. Son but est d'enregistrer rapidement les participants, d'établir un classement en direct basé sur leur activité GitHub (nombre de commits), et de générer automatiquement des **équipes de 3 personnes équilibrées** à la fois en termes d'expérience technique (commits) et de parité de genre (Homme / Femme).

---

## 2. Utilisateurs Cibles & Cas d'Usage

- **Utilisateur principal** : L'organisateur du hackathon à la table d'accueil ou en régie.
- **Contrainte terrain** : Lors de l'accueil, les participants arrivent en flux continu. L'enregistrement doit être quasi instantané (moins de 5 secondes par participant), sans frictions, sans rechargement de page et sans dépendance à des services tiers qui pourraient être lents ou subir des limites de quota (rate limiting).
- **Après l'accueil** : L'organisateur lance la répartition des équipes en un clic, visualise l'équilibre, peut réajuster si nécessaire, et exporte le résultat pour l'affichage ou l'annonce aux participants.

---

## 3. Périmètre Fonctionnel

### A. Enregistrement Hyper-Interactif (Modale Popup & API GitHub)
- Déclenchement via bouton visible `+ Nouveau Participant` ou raccourci clavier `N`.
- Formulaire enrichi :
  - **Pseudo GitHub avec auto-complétion** : suggestion en direct de profils GitHub (avatar, login) avec debounce.
  - **Calcul automatique des commits d'octobre** : interroge l'API GitHub (`YYYY-10-01..YYYY-10-31`) pour préremplir directement les commits d'octobre du participant.
  - **Nom du participant** : prérempli automatiquement depuis le profil GitHub ou saisi manuellement.
  - **Sexe** : switch interactif Homme ♂ / Femme ♀.
  - **Fallback manuel** : possibilité d'ajuster ou saisir le nombre manuellement à tout moment (par exemple si quota API dépassé ou profil privé).
- Validation :
  - Touche `Entrée` pour enregistrer et fermer.
  - Bouton `Ajouter et suivant` pour enchaîner sans fermer la modale.

### B. Tableau & Classement en Direct
- Colonnes :
  - Rang (#1, #2, #3, ...) recalculé dynamiquement.
  - Nom du participant.
  - Nombre de commits (critère de tri décroissant).
  - Sexe (badge visuel ou switch modifiable en ligne).
  - Actions (Édition rapide, Suppression avec confirmation discrète).
- Tri automatique en direct selon les commits.
- Indicateurs visuels (médailles ou badges pour les meilleurs contributeurs).

### C. Génération d'Équipes de 3 Personnes
- Regroupement des participants en équipes de 3 en mélangeant :
  - Les profils "forts" (hauts commits) avec les "moyens" et les "faibles" (snake draft par chapeaux).
  - Les genres pour garantir une diversité maximale sur l'ensemble des équipes.
- Tolérance pour les effectifs non multiples de 3 :
  - Ex: pour 20 participants $\rightarrow$ 4 équipes de 3 et 2 équipes de 4 (pas d'exclus).
- Affichage des équipes : cartes modulaires (Bento) avec moyenne de commits, total de commits, et répartition H/F.
- Régénération avec variantes équivalentes.
- Export immédiat (presse-papier texte/markdown, téléchargement CSV).

---

## 4. Architecture & Contraintes Techniques

- **Hébergement** : Vercel.
- **Framework** : Next.js 15 (App Router), React 19, TypeScript strict.
- **Styling** : Tailwind CSS avec mode sombre/clair soigné et composants inspirés de Shadcn UI.
- **Données & Persistance** :
  - Mode **Offline-first** : aucune dépendance à une base de données cloud payante ou complexe.
  - `localStorage` pour la persistance locale automatique.
  - Import / Export JSON et CSV pour la sauvegarde et le transfert entre machines.
- **Performance** : Application ultra-rapide (score Lighthouse 95+, 0 ms de délai serveur, animations fluides à 60 fps).
