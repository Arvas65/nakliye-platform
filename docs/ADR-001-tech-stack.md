# ADR-001: Teknoloji Yığını Seçimi

**Durum:** Kabul edildi
**Tarih:** 2026-05-11
**Karar veren:** ihsan + Claude

## Bağlam

Nakliye Platformu V1'in Flask + React stack'i ile devam etmek mi, yoksa modern bir stack'e geçmek mi?

- V1 yayınlanamadı (deploy ölü, Docker yok, real-time özellikler eksik)
- Hedef: Portfolyo kalitesinde, ticari potansiyeli yüksek bir ürün
- ihsan DevOps'a yeni — kolay deploy edilebilir, yaygın bir stack şart

## Kabul edilen karar

**Tertemiz yeniden yaz** + modern TypeScript-tabanlı monorepo:

- **Backend:** NestJS + Prisma + PostgreSQL
- **Frontend:** Next.js 14 (App Router) + Tailwind + shadcn/ui
- **Real-time:** Socket.IO
- **DevOps:** Docker + GitHub Actions + Vercel (web) + Railway (api+db)

## Gerekçeler

### Neden NestJS yerine FastAPI/Flask değil?

- TypeScript-end-to-end → frontend ile aynı dil, tip paylaşımı
- DI, decorator, modüler mimari → kurumsal kod kalitesi
- Resmi Swagger entegrasyonu, validation pipe
- Görüşmelerde popüler ve gözde

### Neden Prisma yerine TypeORM değil?

- Tip güvenliği çok daha iyi
- Migration sistemi standart
- Studio aracı production debug için harika
- Aktif geliştirme, daha modern

### Neden Next.js 14 (App Router)?

- React 18 server components
- SEO için SSR/SSG ihtiyacı (kamuya açık ilan sayfaları)
- Vercel ile sıfır-config deploy
- App Router 2026'da artık stable ve mainstream

### Neden Vercel + Railway?

- Vercel: Next.js için tasarlanmış, ücretsiz katman cömert
- Railway: Docker + Postgres + Redis tek panelden, ücretsiz katman $5/ay
- Toplam: $0-15/ay, portfolyo için ideal
- Self-host opsiyonu Docker Compose ile elimde

## Karşıt seçenekler ve neden reddedildi

- **Go (Fiber/Gin):** Performans muazzam, ama portfolyo için TS daha "modaya uygun" — Go'yu sonradan microservice olarak ekleyebiliriz
- **Supabase:** Hızlı başlangıç ama özelleştirme sınırlı, vendor lock-in yüksek
- **AWS ECS:** Çok güçlü ama kurulumu ihsan'ı bunaltır + maliyet öngörülemez
- **MongoDB:** İlişkisel veri (User ↔ Cargo ↔ Offer ↔ Shipment ↔ Payment) zorunluluk gibi → SQL şart

## Sonuç ve takip

Stack 25 fazlık yol haritasının tamamını taşıyacak güçte. AI özellikleri için ileride Python microservice eklenebilir (FastAPI), ana API'yi etkilemez.
