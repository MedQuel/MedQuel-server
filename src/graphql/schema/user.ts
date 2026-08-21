export const userTypeDefs = `#graphql
  type NotifPrefs {
    pushEnabled: Boolean!
    emailDigest: Boolean!
    rankAlerts: Boolean!
    contestReminders: Boolean!
    achievementAlerts: Boolean!
  }
  input NotifPrefsInput {
    pushEnabled: Boolean
    emailDigest: Boolean
    rankAlerts: Boolean
    contestReminders: Boolean
    achievementAlerts: Boolean
  }

  type QuizPrefs {
    defaultDifficulty: QuizDifficulty!
    timerSound: Boolean!
    autoSubmit: Boolean!
  }
  input QuizPrefsInput {
    defaultDifficulty: QuizDifficulty
    timerSound: Boolean
    autoSubmit: Boolean
  }

  type UserStats {
    contestsPlayed: Int!
    contests90Plus: Int!
    hardContestsDone: Int!
    perfectQuizzes: Int!
    fastCompletions: Int!
    top3Finishes: Int!
    subjects70Plus: Int!
  }

  type User {
    uid: ID!
    displayName: String!
    email: String!
    photoURL: String
    role: String!
    targetExam: String!
    studyLevel: String!
    yearOfStudy: String
    institution: String
    isPremium: Boolean!
    subscriptionId: String
    xpPoints: Int!
    epPoints: Int!
    currentLevel: Int!
    currentStreak: Int!
    longestStreak: Int!
    lastActiveDate: String!
    totalQuestions: Int!
    totalCorrect: Int!
    studyHours: Float!
    stats: UserStats!
    badges: [String!]!
    notifPrefs: NotifPrefs!
    quizPrefs: QuizPrefs!
    createdAt: String!
    updatedAt: String!
  }

  input UpdateProfileInput {
    displayName: String
    photoURL: String
    targetExam: String
    studyLevel: String
    yearOfStudy: String
    institution: String
  }

  input CompleteOnboardingInput {
    displayName: String!
    describesYou: String!
    yearOfStudy: String
    targetExam: String!
    institution: String
  }
  type OnboardingResult {
    displayName: String!
    describesYou: String!
    yearOfStudy: String
    targetExam: String!
    institution: String
  }

  extend type Query {
    me: User!
  }
  extend type Mutation {
    completeOnboarding(input: CompleteOnboardingInput!): OnboardingResult!
    updateProfile(input: UpdateProfileInput!): User!
    updateNotifPrefs(input: NotifPrefsInput!): NotifPrefs!
    updateQuizPrefs(input: QuizPrefsInput!): QuizPrefs!
  }
`;
