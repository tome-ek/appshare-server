import Boom from '@hapi/boom';
import App from '../models/app.model';
import Build from '../models/build.model';
import admin from 'firebase-admin';

export interface AppRepository {
  getApp: (appId: number) => Promise<object>;
  deleteApp: (appId: number) => Promise<any>;
}

const appRepository = (): AppRepository => {
  const bucket = admin.storage().bucket();
  return {
    getApp: async appId => {
      const app = await App.findByPk(appId, {
        include: [{ model: Build, as: 'builds' }],
      });

      if (!app) throw Boom.notFound();
      return app.toJSON();
    },
    deleteApp: async appId => {
      const app = await App.findByPk(appId);
      await bucket.deleteFiles({
        prefix: 'bundles/' + app?.bundleIdentifier + '/',
      });
      return app?.destroy();
    },
  };
};

export default appRepository;
