import { PubSub } from '@google-cloud/pubsub';


let _pubsub: PubSub | null = null;
function getPubSub(): PubSub {
  if (!_pubsub) _pubsub = new PubSub({ projectId: process.env.FIREBASE_PROJECT_ID });
  return _pubsub;
}


export interface QuizCompletedEvent {
  sessionId: string;
  userId: string;
  quizType: string;
  contestId: string | null;
  subject: string;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  score: number;
  scorePercent: number;
  epEarned: number;
  xpEarned: number;
  completedAt: string;
}
// Publishes the quiz_completed event that onQuizCompleted / evaluateBadges Cloud Functions will subscribe to.
export async function publishQuizCompleted(event: QuizCompletedEvent): Promise<void> {
  const topicName = process.env.PUBSUB_TOPIC_QUIZ;
  if (!topicName) {
    console.warn('[pubsub] PUBSUB_TOPIC_QUIZ not set — skipping quiz_completed publish.');
    return;
  }

  try {
    const dataBuffer = Buffer.from(JSON.stringify(event));
    await getPubSub().topic(topicName).publishMessage({ data: dataBuffer, attributes: { eventType: 'quiz_completed' } });
  } catch (err) {
    if ((err as { code?: number }).code === 5) {
      console.warn(`[pubsub] Topic "${topicName}" not found yet — skipping publish.`);
      return;
    }
    console.error('[pubsub] Failed to publish quiz_completed event:', err);
  }
}
