#!/usr/bin/env node
/**
 * Smoke test — API'nin en kritik flow'ları gerçekten çalışıyor mu doğrula.
 *
 * Kullanım:
 *   pnpm smoke
 *
 * Test eder:
 *   1. /health → 200 + db:up
 *   2. POST /api/v1/auth/login (seed user)
 *   3. GET  /api/v1/auth/me (access token ile)
 *   4. GET  /api/v1/cargo-posts (open ilanlar)
 *   5. POST /api/v1/auth/logout
 *
 * Bağımlılık yok — sadece built-in fetch + AbortController.
 */

const API = process.env.API_BASE_URL ?? 'http://localhost:4000';
const TIMEOUT_MS = 5_000;

const passed = [];
const failed = [];

const c = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

async function step(name, fn) {
  process.stdout.write(`  ${c.dim('→')} ${name} ... `);
  try {
    const result = await fn();
    console.log(c.green('✓'));
    passed.push(name);
    return result;
  } catch (err) {
    console.log(c.red('✗'));
    console.log(c.red(`    ${err.message}`));
    failed.push({ name, error: err.message });
    throw err;
  }
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    const text = await res.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
    return { status: res.status, body };
  } finally {
    clearTimeout(id);
  }
}

console.log(c.bold('\n🚀 Nakliye API Smoke Test'));
console.log(c.dim(`   Target: ${API}\n`));

let accessToken;
let refreshToken;

try {
  // 1. Health
  await step('GET /health (sistem ayakta mı?)', async () => {
    const { status, body } = await request('/health');
    if (status !== 200) throw new Error(`Beklenen 200, alınan ${status}`);
    if (body?.data?.db !== 'up') {
      throw new Error(`DB durumu beklenmedik: ${JSON.stringify(body)}`);
    }
  });

  // 2. Login
  await step('POST /api/v1/auth/login (seed owner)', async () => {
    const { status, body } = await request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'owner@nakliye.local',
        password: 'Owner123!',
      }),
    });
    if (status !== 200) {
      throw new Error(`Beklenen 200, alınan ${status}: ${JSON.stringify(body)}`);
    }
    if (!body?.data?.accessToken) {
      throw new Error(`Access token dönmedi: ${JSON.stringify(body)}`);
    }
    accessToken = body.data.accessToken;
    refreshToken = body.data.refreshToken;
  });

  // 3. /me
  await step('GET /api/v1/auth/me (access token doğrulama)', async () => {
    const { status, body } = await request('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (status !== 200) throw new Error(`Beklenen 200, alınan ${status}`);
    if (body?.data?.email !== 'owner@nakliye.local') {
      throw new Error(`Beklenmedik kullanıcı: ${JSON.stringify(body?.data)}`);
    }
  });

  // 4. Cargo list (public endpoint)
  await step('GET /api/v1/cargo-posts (public ilanlar)', async () => {
    const { status, body } = await request('/api/v1/cargo-posts');
    if (status !== 200) throw new Error(`Beklenen 200, alınan ${status}`);
    if (!Array.isArray(body?.data?.items)) {
      throw new Error(`items array bekleniyor`);
    }
  });

  // 5. Logout
  await step('POST /api/v1/auth/logout', async () => {
    const { status } = await request('/api/v1/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (status !== 204) throw new Error(`Beklenen 204, alınan ${status}`);
  });

  // 6. Auth artık geçersiz mi?
  await step('Logout sonrası /me 401 dönmeli (refresh iptali)', async () => {
    // Not: access token hala valid çünkü blacklist yok — sadece refresh iptal edildi.
    // Gerçek doğrulama: refresh ile yeni token alamamak
    const { status } = await request('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
    if (status !== 403) {
      throw new Error(`Beklenen 403 (refresh iptal), alınan ${status}`);
    }
  });
} catch {
  // step zaten log'ladı — sessizce devam
}

// Özet
const total = passed.length + failed.length;
console.log(`\n${c.bold('───────────────────────────')}`);
if (failed.length === 0) {
  console.log(c.green(`✅ ${passed.length}/${total} test geçti — API sağlıklı!\n`));
  process.exit(0);
} else {
  console.log(c.red(`❌ ${failed.length}/${total} test başarısız:`));
  for (const f of failed) {
    console.log(c.red(`   - ${f.name}: ${f.error}`));
  }
  console.log();
  process.exit(1);
}
