import Boom from '@hapi/boom';
import { BuildDto } from '../dtos/BuildDto';
import App from '../models/app.model';
import { BuildModel } from '../models/build.model';

export interface BuildRepository {
  getBuild: (buildId: number, userId?: number) => Promise<BuildDto>;
  deleteBuild: (buildId: number, userId?: number) => Promise<BuildDto>;
}

const buildRepository = (Build: BuildModel): BuildRepository => {
  return {
    getBuild: async (buildId, userId) => {
      const build = await Build.findByPk(buildId, {
        include: {
          model: App,
        },
      });

      if (!build) throw Boom.notFound();

      if (userId && build?.app?.userId !== userId) {
        throw Boom.forbidden();
      }

      return <BuildDto>build.toJSON();
    },
    deleteBuild: async (buildId, userId) => {
      const build = await Build.findByPk(buildId, {
        include: {
          model: App,
        },
      });

      if (!build) throw Boom.notFound();

      if (userId && build?.app?.userId !== userId) {
        throw Boom.forbidden();
      }

      await build.destroy();

      return <BuildDto>build.toJSON();
    },
  };
};

export default buildRepository;
