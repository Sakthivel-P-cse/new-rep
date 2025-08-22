import 'express-session';
import { SessionUser } from '../lib/types';

declare module 'express-session' {
  interface SessionData {
    user?: SessionUser;
  }
}

