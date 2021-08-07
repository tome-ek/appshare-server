import { Request, Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { UserRepository } from '../repositories/user.repository';

const userController = (userRepository: UserRepository) => {
  const router = Router();
  router
    .get('/me', verifyToken, async (req: Request, res) => {
      res.json(await userRepository.getCurrentUser(Number(req.params.userId)));
    })
    .delete('/:id', verifyToken, async (req: Request, res) => {
      res.json(await userRepository.getCurrentUser(Number(req.params.userId)));
    });
  return router;
};

export default userController;
