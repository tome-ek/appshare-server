import 'mocha';
import sinonChai from 'sinon-chai';
import jwt from 'jsonwebtoken';
import Boom from '@hapi/boom';
import chai, { expect } from 'chai';
import { createSandbox, stub } from 'sinon';
import { stubInterface, StubbedInstance } from 'ts-sinon';

import appAccessRepository from '../../src/repositories/appAccess.repository';
import { AppAccess, AppAccessModel } from '../../src/models/appAccess.model';
import { ShareLink, ShareLinkModel } from '../../src/models/shareLink.model';
import { App, AppModel } from '../../src/models/app.model';
import { BuildModel } from '../../src/models/build.model';
import { fail } from 'assert/strict';
import {
  CreateAppAccessPasswordIncorrect,
  CreateAppAccessPasswordNotProvided,
  CreateAppAccessShareLinkNotFound,
} from '../../src/resources/errorMessages.strings';
import { AppDto } from '../../src/dtos/AppDto';

chai.use(sinonChai);

describe('AppAccessRepository', () => {
  describe('createAppAccess', () => {
    const sandbox = createSandbox();

    beforeEach(() => {
      sandbox.restore();
    });

    it('should create appAccess when valid beta code is provided', async () => {
      // Arrange

      // @ts-ignore
      sandbox.stub(jwt, 'verify').returns({ tid: 'foo' });

      const appAccess: StubbedInstance<AppAccess> = {
        id: 42,
        ...stubInterface<AppAccess>(),
      };

      const shareLink: StubbedInstance<ShareLink> = {
        id: 1,
        hasPassword: false,
        expiresAt: new Date(),
        createAppAccess: stub().resolves(appAccess),
        ...stubInterface<ShareLink>(),
      };

      const ShareLink = stubInterface<ShareLinkModel>();
      ShareLink.findOne.resolves(shareLink);

      let repository = appAccessRepository(
        stubInterface<AppAccessModel>(),
        ShareLink,
        stubInterface<AppModel>(),
        stubInterface<BuildModel>()
      );

      // Act
      let result = await repository.createAppAccess({ token: 'bar' });

      // Assert
      expect(result.appAccess.id).to.be.equal(42);
    });

    it('should verify password when app access requires it', async () => {
      // Arrange

      // @ts-ignore
      sandbox.stub(jwt, 'verify').returns({ tid: 'foo' });

      const appAccess: StubbedInstance<AppAccess> = {
        id: 42,
        ...stubInterface<AppAccess>(),
      };

      const shareLink: StubbedInstance<ShareLink> = {
        id: 1,
        hasPassword: true,
        password:
          '$2b$10$YKSAh6gBWjZpCcRfziZBpuDDPSdnh5.naCnF3hM8gPA43IlCqt8dW',
        expiresAt: new Date(),
        createAppAccess: stub().resolves(appAccess),
        ...stubInterface<ShareLink>(),
      };

      const ShareLink = stubInterface<ShareLinkModel>();
      ShareLink.findOne.resolves(shareLink);

      let repository = appAccessRepository(
        stubInterface<AppAccessModel>(),
        ShareLink,
        stubInterface<AppModel>(),
        stubInterface<BuildModel>()
      );

      // Act
      let result = await repository.createAppAccess({
        token: 'foo',
        password: 'foobar',
      });

      // Assert
      expect(result.appAccess.id).to.be.equal(42);
    });

    it('should throw bad data error when provided token cannot be decoded', async () => {
      // Arrange

      // @ts-ignore
      sandbox.stub(jwt, 'verify').throwsException(new Error());

      let repository = appAccessRepository(
        stubInterface<AppAccessModel>(),
        stubInterface<ShareLinkModel>(),
        stubInterface<AppModel>(),
        stubInterface<BuildModel>()
      );

      // Act
      try {
        await repository.createAppAccess({
          token: 'foo',
        });
        fail();
      } catch (error) {
        // Assert
        expect(error.output).to.be.deep.equal(Boom.badData().output);
      }
    });

    it('should throw bad request error when share link is not found', async () => {
      // Arrange

      // @ts-ignore
      sandbox.stub(jwt, 'verify').returns({ tid: 'foo' });

      const ShareLink = stubInterface<ShareLinkModel>();
      ShareLink.findOne.resolves(null);

      let repository = appAccessRepository(
        stubInterface<AppAccessModel>(),
        stubInterface<ShareLinkModel>(),
        stubInterface<AppModel>(),
        stubInterface<BuildModel>()
      );

      // Act
      try {
        await repository.createAppAccess({
          token: 'foo',
        });
        fail();
      } catch (error) {
        // Assert
        expect(error.output).to.be.deep.equal(
          Boom.badRequest(CreateAppAccessShareLinkNotFound).output
        );
      }
    });

    it('should throw bad request error when no password is provided for protected share link', async () => {
      // Arrange

      // @ts-ignore
      sandbox.stub(jwt, 'verify').returns({ tid: 'foo' });

      const shareLink: StubbedInstance<ShareLink> = {
        id: 1,
        hasPassword: true,
        password:
          '$2b$10$YKSAh6gBWjZpCcRfziZBpuDDPSdnh5.naCnF3hM8gPA43IlCqt8dW',
        ...stubInterface<ShareLink>(),
      };

      const ShareLink = stubInterface<ShareLinkModel>();
      ShareLink.findOne.resolves(shareLink);

      let repository = appAccessRepository(
        stubInterface<AppAccessModel>(),
        ShareLink,
        stubInterface<AppModel>(),
        stubInterface<BuildModel>()
      );

      // Act
      try {
        await repository.createAppAccess({
          token: 'foo',
        });
        fail();
      } catch (error) {
        // Assert
        expect(error.output).to.be.deep.equal(
          Boom.badRequest(CreateAppAccessPasswordNotProvided).output
        );
      }
    });

    it('should throw bad request error when invalid password is provided for protected share link', async () => {
      // Arrange

      // @ts-ignore
      sandbox.stub(jwt, 'verify').returns({ tid: 'foo' });

      const shareLink: StubbedInstance<ShareLink> = {
        id: 1,
        hasPassword: true,
        password:
          '$2b$10$YKSAh6gBWjZpCcRfziZBpuDDPSdnh5.naCnF3hM8gPA43IlCqt8dW',
        ...stubInterface<ShareLink>(),
      };

      const ShareLink = stubInterface<ShareLinkModel>();
      ShareLink.findOne.resolves(shareLink);

      let repository = appAccessRepository(
        stubInterface<AppAccessModel>(),
        ShareLink,
        stubInterface<AppModel>(),
        stubInterface<BuildModel>()
      );

      // Act
      try {
        await repository.createAppAccess({
          token: 'foo',
          password: 'foobaz',
        });
        fail();
      } catch (error) {
        // Assert
        expect(error.output).to.be.deep.equal(
          Boom.badRequest(CreateAppAccessPasswordIncorrect).output
        );
      }
    });

    it('should throw internal server error when creating app access fails', async () => {
      // Arrange

      // @ts-ignore
      sandbox.stub(jwt, 'verify').returns({ tid: 'foo' });

      const shareLink: StubbedInstance<ShareLink> = {
        id: 1,
        createAppAccess: stub().resolves(null),
        ...stubInterface<ShareLink>(),
      };

      const ShareLink = stubInterface<ShareLinkModel>();
      ShareLink.findOne.resolves(shareLink);

      let repository = appAccessRepository(
        stubInterface<AppAccessModel>(),
        ShareLink,
        stubInterface<AppModel>(),
        stubInterface<BuildModel>()
      );

      // Act
      try {
        await repository.createAppAccess({
          token: 'foo',
          password: 'foobaz',
        });
        fail();
      } catch (error) {
        // Assert
        expect(error.output).to.be.deep.equal(Boom.internal().output);
      }
    });
  });

  describe('getApp', () => {
    const sandbox = createSandbox();

    beforeEach(() => {
      sandbox.restore();
    });

    it('should return the app object associated with app access', async () => {
      // Arrange
      const expectedAppDto: AppDto = {
        id: 1,
        userId: 2,
        name: 'Appshare',
        bundleIdentifier: 'com.appshare.appshare',
        iconUrl: 'https://appshare.com/image.png',
      };

      const app = stubInterface<App>();
      app.toJSON.resolves(expectedAppDto);

      const appAccess: StubbedInstance<AppAccess> = {
        shareLink: {
          app,
          ...stubInterface<ShareLink>(),
        },
        ...stubInterface<AppAccess>(),
      };

      const AppAccess = stubInterface<AppAccessModel>();
      AppAccess.findByPk.resolves(appAccess);

      let repository = appAccessRepository(
        AppAccess,
        stubInterface<ShareLinkModel>(),
        stubInterface<AppModel>(),
        stubInterface<BuildModel>()
      );

      // Act
      let result = await repository.getApp(42);

      // Assert
      expect(result).to.be.deep.equal(expectedAppDto);
    });

    it('should throw not found error when app is not found', async () => {
      // Arrange
      const AppAccess = stubInterface<AppAccessModel>();
      AppAccess.findByPk.resolves(null);

      let repository = appAccessRepository(
        AppAccess,
        stubInterface<ShareLinkModel>(),
        stubInterface<AppModel>(),
        stubInterface<BuildModel>()
      );

      // Act
      try {
        await repository.getApp(42);
        fail();
      } catch (error) {
        // Assert
        expect(error.output).to.be.deep.equal(Boom.notFound().output);
      }
    });
  });
});
