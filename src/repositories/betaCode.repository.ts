import Boom from '@hapi/boom';
import { BetaCodeModel } from '../models/betaCode.model';
import { BetaCodeDto } from './../dtos/BetaCodeDto';

export interface BetaCodeRepository {
  getBetaCodeByCode: (code: string) => Promise<BetaCodeDto>;
}

const betaCodeRepository = (BetaCode: BetaCodeModel): BetaCodeRepository => {
  return {
    getBetaCodeByCode: async (code) => {
      const betaCode = await BetaCode.findOne({ where: { code } });
      if (!betaCode) {
        throw Boom.notFound();
      }

      return <BetaCodeDto>betaCode.toJSON();
    },
  };
};

export default betaCodeRepository;
