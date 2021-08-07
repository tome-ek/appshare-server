import Boom from '@hapi/boom';
import Device from '../models/device.model';

export interface DeviceRepository {
  createDevice: (device: any) => Promise<object>;
  patchDevice: (deviceId: number, json: any) => Promise<object>;
  getDevices: () => Promise<object[]>;
}

const deviceRepository = (): DeviceRepository => {
  return {
    createDevice: async deviceJson => {
      const device = await Device.create(deviceJson);
      return device.toJSON();
    },
    getDevices: async () => Device.findAll(),
    patchDevice: async (deviceId, json) => {
      const device = await Device.findByPk(deviceId);
      if (!device) {
        throw Boom.notFound;
      }
      device.set(json);
      return device.save();
    },
  };
};
export default deviceRepository;
