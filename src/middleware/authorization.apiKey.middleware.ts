import Boom from '@hapi/boom';
import { AuthorizationStrategy } from './authorization.middleware';

export type ApiKeyAuthorizationStrategy = AuthorizationStrategy<
  Record<string, never>
>;

export const apiKeyAuthorizationStrategy = (): ApiKeyAuthorizationStrategy => {
  return {
    handler: (req) => {
      try {
        const [, apiKey] = req.headers.authorization?.split(' ') || [];
        if (apiKey !== process.env.API_KEY) {
          throw Boom.unauthorized();
        }
        return Promise.resolve({});
      } catch {
        return Promise.reject(Boom.unauthorized());
      }
    },
  };
};
