# Velozity - Client Project Dashboard

A modern, full-stack project management dashboard with real-time collaboration, role-based access control, and background job processing.

## 🏗️ Architecture

### Tech Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Backend** | Node.js + Express + TypeScript | Fast, mature ecosystem, excellent TypeScript support |
| **Database** | PostgreSQL + Prisma ORM | Relational integrity, type-safe queries, migrations, schema visualization |
| **Real-time** | Socket.io | Auto-reconnection, rooms/namespaces for role-based filtering, fallback transports, battle-tested |
| **Background Jobs** | Bull + Redis | Persistent queues, retry logic, delayed jobs, monitoring UI, scales better than node-cron |
| **Auth** | JWT (access + refresh) + HttpOnly cookies | Secure token storage, refresh token rotation, CSRF protection via SameSite |
| **Validation** | Zod | Single source of truth, inferred TypeScript types, runtime validation |
| **Frontend** | React 18 + TypeScript + Next.js + TanStack Query + Zustand | Modern, performant, type-safe, server state management, lightweight global state |

### Database Schema Diagram

```mermaid
erDiagram
    USER ||--o{ TASK : assigned
    USER ||--o{ TASK : created
    USER ||--o{ ACTIVITY_LOG : performs
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ PROJECT : manages
    CLIENT ||--o{ PROJECT : owns
    PROJECT ||--o{ TASK : contains
    PROJECT ||--o{ ACTIVITY_LOG : logs
    TASK ||--o{ ACTIVITY_LOG : generates
    TASK ||--o{ NOTIFICATION : triggers

    USER {
        string id PK
        string email UK
        string passwordHash
        string name
        enum role
        string avatarUrl
        datetime createdAt
        datetime updatedAt
    }

    CLIENT {
        string id PK
        string name
        string email UK
        string company
        datetime createdAt
        datetime updatedAt
    }

    PROJECT {
        string id PK
        string name
        string description
        string clientId FK
        string managerId FK
        datetime createdAt
        datetime updatedAt
    }

    TASK {
        string id PK
        string title
        string description
        enum status
        enum priority
        datetime dueDate
        boolean isOverdue
        string projectId FK
        string assigneeId FK
        string creatorId FK
        datetime createdAt
        datetime updatedAt
    }

    ACTIVITY_LOG {
        string id PK
        string action
        string entityType
        string entityId
        string oldValue
        string newValue
        string userId FK
        string projectId FK
        string taskId FK
        datetime createdAt
    }

    NOTIFICATION {
        string id PK
        enum type
        string title
        string message
        string userId FK
        string taskId FK
        datetime readAt
        datetime createdAt
    }
```

### Indexing Strategy
- **Composite indexes** for common query patterns: `(projectId, status)`, `(assigneeId, status)`, `(projectId, createdAt)`
- **Foreign key indexes** automatically created by Prisma
- **Partial indexes** for `isOverdue` where true (PostgreSQL supports this via raw SQL migration)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Bun (recommended) or npm/yarn

### Environment Variables

Create `.env` files in the appropriate locations:

**packages/db/.env**
```env
DATABASE_URL="postgresql://velozity:velozity@localhost:5432/velozity"
```

**apps/backend/.env**
```env
DATABASE_URL="postgresql://velozity:velozity@localhost:5432/velozity"
REDIS_URL="redis://localhost:6379"
JWT_ACCESS_SECRET="your-access-secret-32-chars-min"
JWT_REFRESH_SECRET="your-refresh-secret-32-chars-min"
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

**apps/web/.env**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### Installation

```bash
# Install dependencies
bun install

# Generate Prisma client
cd packages/db && bunx prisma generate

# Run migrations
bunx prisma migrate dev

# Seed database
bunx prisma db seed

# Start development servers
bun run dev
```

### Docker (Alternative)

```bash
docker-compose up -d
```

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management, all projects |
| **Project Manager** | Create/manage own projects, assign tasks, review tasks |
| **Developer** | View assigned tasks, update status, view project activity |

---

## 🔐 Authentication

- **Access Token**: 15 min expiry, JWT in Authorization header
- **Refresh Token**: 7 days expiry, HttpOnly + Secure + SameSite=Strict cookie
- **Token Rotation**: New refresh token issued on each refresh
- **Storage**: Access token in memory (Zustand), never localStorage

### API Endpoints

```
Auth:
POST   /auth/register     # Register new user (Admin only in production)
POST   /auth/login        # Login
POST   /auth/refresh      # Refresh access token
POST   /auth/logout       # Logout
GET    /auth/me           # Get current user

Users (Admin):
GET    /users             # List users
GET    /users/:id         # Get user
PATCH  /users/:id         # Update user
DELETE /users/:id         # Delete user

Clients (Admin):
GET    /clients           # List clients
POST   /clients           # Create client
GET    /clients/:id       # Get client
PATCH  /clients/:id       # Update client
DELETE /clients/:id       # Delete client

Projects:
GET    /projects          # List projects (role-filtered)
POST   /projects          # Create project (Admin/PM)
GET    /projects/:id      # Get project
PATCH  /projects/:id      # Update project (owner/Admin)
DELETE /projects/:id      # Delete project (owner/Admin)
GET    /projects/:id/stats # Get project stats

Tasks:
GET    /tasks             # List tasks (role-filtered, query params)
POST   /tasks             # Create task (PM)
GET    /tasks/my-tasks    # Get my tasks (Developer)
GET    /tasks/:id         # Get task
PATCH  /tasks/:id         # Update task
PATCH  /tasks/:taskId/status # Update task status
DELETE /tasks/:id         # Delete task

Activity:
GET    /activity          # List activity logs (role-filtered)

Notifications:
GET    /notifications     # List notifications
PATCH  /notifications/:id/read # Mark as read
PATCH  /notifications/read-all # Mark all as read

Dashboard:
GET    /dashboard         # Role-specific dashboard stats
```

---

## 📊 Features

### Core Modules
- **Users** - Admin-only CRUD with role management
- **Clients** - Admin-only client management
- **Projects** - Full CRUD with PM ownership, stats
- **Tasks** - CRUD with status transitions, priorities, assignments
- **Activity** - Role-filtered activity logs with real-time updates
- **Notifications** - In-app notifications with read/unread, bulk actions
- **Dashboard** - Role-specific statistics and insights

### Real-time (Socket.io)
- Project rooms for collaborative viewing
- Activity feed broadcasting with role filtering
- Real-time notifications
- Presence system (online/offline users)
- Missed events catch-up on reconnect (last 20 events from DB)

### Background Jobs
- Hourly overdue task detection
- Automatic activity log creation
- Real-time notification emission for overdue tasks

---

## 🧪 Testing

```bash
# Backend tests
cd apps/backend && bun test

# Frontend tests
cd apps/web && bun test
```

---

## 📦 Building

```bash
# Build all packages
bun run build

# Build specific app
bun run build --filter=web
bun run build --filter=backend
```

---

## 🚢 Deployment

### Backend (Render)
1. Connect repository to Render
2. Use `render.yaml` (Blueprint) for automatic setup with PostgreSQL + Redis
3. Or manually: Create Web Service → Docker → Dockerfile: `./apps/backend/Dockerfile`
4. Add environment variables (auto-configured via render.yaml)
5. Deploy

### Frontend (Vercel)
1. Import repository in Vercel
2. Set **Root Directory** to `apps/web`
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = your Render backend URL
   - `NEXT_PUBLIC_WS_URL` = your Render backend URL
4. Deploy

**Live Demo**: https://velozity-assignment-dashboard.vercel.app
**Backend API**: https://velozity-backend.onrender.com
**Health Check**: https://velozity-backend.onrender.com/health

### Docker Production
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 🔧 Development

### Database Commands

```bash
# Generate client
bunx prisma generate

# Run migrations
bunx prisma migrate dev

# Open Prisma Studio
bunx prisma studio

# Reset database
bunx prisma migrate reset
```

### Adding New Models

1. Edit `packages/db/prisma/schema.prisma`
2. Run `bunx prisma migrate dev --name <name>`
3. Run `bunx prisma generate`
4. Update backend modules and frontend types

---

## 📁 Key Files

- `implementation_plan.md` - Complete architecture & implementation guide
- `packages/db/prisma/schema.prisma` - Database schema
- `apps/backend/src/index.ts` - API entry point
- `apps/web/app/layout.tsx` - Frontend entry point with providers

---

## 🌱 Seed Data

The repository includes a seed script that creates:

- **1 Admin** user
- **2 Project Managers**
- **4 Developers**
- **3+ Projects** with 5+ tasks each in various statuses
- **2+ Overdue tasks** automatically flagged
- **Pre-existing activity log entries** so the feed is not empty on first load
- **Notifications** for task assignments and status changes

Run the seed:
```bash
cd packages/db && bunx prisma db seed
```

The seed file is at `packages/db/prisma/seed.ts` and uses the Prisma client to create all required data with proper relationships.

---

## 🏛️ Architectural Decisions

### Why Socket.io over native WebSocket?
- Automatic reconnection with exponential backoff
- Built-in room/namespace support for role-based filtering
- Fallback to polling if WebSocket fails
- Binary support, multiplexing, and middleware support
- Battle-tested at scale (used by Microsoft, Trello, etc.)

### Why Bull over node-cron?
- Persistent jobs survive restarts
- Built-in retry with exponential backoff
- Dashboard for monitoring (Arena/Taskforce)
- Distributed processing support
- Delayed/scheduled jobs with precision
- Job prioritization and rate limiting

### Why HttpOnly cookies for refresh tokens?
- Prevents XSS attacks (JavaScript cannot access)
- Automatic inclusion with requests
- SameSite=Strict prevents CSRF
- Secure flag ensures HTTPS-only in production
- Rotation on each refresh invalidates stolen tokens

### Why Fastify/Express over others?
- Express: Mature, massive ecosystem, excellent middleware support
- Prisma provides type-safe database access without raw SQL

### Why Prisma over raw SQL?
- Type-safe queries with autocompletion
- Automatic migration generation
- Schema visualization (Prisma Studio)
- Cross-database compatibility
- Reduces SQL injection risk

---

## 📝 API Documentation

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

### Success Response Format
```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

### Query Parameters for Filtering
All list endpoints support:
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `sortBy` (field name)
- `sortOrder` (asc/desc)
- Entity-specific filters (status, priority, projectId, etc.)

---

## ⚠️ Known Limitations

1. **WebSocket scaling**: Single Socket.io instance; needs Redis adapter for horizontal scaling
2. **No file uploads**: Attachments not implemented
3. **No email notifications**: Only in-app
4. **Basic presence**: No "last seen" timestamps, just online/offline
5. **No task comments**: Activity log only tracks status changes
6. **Single tenant**: No multi-organization support
7. **No WebSocket auth for reconnection**: Token validation only on initial connect

---

## 💡 Explanation (150-250 words)

The hardest problem I solved was implementing the **role-filtered real-time activity feed** with missed-event catch-up. The challenge was ensuring that Admin, PM, and Developer users receive different activity streams over the same WebSocket connection without client-side filtering (which would be a security vulnerability). 

My solution uses a **room-based broadcast strategy**: when a task status changes, the server computes visibility per recipient and emits to specific rooms—`project:{id}` for all viewers, `role:admin` for global feed, `role:pm:{managerId}` for PM's projects, and `user:{assigneeId}` for the developer. This ensures a Developer never receives another Developer's task activity, even if they manually subscribe to rooms.

For offline users, on socket reconnect the server queries the database for the last 20 events visible to that user's role (Admin=all, PM=their projects, Dev=assigned tasks) and emits `activity:catchup`. The client merges these deduplicated by ID. This avoids in-memory caching and works across server restarts.

One thing I'd do differently: **implement Row Level Security (RLS) in PostgreSQL** as a defense-in-depth layer. Currently, access control lives entirely in the application layer (middleware + service checks). RLS would enforce isolation at the database level, preventing any potential bugs in middleware from leaking data across roles.

---

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request