import { NextFunction, Request, Response } from 'express';

export const parseFilters = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const sort = req.query.sort;
  if (typeof sort !== 'undefined' && typeof sort === 'string') {
    if (sort.charAt(0) === '-') {
      req.query = { ...req.query, sort: [sort.slice(1), 'DESC'] };
    } else {
      req.query = { ...req.query, sort: [sort, 'ASC'] };
    }
  }
  next();
};
