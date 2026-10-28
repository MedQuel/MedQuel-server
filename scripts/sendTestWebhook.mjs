import crypto from 'node:crypto';
// cmd:   set WEBHOOK_SECRET=<your secret>
//        node scripts/sendTestWebhook.mjs <functionUrl> <orderId> <amountPaise> [paymentId]


const [url, orderId, amountArg, paymentArg] = process.argv.slice(2);
const secret = process.env.WEBHOOK_SECRET?.trim();

if (!url || !orderId || !amountArg || !secret) {
  console.error('Usage: set WEBHOOK_SECRET=... && node scripts/sendTestWebhook.mjs <url> <orderId> <amountPaise> [paymentId]');
  process.exit(1);
}

const paymentId = paymentArg ?? `pay_TEST${Date.now().toString(36)}`;
const body = JSON.stringify({
  event: 'payment.captured',
  payload: {
    payment: {
      entity: {
        id: paymentId,
        order_id: orderId,
        amount: Number(amountArg),
        currency: 'INR',
        status: 'captured',
      },
    },
  },
});

const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');
const eventId = `evt_test_${Date.now()}`;

const res = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-razorpay-signature': signature,
    'x-razorpay-event-id': eventId,
  },
  body,
});

console.log(`HTTP ${res.status}`, await res.text());
console.log(`paymentId used: ${paymentId}   eventId used: ${eventId}`);
