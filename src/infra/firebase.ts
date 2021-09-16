import admin from 'firebase-admin';

export const createFirebaseApp = (): void => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const buffer = Buffer.from(process.env.FIR_PRIVATE_KEY!, 'base64');

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIR_PROJECT_ID,
      clientEmail: process.env.FIR_CLIENT_EMAIL,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      privateKey: buffer.toString('utf8').replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.FIR_STORAGE_BUCKET,
  });
};
