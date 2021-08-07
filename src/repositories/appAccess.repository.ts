import AppAccess from '../models/appAccess.model';
import jwt, { JsonWebTokenError, Jwt, TokenExpiredError } from 'jsonwebtoken';
import ShareLink from '../models/shareLink.model';
import Boom from '@hapi/boom';
import bcrypt from 'bcrypt';
import { promisify } from 'bluebird';
import App from '../models/app.model';
import Build from '../models/build.model';
export interface AppAccessRepository {
  createAppAccess: (body: any) => Promise<object>;
  getApp: (appAccessId: number) => Promise<object>;
}

const appAccessRepository = (): AppAccessRepository => {
  return {
    createAppAccess: async body => {
      const token = body.token;
      let payload: string | jwt.JwtPayload = {};
      try {
        payload = jwt.verify(token, process.env.SHARE_LINK_JWT_SECRET!, {
          algorithms: ['HS256'],
          complete: false,
        });
      } catch (error) {
        if (error instanceof TokenExpiredError) {
          throw Boom.unauthorized('The link has expired.');
        } else if (error instanceof JsonWebTokenError) {
          throw Boom.unauthorized('The link is incorrect.');
        } else {
          throw Boom.unauthorized(
            'An unkown error has occured while processing the link.'
          );
        }
      }
      const { tid } = payload as { tid: string };
      const shareLink = await ShareLink.findOne({ where: { tokenId: tid } });
      if (!shareLink) {
        throw Boom.badRequest('The link appears to be malformed.');
      }
      if (shareLink.hasPassword && !body.password) {
        throw Boom.badRequest('A valid password is required to open this app.');
      }
      try {
        const isPasswordCorrect = await bcrypt.compare(
          body.password,
          shareLink.password!
        );
        if (!isPasswordCorrect) {
          throw Boom.badRequest('The entered password is incorrect.');
        }
      } catch (error) {
        throw Boom.badRequest('The entered password is incorrect.');
      }

      const appAccess = await shareLink.createAppAccess();
      const jwtToken = await promisify<
        string,
        object,
        jwt.Secret,
        jwt.SignOptions
      >(jwt.sign)(
        {
          aai: appAccess.id,
        },
        process.env.APP_ACCESS_JWT_SECRET!,
        {
          expiresIn: Math.floor(shareLink.expiresAt.getTime() / 1000),
          algorithm: 'HS256',
        }
      );
      return { appAccess: { id: appAccess.id }, token: jwtToken };
    },
    getApp: async appAccessId => {
      const appAccess = await AppAccess.findByPk(appAccessId, {
        include: {
          model: ShareLink,
          as: 'shareLink',
          include: [
            {
              model: App,
              as: 'app',
              include: [{ model: Build, as: 'builds' }],
            },
          ],
        },
      });
      const json = appAccess?.shareLink?.app?.toJSON();
      if (json) {
        return json;
      } else {
        throw Boom.notFound();
      }
    },
  };
};

export default appAccessRepository;
