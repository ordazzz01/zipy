import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-2xl font-black text-slate-900">
          Iniciar sesión
        </h1>

        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-bold text-slate-500 uppercase">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:border-orange-400 focus:outline-none"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-bold text-slate-500 uppercase">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:border-orange-400 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 active:scale-[0.98]"
          >
            Entrar
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
