/**
 * Authentication helpers.
 *
 * Tokens are intentionally simple for this demo: `Bearer userId:role`.
 * `getAuthUser` resolves the bearer token to a user record; the
 * `requireAuth` / `requireAdmin` middleware wrap it for route handlers.
 */
import type { Request, Response, NextFunction } from 'express';
import { db } from '../db.js';
import { User, UserRole } from '../../src/types.js';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/** Resolve the current user from the Authorization header (or null). */
export function getAuthUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  // Simple token format: "userId:role"
  const [userId] = token.split(':');
  const user = db.getUser(userId);
  if (!user) return null;
  return user;
}

/** 401 unless a valid bearer token is present. Attaches `req.user`. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  req.user = user;
  next();
}

/** 403 unless the authenticated user has the admin role. Attaches `req.user`. */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user || user.role !== UserRole.ADMIN) {
    // Preserves the original API contract: 403 for both missing and non-admin.
    return res.status(403).json({ error: 'Admin access required' });
  }
  req.user = user;
  next();
}
