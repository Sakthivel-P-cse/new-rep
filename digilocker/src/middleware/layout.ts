import { Request, Response, NextFunction } from 'express';

export function injectUserToViews(req: Request, res: Response, next: NextFunction) {
  res.locals.user = req.session?.user || null;
  next();
}

