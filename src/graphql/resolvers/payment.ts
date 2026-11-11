import type { GraphQLContext } from '../context.js';
import { AuthenticationError } from '../../utils/errors.js';
import type { VerifyPaymentInput } from '../../validators/paymentValidation.js';
import { getPaymentStatus, getPremiumStatus } from '../../services/paymentService.js';
import { validateAcknowledgeBadgeIds } from '../../validators/premiumRewardValidation.js';
import { getPlans, verifyPayment, initiatePayment } from '../../services/paymentService.js';
import { getRazorpayKeyId, getRazorpayClient } from '../../services/payment/razorpayClient.js';
import { acknowledgePremiumReward, getPendingPremiumReward } from '../../services/premiumRewardService.js';
import { validatePlanId, validateOrderId, validateVerifyPaymentInput } from '../../validators/paymentValidation.js';


export async function getPlansResolver(_parent: unknown, _args: unknown, context: GraphQLContext) {
  return getPlans(context.db);
}

export async function initiatePaymentResolver(_parent: unknown, args: { planId: string }, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();
  const planId = validatePlanId(args.planId);

  return initiatePayment(
    context.user.uid,
    planId,
    context.db,
    getRazorpayClient(),
    getRazorpayKeyId()
  );
}

export async function verifyPaymentResolver(_parent: unknown, args: { input: VerifyPaymentInput }, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();
  const validated = validateVerifyPaymentInput(args.input);

  return verifyPayment(
    context.user.uid,
    validated,
    context.db,
    context.auth,
    getRazorpayClient()
  );
}

export async function getPaymentStatusResolver(_parent: unknown, args: { orderId: string }, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();
  const orderId = validateOrderId(args.orderId);

  return getPaymentStatus(
    context.user.uid,
    orderId,
    context.db
  );
}

export async function getPremiumStatusResolver(_parent: unknown, _args: unknown, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();

  return getPremiumStatus(
    context.user.uid,
    context.db
  );
}

export async function getPendingPremiumRewardResolver(_parent: unknown, _args: unknown, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();

  return getPendingPremiumReward(
    context.user.uid,
    context.db
  );
}

export async function acknowledgePremiumRewardResolver(_parent: unknown, args: { badgeIds: string[] }, context: GraphQLContext) {
  if (!context.user) throw new AuthenticationError();
  const badgeIds = validateAcknowledgeBadgeIds(args.badgeIds);

  return acknowledgePremiumReward(
    context.user.uid,
    badgeIds,
    context.db
  );
}
