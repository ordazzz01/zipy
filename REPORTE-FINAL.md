# Zipy — Reporte Final de Arquitectura

> **Versión:** 1.1.0  
> **Fecha:** 2026-05-30  
> **Autor:** Clawd 🦾 (asistente de arquitectura)  
> **Proyecto:** Zipy — Plataforma de delivery on-demand

> **Nota post-auditoría:** El diseño original proponía 4 frontends independientes. Se consolidó a 1 app Next.js con multi-routing (customer, merchant, driver, admin bajo 1 proyecto Vercel). 4 apps separadas post-MVP. Los workflows ya reflejan esta consolidación.

---

## 1. Resumen Ejecutivo

Zipy es una plataforma de delivery on-demand con 4 interfaces web (customer, merchant, driver, admin) construida sobre un monorepo pnpm + Turborepo, Firebase como Backend-as-a-Service, y Cloud Functions 2nd gen para lógica del servidor.

**Estado:** Diseño completo (Etapas 1–12). Listo para implementación.

**Stack final:**

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, Tailwind v4, Zustand |
| Backend | Firebase (Auth, Firestore, Storage, Functions) |
| Infra | Vercel (1 app, multi-route), Firebase Hosting (functions) |
| Monorepo | pnpm workspaces + Turborepo |
| CI/CD | GitHub Actions |
| Pagos | Stripe Connect |
| Maps | Google Maps API |

---

## 2. Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────────────────┐
│                        INTERNET                                     │
└─────────────────────────────────────────────────────────────────────┘
          │                    │                   │
          ▼                    ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐
│   customer-web   │  │   merchant-web   │  │   driver-web     │
│  zipy.app        │  │ merchant.zipy.app│  │ driver.zipy.app  │
│  Next.js + PWA   │  │ Next.js + Zustand│  │ Next.js + PWA    │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                      │                     │
         └──────────────────────┼─────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────┐
│                     Vercel Edge Network                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  SSR / ISR   │  │   API Routes │  │  Edge Middleware     │ │
│  │  (pages)     │  │  (serverless)│  │  (auth, redirects)   │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────┐
│                     Firebase Project                            │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  Auth        │  │  Firestore   │  │  Storage             │ │
│  │  (custom     │  │  (DB primaria)│  │  (imgs, docs)       │ │
│  │   claims)    │  │              │  │                      │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Cloud Functions 2nd gen (us-central1)                  │  │
│  │  onCreateOrder · onPaymentWebhook · assignDriver        │  │
│  │  settlePayout · generateQr · auditLogger               │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Extensions (opcional)                                   │  │
│  │  Stripe Payments · Trigger Email · Resize Images         │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

**Flujo del request:**

```
Usuario → Vercel Edge → Next.js SSR (o CSR) → Firebase SDK (web) → Firestore
                                                                       ↓
                                                    Cloud Function (event-driven)
```

---

## 3. Decisiones Técnicas Clave

| Decisión | Opción elegida | Por qué |
|---|---|---|
| **Estado global** | Zustand + localStorage | Zustand: 1KB, sin providers, tipado nativo. Mínimo boilerplate vs Redux. |
| **Comunicación en tiempo real** | Firestore `onSnapshot` | Ya tenemos Firestore; socket dedicado sería over-engineering para MVP. 3-5s de latencia aceptable. |
| **Pagos** | Stripe Connect + Firestore webhook | Stripe Connect maneja split payments merchant→driver; webhook registrado en Cloud Function. |
| **Background jobs** | Cloud Functions 2nd gen + `tasks.create` | Event-driven (disparadas por writes a Firestore). Para MVP no necesitamos cola externa (PubSub). |
| **Maps** | Google Maps JS SDK + Geocoding API | Única opción madura con soporte en México. |
| **UI Framework** | Tailwind v4 (utility-first) | Menos JS bundle, build-time CSS, sin runtime overhead. |
| **Persistencia carrito** | Zustand `persist` middleware | localStorage nativo; 5KB de datos de carrito no preocupa. |
| **Autenticación** | Firebase Auth + custom claims | Rol se asigna en `users/{uid}` y se verifica en Firestore rules + Cloud Functions. |
| **PWA** | next-pwa + manifest.json | Offline support para driver-web (crítico en zonas sin señal). |

---

## 4. Seguridad Aplicada

### Firestore Rules (por rol)

```
// Customer: solo su perfil, sus direcciones, sus órdenes
match /users/{uid} {
  allow read, write: if request.auth.uid == uid;
}
match /users/{uid}/addresses/{addrId} {
  allow read, write: if request.auth.uid == uid;
}
match /orders/{orderId} {
  allow read: if request.auth.uid == resource.data.customerId;
  allow create: if request.auth.token.role == 'customer';
  allow update: if request.auth.uid == resource.data.customerId && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status']);
}

// Merchant: su merchant + staff
match /merchants/{merchantId} {
  allow read: if request.auth.token.merchantId == merchantId;
  allow write: if request.auth.token.merchantId == merchantId && request.auth.token.role == 'merchant';
}
match /merchants/{merchantId}/orders/{orderId} {
  allow read, update: if request.auth.token.merchantId == merchantId;
}

// Driver: sus tareas
match /drivers/{driverUid} {
  allow read, write: if request.auth.uid == driverUid;
}
match /orders/{orderId} {
  allow update: if request.auth.token.role == 'driver' && orderId in get(/databases/$(database)/documents/drivers/$(request.auth.uid)).data.activeOrderIds;
}

// Admin: todo
match /{document=**} {
  allow read, write: if request.auth.token.role == 'admin';
}
```

### Otras medidas

- **Idempotency keys** en órdenes (evita doble cobro)
- **Rate limiting** por Firestore counter (50 writes/min por usuario)
- **Stripe webhook HMAC** verificado en Cloud Function
- **Precos en DB no en frontend** — el precio se lee de Firestore en checkout, no del carrito del cliente
- **No expongo secretos al frontend** — Stripe publishable key es pública, pero secret key solo en Cloud Functions
- **Audit logs obligatorios** para cambios de estado de órdenes (quién, cuándo, qué cambió)

---

## 5. Escalabilidad Prevista

| Componente | Límite | Estrategia de escala |
|---|---|---|
| **Firestore** | 1M writes/día gratis, 1 write/s por doc | Denormalización (evitar reads joins). `onSnapshot` para tiempo real. |
| **Firestore queries** | 200 índices por proyecto | Monitorear queries lentas, crear índices compuestos solo cuando aparezcan. |
| **Cloud Functions** | 1k invocaciones/día gratis, 9M cuota | 2nd gen escala a 3k concurrentes. Para >100k órdenes/mes, migrar a Cloud Run. |
| **Vercel** | 100GB ancho de banda gratis | Functions en Vercel solo para SSR. API pesada → Firebase Functions. |
| **Storage** | 5GB gratis | Imágenes de productos se sirven via Firebase Hosting CDN. |
| **Auth** | 50k MAU gratis | Custom claims evitan reads extra para verificar roles. |
| **Usuarios concurrentes** | ~1k por app (gratis) | Después de 1k MAU por app, plan Blaze ($25/mes base + uso). |

### Cuello de botella identificado

El cuello de botella más temprano será **Firestore reads en el dashboard de merchant**. Cada merchant ve órdenes en vivo con `onSnapshot`. Si 500 merchants abren su dashboard simultáneo, son 500 listeners activos. Firestore lo soporta, pero el costo de lectura se acumula.

**Mitigación:** Paginar el historial de órdenes. Solo escuchar órdenes con `status != 'delivered'`.

---

## 6. Estructura Final del Monorepo

```
zipy/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml           # Lint + typecheck + test + build
│   │   ├── cd.yml           # Deploy a producción (5 jobs)
│   │   ├── preview.yml      # Deploy preview por PR
│   │   └── security.yml     # Semanal: audit + secret scan
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug.yml
│   │   └── feature.yml
│   └── pull_request_template.md
│
├── apps/
│   ├── customer/            # Customer Web — zipy.app
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── app/         # Next.js App Router (SSR)
│   │   │   ├── components/
│   │   │   ├── lib/         # Firebase init, API client
│   │   │   ├── hooks/
│   │   │   └── stores/      # Zustand
│   │   ├── package.json
│   │   └── next.config.ts
│   │
│   ├── merchant/            # Merchant Web — merchant.zipy.app
│   │   └── ... (misma estructura)
│   │
│   ├── driver/              # Driver Web — driver.zipy.app
│   │   └── ... (misma estructura, PWA)
│   │
│   └── admin/               # Admin Web — admin.zipy.app
│       └── ... (misma estructura)
│
├── packages/
│   ├── core/                # @zipy/core — Zod schemas, types
│   │   ├── src/
│   │   │   ├── schemas/     # Zod: order, user, merchant, payment
│   │   │   ├── types/       # TypeScript interfaces
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── ui/                  # @zipy/ui — Componentes compartidos
│   │   ├── src/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Map.tsx      # Google Maps wrapper
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── firebase/            # @zipy/firebase — Firebase config + helpers
│   │   ├── src/
│   │   │   ├── client.ts    # Firebase web SDK init
│   │   │   ├── admin.ts     # Firebase admin (solo functions)
│   │   │   ├── auth.ts      # Auth helpers
│   │   │   └── firestore.ts # CRUD helpers
│   │   └── package.json
│   │
│   └── config/              # @zipy/config — constantes compartidas
│       ├── src/
│       │   ├── constants.ts
│       │   └── index.ts
│       └── package.json
│
├── functions/               # Cloud Functions 2nd gen
│   ├── src/
│   │   ├── triggers/        # Event-driven (onCreate, onUpdate)
│   │   ├── tasks/           # Tareas background (PubSub)
│   │   ├── index.ts         # Entry point
│   │   └── logger.ts
│   ├── package.json
│   └── tsconfig.json
│
├── seed/
│   ├── scripts/
│   │   ├── seed.ts          # Carga datos demo
│   │   └── clean.ts         # Limpia datos demo
│   ├── config/              # JSON con datos de seed
│   ├── demo-accounts.md
│   └── package.json
│
├── scripts/
│   └── release-check.sh     # Pre-release validation
│
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── package.json             # Root scripts
├── .env.example
├── .gitignore
└── README.md
```

---

## 7. Módulos Implementados (Resumen)

| Módulo | Archivos | Estado |
|---|---|---|
| Monorepo scaffold | `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json` | ✅ |
| @zipy/core | `packages/core/src/schemas/` | ✅ Esquema de archivos |
| @zipy/firebase | `packages/firebase/src/` | ✅ Esquema de archivos |
| @zipy/ui | `packages/ui/src/` | ✅ Esquema de archivos |
| customer-web | `apps/customer/` (scaffold + Tailwind + PWA) | ✅ Build exitoso |
| merchant-web | `apps/merchant/` (scaffold) | 🟡 Esqueleto |
| driver-web | `apps/driver/` (scaffold) | 🟡 Esqueleto |
| admin-web | `apps/admin/` (scaffold) | 🟡 Esqueleto |
| CI/CD | `.github/workflows/` (4 workflows) | ✅ |
| Issue/PR templates | `.github/` (3 archivos) | ✅ |
| Release checklist | `scripts/release-check.sh` | ✅ |
| Seed scripts | `seed/scripts/` (2 scripts + config JSON) | ✅ |
| Demo accounts | `seed/demo-accounts.md` | ✅ |

---

## 8. Pendientes para Producción

### Antes del MVP (prioridad alta)

- [ ] **Diseño visual:** Paleta de colores, tipografía, logo, iconos. Actualmente solo Tailwind defaults.
- [ ] **Implementar merchant-web:** Dashboard de órdenes, catálogo, horarios, reportes.
- [ ] **Implementar driver-web:** Pantalla de tareas, navegación, earnings. PWA.
- [ ] **Implementar admin-web:** Dashboard global, gestión de usuarios, auditoría.
- [ ] **Cloud Functions:** 5 funciones core (createOrder, paymentWebhook, assignDriver, settlePayout, auditLogger).
- [ ] **Firestore rules completas:** Actualmente solo diseño conceptual.
- [ ] **Firestore indexes:** Agregar índices compuestos según queries reales.
- [ ] **Stripe Connect:** Configurar onboarding de merchants, split payments.
- [ ] **Google Maps API:** API key con restricciones.
- [ ] **Pruebas:** Unit tests (Vitest) + E2E (Playwright) para flujo crítico (order→pay→assign→delivery).
- [ ] **Figma o diseño visual** de las 4 apps antes de implementar componentes finales.

### Antes del lanzamiento (prioridad media)

- [ ] **Monitoreo:** OpenTelemetry o Sentry para errores del lado del cliente.
- [ ] **Logging estructurado:** Cloud Logging para funciones.
- [ ] **Rate limiting real:** Firestore counter por usuario + alertas.
- [ ] **Carga de imágenes:** Servicio de resize para fotos de productos.
- [ ] **SEO:** metadata, sitemap, robots.txt.
- [ ] **Analytics:** Google Analytics 4 + eventos de conversión.
- [ ] **Privacidad:** Aviso de privacidad, términos y condiciones.
- [ ] **Dominios personalizados:** Configurar DNS para cada app.

### Post-MVP (prioridad baja)

- [ ] **App nativa (Flutter/RN):** Driver-app primero (GPS background más confiable).
- [ ] **WhatsApp notifications:** Twilio API para confirmaciones.
- [ ] **Chat en vivo:** Customer ↔ Driver.
- [ ] **Sistema de reseñas:** Calificación + foto de producto recibido.
- [ ] **Recomendaciones:** ML básico (más vendidos, también vieron).
- [ ] **Multi-idioma:** i18n con next-intl.

---

## 9. Riesgos Conocidos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| **Firestore cuota gratuita insuficiente** | Alta (>100k órdenes/mes) | Costos | Migrar a Blaze. El costo de Firestore es bajo ($0.06/100k reads). |
| **GPS del driver no preciso en zona urbana** | Media | Órdenes mal asignadas | Usar Google Maps Road API para snap-to-road. |
| **Stripe Connect onboarding rejection** | Media | Merchant no puede recibir pagos | Stripe verifica identidad. Tener plan B: transferencia manual semanal. |
| **Firebase Auth limit a 50k MAU** | Baja (<6 meses) | Migración | Plan Blaze es $25/mes, Auth sigue siendo gratis hasta 50k. |
| **Cloud Functions timeout (9min)** | Baja | Pagos fallan | Stripe webhook es asíncrono. La función solo confirma el webhook. |
| **Firestore write limit por doc (1/s)** | Baja | Location del driver desactualizada | Batch writes cada 3-5s es suficiente para GPS. |
| **Regulación mexicana (CFDI)** | Media | Multas | Facturación requiere PAC (ej: Facturapi). Agregar después del MVP. |

---

## 10. Usuarios Demo

| Rol | Email | Password | App |
|---|---|---|---|
| Customer | `cliente@zipy.demo` | `Demo123!` | customer-web |
| Merchant Owner | `dueno@zipy.demo` | `Demo123!` | merchant-web |
| Driver | `repartidor@zipy.demo` | `Demo123!` | driver-web |
| Admin | `admin@zipy.demo` | `Admin123!` | admin-web |

**Datos precargados:** 1 merchant (Tacos El Vaquero), 2 categorías, 5 productos, 1 driver (Italika 150cc), 2 direcciones del customer, 2 cupones.

> ⚠️ Solo para desarrollo local con Firebase Emulator.

---

## 11. Pasos para Levantar el Proyecto

### Requisitos

- Node.js 22+
- pnpm 10+
- Java 17+ (para Firebase Emulator)
- Git

### Instalación

```bash
# 1. Clonar
git clone <repo-url>
cd zipy

# 2. Instalar dependencias
pnpm install

# 3. Copiar y configurar variables
cp .env.example .env.local
# Editar .env.local con credenciales de Firebase de desarrollo

# 4. Iniciar Firebase Emulator
pnpm --filter @zipy/functions emulators  &
# o: cd functions && npx firebase emulators:start --project=zipy-dev

# 5. Cargar datos demo (en otra terminal)
pnpm seed

# 6. Iniciar customer-web en dev
pnpm --filter @zipy/customer-web dev
# Abrir http://localhost:3000
```

---

## 12. Pasos para Desplegar

### Primera vez (configuración única)

```bash
# 1. Crear proyecto Firebase en consola
#    - Habilitar Auth (email/password + Google)
#    - Crear Firestore database (modo nativo, us-central1)
#    - Habilitar Storage

# 2. Configurar Vercel (4 proyectos, uno por app)
#    - Importar repo en Vercel
#    - Root directory: apps/customer (repetir para cada app)
#    - Framework: Next.js
#    - Build command: cd ../.. && pnpm build --filter @zipy/customer-web
#    - Output directory: .next

# 3. Configurar GitHub Secrets
#    gh secret set VERCEL_TOKEN <token>
#    gh secret set VERCEL_ORG_ID <id>
#    gh secret set VERCEL_CUSTOMER_PROJECT_ID <id>
#    gh secret set VERCEL_MERCHANT_PROJECT_ID <id>
#    gh secret set VERCEL_DRIVER_PROJECT_ID <id>
#    gh secret set VERCEL_ADMIN_PROJECT_ID <id>
#    gh secret set FIREBASE_TOKEN <token>

# 4. Configurar dominios en Vercel
#    - zipy.app → customer-web
#    - merchant.zipy.app → merchant-web
#    - driver.zipy.app → driver-web
#    - admin.zipy.app → admin-web
```

### Deploy diario

```bash
# 1. Crear PR de develop a main
# 2. GitHub Actions corre: CI → Preview → Security
# 3. Aprobar PR
# 4. Merge a main → GitHub Actions corre CD (deploy a Vercel + Functions)
# 5. Verificar en producción
```

---

## 13. Vercel Labs — Skills Usadas y Recomendadas

### Skills implementadas en esta etapa

| Skill | Propósito |
|---|---|
| **Vercel CLI** (`vercel`) | Deploys desde CI y local. Instalado como devDependency global. |
| **amondnet/vercel-action** | GitHub Action para deploy Vercel desde workflows. |

### Skills recomendadas (no implementadas aún, post-MVP)

| Skill | Cuándo agregar |
|---|---|
| **Vercel Edge Config** | Para feature flags sin redeploy (post-MVP). |
| **Vercel Web Analytics** | Cuando tengamos >100 usuarios activos. |
| **Vercel Speed Insights** | Con Web Analytics. |
| **ISR (Incremental Static Regeneration)** | Para landing pages de merchants (cuando haya >50 merchants). |
| **Vercel Cron Jobs** | Para tareas programadas (ej: payout semanal a drivers). Actualmente las hacemos con Cloud Functions + PubSub. |
| **Vercel KV (Redis)** | Si necesitamos caché para catálogos (actualmente Firestore cache local es suficiente). |
| **Vercel Postgres + Drizzle** | Solo si necesitamos queries SQL complejas de reporting. No para MVP. |

---

## 14. Checklist Final de Validación

### Antes del primer commit

- [ ] `.env.example` no contiene secretos reales
- [ ] `firebase-admin-key.json` está en `.gitignore`
- [ ] `pnpm-lock.yaml` versionado
- [ ] `pnpm build` para customer-web pasa

### Antes de mergear a develop

- [ ] Código en rama feature
- [ ] PR template completado
- [ ] CI pasa (lint + typecheck + test + build)
- [ ] Preview deploy funcional
- [ ] Probado con Firebase Emulator + seed

### Antes de mergear a main

- [ ] Release check script pasa (`bash scripts/release-check.sh`)
- [ ] Changelog actualizado (opcional, post MVP)
- [ ] Version bump en `package.json`
- [ ] Firestore rules + indexes deployados
- [ ] Variables de entorno en GitHub Secrets

### Antes del lanzamiento público

- [ ] Google Maps API key restringida por HTTP referrer
- [ ] Stripe Connect configurado (merchant onboarding)
- [ ] Firestore en modo nativo (no test)
- [ ] Plan Blaze activo (no Spark)
- [ ] Dominios configurados en Vercel
- [ ] SSL habilitado (Vercel lo maneja automático)
- [ ] Robots.txt deshabilitando crawlers en preview
- [ ] Aviso de privacidad publicado
- [ ] Pruebas E2E pasan en producción
- [ ] Monitoreo configurado (Sentry opcional)
- [ ] Backup automático de Firestore configurado

---

## Resumen de archivos entregados en Etapa 12

```
.github/
├── workflows/
│   ├── ci.yml            # Lint + typecheck + test + build por app
│   ├── cd.yml            # Deploy 4 apps a Vercel + Functions
│   ├── preview.yml       # Preview deploy por PR
│   └── security.yml      # Audit semanal + secret scan
├── ISSUE_TEMPLATE/
│   ├── bug.yml
│   └── feature.yml
└── pull_request_template.md

scripts/
└── release-check.sh       # Validación pre-release

# + este reporte: REPORTE-FINAL.md
```

---

*Fin del reporte. Zipy está listo para la fase de implementación.*
