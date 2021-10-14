import Boom from '@hapi/boom';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import App from '../models/app.model';
import ShareLink from '../models/shareLink.model';
import User from '../models/user.model';
import { promisify } from 'bluebird';
import { nanoid } from 'nanoid';
import { ShareLinkDto } from '../dtos/ShareLinkDto';

type CreateShareLinkRequestBody = {
  readonly expiresAt: string;
  readonly hasPassword: boolean;
  readonly password?: string;
};

export interface UserAppShareLinkRepository {
  createShareLink: (
    userId: number,
    appId: number,
    jsonBody: CreateShareLinkRequestBody
  ) => Promise<ShareLinkDto>;
}

const userAppShareLinkRepository = (): UserAppShareLinkRepository => {
  const createShareLinkToken = async (
    tokenId: string,
    expiresAt: string
  ): Promise<string> => {
    if (!process.env.SHARE_LINK_JWT_SECRET) {
      throw Boom.badImplementation();
    }

    const token = await promisify<
      string,
      Record<string, unknown>,
      jwt.Secret,
      jwt.SignOptions
    >(jwt.sign)(
      {
        tid: tokenId,
      },
      process.env.SHARE_LINK_JWT_SECRET,
      {
        expiresIn: expiresAt,
        algorithm: 'HS256',
      }
    );

    return token;
  };

  return {
    createShareLink: async (userId, appId, shareLinkJson) => {
      const user = await User.findByPk(userId);
      const app = await App.findByPk(appId);

      if (!user || !app) {
        throw Boom.badRequest();
      }

      const tokenId = nanoid(6);
      const token = await createShareLinkToken(
        tokenId,
        shareLinkJson.expiresAt
      );

      const shareLink = await ShareLink.create({
        token,
        tokenId,
        userId,
        appId,
        shareUrl: 'http://localhost:3001/app?sid=' + token,
        ...shareLinkJson,
        expiresAt: new Date(Date.now() + ms(shareLinkJson.expiresAt)),
      });

      await app.addShareLink(shareLink.id);
      await user.addShareLink(shareLink.id);

      return <ShareLinkDto>shareLink.toJSON();
    },
  };
};

export default userAppShareLinkRepository;
