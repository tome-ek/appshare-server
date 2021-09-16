import Boom from '@hapi/boom';
import { UserDto } from '../dtos/UserDto';
import { UserModel } from '../models/user.model';

export interface UserRepository {
  getCurrentUser: (userId: number) => Promise<UserDto>;
}

const userRepository = (User: UserModel): UserRepository => {
  return {
    getCurrentUser: async (userId) => {
      const user = await User.findByPk(userId);
      if (!user) throw Boom.unauthorized();

      const userDto = <UserDto>user.toJSON();
      return userDto;
    },
  };
};

export default userRepository;
