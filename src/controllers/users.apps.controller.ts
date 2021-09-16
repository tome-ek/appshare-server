import { Router } from 'express';
import { Authorization } from '../middleware/authorization.middleware';
import { UserAppRepository } from '../repositories/user.app.repository';
import { FilesService } from '../services/files.service';
import { CloudStorageService } from '../services/cloudStorage.service';
import { nanoid } from 'nanoid';
import { EncryptionService } from '../services/encryption.service';
import { singleFile } from '../infra/multer';
import del from 'del';
import Boom from '@hapi/boom';
import { param } from 'express-validator';
import { validate } from '../middleware/validate.middleware';

const DefaultIconUrl =
  'https://storage.googleapis.com/phone-streamer.appspot.com/images/default.png';

const usersAppsController = (
  userAppRepository: UserAppRepository,
  filesService: FilesService,
  encryptionService: EncryptionService,
  cloudStorageService: CloudStorageService,
  authorize: Authorization
): Router => {
  const router = Router();

  /**
   * GET /users/:userId/apps
   * @tags Users
   * @param {number} userId.params - Id of the user
   * @summary Returns all apps associated with the user.
   * @return {array<App>} 200 - Success response - application/json
   */
  router.get(
    '/:userId/apps',
    authorize('jwt'),
    param('userId').isInt({ min: 1 }),
    validate,
    async (req, res) => {
      res.json(await userAppRepository.getApps(Number(req.params.userId)));
    }
  );

  /**
   * POST /users/:userId/apps
   * @tags Apps
   * @param {file} app.form.required - The zipped build of the app - multipart/form-data
   * @summary Create a new app for the user.
   * @return {App} 201 - Success response - application/json
   */
  router.post(
    '/:userId/apps',
    authorize('jwt'),
    param('userId').isInt({ min: 1 }),
    validate,
    singleFile('app'),
    async (req, res, next) => {
      const zipFilePath = req.file?.path;
      if (!zipFilePath) {
        next(Boom.badRequest());
        return;
      }

      const dirName = nanoid();
      const paths = await filesService.unzipAppBundle(zipFilePath, dirName);
      const plist = await filesService.readPlist(paths);
      let iconUrl = DefaultIconUrl;

      const iconName = plist.app.iconName;
      if (iconName) {
        iconUrl = await cloudStorageService.upload(
          paths.find((file) => file.includes(iconName)),
          `images/${plist.app.bundleIdentifier}.png`
        );
      }

      const encryptionResult = await encryptionService.encryptFile(zipFilePath);

      const bundleUrl = await cloudStorageService.upload(
        encryptionResult.encryptedFile,
        `bundles/${plist.app.bundleIdentifier}/${req.file?.filename}.enc`
      );

      await del([`./storage/${dirName}`], { dryRun: false });
      await del([`./storage/${req.file?.filename}`], { dryRun: false });
      await del([`./storage/${req.file?.filename}.enc`], { dryRun: false });

      const json = await userAppRepository.createAppBuild(
        Number(req.params.userId),
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
      res.status(201).json(json);
    }
  );

  return router;
};

export default usersAppsController;
