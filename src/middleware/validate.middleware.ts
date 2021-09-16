import Boom from '@hapi/boom';
import { NextFunction, Request, Response } from 'express';
import { ValidationError, validationResult } from 'express-validator';

export const validate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const validationErrors = validationResult(req).array({
    onlyFirstError: true,
  });
  const error: ValidationError | null =
    (validationErrors && validationErrors[0]) || null;

  if (error) {
    next(
      Boom.badRequest(
        `The '${error.param}' param is missing or has invalid value.`
      )
    );
  } else {
    next();
  }
};
