# Zipy — Cuentas Demo

> Entorno: Firebase Emulator
> Todas las contrasenas usan `!` como caracter especial requerido por Firebase Auth.

---

## 1. Customer

| Campo      | Valor                        |
|------------|------------------------------|
| **Nombre** | Juan Perez Garcia            |
| **Email**  | `cliente@zipy.demo`          |
| **Pass**   | `Demo123!`                   |
| **Rol**    | customer                     |
| **App**    | customer-web (zipy.app)      |

**Precargado:** 2 direcciones (Casa, Oficina)

---

## 2. Merchant Owner

| Campo      | Valor                            |
|------------|----------------------------------|
| **Nombre** | Maria Garcia Lopez               |
| **Email**  | `dueno@zipy.demo`                |
| **Pass**   | `Demo123!`                       |
| **Rol**    | merchant (Tacos El Vaquero)      |
| **App**    | merchant-web (merchant.zipy.app) |

---

## 3. Driver

| Campo      | Valor                             |
|------------|-----------------------------------|
| **Nombre** | Carlos Martinez Hernandez          |
| **Email**  | `repartidor@zipy.demo`            |
| **Pass**   | `Demo123!`                        |
| **Rol**    | driver                            |
| **App**    | driver-web (driver.zipy.app)      |
| **Vehiculo**| Italika Moto 150cc, rojo          |

---

## 4. Admin

| Campo      | Valor                          |
|------------|--------------------------------|
| **Nombre** | Admin Zipy Demo                |
| **Email**  | `admin@zipy.demo`              |
| **Pass**   | `Admin123!`                    |
| **Rol**    | admin (superadmin)             |
| **App**    | admin-web (admin.zipy.app)     |

**Nota:** Puede gestionar otros admins y modificar tarifas.

---

## Comandos

```bash
# Iniciar emuladores
pnpm emulators

# Cargar seed (en otra terminal)
pnpm seed

# Limpiar y recargar
pnpm seed:reset
```
