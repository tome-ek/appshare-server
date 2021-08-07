import { Router } from 'express';
import { verifyAppAccessToken } from '../middleware/auth.app-access.middleware';
import { AppAccessRepository } from '../repositories/appAccess.repository';

const appAccessController = (appAccessRepository: AppAccessRepository) => {
  const router = Router();
  router
    .post('/', async (req, res) => {
      res.status(201).json(await appAccessRepository.createAppAccess(req.body));
    })
    .get('/:id/share-link/app', verifyAppAccessToken, async (req, res) => {
      res
        .status(200)
        .json(await appAccessRepository.getApp(Number(req.params.id)));
    });
  return router;
};

export default appAccessController;
