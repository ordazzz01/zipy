/**
 * seed.ts — Carga datos demo en Firebase Emulator
 * Uso: FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 npx tsx seed/scripts/seed.ts
 */

import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// ─── Guarda: emulador debe estar corriendo ────────────────────────
const AUTH_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const FIRESTORE_HOST = process.env.FIRESTORE_EMULATOR_HOST;
if (!AUTH_HOST || !FIRESTORE_HOST) {
  console.error('Firebase Emulator no detectado.');
  console.error('  Ejecuta primero: pnpm emulators');
  console.error('  o exporta las variables:');
  console.error('    FIREBASE_AUTH_EMULATOR_HOST=localhost:9099');
  console.error('    FIRESTORE_EMULATOR_HOST=localhost:8080');
  process.exit(1);
}

const DEMO_USERS = [
  { email: 'cliente@zipy.demo', password: 'Demo123!', displayName: 'Juan Perez Garcia', role: 'customer', phone: '+521811111111' },
  { email: 'dueno@zipy.demo', password: 'Demo123!', displayName: 'Maria Garcia Lopez', role: 'merchant', merchantId: 'merchant-demo-1', phone: '+521811111112' },
  { email: 'repartidor@zipy.demo', password: 'Demo123!', displayName: 'Carlos Martinez Hernandez', role: 'driver', phone: '+521811111113' },
  { email: 'admin@zipy.demo', password: 'Admin123!', displayName: 'Admin Zipy Demo', role: 'admin', phone: '+521811111114' },
];

async function seed() {
  console.log('Iniciando seed de datos demo...\n');

  const configPath = path.resolve(__dirname, '..', 'config');
  const merchants = JSON.parse(fs.readFileSync(path.join(configPath, 'merchants.json'), 'utf-8'));
  const products = JSON.parse(fs.readFileSync(path.join(configPath, 'products.json'), 'utf-8'));
  const coupons = JSON.parse(fs.readFileSync(path.join(configPath, 'coupons.json'), 'utf-8'));
  const addresses = JSON.parse(fs.readFileSync(path.join(configPath, 'addresses.json'), 'utf-8'));

  const app = initializeApp({ projectId: 'zipy-dev' });
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Validar que todos los precios sean enteros en centavos
  for (const mp of products) {
    for (const p of mp.products) {
      if (!Number.isInteger(p.price) || p.price < 0) {
        throw new Error(`Producto "${p.name}" tiene price invalido: ${p.price}. Los precios deben ser enteros en centavos.`);
      }
    }
  }

  // ─── 1. Crear usuarios + custom claims (idempotente) ──────
  console.log('Creando usuarios demo...');

  const uidByEmail: Record<string, string> = {};
  const uidByRole: Record<string, string> = {};

  for (const user of DEMO_USERS) {
    let uid: string;
    try {
      const record = await auth.createUser({
        email: user.email,
        password: user.password,
        displayName: user.displayName,
        phoneNumber: user.phone,
      });
      uid = record.uid;
    } catch (err: any) {
      if (err.code === 'auth/email-already-exists') {
        const existing = await auth.getUserByEmail(user.email);
        uid = existing.uid;
        await auth.updateUser(uid, { password: user.password });
        console.log(`   ↪ ${user.email} ya existe, reusando uid ${uid}`);
      } else {
        throw err;
      }
    }

    const claims: Record<string, string> = { role: user.role };
    if (user.merchantId) claims.merchantId = user.merchantId;
    await auth.setCustomUserClaims(uid, claims);

    uidByEmail[user.email] = uid;
    uidByRole[user.role] = uid;

    await db.collection('users').doc(uid).set({
      id: uid,
      email: user.email,
      phone: user.phone,
      displayName: user.displayName,
      role: user.role,
      isActive: true,
      locale: 'es-MX',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }, { merge: true });

    console.log(`   ${user.displayName.padEnd(27)} (${user.role.padEnd(10)}) → ${uid}`);
  }

  const driverUid = uidByRole['driver'];
  const customerUid = uidByRole['customer'];
  const merchantOwnerUid = uidByRole['merchant'];

  // ─── 2. Crear merchants ────────────────────────────────────
  console.log('\nCreando merchants demo...');

  for (const merchant of merchants) {
    merchant.ownerUid = merchantOwnerUid || '';
    await db.collection('merchants').doc(merchant.id).set({
      ...merchant,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    const branchId = `${merchant.id}-branch-1`;
    const mAddr = addresses[merchant.id] || { location: { lat: 19.4, lng: -99.16 } };
    await db.collection('merchants').doc(merchant.id).collection('branches').doc(branchId).set({
      id: branchId,
      merchantId: merchant.id,
      name: 'Sucursal Centro',
      address: {
        street: mAddr.street || 'Av. Principal',
        extNumber: mAddr.extNumber || '123',
        neighborhood: mAddr.neighborhood || 'Col. Centro',
        city: mAddr.city || 'Ciudad de Mexico',
        state: mAddr.state || 'CDMX',
        zipCode: mAddr.zipCode || '06000',
      },
      phone: merchant.phone,
      isOpen: true,
      openTime: merchant.openTime,
      closeTime: merchant.closeTime,
      preparationTimeMinutes: merchant.preparationTimeMinutes,
      deliveryRadiusKm: merchant.deliveryRadiusKm,
      location: mAddr.location,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log(`   ${merchant.businessAlias} (${merchant.id})`);
  }

  // ─── 3. Crear catalogo (categorias + productos) ────────────
  console.log('\nCreando catalogo demo...');

  for (const merchantProducts of products) {
    const mid = merchantProducts.merchantId;
    const categories = merchantProducts.categories || [];

    const seenCategories = new Set<string>();
    for (const product of merchantProducts.products) {
      if (!seenCategories.has(product.categoryId)) {
        seenCategories.add(product.categoryId);
        const catData = categories.find((c: any) => c.id === product.categoryId)
          || { id: product.categoryId, name: 'General', sortOrder: 0 };

        await db.collection('merchants').doc(mid).collection('categories').doc(product.categoryId).set({
          ...catData,
          merchantId: mid,
          isActive: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }
    }

    for (const product of merchantProducts.products) {
      await db.collection('merchants').doc(mid).collection('products').doc(product.id).set({
        ...product,
        merchantId: mid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log(`   ${product.name.padEnd(25)} $${(product.price / 100).toFixed(2)}`);
    }
  }

  // ─── 4. Crear driver profile + vehiculo ─────────────────────
  console.log('\nCreando driver demo...');

  if (driverUid) {
    const driverLocation = addresses['driver-1']?.location || { lat: 19.4194, lng: -99.1614 };

    await db.collection('drivers').doc(driverUid).set({
      uid: driverUid,
      displayName: 'Carlos Martinez Hernandez',
      phone: '+521811111113',
      photoURL: '/demo/drivers/default-avatar.png',
      vehicle: 'motorcycle',
      licensePlate: 'ABC-123',
      status: 'online',
      currentLocation: driverLocation,
      lastLocationUpdate: Timestamp.now(),
      totalDeliveries: 0,
      averageRating: 5.0,
      totalEarnings: 0,
      isVerified: true,
      isActive: true,
      coverageZoneIds: ['zone-centro'],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    await db.collection('drivers').doc(driverUid).collection('vehicles').doc('vehicle-1').set({
      id: 'vehicle-1',
      driverUid,
      type: 'motorcycle',
      brand: 'Italika',
      model: 'Moto 150cc',
      licensePlate: 'ABC-123',
      color: 'Rojo',
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log('   Carlos Martinez Hernandez (driver) + vehiculo Italika 150cc');
  }

  // ─── 5. Crear direcciones del customer ──────────────────────
  console.log('\nCreando direcciones demo...');

  if (customerUid) {
    const customerAddresses = addresses['customer-1'] || [];
    for (const addr of customerAddresses) {
      await db.collection('users').doc(customerUid).collection('addresses').doc(addr.id).set({
        ...addr,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log(`   ${addr.label}: ${addr.street} #${addr.extNumber}`);
    }
  }

  // ─── 6. Crear cupones ──────────────────────────────────────
  console.log('\nCreando cupones demo...');

  for (const coupon of coupons) {
    await db.collection('coupons').doc(coupon.id).set({
      ...coupon,
      startsAt: Timestamp.fromDate(new Date(coupon.startsAt)),
      expiresAt: Timestamp.fromDate(new Date(coupon.expiresAt)),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log(`   ${coupon.code.padEnd(15)} (${coupon.type})`);
  }

  console.log('\nSeed completado exitosamente.');
  console.log(`${DEMO_USERS.length} usuarios / ${merchants.length} merchants / ${products.flatMap((p: any) => p.products).length} productos / ${coupons.length} cupones`);
}

seed().catch(console.error);
