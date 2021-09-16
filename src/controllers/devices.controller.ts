import { Router } from 'express';
import { DeviceRepository } from '../repositories/device.repository';

const devicesController = (deviceRepository: DeviceRepository): Router => {
  const router = Router();

  /**
   * GET /devices
   *
   * @tags Devices
   * @summary Returns all devices that can be simulated.
   * @return {array<Device>} 200 - Success response - application/json
   */
  router.get('/', async (_req, res) => {
    res.json(await deviceRepository.getDevices());
  });

  return router;
};

export default devicesController;
