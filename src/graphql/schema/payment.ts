export const paymentTypeDefs = `#graphql
  enum PremiumSource { paid reward }
  enum PremiumState { active expired none }
  enum VerifyPaymentStatus { activated pending }

  type PremiumRewardBadge {
    badgeId: ID!
    name: String!
    iconKey: String!
    variant: String!
    rarity: String!
    days: Int!
  }
  type PendingPremiumReward {
    totalDays: Int!
    premiumExpiresAt: String
    premiumActive: Boolean!
    badges: [PremiumRewardBadge!]!
  }

  type Plan {
    planId: ID!
    name: String!
    tagline: String
    badge: String
    durationDays: Int!
    pricePaise: Int!
    currency: String!
    features: [String!]!
    sortOrder: Int!
  }

  type PaymentOrder {
    orderId: ID!
    keyId: String!
    amount: Int!
    currency: String!
    planId: ID!
    planName: String!
    prefillName: String
    prefillEmail: String
  }
  input VerifyPaymentInput {
    orderId: ID!
    paymentId: ID!
    signature: String!
  }
  type VerifyPaymentResult {
    status: VerifyPaymentStatus!
    isPremium: Boolean!
    premiumExpiresAt: String
    premiumPlanId: String
  }

  type PaymentStatus {
    orderId: ID!
    status: String!
    planId: ID!
    isPremium: Boolean!
    premiumExpiresAt: String
  }
  type PremiumStatus {
    state: PremiumState!
    isPremium: Boolean!
    planId: String
    planName: String
    planDurationDays: Int
    premiumExpiresAt: String
    daysRemaining: Int!
    lastPurchasedAt: String
    source: PremiumSource
    rewardPremiumDaysTotal: Int!
  }

  extend type Query {
    getPlans: [Plan!]!
    getPremiumStatus: PremiumStatus!
    getPaymentStatus(orderId: ID!): PaymentStatus!
    getPendingPremiumReward: PendingPremiumReward
  }
  extend type Mutation {
    initiatePayment(planId: ID!): PaymentOrder!
    verifyPayment(input: VerifyPaymentInput!): VerifyPaymentResult!
    acknowledgePremiumReward(badgeIds: [ID!]!): Boolean!
  }
`;
