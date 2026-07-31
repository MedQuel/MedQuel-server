import type { Request } from 'express';
import type { Firestore } from 'firebase-admin/firestore';
import type { DecodedIdToken, Auth } from 'firebase-admin/auth';

import { BigQueryService } from '../services/bigqueryService.js';


let _bigqueryService: BigQueryService | null = null;

export function getBigQueryService(): BigQueryService {
  if (!_bigqueryService) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new Error('FIREBASE_PROJECT_ID is not set. Check that dotenv/config has loaded before any request is served.');
    }

    _bigqueryService = new BigQueryService(projectId, process.env.BIGQUERY_DATASET ?? 'medquel_production');
  }
  return _bigqueryService;
}


export interface GraphQLContext {
  auth: Auth;
  db: Firestore;
  req: Request;
  user: DecodedIdToken | null;
  bigqueryService: BigQueryService;
}
