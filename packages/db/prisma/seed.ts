import { Role, TaskStatus, Priority } from '../index';
import bcrypt from 'bcryptjs';

import prisma from '../index';
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('🌱 Starting seed...');

  // Create Users
  console.log('Creating users...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@velozity.com' },
    update: {},
    create: {
      email: 'admin@velozity.com',
      name: 'Admin User',
      passwordHash: await hashPassword('password123'),
      role: Role.ADMIN,
    },
  });

  const pm1 = await prisma.user.upsert({
    where: { email: 'pm1@velozity.com' },
    update: {},
    create: {
      email: 'pm1@velozity.com',
      name: 'Sarah Johnson',
      passwordHash: await hashPassword('password123'),
      role: Role.PROJECT_MANAGER,
    },
  });

  const pm2 = await prisma.user.upsert({
    where: { email: 'pm2@velozity.com' },
    update: {},
    create: {
      email: 'pm2@velozity.com',
      name: 'Mike Chen',
      passwordHash: await hashPassword('password123'),
      role: Role.PROJECT_MANAGER,
    },
  });

  const devs = await Promise.all([
    prisma.user.upsert({
      where: { email: 'dev1@velozity.com' },
      update: {},
      create: {
        email: 'dev1@velozity.com',
        name: 'Alex Rivera',
        passwordHash: await hashPassword('password123'),
        role: Role.DEVELOPER,
      },
    }),
    prisma.user.upsert({
      where: { email: 'dev2@velozity.com' },
      update: {},
      create: {
        email: 'dev2@velozity.com',
        name: 'Jordan Kim',
        passwordHash: await hashPassword('password123'),
        role: Role.DEVELOPER,
      },
    }),
    prisma.user.upsert({
      where: { email: 'dev3@velozity.com' },
      update: {},
      create: {
        email: 'dev3@velozity.com',
        name: 'Taylor Brooks',
        passwordHash: await hashPassword('password123'),
        role: Role.DEVELOPER,
      },
    }),
    prisma.user.upsert({
      where: { email: 'dev4@velozity.com' },
      update: {},
      create: {
        email: 'dev4@velozity.com',
        name: 'Casey Morgan',
        passwordHash: await hashPassword('password123'),
        role: Role.DEVELOPER,
      },
    }),
  ]);

  console.log(`Created ${2 + 2 + 4} users`);

  // Create Clients
  console.log('Creating clients...');
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { email: 'contact@acmecorp.com' },
      update: {},
      create: {
        name: 'Acme Corporation',
        email: 'contact@acmecorp.com',
        company: 'Acme Corp',
      },
    }),
    prisma.client.upsert({
      where: { email: 'hello@techstart.io' },
      update: {},
      create: {
        name: 'TechStart Inc',
        email: 'hello@techstart.io',
        company: 'TechStart',
      },
    }),
    prisma.client.upsert({
      where: { email: 'info@globalent.com' },
      update: {},
      create: {
        name: 'Global Enterprises',
        email: 'info@globalent.com',
        company: 'Global Ent.',
      },
    }),
  ]);

  console.log(`Created ${clients.length} clients`);

  // Create Projects
  console.log('Creating projects...');
  const projects = await Promise.all([
    prisma.project.upsert({
      where: { id: 'project-website-redesign' },
      update: {},
      create: {
        id: 'project-website-redesign',
        name: 'Website Redesign',
        description: 'Complete redesign of company website with modern UI/UX',
        clientId: clients[0].id,
        managerId: pm1.id,
      },
    }),
    prisma.project.upsert({
      where: { id: 'project-mobile-app' },
      update: {},
      create: {
        id: 'project-mobile-app',
        name: 'Mobile App Development',
        description: 'Cross-platform mobile app for iOS and Android',
        clientId: clients[1].id,
        managerId: pm1.id,
      },
    }),
    prisma.project.upsert({
      where: { id: 'project-api-integration' },
      update: {},
      create: {
        id: 'project-api-integration',
        name: 'API Integration Platform',
        description: 'Unified API gateway for third-party integrations',
        clientId: clients[2].id,
        managerId: pm2.id,
      },
    }),
    prisma.project.upsert({
      where: { id: 'project-dashboard-analytics' },
      update: {},
      create: {
        id: 'project-dashboard-analytics',
        name: 'Analytics Dashboard',
        description: 'Real-time analytics and reporting dashboard',
        clientId: clients[0].id,
        managerId: pm2.id,
      },
    }),
  ]);

  console.log(`Created ${projects.length} projects`);

  // Create Tasks (5+ per project, various statuses)
  console.log('Creating tasks...');
  const allTasks: Array<{
    title: string;
    description: string;
    status: TaskStatus;
    priority: Priority;
    dueDate: Date;
    projectId: string;
    assigneeId?: string;
    creatorId: string;
  }> = [];

  //  Website Redesign (pm1, devs[0], devs[1])
  allTasks.push(
    {
      title: 'Design System Setup',
      description: 'Create design tokens, color palette, typography scale',
      status: TaskStatus.DONE,
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      projectId: projects[0].id,
      assigneeId: devs[0].id,
      creatorId: pm1.id,
    },
    {
      title: 'Homepage Redesign',
      description: 'Redesign hero section, features, testimonials, footer',
      status: TaskStatus.IN_REVIEW,
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      projectId: projects[0].id,
      assigneeId: devs[0].id,
      creatorId: pm1.id,
    },
    {
      title: 'Component Library',
      description: 'Build reusable React components (Button, Card, Input, Modal)',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.MEDIUM,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      projectId: projects[0].id,
      assigneeId: devs[1].id,
      creatorId: pm1.id,
    },
    {
      title: 'Responsive Layout',
      description: 'Ensure mobile-first responsive design across all breakpoints',
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      projectId: projects[0].id,
      assigneeId: devs[1].id,
      creatorId: pm1.id,
    },
    {
      title: 'Accessibility Audit',
      description: 'WCAG 2.1 AA compliance testing and fixes',
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      projectId: projects[0].id,
      assigneeId: devs[0].id,
      creatorId: pm1.id,
    },
    {
      title: 'Performance Optimization',
      description: 'Lazy loading, code splitting, image optimization',
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      projectId: projects[0].id,
      assigneeId: devs[2].id,
      creatorId: pm1.id,
    },
  );

  //  Mobile App (pm1, devs[2], devs[3])
  allTasks.push(
    {
      title: 'Project Setup & Configuration',
      description: 'Initialize React Native project with TypeScript, navigation',
      status: TaskStatus.DONE,
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      projectId: projects[1].id,
      assigneeId: devs[2].id,
      creatorId: pm1.id,
    },
    {
      title: 'Authentication Flow',
      description: 'Login, register, forgot password, biometric auth',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.CRITICAL,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      projectId: projects[1].id,
      assigneeId: devs[2].id,
      creatorId: pm1.id,
    },
    {
      title: 'Push Notifications',
      description: 'FCM/APNs integration with notification center',
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      projectId: projects[1].id,
      assigneeId: devs[3].id,
      creatorId: pm1.id,
    },
    {
      title: 'Offline Mode Support',
      description: 'Local storage sync, conflict resolution',
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      projectId: projects[1].id,
      assigneeId: devs[3].id,
      creatorId: pm1.id,
    },
    {
      title: 'App Store Deployment',
      description: 'Build configuration, TestFlight, Play Console setup',
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      projectId: projects[1].id,
      assigneeId: devs[2].id,
      creatorId: pm1.id,
    },
  );

  // API Integration (pm2, devs[0], devs[2])
  allTasks.push(
    {
      title: 'API Gateway Setup',
      description: 'Kong/Express gateway with rate limiting, auth',
      status: TaskStatus.DONE,
      priority: Priority.CRITICAL,
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      projectId: projects[2].id,
      assigneeId: devs[0].id,
      creatorId: pm2.id,
    },
    {
      title: 'Third-party Connectors',
      description: 'Stripe, SendGrid, Twilio, AWS S3 integrations',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      projectId: projects[2].id,
      assigneeId: devs[0].id,
      creatorId: pm2.id,
    },
    {
      title: 'Webhook System',
      description: 'Retry logic, dead letter queue, signature verification',
      status: TaskStatus.IN_REVIEW,
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      projectId: projects[2].id,
      assigneeId: devs[2].id,
      creatorId: pm2.id,
    },
    {
      title: 'Rate Limiting & Quotas',
      description: 'Per-client quotas, burst handling, analytics',
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      projectId: projects[2].id,
      assigneeId: devs[1].id,
      creatorId: pm2.id,
    },
    {
      title: 'Developer Portal',
      description: 'API docs, sandbox, key management',
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      projectId: projects[2].id,
      assigneeId: devs[3].id,
      creatorId: pm2.id,
    },
  );

  //  Analytics Dashboard (pm2, devs[1], devs[3])
  allTasks.push(
    {
      title: 'Data Pipeline Setup',
      description: 'ETL pipelines, data warehouse, real-time streaming',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.CRITICAL,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      projectId: projects[3].id,
      assigneeId: devs[1].id,
      creatorId: pm2.id,
    },
    {
      title: 'Chart Components',
      description: 'Line, bar, pie, heatmap, funnel charts with Recharts',
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      projectId: projects[3].id,
      assigneeId: devs[3].id,
      creatorId: pm2.id,
    },
    {
      title: 'Custom Report Builder',
      description: 'Drag-drop report creator, scheduled exports',
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      projectId: projects[3].id,
      assigneeId: devs[1].id,
      creatorId: pm2.id,
    },
    {
      title: 'Alerting Engine',
      description: 'Threshold alerts, anomaly detection, notifications',
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      projectId: projects[3].id,
      assigneeId: devs[2].id,
      creatorId: pm2.id,
    },
    {
      title: 'Overdue Task (for testing)',
      description: 'This task is intentionally overdue',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      projectId: projects[3].id,
      assigneeId: devs[3].id,
      creatorId: pm2.id,
    },
  );

  for (const task of allTasks) {
    await prisma.task.create({
      data: {
        ...task,
        isOverdue: task.dueDate < new Date() && task.status !== TaskStatus.DONE,
      },
    });
  }

  console.log(`Created ${allTasks.length} tasks`);

  // Create Activity Logs
  console.log('Creating activity logs...');
  const activityActions = [
    { action: 'CREATED', entityType: 'TASK', entityId: allTasks[0]?.title },
    { action: 'STATUS_CHANGED', entityType: 'TASK', entityId: allTasks[1]?.title, oldValue: 'TODO', newValue: 'IN_PROGRESS' },
    { action: 'STATUS_CHANGED', entityType: 'TASK', entityId: allTasks[1]?.title, oldValue: 'IN_PROGRESS', newValue: 'IN_REVIEW' },
    { action: 'ASSIGNED', entityType: 'TASK', entityId: allTasks[2]?.title, newValue: devs[1].name },
    { action: 'CREATED', entityType: 'PROJECT', entityId: projects[0].name },
    { action: 'CREATED', entityType: 'CLIENT', entityId: clients[0].name },
  ];

  for (let i = 0; i < activityActions.length; i++) {
    const a = activityActions[i];
    if (!a) {
      return;
    }
    const task = allTasks.find(t => t.title === a.entityId) || allTasks[0];
    if (!task) {
      return;
    }
    await prisma.activityLog.create({
      data: {
        action: a.action,
        entityType: a.entityType,
        entityId: task.title,
        oldValue: a.oldValue || null,
        newValue: a.newValue || null,
        userId: [admin.id, pm1.id, pm2.id, ...devs.map(d => d.id)][i % (2 + 2 + 4)] ?? "",
        projectId: task.projectId,
        taskId: task.title === a.entityId ? task.title : undefined,
      },
    });
  }

  // Add more activity logs for each project
  for (const project of projects) {
    for (let i = 0; i < 3; i++) {
      const task = allTasks.find(t => t.projectId === project.id);
      if (task) {
        await prisma.activityLog.create({
          data: {
            action: ['CREATED', 'STATUS_CHANGED', 'ASSIGNED'][i % 3] ?? "",
            entityType: 'TASK',
            entityId: task.title,
            oldValue: i === 1 ? 'TODO' : null,
            newValue: i === 1 ? 'IN_PROGRESS' : null,
            userId: project.managerId,
            projectId: project.id,
            taskId: task.title,
          },
        });
      }
    }
  }

  console.log('Created activity logs');

  //  Notifications
  console.log('Creating notifications...');
  const notificationTypes = ['TASK_ASSIGNED', 'TASK_IN_REVIEW', 'TASK_OVERDUE', 'STATUS_CHANGED'];

  for (const dev of devs) {
    const devTasks = allTasks.filter(t => t.assigneeId === dev.id);
    for (let i = 0; i < Math.min(3, devTasks.length); i++) {
      const task = devTasks[i];
      await prisma.notification.create({
        data: {
          type: notificationTypes[i % notificationTypes.length] as any,
          title: 'Test Notification',
          message: `Related to "${task?.title}"`,
          userId: dev.id,
          taskId: task?.title,
          readAt: i === 0 ? new Date() : null,
        },
      });
    }
  }

  // PM notifications
  for (const pm of [pm1, pm2]) {
    const pmProjects = projects.filter(p => p.managerId === pm.id);
    for (const project of pmProjects) {
      const projectTasks = allTasks.filter(t => t.projectId === project.id);
      if (projectTasks.length > 0) {
        await prisma.notification.create({
          data: {
            type: 'TASK_IN_REVIEW',
            title: 'Task Ready for Review',
            message: `"${projectTasks[0]?.title}" in "${project.name}" needs review`,
            userId: pm.id,
            taskId: projectTasks[0]?.title,
            readAt: null,
          },
        });
      }
    }
  }

  console.log('Created notifications');

  console.log(' Seed completed successfully!');
  console.log(`
Test Accounts:
- Admin: admin@velozity.com / password123
- PM: pm1@velozity.com / password123
- PM: pm2@velozity.com / password123
- Devs: dev1-4@velozity.com / password123
  `);
}

main()
  .catch((e) => {
    console.error(' Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });