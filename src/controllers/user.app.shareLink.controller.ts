import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { UserAppShareLinkRepository } from '../repositories/user.app.shareLink.repository';

const userAppController = (
  userAppShareLinkRepository: UserAppShareLinkRepository
) => {
  const router = Router();
  router.post(
    '/:userId/apps/:appId/share-links',
    verifyToken,
    async (req, res) => {
      res.json(
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

export default userAppController;
