import 'mocha';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import request from 'supertest';
import chaiSubset from 'chai-subset';
import Boom from '@hapi/boom';
import { getIdToken } from './initializeTestUser';

import BetaCode from '../../src/models/betaCode.model';
import { app } from '../../src/infra/server';

chai.use(sinonChai);
chai.use(chaiSubset);

describe('UsersController', () => {
  describe('GET /users/me', () => {
    it('should respond with the user associated with provided auth token and 200 response code', async () => {
      await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${getIdToken()}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body).to.containSubset({
            id: 1,
            accountId: 1,
          });
        });
    });

    it('should respond with unauthorized error when token is invalid or missing', async () => {
      await request(app)
        .get('/users/me')
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
