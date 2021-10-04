import { Router } from 'express';
import { body, param } from 'express-validator';
import { Authorization } from '../middleware/authorization.middleware';
import { validate } from '../middleware/validate.middleware';
import { AppAccessRepository } from '../repositories/appAccess.repository';

const appAccessesController = (
  appAccessRepository: AppAccessRepository,
  authorize: Authorization
): Router => {
  const router = Router();

  /**
   * @typedef {object} CreateAppAccessBody
   * @property {string} token.required - A token that is included in a share link associated with the accessed app
   * @property {string} password - Optional password required when a share link is protected with a password
   */

  /**
   * @typedef {object} CreateAppAccessResponse
   * @property {AppAccess} appAccess - Created app access
   * @property {string} token - Authorization token associated with this access
   */

  /**
   * POST /app-accesses
   * @tags App accesses
   * @summary Creates a new app access.
   * @security Jwt
   * @param {CreateAppAccessBody} request.body.required
   * @return {CreateAppAccessResponse} 201 - Success response - application/json
   */
  router.post(
    '/',
    authorize('jwt'),
    body('token').isString().escape().trim().notEmpty(),
    body('password').optional().isString().escape().trim().notEmpty(),
    validate,
    async (req, res) => {
      res.status(201).json(await appAccessRepository.createAppAccess(req.body));
    }
  );

  /**
   * @typedef {object} CreateAppAccessResponse
   * @property {AppAccess} appAccess - Created app access
   * @property {string} token - Authorization token associated with this access
   */

  /**
   * GET /app-accesses/:appAccessId/share-link/app
   * @tags App accesses
   * @summary Returns the app associated with the share link of the app access
   * @security AppAccess
   * @param {number} appAccessId.params - Id of the app access
   * @return {App} 200 - Success response - application/json
   */
  router.get(
    '/:appAccessId/share-link/app',
    param('appAccessId').isInt(),
    validate,
    authorize('appAccess'),

    async (req, res) => {
      res
        .status(200)
        .json(await appAccessRepository.getApp(Number(req.params.appAccessId)));
    }
  );

  return router;
};

export default appAccessesController;
