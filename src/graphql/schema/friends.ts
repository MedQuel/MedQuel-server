export const friendsTypeDefs = `#graphql
  enum FriendRequestStatus {
    pending
    accepted
    declined
  }
  enum FriendRelationshipStatus {
    NONE
    FRIENDS
    REQUEST_SENT
    REQUEST_RECEIVED
    SELF
  }

  type FriendRequest {
    requestId: ID!
    fromUid: ID!
    toUid: ID!
    status: FriendRequestStatus!
    createdAt: String!
    respondedAt: String
  }

  type HeadToHead {
    wins: Int!
    losses: Int!
  }
  type FriendSummary {
    uid: ID!
    displayName: String!
    photoURL: String
    currentLevel: Int!
    currentStreak: Int!
    epPoints: Int!
    headToHead: HeadToHead!
    addedAt: String!
  }

  type ProfileComparison {
    xpDelta: Int!
    epDelta: Int!
    streakDelta: Int!
    levelDelta: Int!
  }
  type PublicProfile {
    uid: ID!
    displayName: String!
    photoURL: String
    targetExam: String!
    studyLevel: String!
    specialties: [String!]!
    currentLevel: Int!
    xpPoints: Int!
    epPoints: Int!
    currentStreak: Int!
    longestStreak: Int!
    totalQuestions: Int!
    totalCorrect: Int!
    accuracy: Float!
    studyHours: Float!
    quizzesCompleted: Int!
    badges: [String!]!
    friends: [FriendSummary!]!
    relationshipStatus: FriendRelationshipStatus!
    headToHead: HeadToHead
    comparison: ProfileComparison!
  }

  type UserSearchResult {
    uid: ID!
    displayName: String!
    photoURL: String
    targetExam: String!
    relationshipStatus: FriendRelationshipStatus!
  }

  extend type Query {
    getUserProfile(uid: ID!): PublicProfile!
    searchUsers(query: String!): [UserSearchResult!]!
    getPendingFriendRequests: [FriendRequest!]!
    getFriends: [FriendSummary!]!
  }
  extend type Mutation {
    sendFriendRequest(toUid: ID!): FriendRequest!
    respondFriendRequest(requestId: ID!, accept: Boolean!): Boolean!
    removeFriend(friendUid: ID!): Boolean!
  }
`;
