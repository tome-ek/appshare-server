import 'mocha';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import request from 'supertest';
import chaiSubset from 'chai-subset';
import Boom from '@hapi/boom';

import App from '../../src/models/app.model';
import Build from '../../src/models/build.model';
import { app } from '../../src/infra/server';
import { getIdToken } from './initializeTestUser';

chai.use(sinonChai);
chai.use(chaiSubset);

describe('AppsController', () => {
  before(async () => {
    await App.destroy({ where: {} });
    await Build.destroy({ where: {} });
  });

  describe('GET /apps/:appId', () => {
    it('should respond with the app and 200 code', async () => {
      const expectedBuild = {
        id: 1,
        appId: 1,
        version: '0.1.0',
        buildNumber: '1',
        bundleIdentifier: 'bundleIdentifier',
        fileName: 'fileName',
        bundleUrl: 'bundleUrl',
        bundleName: 'appshare',
      };

      const expectedApp = {
        id: 1,
        userId: 1,
        name: 'appshare',
        bundleIdentifier: 'bundleIdentifier',
      };

      await App.create(expectedApp);
      await Build.create(expectedBuild);

      await request(app)
        .get('/apps/1')
        .set('Authorization', `Bearer ${getIdToken()}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body).to.containSubset({
            ...expectedApp,
            builds: [expectedBuild],
          });
        });

      await App.destroy({ where: {} });
      await Build.destroy({ where: {} });
    });

    it('should respond with not found error when app does not exist', async () => {
      await request(app)
        .get('/apps/2')
        .set('Authorization', `Bearer ${getIdToken()}`)
        .expect('Content-Type', /json/)
        .expect(404)
        .expect((response) => {
          expect(response.body.error).to.be.deep.equal(
            Boom.notFound().output.payload
          );
        });
    });

    it('should respond with unathorized error when auth token is missing or invalid', async () => {
      await request(app)
        .get('/apps/1')
        .set('Authorization', `Bearer invalid`)
        .expect('Content-Type', /json/)
        .expect(401)
        .expect((response) => {
          expect(response.body.error).to.be.deep.equal(
            Boom.unauthorized().output.payload
          );
        });
    });
  });

  describe('DELETE /apps/:appId', () => {
    it('should respond 204 code', async () => {
      const expectedBuild = {
        id: 1,
        appId: 1,
        version: '0.1.0',
        buildNumber: '1',
        bundleIdentifier: 'bundleIdentifier',
        fileName: 'fileName',
        bundleUrl: 'bundleUrl',
        bundleName: 'appshare',
      };

      const expectedApp = {
        id: 1,
        userId: 1,
        name: 'appshare',
        bundleIdentifier: 'bundleIdentifier',
      };

      await App.create(expectedApp);
      await Build.create(expectedBuild);

      await request(app)
        .delete('/apps/1')
        .set('Authorization', `Bearer ${getIdToken()}`)
        .expect(204);

      await App.destroy({ where: {} });
      await Build.destroy({ where: {} });
    });

    it('should respond with not found error when app does not exist', async () => {
      await request(app)
        .delete('/apps/2')
        .set('Authorization', `Bearer ${getIdToken()}`)
        .expect('Content-Type', /json/)
        .expect(404)
        .expect((response) => {
          expect(response.body.error).to.be.deep.equal(
            Boom.notFound().output.payload
          );
        });
    });

    it('should respond with unathorized error when auth token is missing or invalid', async () => {
      await request(app)
        .delete('/apps/1')
        .set('Authorization', `Bearer invalid`)
        .expect('Content-Type', /json/)
        .expect(401)
        .expect((response) => {
          expect(response.body.error).to.be.deep.equal(
            Boom.unauthorized().output.payload
          );
        });
    });
  });
});
