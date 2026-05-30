'use client';

import { useState, FormEvent } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });

      // Crear perfil de usuario en Firestore
      await setDoc(doc(db, 'users', cred.user.uid), {
        id: cred.user.uid,
        email,
        displayName: name,
        phone,
        role: 'customer',
        isActive: true,
        locale: 'es-MX',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      router.push('/');
    } catch (err: any) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('Este correo ya está registrado');
          break;
        case 'auth/weak-password':
          setError('La contraseña debe tener al menos 6 caracteres');
          break;
        case 'auth/invalid-email':
          setError('Correo electrónico inválido');
          break;
        default:
          setError('Error al crear la cuenta. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-2xl font-black text-slate-900">
          Crear cuenta
        </h1>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="mb-1 block text-xs font-bold text-slate-500 uppercase tracking-wide">
              Nombre completo
            </label>
            <input
              id="name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:border-orange-400 focus:outline-none"
              placeholder="Juan Pérez"
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-xs font-bold text-slate-500 uppercase tracking-wide">
              Teléfono
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:border-orange-400 focus:outline-none"
              placeholder="9811234567"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="mb-1 block text-xs font-bold text-slate-500 uppercase tracking-wide">
              Correo electrónico
            </label>
            <input
              id="reg-email"
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
            <label htmlFor="reg-password" className="mb-1 block text-xs font-bold text-slate-500 uppercase tracking-wide">
              Contraseña
            </label>
            <input
              id="reg-password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:border-orange-400 focus:outline-none"
              placeholder="Mín. 6 caracteres"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="font-bold text-orange-600 underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
