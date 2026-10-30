import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    trend: 'up' | 'down' | 'neutral' | 'alert';
  };
  accentColor?: 'cyan' | 'emerald' | 'amber' | 'purple' | 'rose' | 'blue';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  accentColor = 'cyan',
}) => {
  const accentStyles = {
    cyan: { icon: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/20', line: 'bg-cyan-500' },
    emerald: { icon: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/20', line: 'bg-emerald-500' },
    amber: { icon: 'text-amber-400 bg-amber-950/40 border-amber-500/20', line: 'bg-amber-500' },
    purple: { icon: 'text-purple-400 bg-purple-950/40 border-purple-500/20', line: 'bg-purple-500' },
    rose: { icon: 'text-rose-400 bg-rose-950/40 border-rose-500/20', line: 'bg-rose-500' },
    blue: { icon: 'text-blue-400 bg-blue-950/40 border-blue-500/20', line: 'bg-blue-500' },
  }[accentColor];

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm transition hover:border-slate-700">
      <div className={`absolute top-0 left-0 h-1 w-full ${accentStyles.line} opacity-80`} />
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-100 tracking-tight">{value}</div>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div className={`rounded-xl border p-3 ${accentStyles.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {badge && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded font-medium ${
              badge.trend === 'alert'
                ? 'bg-rose-500/20 text-rose-300'
                : badge.trend === 'up'
                ? 'bg-emerald-500/20 text-emerald-300'
                : badge.trend === 'down'
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {badge.text}
          </span>
          <span className="text-slate-500">vs target KPI</span>
        </div>
      )}
    </div>
  );
};
