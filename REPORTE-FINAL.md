# Zipy — Reporte de Implementación

## ⚠️ Aviso
Este reporte refleja **SOLO lo que existe en el código** y puede validarse ejecutando los comandos indicados. No describe arquitectura o features futuras como si estuvieran implementadas.

---

## Implementado ✅

### Monorepo
| Componente | Evidencia |
|-----------|-----------|
| pnpm workspace | `pnpm-workspace.yaml` define 4 apps + 4 packages |
| Turborepo | `turbo.json` con pipeline build, lint, test |
| tsconfig base compartido | `tsconfig.base.json` en raíz |
| Root scripts dev/build/typecheck/seed | `package.json` raíz |

### customer-web (Next.js 15, App Router, Tailwind v4)

| Componente | Archivo |
|-----------|---------|
| Layout raíz con AuthProvider | `apps/customer/src/app/layout.tsx` |
| Home page con auth state + logout | `apps/customer/src/app/page.tsx` |
| Login page (Firebase Auth, redirect si logueado) | `apps/customer/src/app/auth/login/page.tsx` |
| Register page (Firebase Auth + Firestore profile, validación teléfono) | `apps/customer/src/app/auth/register/page.tsx` |
| Firebase init con SSR guard + emulador | `apps/customer/src/lib/firebase.ts` |
| AuthProvider + useAuth (onAuthStateChanged, role desde Firestore) | `apps/customer/src/lib/AuthProvider.tsx` |
| next.config.ts (strict, security headers) | `apps/customer/next.config.ts` |
| PWA manifest | `apps/customer/public/manifest.json` |
| PostCSS + Tailwind | `postcss.config.mjs`, `src/app/globals.css` |

### @zipy/core (Zod schemas)
| Schema | Archivo |
|--------|---------|
| UserProfile, Address, ProductCategory, Product, Order, MerchantProfile, DriverProfile, Coupon | `packages/core/src/index.ts` |

### Firebase config

| Archivo | Propósito |
|---------|-----------|
| `firebase.json` | Config: Firestore rules + indexes, Functions, Storage, Emulators |
| `.firebaserc` | Proyecto por defecto: `zipy-dev` |
| `firestore.rules` | Reglas por rol usando `getUserRole()` desde `users/{uid}` — no depende de custom claims |
| `firestore.indexes.json` | Placeholder |
| `storage.rules` | Reglas básicas de Storage |

### Seeds (Firebase Emulator)
| Componente | Archivo |
|-----------|---------|
| Seed script (idempotente, guard emulador) | `seed/scripts/seed.ts` |
| Clean script | `seed/scripts/clean.ts` |
| Demo accounts | `seed/demo-accounts.md` |
| Merchant data | `seed/config/merchants.json` |
| Products (x5) | `seed/config/products.json` |
| Addresses | `seed/config/addresses.json` |
| Coupons | `seed/config/coupons.json` |

### GitHub Actions
| Workflow | Archivo | Estado |
|----------|---------|--------|
| CI | `.github/workflows/ci.yml` | ✅ PR main/develop + push develop. Lint (continue-on-error), typecheck (falla), test (dummy), build |
| CD | `.github/workflows/cd.yml` | ✅ Push main. Verify build → Deploy Vercel. Sin Firebase secrets |
| Preview | `.github/workflows/preview.yml` | ✅ PR main. Deploy preview con NEXT_PUBLIC_USE_DEMO |
| Security | `.github/workflows/security.yml` | 🟡 Sin scanner real configurado |

### GitHub config
| Elemento | Valor |
|----------|-------|
| Default branch | `main` |
| Develop branch | `develop` |
| Secrets (Vercel) | VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID |

### Vercel
| Atributo | Valor |
|----------|-------|
| URL producción | **https://customer-mu-seven.vercel.app** |
| Build command | `pnpm --filter @zipy/customer-web build` |
| Root directory | `apps/customer` |
| Framework | Next.js |

### GitHub templates
| Plantilla | Archivo |
|-----------|---------|
| Bug report | `.github/ISSUE_TEMPLATE/bug.yml` |
| Feature request | `.github/ISSUE_TEMPLATE/feature.yml` |
| PR template | `.github/pull_request_template.md` |

---

## Parcialmente implementado 🟡

| Componente | Notas |
|-----------|-------|
| Cloud Functions | `functions/src/index.ts` con `export const placeholder = true`. Sin Functions reales |
| Release Check Script | `scripts/release-check.sh`. No integrado en CI/CD |
| README | Instrucciones verificables, apps pendientes marcadas con 🟡 |

---

## Pendiente ❌

| Feature | Estado |
|---------|--------|
| merchant-web app | ❌ No existe |
| driver-web app | ❌ No existe |
| admin-web app | ❌ No existe |
| `@zipy/firebase` package | ❌ Vacío |
| `@zipy/ui` package | ❌ Vacío |
| `@zipy/config` package | ❌ Vacío |
| Proyecto Firebase `zipy-dev` en console | ❌ No creado |
| Auth/Login contra Firebase real | ❌ Solo emulador |
| Catalog from Firestore | ❌ No implementado |
| Cart / Zustand stores | ❌ No implementado |
| Orders flow | ❌ No implementado |
| Stripe, Maps, GPS | ❌ Pospuesto post-MVP |
| Rate limiting / Audit logs | ❌ No implementado |
| Tests unitarios / E2E | ❌ No implementados |

---

## Comandos de validación

```bash
# Build
pnpm build

# Type check
pnpm typecheck

# Test (dummy)
pnpm test

# Emulador local
pnpm --filter @zipy/functions emulators

# Seed (requiere emulador)
pnpm seed

# Deploy verificado
curl -s -o /dev/null -w "%{http_code}" https://customer-mu-seven.vercel.app/auth/login
# → 200
```
