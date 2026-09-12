FROM oven/bun:canary-alpine

WORKDIR /app

COPY package.json bun.lock* turbo.json ./
COPY packages/db ./packages/db
COPY packages/typescript-config ./packages/typescript-config
COPY apps/backend ./apps/backend

RUN bun install --registry=https://registry.npmjs.org

EXPOSE 3001

CMD ["bun", "run", "dev"]