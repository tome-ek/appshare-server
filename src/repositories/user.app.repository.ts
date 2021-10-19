import Boom from '@hapi/boom';
import { AppDto } from '../dtos/AppDto';
import { AppModel } from '../models/app.model';
import { BuildModel } from '../models/build.model';
import { UserModel } from '../models/user.model';

export type GetUserAppsOptions = {
  includeHavingEmptyBuilds?: boolean;
};

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
      readonly bundleIdentifier?: string;
      readonly fileName?: string;
    }
  ];
};

export interface UserAppRepository {
  createAppBuild: (userId: number, build: AppBuild) => Promise<AppDto>;
  getApps: (userId: number, options?: GetUserAppsOptions) => Promise<AppDto[]>;
  getAppForBundleIdentifier: (
    bundleIdentifier: string
  ) => Promise<AppDto | null>;
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
    getApps: async (userId, options = { includeHavingEmptyBuilds: true }) => {
      const apps = await App.findAll({
        include: [{ model: Build, as: 'builds' }],
        where: { userId },
      });

      return apps
        .map((app) => <AppDto>app.toJSON())
        .filter(
          (app) => options.includeHavingEmptyBuilds || app.builds?.length
        );
    },
    getAppForBundleIdentifier: async (bundleIdentifier) => {
      const app = await App.findOne({
        where: { bundleIdentifier },
        attributes: ['userId'],
      });

      return <AppDto>app?.toJSON() || null;
    },
  };
};

export default userAppRepository;
