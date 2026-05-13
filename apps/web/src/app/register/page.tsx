'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Truck, Package } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

const schema = z.object({
  role: z.enum(['CARGO_OWNER', 'TRANSPORTER']),
  firstName: z.string().min(2, 'Ad en az 2 karakter'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter'),
  email: z.string().email('Geçerli email girin'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Geçerli telefon girin')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(8, 'En az 8 karakter')
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Büyük, küçük harf ve rakam içermeli'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);
  const [loading, setLoading] = useState(false);

  const defaultRole = (params.get('role') as 'CARGO_OWNER' | 'TRANSPORTER') ?? 'CARGO_OWNER';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: defaultRole },
  });

  const role = watch('role');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const payload = { ...data, phone: data.phone || undefined };
      const res = await api.post('/auth/register', payload);
      const { user, accessToken, refreshToken } = res.data.data;
      setSession(user, accessToken, refreshToken);
      toast.success('Hesabın oluşturuldu — Hoş geldin!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Kayıt başarısız.';
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold">Hesap Oluştur</h1>
        <p className="text-sm text-gray-500">Saniyeler içinde başla</p>

        {/* Role selector */}
        <div className="my-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setValue('role', 'CARGO_OWNER')}
            className={`rounded-xl border-2 p-4 text-left transition ${
              role === 'CARGO_OWNER' ? 'border-brand bg-brand-50' : 'border-gray-200'
            }`}
          >
            <Package className="mb-2 h-6 w-6 text-brand" />
            <div className="font-semibold">Yük Sahibi</div>
            <div className="text-xs text-gray-500">Yükümü taşıtmak istiyorum</div>
          </button>
          <button
            type="button"
            onClick={() => setValue('role', 'TRANSPORTER')}
            className={`rounded-xl border-2 p-4 text-left transition ${
              role === 'TRANSPORTER' ? 'border-brand bg-brand-50' : 'border-gray-200'
            }`}
          >
            <Truck className="mb-2 h-6 w-6 text-brand" />
            <div className="font-semibold">Nakliyeci</div>
            <div className="text-xs text-gray-500">Yük taşıyorum / aracım var</div>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Ad</label>
              <input {...register('firstName')} className="input" />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Soyad</label>
              <input {...register('lastName')} className="input" />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input {...register('email')} type="email" className="input" />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Telefon (opsiyonel)</label>
            <input {...register('phone')} className="input" placeholder="+90 555 123 45 67" />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Şifre</label>
            <input {...register('password')} type="password" className="input" />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Kayıt Ol'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Zaten hesabın var mı?{' '}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Giriş yap
          </Link>
        </p>
      </div>
    </main>
  );
}
