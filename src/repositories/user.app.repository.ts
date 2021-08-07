import Boom from '@hapi/boom';
import App from '../models/app.model';
import Build from '../models/build.model';
import User from '../models/user.model';

type CreateAppBuildParams = {
  name: string;
  bundleIdentifier: string;
  iconUrl?: string;
  builds: [
    {
      version: string;
      buildNumber: string;
      bundleUrl?: string;
      iv?: string;
      authTag?: string;
    }
  ];
};

export interface UserAppRepository {
  createAppBuild: (
    userId: number,
    params: CreateAppBuildParams
  ) => Promise<object>;
  getApps: (userId: number) => Promise<object[]>;
}

const userAppRepository = (): UserAppRepository => {
  return {
    createAppBuild: async (userId, params) => {
      const user = await User.findByPk(userId);
      if (!user) throw Boom.unauthorized;
      const app = await App.findOne({
        where: { bundleIdentifier: params.bundleIdentifier },
        include: [{ model: Build, as: 'builds' }],
      });
      if (!app) {
        const app = await user.createApp(params, {
          include: [{ model: Build, as: 'builds' }],
        });
        return app.toJSON();
      } else {
        const build = await app.createBuild(params.builds[0]);
        app.builds?.push(build);
        return app.toJSON();
      }
    },
    getApps: async userId =>
      App.findAll({
        where: { userId },
        include: [{ model: Build, as: 'builds' }],
      }),
  };
};

export default userAppRepository;
