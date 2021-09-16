import 'mocha';
import sinonChai from 'sinon-chai';
import chai, { expect } from 'chai';
import Boom from '@hapi/boom';

import betaCodeRepository from '../../src/repositories/betaCode.repository';
import { stubInterface } from 'ts-sinon';
import { BetaCodeModel, BetaCode } from '../../src/models/betaCode.model';
import { BetaCodeDto } from '../../src/dtos/BetaCodeDto';
import { fail } from 'assert';

chai.use(sinonChai);

describe('BetaCodeRepository', () => {
  describe('getBetaCodeByCode', () => {
    it('should return beta code if one exists', async () => {
      // Arrange
      const expectedBetaCodeDto: BetaCodeDto = {
        id: 1,
        code: 'APPSHARE',
        isRedeemed: false,
      };

      const betaCodeStub = stubInterface<BetaCode>();
      betaCodeStub.toJSON.returns(expectedBetaCodeDto);

      const BetaCode = stubInterface<BetaCodeModel>();
      BetaCode.findOne.resolves(betaCodeStub);

      const repository = betaCodeRepository(BetaCode);
      // Act
      const betaCode = await repository.getBetaCodeByCode('APPSHARE');
      // Assert
      expect(betaCode).to.be.deep.equal(expectedBetaCodeDto);
    });

    it('should throw not found error when beta code does not exist', async () => {
      // Arrange
      const BetaCode = stubInterface<BetaCodeModel>();
      BetaCode.findOne.resolves(null);

      const repository = betaCodeRepository(BetaCode);

      // Act
      try {
        await repository.getBetaCodeByCode('APPSHARE');
        fail();
      } catch (error) {
        // Assert
        expect(error.output).to.be.deep.equal(Boom.notFound().output);
      }
    });
  });
});
