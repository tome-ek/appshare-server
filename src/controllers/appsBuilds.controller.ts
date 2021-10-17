import { Router } from 'express';
import { Authorization } from '../middleware/authorization.middleware';
import { param, query } from 'express-validator';
import { validate } from '../middleware/validate.middleware';
import { AppsBuildsRepository } from '../repositories/apps.builds.repository';
import { parseFilters } from '../middleware/parseFilters.middleware';
import { userOwns } from '../middleware/accessControll.middleware';
import App from '../models/app.model';

const appsBuildsController = (
  appsBuildsRepository: AppsBuildsRepository,
  authorize: Authorization
): Router => {
  const router = Router();

  /**
   * GET /apps/:appId/builds
   * @tags Builds
   * @param {number} appId.params - Id of the app
   * @security Jwt
   * @summary Returns all builds of the app.
   * @return {array<Build>} 200 - Success response - application/json
   */
  router.get(
    '/:appId/builds',
    authorize('jwt'),
    param('appId').isInt({ min: 1 }),
    validate,
    userOwns([App, 'appId']),
    query('sort').isString().isIn(['createdAt', '-createdAt']).optional(true),
    parseFilters,
    async (req, res) => {
      res.json(
        await appsBuildsRepository.getAppBuilds(Number(req.params.appId), {
          sort: req.query.sort as [string, string],
        })
      );
    }
  );

  return router;
};

export default appsBuildsController;
