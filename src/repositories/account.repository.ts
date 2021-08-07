import Account from '../models/account.model';

export interface AccountRepository {
  createAccount: (account: any) => Promise<object>;
}

const accountRepository = (): AccountRepository => {
  return {
    createAccount: async accountJson => {
      const account = await Account.create(accountJson);
      await account.createUser({});
      return account.toJSON();
    },
  };
};

export default accountRepository;
