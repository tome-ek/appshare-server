import { Request, Response, NextFunction } from 'express';
import Boom from '@hapi/boom';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import ShareLink from '../models/shareLink.model';
export const decodeShareLink = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const [, token] = req.headers.authorization?.split(' ') || [];
    let payload: string | jwt.JwtPayload = { tid: '' };
    try {
      payload = jwt.verify(token, process.env.SHARE_LINK_JWT_SECRET!, {
        algorithms: ['HS256'],
        complete: false,
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        next(Boom.unauthorized('The link has expired.'));
      } else if (error instanceof JsonWebTokenError) {
        next(Boom.unauthorized('The link is incorrect.'));
      } else {
        next(
          Boom.unauthorized(
            'An unkown error has occured while processing the link.'
          )
        );
      }
      return;
    }
    const { tid } = payload as { tid: string };
    const shareLink = await ShareLink.findOne({ where: { tokenId: tid } });
    if (!shareLink) {
      next(Boom.unauthorized('The link is invalid.'));
      return;
    }
    req.params = { tokenId: tid, ...req.params };
    next();
  } catch {
    next(
      Boom.unauthorized(
        'An unkown error has occured while processing the link.'
      )
    );
  }
};
