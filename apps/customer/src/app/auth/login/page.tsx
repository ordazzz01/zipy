'use client';

import { useState, FormEvent, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirigir si ya hay sesion
  useEffect(() => {
    if (authLoading) return;
    if (user) router.replace('/');
  }, [user, authLoading, router]);

  if (authLoading) {
    return <LoadingSkeleton />;
  }

  if (user) {
    return null; // useEffect redirige
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
