import { Request, Response } from 'express';
import { db } from '../config/db.ts';

export async function listAuditLogs(req: Request, res: Response): Promise<void> {
  const { page = '1', limit = '20', action_type, entity_type } = req.query;
  const user = req.user!;

  if (user.role === 'Analyst') {
    res.status(403).json({ error: 'Access denied. Audit logs are restricted to Admin and Department Lead roles.' });
    return;
  }

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.min(100, Math.max(5, parseInt(limit as string, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  try {
    let whereClauses = ['1=1'];
    const params: any[] = [];

    if (action_type && action_type !== 'ALL') {
      params.push(action_type);
      whereClauses.push(`a.action_type = $${params.length}`);
    }

    if (entity_type && entity_type !== 'ALL') {
      params.push(entity_type);
      whereClauses.push(`a.entity_type = $${params.length}`);
    }

    const countSql = `SELECT COUNT(*) as total FROM audit_logs a WHERE ${whereClauses.join(' AND ')}`;
    const countResult = await db.query(countSql, params);
    const total = Number(countResult.rows[0]?.total || 0);

    const dataSql = `
      SELECT 
        a.id,
        a.actor_id,
        a.action_type,
        a.entity_type,
        a.entity_id,
        a.metadata,
        a.ip_address,
        a.created_at,
        u.full_name as actor_name,
        u.email as actor_email,
        u.department as actor_department,
        u.role as actor_role
      FROM audit_logs a
      LEFT JOIN users u ON a.actor_id = u.id
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY a.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const dataResult = await db.query(dataSql, [...params, limitNum, offset]);

    const logs = dataResult.rows.map(row => {
      let meta = {};
      try {
        meta = JSON.parse(row.metadata || '{}');
      } catch {}
      return {
        ...row,
        metadata: meta
      };
    });

    res.json({
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Failed to retrieve audit logs:', error);
    res.status(500).json({ error: 'Failed to query immutable compliance audit trail.' });
  }
}
