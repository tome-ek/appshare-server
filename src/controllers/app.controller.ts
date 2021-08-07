import { Request, Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { AppRepository } from '../repositories/app.repository';

const appController = (appRepository: AppRepository) => {
  const router = Router();
  router
    .get('/:id', verifyToken, async (req: Request, res) => {
      res.json(await appRepository.getApp(Number(req.params.id)));
    })
    .delete('/:id', verifyToken, async (req: Request, res) => {
      await appRepository.deleteApp(Number(req.params.id));
      res.status(200).json({ status: 200, message: 'OK.' });
    });
  return router;
};

export default appController;
