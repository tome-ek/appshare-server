import { createSecretKey, randomBytes, createCipheriv } from 'crypto';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';

type EncryptionResult = {
  iv: string;
  authTag: string;
  encryptedFile: string;
};

export interface EncryptionService {
  encryptFile: (path: string) => Promise<EncryptionResult>;
}

const encryptionService = (): EncryptionService => {
  return {
    encryptFile: async path => {
      const key = createSecretKey(Buffer.from(process.env.AES_KEY!, 'hex'));
      const iv = randomBytes(12);
      const cipher = createCipheriv('aes-256-gcm', key, Buffer.from(iv));

      await promisify(pipeline)(
        createReadStream(path),
        cipher,
        createWriteStream(path + '.enc')
      );

      return {
        iv: iv.toString('base64'),
        authTag: cipher.getAuthTag().toString('base64'),
        encryptedFile: path + '.enc',
      };
    },
  };
};

export default encryptionService;
