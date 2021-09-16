import Boom from '@hapi/boom';
import { auth } from 'firebase-admin';
import { AccountModel } from '../models/account.model';
import User from '../models/user.model';
import { AuthorizationStrategy } from './authorization.middleware';

export interface JwtAuthoriztionStrategyPayload extends Record<string, string> {
  _userId: string;
}

export type JwtAuthorizationStrategy =
  AuthorizationStrategy<JwtAuthoriztionStrategyPayload>;

export const jwtAuthorizationStrategy = (
  Account: AccountModel,
  authorizationService: auth.BaseAuth
): JwtAuthorizationStrategy => {
  return {
    handler: async (req) => {
      try {
        const [, idToken] = req.headers.authorization?.split(' ') || [];

        const decodedToken = await authorizationService.verifyIdToken(idToken);

        const account = await Account.findOne({
          where: {
            firebaseId: decodedToken.uid,
          },
          include: [User],
          rejectOnEmpty: true,
        });

        return {
          _userId: String(account.user?.id),
        };
      } catch {
        throw Boom.unauthorized();
      }
    },
  };
};
