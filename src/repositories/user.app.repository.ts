import Boom from '@hapi/boom';
import { AppDto } from '../dtos/AppDto';
import { AppModel } from '../models/app.model';
import { BuildModel } from '../models/build.model';
import { UserModel } from '../models/user.model';

export type AppBuild = {
  readonly name: string;
  readonly bundleIdentifier: string;
  readonly iconUrl?: string;
  readonly builds: [
    {
      readonly version: string;
      readonly buildNumber: string;
      readonly bundleName: string;
      readonly bundleUrl?: string;
      readonly iv?: string;
      readonly authTag?: string;
    }
  ];
};

export interface UserAppRepository {
  createAppBuild: (userId: number, build: AppBuild) => Promise<AppDto>;
  getApps: (userId: number) => Promise<AppDto[]>;
}

const userAppRepository = (
  User: UserModel,
  App: AppModel,
  Build: BuildModel
): UserAppRepository => {
  return {
    createAppBuild: async (userId, appBuild) => {
      const user = await User.findByPk(userId);
      if (!user) throw Boom.unauthorized;

      const app = await App.findOne({
        where: { bundleIdentifier: appBuild.bundleIdentifier },
        include: [{ model: Build, as: 'builds' }],
      });

      if (app) {
        const build = await app.createBuild(appBuild.builds[0]);

        app.builds?.push(build);

        return <AppDto>app.toJSON();
      } else {
        const app = await user.createApp(appBuild, {
          include: [{ model: Build, as: 'builds' }],
        });

        return <AppDto>app.toJSON();
      }
    },
    getApps: async (userId) => {
      const apps = await App.findAll({
        where: { userId },
        include: [{ model: Build, as: 'builds' }],
      });
      return apps.map((app) => <AppDto>app.toJSON());
    },
  };
};

export default userAppRepository;
