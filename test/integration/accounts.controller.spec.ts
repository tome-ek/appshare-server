import 'mocha';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import request from 'supertest';
import chaiSubset from 'chai-subset';
import Boom from '@hapi/boom';
import { Op } from 'sequelize';

import BetaCode from '../../src/models/betaCode.model';
import Account from '../../src/models/account.model';
import User from '../../src/models/user.model';
import { app } from '../../src/infra/server';
import { CreateAccountInvalidBetaCode } from '../../src/resources/errorMessages.strings';

chai.use(sinonChai);
chai.use(chaiSubset);

describe('AccountsController', () => {
  before(async () => {
    await BetaCode.destroy({ where: {} });
    await Account.destroy({ where: { id: { [Op.ne]: 1 } } });
    await User.destroy({ where: { id: { [Op.ne]: 1 } } });
  });

  describe('POST /accounts', () => {
    it('should respond with created account and 201 code', async () => {
      await BetaCode.create({
        code: 'APPSHARE',
        isRedeemed: false,
      });

      const expectedAccount = {
        firebaseId: '2R4Tm3kVqNgINbrl3Ta3SHlbjKY2',
      };

      await request(app)
        .post('/accounts')
        .send({
          betaCode: 'APPSHARE',
          ...expectedAccount,
        })
        .expect('Content-Type', /json/)
        .expect(201)
        .expect((response) => {
          expect(response.body).to.containSubset(expectedAccount);
        });

      await BetaCode.destroy({ where: {} });
      await Account.destroy({ where: { id: { [Op.ne]: 1 } } });
      await User.destroy({ where: { id: { [Op.ne]: 1 } } });
    });

    it('should respond with bad request error when beta code does not exist', async () => {
      await request(app)
        .post('/accounts')
        .send({
          betaCode: 'FOOBAR',
          firebaseId: 'baz',
        })
        .expect('Content-Type', /json/)
        .expect(400)
        .expect((response) => {
          expect(response.body.error).to.be.deep.equal(
            Boom.badRequest(CreateAccountInvalidBetaCode).output.payload
          );
        });
    });

    it('should respond with bad request error when beta code is already redeemed', async () => {
      await BetaCode.create({
        code: 'APPSHARE',
        isRedeemed: true,
      });

      await request(app)
        .post('/accounts')
        .send({
          betaCode: 'APPSHARE',
          firebaseId: 'baz',
        })
        .expect('Content-Type', /json/)
        .expect(400)
        .expect((response) => {
          expect(response.body.error).to.be.deep.equal(
            Boom.badRequest(CreateAccountInvalidBetaCode).output.payload
          );
        });

      await BetaCode.destroy({ where: {} });
    });
  });

  describe('POST /accounts/id-tokens', () => {
    it('should respond with refresh token and 200 code', async () => {
      await request(app)
        .post('/accounts/id-tokens')
        .send({
          email: 'test.user1@appshare.dev',
          password: 'Password1',
          returnSecureToken: true,
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body).to.have.property('idToken').that.is.a.string;
        });
    });

    it('should respond with error code 400 when credentials do not match', async () => {
      await request(app)
        .post('/accounts/id-tokens')
        .send({
          email: 'invalid@email.com',
          password: 'Password1',
          returnSecureToken: true,
        })
        .expect('Content-Type', /json/)
        .expect(400)
        .expect((response) => {
          expect(response.body).to.have.property('error').that.is.an('object');
        });
    });
  });
});
