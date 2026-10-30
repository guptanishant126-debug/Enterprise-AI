import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, Initiative, AiEvaluation, WorkflowAction } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { Badge } from '../components/common/Badge.tsx';
import { EvaluationMatrix } from '../components/initiatives/EvaluationMatrix.tsx';
import { StageTransitionModal } from '../components/workflow/StageTransitionModal.tsx';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  Clock,
  GitFork,
  FileText,
  History,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';

export const InitiativeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [evaluation, setEvaluation] = useState<AiEvaluation | null>(null);
  const [history, setHistory] = useState<WorkflowAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transitionModalOpen, setTransitionModalOpen] = useState(false);
  const [reevaluating, setReevaluating] = useState(false);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/initiatives/${id}`);
      setInitiative(res.data.initiative);
      setEvaluation(res.data.evaluation);
      setHistory(res.data.workflow_history || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load initiative deep dive.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleReevaluate = async () => {
    if (!id) return;
    setReevaluating(true);
    try {
      const res = await api.post(`/initiatives/${id}/re-evaluate`);
      setEvaluation(res.data.evaluation);
      await fetchDetails();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Re-evaluation audit failed.');
    } finally {
      setReevaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent mx-auto" />
          <p className="text-xs text-slate-400">Loading enterprise initiative dossier...</p>
        </div>
      </div>
    );
  }

  if (error || !initiative) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-center max-w-lg mx-auto">
        <h3 className="text-base font-bold text-rose-300">Initiative Record Not Found</h3>
        <p className="text-xs text-rose-200 mt-1">{error || 'The requested dossier could not be retrieved.'}</p>
        <Link
          to="/initiatives"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Initiatives Repository</span>
        </Link>
      </div>
    );
  }

  const canTransition = user?.role === 'Admin' || user?.role === 'Department_Lead';
  const canReevaluate = user?.role === 'Admin' || user?.role === 'Department_Lead';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back Link & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/initiatives"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Repository</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTransitionModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-cyan-500/20 transition"
          >
            <GitFork className="h-4 w-4" />
            <span>Workflow Stage Action</span>
          </button>
        </div>
      </div>

      {/* Main Initiative Overview Dossier */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <Badge label={initiative.department} variant="dept" size="md" />
              <Badge label={initiative.current_stage} variant="stage" size="md" />
              <span className="text-xs font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                {initiative.initiative_type.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              {initiative.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <div className="text-[10px] text-slate-500 uppercase">Allocated Capital</div>
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-0.5 mt-0.5">
                <DollarSign className="h-3.5 w-3.5" />
                <span>{Number(initiative.budget).toLocaleString()} USD</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <div className="text-[10px] text-slate-500 uppercase">Target Date</div>
              <div className="text-sm font-bold text-slate-200 flex items-center gap-1.5 mt-0.5">
                <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                <span>{initiative.target_date}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-500" />
            <span>Author: <strong className="text-slate-200">{initiative.author_name}</strong> ({initiative.author_department})</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" />
            <span>Registered: <strong className="text-slate-200">{new Date(initiative.created_at).toLocaleDateString()}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-slate-500" />
            <span>Stakeholders: <strong className="text-slate-200">{initiative.impacted_departments.join(', ')}</strong></span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Executive Summary
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            {initiative.summary}
          </p>
        </div>
      </div>

      {/* AI Impact Evaluation Section */}
      {evaluation ? (
        <EvaluationMatrix
          evaluation={evaluation}
          canReevaluate={canReevaluate}
          onReevaluate={handleReevaluate}
          reevaluating={reevaluating}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center space-y-3">
          <p className="text-xs text-slate-400">AI Evaluation has not yet completed for this initiative.</p>
          {canReevaluate && (
            <button
              onClick={handleReevaluate}
              disabled={reevaluating}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950"
            >
              <span>{reevaluating ? 'Evaluating...' : 'Trigger Gemini Evaluation'}</span>
            </button>
          )}
        </div>
      )}

      {/* Detailed Proposal Content */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-4">
          <FileText className="h-4 w-4 text-cyan-400" />
          Full Context & Technical Proposal Documentation
        </h3>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
          {initiative.raw_content}
        </div>
      </div>

      {/* Workflow Approval History & Audit Trail */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-4">
          <History className="h-4 w-4 text-purple-400" />
          Workflow Stage History & Departmental Sign-offs ({history.length})
        </h3>

        {history.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No formal stage transitions recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {history.map((action) => (
              <div key={action.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge label={action.from_stage} variant="stage" size="sm" />
                    <span className="text-slate-500 text-xs">→</span>
                    <Badge label={action.to_stage} variant="stage" size="sm" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {new Date(action.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="text-xs text-slate-300">
                  Reviewed by <strong className="text-slate-100">{action.reviewer_name}</strong>{' '}
                  <span className="text-slate-500">({action.reviewer_role} • {action.reviewer_department})</span>
                </div>

                {action.notes && (
                  <div className="rounded-lg bg-slate-900 p-3 text-xs text-slate-300 border border-slate-800 font-sans">
                    <span className="text-slate-500 font-semibold mr-1">Rationale:</span>
                    {action.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Modal */}
      <StageTransitionModal
        isOpen={transitionModalOpen}
        onClose={() => setTransitionModalOpen(false)}
        initiativeId={initiative.id}
        initiativeTitle={initiative.title}
        currentStage={initiative.current_stage}
        onTransitionSuccess={fetchDetails}
      />
    </div>
  );
};
