import Link from 'next/link';
import { Truck, ShieldCheck, MapPin, Zap, Star } from 'lucide-react';

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-brand-50">
        <div className="container py-20 md:py-28">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-700">
                <Zap className="h-4 w-4" /> Türkiye'nin en hızlı lojistik pazaryeri
              </div>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                Yükünüz için <span className="text-brand">en uygun nakliyeciyi</span> dakikalar
                içinde bulun
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                İlan açın, teklif toplayın, Escrow güvencesiyle ödeme yapın. Canlı GPS takibi ile
                yükünüzü anlık olarak görün.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/register" className="btn-primary px-6 py-3">
                  Hemen Başla
                </Link>
                <Link href="/cargo" className="btn-secondary px-6 py-3">
                  İlanları Gör
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  Escrow Ödeme
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Canlı Takip
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  KYC Doğrulamalı
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 p-8 shadow-2xl">
                <Truck className="h-full w-full text-white opacity-90" strokeWidth={1} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-center text-3xl font-bold">Nasıl çalışır?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            Yük sahibi misiniz, nakliyeci misiniz — platformumuz iki tarafa da değer katar.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                title: 'İlanını Aç',
                body: 'Yük detayını, lokasyonları ve bütçeni gir. Saniyeler içinde yayında.',
              },
              {
                title: 'Teklif Topla',
                body: 'Doğrulanmış nakliyecilerden teklifler gelsin. Profillerini incele.',
              },
              {
                title: 'Güvenle Taşı',
                body: 'Escrow ödeme + canlı GPS takibi + iş sonu çift taraflı puanlama.',
              },
            ].map((f, i) => (
              <div
                key={f.title}
                className="rounded-2xl border border-gray-200 p-6 transition hover:shadow-lg"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
                  {i + 1}
                </div>
                <h3 className="text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-gray-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 py-16 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold">Hemen kayıt olun, ilk 3 ilan ücretsiz!</h2>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/register?role=CARGO_OWNER" className="btn-primary px-6 py-3">
              Yük Sahibi Olarak Kayıt
            </Link>
            <Link href="/register?role=TRANSPORTER" className="btn-secondary px-6 py-3">
              Nakliyeci Olarak Kayıt
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-gray-500 md:flex-row">
          <p>© 2026 Nakliye Platformu — Tüm hakları saklıdır.</p>
          <div className="flex gap-4">
            <Link href="/legal/terms" className="hover:text-gray-900">
              Kullanım Şartları
            </Link>
            <Link href="/legal/privacy" className="hover:text-gray-900">
              KVKK
            </Link>
            <Link href="/contact" className="hover:text-gray-900">
              İletişim
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
