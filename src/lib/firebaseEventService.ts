import {
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { getFirebaseFirestore } from './firebase';
import { Participant, BalancingResult } from '@/types/participant';
import { FirebaseEventState } from '@/types/sharedSpace';

const EVENT_COLLECTION = 'hackathon';
const EVENT_DOCUMENT = 'event_state';

/**
 * Souscrit en temps réel à l'état de l'événement sur Firestore.
 * Retourne une fonction d'annulation d'abonnement (unsubscribe).
 */
export function subscribeToEventState(
  onUpdate: (state: FirebaseEventState) => void,
  onError?: (error: Error) => void
): Unsubscribe | null {
  const db = getFirebaseFirestore();
  if (!db) return null;

  try {
    const docRef = doc(db, EVENT_COLLECTION, EVENT_DOCUMENT);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          // Si le document n'existe pas encore sur Firebase, initialiser avec un état vierge
          onUpdate({
            participants: [],
            balancingResult: null,
            updatedAt: Date.now(),
            lastAction: 'Initialisation de l\'espace partagé',
          });
          return;
        }

        const data = snapshot.data();
        const eventState: FirebaseEventState = {
          participants: Array.isArray(data.participants) ? data.participants : [],
          balancingResult: data.balancingResult || null,
          updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
          lastAction: data.lastAction,
          updatedBy: data.updatedBy,
        };

        onUpdate(eventState);
      },
      (error) => {
        console.error('Erreur Firestore onSnapshot :', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Erreur souscription Firestore :', error);
    if (onError && error instanceof Error) onError(error);
    return null;
  }
}

/**
 * Récupère l'état actuel de Firestore de manière ponctuelle
 */
export async function getEventState(): Promise<FirebaseEventState | null> {
  const db = getFirebaseFirestore();
  if (!db) return null;

  try {
    const docRef = doc(db, EVENT_COLLECTION, EVENT_DOCUMENT);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return {
        participants: [],
        balancingResult: null,
        updatedAt: Date.now(),
      };
    }

    const data = snapshot.data();
    return {
      participants: Array.isArray(data.participants) ? data.participants : [],
      balancingResult: data.balancingResult || null,
      updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
      lastAction: data.lastAction,
    };
  } catch (error) {
    console.error('Erreur getEventState :', error);
    return null;
  }
}

/**
 * Met à jour complètement la liste des participants sur Firestore
 */
export async function syncParticipantsToFirestore(
  participants: Participant[],
  actionMessage?: string
): Promise<boolean> {
  const db = getFirebaseFirestore();
  if (!db) return false;

  try {
    const docRef = doc(db, EVENT_COLLECTION, EVENT_DOCUMENT);
    await setDoc(
      docRef,
      {
        participants,
        updatedAt: Date.now(),
        lastAction: actionMessage || 'Mise à jour des participants',
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('Erreur syncParticipantsToFirestore :', error);
    return false;
  }
}

/**
 * Sauvegarde les équipes générées sur Firestore
 */
export async function syncTeamsToFirestore(
  balancingResult: BalancingResult | null
): Promise<boolean> {
  const db = getFirebaseFirestore();
  if (!db) return false;

  try {
    const docRef = doc(db, EVENT_COLLECTION, EVENT_DOCUMENT);
    await setDoc(
      docRef,
      {
        balancingResult,
        updatedAt: Date.now(),
        lastAction: balancingResult ? 'Génération des équipes' : 'Réinitialisation des équipes',
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('Erreur syncTeamsToFirestore :', error);
    return false;
  }
}

/**
 * Vide tous les participants et les équipes sur Firestore
 */
export async function clearAllOnFirestore(): Promise<boolean> {
  const db = getFirebaseFirestore();
  if (!db) return false;

  try {
    const docRef = doc(db, EVENT_COLLECTION, EVENT_DOCUMENT);
    await setDoc(
      docRef,
      {
        participants: [],
        balancingResult: null,
        updatedAt: Date.now(),
        lastAction: 'Vidage de la liste des participants',
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('Erreur clearAllOnFirestore :', error);
    return false;
  }
}
