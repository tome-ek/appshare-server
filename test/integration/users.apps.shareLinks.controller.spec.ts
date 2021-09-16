import 'mocha';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import request from 'supertest';
import chaiSubset from 'chai-subset';

import { app } from '../../src/infra/server';
import ShareLink from '../../src/models/shareLink.model';
import App from '../../src/models/app.model';

import { getIdToken } from './initializeTestUser';

chai.use(sinonChai);
chai.use(chaiSubset);

describe('UsersAppsShareLinksController', () => {
  before(async () => {
    await ShareLink.destroy({ where: {} });
    await App.destroy({ where: {} });
  });

  describe('POST /:userId/apps/:appId/share-links', () => {
    it('should respond with created share link and 201 code', async () => {
      await App.create({
        id: 1,
        userId: 1,
        name: 'appshare',
        bundleIdentifier: 'bundleIdentifier',
      });

      await request(app)
        .post('/users/1/apps/1/share-links')
        .set('Authorization', `Bearer ${getIdToken()}`)
        .send({
          expiresAt: '30d',
          hasPassword: false,
        })
        .expect('Content-Type', /json/)
        .expect(201)
        .expect((response) => {
          expect(response.body.id).to.be.a('number');
          expect(response.body.userId).to.be.equal(1);
          expect(response.body.appId).to.be.equal(1);
          expect(response.body.shareUrl).to.be.a('string');
          expect(response.body.expiresAt).to.be.a('string');
          expect(response.body.hasPassword).to.be.false;
        });

      await ShareLink.destroy({ where: {} });
      await App.destroy({ where: {} });
    });
  });
});
