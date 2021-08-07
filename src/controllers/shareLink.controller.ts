import { Request, Router } from 'express';
import { decodeShareLink } from '../middleware/auth.share-links.middleware';
import { ShareLinkRepository } from '../repositories/shareLink.repository';

const shareLinkController = (shareLinkRepository: ShareLinkRepository) => {
  const router = Router();
  router.get('/', decodeShareLink, async (req: Request, res) => {
    res.json(
      await shareLinkRepository.getShareLinkByTokenId(req.params.tokenId)
    );
  });
  return router;
};

export default shareLinkController;
