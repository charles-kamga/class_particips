# UI / UX Guidelines — Modale & Table Interactive

Ce document décrit les spécifications ergonomiques, les micro-interactions et les standards d'interface pour l'application **Hackathon Team Balancer**.

---

## 1. Ergonomie de la Modale d'Enregistrement

La modale popup est le point d'interaction central lors de l'accueil de l'événement. Elle doit être conçue pour une saisie ultra-rapide à une main ou au clavier seul.

### A. Déclenchement & Raccourcis
- Bouton principal visible dans l'en-tête : `+ Nouveau Participant` (style contrasté, bouton d'action primaire).
- Raccourci clavier global : la touche `N` (lorsqu'aucun autre champ n'a le focus) ouvre directement la modale.
- Fermeture rapide : touche `Échap` ou clic en dehors sur le backdrop.

### B. Champs du Formulaire
1. **Nom du participant** (`input text`) :
   - `autoFocus={true}` systématique dès l'ouverture.
   - Placeholder évocateur : *ex: Alex Martin*.
2. **Nombre de commits** (`input number`) :
   - Valeur minimale : `0`.
   - Stepper réactif avec boutons d'ajustement rapide (`+1`, `+5`, `+10`).
3. **Switch Sexe (Homme ♂ / Femme ♀)** :
   - Composant Segmented Control / Switch interactif à bascule instantanée.
   - État Homme : Teinte bleue/ardoise (`bg-blue-600/10 text-blue-500 border-blue-500/30`).
   - État Femme : Teinte rose/violette (`bg-rose-600/10 text-rose-500 border-rose-500/30`).
   - Raccourci de bascule : possibilité de basculer avec les flèches directionnelles $\leftarrow / \rightarrow$ ou `Tab + Espace`.

### C. Validation & Saisie en Série (Batch Entry)
- **Touche `Entrée`** : valide le formulaire, ajoute le participant au tableau et ferme la modale.
- **Bouton `Ajouter et suivant`** :
  - Ajoute le participant au tableau avec notification discrète (toast / badge vert).
  - Réinitialise le formulaire à vide.
  - Repositionne le focus immédiatement sur le champ Nom.
  - Permet d'enregistrer 50 participants à la chaîne en quelques minutes.

---

## 2. Tableau Réactif & Classement en Temps Réel

Le tableau reflète en temps réel la dynamique du hackathon.

### A. Structure des Colonnes
1. **Rang** :
   - Badges dorés/argentés/bronzés pour le Top 3 (#1 🥇, #2 🥈, #3 🥉).
   - Numéro de série simple pour les suivants (#4, #5, ...).
2. **Nom du participant** :
   - Typographie claire, avatar généré ou initiale stylisée.
3. **Nombre de commits** :
   - Affichage en valeur numérique mise en avant.
   - Tri automatique et instantané par ordre décroissant (le participant le plus actif remonte automatiquement en tête).
4. **Sexe** :
   - Switch ou badge interactif permettant de corriger le genre en un clic sans ouvrir de menu.
5. **Actions** :
   - Bouton d'édition rapide inline.
   - Bouton de suppression avec icône poubelle (avec confirmation rapide pour éviter les fausses manipulations).

### B. Barre d'Outils Supérieure (Statistiques & Filtres)
- **Compteurs en direct** :
  - Total participants : $N$.
  - Total commits cumulés : $\sum C$.
  - Répartition des genres : $H$ Hommes / $F$ Femmes (avec jauge de proportion).
  - Moyenne de commits par personne : $\mu$.
- **Barre de recherche** : filtre en temps réel par nom.
- **Actions rapides** :
  - Bouton `Vider la liste` (avec alerte de confirmation).
  - Boutons `Exporter CSV` / `Importer CSV`.

---

## 3. Visualisation des Équipes (Bento Grid)

Une fois la génération déclenchée via le bouton `Générer les équipes de 3` :
- Affichage en cartes modulaires (Bento Grid 3 colonnes sur desktop, 1 colonne sur mobile).
- Chaque carte d'équipe contient :
  - Le nom de l'équipe (*Équipe 1*, *Équipe 2*, etc.).
  - Les 3 membres (ou 2/4 si effectif impair) avec leur niveau de commits et leur badge de genre.
  - Statistiques de l'équipe : Total des commits, moyenne de l'équipe, badge d'équilibre de genre (*ex: Mixte 2H/1F*, *Équilibrée*).
- Bouton `Copier les équipes` (génère un format texte/markdown propre prêt à être collé dans Discord, Slack ou un document partagé).
- Bouton `Rééquilibrer / Relancer` (recalcule une variante équivalente avec un léger mélange aléatoire intra-chapeau).

---

## 4. Charte Graphique & Accessibilité

- Palette par défaut : Thème sombre moderne (Dark slate / Zinc / Emerald accents) avec prise en charge du thème clair.
- Respect strict des contrastes WCAG 2.2 AA (ratio de contraste minimal de 4.5:1 sur les textes).
- Transitions douces (200ms ease-out) sur les ajouts et suppressions de lignes.
