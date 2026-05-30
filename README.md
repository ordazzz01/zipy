# Zipy — Zippy Express 🚚

Plataforma de delivery local on-demand. Monorepo con pnpm + Turborepo.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 15 (App Router), React 19, Tailwind v4 |
| Backend | Firebase (Auth, Firestore, Storage, Functions) — emulador local |
| Infra | Vercel, Firebase Hosting |
| Monorepo | pnpm workspaces + Turborepo |
| CI/CD | GitHub Actions |

## Apps

| App | Estado | URL |
|-----|--------|-----|
| customer-web | ✅ Login/register con cuentas demo funcional | [Vercel](https://customer-mu-seven.vercel.app) |
| merchant-web | 🟡 Pendiente | — |
| driver-web | 🟡 Pendiente | — |
| admin-web | 🟡 Pendiente | — |

## Requisitos

- Node.js 22+
- pnpm 10+
- Java 17+ (para Firebase Emulator)

## Inicio rápido (entorno local con demo)

```bash
# 1. Clonar e instalar
git clone <repo-url>
cd zipy
pnpm install

# 2. Copiar variables de entorno
cp .env.example .env.local

# 3. TERMINAL 1 — Iniciar Firebase Emulator
pnpm emulators
# Abre http://localhost:4000 para ver la UI del emulador

# 4. TERMINAL 2 — Sembrar datos demo
pnpm seed:reset

# 5. TERMINAL 2 — Iniciar customer-web
pnpm dev
# Abrir http://localhost:3000
```

## Cuentas Demo

Una vez sembrados los datos, inicia sesión con cualquiera de estas cuentas:

| Rol | Email | Password |
|-----|-------|----------|
| 🧑‍💼 Cliente | `cliente@zipy.demo` | `Demo123!` |
| 🏪 Dueño de tienda | `dueno@zipy.demo` | `Demo123!` |
| 🛵 Repartidor | `repartidor@zipy.demo` | `Demo123!` |
| 🔧 Admin | `admin@zipy.demo` | `Admin123!` |

En entorno demo (NEXT_PUBLIC_USE_DEMO=true), la página de login muestra un panel verde con botones para rellenar las credenciales automáticamente.

Ver `docs/demo-accounts.md` para más detalles.

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
├── seed/               # Datos demo (Firebase Emulator — Admin SDK)
├── scripts/            # Utilidades
├── docs/               # Documentación
└── .github/workflows/  # CI/CD
```

## Comandos

```bash
pnpm dev          # Iniciar customer-web en dev
pnpm build        # Build customer-web
pnpm lint         # Lint customer-web
pnpm typecheck    # TypeScript type check
pnpm test         # Tests (no configurados aun)
pnpm emulators    # Iniciar Firebase Emulator (auth:9099, firestore:8080, storage:9199, ui:4000)
pnpm seed         # Sembrar cuentas demo + datos base (requiere emulador)
pnpm seed:clean   # Limpiar datos del emulador
pnpm seed:reset   # Limpiar y recargar
```

## Despliegue

- **Producción:** Push a `main` → CI verifica build → CD deploya a Vercel
- **Preview:** PR a `main` → GitHub Actions deploya preview automático

## Notas técnicas

- El auth state se maneja con `AuthProvider` (Context + onAuthStateChanged)
- Los roles de Firestore se leen desde `users/{uid}.role` (no dependen de custom claims)
- Las `firestore.rules` usan `getUserRole()` que lee el documento del usuario en Firestore
- El seed usa Firebase Admin SDK apuntando al emulador local
- Las cuentas demo se crean con UID explícito controlado por el emulador
- `firebase-tools` está en devDependencies del workspace, no requiere instalación global
