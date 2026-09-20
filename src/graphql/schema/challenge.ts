export const challengeTypeDefs = `#graphql
  enum ChallengeStatus { pending active completed declined expired cancelled }
  enum ParticipantResponseStatus { invited accepted declined }

  type ParticipantState {
    uid: ID!
    status: ParticipantResponseStatus!
    respondedAt: String
    score: Int
    correctCount: Int
    quizSessionId: ID
    completedAt: String
  }
  type ChallengeRewards {
    winnerEp: Int!
    participationEp: Int!
  }

  type Challenge {
    challengeId: ID!
    createdBy: ID!
    participants: [ID!]!
    participantStates: [ParticipantState!]!
    subject: String!
    difficulty: QuizDifficulty!
    questionCount: Int!
    timeLimitSecs: Int!
    status: ChallengeStatus!
    winnerUid: ID
    rewards: ChallengeRewards!
    expiresAt: String!
    createdAt: String!
    updatedAt: String!
  }

  input CreateChallengeInput {
    toUid: ID!
    subject: String!
    difficulty: QuizDifficulty!
    questionCount: Int!
    timeLimitSecs: Int
  }

  input GetChallengesFilter {
    status: ChallengeStatus
    limit: Int
  }

  extend type Query {
    getChallenge(challengeId: ID!): Challenge
    getChallenges(filter: GetChallengesFilter): [Challenge!]!
  }
  extend type Mutation {
    createChallenge(input: CreateChallengeInput!): Challenge!
    respondChallenge(challengeId: ID!, accept: Boolean!): Challenge!
  }
`;
