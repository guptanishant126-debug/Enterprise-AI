import { Request, Response } from 'express';
import { db } from '../config/db.ts';

const STAGES = ['Draft', 'Under_Review', 'Compliance_Pending', 'Approved', 'Rejected', 'Archived'];

export async function getWorkflowKanban(req: Request, res: Response): Promise<void> {
  const { department } = req.query;

  try {
    let sql = `
      SELECT 
        i.*,
        u.full_name as author_name,
        u.department as author_department,
        ae.overall_risk_score,
        ae.financial_impact_score,
        ae.operational_friction_score,
        ae.compliance_risk_score,
        ae.executive_action_verdict
      FROM initiatives i
      JOIN users u ON i.author_id = u.id
      LEFT JOIN ai_evaluations ae ON i.id = ae.initiative_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (department && department !== 'ALL') {
      params.push(department);
      sql += ` AND i.department = $1`;
    }

    sql += ' ORDER BY i.created_at DESC';

    const result = await db.query(sql, params);

    const kanban: Record<string, any[]> = {};
    for (const stage of STAGES) {
      kanban[stage] = [];
    }

    for (const row of result.rows) {
      let impacted: string[] = [];
      try {
        impacted = JSON.parse(row.impacted_departments || '[]');
      } catch {}

      const item = {
        ...row,
        impacted_departments: impacted
      };

      if (kanban[row.current_stage]) {
        kanban[row.current_stage].push(item);
      }
    }

    // Stage metrics
    const stageMetrics = STAGES.map(stage => {
      const items = kanban[stage];
      const count = items.length;
      const totalBudget = items.reduce((sum, item) => sum + (Number(item.budget) || 0), 0);
      const avgRisk = count > 0 
        ? Math.round(items.reduce((sum, item) => sum + (Number(item.overall_risk_score) || 0), 0) / count)
        : 0;

      return {
        stage,
        count,
        totalBudget,
        avgRisk
      };
    });

    res.json({
      kanban,
      stageMetrics,
      totalCount: result.rows.length
    });
  } catch (error: any) {
    console.error('Failed to get workflow kanban:', error);
    res.status(500).json({ error: 'Failed to retrieve workflow pipeline.' });
  }
}
