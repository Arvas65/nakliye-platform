# Nakliye Platformu V2

> Modern, ölçeklenebilir, portfolyo-kalitesinde lojistik pazaryeri.
> Yük sahipleri ↔ Nakliyeci eşleştirme + Escrow ödeme + Canlı GPS + AI fiyat önerisi.

[![CI](https://github.com/USERNAME/nakliye/actions/workflows/ci.yml/badge.svg)](https://github.com/USERNAME/nakliye/actions/workflows/ci.yml)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-20%20LTS-green)

## 🚀 Demo

- **Web:** https://nakliye-platform.vercel.app _(deploy sonrası)_
- **API:** https://nakliye-api.up.railway.app/api/v1 _(deploy sonrası)_
- **Swagger:** https://nakliye-api.up.railway.app/api/docs

### Test hesapları (seed sonrası)

| Rol        | Email                 | Şifre       |
| ---------- | --------------------- | ----------- |
| Admin      | admin@nakliye.local   | Admin123!   |
| Yük Sahibi | owner@nakliye.local   | Owner123!   |
| Nakliyeci  | carrier@nakliye.local | Carrier123! |

## 🏗️ Teknoloji Yığını

**Monorepo** — pnpm workspaces + Turborepo + TypeScript 5

**Backend** (`apps/api`)

- NestJS 10, Prisma 5, PostgreSQL 16 + PostGIS
- Argon2id şifre hash + JWT (RS-ready) + Refresh token rotation
- Socket.IO ile real-time chat & GPS
- BullMQ + Redis ile job queue
- Pino structured logging, Sentry, OpenAPI/Swagger

**Frontend** (`apps/web`)

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui + Radix primitives
- TanStack Query (server state) + Zustand (client state)
- React Hook Form + Zod validation
- Mapbox GL JS, socket.io-client, Sonner toast

**DevOps**

- Docker + Docker Compose
- GitHub Actions CI/CD
- Vercel (web) + Railway (api+db) deploy
- Sentry + BetterStack + PostHog

## 📁 Klasör Yapısı

```
nakliye/
├── apps/
│   ├── api/                # NestJS backend
│   └── web/                # Next.js frontend
├── packages/
│   ├── types/              # Paylaşılan TS tipleri / Zod şemaları
│   ├── config/             # Shared ESLint / Tailwind
│   └── ui/                 # Paylaşılan komponentler (gelecek)
├── infra/
│   └── docker/             # docker-compose dev & prod
├── .github/workflows/      # ci.yml, deploy.yml
├── docs/                   # PROJE_V2_MASTER_PLAN.md ve ADR'ler
├── scripts/                # Yardımcı scriptler
└── legacy/                 # V1 referans kodu
```

## ⚡ Hızlı Başlangıç

### Gereksinimler

- Node.js 20 LTS
- pnpm 9
- Docker + Docker Compose

### Adım 1 — Repo'yu klonla ve bağımlılıkları yükle

```bash
git clone https://github.com/USERNAME/nakliye.git
cd nakliye
pnpm install
```

### Adım 2 — Environment variables

```bash
cp .env.example .env
# .env içindeki değerleri kendi makinende uygun şekilde düzenle
```

### Adım 3 — Veritabanı + Redis'i Docker ile aç

```bash
pnpm db:up           # PostgreSQL + Redis + pgAdmin + Mailhog
pnpm db:migrate      # Migration'ları çalıştır
pnpm db:seed         # Test verilerini yükle
```

### Adım 4 — Geliştirme sunucularını başlat

```bash
pnpm dev             # API + Web aynı anda (Turbo)
```

- API: http://localhost:4000
- Swagger: http://localhost:4000/api/docs
- Web: http://localhost:3000
- pgAdmin: http://localhost:5050 (admin@nakliye.local / admin)
- Mailhog: http://localhost:8025

## 🧪 Test

```bash
pnpm test                    # Tüm testler (unit)
pnpm --filter @nakliye/api test         # Sadece API
pnpm --filter @nakliye/web test:e2e     # Playwright E2E
```

## 🚢 Yayına Alma (Deploy)

Önerilen yol — **Vercel + Railway** (portfolyo için ücretsiz/ucuz):

### Frontend → Vercel

1. https://vercel.com → New Project → GitHub repo
2. Root Directory: `apps/web`
3. Build command: `cd ../.. && pnpm --filter @nakliye/web build`
4. Output Directory: `apps/web/.next`
5. Environment Variables: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_MAPBOX_TOKEN`

### Backend → Railway

1. https://railway.app → New Project → Deploy from GitHub
2. Add service: **PostgreSQL** + **Redis**
3. Add service: **API**
   - Root: `/`
   - Dockerfile: `apps/api/Dockerfile`
   - Variables: tüm `.env` değerleri (Railway'in `${{Postgres.DATABASE_URL}}` referansını kullan)
4. Deploy → ilk deploy sonrası `prisma migrate deploy` çalıştır.

### Self-host alternatifi (VPS)

```bash
docker compose -f infra/docker/docker-compose.prod.yml up -d
```

Detay için bkz: `docs/DEPLOY.md`

## 📚 Yol Haritası

25 fazlık tam yol haritası: `docs/PROJE_V2_MASTER_PLAN.md`

**Mevcut durum (Phase 0-1):**

- [x] Monorepo + Docker bootstrap
- [x] Prisma schema (tüm domain modelleri)
- [x] NestJS backend iskeleti
- [x] Auth modülü (Register/Login/Refresh/Logout)
- [x] Cargo CRUD modülü
- [x] Offers modülü (kabul/red/withdraw)
- [x] Chat modülü (REST + Socket.IO gateway)
- [x] Notifications modülü
- [x] Next.js frontend (Home + Login + Register + Dashboard)
- [x] Docker + CI/CD workflow

**Sıradaki (Phase 2-5):**

- [ ] Vehicle yönetimi (nakliyeci araç ekleme)
- [ ] Cargo arama + harita üzerinde gösterim
- [ ] Akıllı eşleştirme algoritması
- [ ] Cloudflare R2 dosya upload
- [ ] WebSocket bildirim entegrasyonu
- [ ] Stripe Connect Escrow

## 🤝 Geliştirme Disiplini

- **Commit:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)
- **Branch:** `feat/cargo-search`, `fix/auth-refresh`
- **PR:** Açıklama + test + ekran görüntüsü
- **Pre-commit:** husky + lint-staged otomatik formatlar

## 📄 Lisans

MIT
