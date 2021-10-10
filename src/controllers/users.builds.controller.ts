import { Router } from 'express';
import { Authorization } from '../middleware/authorization.middleware';
import { param } from 'express-validator';
import { validate } from '../middleware/validate.middleware';
import { UsersBuildsRepository } from '../repositories/users.builds.repository';

const usersBuildsController = (
  usersBuildsRepository: UsersBuildsRepository,
  authorize: Authorization
): Router => {
  const router = Router();

  /**
   * GET /users/:userId/builds
   * @tags Builds
   * @param {number} userId.params - Id of the user
   * @security Jwt
   * @summary Returns all builds associated with the user.
   * @return {array<Build>} 200 - Success response - application/json
   */
  router.get(
    '/:userId/builds',
    authorize('jwt'),
    param('userId').isInt({ min: 1 }),
    validate,
    async (req, res) => {
      res.json(
        await usersBuildsRepository.getBuilds(Number(req.params.userId))
      );
    }
  );

  return router;
};

export default usersBuildsController;
