export const analyticsTypeDefs = `#graphql
  type SubjectPerformance {
    subject: String!
    accuracy: Float!
    totalAttempted: Int!
    totalCorrect: Int!
  }
  type HeatmapEntry {
    date: String!
    questionsAttempted: Int!
    minutesStudied: Float!
  }
  type RecentAttempt {
    sessionId: ID!
    subject: String!
    quizType: QuizType!
    scorePercent: Float!
    correctCount: Int!
    totalQuestions: Int!
    timeTaken: Int!
    passed: Boolean!
    completedAt: String!
  }

  type AnalyticsData {
    overallAccuracy: Float!
    avgScore: Float!
    bestSubject: String
    weakSubject: String
    subjectPerformance: [SubjectPerformance!]!
    heatmap: [HeatmapEntry!]!
    recentAttempts: [RecentAttempt!]!
  }

  extend type Query {
    getAnalytics: AnalyticsData!
  }
`;
