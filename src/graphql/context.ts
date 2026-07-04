import type { Request } from 'express';
import type { Firestore } from 'firebase-admin/firestore';
import type { DecodedIdToken, Auth } from 'firebase-admin/auth';


// Shape of the object every resolver receives as its third argument.
export interface GraphQLContext {
  auth: Auth;
  db: Firestore;
  req: Request;
  user: DecodedIdToken | null;
}
