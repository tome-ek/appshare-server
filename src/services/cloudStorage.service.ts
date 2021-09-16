import { Bucket } from '@google-cloud/storage';
import * as ErrorMessage from '../resources/errorMessages.strings';

export interface CloudStorageService {
  upload: (localFilePath?: string, remotePath?: string) => Promise<string>;
}

const cloudStorageService = (bucket: Bucket): CloudStorageService => {
  return {
    upload: (localFilePath, remotePath) => {
      if (!localFilePath) {
        return Promise.reject(new Error(ErrorMessage.UploadFilePathNotFound));
      }

      if (!remotePath) {
        return Promise.reject(
          new Error(ErrorMessage.UploadFileUndefinedDestination)
        );
      }

      return new Promise((resolve, reject) => {
        bucket.upload(
          localFilePath,
          { destination: remotePath },
          (err, _file, metadata) => {
            if (err) reject(err);
            resolve(
              `https://storage.googleapis.com/${metadata.bucket}/${metadata.name}`
            );
          }
        );
      });
    },
  };
};

export default cloudStorageService;
