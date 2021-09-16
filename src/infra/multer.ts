import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

const handler = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, './storage'),
    filename: (_req, _file, callback) => callback(null, `${Date.now()}.zip`),
  }),
});

export const singleFile =
  (fileName: string) =>
  (req: Request, res: Response, next: NextFunction): void => {
    handler.single(fileName)(req, res, () => {
      next();
    });
  };
