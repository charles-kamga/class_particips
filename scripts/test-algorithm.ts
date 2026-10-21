import { balanceTeams, calculateTeamCapacities } from '../src/lib/algorithm';
import { Participant } from '../src/types/participant';

console.log('--- TEST 1: Capacités d\'équipes ---');
console.log('N=18 :', calculateTeamCapacities(18)); // [3, 3, 3, 3, 3, 3]
console.log('N=19 :', calculateTeamCapacities(19)); // 5x3 + 1x4 = [3, 3, 3, 3, 3, 4]
console.log('N=20 :', calculateTeamCapacities(20)); // 4x3 + 2x4 = [3, 3, 3, 3, 4, 4]
console.log('N=21 :', calculateTeamCapacities(21)); // 7x3 = [3, 3, 3, 3, 3, 3, 3]

// Scénario A : 18 participants équilibrés
const scenarioA: Participant[] = [
  { id: "p1", name: "Camille", commits: 145, gender: "female", createdAt: 1 },
  { id: "p2", name: "Thomas", commits: 138, gender: "male", createdAt: 2 },
  { id: "p3", name: "Sarah", commits: 120, gender: "female", createdAt: 3 },
  { id: "p4", name: "David", commits: 115, gender: "male", createdAt: 4 },
  { id: "p5", name: "Emma", commits: 98, gender: "female", createdAt: 5 },
  { id: "p6", name: "Lucas", commits: 90, gender: "male", createdAt: 6 },
  { id: "p7", name: "Léa", commits: 78, gender: "female", createdAt: 7 },
  { id: "p8", name: "Antoine", commits: 74, gender: "male", createdAt: 8 },
  { id: "p9", name: "Chloé", commits: 65, gender: "female", createdAt: 9 },
  { id: "p10", name: "Maxime", commits: 58, gender: "male", createdAt: 10 },
  { id: "p11", name: "Inès", commits: 52, gender: "female", createdAt: 11 },
  { id: "p12", name: "Alexandre", commits: 47, gender: "male", createdAt: 12 },
  { id: "p13", name: "Manon", commits: 35, gender: "female", createdAt: 13 },
  { id: "p14", name: "Nicolas", commits: 28, gender: "male", createdAt: 14 },
  { id: "p15", name: "Jade", commits: 22, gender: "female", createdAt: 15 },
  { id: "p16", name: "Julien", commits: 18, gender: "male", createdAt: 16 },
  { id: "p17", name: "Clara", commits: 12, gender: "female", createdAt: 17 },
  { id: "p18", name: "Romain", commits: 8, gender: "male", createdAt: 18 }
];

console.log('\n--- TEST 2: Scénario A (18 participants) ---');
const resA = balanceTeams(scenarioA);
console.log('Nombre d\'équipes :', resA.teams.length);
console.log('Moyennes de commits par équipe :', resA.teams.map(t => `${t.name}: avg ${t.averageCommits} (${t.maleCount}H/${t.femaleCount}F)`));
console.log('Écart-type :', resA.stats.standardDeviation);
console.log('Mixité de genre :', resA.stats.mixedTeamsPercentage + '%');

if (resA.stats.mixedTeamsPercentage !== 100) {
  throw new Error(`Scénario A a échoué: mixité ${resA.stats.mixedTeamsPercentage}% au lieu de 100%`);
}

// Scénario B : 20 participants
const scenarioB: Participant[] = [
  ...scenarioA,
  { id: "p19", name: "Paul", commits: 6, gender: "male", createdAt: 19 },
  { id: "p20", name: "Lucie", commits: 4, gender: "female", createdAt: 20 },
];

console.log('\n--- TEST 3: Scénario B (20 participants) ---');
const resB = balanceTeams(scenarioB);
console.log('Tailles des équipes :', resB.teams.map(t => t.members.length));
console.log('Moyennes :', resB.teams.map(t => `${t.name}: avg ${t.averageCommits} (taille ${t.members.length}, ${t.maleCount}H/${t.femaleCount}F)`));
console.log('Mixité :', resB.stats.mixedTeamsPercentage + '%');

// Scénario C : 21 participants, 17 Hommes, 4 Femmes
const scenarioC: Participant[] = Array.from({ length: 21 }, (_, i) => ({
  id: `c${i}`,
  name: `Participant ${i + 1}`,
  commits: 200 - i * 9,
  gender: i < 4 ? 'female' : 'male', // 4 femmes (index 0, 1, 2, 3), 17 hommes
  createdAt: i,
}));

console.log('\n--- TEST 4: Scénario C (Forte disparité de genre: 4F, 17H) ---');
const resC = balanceTeams(scenarioC);
console.log('Femmes par équipe :', resC.teams.map(t => t.femaleCount));
const teamsWithFemale = resC.teams.filter(t => t.femaleCount > 0).length;
console.log(`Nombre d'équipes avec au moins une femme : ${teamsWithFemale} / ${resC.teams.length}`);

if (teamsWithFemale < 4) {
  throw new Error(`Scénario C: Les 4 femmes auraient dû être réparties sur 4 équipes distinctes !`);
}

console.log('\n TOUS LES TESTS DE L\'ALGORITHME SONT PASSÉS AVEC SUCCÈS !');
