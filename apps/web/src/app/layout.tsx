import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { Providers } from '@/components/providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Nakliye Platformu — Yük Sahipleri ve Nakliyecileri Buluşturur',
    template: '%s | Nakliye Platformu',
  },
  description:
    'Türkiye genelinde profesyonel nakliyecileri yük sahipleriyle buluşturan modern, güvenli pazaryeri. Escrow ödeme, gerçek zamanlı takip ve şeffaf puanlama.',
  keywords: ['nakliye', 'lojistik', 'kamyon', 'yük taşıma', 'kargo', 'parsiyel'],
  authors: [{ name: 'Nakliye Platformu' }],
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Nakliye Platformu',
  },
};

export const viewport: Viewport = {
  themeColor: '#FF6B35',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="min-h-screen bg-white text-gray-900 font-sans antialiased">
        <Providers>{children}</Providers>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
