import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'nexus_enterprise.db');
const sqlite = new Database(DB_PATH);

// Enable WAL mode for high concurrency
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

// Convert PostgreSQL $1, $2 parameterized placeholders to SQLite ?
function convertPgPlaceholders(sql: string): string {
  return sql.replace(/\$(\d+)/g, '?');
}

export const db = {
  query: async <T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> => {
    const formattedSql = convertPgPlaceholders(sql.trim());
    const isSelect = formattedSql.toLowerCase().startsWith('select') || 
                     formattedSql.toLowerCase().startsWith('with') ||
                     formattedSql.toLowerCase().startsWith('pragma');

    try {
      if (isSelect) {
        const stmt = sqlite.prepare(formattedSql);
        const rows = stmt.all(...params) as T[];
        return { rows, rowCount: rows.length };
      } else {
        const stmt = sqlite.prepare(formattedSql);
        const result = stmt.run(...params);
        return { rows: [] as T[], rowCount: result.changes };
      }
    } catch (error) {
      console.error('Database query error:', { sql: formattedSql, params, error });
      throw error;
    }
  },
  exec: (sql: string) => {
    sqlite.exec(sql);
  }
};

// Initialize schema and seed data
export async function initializeDatabase() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      department TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('Admin', 'Department_Lead', 'Analyst')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS initiatives (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      department TEXT NOT NULL,
      initiative_type TEXT NOT NULL,
      budget REAL DEFAULT 0.00,
      target_date TEXT NOT NULL,
      impacted_departments TEXT NOT NULL,
      summary TEXT NOT NULL,
      raw_content TEXT NOT NULL,
      current_stage TEXT NOT NULL DEFAULT 'Draft' CHECK (
        current_stage IN ('Draft', 'Under_Review', 'Compliance_Pending', 'Approved', 'Rejected', 'Archived')
      ),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ai_evaluations (
      id TEXT PRIMARY KEY,
      initiative_id TEXT UNIQUE NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
      overall_risk_score INTEGER NOT NULL,
      financial_impact_score INTEGER NOT NULL,
      operational_friction_score INTEGER NOT NULL,
      compliance_risk_score INTEGER NOT NULL,
      strategic_alignment_summary TEXT NOT NULL,
      cross_departmental_dependencies TEXT NOT NULL DEFAULT '[]',
      identified_bottlenecks TEXT NOT NULL DEFAULT '[]',
      recommended_mitigations TEXT NOT NULL DEFAULT '[]',
      executive_action_verdict TEXT NOT NULL,
      model_version TEXT NOT NULL,
      raw_response TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS workflow_actions (
      id TEXT PRIMARY KEY,
      initiative_id TEXT NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
      reviewer_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      from_stage TEXT NOT NULL,
      to_stage TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      action_type TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      metadata TEXT DEFAULT '{}',
      ip_address TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_initiatives_dept ON initiatives(department);
    CREATE INDEX IF NOT EXISTS idx_initiatives_stage ON initiatives(current_stage);
    CREATE INDEX IF NOT EXISTS idx_ai_evaluations_init ON ai_evaluations(initiative_id);
    CREATE INDEX IF NOT EXISTS idx_workflow_actions_init ON workflow_actions(initiative_id);
    CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id);
  `);

  // Check if seed users exist
  const existingUsers = sqlite.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (existingUsers.count === 0) {
    console.log('Seeding enterprise initial dataset...');
    const saltRounds = 12;
    const defaultPasswordHash = bcrypt.hashSync('password123', saltRounds);

    const adminId = crypto.randomUUID();
    const leadId = crypto.randomUUID();
    const analystId = crypto.randomUUID();
    const financeLeadId = crypto.randomUUID();
    const legalLeadId = crypto.randomUUID();

    const insertUser = sqlite.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, department, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(adminId, 'admin@nexusai.corp', defaultPasswordHash, 'Victoria Vance (Chief Strategy)', 'Operations', 'Admin');
    insertUser.run(leadId, 'sarah.chen@nexusai.corp', defaultPasswordHash, 'Sarah Chen (VP Engineering)', 'Engineering', 'Department_Lead');
    insertUser.run(analystId, 'marcus.vance@nexusai.corp', defaultPasswordHash, 'Marcus Vance (Senior Ops Analyst)', 'Finance', 'Analyst');
    insertUser.run(financeLeadId, 'david.ross@nexusai.corp', defaultPasswordHash, 'David Ross (Head of Corporate Finance)', 'Finance', 'Department_Lead');
    insertUser.run(legalLeadId, 'elena.rostova@nexusai.corp', defaultPasswordHash, 'Elena Rostova (General Counsel & Compliance)', 'Legal_Compliance', 'Department_Lead');

    // Seed Initiatives
    const init1Id = crypto.randomUUID();
    const init2Id = crypto.randomUUID();
    const init3Id = crypto.randomUUID();
    const init4Id = crypto.randomUUID();
    const init5Id = crypto.randomUUID();

    const insertInit = sqlite.prepare(`
      INSERT INTO initiatives (id, author_id, title, department, initiative_type, budget, target_date, impacted_departments, summary, raw_content, current_stage)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // 1. Engineering Multi-Region Cloud Migration
    insertInit.run(
      init1Id,
      leadId,
      'Project Titan: Multi-Region Hybrid Cloud Infrastructure Migration',
      'Engineering',
      'Infrastructure_Change',
      1450000.00,
      '2026-12-15',
      JSON.stringify(['Finance', 'Operations', 'Legal_Compliance']),
      'Migrate primary transactional database clusters and edge microservices from legacy on-premise co-location racks to multi-region AWS and GCP active-active Kubernetes clusters.',
      'Comprehensive architectural proposal detailing the phased transition of 42 core microservices and 18TB of real-time transactional data. Objectives include achieving 99.995% uptime SLA, sub-25ms latency globally, automated disaster recovery, and SOC2 Type II cryptographic compliance. Requires $1.45M capital expenditure for dual-run period, cloud reservation commitments, and external security penetration audits.',
      'Under_Review'
    );

    // 2. Finance AI Ledger Reconciliation
    insertInit.run(
      init2Id,
      financeLeadId,
      'Autonomous General Ledger & Real-Time Statutory Audit Pipeline',
      'Finance',
      'Budget_Allocation',
      620000.00,
      '2026-11-30',
      JSON.stringify(['Engineering', 'Operations', 'Legal_Compliance']),
      'Deployment of automated anomaly detection and real-time reconciliation across 14 international banking rails and multi-currency subsidiaries.',
      'This initiative automates monthly GAAP ledger closing from 9 business days down to under 4 hours using deterministic ML pipeline. Connects via secure OAuth hooks to JPMorgan Chase, HSBC, and Stripe enterprise gateways. Budget covers software licensing, ERP API gateway connectors, and third-party accounting validation.',
      'Approved'
    );

    // 3. HR Global Remote Compensation & Equity Parity
    insertInit.run(
      init3Id,
      adminId,
      'Global Talent Banding & Cross-Border Remote Equity Governance',
      'Human_Resources',
      'Policy_Update',
      350000.00,
      '2027-01-15',
      JSON.stringify(['Finance', 'Legal_Compliance', 'Operations']),
      'Modernize global compensation tiers to adjust for location-independent talent benchmarks while ensuring cross-border tax compliance across 18 countries.',
      'Establishes a standardized three-tier geographic pay formula for all distributed knowledge workers. Resolves critical cross-border tax withholding liabilities in the EU and APAC. Involves Employer of Record (EOR) contractual consolidation and international benefits parity.',
      'Compliance_Pending'
    );

    // 4. Legal AI Contract Lifecycle Risk Management
    insertInit.run(
      init4Id,
      legalLeadId,
      'Enterprise CLM Modernization & Automated Vendor Indemnity Auditing',
      'Legal_Compliance',
      'Vendor_Procurement',
      290000.00,
      '2026-10-31',
      JSON.stringify(['Finance', 'Engineering', 'Operations', 'Product_Strategy']),
      'Implement enterprise contract lifecycle management platform with automated NDA, MSA, and DPA vendor liability extraction.',
      'Procurement of enterprise CLM platform to replace manual PDF redlining. Standardizes limitation of liability clauses, IP assignments, and GDPR Article 28 data processor agreements. Integrates with Salesforce and Jira Service Desk.',
      'Draft'
    );

    // 5. Operations Autonomous Logistics & Edge Fulfillment Routing
    insertInit.run(
      init5Id,
      adminId,
      'Project Hermes: Automated Fulfillment & Edge Telemetry Optimization',
      'Operations',
      'Strategic_Roadmap',
      2100000.00,
      '2027-04-30',
      JSON.stringify(['Engineering', 'Finance', 'Legal_Compliance']),
      'End-to-end telemetry and automated dispatch routing for 6 regional fulfillment distribution hubs.',
      'Integrates IoT telemetry from fleet vehicles and robotic sorting conveyors into a unified dispatch pipeline. Expected to reduce carrier transfer turnaround by 28% and save $3.4M annually in shipping surcharges.',
      'Approved'
    );

    // Seed AI Evaluations
    const insertEval = sqlite.prepare(`
      INSERT INTO ai_evaluations (
        id, initiative_id, overall_risk_score, financial_impact_score,
        operational_friction_score, compliance_risk_score, strategic_alignment_summary,
        cross_departmental_dependencies, identified_bottlenecks, recommended_mitigations,
        executive_action_verdict, model_version, raw_response
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Evaluation 1 (Titan)
    insertEval.run(
      crypto.randomUUID(),
      init1Id,
      48,
      65,
      72,
      35,
      'Strongly aligns with strategic goal of global enterprise resilience and sub-30ms API latency. High operational friction due to dual-run architecture and database sync requirements.',
      JSON.stringify([
        { department: 'Finance', dependency_description: 'Approval of $450k cloud commitment reserve upfront during dual-run period', friction_level: 'High' },
        { department: 'Operations', dependency_description: 'Establishment of 24/7 on-call shift coverage during live traffic cutover windows', friction_level: 'Medium' },
        { department: 'Legal_Compliance', dependency_description: 'Validation of cross-border data transfer agreements and GDPR data residency compliance', friction_level: 'Low' }
      ]),
      JSON.stringify([
        { stage: 'Data Migration', description: 'Zero-downtime replication of 18TB primary PostgreSQL database to multi-region CockroachDB/Aurora clusters.' },
        { stage: 'Security Review', description: 'SOC2 Type II external pentest sign-off required prior to production DNS failover.' }
      ]),
      JSON.stringify([
        { priority: 'P1', action_item: 'Implement automated canary traffic routing starting at 2% with immediate rollback triggers.' },
        { priority: 'P2', action_item: 'Conduct dry-run disaster recovery failover during low-traffic maintenance window.' },
        { priority: 'P3', action_item: 'Sign annual enterprise discount agreement with AWS/GCP to cap dual-run cloud egress costs.' }
      ]),
      'Standard_Review',
      'gemini-2.5-flash',
      JSON.stringify({ status: 'completed', engine: 'NexusAI-Deterministic-Auditor' })
    );

    // Evaluation 2 (Finance Ledger)
    insertEval.run(
      crypto.randomUUID(),
      init2Id,
      28,
      32,
      40,
      18,
      'High-ROI automation initiative with rapid payback period (estimated 4.2 months). Minimal compliance risk given adherence to existing SOX control matrices.',
      JSON.stringify([
        { department: 'Engineering', dependency_description: 'Provisioning dedicated VPC peering for bank SFTP & REST API connections', friction_level: 'Low' },
        { department: 'Legal_Compliance', dependency_description: 'External auditor (KPMG) verification of automated ledger sampling algorithms', friction_level: 'Medium' }
      ]),
      JSON.stringify([
        { stage: 'Bank Integration', description: 'API rate limits and legacy batch formats from two APAC banking providers.' }
      ]),
      JSON.stringify([
        { priority: 'P1', action_item: 'Establish shadow parallel ledger run for Q3 close before deprecating manual spreadsheets.' },
        { priority: 'P2', action_item: 'Enforce dual-key authorization for ledger adjustment thresholds exceeding $50,000.' }
      ]),
      'Fast_Track_Approval',
      'gemini-2.5-flash',
      JSON.stringify({ status: 'completed', engine: 'NexusAI-Deterministic-Auditor' })
    );

    // Evaluation 3 (HR Equity)
    insertEval.run(
      crypto.randomUUID(),
      init3Id,
      62,
      50,
      45,
      88,
      'Critical strategic initiative for distributed talent retention, but carries extreme international tax withholding and permanent establishment risks if mismanaged.',
      JSON.stringify([
        { department: 'Finance', dependency_description: 'Currency hedging model for foreign currency denominated salary guarantees', friction_level: 'High' },
        { department: 'Legal_Compliance', dependency_description: 'Comprehensive tax exposure analysis across Germany, Japan, and Singapore', friction_level: 'High' }
      ]),
      JSON.stringify([
        { stage: 'Regulatory Compliance', description: 'Foreign entity establishment vs. EOR contract structuring for equity grant taxation.' }
      ]),
      JSON.stringify([
        { priority: 'P1', action_item: 'Mandate formal legal sign-off on phantom stock alternatives for APAC employees.' },
        { priority: 'P2', action_item: 'Establish clear residency notification deadlines for remote employees changing tax domiciles.' }
      ]),
      'Escalate_To_Legal',
      'gemini-2.5-flash',
      JSON.stringify({ status: 'completed', engine: 'NexusAI-Deterministic-Auditor' })
    );

    // Seed Workflow Action
    const insertAction = sqlite.prepare(`
      INSERT INTO workflow_actions (id, initiative_id, reviewer_id, from_stage, to_stage, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertAction.run(
      crypto.randomUUID(),
      init1Id,
      leadId,
      'Draft',
      'Under_Review',
      'Submitted Titan architecture brief after initial review with Staff DevOps committee. Ready for cross-dept evaluation.'
    );

    insertAction.run(
      crypto.randomUUID(),
      init2Id,
      adminId,
      'Compliance_Pending',
      'Approved',
      'SOX compliance review completed with external auditors. Fast-tracking budget allocation.'
    );

    // Seed Audit Logs
    const insertAudit = sqlite.prepare(`
      INSERT INTO audit_logs (id, actor_id, action_type, entity_type, entity_id, metadata, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertAudit.run(
      crypto.randomUUID(),
      leadId,
      'INITIATIVE_CREATED',
      'initiative',
      init1Id,
      JSON.stringify({ title: 'Project Titan', budget: 1450000 }),
      '10.0.4.12'
    );

    insertAudit.run(
      crypto.randomUUID(),
      leadId,
      'AI_EVALUATION_EXECUTED',
      'ai_evaluation',
      init1Id,
      JSON.stringify({ verdict: 'Standard_Review', overall_risk_score: 48 }),
      '10.0.4.12'
    );

    insertAudit.run(
      crypto.randomUUID(),
      adminId,
      'STAGE_TRANSITIONED',
      'initiative',
      init2Id,
      JSON.stringify({ from_stage: 'Compliance_Pending', to_stage: 'Approved', notes: 'SOX signoff' }),
      '10.0.1.5'
    );

    console.log('Enterprise database initialization & seeding complete.');
  }
}
