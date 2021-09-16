import 'mocha';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import { stubInterface } from 'ts-sinon';
import del from 'del';
import * as decompress from 'decompress';
import * as fs from 'fs';
import encryptionService from '../../src/services/encryption.service';
import { SinonStub, stub } from 'sinon';

chai.use(sinonChai);

type DecompressionFunctionStub = SinonStub<
  [
    zipFilePath: string | Buffer,
    outputDirectory: string | decompress.DecompressOptions,
    options?: decompress.DecompressOptions
  ],
  Promise<decompress.File[]>
>;

describe('EncryptionService', () => {
  describe('encryptFile', () => {
    afterEach(async () => {
      await del('./test/fixtures/file.txt.enc');
    });

    it('should encrypt a file and save it on the disk with a .enc extension', async () => {
      // Arrange
      const inputFilePath = './test/fixtures/file.txt';

      const service = encryptionService();

      // Act
      await service.encryptFile(inputFilePath);

      // Assert
      expect(fs.existsSync(inputFilePath + '.enc')).to.be.true;
    });

    it('should return metadata used for encryption', async () => {
      // Arrange
      const inputFilePath = './test/fixtures/file.txt';

      const service = encryptionService();

      // Act
      const encryptionMetadata = await service.encryptFile(inputFilePath);

      // Assert
      expect(encryptionMetadata)
        .to.have.property('iv')
        .that.is.a('string')
        .of.length.at.least(12);

      expect(encryptionMetadata)
        .to.have.property('authTag')
        .that.is.a('string')
        .of.length.at.least(12);
    });
  });
});
