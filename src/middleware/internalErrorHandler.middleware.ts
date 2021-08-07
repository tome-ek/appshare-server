import { NextFunction, Request, Response } from 'express';
import Boom from '@hapi/boom';

export const internalError = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const boom = Boom.isBoom(error) ? error : Boom.boomify(error);
  res
    .status(boom.output.statusCode)
    .json({ error: boom.output.payload, stack: error.stack });
};
