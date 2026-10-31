export const paymentTypeDefs = `#graphql
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
  enum VerifyPaymentStatus {
    activated
    pending
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

  enum PremiumState {
    active
    expired
    none
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
  }

  extend type Query {
    getPlans: [Plan!]!
    getPremiumStatus: PremiumStatus!
    getPaymentStatus(orderId: ID!): PaymentStatus!
  }
  extend type Mutation {
    initiatePayment(planId: ID!): PaymentOrder!
    verifyPayment(input: VerifyPaymentInput!): VerifyPaymentResult!
  }
`;
