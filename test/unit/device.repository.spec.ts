import 'mocha';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import { stubInterface } from 'ts-sinon';

import deviceRepository from '../../src/repositories/device.repository';
import { DeviceModel, Device } from '../../src/models/device.model';
import { DeviceDto } from '../../src/dtos/DeviceDto';

chai.use(sinonChai);

describe('DeviceRepository', () => {
  describe('createDevice', () => {
    it('should create device when valid beta code is provided', async () => {
      // Arrange
      const expectedDeviceDto: DeviceDto = {
        id: 1,
        name: 'foo',
        systemVersion: 'foo',
        previewImageUrl: 'foo',
        screenWidth: 360,
        screenHeight: 640,
        blueprintId: 'foo',
      };

      const device = stubInterface<Device>();
      device.toJSON.returns(expectedDeviceDto);

      const Device = stubInterface<DeviceModel>();
      Device.create.resolves(device);

      const repository = deviceRepository(Device);

      // Act
      const resultDevice = await repository.createDevice({
        name: 'foo',
        systemVersion: 'foo',
        previewImageUrl: 'foo',
        screenWidth: 360,
        screenHeight: 640,
        blueprintId: 'foo',
      });

      // Assert
      expect(resultDevice).to.be.deep.equal(expectedDeviceDto);
    });
  });

  describe('getDevices', () => {
    it('should return all devices', async () => {
      // Arrange
      const expectedDevices = [1, 2, 3].map((id) => ({
        id,
        name: 'foo',
        systemVersion: 'foo',
        previewImageUrl: 'foo',
        screenWidth: 360,
        screenHeight: 640,
        blueprintId: 'foo',
      }));

      const devices = expectedDevices.map((device) => {
        let deviceStub = stubInterface<Device>();
        deviceStub.toJSON.returns(device);
        return deviceStub;
      });

      const Device = stubInterface<DeviceModel>();
      Device.findAll.resolves(devices);

      const repository = deviceRepository(Device);

      // Act
      const resultDevices = await repository.getDevices();

      // Assert
      expect(resultDevices).to.be.deep.equal(expectedDevices);
    });
  });
});
