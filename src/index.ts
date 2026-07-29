import 'dotenv/config';

import cors from 'cors';
import http from 'http';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';

import { auth, db } from './config/firebase.js';
import { typeDefs } from './graphql/schema/index.js';
import { verifyAuthToken } from './middleware/auth.js';
import { resolvers } from './graphql/resolvers/index.js';
import { getBigQueryService, type GraphQLContext } from './graphql/context.js';


const PORT = process.env.PORT || 4000;
const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS ?? '').split(',').map((o) => o.trim()).filter(Boolean);

async function startServer(): Promise<void> {
  const app = express();
  const httpServer = http.createServer(app);

  app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? ALLOWED_ORIGINS : true,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }))

  app.get('/health', (req, res) => res.status(200).send('ok'));

  const server = new ApolloServer<GraphQLContext>({ typeDefs, resolvers });
  await server.start();

  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }): Promise<GraphQLContext> => {
        const user = await verifyAuthToken(req, auth);
        return { auth, db, req, user, bigqueryService: getBigQueryService() };
      },
    })
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve)
  );
  console.log(`MedQuel API (internal) ready at http://localhost:${PORT}/graphql & public entry is Nginx on 8080.`);
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
