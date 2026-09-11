import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, type TokenPayload } from '../../shared/utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../../shared/errors/AppError';
import type { Role } from 'db';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    throw new UnauthorizedError('Missing token');
  }
  
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
}

export const requireAdmin = requireRole('ADMIN');
export const requirePM = requireRole('ADMIN', 'PROJECT_MANAGER');
export const requireDeveloper = requireRole('ADMIN', 'DEVELOPER');