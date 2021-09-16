import { Request, RequestHandler } from 'express';
import { ApiKeyAuthorizationStrategy } from './authorization.apiKey.middleware';
import { ShareLinkAuthorizationStrategy } from './authorization.shareLink.middleware';
import { JwtAuthorizationStrategy } from './authorization.jwt.middleware';
import { AppAccessAuthorizationStrategy } from './authorization.appAccess.middleware';
import Boom from '@hapi/boom';

export type AuthorizationStrategyType =
  | 'jwt'
  | 'apiKey'
  | 'shareLink'
  | 'appAccess';

export interface AuthMiddleware {
  authorize: (...strategies: AuthorizationStrategyType[]) => RequestHandler;
}

export type Authorization = (
  ...strategies: AuthorizationStrategyType[]
) => RequestHandler;

export interface AuthorizationStrategy<T extends Record<string, string>> {
  handler: (req: Request) => Promise<T>;
}

interface AuthorizationStrategies {
  jwt: JwtAuthorizationStrategy;
  apiKey: ApiKeyAuthorizationStrategy;
  shareLink: ShareLinkAuthorizationStrategy;
  appAccess: AppAccessAuthorizationStrategy;
}

export const authorizationStrategies = (
  jwtStrategy: JwtAuthorizationStrategy,
  apiKeyStrategy: ApiKeyAuthorizationStrategy,
  shareLinkStrategy: ShareLinkAuthorizationStrategy,
  appAccessStrategy: AppAccessAuthorizationStrategy
): AuthorizationStrategies => {
  return {
    jwt: jwtStrategy,
    apiKey: apiKeyStrategy,
    shareLink: shareLinkStrategy,
    appAccess: appAccessStrategy,
  };
};

export const authMiddleware = (
  authStrategies: AuthorizationStrategies
): Authorization => {
  return (...selectedStrategies: AuthorizationStrategyType[]) => {
    return async (req, _res, next) => {
      const handlers = selectedStrategies.map((strategy) => {
        switch (strategy) {
          case 'jwt':
            return authStrategies.jwt.handler(req);
          case 'apiKey':
            return authStrategies.apiKey.handler(req);
          case 'shareLink':
            return authStrategies.shareLink.handler(req);
          case 'appAccess':
            return authStrategies.appAccess.handler(req);
        }
      });

      const authSuccessResults: Record<string, string>[] = [];
      const authErrorResults: unknown[] = [];

      await Promise.all(
        handlers
          .map((handler) => async () => {
            try {
              const result = await handler;
              authSuccessResults.push(result);
            } catch (error) {
              authErrorResults.push(error);
            }
          })
          .map((func) => func())
      );

      if (authSuccessResults.length) {
        const authorizationParameters = authSuccessResults.reduce(
          (previous, current) => {
            return {
              ...current,
              ...previous,
            };
          }
        );

        req.params = { ...authorizationParameters, ...req.params };
        next();
      } else {
        next(authErrorResults[0] || Boom.unauthorized());
      }
    };
  };
};
