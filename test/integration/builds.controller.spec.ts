import 'mocha';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import request from 'supertest';
import chaiSubset from 'chai-subset';
import Boom from '@hapi/boom';

import Build from '../../src/models/build.model';
import { app } from '../../src/infra/server';

chai.use(sinonChai);
chai.use(chaiSubset);

describe('BuildsController', () => {
  before(async () => {
    await Build.destroy({ where: {} });
  });

  describe('GET /builds/:buildId', () => {
    it('should respond with the build and 200 response code', async () => {
      const expectedBuild = {
        id: 1,
        version: '0.1.0',
        buildNumber: '1',
        bundleIdentifier: 'bundleIdentifier',
        fileName: 'fileName',
        bundleUrl: 'bundleUrl',
        bundleName: 'appshare',
      };

      await Build.create(expectedBuild);

      await request(app)
        .get('/builds/1')
        .set('Authorization', 'Bearer ' + process.env.API_KEY)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body).to.containSubset(expectedBuild);
        });

      await Build.destroy({ where: {} });
    });

    it('should respond with not found error when build does not exist', async () => {
      await request(app)
        .get('/builds/2')
        .set('Authorization', 'Bearer ' + process.env.API_KEY)
        .expect('Content-Type', /json/)
        .expect(404)
        .expect((response) => {
          expect(response.body.error).to.be.deep.equal(
            Boom.notFound().output.payload
          );
        });
    });

    it('should respond with unauthorized error when api key is missing or invalid', async () => {
      await request(app)
        .get('/builds/1')
        .set('Authorization', 'Bearer invalid')
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
