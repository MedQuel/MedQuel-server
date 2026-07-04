// Quiz domain - stub for now
export const quizTypeDefs = `#graphql
  enum QuizType {
    daily
    contest
    practice
    subject
  }
  enum QuizSessionStatus {
    in_progress
    completed
    abandoned
  }

  type QuizSession {
    sessionId: ID!
    userId: String!
    contestId: String
    quizType: QuizType!
    subject: String!
    totalQuestions: Int!
    correctCount: Int!
    wrongCount: Int!
    score: Int!
    scorePercent: Float!
    epEarned: Int!
    xpEarned: Int!
    timeTaken: Int!
    status: QuizSessionStatus!
    startedAt: String!
    completedAt: String
  }
`;
