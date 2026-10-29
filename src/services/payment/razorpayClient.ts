import Razorpay from 'razorpay';


let _client: Razorpay | null = null;

export function getRazorpayKeyId(): string {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  if (!keyId) throw new Error('RAZORPAY_KEY_ID is not set.');

  return keyId;
}

export function getRazorpayKeySecret(): string {
  const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!secret) throw new Error('RAZORPAY_KEY_SECRET is not set.');

  return secret;
}

export function getRazorpayClient(): Razorpay {
  if (!_client) {
    _client = new Razorpay({
      key_id: getRazorpayKeyId(),
      key_secret: getRazorpayKeySecret(),
    });
  }

  return _client;
}
