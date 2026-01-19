import { Request, Response, NextFunction } from 'express';
import { SessionUser } from '../lib/types';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = req.session?.user as SessionUser | undefined;
  if (!user) {
    return res.redirect('/login');
  }
  next();
}

export function requireRole(roles: Array<SessionUser['role']>) {
  return function (req: Request, res: Response, next: NextFunction) {
    const user = req.session?.user as SessionUser | undefined;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).send('Forbidden');
    }
    next();
  };
}

