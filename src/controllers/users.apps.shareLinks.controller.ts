import { Router } from 'express';
import { body, param } from 'express-validator';
import { userOwns } from '../middleware/accessControll.middleware';
import { Authorization } from '../middleware/authorization.middleware';
import { validate } from '../middleware/validate.middleware';
import App from '../models/app.model';
import { UserAppShareLinkRepository } from '../repositories/user.app.shareLink.repository';

const usersAppsShareLinksController = (
  userAppShareLinkRepository: UserAppShareLinkRepository,
  authorize: Authorization
): Router => {
  const router = Router();

  /**
   * @typedef {object} CreateShareLinkBody
   * @property {string} expiresAt.required - Expiration date of the share link
   * @property {boolean} hasPassword.required - Is the share link protected by a password
   * @property {string} password - (Optional) Password for the share link
   */

  /**
   * POST /users/:userId/apps/:appId/share-links
   * @tags Share Links
   * @summary Creates a new share link for the app.
   * @security Jwt
   * @param {CreateShareLinkBody} request.body.required
   * @return {ShareLink} 201 - Success response - application/json
   */
  router.post(
    '/:userId/apps/:appId/share-links',
    authorize('jwt'),
    param('userId').isInt({ min: 1 }),
    param('appId').isInt({ min: 1 }),
    body('expiresAt').isString().escape().trim(),
    body('hasPassword').isBoolean().exists(),
    body('password').optional().isString().escape().trim().notEmpty(),
    validate,
    userOwns([App, 'appId']),
    async (req, res) => {
      res
        .status(201)
        .json(
          await userAppShareLinkRepository.createShareLink(
            Number(req.params.userId),
            Number(req.params.appId),
            req.body
          )
        );
    }
  );

  return router;
};

export default usersAppsShareLinksController;
