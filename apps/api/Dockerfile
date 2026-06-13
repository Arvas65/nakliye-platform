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
# CI=1 → prepare script husky'yi atlayıp sessizce geçer
ENV CI=1
RUN pnpm install --frozen-lockfile

# ---- Build (TS → JS, prisma generate) ----
FROM base AS build
ENV CI=1
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY . .
# prisma generate — DATABASE_URL gerektirmez, sadece schema'yı okur
RUN cd apps/api && npx prisma generate --schema=./prisma/schema.prisma
RUN pnpm --filter @nakliye/api build

# ---- Production runner ----
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl tini
RUN corepack enable
WORKDIR /app

ENV NODE_ENV=production
ENV CI=1

# Production deps only (prisma artık prod dep, install ediyor)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile --prod --filter @nakliye/api

# Build artefactları + prisma schema + generated client
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 4000
USER node

ENTRYPOINT ["/sbin/tini", "--"]
# Migration'ı çalıştır, sonra app'i başlat.
# Her deploy'da idempotent: tablo varsa atlanır, yoksa oluşturulur.
CMD ["sh", "-c", "cd apps/api && pnpm start:prod"]
