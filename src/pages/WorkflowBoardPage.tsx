import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, Initiative } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { Badge } from '../components/common/Badge.tsx';
import { StageTransitionModal } from '../components/workflow/StageTransitionModal.tsx';
import {
  GitPullRequest,
  Filter,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const STAGES = [
  { key: 'Draft', title: 'Drafting & Ingestion', color: 'border-slate-700 bg-slate-900/60' },
  { key: 'Under_Review', title: 'Under Dept Review', color: 'border-amber-500/30 bg-amber-500/5' },
  { key: 'Compliance_Pending', title: 'Compliance Pending', color: 'border-purple-500/30 bg-purple-500/5' },
  { key: 'Approved', title: 'Approved & Active', color: 'border-emerald-500/30 bg-emerald-500/5' },
  { key: 'Rejected', title: 'Rejected', color: 'border-rose-500/30 bg-rose-500/5' },
  { key: 'Archived', title: 'Archived', color: 'border-slate-800 bg-slate-950/40' },
];

export const WorkflowBoardPage: React.FC = () => {
  const { user } = useAuth();
  const [kanban, setKanban] = useState<Record<string, Initiative[]>>({});
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState('ALL');

  const [activeInitiative, setActiveInitiative] = useState<Initiative | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchKanban = async () => {
    try {
      const params = new URLSearchParams();
      if (department !== 'ALL') params.append('department', department);
      const res = await api.get(`/workflows/kanban?${params.toString()}`);
      setKanban(res.data.kanban || {});
      setMetrics(res.data.stageMetrics || []);
    } catch (err) {
      console.error('Failed to load Kanban pipeline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKanban();
  }, [department]);

  const handleOpenTransition = (item: Initiative) => {
    setActiveInitiative(item);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <GitPullRequest className="h-6 w-6 text-cyan-400" />
            Enterprise Workflow Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Multi-stage governance board tracking state transitions, sign-offs, and compliance gates
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="h-3.5 w-3.5 text-cyan-400" />
            <span>Filter Pipeline:</span>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              <option value="Finance">Finance</option>
              <option value="Engineering">Engineering</option>
              <option value="Human_Resources">Human Resources</option>
              <option value="Legal_Compliance">Legal & Compliance</option>
              <option value="Operations">Operations</option>
              <option value="Product_Strategy">Product Strategy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent mx-auto" />
          <p className="text-xs text-slate-400">Mapping workflow state progressions...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const items = kanban[stage.key] || [];
            const stageMetric = metrics.find((m) => m.stage === stage.key);

            return (
              <div
                key={stage.key}
                className={`rounded-2xl border ${stage.color} p-3.5 flex flex-col min-h-[500px] shadow-sm`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      {stage.title}
                    </h3>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      {items.length} initiatives • ${(stageMetric?.totalBudget || 0).toLocaleString()}
                    </div>
                  </div>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-mono font-bold text-slate-300">
                    {items.length}
                  </span>
                </div>

                {/* Column Items */}
                <div className="mt-3 space-y-3 flex-1">
                  {items.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-[11px] text-slate-600 italic border border-dashed border-slate-800/80 rounded-xl">
                      No initiatives in stage
                    </div>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow hover:border-slate-700 transition flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <Badge label={item.department} variant="dept" size="sm" />
                            {item.overall_risk_score !== undefined && (
                              <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1">
                                <ShieldAlert className="h-3 w-3 text-cyan-400" />
                                {item.overall_risk_score}/100
                              </span>
                            )}
                          </div>

                          <Link
                            to={`/initiatives/${item.id}`}
                            className="text-xs font-bold text-slate-200 hover:text-cyan-400 transition block line-clamp-2"
                          >
                            {item.title}
                          </Link>

                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                            {item.summary}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono text-emerald-400 font-semibold flex items-center">
                              <DollarSign className="h-3 w-3" />
                              {Number(item.budget).toLocaleString()}
                            </span>
                            <span className="text-slate-500">{item.author_name?.split(' ')[0]}</span>
                          </div>

                          {/* Action Button */}
                          <div className="flex items-center justify-between pt-1">
                            <Link
                              to={`/initiatives/${item.id}`}
                              className="text-[10px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                            >
                              <span>Dossier</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </Link>

                            <button
                              onClick={() => handleOpenTransition(item)}
                              className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-1 text-[11px] font-semibold text-cyan-300 transition flex items-center gap-1"
                            >
                              <span>Transition</span>
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transition Modal */}
      {activeInitiative && (
        <StageTransitionModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setActiveInitiative(null); }}
          initiativeId={activeInitiative.id}
          initiativeTitle={activeInitiative.title}
          currentStage={activeInitiative.current_stage}
          onTransitionSuccess={fetchKanban}
        />
      )}
    </div>
  );
};
