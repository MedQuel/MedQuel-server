import { expressMiddleware } from '@as-integrations/express4';
import type { Auth } from 'firebase-admin/auth';
import { ApolloServer } from '@apollo/server';
import { auth } from './config/firebase.js';
import type { Request } from 'express';
import express from 'express';
import http from 'http';

import 'dotenv/config';

const PORT = process.env.PORT || 4000;

// Shape of the object every resolver receives as its third argument.
export interface GraphQLContext {
  auth: Auth;
  req: Request;
}

// We'll grow this file into src/graphql/schema.ts.
const typeDefs = `#graphql
  type Query {
    ping: String!
  }
`;
const resolvers = {
  Query: {
    ping: (): string => 'pong',
  },
};


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
      // context runs on every request — this is where req.user will get attached once we wire in the auth middleware.
      context: async ({ req }): Promise<GraphQLContext> => {
        return { auth, req };
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
