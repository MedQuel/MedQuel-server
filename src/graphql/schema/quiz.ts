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
  enum QuizDifficulty {
    easy
    medium
    hard
  }

  type Question {
    questionId: ID!
    questionText: String!
    optionA: String!
    optionB: String!
    optionC: String!
    optionD: String!
    imageUrl: String
    questionType: String!
    marks: Int!
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

  input StartQuizSessionInput {
    subject: String
    difficulty: QuizDifficulty
    questionCount: Int
    quizType: QuizType!
    contestId: ID
  }
  type StartQuizSessionResult {
    sessionId: ID!
    quizType: QuizType!
    subject: String!
    difficulty: QuizDifficulty!
    totalQuestions: Int!
    questions: [Question!]!
    startedAt: String!
  }

  input QuizAnswerInput {
    questionId: ID!
    selectedOption: String
  }
  input SubmitQuizSessionInput {
    sessionId: ID!
    answers: [QuizAnswerInput!]!
  }

  type QuestionResult {
    questionId: ID!
    selectedOption: String
    correctAnswer: String!
    isCorrect: Boolean!
    explanation: String!
  }

  type SubmitQuizSessionResult {
    sessionId: ID!
    totalQuestions: Int!
    correctCount: Int!
    wrongCount: Int!
    skippedCount: Int!
    score: Int!
    scorePercent: Float!
    epEarned: Int!
    xpEarned: Int!
    updatedXpPoints: Int!
    updatedEpPoints: Int!
    updatedCurrentLevel: Int!
    updatedCurrentStreak: Int!
    results: [QuestionResult!]!
  }

  extend type Query {
    getQuizSession(sessionId: ID!): QuizSession
  }

  extend type Mutation {
    startQuizSession(input: StartQuizSessionInput!): StartQuizSessionResult!
    submitQuizSession(input: SubmitQuizSessionInput!): SubmitQuizSessionResult!
  }
`;
