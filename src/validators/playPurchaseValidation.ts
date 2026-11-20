import { GraphQLError } from 'graphql';


const PRODUCT_ID_PATTERN = /^[a-z0-9][a-z0-9_.]{0,99}$/;
const PURCHASE_TOKEN_PATTERN = /^[A-Za-z0-9._~-]{20,1000}$/;

export interface VerifyPlayPurchaseInput {
  productId: string;
  purchaseToken: string;
}
export interface ValidatedPlayPurchase {
  productId: string;
  purchaseToken: string;
}

function badInput(message: string): never {
  throw new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });
}

export function validatePlayPurchaseInput(input: VerifyPlayPurchaseInput): ValidatedPlayPurchase {
  const productId = input.productId?.trim();
  if (!productId || !PRODUCT_ID_PATTERN.test(productId)) {
    badInput('productId is invalid.');
  }

  const purchaseToken = input.purchaseToken?.trim();
  if (!purchaseToken || !PURCHASE_TOKEN_PATTERN.test(purchaseToken)) {
    badInput('purchaseToken is invalid.');
  }

  return { productId: productId!, purchaseToken: purchaseToken! };
}
