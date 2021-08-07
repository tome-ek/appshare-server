import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import Account from '../models/account.model';
import Boom from '@hapi/boom';
import User from '../models/user.model';

export const verifyToken = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const [, token] = req.headers.authorization?.split(' ') || [];
    const decodedToken = await admin.auth().verifyIdToken(token);
    // const decodedToken = {
    // uid: '35Y8i2syehPwNidFo0YOEoCoPG12',
    // };
    const account = await Account.findOne({
      where: {
        firebaseId: decodedToken.uid,
      },
      include: [User],
      rejectOnEmpty: true,
    });

    req.params = { userId: String(account.user?.id), ...req.params };
    next();
  } catch {
    next(Boom.unauthorized());
  }
};
