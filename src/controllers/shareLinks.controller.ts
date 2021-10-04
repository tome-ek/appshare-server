import { Request, Router } from 'express';
import { Authorization } from '../middleware/authorization.middleware';
import { ShareLinkRepository } from '../repositories/shareLink.repository';

const shareLinksController = (
  shareLinkRepository: ShareLinkRepository,
  authorize: Authorization
): Router => {
  const router = Router();

  /**
   * GET /share-links
   * @tags Share Links
   * @summary Returns a share link associated with the share link token.
   * @security ShareLink
   * @return {ShareLink} 200 - Success response - application/json
   */
  router.get('/', authorize('shareLink'), async (req: Request, res) => {
    res.json(
      await shareLinkRepository.getShareLinkByTokenId(req.params._tokenId)
    );
  });

  return router;
};

export default shareLinksController;
