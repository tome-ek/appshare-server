import Boom from '@hapi/boom';
import App from '../models/app.model';
import User from '../models/user.model';
import jwt from 'jsonwebtoken';
import { promisify } from 'bluebird';
import { nanoid } from 'nanoid';
import ShareLink from '../models/shareLink.model';
import ms from 'ms';

export interface UserAppShareLinkRepository {
  createShareLink: (
    userId: number,
    appId: number,
    shareLinkJson: any
  ) => Promise<object>;
}

const userAppShareLinkRepository = (): UserAppShareLinkRepository => {
  return {
    createShareLink: async (userId, appId, shareLinkJson) => {
      const user = await User.findByPk(userId);
      const app = await App.findByPk(appId);
      if (!user || !app) {
        throw Boom.badRequest;
      }
      const expiresAt: string = shareLinkJson.expiresAt;
      const tokenId = nanoid(6);
      const token = await promisify<
        string,
        object,
        jwt.Secret,
        jwt.SignOptions
      >(jwt.sign)(
        {
          tid: tokenId,
        },
        process.env.SHARE_LINK_JWT_SECRET!,
        {
          expiresIn: expiresAt,
          algorithm: 'HS256',
        }
      );

      const shareLink = await ShareLink.create({
        token,
        tokenId,
        userId,
        appId,
        shareUrl: 'http://localhost:3001/app?sid=' + token,
        ...shareLinkJson,
        expiresAt: new Date(Date.now() + ms(expiresAt)),
      });

      await app.addShareLink(shareLink);
      await user.addShareLink(shareLink);
      return shareLink.toJSON();
    },
  };
};

export default userAppShareLinkRepository;
