import 'mocha';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import request from 'supertest';
import chaiSubset from 'chai-subset';
import Boom from '@hapi/boom';

import BetaCode from '../../src/models/betaCode.model';
import { app } from '../../src/infra/server';

chai.use(sinonChai);
chai.use(chaiSubset);

describe('BetaCodesController', () => {
  before(async () => {
    await BetaCode.destroy({ where: {} });
  });

  describe('GET /beta-codes/:code', () => {
    it('should respond with the beta code and 200 response code', async () => {
      const expectedBetaCode = {
        id: 1,
        code: 'APPSHARE',
        isRedeemed: false,
      };

      await BetaCode.create(expectedBetaCode);

      await request(app)
        .get('/beta-codes/APPSHARE')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body).to.containSubset(expectedBetaCode);
        });

      await BetaCode.destroy({ where: {} });
    });

    it('should respond with not found error when beta code does not exist', async () => {
      await request(app)
        .get('/beta-codes/NOTEXISTING')
        .expect('Content-Type', /json/)
        .expect(404)
        .expect((response) => {
          expect(response.body.error).to.be.deep.equal(
            Boom.notFound().output.payload
          );
        });
    });
  });
});
