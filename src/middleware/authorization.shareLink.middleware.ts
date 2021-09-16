import Boom from '@hapi/boom';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ShareLinkModel } from '../models/shareLink.model';
import * as ErrorMessage from '../resources/errorMessages.strings';
import { AuthorizationStrategy } from './authorization.middleware';

export interface ShareLinkAuthorizationStrategyPayload
  extends Record<string, string> {
  _tokenId: string;
  _appId: string;
  _userId: string;
}

export type ShareLinkAuthorizationStrategy =
  AuthorizationStrategy<ShareLinkAuthorizationStrategyPayload>;

export const shareLinkAuthorizationStrategy = (
  ShareLink: ShareLinkModel
): ShareLinkAuthorizationStrategy => {
  return {
    handler: async (req) => {
      try {
        const shareLinkJwtSecret = process.env.SHARE_LINK_JWT_SECRET;
        if (!shareLinkJwtSecret) {
          throw Boom.internal();
        }

        const [, token] = req.headers.authorization?.split(' ') || [];
        const payload = jwt.verify(token, shareLinkJwtSecret, {
          algorithms: ['HS256'],
          complete: false,
        });

        const { tid: tokenId } = payload as { tid: string };
        const shareLink = await ShareLink.findOne({ where: { tokenId } });

        if (!shareLink) {
          throw Boom.unauthorized(ErrorMessage.ShareLinkInvalid);
        }

        return {
          _tokenId: tokenId,
          _appId: String(shareLink.appId),
          _userId: String(shareLink.userId),
        };
      } catch (error) {
        if (error instanceof TokenExpiredError) {
          throw Boom.unauthorized(ErrorMessage.ShareLinkExpired);
        } else if (error instanceof JsonWebTokenError) {
          throw Boom.unauthorized(ErrorMessage.ShareLinkInvalid);
        } else {
          throw Boom.unauthorized(ErrorMessage.ShareLinkUnkownError);
        }
      }
    },
  };
};
