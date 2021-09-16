import Boom from '@hapi/boom';
import { ShareLinkDto } from '../dtos/ShareLinkDto';
import { ShareLinkModel } from '../models/shareLink.model';

export interface ShareLinkRepository {
  getShareLinkByTokenId: (tokenId: string) => Promise<ShareLinkDto>;
}

const shareLinkRepository = (
  ShareLink: ShareLinkModel
): ShareLinkRepository => {
  return {
    getShareLinkByTokenId: async (tokenId) => {
      const shareLink = await ShareLink.findOne({
        where: { tokenId },
        attributes: ['hasPassword'],
      });

      if (!shareLink) throw Boom.notFound();

      return <ShareLinkDto>shareLink.toJSON();
    },
  };
};

export default shareLinkRepository;
