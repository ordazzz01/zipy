'use client';

import { useState, FormEvent, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const DEMO_ACCOUNTS = [
  { label: 'Cliente', email: 'cliente@zipy.demo', password: 'Demo123!', role: 'customer' },
  { label: 'Dueño de tienda', email: 'dueno@zipy.demo', password: 'Demo123!', role: 'merchant' },
  { label: 'Repartidor', email: 'repartidor@zipy.demo', password: 'Demo123!', role: 'driver' },
  { label: 'Admin', email: 'admin@zipy.demo', password: 'Admin123!', role: 'admin' },
];

const IS_DEMO = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_DEMO === 'true';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (user) router.replace('/');
  }, [user, authLoading, router]);

  if (authLoading) return <LoadingSkeleton />;
  if (user) return null;

  function fillDemo(acc: typeof DEMO_ACCOUNTS[number]) {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Correo o contraseña incorrectos');
          break;
        case 'auth/too-many-requests':
          setError('Demasiados intentos. Intenta más tarde.');
          break;
        default:
          setError('Error al iniciar sesión. Verifica tus datos.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-2xl font-black text-slate-900">
          Iniciar sesión
        </h1>

        {IS_DEMO && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="mb-3 text-xs font-bold text-emerald-700 uppercase tracking-wide">
              Cuentas demo
            </p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className="flex w-full items-center justify-between rounded-lg border border-emerald-200 bg-white px-3 py-2 text-left text-xs transition-colors hover:border-emerald-300 hover:bg-emerald-100/50"
                >
                  <span className="font-semibold text-emerald-800">{acc.label}</span>
                  <span className="text-[10px] text-emerald-500">{acc.email}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-emerald-500">
              Haz clic en una cuenta para rellenar los campos automáticamente
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-bold text-slate-500 uppercase tracking-wide">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:border-orange-400 focus:outline-none"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-bold text-slate-500 uppercase tracking-wide">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:border-orange-400 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          ¿No tienes cuenta?{' '}
          <Link href="/auth/register" className="font-bold text-orange-600 underline">
            Registrarse
          </Link>
        </p>
      </div>
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm animate-pulse space-y-4">
        <div className="h-8 w-48 rounded-xl bg-orange-200" />
        <div className="h-12 w-full rounded-xl bg-orange-100" />
        <div className="h-12 w-full rounded-xl bg-orange-100" />
        <div className="h-12 w-full rounded-xl bg-orange-200" />
      </div>
    </main>
  );
}
