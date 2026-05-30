/**
 * clean.ts — Limpia todos los datos demo del emulador
 * Uso: FIRESTORE_EMULATOR_HOST=localhost:8080 npx tsx seed/scripts/clean.ts
 */

import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const FIRESTORE_HOST = process.env.FIRESTORE_EMULATOR_HOST;
const AUTH_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST;
if (!FIRESTORE_HOST || !AUTH_HOST) {
  console.error('Firebase Emulator no detectado. Abortando para evitar escritura en produccion.');
  process.exit(1);
}

const DEMO_EMAILS = [
  'cliente@zipy.demo',
  'dueno@zipy.demo',
  'repartidor@zipy.demo',
  'admin@zipy.demo',
];

// Subcolecciones conocidas para cada coleccion padre
const SUBCOLLECTIONS: Record<string, string[]> = {
  users: ['addresses', 'notifications', 'profile'],
  merchants: ['branches', 'staff', 'categories', 'products', 'reviews', 'payouts'],
  drivers: ['vehicles', 'tasks'],
};

async function deleteSubcollections(db: FirebaseFirestore.Firestore, col: string, docId: string) {
  const subs = SUBCOLLECTIONS[col] || [];
  for (const sub of subs) {
    const snap = await db.collection(col).doc(docId).collection(sub).get();
    if (snap.empty) continue;
    const batch = db.batch();
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    console.log(`      sub ${col}/${docId}/${sub}: ${snap.size} docs`);
  }
}

async function clean() {
  console.log('Limpiando datos demo...\n');

  const app = initializeApp({ projectId: 'zipy-dev' });
  const auth = getAuth(app);
  const db = getFirestore(app);

  // 1. Eliminar subcolecciones y docs de Firestore
  const collections = ['users', 'merchants', 'drivers', 'orders', 'payments', 'coupons', 'zones', 'auditLogs', '_featureFlags', '_idempotency'];

  for (const colName of collections) {
    const snapshot = await db.collection(colName).get();
    if (snapshot.empty) {
      console.log(`   ${colName}: vacio`);
      continue;
    }

    // Borrar subcolecciones primero
    for (const doc of snapshot.docs) {
      await deleteSubcollections(db, colName, doc.id);
    }

    // Luego borrar documentos padre
    const batch = db.batch();
    let count = 0;
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      count++;
    });
    await batch.commit();
    console.log(`   ${colName}: ${count} docs + subcolecciones eliminados`);
  }

  // 2. Eliminar usuarios de Auth
  console.log('\nEliminando usuarios de Auth...');
  for (const email of DEMO_EMAILS) {
    try {
      const user = await auth.getUserByEmail(email);
      await auth.deleteUser(user.uid);
      console.log(`   Eliminado: ${email}`);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        console.log(`   No existe: ${email}`);
      } else {
        console.error(`   Error con ${email}:`, err.message);
      }
    }
  }

  console.log('\nLimpieza completa.');
}

clean().catch(console.error);
