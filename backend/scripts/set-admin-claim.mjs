import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdminApp } from './firebaseAdmin.mjs';

const email = process.argv[2]?.trim().toLowerCase();
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Uso: npm run set-admin -- correo@dominio.com');
  process.exitCode = 1;
} else {
  const auth = getAuth(getFirebaseAdminApp());
  const user = await auth.getUserByEmail(email);
  if (!user.emailVerified) {
    throw new Error('La cuenta debe tener el correo verificado antes de asignar el rol de administrador.');
  }
  await auth.setCustomUserClaims(user.uid, { ...user.customClaims, admin: true });
  console.log(`Permisos de administrador asignados a ${email}. La persona debe volver a iniciar sesión.`);
}
