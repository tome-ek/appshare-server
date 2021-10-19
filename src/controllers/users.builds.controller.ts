import { Router } from 'express';
import { Authorization } from '../middleware/authorization.middleware';
import { param, query } from 'express-validator';
import { validate } from '../middleware/validate.middleware';
import { UsersBuildsRepository } from '../repositories/users.builds.repository';
import { parseFilters } from '../middleware/parseFilters.middleware';

const usersBuildsController = (
  usersBuildsRepository: UsersBuildsRepository,
  authorize: Authorization
): Router => {
  const router = Router();

  /**
   * GET /users/:userId/builds
   * @tags Builds
   * @param {integer} userId.params - Id of the user
   * @param {string} sort.query - enum:createdAt,-createdAt - Sort by creation date ascending / descending
   * @security Jwt
   * @summary Returns all builds associated with the user.
   * @return {array<Build>} 200 - Success response - application/json
   */
  router.get(
    '/:userId/builds',
    authorize('jwt'),
    param('userId').isInt({ min: 1 }),
    query('sort').isString().isIn(['createdAt', '-createdAt']).optional(true),
    validate,
    parseFilters,
    async (req, res) => {
      res.json(
        await usersBuildsRepository.getBuilds(Number(req.params.userId), {
          sort: req.query.sort as [string, string],
        })
      );
    }
  );

  return router;
};

export default usersBuildsController;
