export const contestTypeDefs = `#graphql
  enum ContestStatus {
    draft
    scheduled
    active
    completed
  }
  enum ContestKindEnum {
    daily
    live
    contest
    weekly
  }

  type ContestMarkingScheme {
    correct: Int!
    wrong: Int!
    skipped: Int!
  }

  type Contest {
    contestId: ID!
    title: String!
    subject: String!
    topics: [String!]!
    contestType: ContestKindEnum!
    difficulty: QuizDifficulty!
    isPremium: Boolean!
    totalQuestions: Int!
    timeLimitSecs: Int!
    markingScheme: ContestMarkingScheme!
    epReward: Int!
    passPercent: Int!
    recommendedLevel: String
    status: ContestStatus!
    startsAt: String!
    endsAt: String!
    participantCount: Int!
  }

  input GetContestsFilter {
    status: ContestStatus
    contestType: ContestKindEnum
    subject: String
    difficulty: QuizDifficulty
    isPremium: Boolean
    limit: Int
    cursor: String
    personalized: Boolean
  }
  type GetContestsResult {
    contests: [Contest!]!
    nextCursor: String
  }

  extend type Query {
    getContests(filter: GetContestsFilter): GetContestsResult!
    getContest(contestId: ID!): Contest
  }
  extend type Mutation {
    joinContest(contestId: ID!): StartQuizSessionResult!
  }
`;
