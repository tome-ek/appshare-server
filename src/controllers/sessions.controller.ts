import { Request, Router } from 'express';
import { body } from 'express-validator';
import { Authorization } from '../middleware/authorization.middleware';
import { validate } from '../middleware/validate.middleware';

import { SessionRepository } from '../repositories/session.repository';

const sessionsController = (
  sessionRepository: SessionRepository,
  authorize: Authorization
): Router => {
  const router = Router();

  /**
   * @typedef {object} CreateSessionBody
   * @property {number} buildId.required - Id of the build to use for this session
   * @property {number} appId.required - Id of the app to use for this session
   * @property {number} deviceId.required - Id of the device to simulate for this session
   */

  /**
   * POST /sessions
   * @tags Sessions
   * @summary Creates a new session.
   * @param {CreateSessionBody} request.body.required
   * @return {Session} 201 - Success response - application/json
   */
  router.post(
    '/',
    authorize('jwt', 'appAccess'),
    body('buildId').isInt({ min: 1 }),
    body('appId').isInt({ min: 1 }),
    body('deviceId').isInt({ min: 1 }),
    validate,
    async (req: Request, res) => {
      res
        .status(201)
        .json(
          await sessionRepository.createSession(
            req.body,
            Number(req.params._userId)
          )
        );
    }
  );

  return router;
};

export default sessionsController;
