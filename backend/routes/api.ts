import { Router } from 'express';
import { register, login, getMe, getDemoAccounts } from '../controllers/authController.ts';
import {
  listInitiatives,
  getInitiativeById,
  createInitiative,
  updateStage,
  reevaluateInitiative
} from '../controllers/initiativeController.ts';
import { getWorkflowKanban } from '../controllers/workflowController.ts';
import { queryEnterpriseIntelligence } from '../controllers/intelligenceController.ts';
import { getDashboardMetrics } from '../controllers/metricsController.ts';
import { listAuditLogs } from '../controllers/auditController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { validateBody } from '../middleware/validateMiddleware.ts';
import {
  registerSchema,
  loginSchema,
  initiativeCreateSchema,
  stageUpdateSchema
} from '../validators/schemas.ts';

const router = Router();

// 1. Authentication Routes
router.post('/auth/register', validateBody(registerSchema), register);
router.post('/auth/login', validateBody(loginSchema), login);
router.get('/auth/me', authMiddleware, getMe);
router.get('/auth/demo-accounts', getDemoAccounts);

// 2. Initiative Management Routes
router.get('/initiatives', authMiddleware, listInitiatives);
router.post('/initiatives', authMiddleware, validateBody(initiativeCreateSchema), createInitiative);
router.get('/initiatives/:id', authMiddleware, getInitiativeById);
router.patch('/initiatives/:id/stage', authMiddleware, validateBody(stageUpdateSchema), updateStage);
router.post('/initiatives/:id/re-evaluate', authMiddleware, reevaluateInitiative);

// 3. Workflow Pipeline & Kanban
router.get('/workflows/kanban', authMiddleware, getWorkflowKanban);

// 4. Enterprise Intelligence Assistant
router.post('/intelligence/query', authMiddleware, queryEnterpriseIntelligence);

// 5. Executive Metrics & KPI Dashboard
router.get('/metrics/dashboard', authMiddleware, getDashboardMetrics);

// 6. Enterprise Compliance Audit Log
router.get('/audit-logs', authMiddleware, listAuditLogs);

export default router;
