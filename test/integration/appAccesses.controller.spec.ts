import 'mocha';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import request from 'supertest';
import chaiSubset from 'chai-subset';
import Boom from '@hapi/boom';
import ms from 'ms';

import AppAccess from '../../src/models/appAccess.model';
import ShareLink from '../../src/models/shareLink.model';
import App from '../../src/models/app.model';
import { app } from '../../src/infra/server';
import { getIdToken } from './initializeTestUser';
import {
  CreateAppAccessPasswordIncorrect,
  CreateAppAccessPasswordNotProvided,
  CreateAppAccessShareLinkNotFound,
} from '../../src/resources/errorMessages.strings';

chai.use(sinonChai);
chai.use(chaiSubset);

describe('AppAccessesController', () => {
  before(async () => {
    await Promise.all([
      ShareLink.destroy({ where: {} }),
      App.destroy({ where: {} }),
      AppAccess.destroy({ where: {} }),
    ]);
  });

  describe('POST /app-accesses', () => {
    it('should respond with created app access object, access token and 201 code', async () => {
      const shareLinkToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aWQiOiJmb29iYXIiLCJpYXQiOjE2MzE0NTYxOTAsImV4cCI6MTY2MjU2MDE5MH0.4LwmHSqavcPFz8-eOMAvqtT2NFRbIpnuqYMkA2zUPsQ';

      await App.create({
        id: 1,
        name: 'appshare',
        bundleIdentifier: 'bundleIdentifier',
        builds: [],
      });

      await ShareLink.create({
        token: shareLinkToken,
        tokenId: 'foobar',
        userId: 1,
        appId: 1,
        shareUrl: 'http://localhost:3001/app?sid=' + shareLinkToken,
        hasPassword: false,
        expiresAt: new Date(Date.now() + ms('30d')),
      });

      await request(app)
        .post('/app-accesses')
        .set('Authorization', `Bearer ${getIdToken()}`)
        .send({ token: shareLinkToken })
        .expect('Content-Type', /json/)
        .expect(201)
        .expect((response) => {
          expect(response.body).to.have.property('token').that.is.a('string');
          expect(response.body)
            .to.have.property('appAccess')
            .which.has.keys(['id']);
        });

      await Promise.all([
        ShareLink.destroy({ where: {} }),
        App.destroy({ where: {} }),
        AppAccess.destroy({ where: {} }),
      ]);
    });

    it('should respond with bad data error for invalid share link token', async () => {
      const shareLinkToken = 'invalidtoken';

      await request(app)
        .post('/app-accesses')
        .set('Authorization', `Bearer ${getIdToken()}`)
        .send({ token: shareLinkToken })
        .expect('Content-Type', /json/)
        .expect(422);
    });

    it('should respond with bad request error when share link does not exist', async () => {
      const shareLinkToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aWQiOiJmb29iYXIiLCJpYXQiOjE2MzE0NTYxOTAsImV4cCI6MTY2MjU2MDE5MH0.4LwmHSqavcPFz8-eOMAvqtT2NFRbIpnuqYMkA2zUPsQ';

      await request(app)
        .post('/app-accesses')
        .set('Authorization', `Bearer ${getIdToken()}`)
        .send({ token: shareLinkToken })
        .expect('Content-Type', /json/)
        .expect(400)
        .expect((response) => {
          expect(response.body.error).to.be.deep.equal(
            Boom.badRequest(CreateAppAccessShareLinkNotFound).output.payload
          );
        });
    });

    it('should respond with bad request error when share link requires a password but none is provided', async () => {
      const shareLinkToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aWQiOiJmb29iYXIiLCJpYXQiOjE2MzE0NTYxOTAsImV4cCI6MTY2MjU2MDE5MH0.4LwmHSqavcPFz8-eOMAvqtT2NFRbIpnuqYMkA2zUPsQ';

      await App.create({
        id: 1,
        name: 'appshare',
        bundleIdentifier: 'bundleIdentifier',
        builds: [],
      });

      await ShareLink.create({
        token: shareLinkToken,
        tokenId: 'foobar',
        userId: 1,
        appId: 1,
        shareUrl: 'http://localhost:3001/app?sid=' + shareLinkToken,
        hasPassword: true,
        password: 'Password1',
        expiresAt: new Date(Date.now() + ms('30d')),
      });

      await request(app)
        .post('/app-accesses')
        .set('Authorization', `Bearer ${getIdToken()}`)
        .send({ token: shareLinkToken })
        .expect('Content-Type', /json/)
        .expect(400)
        .expect((response) => {
          expect(response.body.error).to.be.deep.equal(
            Boom.badRequest(CreateAppAccessPasswordNotProvided).output.payload
          );
        });

      await Promise.all([
        ShareLink.destroy({ where: {} }),
        App.destroy({ where: {} }),
      ]);
    });

    it('should respond with bad request error when passwords dont match', async () => {
      await App.create({
        id: 1,
        name: 'appshare',
        bundleIdentifier: 'bundleIdentifier',
        builds: [],
      });

      const shareLinkToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aWQiOiJmb29iYXIiLCJpYXQiOjE2MzE0NTYxOTAsImV4cCI6MTY2MjU2MDE5MH0.4LwmHSqavcPFz8-eOMAvqtT2NFRbIpnuqYMkA2zUPsQ';

      await ShareLink.create({
        token: shareLinkToken,
        tokenId: 'foobar',
        userId: 1,
        appId: 1,
        shareUrl: 'http://localhost:3001/app?sid=' + shareLinkToken,
        hasPassword: true,
        password: 'Password1',
        expiresAt: new Date(Date.now() + ms('30d')),
      });

      await request(app)
        .post('/app-accesses')
        .set('Authorization', `Bearer ${getIdToken()}`)
        .send({ token: shareLinkToken, password: 'incorrectpassword' })
        .expect('Content-Type', /json/)
        .expect(400)
        .expect((response) => {
          expect(response.body.error).to.be.deep.equal(
            Boom.badRequest(CreateAppAccessPasswordIncorrect).output.payload
          );
        });

      await Promise.all([
        ShareLink.destroy({ where: {} }),
        App.destroy({ where: {} }),
      ]);
    });
  });

  describe('GET /app-accesses/:id/share-link/app', () => {
    it('should respond with associated app object', async () => {
      await App.create({
        id: 1,
        name: 'appshare',
        bundleIdentifier: 'bundleIdentifier',
        builds: [],
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
        .get('/app-accesses/1/share-link/app')
        .set(
          'Authorization',
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhYWkiOjEsImlhdCI6MTYzMTQ1ODI2OSwiZXhwIjoxNjYyNTYyMjY5fQ.ifVjOrnq3Bt1wB7fJYPvmtvK9x6sLQvmx9P4U9A7y-I`
        )
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body).to.have.property('name').equal('appshare');
          expect(response.body)
            .to.have.property('bundleIdentifier')
            .equal('bundleIdentifier');
        });

      await Promise.all([
        ShareLink.destroy({ where: {} }),
        App.destroy({ where: {} }),
        AppAccess.destroy({ where: {} }),
      ]);
    });

    it('should respond with unauthorized error if app access does not exist', async () => {
      await request(app)
        .get('/app-accesses/1/share-link/app')
        .set(
          'Authorization',
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhYWkiOjEsImlhdCI6MTYzMTQ1ODI2OSwiZXhwIjoxNjYyNTYyMjY5fQ.ifVjOrnq3Bt1wB7fJYPvmtvK9x6sLQvmx9P4U9A7y-I`
        )
        .expect('Content-Type', /json/)
        .expect(401)
        .expect((response) => {
          expect(response.body.error).to.be.deep.equal(
            Boom.unauthorized().output.payload
          );
        });
    });

    it('should respond with unauthorized error for invalid app access token', async () => {
      await request(app)
        .get('/app-accesses/1/share-link/app')
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
