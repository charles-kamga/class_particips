# Coding Standards & Architecture — Next.js 15

Ce document définit les normes de développement, les standards TypeScript et les conventions d'architecture pour le projet.

---

## 1. Structure Recommandée du Répertoire

```text
src/
├── app/
│   ├── layout.tsx              # Layout racine (Metadata, polices, ThemeProvider)
│   ├── page.tsx                # Page principale (Dashboard interactif)
│   └── globals.css             # Directives Tailwind CSS & variables CSS
├── components/
│   ├── RegisterModal.tsx       # Modale d'enregistrement popup hyper-interactive
│   ├── ParticipantTable.tsx    # Tableau dynamique et tri en temps réel
│   ├── GenderSwitch.tsx        # Composant toggle Homme / Femme réutilisable
│   ├── StatsOverview.tsx       # Barre de statistiques clés (total, moyenne, ratio)
│   ├── TeamView.tsx            # Affichage en Bento Grid des équipes générées
│   └── ImportExportModal.tsx   # Modale d'import/export CSV et JSON
├── hooks/
│   └── useParticipants.ts      # Hook gérant l'état local, le tri et le localStorage
├── lib/
│   ├── algorithm.ts            # Fonctions pures d'équilibrage des équipes (3 tiers + genre)
│   ├── storage.ts              # Utilitaires de persistance localStorage sécurisés (SSR-safe)
│   └── csv.ts                  # Parseur et générateur CSV léger sans dépendance
└── types/
    └── participant.ts          # Interfaces et types TypeScript stricts
```

---

## 2. Standards TypeScript

- **Mode strict activé** (`"strict": true` dans `tsconfig.json`).
- **Interdiction du type `any`** : utiliser des types génériques, des unions discriminées ou `unknown` avec validation de type.
- **Modèles immuables** : privilégier les structures de données en lecture seule ou les transformations fonctionnelles pures (`map`, `filter`, `reduce`, `toSorted`).
- **Typage des états** :
  ```typescript
  export type Gender = 'male' | 'female';

  export interface Participant {
    readonly id: string;
    readonly name: string;
    readonly commits: number;
    readonly gender: Gender;
    readonly createdAt: number;
  }
  ```

---

## 3. Séparation des Responsabilités & Pureté

### A. Algorithme Découplé (`src/lib/algorithm.ts`)
- La fonction `balanceTeams` ne doit importer aucun composant React, aucun hook et aucun objet global (`window`, `localStorage`, `document`).
- Elle doit être une **fonction pure et déterministe** (ou accepter un paramètre `seed` si un mélange aléatoire contrôlé est appliqué aux ex æquo).
- Elle doit pouvoir être exécutée et testée dans n'importe quel environnement JavaScript/TypeScript (Node, Bun, navigateur).

### B. Persistance Sécurisée (`src/lib/storage.ts`)
- Toujours vérifier la disponibilité du `window` avant d'accéder au `localStorage` pour éviter toute erreur de réhydratation Next.js (SSR) :
  ```typescript
  export function loadParticipants(): Participant[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem('hackathon_participants');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
  ```

---

## 4. Conventions Tailwind CSS

- Utiliser les variables de couleurs sémantiques ou la palette moderne `zinc` / `slate`.
- Utiliser `lucide-react` pour toute l'iconographie (`UserPlus`, `Users`, `GitCommit`, `Trash2`, `Edit3`, `Download`, `Upload`, `Shuffle`, `Check`).
- Assurer le support responsive complet :
  - Mobile : affichage vertical empilé, modale plein écran ou bottom sheet.
  - Desktop : grille 3 colonnes pour les équipes, tableau pleine largeur avec scroll horizontal fluide sur petits écrans.
