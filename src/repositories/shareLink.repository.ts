import Boom from '@hapi/boom';
import ShareLink from '../models/shareLink.model';

export interface ShareLinkRepository {
  getShareLinkByTokenId: (tokenId: string) => Promise<object>;
}

const shareLinkRepository = (): ShareLinkRepository => {
  return {
    getShareLinkByTokenId: async tokenId => {
      const shareLink = await ShareLink.findOne({
        where: { tokenId },
        attributes: ['hasPassword'],
      });

      if (!shareLink) throw Boom.notFound();
      return shareLink.toJSON();
    },
  };
};

export default shareLinkRepository;
