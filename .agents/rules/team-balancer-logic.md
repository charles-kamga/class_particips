# Team Balancer Logic — Algorithme de Composition des Équipes

Ce document détaille la logique algorithmique, les contraintes et les invariants mathématiques pour composer des équipes équilibrées de 3 personnes au sein de l'application.

---

## 1. Objectifs & Critères de Matchmaking

Soit un ensemble de $N$ participants $P = \{p_1, p_2, \dots, p_N\}$, où chaque participant dispose :
- d'un nombre de commits $C(p) \ge 0$,
- d'un genre $G(p) \in \{\text{Homme}, \text{Femme}\}$.

Le but est de partitionner $P$ en $K$ équipes $T_1, T_2, \dots, T_K$ respectant simultanément deux objectifs :
1. **Équilibre des compétences (commits)** : Chaque équipe doit réunir un profil fort, un intermédiaire et un débutant. L'écart-type de la moyenne des commits entre équipes doit être minimisé :
   $$\min \sigma\left(\left\{\overline{C}(T_k)\right\}_{k=1}^K\right)$$
2. **Mixité de genre** : Maximiser la présence des deux genres dans un maximum d'équipes, en évitant les équipes mono-genre dès lors que la composition globale du hackathon le permet.

---

## 2. Découpage en 3 Chapeaux (Tiers) & Snake Draft

L'algorithme fonctionne en 4 étapes séquentielles :

### Étape 1 : Tri décroissant
Les participants sont triés par nombre de commits décroissant :
$$C(p_1) \ge C(p_2) \ge \dots \ge C(p_N)$$

### Étape 2 : Découpage en 3 chapeaux de niveau
Le groupe est divisé en 3 segments de tailles quasi égales :
- **Chapeau 1 (Forts / Leaders techniques)** : Les $K$ premiers participants.
- **Chapeau 2 (Intermédiaires)** : Les $K$ participants suivants.
- **Chapeau 3 (Débutants / En apprentissage)** : Les $K$ participants restants.

### Étape 3 : Distribution Serpentine (Snake Draft)
Pour équilibrer naturellement les scores cumulés :
1. **Chapeau 1** : Attribuer dans l'ordre croissant $1 \to K$ :
   $$\text{Équipe } 1 \leftarrow p_1, \quad \text{Équipe } 2 \leftarrow p_2, \quad \dots, \quad \text{Équipe } K \leftarrow p_K$$
2. **Chapeau 2** : Attribuer dans l'ordre inversé $K \to 1$ :
   $$\text{Équipe } K \leftarrow p_{K+1}, \quad \dots, \quad \text{Équipe } 1 \leftarrow p_{2K}$$
3. **Chapeau 3** : Attribuer dans l'ordre croissant $1 \to K$ :
   $$\text{Équipe } 1 \leftarrow p_{2K+1}, \quad \dots, \quad \text{Équipe } K \leftarrow p_{3K}$$

---

## 3. Optimisation de la Mixité de Genre (Swaps Intra-Chapeau)

Pour respecter le critère de parité sans dégrader l'équilibre des commits :

> [!IMPORTANT]
> **Règle absolue des échanges intra-chapeaux :**
> Deux participants ne peuvent être échangés entre deux équipes que s'ils appartiennent au **même chapeau** de niveau (ex: un membre fort ne s'échange qu'avec un membre fort). Cela garantit que la répartition des commits reste strictement équilibrée.

### Heuristique d'optimisation
1. Calculer le score de disparité de genre de chaque équipe :
   $$\Delta_{\text{genre}}(T_k) = |H_k - F_k|$$
2. Identifier les équipes mono-genre (ex: 3 Hommes ou 3 Femmes).
3. Si une équipe mono-genre $T_i$ et une équipe diversifiée $T_j$ possèdent des membres du même chapeau de genre opposé :
   - Effectuer un swap du membre de $T_i$ avec celui de $T_j$.
   - Valider le swap si la disparité globale $\sum_{k=1}^K \Delta_{\text{genre}}(T_k)$ diminue.

---

## 4. Gestion des Effectifs Non Multiples de 3

Lorsque $N \pmod 3 \neq 0$, aucun participant ne doit être exclu :

| Cas | Calcul ($N = 3K + R$) | Stratégie d'attribution | Exemple |
| :--- | :--- | :--- | :--- |
| **$R = 0$** | $K$ équipes de 3 | Exactement $K$ équipes de 3 personnes. | $N=18 \implies 6$ équipes de 3 |
| **$R = 1$** | $K - 1$ équipes de 3 et 2 équipes de 4 | Les 4 participants des 2 équipes élargies reçoivent un renfort d'expérience médiane pour ne pas désavantager les équipes de 3. | $N=19 \implies 5$ équipes de 3 et 1 équipe de 4 (ou $N=22 \implies 6$ équipes de 3 et 1 de 4) |
| **$R = 2$** | $K$ équipes de 3 et 1 équipe de 2 | Une équipe de 2 personnes bénéficie de 2 profils plus expérimentés, ou tolérance pour 2 équipes de 4. | $N=20 \implies 4$ équipes de 3 et 2 équipes de 4 |

---

## 5. Interface TypeScript Requise

L'algorithme doit être implémenté sous forme d'une fonction pure sans état :

```typescript
export interface Participant {
  id: string;
  name: string;
  commits: number;
  gender: 'male' | 'female';
  createdAt: number;
}

export interface Team {
  id: string;
  name: string;
  members: Participant[];
  totalCommits: number;
  averageCommits: number;
  maleCount: number;
  femaleCount: number;
}

export interface BalancingResult {
  teams: Team[];
  stats: {
    totalParticipants: number;
    totalTeams: number;
    meanTeamCommits: number;
    standardDeviation: number;
    mixedTeamsPercentage: number;
  };
}

export function balanceTeams(participants: Participant[]): BalancingResult;
```
