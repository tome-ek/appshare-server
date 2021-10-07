import { DeviceModel } from '../models/device.model';
import { DeviceDto } from './../dtos/DeviceDto';

type CreateDeviceRequestBody = {
  readonly name: string;
  readonly systemVersion: string;
  readonly previewImageUrl: string;
  readonly screenWidth?: number;
  readonly screenHeight?: number;
  readonly blueprintId?: string;
};

export interface DeviceRepository {
  createDevice: (device: CreateDeviceRequestBody) => Promise<DeviceDto>;
  getDevices: () => Promise<DeviceDto[]>;
}

const deviceRepository = (Device: DeviceModel): DeviceRepository => {
  return {
    createDevice: async (deviceJson) =>
      <DeviceDto>(await Device.create(deviceJson)).toJSON(),
    getDevices: async () => {
      return (await Device.findAll()).map(
        (device) => <DeviceDto>device.toJSON()
      );
    },
  };
};
export default deviceRepository;
