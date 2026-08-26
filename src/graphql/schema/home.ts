export const homeTypeDefs = `#graphql
  type DailyChallenge {
    date: String!
    contestId: ID!
    subject: String!
    epReward: Int!
    expiresAt: String!
  }
  type PerformanceTrendPoint {
    date: String!
    accuracy: Float
  }

  type HomeData {
    dailyChallenge: DailyChallenge
    activeContests: [Contest!]!
    performanceTrend: [PerformanceTrendPoint!]!
  }

  extend type Query {
    getHomeData: HomeData!
  }
`;
