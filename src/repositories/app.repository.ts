import Boom from '@hapi/boom';
import { AppModel } from '../models/app.model';
import { BuildModel } from '../models/build.model';
import { AppDto } from '../dtos/AppDto';
import { Bucket } from '@google-cloud/storage';

export interface AppRepository {
  getApp: (appId: number) => Promise<AppDto>;
  deleteApp: (appId: number) => Promise<void>;
}

const appRepository = (
  bucket: Bucket,
  App: AppModel,
  Build: BuildModel
): AppRepository => {
  return {
    getApp: async (appId) => {
      const app = await App.findByPk(appId, {
        include: [{ model: Build, as: 'builds' }],
      });

      if (!app) throw Boom.notFound();

      return <AppDto>app.toJSON();
    },
    deleteApp: async (appId) => {
      const app = await App.findByPk(appId);
      if (!app) throw Boom.notFound();

      await bucket.deleteFiles({
        prefix: 'bundles/' + app.bundleIdentifier + '/',
      });

      return app.destroy();
    },
  };
};

export default appRepository;
