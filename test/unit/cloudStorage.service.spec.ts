import 'mocha';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import { Bucket } from '@google-cloud/storage';
import { stubInterface } from 'ts-sinon';
import { fail } from 'assert';

import cloudStorageService from '../../src/services/cloudStorage.service';
import {
  UploadFilePathNotFound,
  UploadFileUndefinedDestination,
} from '../../src/resources/errorMessages.strings';

chai.use(sinonChai);

describe('CloudStorageService', () => {
  describe('upload', () => {
    it('should upload a file and resolve with remote url', async () => {
      // Arrange
      let bucket = stubInterface<Bucket>();

      // @ts-ignore
      bucket.upload.callsFake((_path, _options, callback) => {
        const metadata = {
          bucket: 'bucket',
          name: 'filename',
        };
        callback(undefined, undefined, metadata);
      });

      const service = cloudStorageService(bucket);

      // Act
      const url = await service.upload('./path/to/file', 'remote/destination');

      // Assert
      expect(url).to.be.equal(`https://storage.googleapis.com/bucket/filename`);
    });

    it('should throw error when no file path is provided', async () => {
      // Arrange
      let bucket = stubInterface<Bucket>();

      const service = cloudStorageService(bucket);

      // Act
      try {
        await service.upload();
        fail();
      } catch (error) {
        // Assert
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.be.equal(UploadFilePathNotFound);
      }
    });

    it('should throw error when no remote path is provided', async () => {
      // Arrange
      let bucket = stubInterface<Bucket>();

      const service = cloudStorageService(bucket);

      // Act
      try {
        await service.upload('./path/to/file');
        fail();
      } catch (error) {
        // Assert
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.be.equal(UploadFileUndefinedDestination);
      }
    });

    it('should throw error when uploading fails', async () => {
      // Arrange
      let bucket = stubInterface<Bucket>();
      // @ts-ignore
      bucket.upload.callsFake((_path, _options, callback) => {
        callback(new Error('Upload failed.'), undefined, undefined);
      });

      const service = cloudStorageService(bucket);

      // Act
      try {
        await service.upload('./path/to/file', 'remote/path');
        fail();
      } catch (error) {
        // Assert
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.be.equal('Upload failed.');
      }
    });
  });
});
