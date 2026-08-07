export const leaderboardTypeDefs = `#graphql
  enum LeaderboardScope {
    global
    friends
  }
  enum LeaderboardPeriod {
    weekly
    monthly
    allTime
  }

  type LeaderboardEntry {
    userId: ID!
    displayName: String!
    photoURL: String
    specialization: String
    epPoints: Int!
    rank: Int!
    prevRank: Int!
    weeklyChange: Int!
    updatedAt: String!
  }
  type LeaderboardResult {
    period: LeaderboardPeriod!
    periodKey: String!
    entries: [LeaderboardEntry!]!
    myEntry: LeaderboardEntry
    myRank: Int
  }

  extend type Query {
    getLeaderboard(period: LeaderboardPeriod!, scope: LeaderboardScope = global): LeaderboardResult!
  }
`;
