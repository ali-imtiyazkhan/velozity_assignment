# Velozity - Client Project Dashboard

A modern, full-stack project management dashboard with real-time collaboration, role-based access control, and background job processing.

## 🏗️ Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js + Express + TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **Real-time** | Socket.io |
| **Background Jobs** | Bull + Redis |
| **Auth** | JWT (access + refresh) + HttpOnly cookies |
| **Validation** | Zod |
| **Frontend** | React 18 + TypeScript + Vite + TanStack Query + Zustand |

### Project Structure

```
velozity/
├── apps/
│   ├── backend/          # Express API server
│   └── web/              # React frontend
├── packages/
│   ├── db/               # Prisma schema & client
│   ├── ui/               # Shared UI components
│   ├── eslint-config/    # ESLint configurations
│   └── typescript-config/ # TypeScript configurations
└── implementation_plan.md # Detailed implementation guide
```

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
FRONTEND_URL="http://localhost:5173"
```

**apps/web/.env**
```env
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
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

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management, all projects |
| **Project Manager** | Create/manage own projects, assign tasks, review tasks |
| **Developer** | View assigned tasks, update status, view project activity |

## 🔐 Authentication

- **Access Token**: 15 min expiry, JWT in Authorization header
- **Refresh Token**: 7 days expiry, HttpOnly + Secure + SameSite=Strict cookie
- **Token Rotation**: New refresh token issued on each refresh

### API Endpoints

```
POST   /auth/register     # Register new user
POST   /auth/login        # Login
POST   /auth/refresh      # Refresh access token
POST   /auth/logout       # Logout
GET    /auth/me           # Get current user
```

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
- Missed events catch-up on reconnect

### Background Jobs
- Hourly overdue task detection
- Automatic activity log creation
- Real-time notification emission for overdue tasks

## 🧪 Testing

```bash
# Backend tests
cd apps/backend && bun test

# Frontend tests
cd apps/web && bun test
```

## 📦 Building

```bash
# Build all packages
bun run build

# Build specific app
bun run build --filter=web
bun run build --filter=backend
```

## 🚢 Deployment

### Backend (Railway/Render)
1. Set environment variables
2. Connect PostgreSQL and Redis
3. Run `bun run build && bun run start`

### Frontend (Vercel)
1. Connect repository
2. Set `VITE_API_URL` and `VITE_SOCKET_URL`
3. Deploy

## 📁 Key Files

- `implementation_plan.md` - Complete architecture & implementation guide
- `packages/db/prisma/schema.prisma` - Database schema
- `apps/backend/src/index.ts` - API entry point
- `apps/web/src/main.tsx` - Frontend entry point

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

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request