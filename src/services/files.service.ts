import decompress from 'decompress';
import path from 'path';
import { promisify } from 'bluebird';
const plist = require('simple-plist');

type PlistData = {
  app: {
    name: string;
    bundleIdentifier: string;
    iconName?: string;
  };
  build: {
    version: string;
    buildNumber: string;
  };
};

type AppMetadata = {
  CFBundleName: string;
  CFBundleIdentifier: string;
  CFBundleIcons?: {
    CFBundlePrimaryIcon: {
      CFBundleIconFiles: string[];
      CFBundleIconName: string;
    };
  };
  CFBundleShortVersionString: string;
  CFBundleVersion: string;
};

export interface FilesService {
  unzipAppBundle: (path: string, dirName: string) => Promise<string[]>;
  readPlist: (paths: string[]) => Promise<PlistData>;
}

const filesService = (): FilesService => {
  return {
    unzipAppBundle: async (filePath, dirName) => {
      return (
        await decompress(filePath, `./tmp/${dirName}`, {
          filter: file => {
            return (
              (file.path.endsWith('Info.plist') ||
                path.extname(file.path) === '.png') &&
              file.path.split('/').length === 2
            );
          },
        })
      ).map(f => `./tmp/${dirName}/${f.path}`);
    },
    readPlist: async paths => {
      const appMetadata = await promisify<AppMetadata, string | undefined>(
        plist.readFile
      )(paths.find(f => path.basename(f, '.plist') === 'Info'));
      return {
        app: {
          name: appMetadata.CFBundleName,
          bundleIdentifier: appMetadata.CFBundleIdentifier,
          iconName:
            appMetadata.CFBundleIcons?.CFBundlePrimaryIcon.CFBundleIconFiles.pop(),
        },
        build: {
          version: appMetadata.CFBundleShortVersionString,
          buildNumber: appMetadata.CFBundleVersion,
        },
      };
    },
  };
};

export default filesService;
