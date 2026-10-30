import React from 'react';
import { ShieldAlert, DollarSign, Activity, FileCheck } from 'lucide-react';

interface RiskRadarProps {
  overall: number;
  financial: number;
  operational: number;
  compliance: number;
  size?: 'compact' | 'full';
}

export const RiskRadar: React.FC<RiskRadarProps> = ({
  overall,
  financial,
  operational,
  compliance,
  size = 'full',
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return { text: 'text-rose-400', stroke: '#f43f5e', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
    if (score >= 40) return { text: 'text-amber-400', stroke: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    return { text: 'text-emerald-400', stroke: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
  };

  const vectors = [
    { label: 'Overall Enterprise Risk', score: overall, icon: ShieldAlert, desc: 'Weighted synthesis of all cross-functional vectors' },
    { label: 'Financial Impact', score: financial, icon: DollarSign, desc: 'Budget drift, payback velocity, and capital exposure' },
    { label: 'Operational Friction', score: operational, icon: Activity, desc: 'Cross-team bottlenecks and execution complexity' },
    { label: 'Regulatory Compliance', score: compliance, icon: FileCheck, desc: 'SOX, SOC2, GDPR, and legal governance risk' },
  ];

  if (size === 'compact') {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {vectors.map((vec) => {
          const color = getScoreColor(vec.score);
          return (
            <div key={vec.label} className={`p-2.5 rounded-lg border ${color.border} ${color.bg}`}>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="truncate">{vec.label.split(' ')[0]}</span>
                <span className={`font-mono font-bold ${color.text}`}>{vec.score}/100</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${vec.score}%`, backgroundColor: color.stroke }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-cyan-400" />
            AI Risk Vector Radar
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Deterministic evaluation calculated by gemini-2.5-flash</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-emerald-400"><span className="h-2 w-2 rounded-full bg-emerald-500" /> &lt;40 Low</span>
          <span className="flex items-center gap-1 text-amber-400"><span className="h-2 w-2 rounded-full bg-amber-500" /> 40-69 Med</span>
          <span className="flex items-center gap-1 text-rose-400"><span className="h-2 w-2 rounded-full bg-rose-500" /> 70+ High</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {vectors.map((vec) => {
          const color = getScoreColor(vec.score);
          const Icon = vec.icon;
          return (
            <div key={vec.label} className={`p-4 rounded-xl border ${color.border} ${color.bg} flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-slate-900/60 text-slate-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`font-mono text-2xl font-bold ${color.text}`}>
                    {vec.score}
                    <span className="text-xs text-slate-500 font-normal">/100</span>
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-200 mt-1">{vec.label}</div>
                <div className="text-xs text-slate-400 mt-1 line-clamp-2">{vec.desc}</div>
              </div>

              <div className="mt-4">
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${vec.score}%`, backgroundColor: color.stroke }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
