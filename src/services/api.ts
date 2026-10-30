import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject JWT bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('nexus_token');
      localStorage.removeItem('nexus_user');
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  email: string;
  full_name: string;
  department: string;
  role: 'Admin' | 'Department_Lead' | 'Analyst';
}

export interface Initiative {
  id: string;
  author_id: string;
  title: string;
  department: string;
  initiative_type: string;
  budget: number;
  target_date: string;
  impacted_departments: string[];
  summary: string;
  raw_content: string;
  current_stage: 'Draft' | 'Under_Review' | 'Compliance_Pending' | 'Approved' | 'Rejected' | 'Archived';
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_email?: string;
  author_department?: string;
  overall_risk_score?: number;
  financial_impact_score?: number;
  operational_friction_score?: number;
  compliance_risk_score?: number;
  executive_action_verdict?: string;
  strategic_alignment_summary?: string;
}

export interface AiEvaluation {
  id: string;
  initiative_id: string;
  overall_risk_score: number;
  financial_impact_score: number;
  operational_friction_score: number;
  compliance_risk_score: number;
  strategic_alignment_summary: string;
  cross_departmental_dependencies: Array<{
    department: string;
    dependency_description: string;
    friction_level: 'Low' | 'Medium' | 'High';
  }>;
  identified_bottlenecks: Array<{
    stage: string;
    description: string;
  }>;
  recommended_mitigations: Array<{
    priority: 'P1' | 'P2' | 'P3';
    action_item: string;
  }>;
  executive_action_verdict: 'Fast_Track_Approval' | 'Standard_Review' | 'Escalate_To_Legal' | 'Require_Budget_Revision' | 'Reject';
  model_version: string;
  created_at: string;
}

export interface WorkflowAction {
  id: string;
  initiative_id: string;
  reviewer_id: string;
  from_stage: string;
  to_stage: string;
  notes?: string;
  created_at: string;
  reviewer_name?: string;
  reviewer_email?: string;
  reviewer_department?: string;
  reviewer_role?: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action_type: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, any>;
  ip_address: string;
  created_at: string;
  actor_name?: string;
  actor_email?: string;
  actor_department?: string;
  actor_role?: string;
}
