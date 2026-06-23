import type { Request } from 'express';
import type { Auth, DecodedIdToken } from 'firebase-admin/auth';


// Extracts the Firebase ID token from the Authorization header and verifies it.
export async function verifyAuthToken(
  req: Request,
  auth: Auth
): Promise<DecodedIdToken | null> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }

  const token = header.split('Bearer ')[1];
  if (!token) {
    return null;
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    return decoded;
  } catch (err) {
    // Token expired, malformed, or revoked.
    // We deliberately don't throw here — we just treat the request as unauthenticated.
    // The resolver decides whether that's acceptable.
    console.warn('Auth token verification failed:', (err as Error).message);
    return null;
  }
}
