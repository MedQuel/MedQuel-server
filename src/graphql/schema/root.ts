// Defines th\e base Query/Mutation types so every domain schema file can use instead of redeclaring the root types.
export const rootTypeDefs = `#graphql
  type Query {
    ping: String!
  }

  type Mutation {
    _empty: String
  }
`;
