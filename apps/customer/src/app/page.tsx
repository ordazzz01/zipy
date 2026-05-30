'use client';

import { useAuth } from '@/lib/AuthProvider';
import Link from 'next/link';

export default function HomePage() {
  const { user, loading, logout } = useAuth();

  if (loading) return <LoadingSkeleton />;

  if (user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-orange-500 text-4xl font-black text-white shadow-lg shadow-orange-500/30">
            Z
          </div>

          <h1 className="mb-2 text-4xl font-black tracking-tight text-slate-900">
            Zipy
          </h1>
          <p className="mb-4 text-lg font-semibold text-orange-600">
            Zippy Express
          </p>

          <div className="mb-8 rounded-xl bg-white border border-orange-100 p-4">
            <p className="text-sm font-bold text-slate-800">
              {user.displayName || user.email}
            </p>
            <p className="text-xs text-slate-400 capitalize">
              {user.role}
            </p>
          </div>

          <p className="mb-8 text-sm text-slate-500">
            Bienvenido. El catálogo de productos estará disponible próximamente.
          </p>

          <button
            onClick={logout}
            className="block w-full rounded-xl border-2 border-red-200 bg-white px-6 py-3.5 text-sm font-bold text-red-600 transition-all hover:border-red-300 hover:bg-red-50 active:scale-[0.98]"
          >
            Cerrar sesión
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-orange-500 text-4xl font-black text-white shadow-lg shadow-orange-500/30">
          Z
        </div>

        <h1 className="mb-2 text-4xl font-black tracking-tight text-slate-900">
          Zipy
        </h1>
        <p className="mb-8 text-lg font-semibold text-orange-600">
          Zippy Express
        </p>
        <p className="mb-12 text-sm text-slate-500 leading-relaxed">
          Tu delivery local más rápido. Pide de tus restaurantes favoritos
          y recibe en minutos.
        </p>

        <div className="space-y-3">
          <Link
            href="/auth/login"
            className="block w-full rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 active:scale-[0.98]"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/auth/register"
            className="block w-full rounded-xl border-2 border-orange-200 bg-white px-6 py-3.5 text-sm font-bold text-orange-600 transition-all hover:border-orange-300 hover:bg-orange-50 active:scale-[0.98]"
          >
            Crear cuenta
          </Link>
        </div>

        <p className="mt-8 text-[10px] text-slate-400">
          Al continuar, aceptas nuestros{' '}
          <Link href="/terms" className="underline">Términos</Link>
          {' '}y{' '}
          <Link href="/privacy" className="underline">Privacidad</Link>.
        </p>
      </div>
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="max-w-md w-full animate-pulse space-y-4">
        <div className="mx-auto h-24 w-24 rounded-full bg-orange-200" />
        <div className="mx-auto h-8 w-32 rounded-xl bg-orange-200" />
        <div className="mx-auto h-6 w-48 rounded-xl bg-orange-100" />
        <div className="mx-auto h-4 w-64 rounded-xl bg-orange-100" />
        <div className="h-12 w-full rounded-xl bg-orange-200" />
        <div className="h-12 w-full rounded-xl bg-orange-200" />
      </div>
    </main>
  );
}
