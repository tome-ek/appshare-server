import { Request, Response, NextFunction } from 'express';
import Boom from '@hapi/boom';
import jwt from 'jsonwebtoken';
import AppAccess from '../models/appAccess.model';
import Session from '../models/session.model';
import User from '../models/user.model';
import ShareLink from '../models/shareLink.model';
import admin from 'firebase-admin';
import Account from '../models/account.model';

export const verifyAnyToken = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    let userId: number | undefined = undefined;
    let isAuthorizedWithAppAccess = false;

    try {
      const [, appAccessToken] = req.headers.authorization?.split(' ') || [];
      const payload = jwt.verify(
        appAccessToken,
        process.env.APP_ACCESS_JWT_SECRET!,
        {
          algorithms: ['HS256'],
          complete: false,
        }
      );
      const { aai } = payload as { aai: number };
      const appAccess = await AppAccess.findByPk(aai, { include: [ShareLink] });
      userId = appAccess?.shareLink?.userId;
      isAuthorizedWithAppAccess = !!appAccess;
    } catch {}
    if (!isAuthorizedWithAppAccess) {
      try {
        const [, token] = req.headers.authorization?.split(' ') || [];
        const decodedToken = await admin.auth().verifyIdToken(token);
        const account = await Account.findOne({
          where: {
            firebaseId: decodedToken.uid,
          },
          include: [User],
          rejectOnEmpty: true,
        });
        userId = account.user?.id;
      } catch {}
    }

    if (!userId) {
      next(Boom.unauthorized());
      return;
    }
    req.params = { userId: String(userId), ...req.params };
    next();
  } catch {
    next(Boom.unauthorized());
  }
};
