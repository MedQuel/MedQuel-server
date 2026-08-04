import { RateLimitExceededError } from '../utils/errors.js';


interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

// Known limitation, stated plainly: this is per Cloud Run INSTANCE, not global.
// With --max-instances 20, a determined abuser spread across instances could theoretically get up to ~20x the nominal limit.
// For current traffic (1K–10K MAU) this is an acceptable tradeoff — it stops the realistic case
// (a buggy client retry-looping, or one user mashing "submit") at near-zero infra cost.
// If abuse patterns ever show up in logs, the durable fix is Cloud Memorystore (Redis) as a shared counter — same interface, swap the storage backend.
const buckets = new Map<string, number[]>();

export function checkRateLimit(key: string, config: RateLimitConfig): void {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const recent = (buckets.get(key) ?? []).filter((t) => t > windowStart);

  if (recent.length >= config.limit) {
    throw new RateLimitExceededError(`Too many requests. Limit is ${config.limit} per ${Math.round(config.windowMs / 1000)}s - please slow down.`);
  }

  recent.push(now);
  buckets.set(key, recent);
}

// Prevents unbounded memory growth from one-off users whose buckets would otherwise sit in the Map forever.
// Runs every 5 min, drops anything idle for 10+ min.
// .unref() so this timer never blocks Cloud Run's graceful shutdown.
setInterval(
  () => {
    const cutoff = Date.now() - 10*60*1000;
    for (const [key, timestamps] of buckets) {
      const recent = timestamps.filter((t) => t > cutoff);
      if (recent.length === 0) buckets.delete(key);
      else buckets.set(key, recent);
    }
  },
  5 * 60 * 1000
).unref();
