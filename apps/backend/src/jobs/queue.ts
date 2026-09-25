import Queue from 'bull';
import type { Job } from 'bull';
import Redis from 'ioredis';
import { config } from '../config';

function parseRedisUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || '6379', 10),
    password: parsed.password || undefined,
    username: parsed.username || undefined,
    tls: parsed.protocol === 'rediss:' ? {} : undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
  };
}

const createRedisClient = () => new Redis(parseRedisUrl(config.redis.url));

export const overdueQueue = new Queue('overdue-tasks', {
  createClient: createRedisClient,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

overdueQueue.on('error', (err: Error) => {
  console.error('Overdue queue error:', err);
});

overdueQueue.on('failed', (job: Job, err: Error) => {
  console.error(`Job ${job.id} failed:`, err);
});

export async function scheduleOverdueJob() {
  await overdueQueue.add(
    'check-overdue',
    {},
    {
      repeat: { cron: '0 * * * *' }, // Every hour
      jobId: 'check-overdue-hourly',
    }
  );
  console.log('Overdue task check scheduled (hourly)');
}

export async function shutdownQueues() {
  await overdueQueue.close();
  console.log('Queues shut down');
}