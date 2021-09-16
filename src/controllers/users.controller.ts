import { Router } from 'express';
import { Authorization } from '../middleware/authorization.middleware';
import { UserRepository } from '../repositories/user.repository';

const usersController = (
  userRepository: UserRepository,
  authorize: Authorization
): Router => {
  const router = Router();

  /**
   * GET /users/me
   * @tags Users
   * @summary Returns the user associated with the authorization token
   * @return {User} 200 - Success response - application/json
   */
  router.get('/me', authorize('jwt'), async (req, res) => {
    res.json(await userRepository.getCurrentUser(Number(req.params._userId)));
  });

  return router;
};

export default usersController;
