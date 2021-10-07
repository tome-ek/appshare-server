import 'mocha';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import request from 'supertest';
import chaiSubset from 'chai-subset';

import { app } from '../../src/infra/server';
import Device from '../../src/models/device.model';

chai.use(sinonChai);
chai.use(chaiSubset);

describe('DevicesController', () => {
  describe('GET /devices', () => {
    const expectedDevices = [
      {
        name: 'iPhone 8 Plus',
        systemVersion: 'iOS 14.4',
        previewImageUrl: 'https://appshare.dev/iphone8plus.png',
        screenWidth: 360,
        screenHeight: 640,
        blueprintId: 'iphone8',
      },
      {
        name: 'iPhone 8',
        systemVersion: 'iOS 14.4',
        previewImageUrl: 'https://appshare.dev/iphone8.png',
        screenWidth: 360,
        screenHeight: 640,
        blueprintId: 'iphone8',
      },
    ];

    before(async () => {
      await Device.bulkCreate(expectedDevices);
    });

    it('should respond with list of devices', async () => {
      await request(app)
        .get('/devices')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body).to.containSubset(expectedDevices);
        });
    });

    after(async () => {
      await Device.destroy({ where: {} });
    });
  });

  describe('POST /devices', () => {
    it('should respond with created device and 201 code', async () => {
      const expectedDevice = {
        name: 'iPhone 8 Plus',
        systemVersion: 'iOS 14.4',
        previewImageUrl: 'https://appshare.dev/iphone8plus.png',
        screenWidth: 360,
        screenHeight: 640,
        blueprintId: 'iphone8',
      };

      await request(app)
        .post('/devices')
        .send({
          name: 'iPhone 8 Plus',
          systemVersion: 'iOS 14.4',
          previewImageUrl: 'https://appshare.dev/iphone8plus.png',
          screenWidth: 360,
          screenHeight: 640,
          blueprintId: 'iphone8',
        })
        .set('Authorization', 'Bearer ' + process.env.API_KEY)
        .expect('Content-Type', /json/)
        .expect(201)
        .expect((response) => {
          expect(response.body).to.containSubset(expectedDevice);
        });

      await Device.destroy({ where: {} });
    });

    it('should respond with bad request error when no body is provided', async () => {
      await request(app)
        .post('/devices')
        .send({})
        .set('Authorization', 'Bearer ' + process.env.API_KEY)
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });
});
