import { AppAccessModel } from '../models/appAccess.model';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ShareLinkModel } from '../models/shareLink.model';
import Boom from '@hapi/boom';
import bcrypt from 'bcrypt';
import { promisify } from 'bluebird';
import { AppModel } from '../models/app.model';
import { BuildModel } from '../models/build.model';
import { AppDto } from '../dtos/AppDto';
import {
  CreateAppAccessPasswordIncorrect,
  CreateAppAccessPasswordNotProvided,
  CreateAppAccessShareLinkNotFound,
  ShareLinkExpired,
  ShareLinkInvalid,
} from '../resources/errorMessages.strings';

export type CreateAppRequestBody = {
  readonly token: string;
  readonly password?: string;
};

type CreateAppResponseDto = {
  readonly appAccess: {
    readonly id: number;
  };
  readonly token: string;
};

export interface AppAccessRepository {
  createAppAccess: (
    jsonBody: CreateAppRequestBody
  ) => Promise<CreateAppResponseDto>;
  getApp: (appAccessId: number) => Promise<AppDto>;
}

const appAccessRepository = (
  AppAccess: AppAccessModel,
  ShareLink: ShareLinkModel,
  App: AppModel,
  Build: BuildModel
): AppAccessRepository => {
  const decodeShareLinkJwt = (
    token: string
  ): [string | null, Boom.Boom<unknown> | null] => {
    if (!process.env.SHARE_LINK_JWT_SECRET) {
      return [null, Boom.internal()];
    }

    let payload: string | jwt.JwtPayload = {};
    try {
      payload = jwt.verify(token, process.env.SHARE_LINK_JWT_SECRET, {
        algorithms: ['HS256'],
        complete: false,
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return [null, Boom.unauthorized(ShareLinkExpired)];
      } else if (error instanceof JsonWebTokenError) {
        return [null, Boom.unauthorized(ShareLinkInvalid)];
      } else {
        return [
          null,
          Boom.unauthorized(
            'An unkown error has occured while processing the link.'
          ),
        ];
      }
    }
    const { tid: tokenId } = payload as { tid: string };
    if (!tokenId) {
      return [null, Boom.unauthorized('The link is incorrect.')];
    }

    return [tokenId, null];
  };

  const createAppAccessToken = async (
    appAccessId: number,
    shareLinkExpirationDate: Date
  ): Promise<string> => {
    if (!process.env.APP_ACCESS_JWT_SECRET) {
      throw Boom.internal();
    }

    const jwtToken = await promisify<
      string,
      Record<string, unknown>,
      jwt.Secret,
      jwt.SignOptions
    >(jwt.sign)(
      {
        aai: appAccessId,
      },
      process.env.APP_ACCESS_JWT_SECRET,
      {
        expiresIn: Math.floor(shareLinkExpirationDate.getTime() / 1000),
        algorithm: 'HS256',
      }
    );

    return jwtToken;
  };

  return {
    createAppAccess: async (jsonBody) => {
      const [tokenId, error] = decodeShareLinkJwt(jsonBody.token);
      if (error) {
        throw Boom.badData();
      }

      const shareLink = await ShareLink.findOne({ where: { tokenId } });
      if (!shareLink) {
        throw Boom.badRequest(CreateAppAccessShareLinkNotFound);
      }

      if (shareLink.hasPassword && !jsonBody.password) {
        throw Boom.badRequest(CreateAppAccessPasswordNotProvided);
      }

      if (shareLink.hasPassword && shareLink.password && jsonBody.password) {
        try {
          const isPasswordCorrect = await bcrypt.compare(
            jsonBody.password,
            shareLink.password
          );
          if (!isPasswordCorrect) {
            throw Boom.badRequest(CreateAppAccessPasswordIncorrect);
          }
        } catch (error) {
          throw Boom.badRequest(CreateAppAccessPasswordIncorrect);
        }
      }

      const appAccess = await shareLink.createAppAccess();
      if (!(appAccess && appAccess.id)) {
        throw Boom.internal();
      }

      const jwtToken = await createAppAccessToken(
        appAccess.id,
        shareLink.expiresAt
      );

      return {
        appAccess: {
          id: appAccess.id,
        },
        token: jwtToken,
      };
    },
    getApp: async (appAccessId) => {
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

      const json = <AppDto>appAccess?.shareLink?.app?.toJSON();

      if (json) {
        return json;
      } else {
        throw Boom.notFound();
      }
    },
  };
};

export default appAccessRepository;
