import 'mocha';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import { stubInterface } from 'ts-sinon';
import Boom from '@hapi/boom';

import shareLinkRepository from '../../src/repositories/shareLink.repository';
import { ShareLinkModel, ShareLink } from '../../src/models/shareLink.model';
import { ShareLinkDto } from '../../src/dtos/ShareLinkDto';
import { fail } from 'assert';

chai.use(sinonChai);

describe('ShareLinkRepository', () => {
  describe('getShareLinkByTokenId', () => {
    it('should return a share link if one exists', async () => {
      // Arrange
      let expectedShareLinkDto: ShareLinkDto = {
        id: 1,
        userId: 1,
        appId: 1,
        token: 'foo',
        tokenId: 'bar',
        expiresAt: new Date(),
        hasPassword: false,
      };

      const shareLink = stubInterface<ShareLink>();
      shareLink.toJSON.returns(expectedShareLinkDto);

      const ShareLink = stubInterface<ShareLinkModel>();
      ShareLink.findOne.resolves(shareLink);

      const repository = shareLinkRepository(ShareLink);

      // Act
      const resultShareLink = await repository.getShareLinkByTokenId('bar');

      // Assert
      expect(resultShareLink).to.be.deep.equal(expectedShareLinkDto);
    });

    it('should throw not found error when share link does not exist', async () => {
      // Arrange
      const ShareLink = stubInterface<ShareLinkModel>();
      ShareLink.findOne.resolves(null);

      const repository = shareLinkRepository(ShareLink);

      // Act
      try {
        await repository.getShareLinkByTokenId('foo');
        fail();
      } catch (error) {
        // Assert
        expect(error.output).to.be.deep.equal(Boom.notFound().output);
      }
    });
  });
});
