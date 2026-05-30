# Zipy — Cuentas Demo

## Requisitos

Antes de usar las cuentas demo:

1. Tener el Firebase Emulator corriendo:
   ```bash
   pnpm emulators
   ```

2. Tener los datos sembrados (en otra terminal):
   ```bash
   pnpm seed
   ```

3. Tener el customer-web corriendo:
   ```bash
   pnpm dev
   ```

4. Tener `NEXT_PUBLIC_USE_DEMO=true` en `.env.local` (o usar el valor por defecto del código)

---

## Cuentas Disponibles

### 1. Cliente (`customer`)
| Campo | Valor |
|-------|-------|
| Email | `cliente@zipy.demo` |
| Contraseña | `Demo123!` |
| Nombre | Juan Perez Garcia |
| Rol | `customer` |

**Qué puede probar:**
- Iniciar sesión
- Ver catálogo de productos (cuando se implemente)
- Crear órdenes (cuando se implemente)

### 2. Dueño de Tienda (`merchant`)
| Campo | Valor |
|-------|-------|
| Email | `dueno@zipy.demo` |
| Contraseña | `Demo123!` |
| Nombre | Maria Garcia Lopez |
| Rol | `merchant` |
| Merchant ID | `merchant-demo-1` |

**Qué puede probar:**
- Iniciar sesión
- Ver órdenes entrantes (cuando se implemente)
- Gestionar productos (cuando se implemente)

### 3. Repartidor (`driver`)
| Campo | Valor |
|-------|-------|
| Email | `repartidor@zipy.demo` |
| Contraseña | `Demo123!` |
| Nombre | Carlos Martinez Hernandez |
| Rol | `driver` |

**Qué puede probar:**
- Iniciar sesión
- Ver órdenes asignadas (cuando se implemente)
- Marcar entregas (cuando se implemente)

### 4. Admin
| Campo | Valor |
|-------|-------|
| Email | `admin@zipy.demo` |
| Contraseña | `Admin123!` |
| Nombre | Admin Zipy Demo |
| Rol | `admin` |

**Qué puede probar:**
- Iniciar sesión
- Acceso total a Firestore según rules
- Gestionar merchants, drivers, cupones (cuando se implemente)

---

## Flujo de prueba completo

```bash
# Terminal 1: Emuladores
pnpm emulators

# Terminal 2: Seed + app
pnpm seed:reset   # limpia y recarga datos
pnpm dev          # inicia customer-web

# Abrir http://localhost:3000
# Hacer clic en "Iniciar sesión"
# Seleccionar una cuenta demo del panel verde
# Hacer clic en "Entrar"
```

## UIDs

Cada cuenta demo tiene un UID generado por Firebase Auth Emulator en el primer seed. El seed es idempotente: si la cuenta ya existe, reusa el UID existente y actualiza la contraseña.

---

## Notas técnicas

- Las `firestore.rules` leen el rol desde `users/{uid}.role`, no desde custom claims
- Los documentos `users/{uid}` se crean durante el seed con todos los campos necesarios
- El seed también crea custom claims (`role`) por compatibilidad futura
- El panel de cuentas demo SOLO aparece cuando `NEXT_PUBLIC_USE_DEMO=true`
- En producción, las cuentas demo no existen y el panel no se muestra
