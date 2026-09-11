import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { config, validateConfig } from './config';
import { errorHandler, notFoundHandler } from './shared/errors/errorHandler';
import { authRouter } from './modules/auth/routes';
import { usersRouter } from './modules/users/routes';
import { clientsRouter } from './modules/clients/routes';
import { projectsRouter } from './modules/projects/routes';
import { tasksRouter } from './modules/tasks/routes';
import { activityRouter } from './modules/activity/routes';
import { notificationsRouter } from './modules/notifications/routes';
import { dashboardRouter } from './modules/dashboard/routes';
import { initializeSocket } from './sockets';
import { scheduleOverdueJob, shutdownQueues } from './jobs/queue';

validateConfig();

const app = express();
const httpServer = createServer(app);

app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/clients', clientsRouter);
app.use('/projects', projectsRouter);
app.use('/tasks', tasksRouter);
app.use('/activity', activityRouter);
app.use('/notifications', notificationsRouter);
app.use('/dashboard', dashboardRouter);

app.use(notFoundHandler);
app.use(errorHandler);

initializeSocket(httpServer);

// Initialize background jobs
scheduleOverdueJob();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await shutdownQueues();
  httpServer.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await shutdownQueues();
  httpServer.close(() => {
    process.exit(0);
  });
});

httpServer.listen(config.port, () => {
  console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
});

export default app;