import 'mocha';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import request from 'supertest';
import chaiSubset from 'chai-subset';
import ms from 'ms';
import { unauthorized } from '@hapi/boom';

import { app } from '../../src/infra/server';
import { ShareLinkInvalid } from '../../src/resources/errorMessages.strings';
import AppAccess from '../../src/models/appAccess.model';
import ShareLink from '../../src/models/shareLink.model';

chai.use(sinonChai);
chai.use(chaiSubset);

describe('ShareLinksController', () => {
  before(async () => {
    await ShareLink.destroy({ where: {} });
  });

  describe('GET /share-links', () => {
    it('should respond with created share link and 201 code when authorized with app access token', async () => {
      const shareLinkToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aWQiOiJmb29iYXIiLCJpYXQiOjE2MzE0NTYxOTAsImV4cCI6MTY2MjU2MDE5MH0.4LwmHSqavcPFz8-eOMAvqtT2NFRbIpnuqYMkA2zUPsQ';

      await ShareLink.create({
        id: 1,
        token: shareLinkToken,
        tokenId: 'foobar',
        shareUrl: 'http://localhost:3001/app?sid=' + shareLinkToken,
        hasPassword: false,
        expiresAt: new Date(Date.now() + ms('30d')),
      });
      await AppAccess.create({
        id: 1,
        shareLinkId: 1,
      });

      await request(app)
        .get('/share-links')
        .set('Authorization', `Bearer ${shareLinkToken}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body).to.containSubset({
            hasPassword: false,
          });
        });

      await ShareLink.destroy({ where: {} });
    });

    it('should respond with unauthorized error with appropiate message when share link token is invalid', async () => {
      await request(app)
        .get('/share-links')
        .set('Authorization', `Bearer invalid`)
        .expect('Content-Type', /json/)
        .expect(401)
        .expect((response) => {
          expect(response.body.error).to.containSubset({
            ...unauthorized().output.payload,
            message: ShareLinkInvalid,
          });
        });
    });
  });
});
