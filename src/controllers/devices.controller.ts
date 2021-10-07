import { Router } from 'express';
import { body } from 'express-validator';
import { Authorization } from '../middleware/authorization.middleware';
import { validate } from '../middleware/validate.middleware';
import { DeviceRepository } from '../repositories/device.repository';

const devicesController = (
  deviceRepository: DeviceRepository,
  authorize: Authorization
): Router => {
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

  /**
   * @typedef {object} CreateDeviceBody
   * @property {string} name - Device name. e.g. iPhone 8
   * @property {string} systemVersion - Operating system that the device is using. e.g iOS 14.4
   * @property {string} previewImageUrl - Url of the image that portraits the iPhone model
   * @property {number} screenWidth - Device screen width in pixels
   * @property {number} screenHeight - Device screen height in pixels
   * @property {string} blueprintId - Represents an unique string describing this device.
   */

  /**
   * POST /devices
   * @tags Devices
   * @summary Creates a Device.
   * @security ApiKey
   * @param {CreateDeviceBody} request.body.required
   * @return {BetaCode} 201 - Success response - application/json
   */

  router.post(
    '/',
    authorize('apiKey'),
    body('name').isString().escape().trim().notEmpty(),
    body('systemVersion').isString().escape().trim().notEmpty(),
    body('previewImageUrl').isString().trim().notEmpty(),
    body('screenWidth').isNumeric().notEmpty(),
    body('screenHeight').isNumeric().notEmpty(),
    body('blueprintId').isString().escape().trim().notEmpty(),
    validate,
    async (req, res) => {
      res.status(201).json(await deviceRepository.createDevice(req.body));
    }
  );

  return router;
};

export default devicesController;
