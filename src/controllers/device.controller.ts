import { Router } from 'express';
import { DeviceRepository } from '../repositories/device.repository';

const deviceController = (deviceRepository: DeviceRepository) => {
  const router = Router();
  router
    .post('/', async (req, res) => {
      res.status(201).json(await deviceRepository.createDevice(req.body));
    })
    .patch('/:deviceId', async (req, res) => {
      res.json(
        await deviceRepository.patchDevice(
          Number(req.params.deviceId),
          req.body
        )
      );
    })
    .get('/', async (_req, res) => {
      res.json(await deviceRepository.getDevices());
    });
  return router;
};

export default deviceController;
