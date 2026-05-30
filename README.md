# Zipy — Zippy Express 🚚

Plataforma de delivery local on-demand. Monorepo con pnpm + Turborepo.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 15 (App Router), React 19, Tailwind v4 |
| Backend | Firebase (Auth, Firestore, Storage, Functions) — pendiente de configurar |
| Infra | Vercel, Firebase Hosting |
| Monorepo | pnpm workspaces + Turborepo |
| CI/CD | GitHub Actions |

## Apps

| App | Estado | URL |
|-----|--------|-----|
| customer-web | ✅ Implementado (login, register, home, auth state) | [Vercel](https://customer-mu-seven.vercel.app) |
| merchant-web | 🟡 Pendiente | — |
| driver-web | 🟡 Pendiente | — |
| admin-web | 🟡 Pendiente | — |

## Requisitos

- Node.js 22+
- pnpm 10+
- Java 17+ (para Firebase Emulator)

## Inicio rápido

```bash
# 1. Clonar e instalar
git clone <repo-url>
cd zipy
pnpm install

# 2. Copiar variables de entorno
cp .env.example .env.local

# 3. Iniciar Firebase Emulator (en una terminal)
pnpm --filter @zipy/functions emulators

# 4. Cargar datos demo (en otra terminal)
pnpm seed

# 5. Iniciar customer-web
pnpm dev
# Abrir http://localhost:3000
```

## Cuentas demo (Firebase Emulator)

| Rol | Email | Password |
|-----|-------|----------|
| Customer | cliente@zipy.demo | Demo123! |
| Merchant | dueno@zipy.demo | Demo123! |
| Driver | repartidor@zipy.demo | Demo123! |
| Admin | admin@zipy.demo | Admin123! |

## Estructura

```
zipy/
├── apps/
│   ├── customer/       # Customer Web (Next.js)
│   ├── merchant/       # 🟡 Pendiente
│   ├── driver/         # 🟡 Pendiente
│   └── admin/          # 🟡 Pendiente
├── packages/
│   ├── core/           # @zipy/core — Zod schemas, tipos compartidos
│   ├── firebase/       # 🟡 Pendiente
│   ├── ui/             # 🟡 Pendiente
│   └── config/         # 🟡 Pendiente
├── functions/          # Cloud Functions 2nd gen (placeholder)
├── seed/               # Datos demo (Firebase Emulator)
├── scripts/            # Utilidades
└── .github/workflows/  # CI/CD
```

## Comandos

```bash
pnpm dev          # Iniciar customer-web en dev
pnpm build        # Build customer-web
pnpm lint         # Lint customer-web
pnpm typecheck    # TypeScript type check
pnpm test         # Tests (no configurados aun)
pnpm seed         # Cargar datos demo
pnpm seed:reset   # Limpiar y recargar datos demo
pnpm --filter @zipy/functions emulators  # Iniciar Firebase Emulator
```

## Despliegue

- **Producción:** Push a `main` → CI verifica build → CD deploya a Vercel
- **Preview:** PR a `main` → GitHub Actions deploya preview automático

## Notas técnicas

- El auth state se maneja con `AuthProvider` (Context + onAuthStateChanged)
- Los roles de Firestore se leen desde `users/{uid}.role` (no dependen de custom claims)
- Las `firestore.rules` usan `getUserRole()` helper para autorización por rol
- `firebase-tools` debe instalarse: `pnpm install` lo obtiene automáticamente via `@zipy/functions`
