import { Participant, Team, BalancingResult } from '@/types/participant';

/**
 * Calcule la répartition des tailles d'équipes pour un effectif N.
 * Privilégie des équipes de 3, avec tolérance d'équipes de 4 (ou 2 pour les très petits effectifs).
 */
export function calculateTeamCapacities(n: number): number[] {
  if (n <= 0) return [];
  if (n <= 2) return [n];
  if (n === 4) return [4];

  const remainder = n % 3;
  if (remainder === 0) {
    const k = n / 3;
    return Array(k).fill(3);
  }

  if (remainder === 1) {
    // Ex: n=7 -> 1 équipe de 3, 1 équipe de 4 (k=2)
    // Ex: n=10 -> 2 équipes de 3, 1 équipe de 4 (k=3)
    const k = Math.floor(n / 3);
    const capacities = Array(k).fill(3);
    capacities[capacities.length - 1] = 4;
    return capacities;
  }

  // remainder === 2
  // Pour n=5 -> 1 équipe de 3, 1 équipe de 2
  if (n === 5) return [3, 2];

  // Pour n >= 8 (ex: n=20 -> 4 équipes de 3 et 2 équipes de 4)
  const numTeamsOf4 = 2;
  const numTeamsOf3 = (n - 8) / 3;
  const capacities = [
    ...Array(numTeamsOf3).fill(3),
    ...Array(numTeamsOf4).fill(4),
  ];
  return capacities;
}

interface MemberWithRound {
  participant: Participant;
  round: number;
}

/**
 * Calcule le score de déséquilibre de genre d'une équipe.
 * Pénalise fortement les équipes mono-genre si l'équipe a au moins 2 membres.
 */
function getTeamGenderScore(members: Participant[]): number {
  if (members.length === 0) return 0;
  const males = members.filter((m) => m.gender === 'male').length;
  const females = members.length - males;
  const diff = Math.abs(males - females);
  const isMono = (males === 0 && females > 1) || (females === 0 && males > 1);
  return diff * diff + (isMono ? 12 : 0);
}

/**
 * Algorithme principal d'équilibrage des équipes.
 * 1. Tri décroissant des participants par commits.
 * 2. Snake draft par tours (chapeaux).
 * 3. Permutations intra-tours pour maximiser la mixité de genre.
 * 4. Calcul des métriques statistiques.
 */
export function balanceTeams(participants: Participant[]): BalancingResult {
  const totalParticipants = participants.length;
  const maleCount = participants.filter((p) => p.gender === 'male').length;
  const femaleCount = totalParticipants - maleCount;

  if (totalParticipants === 0) {
    return {
      teams: [],
      stats: {
        totalParticipants: 0,
        totalTeams: 0,
        meanTeamCommits: 0,
        standardDeviation: 0,
        mixedTeamsPercentage: 0,
        maleCount: 0,
        femaleCount: 0,
      },
    };
  }

  // Effectifs inférieurs à 3 : une seule équipe
  if (totalParticipants < 3) {
    const totalCommits = participants.reduce((sum, p) => sum + p.commits, 0);
    const avg = Math.round((totalCommits / totalParticipants) * 10) / 10;
    const team: Team = {
      id: 'team-1',
      name: 'Équipe 1',
      members: [...participants],
      totalCommits,
      averageCommits: avg,
      maleCount,
      femaleCount,
    };

    return {
      teams: [team],
      stats: {
        totalParticipants,
        totalTeams: 1,
        meanTeamCommits: totalCommits,
        standardDeviation: 0,
        mixedTeamsPercentage: maleCount > 0 && femaleCount > 0 ? 100 : 0,
        maleCount,
        femaleCount,
      },
    };
  }

  // 1. Calcul des capacités et initialisation des équipes
  const capacities = calculateTeamCapacities(totalParticipants);
  const k = capacities.length;

  // Tri décroissant par nombre de commits
  const sorted = [...participants].sort((a, b) => b.commits - a.commits);

  // Équipes de travail contenant les membres avec leur tour d'attribution
  const draftTeams: { members: MemberWithRound[]; capacity: number }[] = capacities.map(
    (cap) => ({
      members: [],
      capacity: cap,
    })
  );

  // 2. Snake Draft par tours
  // Tour 0 (Forts) : 0 -> k - 1
  // Tour 1 (Moyens) : k - 1 -> 0
  // Tour 2 (Faibles) : 0 -> k - 1
  // Tour 3 (Renforts pour les équipes de 4) : équipes concernées
  let participantIdx = 0;
  const maxCapacity = Math.max(...capacities);

  for (let round = 0; round < maxCapacity; round++) {
    // Identifier les équipes ayant besoin d'un membre pour ce tour
    const eligibleTeamIndices: number[] = [];
    for (let i = 0; i < k; i++) {
      if (round < capacities[i]) {
        eligibleTeamIndices.push(i);
      }
    }

    // Alternance de l'ordre pour le Snake Draft
    if (round % 2 === 1) {
      eligibleTeamIndices.reverse();
    }

    for (const teamIdx of eligibleTeamIndices) {
      if (participantIdx < sorted.length) {
        draftTeams[teamIdx].members.push({
          participant: sorted[participantIdx],
          round,
        });
        participantIdx++;
      }
    }
  }

  // 3. Optimisation de la mixité de genre par swaps intra-tour (Intra-Round Permutations)
  // Deux membres ne peuvent s'échanger que s'ils appartiennent au même tour 'round'
  let improved = true;
  let iterations = 0;
  const MAX_ITERATIONS = 50;

  while (improved && iterations < MAX_ITERATIONS) {
    improved = false;
    iterations++;

    for (let i = 0; i < k; i++) {
      for (let j = i + 1; j < k; j++) {
        const teamA = draftTeams[i];
        const teamB = draftTeams[j];

        const scoreBefore =
          getTeamGenderScore(teamA.members.map((m) => m.participant)) +
          getTeamGenderScore(teamB.members.map((m) => m.participant));

        // Recherche d'un swap intra-tour bénéfique
        for (let idxA = 0; idxA < teamA.members.length; idxA++) {
          for (let idxB = 0; idxB < teamB.members.length; idxB++) {
            const memberA = teamA.members[idxA];
            const memberB = teamB.members[idxB];

            // Condition stricte : même tour et genres différents
            if (
              memberA.round === memberB.round &&
              memberA.participant.gender !== memberB.participant.gender
            ) {
              // Simuler le swap
              const newMembersA = [...teamA.members];
              const newMembersB = [...teamB.members];
              newMembersA[idxA] = memberB;
              newMembersB[idxB] = memberA;

              const scoreAfter =
                getTeamGenderScore(newMembersA.map((m) => m.participant)) +
                getTeamGenderScore(newMembersB.map((m) => m.participant));

              if (scoreAfter < scoreBefore) {
                // Appliquer le swap
                teamA.members = newMembersA;
                teamB.members = newMembersB;
                improved = true;
                break;
              }
            }
          }
          if (improved) break;
        }
        if (improved) break;
      }
      if (improved) break;
    }
  }

  // 4. Construction des équipes finales et calcul des statistiques
  const finalTeams: Team[] = draftTeams.map((dt, index) => {
    const members = dt.members.map((m) => m.participant);
    const totalCommits = members.reduce((sum, m) => sum + m.commits, 0);
    const avg =
      members.length > 0 ? Math.round((totalCommits / members.length) * 10) / 10 : 0;
    const males = members.filter((m) => m.gender === 'male').length;
    const females = members.length - males;

    return {
      id: `team-${index + 1}`,
      name: `Équipe ${index + 1}`,
      members,
      totalCommits,
      averageCommits: avg,
      maleCount: males,
      femaleCount: females,
    };
  });

  // Calcul moyenne globale et écart-type entre les équipes
  const teamAverages = finalTeams.map((t) => t.averageCommits);
  const meanTeamCommits =
    teamAverages.length > 0
      ? Math.round(
          (teamAverages.reduce((sum, v) => sum + v, 0) / teamAverages.length) * 10
        ) / 10
      : 0;

  const variance =
    teamAverages.length > 0
      ? teamAverages.reduce((sum, v) => sum + Math.pow(v - meanTeamCommits, 2), 0) /
        teamAverages.length
      : 0;
  const standardDeviation = Math.round(Math.sqrt(variance) * 10) / 10;

  const mixedTeams = finalTeams.filter((t) => t.maleCount > 0 && t.femaleCount > 0);
  const mixedTeamsPercentage =
    finalTeams.length > 0
      ? Math.round((mixedTeams.length / finalTeams.length) * 100)
      : 0;

  return {
    teams: finalTeams,
    stats: {
      totalParticipants,
      totalTeams: finalTeams.length,
      meanTeamCommits,
      standardDeviation,
      mixedTeamsPercentage,
      maleCount,
      femaleCount,
    },
  };
}
