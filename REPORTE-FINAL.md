# Zipy — Reporte de Implementación

## ⚠️ Aviso
Este reporte refleja **SOLO lo que existe en el código** y puede validarse ejecutando los comandos indicados. No describe arquitectura futura como si estuviera implementada.

---

## Implementado ✅

### Monorepo
| Componente | Evidencia | Validación |
|-----------|-----------|------------|
| pnpm workspace | `pnpm-workspace.yaml` define 4 apps + 4 packages | `pnpm ls -r` |
| Turborepo | `turbo.json` con pipeline build, lint, test | `pnpm build` desde raíz |
| tsconfig base | `tsconfig.base.json` compartido | existe en raíz |

### customer-web (Next.js 15, App Router, Tailwind v4)
| Componente | Archivo |
|-----------|---------|
| Layout raíz | `apps/customer/src/app/layout.tsx` |
| Home page | `apps/customer/src/app/page.tsx` |
| Login page (funcional con Firebase Auth) | `apps/customer/src/app/auth/login/page.tsx` |
| Register page (funcional con Firebase Auth) | `apps/customer/src/app/auth/register/page.tsx` |
| Firebase init | `apps/customer/src/lib/firebase.ts` |
| PWA manifest | `apps/customer/public/manifest.json` |
| Tailwind config | `apps/customer/postcss.config.mjs`, `apps/customer/src/app/globals.css` |

### @zipy/core (Zod schemas)
| Schema | Archivo | Campos cubiertos |
|--------|---------|-----------------|
| UserProfile | `packages/core/src/index.ts` | 13 campos: id, email, displayName, phone, role, merchantId, isActive, etc. |
| Address | `packages/core/src/index.ts` | 10 campos: street, extNum, neighborhood, city, state, zip, etc. |
| ProductCategory | `packages/core/src/index.ts` | name, description, imageUrl, isActive |
| Product | `packages/core/src/index.ts` | name, description, price (centavos), categoryId, merchantId, images, etc. |
| Order | `packages/core/src/index.ts` | 14 campos: customerId, merchantId, items, status, total, etc. |
| MerchantProfile | `packages/core/src/index.ts` | 17 campos: businessName, ownerId, schedule, etc. |
| DriverProfile | `packages/core/src/index.ts` | id, displayName, phone, vehicle, isActive, etc. |
| Coupon | `packages/core/src/index.ts` | code, type, discount, maxUses, expiresAt, etc. |

### Web App Manifest
| Atributo | Valor |
|----------|-------|
| name | Zipy |
| short_name | Zipy |
| theme_color | `#f97316` |
| background_color | `#fff7ed` |
| display | `standalone` |

### Seeds (Firebase Emulator)
| Componente | Archivo |
|-----------|---------|
| Seed script | `seed/scripts/seed.ts` — idempotente, con guard de emulador |
| Clean script | `seed/scripts/clean.ts` |
| Demo accounts | `seed/demo-accounts.md` |
| Merchant data | `seed/config/merchants.json` (1 merchant campechano) |
| Products | `seed/config/products.json` (5 productos) |
| Addresses | `seed/config/addresses.json` (2 direcciones) |
| Coupons | `seed/config/coupons.json` |
| Demo users | 4 cuentas: customer, merchant, driver, admin |

### Firebase config
| Archivo | Propósito |
|---------|-----------|
| `firebase.json` | Configuración completa: Firestore rules + indexes, Functions, Storage, Emulators |
| `.firebaserc` | Proyecto por defecto: `zipy-dev` |
| `firestore.rules` | Reglas de seguridad por rol (customer, merchant, driver, admin) |
| `firestore.indexes.json` | Índices compuestos (vació — añadir según queries) |
| `storage.rules` | Reglas de Storage |

### GitHub Actions
| Workflow | Archivo | Estado |
|----------|---------|--------|
| CI | `.github/workflows/ci.yml` | ✅ Escucha PR a main/develop y push a develop. Lint (continue-on-error), typecheck (falla si hay error), build. |
| CD | `.github/workflows/cd.yml` | ✅ Escucha push a main. Verify build → Deploy Vercel (secuencial). Sin Firebase secrets expuestos. |
| Preview | `.github/workflows/preview.yml` | 🟡 Escucha PR a main. Solo deploy. |
| Security | `.github/workflows/security.yml` | 🟡 Escucha push a main/develop. Sin scanner configurado aún. |

### GitHub config
| Elemento | Estado |
|----------|--------|
| Default branch | `main` |
| Develop branch | `develop` |
| VERCEL_TOKEN | Configurado como GitHub secret |
| VERCEL_ORG_ID | Configurado como GitHub secret |
| VERCEL_PROJECT_ID | Configurado como GitHub secret |

### Vercel deploy
| Atributo | Valor |
|----------|-------|
| URL producción | **https://customer-mu-seven.vercel.app** |
| Framework | Next.js |
| Build command | `pnpm --filter @zipy/customer-web build` |
| Install command | `pnpm install --no-frozen-lockfile` |
| Root directory | `apps/customer` |
| Env vars | `NEXT_PUBLIC_USE_DEMO=true` (producción + preview) |

### GitHub templates
| Plantilla | Archivo |
|-----------|---------|
| Bug report | `.github/ISSUE_TEMPLATE/bug.yml` |
| Feature request | `.github/ISSUE_TEMPLATE/feature.yml` |
| PR template | `.github/pull_request_template.md` |

---

## Parcialmente implementado 🟡

### Cloud Functions
- Archivo: `functions/src/index.ts`
- Contenido: `export const placeholder = true`
- **No hay funciones reales implementadas**

### Release Check Script
- Archivo: `scripts/release-check.sh`
- Valida: git status, lint, typecheck, build
- **No integrado en CI/CD**

### README
- Archivo: `README.md`
- Contiene: instrucciones de instalación, cuentas demo, estructura, comandos, despliegue
- **Apps merchant/driver/admin marcadas explícitamente como pendientes**

---

## Pendiente ❌

### Apps
| App | Estado | Acción requerida |
|-----|--------|-----------------|
| merchant-web | ❌ No existe | Crear scaffolding, package.json, page.tsx |
| driver-web | ❌ No existe | Crear scaffolding |
| admin-web | ❌ No existe | Crear scaffolding |

### Packages
| Package | Estado | Acción requerida |
|---------|--------|-----------------|
| `@zipy/firebase` | ❌ Vacío | Crear helpers de Firebase |
| `@zipy/ui` | ❌ Vacío | Crear componentes base |
| `@zipy/config` | ❌ Vacío | Crear constantes compartidas |

### Funcionalidad backend
| Feature | Estado |
|---------|--------|
| Firebase project `zipy-dev` | ❌ No creado en console |
| Auth real (producción) | ❌ Sin proyecto Firebase |
| Firestore con datos reales | ❌ Solo demo data en emulador |
| Catalog from Firestore | ❌ No implementado |
| Cart / Zustand stores | ❌ No implementado |
| Orders | ❌ No implementado |
| Stripe | ❌ No implementado (pospuesto) |
| Maps | ❌ No implementado (pospuesto) |
| GPS | ❌ No implementado (pospuesto) |
| rate limiting | ❌ No implementado |
| Audit logs | ❌ No implementado |
| Tests | ❌ No implementados |

---

## Comandos de validación

```bash
# Verificar estructura del monorepo
pnpm ls -r

# Build completo (debe pasar)
pnpm build

# TypeScript type check (debe pasar)
pnpm typecheck

# Iniciar emulador
pnpm emulators

# Cargar datos demo (requiere emulador corriendo)
pnpm seed

# Verificar deploy URL
curl -s -o /dev/null -w "%{http_code}" https://customer-mu-seven.vercel.app/auth/login
# Debe devolver 200
```
