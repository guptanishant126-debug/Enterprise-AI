import React from 'react';
import { AiEvaluation } from '../../services/api.ts';
import { Badge } from '../common/Badge.tsx';
import { RiskRadar } from '../dashboard/RiskRadar.tsx';
import {
  Sparkles,
  GitBranch,
  AlertTriangle,
  CheckCircle2,
  Cpu
} from 'lucide-react';

interface EvaluationMatrixProps {
  evaluation: AiEvaluation;
  onReevaluate?: () => void;
  canReevaluate?: boolean;
  reevaluating?: boolean;
}

export const EvaluationMatrix: React.FC<EvaluationMatrixProps> = ({
  evaluation,
  onReevaluate,
  canReevaluate = false,
  reevaluating = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner & Verdict */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Automated AI Impact Evaluation
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                Model: {evaluation.model_version}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-slate-300">Executive Action Verdict:</span>
              <Badge label={evaluation.executive_action_verdict} variant="verdict" size="lg" />
            </div>
          </div>

          {canReevaluate && onReevaluate && (
            <button
              onClick={onReevaluate}
              disabled={reevaluating}
              className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition disabled:opacity-50"
            >
              <Cpu className={`h-4 w-4 ${reevaluating ? 'animate-spin' : ''}`} />
              <span>{reevaluating ? 'Auditing with Gemini...' : 'Re-Run AI Audit'}</span>
            </button>
          )}
        </div>

        {/* Strategic Alignment Summary */}
        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Strategic Alignment & Operational Risk Synthesis
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-sans">
            {evaluation.strategic_alignment_summary}
          </p>
        </div>
      </div>

      {/* 4 Core Risk Vectors */}
      <RiskRadar
        overall={evaluation.overall_risk_score}
        financial={evaluation.financial_impact_score}
        operational={evaluation.operational_friction_score}
        compliance={evaluation.compliance_risk_score}
      />

      {/* Dependencies & Bottlenecks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cross-Departmental Dependencies */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-cyan-400" />
              Cross-Departmental Dependencies ({evaluation.cross_departmental_dependencies?.length || 0})
            </h4>
            <span className="text-[11px] text-slate-400">Inter-team deliverables</span>
          </div>

          <div className="space-y-3">
            {(!evaluation.cross_departmental_dependencies || evaluation.cross_departmental_dependencies.length === 0) ? (
              <p className="text-xs text-slate-500 italic">No external department dependencies detected.</p>
            ) : (
              evaluation.cross_departmental_dependencies.map((dep, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Badge label={dep.department} variant="dept" size="sm" />
                    <Badge label={dep.friction_level} variant="friction" size="sm" />
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {dep.dependency_description}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Identified Bottlenecks */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Identified Operational Bottlenecks ({evaluation.identified_bottlenecks?.length || 0})
            </h4>
            <span className="text-[11px] text-slate-400">Critical path constraints</span>
          </div>

          <div className="space-y-3">
            {(!evaluation.identified_bottlenecks || evaluation.identified_bottlenecks.length === 0) ? (
              <p className="text-xs text-slate-500 italic">No critical bottlenecks identified.</p>
            ) : (
              evaluation.identified_bottlenecks.map((bot, idx) => (
                <div key={idx} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-300">
                      [{bot.stage}]
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {bot.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recommended Mitigations (P1, P2, P3) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Recommended Governance & Risk Mitigations
          </h4>
          <span className="text-[11px] text-slate-400">Priority ordered action items</span>
        </div>

        <div className="space-y-2.5">
          {(!evaluation.recommended_mitigations || evaluation.recommended_mitigations.length === 0) ? (
            <p className="text-xs text-slate-500 italic">No specific mitigations required.</p>
          ) : (
            evaluation.recommended_mitigations.map((mit, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                <Badge label={mit.priority} variant="priority" size="sm" />
                <div className="flex-1 text-xs text-slate-200 font-sans leading-relaxed pt-0.5">
                  {mit.action_item}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
