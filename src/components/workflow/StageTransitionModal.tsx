import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Badge } from '../common/Badge.tsx';
import { X, CheckCircle, AlertOctagon } from 'lucide-react';

interface StageTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initiativeId: string;
  initiativeTitle: string;
  currentStage: string;
  onTransitionSuccess: () => void;
}

const STAGES = ['Draft', 'Under_Review', 'Compliance_Pending', 'Approved', 'Rejected', 'Archived'];

export const StageTransitionModal: React.FC<StageTransitionModalProps> = ({
  isOpen,
  onClose,
  initiativeId,
  initiativeTitle,
  currentStage,
  onTransitionSuccess,
}) => {
  const { user } = useAuth();
  const [targetStage, setTargetStage] = useState<string>('Under_Review');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError('Reviewer rationale and governance notes are mandatory for audit compliance.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/initiatives/${initiativeId}/stage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('nexus_token')}`,
        },
        body: JSON.stringify({
          to_stage: targetStage,
          notes: notes.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update workflow stage.');
      }

      onTransitionSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error authorizing transition');
    } finally {
      setSubmitting(false);
    }
  };

  const isAnalyst = user?.role === 'Analyst';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100">Workflow Stage Transition</h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-md">{initiativeTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isAnalyst ? (
          <div className="py-6 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
              <AlertOctagon className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200">Governance Authorization Required</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Analysts are restricted to viewing and submitting drafts. Stage sign-offs require <strong>Department_Lead</strong> or <strong>Admin</strong> credentials.
            </p>
            <div className="pt-2">
              <span className="text-xs text-cyan-400">Tip: Use the top-right RBAC switcher to test as Sarah Chen (Lead) or Admin.</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Current Stage
              </label>
              <Badge label={currentStage} variant="stage" size="md" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Transition to Stage
              </label>
              <select
                value={targetStage}
                onChange={(e) => setTargetStage(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                {STAGES.filter(s => s !== currentStage).map((stage) => (
                  <option key={stage} value={stage}>
                    {stage.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Reviewer Rationale & Audit Notes <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Provide justification, compliance references, or conditions for this stage transition..."
                rows={3}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none resize-none"
              />
              <span className="text-[11px] text-slate-500">
                This note is cryptographically logged in the immutable audit trail with your identity.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-cyan-500/20 disabled:opacity-50 transition"
              >
                <CheckCircle className="h-4 w-4" />
                <span>{submitting ? 'Recording Transition...' : 'Authorize Stage Transition'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
