'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Truck, Bell, MessageCircle, LogOut, Plus } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const { user, clear, isAuthenticated } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    if (!isAuthenticated()) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* sessiz */
    }
    clear();
    toast.success('Görüşmek üzere!');
    router.push('/');
  };

  if (!hydrated || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Truck className="h-6 w-6 text-brand" />
            Nakliye Platformu
          </Link>
          <div className="flex items-center gap-4">
            <button className="rounded-full p-2 hover:bg-gray-100">
              <Bell className="h-5 w-5" />
            </button>
            <button className="rounded-full p-2 hover:bg-gray-100">
              <MessageCircle className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-brand text-center text-sm font-bold leading-8 text-white">
                {user.firstName.charAt(0)}
                {user.lastName.charAt(0)}
              </div>
              <div className="text-sm">
                <div className="font-semibold">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-gray-500">
                  {user.role === 'CARGO_OWNER' ? 'Yük Sahibi' : 'Nakliyeci'}
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="rounded p-2 hover:bg-gray-100" title="Çıkış">
              <LogOut className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8">
        <h1 className="text-2xl font-bold">Hoş geldin, {user.firstName}</h1>
        <p className="text-gray-600">Bugün ne yapmak istersin?</p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {user.role === 'CARGO_OWNER' ? (
            <>
              <Link
                href="/cargo/new"
                className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="rounded-full bg-brand p-3 text-white">
                  <Plus className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold">Yeni İlan</div>
                  <div className="text-sm text-gray-500">Yük ilanı oluştur</div>
                </div>
              </Link>
              <Link
                href="/cargo/mine"
                className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="rounded-full bg-blue-500 p-3 text-white">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold">İlanlarım</div>
                  <div className="text-sm text-gray-500">Aktif ve geçmiş ilanlar</div>
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/cargo"
                className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="rounded-full bg-brand p-3 text-white">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold">İlanları Ara</div>
                  <div className="text-sm text-gray-500">Açık yük ilanları</div>
                </div>
              </Link>
              <Link
                href="/offers/mine"
                className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="rounded-full bg-blue-500 p-3 text-white">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold">Tekliflerim</div>
                  <div className="text-sm text-gray-500">Verdiğim teklifler</div>
                </div>
              </Link>
            </>
          )}
          <Link
            href="/chat"
            className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="rounded-full bg-green-500 p-3 text-white">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <div className="font-semibold">Mesajlar</div>
              <div className="text-sm text-gray-500">Konuşmalarım</div>
            </div>
          </Link>
        </div>

        <div className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-gray-500">
            Geliştirme devam ediyor — ilan listesi, teklif yönetimi, chat ve harita modülleri
            sıradaki iterasyonlarda gelecek.
          </p>
        </div>
      </main>
    </div>
  );
}
