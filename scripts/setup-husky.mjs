#!/usr/bin/env node
/**
 * Husky setup — yalnızca lokal/dev ortamlarında çalışsın.
 *
 * Why this exists:
 *   `pnpm install --prod` devDependencies'i yüklemez → husky binary olmaz.
 *   `"prepare": "husky"` direkt çalıştırılırsa container build "not found" verir.
 *   `|| true` bazı pnpm sürümlerinde exit code'u doğru yakalamıyor.
 *
 * How to apply:
 *   - Eğer husky resolve edilebiliyorsa (devDep mevcut) → kur
 *   - Edilemiyorsa (prod build, CI) → sessizce geç
 *
 * Result: tek `prepare` script'i hem lokal hem Railway/Vercel/CI'de çalışır.
 */

import { execSync } from 'node:child_process';

// CI veya production install'de husky'yi atla
const isCI = Boolean(process.env.CI || process.env.RAILWAY_ENVIRONMENT || process.env.VERCEL);
const isProdInstall = process.env.NODE_ENV === 'production' || process.env.NPM_CONFIG_PRODUCTION === 'true';

if (isCI || isProdInstall) {
  console.log('[husky] CI/prod ortamı — kurulum atlanıyor');
  process.exit(0);
}

// Husky resolve edilebiliyor mu?
try {
  await import('husky');
} catch {
  console.log('[husky] devDep yüklenmemiş — kurulum atlanıyor');
  process.exit(0);
}

// Husky var, kur
try {
  execSync('husky', { stdio: 'inherit' });
} catch (err) {
  console.warn('[husky] Kurulum sırasında hata (yoksayılıyor):', err.message);
  process.exit(0);
}
