import 'mocha';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import request from 'supertest';
import chaiSubset from 'chai-subset';

import { app } from '../../src/infra/server';
import Device from '../../src/models/device.model';
import App from '../../src/models/app.model';
import Build from '../../src/models/build.model';
import AppAccess from '../../src/models/appAccess.model';
import ShareLink from '../../src/models/shareLink.model';
import Session from '../../src/models/session.model';
import { before } from 'mocha';
import ms from 'ms';
import { unauthorized } from '@hapi/boom';

chai.use(sinonChai);
chai.use(chaiSubset);

describe('SessionsController', () => {
  before(async () => {
    await Promise.all([
      App.destroy({ where: {} }),
      AppAccess.destroy({ where: {} }),
      Build.destroy({ where: {} }),
      Device.destroy({ where: {} }),
      ShareLink.destroy({ where: {} }),
      Session.destroy({ truncate: true, restartIdentity: true }),
    ]);
  });

  describe('POST /sessions', () => {
    it('should respond with created session and 201 code when authorized with app access token', async () => {
      const appAccessToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhYWkiOjEsImlhdCI6MTYzMTQ1ODI2OSwiZXhwIjoxNjYyNTYyMjY5fQ.ifVjOrnq3Bt1wB7fJYPvmtvK9x6sLQvmx9P4U9A7y-I';

      await App.create({
        id: 1,
        name: 'appshare',
        bundleIdentifier: 'bundleIdentifier',
      });
      await Build.create({
        id: 1,
        appId: 1,
        version: '0.1.0',
        buildNumber: '1',
        bundleIdentifier: 'bundleIdentifier',
        fileName: 'fileName',
        bundleUrl: 'bundleUrl',
        bundleName: 'appshare',
      });
      await Device.create({
        id: 4,
        name: 'iPhone X',
        systemVersion: 'iOS 14.4',
        previewImageUrl: 'https://appshare.dev/iphoneX.png',
        screenWidth: 1920,
        screenHeight: 1080,
        blueprintId: 'iphone8',
      });
      const shareLinkToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aWQiOiJmb29iYXIiLCJpYXQiOjE2MzE0NTYxOTAsImV4cCI6MTY2MjU2MDE5MH0.4LwmHSqavcPFz8-eOMAvqtT2NFRbIpnuqYMkA2zUPsQ';

      await ShareLink.create({
        id: 1,
        token: shareLinkToken,
        tokenId: 'foobar',
        userId: 1,
        appId: 1,
        shareUrl: 'http://localhost:3001/app?sid=' + shareLinkToken,
        hasPassword: false,
        expiresAt: new Date(Date.now() + ms('30d')),
      });
      await AppAccess.create({
        id: 1,
        shareLinkId: 1,
      });

      await request(app)
        .post('/sessions')
        .set('Authorization', `Bearer ${appAccessToken}`)
        .send({
          buildId: 1,
          appId: 1,
          deviceId: 4,
        })
        .expect('Content-Type', /json/)
        .expect(201)
        .expect((response) => {
          expect(response.body).to.containSubset({
            id: 1,
            buildId: 1,
            appId: 1,
            deviceId: 4,
            userId: 1,
          });
        });

      await Promise.all([
        App.destroy({ where: {} }),
        AppAccess.destroy({ where: {} }),
        Build.destroy({ where: {} }),
        Device.destroy({ where: { id: 4 } }),
        ShareLink.destroy({ where: {} }),
        Session.destroy({ truncate: true, restartIdentity: true }),
      ]);
    });

    it('should respond with unauthorized error when app access is missing or invalid', async () => {
      await request(app)
        .post('/sessions')
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
});
