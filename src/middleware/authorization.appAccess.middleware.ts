import Boom from '@hapi/boom';
import jwt from 'jsonwebtoken';
import { AppAccessModel } from '../models/appAccess.model';
import { ShareLinkModel } from '../models/shareLink.model';
import { AuthorizationStrategy } from './authorization.middleware';

export interface AppAccessAuthorizationStrategyPayload
  extends Record<string, string> {
  _userId: string;
}

export type AppAccessAuthorizationStrategy =
  AuthorizationStrategy<AppAccessAuthorizationStrategyPayload>;

export const appAccessAuthorizationStrategy = (
  AppAccess: AppAccessModel,
  ShareLink: ShareLinkModel
): AppAccessAuthorizationStrategy => {
  return {
    handler: async (req) => {
      try {
        const appAccessJwtSecret = process.env.APP_ACCESS_JWT_SECRET;
        if (!appAccessJwtSecret) {
          throw Boom.internal();
        }

        const [, token] = req.headers.authorization?.split(' ') || [];

        const payload = jwt.verify(token, appAccessJwtSecret, {
          algorithms: ['HS256'],
          complete: false,
        });
        const { aai: appAccessId } = payload as { aai: number };

        const appAccess = await AppAccess.findByPk(appAccessId);
        if (!appAccess) {
          throw Boom.unauthorized();
        }

        const shareLink = await ShareLink.findByPk(appAccess.shareLinkId);
        if (!shareLink) {
          throw Boom.unauthorized();
        }

        return {
          _userId: String(shareLink.userId),
        };
      } catch {
        throw Boom.unauthorized();
      }
    },
  };
};
