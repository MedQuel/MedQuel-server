export const quizTypeDefs = `#graphql
  enum QuizType {
    daily
    contest
    practice
    subject
    challenge
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
    difficulty: QuizDifficulty!
    questionType: String!
    marks: Int!
  }

  type QuizSession {
    sessionId: ID!
    userId: String!
    contestId: String
    challengeId: String
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
    topic: String
    timeLimitSecs: Int
    quizType: QuizType!
    contestId: ID
    challengeId: ID
  }
  type StartQuizSessionResult {
    sessionId: ID!
    quizType: QuizType!
    subject: String!
    difficulty: QuizDifficulty!
    topic: String
    timeLimitSecs: Int
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
    timeTaken: Int!
    epEarned: Int!
    xpEarned: Int!
    updatedXpPoints: Int!
    updatedEpPoints: Int!
    updatedCurrentLevel: Int!
    updatedCurrentStreak: Int!
    leveledUp: Boolean!
    isNewLongestStreak: Boolean!
    results: [QuestionResult!]!
    challengeId: ID
    challengeStatus: ChallengeStatus
    challengeWinnerUid: ID
  }

  extend type Query {
    getQuizSession(sessionId: ID!): QuizSession
    getTopicsForSubject(subject: String!): [String!]!
  }

  extend type Mutation {
    startQuizSession(input: StartQuizSessionInput!): StartQuizSessionResult!
    submitQuizSession(input: SubmitQuizSessionInput!): SubmitQuizSessionResult!
  }
`;
