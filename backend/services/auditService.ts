import { db } from '../config/db.ts';
import crypto from 'crypto';

export interface AuditLogEntry {
  actor_id?: string | null;
  action_type: string;
  entity_type: string;
  entity_id: string;
  metadata?: Record<string, any>;
  ip_address?: string;
}

export async function recordAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    const id = crypto.randomUUID();
    const metadataStr = JSON.stringify(entry.metadata || {});
    await db.query(
      `INSERT INTO audit_logs (id, actor_id, action_type, entity_type, entity_id, metadata, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        id,
        entry.actor_id || null,
        entry.action_type,
        entry.entity_type,
        entry.entity_id,
        metadataStr,
        entry.ip_address || '127.0.0.1'
      ]
    );
  } catch (error) {
    console.error('Failed to write immutable audit log:', error);
  }
}
