import { Router } from 'express';
import { AccountRepository } from '../repositories/account.repository';
import fetch from 'node-fetch';

const accountController = (accountRepository: AccountRepository) => {
  const router = Router();
  router
    .post('/', async (req, res) => {
      res.status(201).json(await accountRepository.createAccount(req.body));
    })
    .post('/refresh-tokens', async (req, res) => {
      const jsonResponse = await fetch(
        process.env.FIR_API_URL +
          '/accounts:signInWithPassword?key=' +
          process.env.FIR_API_KEY,
        {
          method: 'POST',
          body: JSON.stringify({
            email: req.body.email,
            password: req.body.password,
            returnSecureToken: true,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      ).then(res => res.json());
      res.status(200).json({ refreshToken: jsonResponse.refreshToken });
    })
    .post('/id-tokens', async (req, res) => {
      const jsonResponse = await fetch(
        process.env.FIR_API_URL + '/token?key=' + process.env.FIR_API_KEY,
        {
          method: 'POST',
          body:
            'grant_type=refresh_token&refresh_token=' + req.body.refreshToken,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded ',
          },
        }
      ).then(res => res.json());
      res.status(200).json({ idToken: jsonResponse.id_token });
    });
  return router;
};

export default accountController;
