import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-2xl font-black text-slate-900">
          Crear cuenta
        </h1>

        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-xs font-bold text-slate-500 uppercase">
              Nombre completo
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:border-orange-400 focus:outline-none"
              placeholder="Juan Pérez"
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-xs font-bold text-slate-500 uppercase">
              Teléfono
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:border-orange-400 focus:outline-none"
              placeholder="9811234567"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="mb-1 block text-xs font-bold text-slate-500 uppercase">
              Correo electrónico
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:border-orange-400 focus:outline-none"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="mb-1 block text-xs font-bold text-slate-500 uppercase">
              Contraseña
            </label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:border-orange-400 focus:outline-none"
              placeholder="Mín. 8 caracteres"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 active:scale-[0.98]"
          >
            Crear cuenta
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
