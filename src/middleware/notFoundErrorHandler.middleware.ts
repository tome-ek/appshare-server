import Boom from '@hapi/boom';
import { Request, Response } from 'express';

export const handleNotFoundError = (_req: Request, res: Response): void => {
  const error = Boom.notFound();
  res.status(error.output.statusCode).json({ error: error.output.payload });
};
