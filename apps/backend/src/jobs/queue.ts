import Queue from 'bull';
import type { Job } from 'bull';
import { config } from '../config';

export const overdueQueue = new Queue('overdue-tasks', {
  redis: config.redis.url,
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