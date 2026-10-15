/// <reference types="expo/types" />


declare namespace NodeJS {
  interface ProcessEnv {
    readonly EXPO_PUBLIC_API_BASE_URL?: string;
    readonly EXPO_PUBLIC_REQUEST_TIMEOUT_MS?: string;

    readonly EXPO_PUBLIC_USE_MOCK_DATA?: string;
    readonly EXPO_PUBLIC_MOCK_DELAY_MS?: string;
    readonly EXPO_PUBLIC_AUTO_FALLBACK_ON_ERROR?: string;

    readonly EXPO_PUBLIC_FIREBASE_API_KEY?: string;
    readonly EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
    readonly EXPO_PUBLIC_FIREBASE_PROJECT_ID?: string;
    readonly EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?: string;
    readonly EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?: string;
    readonly EXPO_PUBLIC_FIREBASE_APP_ID?: string;
  }
}
