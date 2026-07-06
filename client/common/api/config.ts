// Central config — single place to flip environment, endpoints,
// and the mock-data behavior used across the whole API layer.
import { Platform } from 'react-native';


const FALLBACK_API_BASE_URL = 'https://medquel-api-632391222043.asia-south1.run.app';

function envBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return value.toLowerCase() === 'true';
}
function envNumber(value: string | undefined, fallback: number): number {
  if (value === undefined || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

const isDev = __DEV__;

export const config = {
  isDev,
  isWeb: Platform.OS === 'web',

  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? FALLBACK_API_BASE_URL,
  get graphqlEndpoint() {
    return `${config.apiBaseUrl}/graphql`;
  },

  requestTimeoutMs: envNumber(
    process.env.EXPO_PUBLIC_REQUEST_TIMEOUT_MS,
    15000
  ),

  useMockData: envBool(process.env.EXPO_PUBLIC_USE_MOCK_DATA, false),
  autoFallbackOnError: envBool(process.env.EXPO_PUBLIC_AUTO_FALLBACK_ON_ERROR, true),
  mockDelayMs: envNumber(process.env.EXPO_PUBLIC_MOCK_DELAY_MS, 450),
  logMockFallbacks: isDev,

  google: {
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
  },

  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'medquel-prod',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  },
};

export type AppConfig = typeof config;

// -----> Startup validation
// Fails loud and immediately on app boot if required Firebase env vars are missing,
// rather than letting `initializeApp({})` silently produce a client that fails confusingly deep inside `signInWithEmailAndPassword`.
// Skipped when `useMockData` is forced on, since a pure-mock dev session has no real reason to need live Firebase credentials.

const REQUIRED_FIREBASE_KEYS: (keyof typeof config.firebase)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  'appId',
];
function validateConfig(): void {
  if (config.useMockData) return;

  const missing = REQUIRED_FIREBASE_KEYS.filter((key) => !config.firebase[key]);

  if (missing.length > 0) {
    const varNames = missing.map((key) => `EXPO_PUBLIC_FIREBASE_${key.toUpperCase()}`).join(', ');
    const message =
      `[config] Missing required Firebase env var(s): ${varNames}.\n` +
      `Create a .env file at the client root or set ` +
      `EXPO_PUBLIC_USE_MOCK_DATA=true to develop without live Firebase.`;

    if (config.isDev) {
      // Loud in dev: a half-configured Firebase client fails in confusing
      // ways many steps later, so fail fast and exactly here instead.
      throw new Error(message);
    } else {
      // In production we don't want a misconfigured release to hard-crash on boot for every user at once
      // - log to console (picked up by whatever crash/log reporting is wired in later)
      // and let Firebase's own errors surface per-action instead.
      console.error(message);
    }
  }
}

validateConfig();
