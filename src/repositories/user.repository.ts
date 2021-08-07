import Boom from '@hapi/boom';
import User from '../models/user.model';

export interface UserRepository {
  getCurrentUser: (userId: number) => Promise<object>;
  deleteUser: (userId: number) => Promise<void>;
}

const userRepository = (): UserRepository => {
  return {
    getCurrentUser: async userId => {
      const user = await User.findByPk(userId);
      if (!user) throw Boom.unauthorized();
      return user.toJSON();
    },
    deleteUser: async userId => {
      const user = await User.findByPk(userId);
      return user?.destroy();
    },
  };
};

export default userRepository;
