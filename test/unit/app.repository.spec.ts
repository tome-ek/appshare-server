import 'mocha';
import sinonChai from 'sinon-chai';
import chai, { expect } from 'chai';
import Boom from '@hapi/boom';
import { Bucket } from '@google-cloud/storage';

import appRepository from '../../src/repositories/app.repository';
import { stubInterface, StubbedInstance } from 'ts-sinon';
import { AppModel, App } from '../../src/models/app.model';
import { AppDto } from '../../src/dtos/AppDto';
import { BuildModel } from '../../src/models/build.model';
import { stub } from 'sinon';

chai.use(sinonChai);

describe('AppRepository', () => {
  describe('getApp', () => {
    it('should create new app when valid beta code is provided', async () => {
      // Arrange
      const expectedAppDto: AppDto = {
        id: 1,
        userId: 2,
        name: 'Appshare',
        bundleIdentifier: 'com.appshare.appshare',
        iconUrl: 'https://appshare.com/image.png',
      };

      const appStub = stubInterface<App>();
      appStub.toJSON.returns(expectedAppDto);

      const AppStub = stubInterface<AppModel>();
      AppStub.findByPk.resolves(appStub);

      const repository = appRepository(
        stubInterface<Bucket>(),
        AppStub,
        stubInterface<BuildModel>()
      );

      // Act
      const app = await repository.getApp(1);

      // Assert
      expect(app).to.be.deep.equal(expectedAppDto);
    });

    it('should throw not found error when app does not exist', async () => {
      // Arrange
      const AppStub = stubInterface<AppModel>();
      AppStub.findByPk.resolves(null);

      const repository = appRepository(
        stubInterface<Bucket>(),
        AppStub,
        stubInterface<BuildModel>()
      );

      // Act
      let resultError: Boom.Boom;
      try {
        await repository.getApp(1);
      } catch (error) {
        resultError = error;
      }

      // Assert
      expect(resultError.output).to.be.deep.equal(Boom.notFound().output);
    });
  });

  describe('deleteApp', () => {
    it('should successfuly delete app that exist', async () => {
      // Arrange
      const app = stubInterface<App>();
      app.destroy.resolves();

      const App = stubInterface<AppModel>();
      App.findByPk.resolves(app);

      const bucket = stubInterface<Bucket>();
      bucket.deleteFiles.resolves();

      const repository = appRepository(
        bucket,
        App,
        stubInterface<BuildModel>()
      );

      // Act
      const appResult = await repository.deleteApp(1);

      // Assert
      expect(appResult).to.not.exist;
    });

    it('should delete all bundle files from cloud storage', async () => {
      // Arrange
      const app: StubbedInstance<App> = {
        bundleIdentifier: 'com.appshare.appshare',
        destroy: stub().resolves(),
        ...stubInterface<App>(),
      };

      const App = stubInterface<AppModel>();
      App.findByPk.resolves(app);

      const bucket = stubInterface<Bucket>();
      bucket.deleteFiles.resolves();

      const repository = appRepository(
        bucket,
        App,
        stubInterface<BuildModel>()
      );

      // Act
      await repository.deleteApp(1);

      // Assert
      expect(bucket.deleteFiles).to.be.calledOnceWithExactly({
        prefix: 'bundles/' + app.bundleIdentifier + '/',
      });
    });

    it('should throw not found error when app does not exist', async () => {
      // Arrange
      const AppStub = stubInterface<AppModel>();
      AppStub.findByPk.resolves(null);

      const repository = appRepository(
        stubInterface<Bucket>(),
        AppStub,
        stubInterface<BuildModel>()
      );

      // Act
      let resultError: Boom.Boom;
      try {
        await repository.deleteApp(1);
      } catch (error) {
        resultError = error;
      }

      // Assert
      expect(resultError.output).to.be.deep.equal(Boom.notFound().output);
    });
  });
});
