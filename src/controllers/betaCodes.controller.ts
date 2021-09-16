import { Request, Router } from 'express';
import { param } from 'express-validator';
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

  return router;
};

export default betaCodesController;
