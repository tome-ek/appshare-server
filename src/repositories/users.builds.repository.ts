import { BuildDto } from '../dtos/BuildDto';
import App from '../models/app.model';
import { BuildModel } from '../models/build.model';
import { UserModel } from '../models/user.model';

export interface UsersBuildsRepository {
  getBuilds: (userId: number) => Promise<BuildDto[]>;
}

const usersBuildsRepository = (
  User: UserModel,
  Build: BuildModel
): UsersBuildsRepository => {
  return {
    getBuilds: async (userId) => {
      const builds = await Build.findAll({
        include: {
          model: App,
          where: {
            userId,
          },
        },
      });

      return builds.map((app) => <BuildDto>app.toJSON());
    },
  };
};

export default usersBuildsRepository;
