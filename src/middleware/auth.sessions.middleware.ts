import { Request, Response, NextFunction } from 'express';
import Boom from '@hapi/boom';
import jwt from 'jsonwebtoken';
import AppAccess from '../models/appAccess.model';
import Session from '../models/session.model';
import User from '../models/user.model';
import ShareLink from '../models/shareLink.model';
import admin from 'firebase-admin';
import Account from '../models/account.model';
export const verifySessionAuthorization = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    let userId: number | undefined = undefined;
    let isAuthorizedWithAppAccess = false;
    let appId: number | undefined = undefined;
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
      appId = appAccess?.shareLink?.appId;
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

    const sid = req.query.sid;
    const session = await Session.findOne({
      where: { sessionId: sid },
    });
    if (!session) {
      next(Boom.notFound());
      return;
    }

    const isAuthorized =
      session.userId === userId &&
      (!isAuthorizedWithAppAccess || appId === session.appId);
    if (!isAuthorized) {
      next(Boom.unauthorized());
      return;
    }
    next();
  } catch {
    next(Boom.unauthorized());
  }
};
