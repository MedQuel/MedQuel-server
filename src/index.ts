import http from 'http';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';

import { auth, db } from './config/firebase.js';
import { typeDefs } from './graphql/schema/index.js';
import { verifyAuthToken } from './middleware/auth.js';
import { resolvers } from './graphql/resolvers/index.js';
import type { GraphQLContext } from './graphql/context.js';

import 'dotenv/config';

const PORT = process.env.PORT || 4000;

async function startServer(): Promise<void> {
  const app = express();
  const httpServer = http.createServer(app);

  app.get('/health', (req, res) => res.status(200).send('ok'));

  const server = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
  });
  await server.start();

  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      // We verify the Firebase ID token here and attach the decoded user to context.
      context: async ({ req }): Promise<GraphQLContext> => {
        const user = await verifyAuthToken(req, auth);
        return { auth, db, req, user };
      },
    })
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve)
  );
  console.log(`MedQuel API ready at http://localhost:${PORT}/graphql`);
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
