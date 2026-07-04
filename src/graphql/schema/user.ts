// User domain schema. Mirrors the users/{uid} Firestore document
export const userTypeDefs = `#graphql
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
    xpPoints: Int!
    epPoints: Int!
    currentLevel: Int!
    currentStreak: Int!
    longestStreak: Int!
    totalQuestions: Int!
    totalCorrect: Int!
    studyHours: Float!
    badges: [String!]!
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
    uid: String!
    displayName: String!
    targetExam: String!
  }

  extend type Query {
    "Current signed-in user's full profile. Throws NOT_ONBOARDED if the Firestore doc doesn't exist yet."
    me: User!
  }
  extend type Mutation {
    completeOnboarding(input: CompleteOnboardingInput!): OnboardingResult!
    updateProfile(input: UpdateProfileInput!): User!
  }
`;
