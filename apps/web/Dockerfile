FROM oven/bun:canary-alpine

WORKDIR /app

COPY package.json bun.lock* turbo.json ./
COPY packages/db ./packages/db
COPY packages/typescript-config ./packages/typescript-config
COPY packages/ui ./packages/ui
COPY packages/eslint-config ./packages/eslint-config
COPY apps/web ./apps/web

RUN bun install --registry=https://registry.npmjs.org

EXPOSE 3000

CMD ["bun", "run", "dev"]