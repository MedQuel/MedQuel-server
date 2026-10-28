import { GraphQLError } from 'graphql';


const PLAN_ID_PATTERN = /^[a-z0-9_]{1,40}$/;
const RAZORPAY_ORDER_ID_PATTERN = /^order_[A-Za-z0-9]{6,40}$/;
const RAZORPAY_PAYMENT_ID_PATTERN = /^pay_[A-Za-z0-9]{6,40}$/;
const SIGNATURE_PATTERN = /^[a-f0-9]{64}$/i;

export interface VerifyPaymentInput {
  orderId: string;
  paymentId: string;
  signature: string;
}
export interface ValidatedVerifyPayment {
  orderId: string;
  paymentId: string;
  signature: string;
}

function badInput(message: string): never {
  throw new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });
}


export function validatePlanId(planId: string): string {
  const trimmed = planId?.trim();
  if (!trimmed || !PLAN_ID_PATTERN.test(trimmed)) badInput('planId is invalid.');

  return trimmed!;
}

export function validateOrderId(orderId: string): string {
  const trimmed = orderId?.trim();
  if (!trimmed || !RAZORPAY_ORDER_ID_PATTERN.test(trimmed)) badInput('orderId is invalid.');

  return trimmed!;
}

export function validateVerifyPaymentInput(input: VerifyPaymentInput): ValidatedVerifyPayment {
  const orderId = validateOrderId(input.orderId);

  const paymentId = input.paymentId?.trim();
  if (!paymentId || !RAZORPAY_PAYMENT_ID_PATTERN.test(paymentId)) badInput('paymentId is invalid.');

  const signature = input.signature?.trim();
  if (!signature || !SIGNATURE_PATTERN.test(signature)) badInput('signature is invalid.');

  return {
    orderId,
    paymentId: paymentId!,
    signature: signature!.toLowerCase(),
  };
}
