import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.ts';

export const JWT_SECRET = process.env.JWT_SECRET || 'nexus_enterprise_super_secret_jwt_key_2026_xyz';

export interface AuthenticatedUser {
  id: string;
  email: string;
  full_name: string;
  department: string;
  role: 'Admin' | 'Department_Lead' | 'Analyst';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Missing or malformed Bearer token.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const result = await db.query(
      'SELECT id, email, full_name, department, role FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'User associated with token no longer exists.' });
      return;
    }

    req.user = result.rows[0] as AuthenticatedUser;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid, expired, or revoked authentication token.' });
  }
}
