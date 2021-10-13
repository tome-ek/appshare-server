import { BuildDto } from '../dtos/BuildDto';
import App from '../models/app.model';
import { BuildModel } from '../models/build.model';

export type GetBuildsOptions = {
  sort?: [string, string];
  limit?: number;
};

export interface UsersBuildsRepository {
  getBuilds: (
    userId: number,
    options?: GetBuildsOptions
  ) => Promise<BuildDto[]>;
}

const usersBuildsRepository = (Build: BuildModel): UsersBuildsRepository => {
  return {
    getBuilds: async (userId, options = {}) => {
      const builds = await Build.findAll({
        include: {
          model: App,
          where: {
            userId,
          },
        },
        order: options.sort && [options.sort],
        limit: options.limit,
      });

      return builds.map((app) => <BuildDto>app.toJSON());
    },
  };
};

export default usersBuildsRepository;
