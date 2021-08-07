import admin from 'firebase-admin';

export interface CloudStorageService {
  upload: (path: string, url: string) => Promise<string>;
}

const cloudStorageService = (): CloudStorageService => {
  const bucket = admin.storage().bucket();
  return {
    upload: (path, url) => {
      return new Promise((resolve, reject) => {
        bucket.upload(path, { destination: url }, (err, _file, metadata) => {
          if (err) reject(err);
          resolve(
            `https://storage.googleapis.com/${metadata.bucket}/${metadata.name}`
          );
        });
      });
    },
  };
};

export default cloudStorageService;
