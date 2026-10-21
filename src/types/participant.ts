export type Gender = 'male' | 'female';

export interface Participant {
  readonly id: string;
  readonly name: string;
  readonly commits: number;
  readonly gender: Gender;
  readonly createdAt: number;
  readonly githubHandle?: string;
  readonly avatarUrl?: string;
}

export interface Team {
  readonly id: string;
  readonly name: string;
  members: Participant[];
  totalCommits: number;
  averageCommits: number;
  maleCount: number;
  femaleCount: number;
}

export interface BalancingStats {
  readonly totalParticipants: number;
  readonly totalTeams: number;
  readonly meanTeamCommits: number;
  readonly standardDeviation: number;
  readonly mixedTeamsPercentage: number;
  readonly maleCount: number;
  readonly femaleCount: number;
}

export interface BalancingResult {
  readonly teams: Team[];
  readonly stats: BalancingStats;
}
