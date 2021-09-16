import Boom from '@hapi/boom';
import { NextFunction, Request, Response } from 'express';

export const handleInternalError = (
  error: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const boom = Boom.isBoom(error) ? error : Boom.boomify(error);
  res
    .status(boom.output.statusCode)
    .json({ error: boom.output.payload, stack: error.stack });
};
