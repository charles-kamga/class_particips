import { Participant, BalancingResult } from './participant';

export type SyncStatus = 'idle' | 'connecting' | 'connected' | 'syncing' | 'error' | 'offline';

export interface FirebaseEventState {
  readonly participants: Participant[];
  readonly balancingResult: BalancingResult | null;
  readonly updatedAt: number;
  readonly lastAction?: string;
  readonly updatedBy?: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
