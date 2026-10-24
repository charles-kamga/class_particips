import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { FirebaseConfig } from '@/types/sharedSpace';

const FIREBASE_CONFIG_STORAGE_KEY = 'hackathon_firebase_custom_config';

/**
 * Récupère la configuration Firebase depuis les variables d'environnement
 * ou depuis le localStorage (permet la configuration rapide dans le navigateur).
 */
export function getFirebaseConfig(): FirebaseConfig | null {
  // 1. Priorité aux variables d'environnement Next.js
  const envApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const envProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (envApiKey && envProjectId) {
    return {
      apiKey: envApiKey,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${envProjectId}.firebasestorage.app`,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    };
  }

  // 2. Fallback configuration personnalisée stockée dans le navigateur (client-only)
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.apiKey && parsed?.projectId) {
          return parsed as FirebaseConfig;
        }
      }
    } catch {
      // Ignorer les erreurs de lecture localStorage
    }
  }

  return null;
}

/**
 * Sauvegarde une configuration Firebase personnalisée dans le navigateur
 */
export function saveCustomFirebaseConfig(config: FirebaseConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Erreur sauvegarde config Firebase :', err);
  }
}

/**
 * Vérifie si Firebase est configuré et disponible
 */
export function isFirebaseConfigured(): boolean {
  return getFirebaseConfig() !== null;
}

let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;

/**
 * Initialise ou retourne l'instance Firebase App
 */
export function getFirebaseApp(): FirebaseApp | null {
  const config = getFirebaseConfig();
  if (!config) return null;

  try {
    if (!cachedApp) {
      if (getApps().length > 0) {
        cachedApp = getApp();
      } else {
        cachedApp = initializeApp(config);
      }
    }
    return cachedApp;
  } catch (error) {
    console.error('Erreur initialisation Firebase App :', error);
    return null;
  }
}

/**
 * Initialise ou retourne l'instance Firestore
 */
export function getFirebaseFirestore(): Firestore | null {
  const app = getFirebaseApp();
  if (!app) return null;

  try {
    if (!cachedDb) {
      cachedDb = getFirestore(app);
    }
    return cachedDb;
  } catch (error) {
    console.error('Erreur initialisation Firestore :', error);
    return null;
  }
}
