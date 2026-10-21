---
name: team-balancer-simulation
description: Simule, teste et audite mathématiquement l'algorithme d'équilibrage des équipes de 3 personnes pour le hackathon. Utiliser pour vérifier la parité de genre, l'écart-type des commits entre équipes et la gestion des cas limites d'effectifs.
---

# Team Balancer Simulation & Audit

Cette skill fournit la méthodologie et les outils pour auditer, simuler et valider mathématiquement tout algorithme de composition d'équipes au sein du projet.

---

## 1. Objectifs de l'Audit

Chaque fois que l'algorithme dans `src/lib/algorithm.ts` est créé ou modifié, il doit être évalué selon trois métriques clés :

1. **Équilibre des compétences (commits)** :
   - L'écart-type des moyennes de commits entre équipes $\sigma$ doit être le plus faible possible.
   - Ratio $\frac{\sigma}{\mu} < 0.20$ (coefficient de variation inférieur à 20% sur un échantillon normalisé).
2. **Indice de mixité de genre** :
   - Pourcentage d'équipes mixtes :
     $$P_{\text{mixte}} = \frac{\text{Nombre d'équipes comportant au moins 1 H et 1 F}}{\text{Nombre total d'équipes}} \times 100$$
   - Si $\min(\sum H, \sum F) \ge K$ (nombre d'équipes), alors $P_{\text{mixte}}$ doit atteindre 100%.
3. **Invariance des tiers** :
   - Vérifier qu'aucun échange intra-chapeau n'a déplacé un profil du chapeau fort vers le chapeau faible.

---

## 2. Procédure d'Évaluation Étape par Étape

### Étape 1 : Charger les jeux d'essais
Consulter les scénarios de référence disponibles dans :
[Scénarios de test de référence](./references/test-scenarios.md)

Les trois jeux d'essais fondamentaux sont :
- **Scénario A** : 18 participants (multiple de 3 parfait, distribution normale des commits, parité 50/50).
- **Scénario B** : 20 participants ($N \pmod 3 = 2$, évaluation de la création d'équipes de 4 ou 2).
- **Scénario C** : 21 participants avec forte asymétrie de genre (17 Hommes, 4 Femmes).

### Étape 2 : Exécution de la simulation
Exécuter l'algorithme sur chaque jeu d'essai et collecter la sortie :
```typescript
import { balanceTeams } from '@/lib/algorithm';
import { scenarioA, scenarioB, scenarioC } from './test-scenarios';

const resA = balanceTeams(scenarioA);
console.log('Moyenne commits par équipe :', resA.teams.map(t => t.averageCommits));
console.log('Mixité :', resA.stats.mixedTeamsPercentage + '%');
```

### Étape 3 : Critères de succès / validation
Un test d'équilibrage est déclaré **VALIDE** si :
- Tous les participants de la liste d'entrée sont assignés à exactement une équipe (aucune perte, aucun doublon).
- La taille de chaque équipe est strictement comprise entre 2 et 4 personnes (cible : 3).
- L'écart entre l'équipe ayant la plus forte moyenne de commits et celle ayant la plus faible moyenne ne dépasse pas $1.5 \times \text{écart moyen intra-chapeau}$.
- Aucune équipe mono-genre n'existe si le nombre de personnes du genre minoritaire est suffisant pour couvrir chaque équipe.
