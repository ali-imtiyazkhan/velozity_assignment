import type { Job } from 'bull';
import { overdueQueue } from './queue';
import { createActivityLog } from '../modules/activity/service';
import { getIO } from '../sockets';
import prisma from 'db';

export async function processOverdueTasks(job: Job) {
  console.log('Processing overdue tasks...');

  const now = new Date();

  const overdueTasks = await prisma.task.findMany({
    where: {
      dueDate: { lt: now },
      status: { not: 'DONE' },
      isOverdue: false,
    },
    include: {
      project: { select: { id: true, managerId: true, name: true } },
      assignee: { select: { id: true, name: true, email: true } },
    },
  });

  if (overdueTasks.length === 0) {
    console.log('No overdue tasks found');
    return { processed: 0 };
  }

  console.log(`Found ${overdueTasks.length} overdue tasks`);

  const taskIds = overdueTasks.map(t => t.id);

  // Update all overdue tasks
  await prisma.task.updateMany({
    where: { id: { in: taskIds } },
    data: { isOverdue: true },
  });

  // Create activity logs and notifications for each task
  for (const task of overdueTasks) {
    try {
      // Create activity log
      await createActivityLog({
        action: 'OVERDUE',
        entityType: 'TASK',
        entityId: task.id,
        newValue: 'true',
        userId: task.assigneeId || task.creatorId,
        projectId: task.projectId,
        taskId: task.id,
      });

      // Create notification for assignee
      if (task.assigneeId) {
        await prisma.notification.create({
          data: {
            type: 'TASK_OVERDUE',
            title: 'Task Overdue',
            message: `"${task.title}" in project "${task.project.name}" is now overdue`,
            userId: task.assigneeId,
            taskId: task.id,
          },
        });

        // Emit real-time notification
        try {
          const io = getIO();
          io.to(`user:${task.assigneeId}`).emit('notification:new', {
            id: `overdue-${task.id}`,
            type: 'TASK_OVERDUE',
            title: 'Task Overdue',
            message: `"${task.title}" in project "${task.project.name}" is now overdue`,
            userId: task.assigneeId,
            taskId: task.id,
            readAt: null,
            createdAt: new Date().toISOString(),
            task: { id: task.id, title: task.title, projectId: task.projectId },
          });
        } catch {
          // Socket not initialized yet, skip
        }
      }

      // Notify PM if task moves to overdue
      if (task.project.managerId && task.project.managerId !== task.assigneeId) {
        await prisma.notification.create({
          data: {
            type: 'TASK_OVERDUE',
            title: 'Task Overdue (Your Project)',
            message: `"${task.title}" in project "${task.project.name}" is now overdue`,
            userId: task.project.managerId,
            taskId: task.id,
          },
        });

        try {
          const io = getIO();
          io.to(`user:${task.project.managerId}`).emit('notification:new', {
            id: `overdue-pm-${task.id}`,
            type: 'TASK_OVERDUE',
            title: 'Task Overdue (Your Project)',
            message: `"${task.title}" in project "${task.project.name}" is now overdue`,
            userId: task.project.managerId,
            taskId: task.id,
            readAt: null,
            createdAt: new Date().toISOString(),
            task: { id: task.id, title: task.title, projectId: task.projectId },
          });
        } catch {
          // Socket not initialized yet, skip
        }
      }
    } catch (err) {
      console.error(`Failed to create activity/notification for task ${task.id}:`, err);
    }
  }

  console.log(`Processed ${overdueTasks.length} overdue tasks`);
  return { processed: overdueTasks.length };
}

// Register the processor
overdueQueue.process('check-overdue', processOverdueTasks);