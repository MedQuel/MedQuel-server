// Root schema
// Defines the base Query/Mutation types so every domain schema file (user.ts, quiz.ts, ...)
// can use `extend type Query` / `extend type Mutation` instead of redeclaring the root types.
export const rootTypeDefs = `#graphql
  type Query {
    ping: String!
  }

  type Mutation {
    _empty: String
  }
`;
