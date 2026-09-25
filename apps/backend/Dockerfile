FROM oven/bun:canary-alpine

WORKDIR /app

# Copy root workspace files
COPY package.json bun.lock* turbo.json ./

# Copy shared packages
COPY packages/db ./packages/db
COPY packages/typescript-config ./packages/typescript-config

# Copy backend app
COPY apps/backend ./apps/backend

# Install dependencies
RUN bun install --registry=https://registry.npmjs.org

# Generate Prisma client
RUN cd packages/db && bunx prisma generate

EXPOSE 3001

# Run migrations and start the server in production
CMD sh -c "cd packages/db && bunx prisma db push && cd /app && bun run apps/backend/src/index.ts"