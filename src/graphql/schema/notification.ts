export const notificationTypeDefs = `#graphql
  enum NotificationType {
    streak
    contest
    level
    leaderboard
    achievements
    chat
    dailyChallenge
    premium
    studyPlan
    friends
    challenge
    announcement
  }

  type Notification {
    notificationId: ID!
    type: NotificationType!
    kind: String!
    title: String!
    body: String!
    data: String!
    isRead: Boolean!
    createdAt: String!
  }
  type NotificationsResult {
    notifications: [Notification!]!
    nextCursor: String
  }

  extend type Query {
    getNotifications(limit: Int, cursor: String): NotificationsResult!
    getUnreadNotificationCount: Int!
  }
  extend type Mutation {
    markNotificationRead(notificationId: ID!): Notification!
    markAllNotificationsRead: Int!
    registerDeviceToken(token: String!): Boolean!
    unregisterDeviceToken(token: String!): Boolean!
  }
`;
