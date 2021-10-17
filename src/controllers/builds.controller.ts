import { Request, Router } from 'express';
import { param } from 'express-validator';
import { Authorization } from '../middleware/authorization.middleware';
import { validate } from '../middleware/validate.middleware';
import { BuildRepository } from '../repositories/build.repository';
import { Bucket } from '@google-cloud/storage';

const buildsController = (
  buildRepository: BuildRepository,
  bucket: Bucket,
  authorize: Authorization
): Router => {
  const router = Router();

  /**
   * GET /builds/:buildId
   * @tags Builds
   * @summary Returns the requested build
   * @security Jwt | ApiKey
   * @param {number} buildId.params - Id of the build
   * @return {Build} 200 - Success response - application/json
   */
  router.get(
    '/:buildId',
    param('buildId').isInt({ min: 1 }),
    validate,
    authorize('apiKey', 'jwt'),
    async (req: Request, res) => {
      res.json(
        await buildRepository.getBuild(
          Number(req.params.buildId),
          Number(req.params._userId)
        )
      );
    }
  );

  /**
   * DELETE /builds/:buildId
   * @tags Builds
   * @summary Deletes the requested build
   * @security Jwt
   * @param {number} buildId.params - Id of the build
   * @return {Build} 204 - Success response - plain/text
   */
  router.delete(
    '/:buildId',
    param('buildId').isInt({ min: 1 }),
    validate,
    authorize('jwt'),
    async (req: Request, res) => {
      const deletedBuild = await buildRepository.deleteBuild(
        Number(req.params.buildId),
        Number(req.params._userId)
      );


      await bucket.deleteFiles({
        prefix: `bundles/${deletedBuild.bundleIdentifier}/${deletedBuild.fileName}`,
      });

      res.sendStatus(204);
    }
  );

  return router;
};

export default buildsController;
