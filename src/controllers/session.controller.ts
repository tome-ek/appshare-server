import { Router } from 'express';
import { verifyAnyToken } from '../middleware/auth.any';
import { verifySessionAuthorization } from '../middleware/auth.sessions.middleware';
import { SessionRepository } from '../repositories/session.repository';

const sessionController = (sessionRepository: SessionRepository) => {
  const router = Router();
  router
    .post('/', verifyAnyToken, async (req, res) => {
      res
        .status(201)
        .json(
          await sessionRepository.createSession(
            req.body,
            Number(req.params.userId)
          )
        );
    })
    .get('/', verifySessionAuthorization, async (_req, res) => {
      res.json(await sessionRepository.getSessions());
    });
  return router;
};

export default sessionController;
