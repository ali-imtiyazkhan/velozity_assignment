# Deployment Guide

## Backend on Render

### Prerequisites
- Render account
- GitHub repository connected

### Setup

1. **Connect Repository**: In Render dashboard, create a new "Web Service" and connect your GitHub repo.

2. **Configure Service**:
   - Use the `render.yaml` file for automatic configuration (Blueprint)
   - Or manually configure:
     - **Runtime**: Docker
     - **Dockerfile Path**: `./apps/backend/Dockerfile`
     - **Docker Context**: `.` (root of repo)

3. **Environment Variables** (auto-configured via render.yaml):
   - `NODE_ENV=production`
   - `PORT=3001`
   - `FRONTEND_URL=https://your-frontend.vercel.app`
   - `DATABASE_URL` (from Render PostgreSQL)
   - `REDIS_URL` (from Render Redis)
   - `JWT_ACCESS_SECRET` (auto-generated)
   - `JWT_REFRESH_SECRET` (auto-generated)

4. **Add PostgreSQL Database**: Create a free PostgreSQL database in Render and link it.

5. **Add Redis**: Create a free Redis instance in Render and link it.

6. **Deploy**: Render will build and deploy automatically.

### Manual Environment Variables
If not using render.yaml, set these in Render dashboard:
```
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend.vercel.app
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_ACCESS_SECRET=your-secret
JWT_REFRESH_SECRET=your-secret
```

## Frontend on Vercel

### Prerequisites
- Vercel account
- GitHub repository connected

### Setup

1. **Import Project**: In Vercel dashboard, import your GitHub repo.

2. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `bun run build`
   - **Install Command**: `bun install`
   - **Output Directory**: `.next` (default)

3. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   NEXT_PUBLIC_WS_URL=https://your-backend.onrender.com
   ```

4. **Deploy**: Vercel will build and deploy automatically.

### Custom Domain (Optional)
Add your custom domain in Vercel project settings.

## Local Development

```bash
# Install dependencies
bun install

# Start all services (requires Docker)
docker-compose up -d

# Run database migrations
cd packages/db && bunx prisma migrate dev

# Start development servers
bun run dev
```

## Environment Variables Reference

### Backend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | No (default: 3001) |
| NODE_ENV | Environment | No (default: development) |
| FRONTEND_URL | Frontend URL for CORS | Yes |
| DATABASE_URL | PostgreSQL connection string | Yes |
| REDIS_URL | Redis connection string | Yes |
| JWT_ACCESS_SECRET | JWT access token secret | Yes |
| JWT_REFRESH_SECRET | JWT refresh token secret | Yes |

### Frontend (.env.local)
| Variable | Description | Required |
|----------|-------------|----------|
| NEXT_PUBLIC_API_URL | Backend API URL | Yes |
| NEXT_PUBLIC_WS_URL | Backend WebSocket URL | Yes |

## Post-Deployment

1. Run database migrations on Render:
   - Connect to Render shell
   - Run: `cd apps/backend && bunx prisma migrate deploy`

2. Update `FRONTEND_URL` in Render backend service to match your actual Vercel URL.

3. Update `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` in Vercel to match your actual Render backend URL.

4. Test the deployment:
   - Backend health: `https://your-backend.onrender.com/health`
   - Frontend: `https://your-frontend.vercel.app`