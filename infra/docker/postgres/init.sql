-- Nakliye Platformu — PostgreSQL ilk kurulum
-- Bu dosya postgres container'ı ilk başlatıldığında otomatik çalışır

-- Coğrafi sorgular için PostGIS uzantısı
CREATE EXTENSION IF NOT EXISTS postgis;

-- UUID üretimi için
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trigram arama için (fuzzy text search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Sorgu istatistikleri (production'da disable edilebilir)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
