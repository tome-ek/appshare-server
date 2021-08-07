import { Request, Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { UserAppRepository } from '../repositories/user.app.repository';
import { FilesService } from '../services/files.service';
import { CloudStorageService } from '../services/cloudStorage.service';
import uploadStorage from '../infra/multer';
import { nanoid } from 'nanoid';

import del from 'del';
import { EncryptionService } from '../services/encryption.service';

const DefaultIconUrl =
  'https://storage.googleapis.com/phone-streamer.appspot.com/images/default.png';

const userAppController = (
  userAppRepository: UserAppRepository,
  filesService: FilesService,
  encryptionService: EncryptionService,
  cloudStorageService: CloudStorageService
) => {
  const router = Router();
  router
    .get('/:id/apps', verifyToken, async (req: Request, res) => {
      res.json(await userAppRepository.getApps(Number(req.params.id)));
    })
    .post(
      '/:id/apps',
      verifyToken,
      uploadStorage.single('app'),
      async (req, res) => {
        const dirName = nanoid();
        const paths = await filesService.unzipAppBundle(
          req.file?.path!,
          dirName
        );
        const plist = await filesService.readPlist(paths);
        const iconUrl =
          (plist.app.iconName &&
            (await cloudStorageService.upload(
              paths.find(f => f.includes(plist.app.iconName!))!,
              `images/${plist.app.bundleIdentifier}.png`
            ))) ||
          DefaultIconUrl;

        const encryptionResult = await encryptionService.encryptFile(
          req.file?.path!
        );
        const bundleUrl = await cloudStorageService.upload(
          encryptionResult.encryptedFile,
          `bundles/${plist.app.bundleIdentifier}/${req.file?.filename}.enc`
        );
        await del([`./tmp/${dirName}`], { dryRun: false });
        await del([`./tmp/${req.file?.filename}`], { dryRun: false });
        await del([`./tmp/${req.file?.filename}.enc`], { dryRun: false });

        const json = await userAppRepository.createAppBuild(
          Number(req.params.id),
          {
            ...plist.app,
            iconUrl,
            builds: [
              {
                bundleUrl,
                iv: encryptionResult.iv,
                authTag: encryptionResult.authTag,
                ...plist.build,
              },
            ],
          }
        );
        res.json(json);
      }
    );

  return router;
};

export default userAppController;
