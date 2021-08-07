import Boom from '@hapi/boom';
import { Request, Response } from 'express';
export const notFound = async (_req: Request, res: Response) => {
  const error = Boom.notFound();
  res.status(error.output.statusCode).json({ error: error.output.payload });
};
