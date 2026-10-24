import { db } from '../src/config/firebase.js';
import { Timestamp } from 'firebase-admin/firestore';


const COMMON_FEATURES = [
  'Full premium question bank',
  'Unlimited quiz attempts',
  'Personalized AI study plan',
  '1.5x EP from eligible contests',
  'Unlimited user challenges',
  'Exclusive premium contests',
  'Deep performance analysis',
  'Advanced analytics',
  'Personalized recommendations',
  'Ad-free experience',
  'Early access to new features',
  'Priority support',
];

const PLANS = [
  {
    planId: 'pro_1m',
    name: 'PRO',
    tagline: '1 month',
    badge: null,
    durationDays: 30,
    pricePaise: 29900,
    sortOrder: 1,
  },
  {
    planId: 'pro_plus_3m',
    name: 'PRO PLUS',
    tagline: '3 months',
    badge: 'Most Popular',
    durationDays: 90,
    pricePaise: 69900,
    sortOrder: 2,
  },
  {
    planId: 'master_12m',
    name: 'MASTER',
    tagline: '1 year',
    badge: 'Best Value',
    durationDays: 365,
    pricePaise: 299900,
    sortOrder: 3,
  },
];

async function main(): Promise<void> {
  const now = Timestamp.now();

  for (const plan of PLANS) {
    const ref = db.collection('plans').doc(plan.planId);
    const existing = await ref.get();

    await ref.set({
      ...plan,
      currency: 'INR',
      features: COMMON_FEATURES,
      isActive: true,
      createdAt: existing.exists ? existing.data()!.createdAt : now,
      updatedAt: now,
    });

    console.log(`${existing.exists ? 'Updated' : 'Created'} plan ${plan.planId}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
