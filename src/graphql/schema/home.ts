export const homeTypeDefs = `#graphql
  type DailyChallenge {
    date: String!
    contestId: ID!
    title: String!
    subject: String!
    difficulty: QuizDifficulty!
    epReward: Int!
    totalQuestions: Int!
    timeLimitSecs: Int!
    expiresAt: String!
    completed: Boolean!
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
