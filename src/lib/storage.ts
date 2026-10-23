import { Participant, Gender } from '@/types/participant';

const STORAGE_KEY = 'hackathon_participants_data';
const TEAMS_STORAGE_KEY = 'hackathon_teams_data';

/**
 * Charge la liste des participants depuis le localStorage de manière sécurisée (compatible SSR).
 */
export function loadParticipants(): Participant[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.error('Erreur lors du chargement des participants :', error);
    return [];
  }
}

/**
 * Sauvegarde la liste des participants dans le localStorage.
 */
export function saveParticipants(participants: Participant[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(participants));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des participants :', error);
  }
}

/**
 * Sauvegarde les équipes générées dans le localStorage.
 */
export function saveTeams(teamsData: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teamsData));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des équipes :', error);
  }
}

/**
 * Charge les équipes précédemment générées.
 */
export function loadTeams<T>(): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(TEAMS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Exporte les participants au format JSON téléchargeable.
 */
export function exportToJSON(participants: Participant[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(participants, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `participants_hackathon_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Exporte les participants au format CSV.
 */
export function exportToCSV(participants: Participant[]): void {
  const headers = ['Nom', 'Commits', 'Sexe'];
  const rows = participants.map((p) => [
    `"${p.name.replace(/"/g, '""')}"`,
    p.commits.toString(),
    p.gender === 'male' ? 'Homme' : 'Femme',
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `participants_hackathon_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/**
 * Parse un fichier CSV de participants.
 * Accepte les colonnes: Nom, Commits, Sexe (ou Gender).
 */
export function parseCSV(content: string): Participant[] {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length <= 1) return [];

  // Vérifier si la première ligne est un header
  const firstLine = lines[0].toLowerCase();
  const hasHeader = firstLine.includes('nom') || firstLine.includes('name');
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const result: Participant[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const rawCols = dataLines[i].split(/[,;\t]/);
    if (rawCols.length < 2) continue;

    const name = rawCols[0].replace(/^["']|["']$/g, '').trim();
    const commits = parseInt(rawCols[1].replace(/[^0-9]/g, ''), 10) || 0;
    const rawGender = (rawCols[2] || '').toLowerCase().trim();

    let gender: Gender = 'male';
    if (rawGender.includes('f') || rawGender.includes('femme') || rawGender.includes('woman')) {
      gender = 'female';
    }

    if (name) {
      result.push({
        id: `imported-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        name,
        commits,
        gender,
        createdAt: Date.now() + i,
      });
    }
  }

  return result;
}

/**
 * Parse un contenu JSON de participants.
 */
export function parseJSON(content: string): unknown {
  return JSON.parse(content);
}

/**
 * Participants de démonstration pour le test d'équilibrage du Hacktoberfest.
 */
export const DEMO_PARTICIPANTS: Omit<Participant, 'id' | 'createdAt'>[] = [
  { name: 'Alex Martin', commits: 142, gender: 'male', githubHandle: 'alexmartin' },
  { name: 'Sarah Dubois', commits: 98, gender: 'female', githubHandle: 'sarahd' },
  { name: 'Kevin Kamga', commits: 86, gender: 'male', githubHandle: 'kevinkamga' },
  { name: 'Aïcha Bello', commits: 75, gender: 'female', githubHandle: 'aichabello' },
  { name: 'David Ndongo', commits: 64, gender: 'male', githubHandle: 'davidndongo' },
  { name: 'Emilie Foko', commits: 52, gender: 'female', githubHandle: 'emiliefoko' },
  { name: 'Samuel Eto', commits: 45, gender: 'male', githubHandle: 'samueleto' },
  { name: 'Nadia Tchuente', commits: 38, gender: 'female', githubHandle: 'nadiat' },
  { name: 'Patrick Mbia', commits: 31, gender: 'male', githubHandle: 'patrickmbia' },
  { name: 'Brenda Onana', commits: 25, gender: 'female', githubHandle: 'brendaonana' },
  { name: 'Christian Bassogog', commits: 21, gender: 'male', githubHandle: 'christianb' },
  { name: 'Diane Moukoko', commits: 18, gender: 'female', githubHandle: 'dianem' },
  { name: 'Frank Zambo', commits: 14, gender: 'male', githubHandle: 'frankz' },
  { name: 'Carine Nguemo', commits: 12, gender: 'female', githubHandle: 'carineng' },
  { name: 'Joel Matip', commits: 9, gender: 'male', githubHandle: 'joelmatip' },
  { name: 'Helene Abega', commits: 7, gender: 'female', githubHandle: 'helenea' },
  { name: 'Boris Song', commits: 4, gender: 'male', githubHandle: 'borissong' },
  { name: 'Fanny Milla', commits: 2, gender: 'female', githubHandle: 'fannymilla' },
];
