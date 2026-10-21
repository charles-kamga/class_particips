# Hackathon Team Balancer — Antigravity Agent Guidelines

Bienvenue sur le projet **Hackathon Team Balancer**. Ce document définit les directives prioritaires et immuables que tout agent Antigravity doit respecter lorsqu'il intervient sur ce dépôt.

---

## 1. Objectif du Projet

Développer une application web ultra-rapide hébergée sur **Vercel** pour organiser un hackathon. L'application a pour rôles principaux :
1. **Enregistrer les participants** via une modale popup hyper-interactive (Nom, nombre de commits GitHub, switch interactif Homme ♂ / Femme ♀).
2. **Classer en direct les participants** dans un tableau réactif ordonné par nombre de commits décroissant.
3. **Générer des équipes équilibrées de 3 personnes** selon un algorithme multi-critères :
   - Mixité des niveaux (association de profils forts, moyens et faibles).
   - Mixité de genre (répartition équilibrée Homme / Femme sans dégrader l'équilibre des commits).
   - Prise en charge des effectifs non multiples de 3 via des équipes de 4 ou 2 personnes.

---

## 2. Principes Architecturaux & Contraintes Immuables

- **Stack Technique** : Next.js 15 (App Router), React 19, TypeScript (mode strict), Tailwind CSS, Lucide React.
- **Hébergement Cible** : Vercel (zéro latence, optimisation du build statique).
- **Zéro Dépendance Backend / API Externe** :
  - La saisie du nombre de commits est **100% manuelle** par l'organisateur dans la modale. Ne jamais imposer d'appel à l'API GitHub.
  - La persistance des données repose sur le **`localStorage` du navigateur**, complétée par des fonctions d'export et d'import (JSON et CSV).
- **Pureté Algorithmique** :
  - Toute la logique de tri, de partitionnement et d'équilibrage des équipes doit résider dans des fonctions TypeScript pures dans `src/lib/`, totalement isolées de l'interface utilisateur et couvertes par des tests unitaires automatisés.

---

## 3. Organisation de la Configuration Agent (`.agents/`)

Pour approfondir les règles spécifiques, référez-vous systématiquement aux fichiers dédiés :

- [.agents/rules/project-context.md](file:///.agents/rules/project-context.md) : Définition des besoins, contraintes Vercel et fonctionnement offline-first.
- [.agents/rules/team-balancer-logic.md](file:///.agents/rules/team-balancer-logic.md) : Spécification mathématique de l'algorithme des chapeaux (3 tiers), des permutations de genre et des cas limites.
- [.agents/rules/ui-ux-guidelines.md](file:///.agents/rules/ui-ux-guidelines.md) : Raccourcis clavier (`N`, `Entrée`), autofocus, switch toggle H/F, feedback visuel immédiat.
- [.agents/rules/coding-standards.md](file:///.agents/rules/coding-standards.md) : Standards TypeScript, structure des dossiers et hooks de stockage.
- [.agents/skills/team-balancer-simulation/SKILL.md](file:///.agents/skills/team-balancer-simulation/SKILL.md) : Procédure pour tester et auditer la qualité statistique des compositions d'équipes.

---

## 4. Règles d'Intervention pour les Agents

1. **Ne pas sur-complexifier** : Ne pas ajouter d'authentification utilisateur, de base de données externe ou de services cloud payants. Le projet doit rester autonome, instantané et gratuit.
2. **Respecter la fluidité événementielle** : Chaque action utilisateur (ajout, modification, suppression, génération d'équipe) doit s'exécuter en moins de 16 ms (60 fps), sans freeze ni rechargement.
3. **Tester avant de valider** : Toute modification de l'algorithme d'équilibrage doit être validée via les scénarios de simulation décrits dans la skill `team-balancer-simulation`.
