import { Request, Response } from 'express';
import { db } from '../config/db.ts';

export async function getDashboardMetrics(req: Request, res: Response): Promise<void> {
  try {
    // 1. Initiative counts & capital totals
    const initStats = await db.query(`
      SELECT 
        COUNT(*) as total_count,
        SUM(CASE WHEN current_stage IN ('Under_Review', 'Compliance_Pending') THEN 1 ELSE 0 END) as active_workflows,
        SUM(CASE WHEN current_stage = 'Approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN current_stage = 'Compliance_Pending' THEN 1 ELSE 0 END) as compliance_pending_count,
        SUM(CASE WHEN current_stage = 'Draft' THEN 1 ELSE 0 END) as draft_count,
        COALESCE(SUM(budget), 0) as total_budget
      FROM initiatives
    `);

    // 2. AI Risk Index averages
    const riskStats = await db.query(`
      SELECT 
        ROUND(AVG(overall_risk_score)) as avg_overall_risk,
        ROUND(AVG(financial_impact_score)) as avg_financial_impact,
        ROUND(AVG(operational_friction_score)) as avg_operational_friction,
        ROUND(AVG(compliance_risk_score)) as avg_compliance_risk,
        COUNT(*) as total_evaluated
      FROM ai_evaluations
    `);

    // 3. Department distribution
    const deptStats = await db.query(`
      SELECT 
        department,
        COUNT(*) as count,
        COALESCE(SUM(budget), 0) as total_budget
      FROM initiatives
      GROUP BY department
      ORDER BY count DESC
    `);

    // 4. Bottlenecks count
    const evalRows = await db.query('SELECT identified_bottlenecks FROM ai_evaluations');
    let totalBottlenecks = 0;
    for (const r of evalRows.rows) {
      try {
        const b = JSON.parse(r.identified_bottlenecks || '[]');
        totalBottlenecks += b.length;
      } catch {}
    }

    // 5. Recent high-priority initiatives
    const recentInitiatives = await db.query(`
      SELECT 
        i.id,
        i.title,
        i.department,
        i.current_stage,
        i.budget,
        i.target_date,
        u.full_name as author_name,
        ae.overall_risk_score,
        ae.executive_action_verdict
      FROM initiatives i
      JOIN users u ON i.author_id = u.id
      LEFT JOIN ai_evaluations ae ON i.id = ae.initiative_id
      ORDER BY i.created_at DESC
      LIMIT 5
    `);

    // 6. Recent audit logs preview
    const recentAudits = await db.query(`
      SELECT 
        a.id,
        a.action_type,
        a.entity_type,
        a.entity_id,
        a.created_at,
        u.full_name as actor_name,
        u.department as actor_department
      FROM audit_logs a
      LEFT JOIN users u ON a.actor_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 6
    `);

    res.json({
      metrics: {
        total_initiatives: Number(initStats.rows[0]?.total_count || 0),
        active_workflows: Number(initStats.rows[0]?.active_workflows || 0),
        approved_count: Number(initStats.rows[0]?.approved_count || 0),
        compliance_pending_count: Number(initStats.rows[0]?.compliance_pending_count || 0),
        draft_count: Number(initStats.rows[0]?.draft_count || 0),
        total_capital: Number(initStats.rows[0]?.total_budget || 0),
        total_bottlenecks: totalBottlenecks,
        risk_index: {
          overall: Number(riskStats.rows[0]?.avg_overall_risk || 0),
          financial: Number(riskStats.rows[0]?.avg_financial_impact || 0),
          operational: Number(riskStats.rows[0]?.avg_operational_friction || 0),
          compliance: Number(riskStats.rows[0]?.avg_compliance_risk || 0),
        }
      },
      departmentDistribution: deptStats.rows,
      recentInitiatives: recentInitiatives.rows,
      recentAudits: recentAudits.rows
    });
  } catch (error: any) {
    console.error('Failed to get dashboard metrics:', error);
    res.status(500).json({ error: 'Failed to aggregate enterprise metrics.' });
  }
}
