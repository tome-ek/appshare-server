import { Request, Router } from 'express';
import { param } from 'express-validator';
import { userOwns } from '../middleware/accessControll.middleware';
import { Authorization } from '../middleware/authorization.middleware';
import { validate } from '../middleware/validate.middleware';
import App from '../models/app.model';
import { AppRepository } from '../repositories/app.repository';

const appsController = (
  appRepository: AppRepository,
  authorize: Authorization
): Router => {
  const router = Router();

  /**
   * GET /apps/:appId
   * @tags Apps
   * @summary Returns the requested app.
   * @security Jwt
   * @param {number} appId.params - Id of the app
   * @return {App} 200 - Success response - application/json
   */
  router.get(
    '/:appId',
    param('appId').isInt({ min: 1 }),
    validate,
    authorize('jwt'),
    userOwns([App, 'appId']),
    async (req: Request, res) => {
      res.json(await appRepository.getApp(Number(req.params.appId)));
    }
  );

  /**
   * DELETE /apps/:appId
   * @tags Apps
   * @summary Deletes the app and all associated build files.
   * @security Jwt
   * @param {number} appId.params - Id of the app
   * @return {string} 204 - Success response
   */
  router.delete(
    '/:appId',
    param('appId').isInt({ min: 1 }),
    validate,
    authorize('jwt'),
    userOwns([App, 'appId']),
    async (req: Request, res) => {
      await appRepository.deleteApp(Number(req.params.appId));
      res.sendStatus(204);
    }
  );

  return router;
};

export default appsController;
