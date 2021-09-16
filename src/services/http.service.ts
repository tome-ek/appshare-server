import fetch from 'node-fetch';
import { badRequest, Boom } from '@hapi/boom';

export interface HttpService {
  post: <T>(url: string, body: Body, options?: PostOptions) => Promise<T>;
}

type Body = Record<string, unknown> | string;
type PostOptions = {
  encoding?: Encoding;
};
type Encoding = 'application/json' | 'application/x-www-form-urlencoded';
type AnyError = ErrorObject | Error;
type ErrorObject = Record<string, unknown> & {
  code?: number;
  message?: string;
};

const httpService = (): HttpService => {
  const isErrorObject = (error: AnyError): error is ErrorObject => {
    return !(error instanceof Error);
  };

  const isAnyError = (error: unknown): error is AnyError => {
    if (error instanceof Error) {
      return true;
    }

    if (typeof error === 'object') {
      const object = error || {};
      return 'code' in object || 'message' in object;
    }
    return false;
  };

  const createError = (error: AnyError): Boom => {
    if (isErrorObject(error)) {
      return new Boom(error.message, {
        statusCode: error.code,
      });
    }

    return new Boom(error.message, {
      statusCode: 400,
    });
  };

  return {
    post: async (
      url: string,
      body: Record<string, unknown> | string,
      options?: PostOptions
    ) => {
      try {
        const response = await fetch(url, {
          method: 'POST',
          body: typeof body === 'string' ? body : JSON.stringify(body),
          headers: {
            'Content-Type': options?.encoding || 'application/json',
          },
        });

        const json = await response.json();
        if (json.error) {
          throw createError(json.error);
        }

        return json;
      } catch (error) {
        if (isAnyError(error)) {
          throw createError(error);
        } else {
          throw badRequest();
        }
      }
    },
  };
};

export default httpService;
