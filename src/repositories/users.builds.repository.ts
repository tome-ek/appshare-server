import { BuildDto } from '../dtos/BuildDto';
import App from '../models/app.model';
import { BuildModel } from '../models/build.model';

export interface UsersBuildsRepository {
  getBuilds: (userId: number, sort?: [string, string]) => Promise<BuildDto[]>;
}

const usersBuildsRepository = (Build: BuildModel): UsersBuildsRepository => {
  return {
    getBuilds: async (userId, sort) => {
      const builds = await Build.findAll({
        include: {
          model: App,
          where: {
            userId,
          },
        },
        order: sort && [sort],
      });

      return builds.map((app) => <BuildDto>app.toJSON());
    },
  };
};

export default usersBuildsRepository;
