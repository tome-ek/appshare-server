import 'mocha';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import sinon, { StubbedInstance, stubInterface } from 'ts-sinon';
import Boom from '@hapi/boom';

import accountRepository from '../../src/repositories/account.repository';
import { BetaCode, BetaCodeModel } from '../../src/models/betaCode.model';
import { AccountModel, Account } from '../../src/models/account.model';
import { AccountDto } from '../../src/dtos/AccountDto';
import { CreateAccountInvalidBetaCode } from '../../src/resources/errorMessages.strings';

chai.use(sinonChai);

describe('AccountRepository', () => {
  describe('createAccount', () => {
    it('should create account when valid beta code is provided', async () => {
      // Arrange
      const expectedAccountDto: AccountDto = { id: 1, firebaseId: 'foobar' };

      const accountStub = stubInterface<Account>();
      accountStub.toJSON.returns(expectedAccountDto);
      accountStub.createUser.resolves();

      const betaCode: StubbedInstance<BetaCode> = {
        isRedeemed: false,
        save: sinon.stub().resolves(),
        set: sinon.stub(),
        ...stubInterface<BetaCode>(),
      };

      const Account = stubInterface<AccountModel>();
      Account.create.resolves(accountStub);

      const BetaCode = stubInterface<BetaCodeModel>();
      BetaCode.findOne.resolves(betaCode);

      const repository = accountRepository(Account, BetaCode);

      // Act
      const account = await repository.createAccount({
        betaCode: 'foo',
        firebaseId: 'foobar',
      });

      // Assert
      expect(account).to.be.deep.equal(expectedAccountDto);
    });

    it('should throw bad request error when entering invalid beta code', async () => {
      // Arrange
      const BetaCode = stubInterface<BetaCodeModel>();
      BetaCode.findOne.resolves(null);

      const Account = stubInterface<AccountModel>();

      const repository = accountRepository(Account, BetaCode);

      // Act
      let resultError: Boom.Boom;
      try {
        await repository.createAccount({
          betaCode: 'foo',
          firebaseId: 'foobar',
        });
      } catch (error) {
        resultError = error;
      }

      // Assert
      expect(resultError.output).to.be.deep.equal(
        Boom.badRequest(CreateAccountInvalidBetaCode).output
      );
    });
  });
});
