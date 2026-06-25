import type { DecodedIdToken, Auth } from 'firebase-admin/auth';
import { expressMiddleware } from '@as-integrations/express4';
import type { Firestore } from 'firebase-admin/firestore';
import { ApolloServer } from '@apollo/server';
import type { Request } from 'express';
import express from 'express';
import http from 'http';

import { completeOnboardingResolver } from './graphql/resolvers/onboarding.js';
import { AuthenticationError } from './utils/errors.js';
import { verifyAuthToken } from './middleware/auth.js';
import { auth, db } from './config/firebase.js';

import 'dotenv/config';

const PORT = process.env.PORT || 4000;


// Shape of the object every resolver receives as its third argument.
export interface GraphQLContext {
  auth: Auth;
  db: Firestore;
  req: Request;
  user: DecodedIdToken | null;
}

// We'll grow this file into src/graphql/schema.ts.
const typeDefs = `#graphql
  type Query {
    ping: String!
    me: String!
  }

  input CompleteOnboardingInput {
    displayName: String!
    describesYou: String!
    yearOfStudy: String
    targetExam: String!
    institution: String
  }
  type OnboardingResult {
    uid: String!
    displayName: String!
    targetExam: String!
  }
  type Mutation {
    completeOnboarding(input: CompleteOnboardingInput!): OnboardingResult!
  }
`;

const resolvers = {
  Query: {
    ping: (): string => 'pong',
    // Temporary resolver just to prove auth works.
    // This gets replaced by a real `me` query reading from Firestore.
    me: (_parent: unknown, _args: unknown, context: GraphQLContext): string => {
      if (!context.user) {
        throw new AuthenticationError();
      }
      return `Hello, ${context.user.email ?? context.user.uid}`;
    },
  },
  Mutation: {
    completeOnboarding: (
      parent: unknown,
      args: Parameters<typeof completeOnboardingResolver>[1],
      context: GraphQLContext
    ) => completeOnboardingResolver(parent, args, context, context.db),
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
      // Runs on every request.
      // We verify the Firebase ID token here and attach the decoded user (or null) to context so
      // every resolver can read context.user without re-checking auth.
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
