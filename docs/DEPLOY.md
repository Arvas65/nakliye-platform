# Deploy Rehberi

Bu doküman, projeyi **production** ortamına almak için tüm adımları içerir. İki yol var:

1. **Önerilen:** Vercel (web) + Railway (api+db) — hızlı, ucuz, portfolyo dostu
2. **Alternatif:** Self-hosted VPS + Docker Compose (Hetzner/DigitalOcean)

---

## 1. Vercel + Railway

### A. Veritabanı (Railway)

1. https://railway.app → New Project
2. **+ New** → Database → **PostgreSQL**
3. Service başladıktan sonra → Variables tab → `DATABASE_URL` kopyala
4. **+ New** → Database → **Redis** → `REDIS_URL` kopyala

Postgres servisine PostGIS uzantısı eklemek için (Railway PostgreSQL bunu otomatik vermiyor olabilir; Neon kullanmak alternatif):

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

Railway'in **Postgres → Data → Query** sekmesinden çalıştırabilirsin.

> **Alternatif öneri:** Neon (https://neon.tech) — serverless Postgres, PostGIS hazır, ücretsiz katmanı daha cömert. Bağlanmak için tek tıkla `DATABASE_URL` üretiyor.

### B. API (Railway)

1. Aynı projede **+ New** → GitHub Repo → `nakliye` reposunu seç
2. Service ismini `nakliye-api` yap
3. **Settings** → **Source**:
   - Root Directory: `/`
   - Dockerfile Path: `apps/api/Dockerfile`
4. **Variables** sekmesi — şunları ekle:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   NODE_ENV=production
   API_PORT=4000
   JWT_ACCESS_SECRET=<openssl rand -base64 48>
   JWT_REFRESH_SECRET=<openssl rand -base64 48>
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   CORS_ORIGINS=https://YOUR-DOMAIN.vercel.app
   LOG_LEVEL=info
   ```
5. **Settings** → **Networking** → **Generate Domain** → `nakliye-api.up.railway.app` (veya custom domain)
6. Deploy başlayacak. İlk deploy sonrası migration'ı çalıştır:

   ```bash
   railway run --service nakliye-api pnpm --filter @nakliye/api prisma:deploy
   ```

   (CLI: `npm i -g @railway/cli && railway login && railway link`)

### C. Frontend (Vercel)

1. https://vercel.com → Add New → Project → GitHub repo
2. **Configure Project:**
   - Framework Preset: Next.js
   - Root Directory: `apps/web`
   - Build Command: `cd ../.. && pnpm --filter @nakliye/web build`
   - Install Command: `cd ../.. && pnpm install --frozen-lockfile`
3. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://nakliye-api.up.railway.app
   NEXT_PUBLIC_WS_URL=wss://nakliye-api.up.railway.app
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   NEXT_PUBLIC_SENTRY_DSN=https://...
   ```
4. Deploy

### D. Domain (Cloudflare)

1. Domain'i Cloudflare'e taşı (DNS only mode)
2. Vercel → Settings → Domains → `nakliyeplatform.com` ekle
3. Railway → Settings → Networking → Custom Domain → `api.nakliyeplatform.com`
4. Cloudflare DNS:
   - `@` → CNAME → `cname.vercel-dns.com`
   - `www` → CNAME → `cname.vercel-dns.com`
   - `api` → CNAME → `nakliye-api.up.railway.app`

### E. Monitoring

- **Sentry:** https://sentry.io → New Project (Node.js + Next.js) → `SENTRY_DSN` env'e ekle
- **BetterStack:** Uptime monitoring → `https://api.nakliyeplatform.com/health` URL'ini ekle
- **PostHog:** Product analytics

---

## 2. Self-Hosted VPS

### Gereksinimler

- Ubuntu 22.04 VPS (Hetzner CX22 ~4€/ay yeterli)
- Domain (Cloudflare ile yönetilen)

### Kurulum

```bash
# Docker
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin git

# Repo
git clone https://github.com/USERNAME/nakliye.git /opt/nakliye
cd /opt/nakliye
cp .env.example .env
nano .env  # Tüm production değerlerini doldur

# Çalıştır
docker compose -f infra/docker/docker-compose.prod.yml up -d
docker compose exec api pnpm --filter @nakliye/api prisma:deploy
```

Nginx reverse proxy + Let's Encrypt SSL için `infra/nginx/nginx.conf` referansı hazır.

---

## 3. GitHub Actions Secrets

Auto-deploy için reponun **Settings → Secrets → Actions** sekmesinde:

| Secret              | Açıklama                             |
| ------------------- | ------------------------------------ |
| `RAILWAY_TOKEN`     | Railway → Account → Tokens           |
| `VERCEL_TOKEN`      | Vercel → Account → Tokens            |
| `DATABASE_URL`      | Production DB URL (migrate job için) |
| `SENTRY_AUTH_TOKEN` | Sentry source map upload için        |

---

## 4. Production Sonrası Kontrol Listesi

- [ ] `/health` endpoint 200 dönüyor
- [ ] Swagger docs prod'da disable (`NODE_ENV=production`)
- [ ] CORS sadece prod domain'e açık
- [ ] JWT secret'lar 32+ karakter, rastgele üretilmiş
- [ ] Stripe webhook'u prod URL'e yönlendirilmiş
- [ ] Sentry alarmları kurulu
- [ ] BetterStack uptime monitoring aktif
- [ ] KVKK metni + cookie consent eklenmiş
- [ ] robots.txt + sitemap.xml mevcut
- [ ] favicon + og:image set
- [ ] Database otomatik yedek aktif (Railway/Neon bunu otomatik yapar)
