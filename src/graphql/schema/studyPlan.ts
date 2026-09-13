export const studyPlanTypeDefs = `#graphql
  enum StudyPlanSessionType { quiz read }
  enum StudyPlanSessionStatus { pending completed skipped }
  enum DailyCommitment { light moderate intense }
  enum StudyPlanWeekday { mon tue wed thu fri sat sun }

  type StudyPlanSession {
    sessionId: ID!
    sessionType: StudyPlanSessionType!
    subject: String!
    topic: String!
    scheduledDate: String!
    status: StudyPlanSessionStatus!
    xpReward: Int!
    completedAt: String
    questionCount: Int
    difficulty: QuizDifficulty
    linkedQuizSessionId: ID
    title: String
    content: String
    disclaimer: String
    estimatedMinutes: Int
  }

  type StudyPlanMilestone {
    label: String!
    phase: String!
    description: String!
    startWeek: Int!
    endWeek: Int
  }

  type StudyPlan {
    userId: ID!
    targetExam: String!
    examDate: String
    dailyCommitment: DailyCommitment!
    daysPerWeek: [StudyPlanWeekday!]!
    subjectPriority: [String!]!
    milestones: [StudyPlanMilestone!]!
    weeklyXpTarget: Int!
    preparationPercent: Int!
    currentWeekNumber: Int!
    currentWeekStartDate: String!
    sessions: [StudyPlanSession!]!
    generatedBy: String!
  }

  input GenerateStudyPlanInput {
    examDate: String
    dailyCommitment: DailyCommitment!
    daysPerWeek: [StudyPlanWeekday!]!
    subjectPriority: [String!]
  }

  type MarkStudySessionCompleteResult {
    plan: StudyPlan!
    xpEarned: Int!
  }

  extend type Query {
    getStudyPlan: StudyPlan
  }
  extend type Mutation {
    generateStudyPlan(input: GenerateStudyPlanInput!): StudyPlan!
    markStudySessionComplete(sessionId: ID!, quizSessionId: ID): MarkStudySessionCompleteResult!
  }
`;
