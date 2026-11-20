import { GoogleAuth } from 'google-auth-library';

import { PlayPurchaseInvalidError, PlayVerificationUnavailableError } from '../utils/errors.js';


const SCOPE = 'https://www.googleapis.com/auth/androidpublisher';
const BASE_URL = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications';

export interface PlayProductPurchase {
  orderId?: string;
  obfuscatedExternalAccountId?: string;
  acknowledgementState?: string;
  purchaseStateContext?: { purchaseState?: string };
  testPurchaseContext?: { fopType?: string };
  productLineItem?: Array<{
    productId?: string;
    productOfferDetails?: {
      quantity?: number;
      refundableQuantity?: number;
      consumptionState?: string;
    };
  }>;
}

let _auth: GoogleAuth | null = null;
function getAuth(): GoogleAuth {
  if (!_auth) _auth = new GoogleAuth({ scopes: [SCOPE] });
  return _auth;
}

export function getPlayPackageName(): string {
  return process.env.PLAY_PACKAGE_NAME?.trim() || 'com.medquel.app';
}

function mapPlayError(err: unknown, action: string): Error {
  const status = (err as { response?: { status?: number } })?.response?.status;
  const message = (err as Error)?.message ?? String(err);

  if (status === 400 || status === 404 || status === 410) {
    console.warn(`[play] ${action} rejected by Google (${status}): ${message}`);
    return new PlayPurchaseInvalidError();
  }
  if (status === 401 || status === 403) {
    console.error(`[play] ${action} not permitted (${status}). Is the Cloud Run service account invited in Play Console with order permissions? ${message}`);
    return new PlayVerificationUnavailableError();
  }

  console.error(`[play] ${action} failed (${status ?? 'no status'}): ${message}`);
  return new PlayVerificationUnavailableError();
}


export async function fetchPlayPurchase(purchaseToken: string): Promise<PlayProductPurchase> {
  const url = `${BASE_URL}/${encodeURIComponent(getPlayPackageName())}/purchases/productsv2/tokens/${encodeURIComponent(purchaseToken)}`;

  try {
    const client = await getAuth().getClient();
    const res = await client.request<PlayProductPurchase>({ url });
    return res.data;
  } catch (err) {
    throw mapPlayError(err, 'getproductpurchasev2');
  }
}

export async function acknowledgePlayPurchase(productId: string, purchaseToken: string): Promise<void> {
  const url = `${BASE_URL}/${encodeURIComponent(getPlayPackageName())}/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`;

  try {
    const client = await getAuth().getClient();
    await client.request({ url, method: 'POST', data: {} });
  } catch (err) {
    throw mapPlayError(err, 'acknowledge');
  }
}
