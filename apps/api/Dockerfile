# =====================================================
# Nakliye API — multi-stage Dockerfile
# =====================================================

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable
WORKDIR /app

# ---- Dependencies (full install for build) ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
ENV CI=1
ENV HUSKY=0
RUN pnpm install --frozen-lockfile

# ---- Build (TS → JS, prisma generate) ----
FROM base AS build
ENV CI=1
ENV HUSKY=0
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY . .
# Prisma generate (schema bilgisi gerek, DATABASE_URL gerek yok)
RUN cd apps/api && npx prisma generate --schema=./prisma/schema.prisma
# TS → JS compile
RUN pnpm --filter @nakliye/api build

# ---- Production runner ----
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl tini
RUN corepack enable
WORKDIR /app

ENV NODE_ENV=production
ENV CI=1
ENV HUSKY=0

# Production deps only (prisma dependency olarak yüklü)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile --prod --filter @nakliye/api

# Build artefacts + prisma schema
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma

# Prisma Client'ı runner'ın kendi node_modules'ına generate et.
# pnpm'in symlink-based layout'u build stage'den COPY edilemez (Railway gözlemledi).
# Schema burada mevcut, prisma CLI prod dep olduğu için yüklendi → generate sorunsuz.
RUN cd apps/api && npx prisma generate --schema=./prisma/schema.prisma

EXPOSE 4000
USER node

ENTRYPOINT ["/sbin/tini", "--"]
# Migration + app start (idempotent — tablo varsa atlanır)
CMD ["sh", "-c", "cd apps/api && pnpm start:prod"]
