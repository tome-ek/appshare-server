import 'mocha';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import { stubInterface } from 'ts-sinon';
import * as decompress from 'decompress';

import filesService from '../../src/services/files.service';
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

describe('FilesService', () => {
  describe('unzipAppBundle', () => {
    it('should unzip the app bundle and return its Info.plist and icons', async () => {
      // Arrange
      const outputDirectory = 'directoryName';
      const expectedFilePaths = [
        `/tmp/${outputDirectory}/Appshare.app/Info.plist`,
        `/tmp/${outputDirectory}/Appshare.app/Icon1.png`,
        `/tmp/${outputDirectory}/Appshare.app/Icon2.png`,
      ];

      const unzippedFilesPaths = [
        'Appshare.app/Info.plist',
        'Appshare.app/main.exe',
        'Appshare.app/Icon1.png',
        'Appshare.app/Icon2.png',
        'Appshare.app/Dependency/Info.plist',
        'Appshare.app/Dependency/DependencyIcon.png',
      ];

      const unzippedFiles: decompress.File[] = unzippedFilesPaths.map(
        (path) => ({
          ...stubInterface<decompress.File>(),
          path,
        })
      );

      let decompress: DecompressionFunctionStub = stub();
      decompress.callsFake((_zipFilePath, _outputDirectory, options) => {
        return Promise.resolve(
          unzippedFiles.filter((file) => options.filter(file))
        );
      });

      const service = filesService(decompress);

      // Act
      const unzippedFilePaths = await service.unzipAppBundle(
        './path/to/zipFile',
        outputDirectory
      );

      // // Assert
      expect(unzippedFilePaths).to.be.deep.equal(expectedFilePaths);
    });
  });
  describe('readPlist', () => {
    it('should correctly parse Info.plist file', async () => {
      // Arrange
      const expectedPlistData = {
        app: {
          name: 'Appshare',
          bundleIdentifier: 'com.appshare.Appshare',
          iconName: 'AppIcon60x60',
        },
        build: {
          version: '1.0',
          buildNumber: '1',
          bundleName: 'Appshare',
        },
      };

      let decompress: DecompressionFunctionStub = stub();
      const service = filesService(decompress);

      // Act
      const plistData = await service.readPlist(['./test/fixtures/Info.plist']);

      // // Assert
      expect(plistData).to.be.deep.equal(expectedPlistData);
    });
  });
});
