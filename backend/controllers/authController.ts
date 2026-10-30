import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../config/db.ts';
import { JWT_SECRET } from '../middleware/authMiddleware.ts';
import { recordAuditLog } from '../services/auditService.ts';

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, full_name, department, role } = req.body;

  try {
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'A user account with this enterprise email address already exists.' });
      return;
    }

    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);
    const userId = crypto.randomUUID();

    await db.query(
      `INSERT INTO users (id, email, password_hash, full_name, department, role)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, email.toLowerCase().trim(), password_hash, full_name, department, role]
    );

    const token = jwt.sign(
      { id: userId, email: email.toLowerCase().trim(), role, department },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    await recordAuditLog({
      actor_id: userId,
      action_type: 'USER_REGISTERED',
      entity_type: 'user',
      entity_id: userId,
      metadata: { email, department, role },
      ip_address: req.ip
    });

    res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: {
        id: userId,
        email: email.toLowerCase().trim(),
        full_name,
        department,
        role
      }
    });
  } catch (error: any) {
    console.error('Registration failure:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      'SELECT id, email, password_hash, full_name, department, role FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid enterprise email or password credentials.' });
      return;
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      res.status(401).json({ error: 'Invalid enterprise email or password credentials.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, department: user.department },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    await recordAuditLog({
      actor_id: user.id,
      action_type: 'USER_LOGIN',
      entity_type: 'user',
      entity_id: user.id,
      metadata: { department: user.department, role: user.role },
      ip_address: req.ip
    });

    res.json({
      message: 'Authentication successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        department: user.department,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Login failure:', error);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }
  res.json({ user: req.user });
}

export async function getDemoAccounts(req: Request, res: Response): Promise<void> {
  try {
    const result = await db.query(
      'SELECT id, email, full_name, department, role FROM users ORDER BY role ASC'
    );
    res.json({ accounts: result.rows, defaultPassword: 'password123' });
  } catch (error: any) {
    res.status(500).json({ error: 'Could not fetch demo accounts.' });
  }
}
