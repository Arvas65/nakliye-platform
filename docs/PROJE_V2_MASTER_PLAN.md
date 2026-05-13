# Nakliye Platformu V2 — Master Plan

> Sürüm: 2.0 | Tarih: 2026-05-11 | Hedef: 9.8/10 portfolyo-kalitesinde, yayınlanabilir SaaS

---

## 1. Vizyon

Yük sahipleri ile profesyonel nakliyecileri buluşturan, güvenli ödeme (Escrow), gerçek zamanlı GPS takibi ve AI destekli fiyat önerisi sunan **çift taraflı bir pazaryeri (two-sided marketplace)**. Hedef: Türkiye lojistik sektöründe "Uber for Cargo" konumlanması.

## 2. Neden V2? V1'de Ne Vardı?

V1 (legacy/) başarılı bir MVP idi ama şu sorunlar nedeniyle yayınlanamadı:

- SQLite üretim için yetersiz; göç planı yoktu
- Manus.space deploy'u öldü, taşınabilirlik (Docker) yoktu
- Environment yönetimi sızıyordu (.env yok)
- Gerçek zamanlılık (chat, takip) yok
- Ödeme, KYC, KVKK uyumluluğu yok
- CI/CD pipeline yok
- Test kapsamı yok
- Frontend pages büyük ölçüde boş placeholder

V2, bu eksikleri **mimari seviyede** giderir.

## 3. Teknoloji Yığını (Tam Liste)

### Monorepo & Tooling

| Alan                   | Seçim                          |
| ---------------------- | ------------------------------ |
| Paket yöneticisi       | pnpm 9                         |
| Workspace orkestrasyon | Turborepo                      |
| Tip sistemi            | TypeScript 5.4+ (strict)       |
| Linting                | ESLint + Prettier + commitlint |
| Git hooks              | Husky + lint-staged            |

### Backend (`apps/api`)

| Alan            | Seçim                                      |
| --------------- | ------------------------------------------ |
| Framework       | NestJS 10                                  |
| Runtime         | Node.js 20 LTS                             |
| ORM             | Prisma 5                                   |
| Veritabanı      | PostgreSQL 16                              |
| Cache / Pub-Sub | Redis 7                                    |
| Queue           | BullMQ                                     |
| Real-time       | Socket.IO                                  |
| Auth            | JWT (RS256) + Refresh tokens + Passport.js |
| Validation      | class-validator + Zod (paylaşılan tipler)  |
| Password hash   | Argon2id                                   |
| Logging         | Pino + pino-http (structured JSON)         |
| API Docs        | Swagger / OpenAPI 3                        |
| Testing         | Vitest + Supertest                         |
| Observability   | OpenTelemetry + Sentry                     |

### Frontend (`apps/web`)

| Alan              | Seçim                                |
| ----------------- | ------------------------------------ |
| Framework         | Next.js 14 (App Router)              |
| Styling           | Tailwind CSS 3.4                     |
| UI Kit            | shadcn/ui + Radix primitives         |
| Forms             | React Hook Form + Zod resolver       |
| Server state      | TanStack Query v5                    |
| Client state      | Zustand                              |
| HTTP istemci      | Axios (interceptor ile auto-refresh) |
| Real-time istemci | socket.io-client                     |
| Harita            | Mapbox GL JS + react-map-gl          |
| Tablo             | TanStack Table                       |
| Tarih             | date-fns + tr locale                 |
| i18n              | next-intl                            |
| Bildirim toast    | Sonner                               |
| Testing           | Vitest + Playwright (E2E)            |

### Ödeme & 3rd-party

| Alan           | Seçim                                 |
| -------------- | ------------------------------------- |
| Ödeme geçidi   | Stripe Connect (Marketplace + Escrow) |
| KYC            | Sumsub (veya iyzico Bireysel KYC)     |
| Email          | Resend                                |
| SMS / OTP      | Twilio veya Netgsm                    |
| Dosya depolama | Cloudflare R2 (S3 SDK ile)            |
| Push           | Firebase Cloud Messaging              |

### DevOps & Infra

| Alan              | Seçim                                      |
| ----------------- | ------------------------------------------ |
| Konteynerleme     | Docker + Docker Compose                    |
| CI/CD             | GitHub Actions                             |
| Frontend deploy   | Vercel                                     |
| Backend deploy    | Railway (alternatif: Fly.io)               |
| Veritabanı (prod) | Neon (serverless PG) — alternatif Supabase |
| Redis (prod)      | Upstash Redis                              |
| Secrets           | Doppler veya Railway env vars              |
| Domain & DNS      | Cloudflare                                 |
| Hata izleme       | Sentry                                     |
| Uptime            | BetterStack                                |
| Analytics         | PostHog (self-host imkanı)                 |

## 4. Klasör Yapısı

```
nakliye/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/        # auth, users, cargo, offers, chat, payments...
│   │   │   ├── common/         # filters, guards, interceptors, decorators
│   │   │   ├── config/         # env, db, redis config
│   │   │   ├── prisma/         # PrismaModule, service
│   │   │   └── main.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── test/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── web/                    # Next.js frontend
│       ├── src/
│       │   ├── app/            # App Router pages
│       │   ├── components/
│       │   ├── lib/            # api client, utils
│       │   ├── hooks/
│       │   ├── stores/         # Zustand
│       │   └── types/
│       ├── Dockerfile
│       └── package.json
├── packages/
│   ├── types/                  # Paylaşılan TypeScript tipleri + Zod şemaları
│   ├── config/                 # Shared ESLint, TS, Tailwind configs
│   └── ui/                     # Paylaşılan React komponentleri (ileride)
├── infra/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   └── docker-compose.prod.yml
│   └── nginx/
├── .github/
│   └── workflows/              # ci.yml, deploy-api.yml, deploy-web.yml
├── docs/                       # Mimari, ADR, runbook
├── scripts/                    # Yardımcı scriptler
├── legacy/                     # V1 koleksiyonu (referans)
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── .gitignore
└── README.md
```

## 5. 25 Faz Yol Haritası (V2 Uyarlanmış)

### Bölüm A — Temel ve Modernizasyon (Hafta 1-3)

| Faz | Başlık                          | Süre  | Çıktı                                 |
| --- | ------------------------------- | ----- | ------------------------------------- |
| 0   | Monorepo & Docker bootstrap     | 1 gün | pnpm + turbo + docker-compose çalışır |
| 1   | Prisma + PostgreSQL şema        | 2 gün | Tüm modeller, migration, seed         |
| 2   | NestJS iskelet + Swagger + log  | 2 gün | /health, /docs erişilebilir           |
| 3   | Auth: JWT + Refresh + Argon2    | 3 gün | Register, login, refresh, me          |
| 4   | Frontend iskelet + auth UI      | 3 gün | Login, register, korunan sayfalar     |
| 5   | API versioning + OpenAPI client | 2 gün | /api/v1, otomatik tip üretimi         |

### Bölüm B — Çekirdek Pazaryeri (Hafta 4-6)

| Faz | Başlık                            | Süre  | Çıktı                            |
| --- | --------------------------------- | ----- | -------------------------------- |
| 6   | Cargo CRUD + filtreleme           | 3 gün | İlan oluşturma, listeleme, arama |
| 7   | Offer (teklif) modülü             | 3 gün | Teklif ver/kabul/red workflow    |
| 8   | Akıllı eşleştirme algoritması v1  | 3 gün | Mesafe + araç tipi skoru         |
| 9   | Dinamik fiyat önerisi (heuristic) | 2 gün | Mesafe x yakıt x talep           |
| 10  | Doküman yönetimi (R2 upload)      | 3 gün | İlana belge ekle, OCR-ready      |

### Bölüm C — Gerçek Zamanlı & İletişim (Hafta 7-8)

| Faz | Başlık                         | Süre  | Çıktı                      |
| --- | ------------------------------ | ----- | -------------------------- |
| 11  | Socket.IO chat (1-1, room)     | 3 gün | Gerçek zamanlı mesajlaşma  |
| 12  | Canlı konum takibi (GPS)       | 4 gün | Nakliyeci konum → harita   |
| 13  | Push + email + in-app bildirim | 3 gün | Multi-channel notification |
| 14  | Rota optimizasyonu (Mapbox)    | 3 gün | Çoklu durak rotalama       |
| 15  | Chat'te medya paylaşımı        | 2 gün | Görsel/PDF/konum mesajları |

### Bölüm D — Güven, Finans, Hukuk (Hafta 9-11)

| Faz | Başlık                      | Süre  | Çıktı                                    |
| --- | --------------------------- | ----- | ---------------------------------------- |
| 16  | Stripe Connect entegrasyonu | 3 gün | Onboarding nakliyeciler                  |
| 17  | Escrow ödeme akışı          | 4 gün | Hold → release → dispute                 |
| 18  | KYC entegrasyonu (Sumsub)   | 3 gün | Kimlik doğrulama                         |
| 19  | Puanlama & yorum sistemi    | 3 gün | İş sonu rating, ortalama skor            |
| 20  | KVKK/GDPR uyumluluğu        | 2 gün | Data export, hesap silme, cookie consent |

### Bölüm E — Zeka, Ölçek, Lansman (Hafta 12-14)

| Faz | Başlık                       | Süre  | Çıktı                            |
| --- | ---------------------------- | ----- | -------------------------------- |
| 21  | AI: önerilen fiyat (ML)      | 5 gün | OpenAI/Lokal model + geçmiş veri |
| 22  | Redis cache + read replica   | 3 gün | Sık endpoint'ler cache'li        |
| 23  | Admin paneli (Retool-style)  | 4 gün | Moderasyon, kullanıcı yönetimi   |
| 24  | Güvenlik denetimi + pen-test | 3 gün | OWASP Top 10 raporu              |
| 25  | CI/CD + Lansman              | 2 gün | Prod deploy, monitoring aktif    |

**Toplam tahmini süre:** 13-14 hafta full-time, part-time 5-7 ay.

## 6. Domain Modeli (Yüksek Seviye)

```
User (yük sahibi | nakliyeci | admin)
 ├─ Profile (KYC, şirket, sürücü belgesi)
 ├─ Vehicle[]              (nakliyeci için)
 ├─ CargoPost[]            (yük sahibi yarattı)
 ├─ Offer[]                (nakliyeci yarattı)
 ├─ Conversation[]
 ├─ Review[]               (verilen + alınan)
 └─ Payment[]

CargoPost
 ├─ pickupLocation, dropoffLocation (PostGIS POINT)
 ├─ cargoType, weight, volume, vehicleTypeRequired
 ├─ budget, suggestedPrice
 ├─ status (open|matched|in_transit|delivered|cancelled)
 ├─ Offer[]
 └─ Shipment? (1-1 kabul edilen teklif sonrası)

Offer
 ├─ cargoPostId, transporterId
 ├─ amount, message, etaPickup, etaDelivery
 └─ status (pending|accepted|rejected|withdrawn)

Shipment
 ├─ cargoPostId, transporterId
 ├─ status, tracking[] (timestamped GPS)
 ├─ Payment (escrow)
 └─ documents[] (CMR, fatura, foto)

Conversation / Message
 ├─ participants[]
 └─ messages (text|image|location|file)

Payment
 ├─ stripePaymentIntentId
 ├─ amount, currency, status
 └─ escrowReleasedAt?

Review
 ├─ raterId, rateeId, shipmentId
 ├─ rating (1-5), comment
 └─ tags[] (zamanında, nazik, temiz...)
```

## 7. Yayın Stratejisi

1. **Geliştirme** — local Docker Compose, hot reload
2. **Staging** — Vercel Preview (FE) + Railway staging env (BE) — her PR otomatik deploy
3. **Production** — main branch'e merge tetikler:
   - FE → Vercel Production
   - BE → Railway Production
   - DB migrations → otomatik `prisma migrate deploy`
4. **Monitoring** — Sentry (errors), BetterStack (uptime), PostHog (analytics)
5. **Domain** — `nakliyeplatform.com` veya benzeri, Cloudflare DNS

## 8. Portfolyo Vurguları

İş görüşmelerinde projeyi anlatırken öne çıkacak başlıklar:

- ✅ Tamamen tip-güvenli, end-to-end TypeScript monorepo
- ✅ Üretim seviyesinde auth (JWT + Refresh + Argon2 + RBAC)
- ✅ Real-time özellikler (Socket.IO, GPS takibi, chat)
- ✅ Marketplace ödeme (Stripe Connect + Escrow)
- ✅ Multi-tenant data modeli, PostGIS coğrafi sorgular
- ✅ Test (unit + integration + E2E)
- ✅ Container'lı CI/CD pipeline
- ✅ Observability (Sentry, structured logs, OpenTelemetry)
- ✅ Performans (Redis cache, read replica-ready)
- ✅ Güvenlik (OWASP, rate limit, helmet, CORS, audit log)
- ✅ KVKK/GDPR uyumluluğu
- ✅ Architecture Decision Records (ADR)

## 9. Sonraki Adımlar (Bu Oturum)

Şimdi sırayla şunları kuracağız:

1. Monorepo iskeleti (`package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`)
2. Docker Compose dev ortamı (Postgres + Redis + pgAdmin)
3. Prisma schema (tüm modeller)
4. NestJS backend iskeleti
5. Next.js frontend iskeleti
6. CI/CD workflow

Bunlar tamamlandığında **Faz 0** tamamlanmış olur ve gerçek özellik geliştirmeye (Faz 1+) başlayabiliriz.
