import Boom from '@hapi/boom';
import { AccountDto } from '../dtos/AccountDto';
import { AccountModel } from '../models/account.model';
import { BetaCodeModel } from '../models/betaCode.model';
import { CreateAccountInvalidBetaCode } from '../resources/errorMessages.strings';

export type CreateAccountBody = {
  readonly betaCode: string;
  readonly firebaseId: string;
};

export interface AccountRepository {
  createAccount: (jsonBody: CreateAccountBody) => Promise<AccountDto>;
}

const accountRepository = (
  Account: AccountModel,
  BetaCode: BetaCodeModel
): AccountRepository => {
  return {
    createAccount: async (json) => {
      const betaCode = await BetaCode.findOne({
        where: { code: json.betaCode },
      });

      if (!betaCode || betaCode.isRedeemed) {
        throw Boom.badRequest(CreateAccountInvalidBetaCode);
      }

      const account = await Account.create({ firebaseId: json.firebaseId });
      await account.createUser({});

      betaCode.set('isRedeemed', true);
      await betaCode.save();

      const accountDto = <AccountDto>account.toJSON();
      return accountDto;
    },
  };
};

export default accountRepository;
