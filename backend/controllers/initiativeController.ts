import { Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../config/db.ts';
import { evaluateInitiative } from '../services/aiEvaluationService.ts';
import { recordAuditLog } from '../services/auditService.ts';

// Helper to safely parse JSON strings
function safeJsonParse<T>(str: any, defaultValue: T): T {
  if (typeof str !== 'string') return str || defaultValue;
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}

export async function listInitiatives(req: Request, res: Response): Promise<void> {
  const { department, stage, search, my_dept } = req.query;
  const user = req.user!;

  try {
    let sql = `
      SELECT 
        i.*,
        u.full_name as author_name,
        u.email as author_email,
        u.department as author_department,
        ae.overall_risk_score,
        ae.financial_impact_score,
        ae.operational_friction_score,
        ae.compliance_risk_score,
        ae.executive_action_verdict,
        ae.strategic_alignment_summary
      FROM initiatives i
      JOIN users u ON i.author_id = u.id
      LEFT JOIN ai_evaluations ae ON i.id = ae.initiative_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (department && typeof department === 'string' && department !== 'ALL') {
      params.push(department);
      sql += ` AND i.department = $${params.length}`;
    }

    if (stage && typeof stage === 'string' && stage !== 'ALL') {
      params.push(stage);
      sql += ` AND i.current_stage = $${params.length}`;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      params.push(`%${search.trim().toLowerCase()}%`);
      sql += ` AND (LOWER(i.title) LIKE $${params.length} OR LOWER(i.summary) LIKE $${params.length})`;
    }

    if (my_dept === 'true') {
      params.push(user.department);
      params.push(`%"${user.department}"%`);
      sql += ` AND (i.department = $${params.length - 1} OR i.impacted_departments LIKE $${params.length})`;
    }

    sql += ' ORDER BY i.created_at DESC';

    const result = await db.query(sql, params);

    const initiatives = result.rows.map(row => ({
      ...row,
      impacted_departments: safeJsonParse<string[]>(row.impacted_departments, []),
    }));

    res.json({ initiatives });
  } catch (error: any) {
    console.error('Failed to list initiatives:', error);
    res.status(500).json({ error: 'Failed to retrieve initiatives repository.' });
  }
}

export async function getInitiativeById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const initResult = await db.query(`
      SELECT 
        i.*,
        u.full_name as author_name,
        u.email as author_email,
        u.department as author_department,
        u.role as author_role
      FROM initiatives i
      JOIN users u ON i.author_id = u.id
      WHERE i.id = $1
    `, [id]);

    if (initResult.rows.length === 0) {
      res.status(404).json({ error: 'Initiative not found.' });
      return;
    }

    const initiative = initResult.rows[0];
    initiative.impacted_departments = safeJsonParse<string[]>(initiative.impacted_departments, []);

    // Get AI Evaluation
    const evalResult = await db.query(
      'SELECT * FROM ai_evaluations WHERE initiative_id = $1',
      [id]
    );

    let evaluation = null;
    if (evalResult.rows.length > 0) {
      const rawEval = evalResult.rows[0];
      evaluation = {
        ...rawEval,
        cross_departmental_dependencies: safeJsonParse(rawEval.cross_departmental_dependencies, []),
        identified_bottlenecks: safeJsonParse(rawEval.identified_bottlenecks, []),
        recommended_mitigations: safeJsonParse(rawEval.recommended_mitigations, []),
        raw_response: safeJsonParse(rawEval.raw_response, {})
      };
    }

    // Get workflow actions history
    const actionsResult = await db.query(`
      SELECT 
        wa.*,
        u.full_name as reviewer_name,
        u.email as reviewer_email,
        u.department as reviewer_department,
        u.role as reviewer_role
      FROM workflow_actions wa
      JOIN users u ON wa.reviewer_id = u.id
      WHERE wa.initiative_id = $1
      ORDER BY wa.created_at DESC
    `, [id]);

    res.json({
      initiative,
      evaluation,
      workflow_history: actionsResult.rows
    });
  } catch (error: any) {
    console.error('Failed to get initiative:', error);
    res.status(500).json({ error: 'Error fetching initiative deep-dive.' });
  }
}

export async function createInitiative(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const {
    title,
    department,
    initiative_type,
    budget,
    target_date,
    impacted_departments,
    summary,
    raw_content
  } = req.body;

  try {
    const initiativeId = crypto.randomUUID();
    const impactedJson = JSON.stringify(impacted_departments);

    await db.query(`
      INSERT INTO initiatives (
        id, author_id, title, department, initiative_type, budget,
        target_date, impacted_departments, summary, raw_content, current_stage
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Draft')
    `, [
      initiativeId,
      user.id,
      title,
      department,
      initiative_type,
      budget,
      target_date,
      impactedJson,
      summary,
      raw_content
    ]);

    await recordAuditLog({
      actor_id: user.id,
      action_type: 'INITIATIVE_CREATED',
      entity_type: 'initiative',
      entity_id: initiativeId,
      metadata: { title, department, budget, initiative_type },
      ip_address: req.ip
    });

    // Run AI Evaluation in pipeline
    const evalInput = {
      id: initiativeId,
      title,
      department,
      initiative_type,
      budget,
      target_date,
      impacted_departments,
      summary,
      raw_content
    };

    let evalData = null;
    try {
      const { evaluation, modelVersion, rawResponse } = await evaluateInitiative(evalInput);
      const evalId = crypto.randomUUID();

      await db.query(`
        INSERT INTO ai_evaluations (
          id, initiative_id, overall_risk_score, financial_impact_score,
          operational_friction_score, compliance_risk_score, strategic_alignment_summary,
          cross_departmental_dependencies, identified_bottlenecks, recommended_mitigations,
          executive_action_verdict, model_version, raw_response
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        evalId,
        initiativeId,
        evaluation.overall_risk_score,
        evaluation.financial_impact_score,
        evaluation.operational_friction_score,
        evaluation.compliance_risk_score,
        evaluation.strategic_alignment_summary,
        JSON.stringify(evaluation.cross_departmental_dependencies),
        JSON.stringify(evaluation.identified_bottlenecks),
        JSON.stringify(evaluation.recommended_mitigations),
        evaluation.executive_action_verdict,
        modelVersion,
        JSON.stringify(rawResponse)
      ]);

      // Automatically route from Draft to Under_Review once AI evaluation is complete
      await db.query(
        "UPDATE initiatives SET current_stage = 'Under_Review', updated_at = datetime('now') WHERE id = $1",
        [initiativeId]
      );

      // Record automatic workflow routing action
      await db.query(`
        INSERT INTO workflow_actions (id, initiative_id, reviewer_id, from_stage, to_stage, notes)
        VALUES ($1, $2, $3, 'Draft', 'Under_Review', $4)
      `, [
        crypto.randomUUID(),
        initiativeId,
        user.id,
        `AI Evaluation synthesized by ${modelVersion}. Automatic departmental dispatch.`
      ]);

      await recordAuditLog({
        actor_id: user.id,
        action_type: 'AI_EVALUATION_COMPLETED',
        entity_type: 'ai_evaluation',
        entity_id: evalId,
        metadata: {
          initiative_id: initiativeId,
          verdict: evaluation.executive_action_verdict,
          overall_risk_score: evaluation.overall_risk_score
        },
        ip_address: req.ip
      });

      evalData = evaluation;
    } catch (evalErr) {
      console.error('AI pipeline processing error:', evalErr);
    }

    res.status(201).json({
      message: 'Initiative submitted and evaluated successfully.',
      initiative_id: initiativeId,
      evaluation: evalData
    });
  } catch (error: any) {
    console.error('Failed to create initiative:', error);
    res.status(500).json({ error: 'Failed to record initiative into enterprise vault.' });
  }
}

export async function updateStage(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { to_stage, notes } = req.body;
  const user = req.user!;

  try {
    const initResult = await db.query('SELECT * FROM initiatives WHERE id = $1', [id]);
    if (initResult.rows.length === 0) {
      res.status(404).json({ error: 'Initiative not found.' });
      return;
    }

    const initiative = initResult.rows[0];
    const from_stage = initiative.current_stage;
    const impactedDepts = safeJsonParse<string[]>(initiative.impacted_departments, []);

    // Check permissions:
    // Admin can transition any initiative
    // Department Lead can transition if:
    //   - they lead the proposing department OR
    //   - their department is in impacted_departments
    // Analyst cannot transition stages
    if (user.role === 'Analyst') {
      res.status(403).json({ error: 'Analysts are not permitted to authorize workflow stage transitions.' });
      return;
    }

    if (user.role === 'Department_Lead') {
      const isAuthorDept = initiative.department === user.department;
      const isImpactedDept = impactedDepts.includes(user.department);
      if (!isAuthorDept && !isImpactedDept) {
        res.status(403).json({
          error: `As Lead of ${user.department}, you can only transition initiatives originating from or impacting your department.`
        });
        return;
      }
    }

    // Update initiative stage
    await db.query(
      "UPDATE initiatives SET current_stage = $1, updated_at = datetime('now') WHERE id = $2",
      [to_stage, id]
    );

    // Record workflow action
    const actionId = crypto.randomUUID();
    await db.query(`
      INSERT INTO workflow_actions (id, initiative_id, reviewer_id, from_stage, to_stage, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      actionId,
      id,
      user.id,
      from_stage,
      to_stage,
      notes || `Stage transitioned from ${from_stage} to ${to_stage} by ${user.full_name} (${user.role})`
    ]);

    // Record audit log
    await recordAuditLog({
      actor_id: user.id,
      action_type: 'STAGE_TRANSITIONED',
      entity_type: 'initiative',
      entity_id: id,
      metadata: { from_stage, to_stage, reviewer: user.full_name, department: user.department, notes },
      ip_address: req.ip
    });

    res.json({
      message: `Workflow stage successfully updated to ${to_stage}.`,
      from_stage,
      to_stage
    });
  } catch (error: any) {
    console.error('Stage transition error:', error);
    res.status(500).json({ error: 'Failed to update workflow stage.' });
  }
}

export async function reevaluateInitiative(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const user = req.user!;

  if (user.role === 'Analyst') {
    res.status(403).json({ error: 'Analysts cannot trigger AI re-evaluation audits. Admin or Department Lead required.' });
    return;
  }

  try {
    const initResult = await db.query('SELECT * FROM initiatives WHERE id = $1', [id]);
    if (initResult.rows.length === 0) {
      res.status(404).json({ error: 'Initiative not found.' });
      return;
    }

    const initiative = initResult.rows[0];
    const impactedDepts = safeJsonParse<string[]>(initiative.impacted_departments, []);

    const evalInput = {
      id: initiative.id,
      title: initiative.title,
      department: initiative.department,
      initiative_type: initiative.initiative_type,
      budget: initiative.budget,
      target_date: initiative.target_date,
      impacted_departments: impactedDepts,
      summary: initiative.summary,
      raw_content: initiative.raw_content
    };

    const { evaluation, modelVersion, rawResponse } = await evaluateInitiative(evalInput);

    // Delete existing evaluation if exists or update
    await db.query('DELETE FROM ai_evaluations WHERE initiative_id = $1', [id]);

    const evalId = crypto.randomUUID();
    await db.query(`
      INSERT INTO ai_evaluations (
        id, initiative_id, overall_risk_score, financial_impact_score,
        operational_friction_score, compliance_risk_score, strategic_alignment_summary,
        cross_departmental_dependencies, identified_bottlenecks, recommended_mitigations,
        executive_action_verdict, model_version, raw_response
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      evalId,
      id,
      evaluation.overall_risk_score,
      evaluation.financial_impact_score,
      evaluation.operational_friction_score,
      evaluation.compliance_risk_score,
      evaluation.strategic_alignment_summary,
      JSON.stringify(evaluation.cross_departmental_dependencies),
      JSON.stringify(evaluation.identified_bottlenecks),
      JSON.stringify(evaluation.recommended_mitigations),
      evaluation.executive_action_verdict,
      modelVersion,
      JSON.stringify(rawResponse)
    ]);

    await recordAuditLog({
      actor_id: user.id,
      action_type: 'AI_EVALUATION_RE_RUN',
      entity_type: 'ai_evaluation',
      entity_id: evalId,
      metadata: {
        initiative_id: id,
        triggered_by: user.full_name,
        verdict: evaluation.executive_action_verdict,
        overall_risk_score: evaluation.overall_risk_score
      },
      ip_address: req.ip
    });

    res.json({
      message: 'AI Evaluation re-run successfully completed.',
      evaluation
    });
  } catch (error: any) {
    console.error('Re-evaluation error:', error);
    res.status(500).json({ error: 'Failed to re-evaluate initiative.' });
  }
}
