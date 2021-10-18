import { BuildModel } from '../models/build.model';
import App from '../models/app.model';
import { BuildDto } from '../dtos/BuildDto';

export type GetAppBuildsOptions = {
  sort?: [string, string];
  limit?: number;
};

export interface AppsBuildsRepository {
  getAppBuilds: (
    appId: number,
    options?: GetAppBuildsOptions
  ) => Promise<BuildDto[]>;
}

const appsBuildsRepository = (Build: BuildModel): AppsBuildsRepository => {
  return {
    getAppBuilds: async (appId, options = {}) => {
      const builds = await Build.findAll({
        where: { appId },
        include: [App],
        order: options.sort && [options.sort],
      });

      return <BuildDto[]>builds.map((build) => build.toJSON());
    },
  };
};

export default appsBuildsRepository;
