import type { Request } from 'express';
import type { Firestore } from 'firebase-admin/firestore';
import type { DecodedIdToken, Auth } from 'firebase-admin/auth';

import { BigQueryService } from '../services/bigqueryService.js';


export const bigqueryService = new BigQueryService(
  process.env.FIREBASE_PROJECT_ID!,
  process.env.BIGQUERY_DATASET ?? 'medquel_production'
);

export interface GraphQLContext {
  auth: Auth;
  db: Firestore;
  req: Request;
  user: DecodedIdToken | null;
  bigqueryService: BigQueryService;
}
