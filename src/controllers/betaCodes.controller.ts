import { Request, Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.middleware';
import { BetaCodeRepository } from '../repositories/betaCode.repository';

const betaCodesController = (
  betaCodeRepository: BetaCodeRepository
): Router => {
  const router = Router();

  /**
   * GET /beta-codes/:code
   * @tags Beta Codes
   * @summary Returns the requested beta code
   * @param {string} code.params - Code string of the beta code
   * @return {BetaCode} 200 - Success response - application/json
   */
  router.get(
    '/:code',
    param('code').isString().escape().trim(),
    validate,
    async (req: Request, res) => {
      res.json(await betaCodeRepository.getBetaCodeByCode(req.params.code));
    }
  );

  /**
   * @typedef {object} CreateBetaCodeBody
   * @property {string} code.required - The invitation code
   *
   */

  /**
   * POST /beta-codes
   * @tags Beta Codes
   * @summary Creates a Beta Code.
   * @param {CreateBetaCodeBody} request.body.required
   * @return {BetaCode} 201 - Success response - application/json
   */
  router.post(
    '/',
    body('code').isString().escape().trim().notEmpty(),
    validate,
    async (req, res) => {
      res.status(201).json(await betaCodeRepository.createBetaCode(req.body));
    }
  );

  return router;
};

export default betaCodesController;
