import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);

// Configure Google Auth Provider for clean, errorless Google Sign-In
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.addScope('email');
googleAuthProvider.addScope('profile');
googleAuthProvider.addScope('openid');
googleAuthProvider.setCustomParameters({
  prompt: 'select_account',
});

// In-memory access token cache
let cachedAccessToken: string | null = null;
let isSigningIn = false;

/**
 * Test server connection on boot
 */
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Please check your Firebase configuration or network connection.');
    }
  }
}

// Call connection probe lazily
testFirestoreConnection().catch(() => {});

/**
 * Sign in with Google Popup and obtain access token
 */
export const signInWithGoogleWorkspace = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleAuthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken || '';
    
    if (accessToken) {
      cachedAccessToken = accessToken;
    }
    return { user: result.user, accessToken };
  } catch (error) {
    console.error('Firebase Google Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Retrieve cached in-memory access token
 */
export const getCachedAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

/**
 * Sign out and clear in-memory tokens
 */
export const signOutFirebase = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
