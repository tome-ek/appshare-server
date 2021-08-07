import admin from 'firebase-admin';
export default function () {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIR_PROJECT_ID,
      clientEmail: process.env.FIR_CLIENT_EMAIL,
      privateKey: process.env.FIR_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.FIRE_STORAGE_BUCKET,
  });
}
