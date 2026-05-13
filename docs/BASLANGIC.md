# 🚀 Başlangıç Rehberi — İlk Çalıştırma (ihsan için)

Bu rehber, kodu **sıfırdan** çalıştırmak için adım adım takip edebileceğin bir liste. Her adımın altında ne göreceğin yazılı — bir şey ters giderse hangi noktada olduğunu anlayabilirsin.

> ⏱️ Toplam süre: ~30-45 dakika (Docker indirme dahil)

---

## 0. Gereksinimleri yükle (bir kez)

Aşağıdakileri kurmadıysan, sırayla kur:

### 0.1 Node.js 20 LTS

- https://nodejs.org/ → **20 LTS** sürümünü indir, kurulumu yap
- Kontrol et:
  ```powershell
  node --version    # v20.x görmen lazım
  npm --version
  ```

### 0.2 pnpm

PowerShell'de:

```powershell
npm install -g pnpm@9
pnpm --version    # 9.x olmalı
```

### 0.3 Docker Desktop

- https://www.docker.com/products/docker-desktop/ → **Windows** için indir
- Kurulumdan sonra Docker Desktop'u **başlat** (system tray'de balina ikonu yeşil olmalı)
- Kontrol et:
  ```powershell
  docker --version
  docker compose version
  ```

### 0.4 Git

Çoğu Windows'ta zaten var; yoksa: https://git-scm.com/

```powershell
git --version
```

### 0.5 (Opsiyonel) VS Code

- https://code.visualstudio.com/
- Önerilen eklentiler: **Prisma**, **Tailwind CSS IntelliSense**, **ESLint**, **Prettier**

---

## 1. Projeye git ve bağımlılıkları yükle

```powershell
cd C:\Users\Arvas\Documents\Nakliye
pnpm install
```

**Ne göreceksin:**

- ~1000+ paketin yüklendiğini gösteren progress bar
- Sonunda `Done in 30-60s` mesajı
- `node_modules` ve `pnpm-lock.yaml` dosyaları oluştu

**Hata çıkarsa:** Genelde Node sürümü problemi olur. `node --version` kontrol et — 20.x değilse 0.1'i tekrar yap.

---

## 2. Ortam değişkenleri (.env)

```powershell
copy .env.example .env
```

`.env` dosyasını VS Code'da aç. **İlk kurulum için sadece şu üçü** dolu olsun yeterli:

- `DATABASE_URL` (zaten dolu — Docker compose ile uyumlu)
- `REDIS_URL` (zaten dolu)
- `JWT_ACCESS_SECRET` + `JWT_REFRESH_SECRET` (zaten dolu — dev için)

Diğerlerini (Stripe, Mapbox, Sentry) **boş bırakabilirsin** — onları ileride lazım olduğunda dolduracağız.

---

## 3. Veritabanı + Redis'i Docker ile aç

```powershell
pnpm db:up
```

**Ne göreceksin:**

- 4 Docker imajının indiğini (postgres, redis, pgadmin, mailhog)
- 4 container'ın `Started` durumuna geçtiğini

**Kontrol:**

```powershell
docker ps
```

4 container görmelisin: nakliye-postgres, nakliye-redis, nakliye-pgadmin, nakliye-mailhog.

**Eğer "port already in use" hatası alırsan:** Başka bir Postgres çalışıyor. Onu durdur veya `infra/docker/docker-compose.yml` içindeki `5432:5432`'yi `5433:5432` yap ve `.env`'de `DATABASE_URL`'i `5433`'e çevir.

---

## 4. Prisma client'ı üret ve migration'ı çalıştır

```powershell
pnpm --filter @nakliye/api prisma:generate
pnpm --filter @nakliye/api prisma:migrate -- --name init
```

**Ne göreceksin:**

- Prisma engine binary'sinin indiğini
- `apps/api/prisma/migrations/<timestamp>_init/` klasörünün oluştuğunu
- `Database is now in sync` mesajını

---

## 5. Test verilerini yükle

```powershell
pnpm db:seed
```

**Ne göreceksin:**

```
✅ Seed tamamlandı.
   Admin:    admin@nakliye.local    / Admin123!
   Owner:    owner@nakliye.local    / Owner123!
   Carrier:  carrier@nakliye.local  / Carrier123!
```

---

## 6. Backend ve frontend'i çalıştır

```powershell
pnpm dev
```

**Ne göreceksin** (iki tab açılacak Turbo tarafından):

```
@nakliye/api:dev:  🚀 Nakliye API çalışıyor: http://localhost:4000
@nakliye/api:dev:  📘 Swagger docs:        http://localhost:4000/api/docs
@nakliye/web:dev:  ▲ Next.js 14.2.13
@nakliye/web:dev:  - Local:   http://localhost:3000
```

---

## 7. Doğrulama — Çalıştığını gör! 🎉

### 7.1 Backend canlı mı?

Tarayıcıda aç:

- http://localhost:4000/health → `{"status":"ok","db":"up"}` görmeli
- http://localhost:4000/api/docs → Swagger UI

### 7.2 Frontend açılıyor mu?

Tarayıcıda aç:

- http://localhost:3000 → Ana sayfa (hero, "Hemen Başla")

### 7.3 Login akışı çalışıyor mu?

1. http://localhost:3000/login
2. Email: `owner@nakliye.local` Şifre: `Owner123!` ile giriş yap
3. Dashboard'a yönlendirilmen lazım
4. Sağ üstte adın + "Yük Sahibi" yazısı görünmeli

### 7.4 Database'i incele

http://localhost:5050 → pgAdmin (email: `admin@nakliye.local`, şifre: `admin`)

Veya daha kolayı:

```powershell
pnpm db:studio
```

Prisma Studio açılır (http://localhost:5555) — tüm tabloları gezerek seed verilerini görebilirsin.

---

## ❓ Sorun çıkarsa

Aşağıdaki hataları büyük ihtimalle göreceksin, çözümleriyle:

| Hata                                  | Çözüm                                                          |
| ------------------------------------- | -------------------------------------------------------------- |
| `Cannot find module '@prisma/client'` | `pnpm --filter @nakliye/api prisma:generate` çalıştır          |
| `port 5432 already in use`            | Mevcut Postgres'i durdur veya port'u değiştir (Bölüm 3)        |
| `ECONNREFUSED localhost:5432`         | Docker Desktop kapalı — başlat ve `pnpm db:up` tekrar çalıştır |
| Frontend'de 401 hatası                | Backend ayakta değil — `pnpm dev` terminalini kontrol et       |
| `EACCES` veya izin hatası             | PowerShell'i **yönetici** olarak aç                            |
| `Module not found`                    | `pnpm install` tekrar çalıştır                                 |

Hata mesajını bana yapıştır, beraber çözeriz.

---

## 🎯 Bunu başardığında

✅ Lokal geliştirme ortamı çalışır halde
✅ Login/register tam akışı test edilmiş
✅ Database, API, frontend hepsi bağlı

**Sıradaki adım:** Bunu canlıya almak (Vercel + Railway) → `docs/DEPLOY.md`
