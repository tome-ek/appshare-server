import { Request, Response, NextFunction } from 'express';
import Boom from '@hapi/boom';
import jwt from 'jsonwebtoken';
import AppAccess from '../models/appAccess.model';

export const verifyAppAccessToken = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const [, token] = req.headers.authorization?.split(' ') || [];
    const payload = jwt.verify(token, process.env.APP_ACCESS_JWT_SECRET!, {
      algorithms: ['HS256'],
      complete: false,
    });
    const { aai } = payload as { aai: number };
    const appAccess = await AppAccess.findByPk(aai);
    if (!appAccess || Number(req.params.id) !== aai) {
      next(Boom.unauthorized());
      return;
    }
    next();
  } catch {
    next(Boom.unauthorized());
  }
};
