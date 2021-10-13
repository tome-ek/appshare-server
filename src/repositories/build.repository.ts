import Boom from '@hapi/boom';
import { BuildDto } from '../dtos/BuildDto';
import App from '../models/app.model';
import { BuildModel } from '../models/build.model';

export interface BuildRepository {
  getBuild: (buildId: number, userId?: number) => Promise<BuildDto>;
}

const buildRepository = (Build: BuildModel): BuildRepository => {
  return {
    getBuild: async (buildId, userId) => {
      const build = await Build.findByPk(buildId, {
        include: {
          model: App,
        },
      });

      if (userId && build?.app?.userId !== userId) {
        throw Boom.forbidden();
      }

      if (!build) throw Boom.notFound();

      return <BuildDto>build.toJSON();
    },
  };
};

export default buildRepository;
