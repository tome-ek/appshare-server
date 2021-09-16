import Boom from '@hapi/boom';
import { BuildDto } from '../dtos/BuildDto';
import { BuildModel } from '../models/build.model';

export interface BuildRepository {
  getBuild: (buildId: number) => Promise<BuildDto>;
}

const buildRepository = (Build: BuildModel): BuildRepository => {
  return {
    getBuild: async (buildId) => {
      const build = await Build.findByPk(buildId);
      if (!build) throw Boom.notFound();

      return <BuildDto>build.toJSON();
    },
  };
};

export default buildRepository;
