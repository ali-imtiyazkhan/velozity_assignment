# Velozity Client Project Dashboard - Implementation Plan

## Architecture Overview

### Tech Stack Decisions
| Layer | Choice | Justification |
|-------|--------|---------------|
| **Backend** | Fastify + TypeScript | Faster than Express, built-in validation, better TypeScript support, lower overhead |
| **Database** | PostgreSQL + Prisma ORM | Relational integrity, Prisma provides type-safe queries, migrations, schema visualization |
| **Real-time** | Socket.io | Auto-reconnection, rooms/namespaces for role-based filtering, fallback transports, battle-tested |
| **Background Jobs** | Bull + Redis | Persistent queues, retry logic, delayed jobs, monitoring UI, scales better than node-cron |
| **Auth** | JWT (access + refresh) + HttpOnly cookies | Secure token storage, refresh token rotation, CSRF protection via SameSite |
| **Validation** | Zod (shared schemas) | Single source of truth, inferred TypeScript types, runtime validation |
| **Frontend** | React 18 + TypeScript + Vite + TanStack Query + Zustand | Modern, performant, type-safe, server state management, lightweight global state |

---

## Database Schema (Prisma)

```prisma
// Core models with indexes for query performance

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  name          String
  role          Role      @default(DEVELOPER)
  avatarUrl     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  assignedTasks Task[]       @relation("AssignedTasks")
  createdTasks  Task[]       @relation("CreatedTasks")
  activityLogs  ActivityLog[]
  notifications Notification[]
  projects      Project[]    @relation("ProjectManager")
  
  @@index([role])
  @@index([email])
}

model Client {
  id          String    @id @default(cuid())
  name        String
  email       String    @unique
  company     String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  projects    Project[]
  
  @@index([name])
}

model Project {
  id          String    @id @default(cuid())
  name        String
  description String?
  clientId    String
  managerId   String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  client      Client    @relation(fields: [clientId], references: [id])
  manager     User      @relation("ProjectManager", fields: [managerId], references: [id])
  tasks       Task[]
  activityLogs ActivityLog[]
  
  @@index([managerId])
  @@index([clientId])
  @@index([createdAt])
}

model Task {
  id            String       @id @default(cuid())
  title         String
  description   String?
  status        TaskStatus   @default(TODO)
  priority      Priority     @default(MEDIUM)
  dueDate       DateTime
  isOverdue     Boolean      @default(false)
  projectId     String
  assigneeId    String?
  creatorId     String
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  
  project       Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignee      User?        @relation("AssignedTasks", fields: [assigneeId], references: [id])
  creator       User         @relation("CreatedTasks", fields: [creatorId], references: [id])
  activityLogs  ActivityLog[]
  notifications Notification[]
  
  @@index([projectId])
  @@index([assigneeId])
  @@index([status])
  @@index([priority])
  @@index([dueDate])
  @@index([isOverdue])
  @@index([projectId, status])
  @@index([assigneeId, status])
}

model ActivityLog {
  id          String       @id @default(cuid())
  action      String       // "STATUS_CHANGED", "ASSIGNED", "CREATED", etc.
  entityType  String       // "TASK"
  entityId    String
  oldValue    String?
  newValue    String?
  userId      String
  projectId   String
  taskId      String?
  createdAt   DateTime     @default(now())
  
  user        User         @relation(fields: [userId], references: [id])
  project     Project      @relation(fields: [projectId], references: [id])
  task        Task?        @relation(fields: [taskId], references: [id])
  
  @@index([projectId, createdAt])
  @@index([userId, createdAt])
  @@index([taskId, createdAt])
  @@index([createdAt])
}

model Notification {
  id        String           @id @default(cuid())
  type      NotificationType // "TASK_ASSIGNED", "TASK_IN_REVIEW", etc.
  title     String
  message   String
  userId    String
  taskId    String?
  readAt    DateTime?
  createdAt DateTime         @default(now())
  
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  task      Task?            @relation(fields: [taskId], references: [id], onDelete: SetNull)
  
  @@index([userId, readAt])
  @@index([userId, createdAt])
}

enum Role {
  ADMIN
  PROJECT_MANAGER
  DEVELOPER
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  IN_REVIEW
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum NotificationType {
  TASK_ASSIGNED
  TASK_IN_REVIEW
  TASK_OVERDUE
  STATUS_CHANGED
}
```

### Indexing Strategy
- **Composite indexes** for common query patterns: `(projectId, status)`, `(assigneeId, status)`, `(projectId, createdAt)`
- **Foreign key indexes** automatically created by Prisma
- **Partial indexes** for `isOverdue` where true (PostgreSQL supports this via raw SQL migration)

---

## Backend API Structure

```
src/
├── config/           # Environment, database, redis, socket config
├── modules/
│   ├── auth/
│   │   ├── routes.ts
│   │   ├── controller.ts
│   │   ├── service.ts
│   │   ├── middleware.ts      # JWT verification, role guards
│   │   └── schemas.ts         # Zod validation schemas
│   ├── users/
│   ├── clients/
│   ├── projects/
│   │   ├── routes.ts
│   │   ├── controller.ts
│   │   ├── service.ts
│   │   ├── middleware.ts      # PM ownership check
│   │   └── schemas.ts
│   ├── tasks/
│   │   ├── routes.ts
│   │   ├── controller.ts
│   │   ├── service.ts
│   │   ├── middleware.ts      # Developer task access check
│   │   └── schemas.ts
│   ├── activity/
│   │   ├── routes.ts
│   │   ├── service.ts
│   │   └── schemas.ts
│   ├── notifications/
│   │   ├── routes.ts
│   │   ├── service.ts
│   │   └── schemas.ts
│   └── dashboard/
│       ├── routes.ts
│       └── service.ts
├── jobs/
│   ├── overdue-task.job.ts    # Bull processor
│   └── queue.ts               # Bull queue setup
├── sockets/
│   ├── index.ts               # Socket.io server setup
│   ├── middleware.ts          # Socket auth + role attachment
│   ├── rooms.ts               # Room management logic
│   ├── handlers/
│   │   ├── project.ts         # Project room join/leave
│   │   ├── activity.ts        # Activity broadcast
│   │   ├── presence.ts        # Online users tracking
│   │   └── notifications.ts   # Real-time notification updates
│   └── types.ts
├── shared/
│   ├── errors/
│   │   ├── AppError.ts
│   │   └── errorHandler.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── date.ts
│   └── constants.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── main.ts                    # App entry point
```

---

## Frontend Structure

```
src/
├── api/
│   ├── client.ts          # Axios instance with interceptors
│   ├── endpoints.ts       # API endpoint constants
│   └── hooks/             # TanStack Query hooks
│       ├── useAuth.ts
│       ├── useProjects.ts
│       ├── useTasks.ts
│       ├── useActivity.ts
│       ├── useNotifications.ts
│       └── useDashboard.ts
├── components/
│   ├── ui/                # Reusable UI primitives (Button, Input, Select, Badge, Avatar, Dropdown)
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── dashboard/
│   │   ├── AdminDashboard.tsx
│   │   ├── PMDashboard.tsx
│   │   └── DeveloperDashboard.tsx
│   ├── projects/
│   │   ├── ProjectList.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectForm.tsx
│   │   └── ProjectDetail.tsx
│   ├── tasks/
│   │   ├── TaskList.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskFilters.tsx
│   │   └── TaskKanban.tsx
│   ├── activity/
│   │   ├── ActivityFeed.tsx
│   │   └── ActivityItem.tsx
│   └── notifications/
│       ├── NotificationBell.tsx
│       └── NotificationDropdown.tsx
├── contexts/
│   ├── AuthContext.tsx
│   └── SocketContext.tsx
├── hooks/
│   ├── useSocket.ts
│   ├── useOnlineUsers.ts
│   └── useDebounce.ts
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Projects.tsx
│   ├── ProjectDetail.tsx
│   ├── Tasks.tsx
│   └── Settings.tsx
├── store/
│   ├── authStore.ts       # Zustand - user, tokens
│   ├── uiStore.ts         # Zustand - sidebar, modals
│   └── notificationStore.ts # Zustand - unread count
├── types/
│   ├── api.ts
│   ├── socket.ts
│   └── models.ts
├── utils/
│   ├── formatters.ts
│   ├── permissions.ts     # Client-side permission checks (UI only)
│   └── cn.ts              # classnames utility
├── styles/
│   ├── globals.css
│   └── variables.css
├── App.tsx
└── main.tsx
```

---

## Real-Time Architecture (Socket.io)

### Room Strategy
```
Rooms:
- `project:{projectId}`        # All users viewing a project
- `user:{userId}`              # Direct notifications
- `role:admin`                 # Global admin feed
- `role:pm:{managerId}`        # PM's projects feed
- `role:developer:{userId}`    # Developer's assigned tasks feed
- `presence`                   # Online users tracking
```

### Event Flow
```
Task Status Change:
1. Client emits `task:status-update` { taskId, newStatus }
2. Server validates permissions (middleware)
3. Server updates DB, creates ActivityLog, creates Notifications
4. Server broadcasts to relevant rooms:
   - `project:{projectId}` (all viewers)
   - `role:admin` (global feed)
   - `role:pm:{managerId}` (if PM owns project)
   - `user:{assigneeId}` (developer notification)
   - `user:{pmId}` (if moved to IN_REVIEW)
5. Clients receive `activity:new` event, update UI
6. Clients receive `notification:new` event, update badge
```

### Missed Events Catch-up
```
On socket connect:
1. Server sends `activity:catchup` with last 20 events for user's accessible rooms
2. Client merges with existing feed (dedupe by ID)
3. Client requests older events on scroll (pagination)
```

---

## Authentication Flow

### Token Strategy
```
Access Token:  15 min expiry, JWT, sent in Authorization header
Refresh Token: 7 days expiry, JWT, stored in HttpOnly + Secure + SameSite=Strict cookie
```

### Login Flow
```
1. POST /auth/login { email, password }
2. Server validates, generates tokens
3. Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh
4. Response: { accessToken, user }
5. Client stores accessToken in memory (Zustand), not localStorage
```

### Token Refresh
```
1. Client detects 401 on API call
2. POST /auth/refresh (cookie sent automatically)
3. Server validates refresh token, rotates it (new refresh token)
4. New access token returned, new refresh token set in cookie
5. Client retries original request
```

### Role Middleware (API Level)
```typescript
// Every protected route uses this
const requireRole = (...allowedRoles: Role[]) => 
  async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user; // Set by auth middleware
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
  };

// Project ownership check for PM
const requireProjectOwnership = async (request: FastifyRequest) => {
  const project = await prisma.project.findUnique({
    where: { id: request.params.projectId }
  });
  if (project.managerId !== request.user.id && request.user.role !== 'ADMIN') {
    throw new ForbiddenError('Not your project');
  }
};

// Task access check for Developer
const requireTaskAccess = async (request: FastifyRequest) => {
  const task = await prisma.task.findUnique({
    where: { id: request.params.taskId }
  });
  if (task.assigneeId !== request.user.id && request.user.role !== 'ADMIN') {
    throw new ForbiddenError('Not your task');
  }
};
```

---

## Background Job: Overdue Tasks

### Bull Queue Setup
```typescript
// jobs/queue.ts
const overdueQueue = new Bull('overdue-tasks', {
  redis: { host: 'localhost', port: 6379 }
});

// jobs/overdue-task.job.ts
overdueQueue.process(async (job) => {
  const result = await prisma.task.updateMany({
    where: {
      dueDate: { lt: new Date() },
      status: { not: 'DONE' },
      isOverdue: false
    },
    data: { isOverdue: true }
  });
  
  // Create activity logs for each updated task
  // Create notifications for assignees
});

// Schedule: Run every hour
overdueQueue.add({}, { repeat: { cron: '0 * * * *' } });
```

### Why Bull over node-cron?
- Persistent jobs survive restarts
- Built-in retry with exponential backoff
- Dashboard for monitoring (Arena/Taskforce)
- Distributed processing support
- Delayed/scheduled jobs with precision

---

## Seed Data Script

```typescript
// prisma/seed.ts
async function main() {
  // 1. Create Users
  const admin = await createUser({ email: 'admin@velozity.com', role: 'ADMIN' });
  const pm1 = await createUser({ email: 'pm1@velozity.com', role: 'PROJECT_MANAGER' });
  const pm2 = await createUser({ email: 'pm2@velozity.com', role: 'PROJECT_MANAGER' });
  const devs = await Promise.all([
    createUser({ email: 'dev1@velozity.com', role: 'DEVELOPER' }),
    createUser({ email: 'dev2@velozity.com', role: 'DEVELOPER' }),
    createUser({ email: 'dev3@velozity.com', role: 'DEVELOPER' }),
    createUser({ email: 'dev4@velozity.com', role: 'DEVELOPER' }),
  ]);

  // 2. Create Clients
  const clients = await createClients(3);

  // 3. Create Projects (3+)
  const projects = await createProjects([
    { name: 'Website Redesign', clientId: clients[0].id, managerId: pm1.id },
    { name: 'Mobile App', clientId: clients[1].id, managerId: pm1.id },
    { name: 'API Integration', clientId: clients[2].id, managerId: pm2.id },
  ]);

  // 4. Create Tasks (5+ per project, various statuses)
  await createTasks(projects, devs);

  // 5. Create 2+ overdue tasks
  await createOverdueTasks(projects[0], devs[0]);

  // 6. Create Activity Logs (pre-existing feed)
  await createActivityLogs(projects, [admin, pm1, pm2, ...devs]);

  // 7. Create Notifications
  await createNotifications();
}
```

---

## Implementation Phases

### Phase 1: Foundation (Days 1-2)
- [ ] Project setup: Fastify + Prisma + TypeScript + Vite + React
- [ ] Database schema design + migrations
- [ ] Docker Compose (PostgreSQL, Redis)
- [ ] Environment configuration
- [ ] Basic project structure

### Phase 2: Authentication (Days 2-3)
- [ ] User model + password hashing (bcrypt)
- [ ] JWT access/refresh token generation
- [ ] HttpOnly cookie setup
- [ ] Login/Register/Refresh/Logout endpoints
- [ ] Auth middleware + Role guards
- [ ] Frontend: Login page, AuthContext, ProtectedRoute

### Phase 3: Core CRUD (Days 3-5)
- [ ] Clients CRUD (Admin only)
- [ ] Projects CRUD (Admin/PM with ownership)
- [ ] Tasks CRUD (role-based access)
- [ ] Task status transitions + validation
- [ ] Activity logging on every change
- [ ] Server-side validation (Zod)

### Phase 4: Real-Time (Days 5-7)
- [ ] Socket.io server setup with auth middleware
- [ ] Room management (project, role, user)
- [ ] Presence system (online users)
- [ ] Activity feed broadcast
- [ ] Notification broadcast
- [ ] Missed events catch-up on connect
- [ ] Frontend: SocketContext, useSocket hook
- [ ] Frontend: ActivityFeed component with real-time updates
- [ ] Frontend: NotificationBell with real-time badge

### Phase 5: Dashboards & Filters (Days 7-8)
- [ ] Admin Dashboard: stats, overdue count, online users
- [ ] PM Dashboard: project summary, priority breakdown, due dates
- [ ] Developer Dashboard: assigned tasks sorted
- [ ] Filter components with URL query params
- [ ] Shareable filtered URLs

### Phase 6: Notifications (Days 8-9)
- [ ] In-app notification system
- [ ] Mark read/unread (individual + bulk)
- [ ] Real-time unread count
- [ ] Dropdown UI

### Phase 7: Background Jobs (Day 9)
- [ ] Bull queue setup
- [ ] Overdue task processor
- [ ] Notification creation for overdue tasks
- [ ] Scheduled cron job

### Phase 8: Polish & Deploy (Days 10-11)
- [ ] Seed script execution
- [ ] Error handling + consistent error responses
- [ ] Input validation on all endpoints
- [ ] README with setup, architecture decisions, schema diagram
- [ ] Docker production build
- [ ] Deploy to Vercel (frontend) + Railway/Render (backend)
- [ ] Testing all role scenarios

---

## Key Technical Challenges & Solutions

### 1. Role-Filtered Real-Time Feed
**Challenge**: Same WebSocket event must deliver different data to different roles.
**Solution**: 
- Server computes visibility per recipient before broadcast
- Use room-based targeting: broadcast to `project:{id}` + `role:admin` + `role:pm:{managerId}` + `user:{assigneeId}`
- Each room receives pre-filtered payload
- No client-side filtering for security

### 2. Missed Events Catch-Up
**Challenge**: Offline users must receive last 20 events on reconnect.
**Solution**:
- On socket connect, query ActivityLog for user's accessible projects/tasks
- Use role-based query: Admin = all, PM = their projects, Developer = assigned tasks
- Send `activity:catchup` event with paginated results
- Client merges deduplicated by ID

### 3. PM Project Isolation
**Challenge**: PM must not access other PM's projects even via direct API calls.
**Solution**:
- Middleware `requireProjectOwnership` on every project/task endpoint
- Check `project.managerId === user.id` OR `user.role === ADMIN`
- Applied at route level, not just controller

### 4. Developer Task Isolation
**Challenge**: Developer sees only assigned tasks.
**Solution**:
- Middleware `requireTaskAccess` checks `task.assigneeId === user.id`
- Task list queries always filter by `assigneeId` for DEVELOPER role
- Combined with DB-level RLS policies (optional PostgreSQL row-level security)

---

## Known Limitations

1. **WebSocket scaling**: Single Socket.io instance; needs Redis adapter for horizontal scaling
2. **No file uploads**: Attachments not implemented
3. **No email notifications**: Only in-app
4. **Basic presence**: No "last seen" timestamps, just online/offline
5. **No task comments**: Activity log only tracks status changes
6. **Single tenant**: No multi-organization support

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/velozity"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_ACCESS_SECRET="your-access-secret-32-chars-min"
JWT_REFRESH_SECRET="your-refresh-secret-32-chars-min"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# App
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:5173"

# Socket
SOCKET_CORS_ORIGIN="http://localhost:5173"
```

---

## Docker Setup

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: velozity
      POSTGRES_USER: velozity
      POSTGRES_PASSWORD: velozity
    ports: ["5432:5432"]
    volumes: ["postgres_data:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U velozity"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    volumes: ["redis_data:/data"]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  backend:
    build: ./backend
    ports: ["3001:3001"]
    environment:
      - DATABASE_URL=postgresql://velozity:velozity@postgres:5432/velozity
      - REDIS_URL=redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes: ["./backend:/app", "/app/node_modules"]

  frontend:
    build: ./frontend
    ports: ["5173:5173"]
    environment:
      - VITE_API_URL=http://localhost:3001
    depends_on: ["backend"]
    volumes: ["./frontend:/app", "/app/node_modules"]

volumes:
  postgres_data:
  redis_data:
```

---

## README Checklist

- [ ] Local setup with Docker (one command)
- [ ] Database schema diagram (Mermaid or dbdocs.io)
- [ ] Architecture decisions:
  - WebSocket library choice (Socket.io)
  - Job queue choice (Bull)
  - Token storage approach (HttpOnly cookies)
  - Why Fastify over Express
  - Why Prisma over raw SQL
- [ ] API documentation (endpoints, auth, errors)
- [ ] Seed data instructions
- [ ] Deployment guide (Vercel + Railway/Render)
- [ ] Known limitations
- [ ] Explanation field (150-250 words)

---

## Submission Checklist

- [ ] Public GitHub repository
- [ ] Live Vercel deployment link
- [ ] README with all required sections
- [ ] Seed script that runs successfully
- [ ] All 3 roles functional with proper isolation
- [ ] Real-time feed working with role filtering
- [ ] Missed events catch-up working
- [ ] Overdue job running
- [ ] Notifications real-time
- [ ] No hardcoded secrets
- [ ] TypeScript strict mode
- [ ] Consistent error responses
- [ ] Server-side validation on all inputs