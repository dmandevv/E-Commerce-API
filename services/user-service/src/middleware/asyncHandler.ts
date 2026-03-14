import { Request, Response, NextFunction } from 'express';

export const asyncHandler = <P = Request['params']>(
  fn: (req: Request<P>, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req as Request<P>, res, next)).catch(next);
  };
};