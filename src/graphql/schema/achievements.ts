export const achievementsTypeDefs = `#graphql
  enum BadgeRarity { Common Rare Epic Legendary }
  enum BadgeVariant { gold red purple blue green }
  enum BadgeStatus { earned in_progress locked }

  type Badge {
    badgeId: ID!
    name: String!
    description: String!
    iconKey: String!
    variant: BadgeVariant!
    rarity: BadgeRarity!
    category: String!
    requirementValue: Float!
    currentProgress: Float!
    rewardPremiumDays: Int!
    status: BadgeStatus!
    earnedAt: String
  }

  extend type Query {
    getAchievements: [Badge!]!
  }
`;
