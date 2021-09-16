import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.middleware';
import { AccountRepository } from '../repositories/account.repository';
import { HttpService } from '../services/http.service';

type SignInWithPasswordResponse = {
  refreshToken: string;
};

type IdTokenResponse = {
  id_token: string;
};

const accountsController = (
  accountRepository: AccountRepository,
  httpService: HttpService
): Router => {
  const router = Router();

  /**
   * @typedef {object} CreateAccountBody
   * @property {string} betaCode.required - The invitation code
   * @property {string} firebaseId.required - Unique identifier provided by Firebase
   *
   */

  /**
   * POST /accounts
   * @tags Accounts
   * @summary Creates a new Account.
   * @param {CreateAccountBody} request.body.required
   * @return {Account} 201 - Success response - application/json
   */
  router.post(
    '/',
    body('betaCode').isString().escape().trim().notEmpty(),
    body('firebaseId').isString().escape().trim().notEmpty(),
    validate,
    async (req, res) => {
      res.status(201).json(await accountRepository.createAccount(req.body));
    }
  );

  /**
   * @typedef {object} CreateRefreshTokenBody
   * @property {string} email.required - The email used while signing up with Firebase
   * @property {string} password.required - The password used while signing up with Firebase
   */

  /**
   * @typedef {object} RefreshTokenResponse
   * @property {string} refreshToken - New refresh token
   */

  /**
   * POST /accounts/refresh-tokens
   * @tags Accounts
   * @summary Creates a new refresh token.
   * @param {CreateRefreshTokenBody} request.body.required
   * @return {RefreshTokenResponse} 200 - Success response - application/json
   */
  router.post(
    '/refresh-tokens',
    body('email').isEmail().normalizeEmail().notEmpty(),
    body('password').isString().escape().trim().notEmpty(),
    validate,
    async (req, res) => {
      const { refreshToken }: SignInWithPasswordResponse =
        await httpService.post(
          process.env.FIR_API_URL +
            '/accounts:signInWithPassword?key=' +
            process.env.FIR_API_KEY,
          {
            email: req.body.email,
            password: req.body.password,
            returnSecureToken: true,
          }
        );

      res.json({ refreshToken });
    }
  );

  /**
   * @typedef {object} CreateIdTokenBody
   * @property {string} refreshToken.required - The Firebase account refresh token
   */

  /**
   * @typedef {object} IdTokenResponse
   * @property {string} idToken - New id token
   */

  /**
   * POST /accounts/id-tokens
   * @tags Accounts
   * @summary Creates a new id token.
   * @param {CreateIdTokenBody} request.body.required
   * @return {IdTokenResponse} 200 - Success response - application/json
   */
  router.post(
    '/id-tokens',
    body('refreshToken').isString().escape().trim().notEmpty(),
    validate,
    async (req, res) => {
      const { id_token }: IdTokenResponse = await httpService.post(
        process.env.FIR_API_URL + '/token?key=' + process.env.FIR_API_KEY,
        'grant_type=refresh_token&refresh_token=' + req.body.refreshToken,
        { encoding: 'application/x-www-form-urlencoded' }
      );
      res.json({ idToken: id_token });
    }
  );

  return router;
};

export default accountsController;
