import 'mocha';
import chai, { expect } from 'chai';
import { stubInterface } from 'ts-sinon';
import { User, UserModel } from '../../src/models/user.model';
import userAppRepository, {
  AppBuild,
} from '../../src/repositories/user.app.repository';
import Boom from '@hapi/boom';
import sinonChai from 'sinon-chai';
import { UserDto } from '../../src/dtos/UserDto';
import { AppModel, App } from '../../src/models/app.model';
import { BuildModel, Build } from '../../src/models/build.model';
import userRepository from '../../src/repositories/user.repository';
import { stub } from 'sinon';
import { AppDto } from '../../src/dtos/AppDto';
import { BuildDto } from '../../src/dtos/BuildDto';

chai.use(sinonChai);

describe('UserAppRepository', () => {
  describe('createAppBuild', () => {
    it('should create and add new build for an existing app', async () => {
      // Arrange
      const buildDto: BuildDto = {
        id: 42,
        appId: 1,
        version: 'foo',
        buildNumber: 'foo',
        bundleIdentifier: 'foo',
        fileName: 'foo',
        bundleUrl: 'foo',
        bundleName: 'foo',
      };

      const build: Build = {
        ...buildDto,
        ...stubInterface<Build>(),
      };

      const expectedAppDto: AppDto = {
        id: 1,
        userId: 2,
        name: 'Appshare',
        bundleIdentifier: 'com.appshare.appshare',
        iconUrl: 'https://appshare.com/image.png',
        builds: [buildDto],
      };

      const app: App = {
        ...expectedAppDto,
        ...stubInterface<App>(),
        builds: [build],
        createBuild: stub().resolves(build),
        toJSON: stub().resolves(expectedAppDto),
        shareLinks: [],
      };

      const App = stubInterface<AppModel>();
      App.findOne.resolves(app);

      const User = stubInterface<UserModel>();
      User.findByPk.resolves(stubInterface<User>());

      const repository = userAppRepository(
        User,
        App,
        stubInterface<BuildModel>()
      );

      const createAppBuildBody: AppBuild = {
        name: 'foo',
        bundleIdentifier: 'foo',
        builds: [
          {
            version: 'foo',
            buildNumber: 'foo',
            bundleName: 'foo',
          },
        ],
      };

      // Act
      const resultApp = await repository.createAppBuild(42, createAppBuildBody);

      // Assert
      expect(resultApp).to.be.deep.equal(expectedAppDto);
    });

    it('should create a new app with new build when app does not exist yet', async () => {
      // Arrange
      const buildDto: BuildDto = {
        id: 42,
        appId: 1,
        version: 'foo',
        buildNumber: 'foo',
        bundleIdentifier: 'foo',
        fileName: 'foo',
        bundleUrl: 'foo',
        bundleName: 'foo',
      };

      const build: Build = {
        ...buildDto,
        ...stubInterface<Build>(),
      };

      const expectedAppDto: AppDto = {
        id: 1,
        userId: 2,
        name: 'Appshare',
        bundleIdentifier: 'com.appshare.appshare',
        iconUrl: 'https://appshare.com/image.png',
        builds: [buildDto],
      };

      const app: App = {
        ...expectedAppDto,
        ...stubInterface<App>(),
        builds: [build],
        createBuild: stub().resolves(build),
        toJSON: stub().resolves(expectedAppDto),
        shareLinks: [],
      };

      const App = stubInterface<AppModel>();
      App.findOne.resolves(null);

      const user: User = {
        ...stubInterface<User>(),
        createApp: stub().resolves(app),
      };

      const User = stubInterface<UserModel>();
      User.findByPk.resolves(user);

      const repository = userAppRepository(
        User,
        App,
        stubInterface<BuildModel>()
      );

      const createAppBuildBody: AppBuild = {
        name: 'foo',
        bundleIdentifier: 'foo',
        builds: [
          {
            version: 'foo',
            buildNumber: 'foo',
            bundleName: 'foo',
          },
        ],
      };

      // Act
      const resultApp = await repository.createAppBuild(42, createAppBuildBody);

      // Assert
      expect(resultApp).to.be.deep.equal(expectedAppDto);
    });
  });
});
