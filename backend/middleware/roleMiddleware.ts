import { Request, Response, NextFunction } from 'express';

export function requireRole(allowedRoles: Array<'Admin' | 'Department_Lead' | 'Analyst'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized. Authentication session required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden. Action requires one of [${allowedRoles.join(', ')}] role privileges. Your role is '${req.user.role}'.`
      });
      return;
    }

    next();
  };
}

export const requireAdmin = requireRole(['Admin']);
export const requireLeadOrAdmin = requireRole(['Admin', 'Department_Lead']);
