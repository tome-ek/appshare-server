import 'mocha';
import sinonChai from 'sinon-chai';
import chai, { expect } from 'chai';
import Boom from '@hapi/boom';

import buildRepository from '../../src/repositories/build.repository';
import { stubInterface } from 'ts-sinon';
import { BuildModel, Build } from '../../src/models/build.model';
import { BuildDto } from '../../src/dtos/BuildDto';
import { fail } from 'assert';

chai.use(sinonChai);

describe('BuildRepository', () => {
  describe('getBuildByCode', () => {
    it('should return build if one exists', async () => {
      // Arrange
      const expectedBuildDto: BuildDto = {
        id: 42,
        appId: 1,
        version: 'foo',
        buildNumber: 'foo',
        bundleIdentifier: 'foo',
        fileName: 'foo',
        bundleUrl: 'foo',
        bundleName: 'foo',
      };

      const build = stubInterface<Build>();
      build.toJSON.returns(expectedBuildDto);

      const Build = stubInterface<BuildModel>();
      Build.findByPk.resolves(build);

      const repository = buildRepository(Build);

      // Act
      const buildResult = await repository.getBuild(42);

      // Assert
      expect(buildResult).to.be.deep.equal(expectedBuildDto);
    });

    it('should throw not found error when build does not exist', async () => {
      // Arrange
      const Build = stubInterface<BuildModel>();
      Build.findByPk.resolves(null);

      const repository = buildRepository(Build);

      // Act
      try {
        await repository.getBuild(42);
        fail();
      } catch (error) {
        // Assert
        expect(error.output).to.be.deep.equal(Boom.notFound().output);
      }
    });
  });
});
