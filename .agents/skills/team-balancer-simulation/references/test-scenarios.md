# Scénarios de Test de Référence — Simulation d'Équilibrage

Ces jeux de données permettent d'évaluer la robustesse statistique de l'algorithme d'équilibrage d'équipes de 3 personnes.

---

## Scénario A : Échantillon Équilibré (18 Participants)
- **Objectif** : Vérifier le Snake Draft standard sur un multiple exact de 3 avec parité parfaite.
- **Population** : 18 participants, 9 Hommes, 9 Femmes.
- **Commits** : Échelonnés de 8 à 145.

```json
[
  { "id": "p1", "name": "Camille", "commits": 145, "gender": "female" },
  { "id": "p2", "name": "Thomas", "commits": 138, "gender": "male" },
  { "id": "p3", "name": "Sarah", "commits": 120, "gender": "female" },
  { "id": "p4", "name": "David", "commits": 115, "gender": "male" },
  { "id": "p5", "name": "Emma", "commits": 98, "gender": "female" },
  { "id": "p6", "name": "Lucas", "commits": 90, "gender": "male" },
  { "id": "p7", "name": "Léa", "commits": 78, "gender": "female" },
  { "id": "p8", "name": "Antoine", "commits": 74, "gender": "male" },
  { "id": "p9", "name": "Chloé", "commits": 65, "gender": "female" },
  { "id": "p10", "name": "Maxime", "commits": 58, "gender": "male" },
  { "id": "p11", "name": "Inès", "commits": 52, "gender": "female" },
  { "id": "p12", "name": "Alexandre", "commits": 47, "gender": "male" },
  { "id": "p13", "name": "Manon", "commits": 35, "gender": "female" },
  { "id": "p14", "name": "Nicolas", "commits": 28, "gender": "male" },
  { "id": "p15", "name": "Jade", "commits": 22, "gender": "female" },
  { "id": "p16", "name": "Julien", "commits": 18, "gender": "male" },
  { "id": "p17", "name": "Clara", "commits": 12, "gender": "female" },
  { "id": "p18", "name": "Romain", "commits": 8, "gender": "male" }
]
```
- **Résultat attendu** : 6 équipes de 3 personnes. 100% d'équipes mixtes (au moins 1 H et 1 F par équipe). Moyennes de commits très resserrées.

---

## Scénario B : Effectif non multiple de 3 (20 Participants)
- **Objectif** : Valider l'intégration des 2 participants excédentaires sans exclusion.
- **Population** : 20 participants, 11 Hommes, 9 Femmes.
- **Formule** : $20 = (4 \times 3) + (2 \times 4)$.
- **Résultat attendu** : 4 équipes de 3 personnes et 2 équipes de 4 personnes. Zéro participant isolé.

---

## Scénario C : Forte Disparité de Genre (21 Participants)
- **Objectif** : Vérifier la dispersion maximale du genre minoritaire sans dégrader les tiers de compétence.
- **Population** : 21 participants, 17 Hommes, 4 Femmes.
- **Commits** : Forte variance (1 à 250 commits).
- **Résultat attendu** : 7 équipes de 3 personnes. Les 4 femmes doivent être réparties dans 4 équipes distinctes (aucune équipe ne doit en avoir 2 tant qu'il reste des équipes sans femme).
