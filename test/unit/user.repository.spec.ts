import 'mocha';
import chai, { expect } from 'chai';
import * as sinon from 'ts-sinon';
import { User, UserModel } from '../../src/models/user.model';
import userRepository from '../../src/repositories/user.repository';
import Boom from '@hapi/boom';
import sinonChai from 'sinon-chai';
import { UserDto } from '../../src/dtos/UserDto';

chai.use(sinonChai);

describe('UserRepository', () => {
  describe('getCurrentUser', () => {
    it('should return user when the user exists', async () => {
      // Arrange
      const expectedUserDto: UserDto = { id: 1, accountId: 2 };

      const user = sinon.stubInterface<User>();
      user.toJSON.returns(expectedUserDto);

      const User = sinon.stubInterface<UserModel>();
      User.findByPk.returns(Promise.resolve(user));

      const repository = userRepository(User);

      // Act
      const resultUser = await repository.getCurrentUser(42);

      // Assert
      expect(resultUser).to.be.deep.equal(expectedUserDto);
    });

    it('should throw unauthorized error if user does not exist', async () => {
      // Arrange
      const User = sinon.stubInterface<UserModel>();
      User.findByPk.returns(Promise.resolve(null));

      const repository = userRepository(User);

      // Act
      let resultError: Boom.Boom;
      try {
        await repository.getCurrentUser(42);
      } catch (error) {
        resultError = error;
      }

      // Assert
      expect(resultError.output).to.be.deep.equal(Boom.unauthorized().output);
    });
  });
});
