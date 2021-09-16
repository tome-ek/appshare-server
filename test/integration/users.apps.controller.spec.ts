import 'mocha';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import request from 'supertest';
import chaiSubset from 'chai-subset';
import { badRequest, unauthorized } from '@hapi/boom';

import { app } from '../../src/infra/server';
import App from '../../src/models/app.model';
import Build from '../../src/models/build.model';
import { getIdToken } from './initializeTestUser';
import { storage } from 'firebase-admin';

chai.use(sinonChai);
chai.use(chaiSubset);

describe('UsersAppsController', () => {
  before(async () => {
    await Build.destroy({ where: {} });
    await App.destroy({ where: {} });
  });

  describe('GET /users/:userId/apps', () => {
    it('should respond with list of apps of requested user', async () => {
      const expectedApps = [
        {
          id: 1,
          userId: 1,
          name: 'appshare',
          bundleIdentifier: 'bundleIdentifier-prod',
        },
        {
          id: 2,
          userId: 1,
          name: 'appshare-dev',
          bundleIdentifier: 'bundleIdentifier-dev',
        },
      ];
      await App.bulkCreate(expectedApps);

      await request(app)
        .get('/users/1/apps')
        .set('Authorization', `Bearer ${getIdToken()}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body).to.containSubset(expectedApps);
        });

      await App.destroy({ where: {} });
    });

    it('should respond with unauthorized error when auth token is missing or invalid', async () => {
      await request(app)
        .get('/users/1/apps')
        .set('Authorization', `Bearer invalid`)
        .expect('Content-Type', /json/)
        .expect(401)
        .expect((response) => {
          expect(response.body.error).to.containSubset(
            unauthorized().output.payload
          );
        });
    });
  });

  describe('POST /users/:userId/apps', () => {
    it('should respond with created app and 201 code', async () => {
      const expectedApp = {
        name: 'Appshare',
        bundleIdentifier: 'com.appshare.Appshare',
        iconUrl:
          'https://storage.googleapis.com/appshare-test.appspot.com/images/com.appshare.Appshare.png',
        builds: [
          {
            version: '1.0',
            buildNumber: '1',
            bundleName: 'Appshare',
          },
        ],
        userId: 1,
      };

      await request(app)
        .post('/users/1/apps')
        .set('Authorization', `Bearer ${getIdToken()}`)
        .set('Content-Type', 'multipart/form-data')
        .attach('app', './test/fixtures/Appshare.zip')
        .expect('Content-Type', /json/)
        .expect(201)
        .expect((response) => {
          expect(response.body).to.containSubset(expectedApp);
        });

      await Promise.all([
        storage().bucket().deleteFiles({
          prefix: 'bundles/com.appshare.Appshare/',
        }),
        storage().bucket().deleteFiles({
          prefix: 'images/com.appshare.Appshare.png',
        }),
        App.destroy({ where: {} }),
        Build.destroy({ where: {} }),
      ]);
    });

    it('should respond with bad request error when no app is uploaded', async () => {
      await request(app)
        .post('/users/1/apps')
        .set('Authorization', `Bearer ${getIdToken()}`)
        .set('Content-Type', 'multipart/form-data')
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });
});
