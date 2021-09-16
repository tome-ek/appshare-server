import fetch from 'node-fetch';
import Account from '../../src/models/account.model';
import User from '../../src/models/user.model';

let _idToken: string = '';

export const setupUser = async () => {
  await Account.destroy({ where: {}, restartIdentity: true });
  await User.destroy({ where: {}, restartIdentity: true });

  const account = await Account.create({
    firebaseId: process.env.FIR_TEST_ID,
    id: 1,
  });

  await account.createUser({
    id: 1,
  });

  const jsonResponse = await fetch(
    process.env.FIR_API_URL + '/token?key=' + process.env.FIR_API_KEY,
    {
      method: 'POST',
      body:
        'grant_type=refresh_token&refresh_token=' +
        process.env.FIR_TEST_REFRESH_TOKEN,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded ',
      },
    }
  ).then((res) => res.json());

  _idToken = jsonResponse.id_token;
};

export const getIdToken = () => _idToken;
