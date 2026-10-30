import React from 'react';

export interface BadgeProps {
  label: string;
  variant?: 'stage' | 'role' | 'friction' | 'verdict' | 'dept' | 'priority' | 'default';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-semibold px-2.5 py-1',
    lg: 'text-sm font-semibold px-3 py-1.5'
  }[size];

  // Stage styles
  if (variant === 'stage') {
    switch (label) {
      case 'Approved':
        return <span className={`inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 ${sizeClasses}`}>✓ Approved</span>;
      case 'Under_Review':
        return <span className={`inline-flex items-center rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-400 ${sizeClasses}`}>⏳ Under Review</span>;
      case 'Compliance_Pending':
        return <span className={`inline-flex items-center rounded-md border border-purple-500/30 bg-purple-500/10 text-purple-400 ${sizeClasses}`}>⚖️ Compliance Pending</span>;
      case 'Rejected':
        return <span className={`inline-flex items-center rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-400 ${sizeClasses}`}>✕ Rejected</span>;
      case 'Archived':
        return <span className={`inline-flex items-center rounded-md border border-slate-700 bg-slate-800 text-slate-400 ${sizeClasses}`}>📁 Archived</span>;
      case 'Draft':
      default:
        return <span className={`inline-flex items-center rounded-md border border-slate-700 bg-slate-800/80 text-slate-300 ${sizeClasses}`}>📝 Draft</span>;
    }
  }

  // Role styles
  if (variant === 'role') {
    switch (label) {
      case 'Admin':
        return <span className={`inline-flex items-center rounded-md border border-amber-500/30 bg-amber-500/15 text-amber-300 ${sizeClasses}`}>👑 Admin</span>;
      case 'Department_Lead':
        return <span className={`inline-flex items-center rounded-md border border-blue-500/30 bg-blue-500/15 text-blue-300 ${sizeClasses}`}>🛡️ Lead</span>;
      case 'Analyst':
      default:
        return <span className={`inline-flex items-center rounded-md border border-slate-600 bg-slate-800 text-slate-300 ${sizeClasses}`}>📊 Analyst</span>;
    }
  }

  // Friction styles
  if (variant === 'friction') {
    switch (label) {
      case 'High':
        return <span className={`inline-flex items-center rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 ${sizeClasses}`}>● High Friction</span>;
      case 'Medium':
        return <span className={`inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 ${sizeClasses}`}>● Medium Friction</span>;
      case 'Low':
      default:
        return <span className={`inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 ${sizeClasses}`}>● Low Friction</span>;
    }
  }

  // Verdict styles
  if (variant === 'verdict') {
    switch (label) {
      case 'Fast_Track_Approval':
        return <span className={`inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 ${sizeClasses}`}>⚡ Fast-Track Approval</span>;
      case 'Standard_Review':
        return <span className={`inline-flex items-center rounded-md border border-blue-500/30 bg-blue-500/15 text-blue-300 ${sizeClasses}`}>📋 Standard Review</span>;
      case 'Escalate_To_Legal':
        return <span className={`inline-flex items-center rounded-md border border-purple-500/30 bg-purple-500/15 text-purple-300 ${sizeClasses}`}>⚖️ Escalate to Legal</span>;
      case 'Require_Budget_Revision':
        return <span className={`inline-flex items-center rounded-md border border-amber-500/30 bg-amber-500/15 text-amber-300 ${sizeClasses}`}>💰 Require Budget Revision</span>;
      case 'Reject':
        return <span className={`inline-flex items-center rounded-md border border-rose-500/30 bg-rose-500/15 text-rose-300 ${sizeClasses}`}>🚫 Recommendation: Reject</span>;
      default:
        return <span className={`inline-flex items-center rounded-md border border-slate-700 bg-slate-800 text-slate-300 ${sizeClasses}`}>{label}</span>;
    }
  }

  // Priority styles
  if (variant === 'priority') {
    switch (label) {
      case 'P1':
        return <span className={`inline-flex items-center rounded bg-rose-500/20 text-rose-300 font-bold ${sizeClasses}`}>P1 Critical</span>;
      case 'P2':
        return <span className={`inline-flex items-center rounded bg-amber-500/20 text-amber-300 font-semibold ${sizeClasses}`}>P2 Important</span>;
      case 'P3':
      default:
        return <span className={`inline-flex items-center rounded bg-blue-500/20 text-blue-300 font-medium ${sizeClasses}`}>P3 Standard</span>;
    }
  }

  // Department styles
  if (variant === 'dept') {
    const colors: Record<string, string> = {
      Finance: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300',
      Engineering: 'border-cyan-500/30 bg-cyan-950/40 text-cyan-300',
      Human_Resources: 'border-pink-500/30 bg-pink-950/40 text-pink-300',
      Legal_Compliance: 'border-purple-500/30 bg-purple-950/40 text-purple-300',
      Operations: 'border-amber-500/30 bg-amber-950/40 text-amber-300',
      Product_Strategy: 'border-indigo-500/30 bg-indigo-950/40 text-indigo-300',
    };
    const style = colors[label] || 'border-slate-700 bg-slate-800 text-slate-300';
    const cleanName = label.replace('_', ' ');
    return <span className={`inline-flex items-center rounded-md border ${style} ${sizeClasses}`}>{cleanName}</span>;
  }

  return (
    <span className={`inline-flex items-center rounded-md border border-slate-700 bg-slate-800 text-slate-300 ${sizeClasses}`}>
      {label}
    </span>
  );
};
