import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { Badge } from '../common/Badge.tsx';
import {
  LayoutDashboard,
  Layers,
  FilePlus,
  GitPullRequest,
  Sparkles,
  ShieldCheck,
  Lock,
  Building2,
  HelpCircle
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isAnalyst = user?.role === 'Analyst';

  const navItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Initiatives Repository', to: '/initiatives', icon: Layers },
    { name: 'Ingest Proposal', to: '/initiatives/new', icon: FilePlus },
    { name: 'Workflow Pipeline', to: '/workflows', icon: GitPullRequest },
    { name: 'Enterprise Intelligence', to: '/intelligence', icon: Sparkles, highlight: true },
    { 
      name: 'Compliance Audit Log', 
      to: '/audit-log', 
      icon: ShieldCheck, 
      locked: isAnalyst,
      tooltip: isAnalyst ? 'Admin & Lead Restricted' : undefined
    },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-slate-800 bg-slate-950/70 p-4 justify-between backdrop-blur-md">
      <div>
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Core Workflows
        </div>

        <nav className="space-y-1.5 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.locked) {
              return (
                <div
                  key={item.name}
                  className="group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-600 cursor-not-allowed border border-transparent"
                  title="Restricted by Enterprise RBAC (Admin & Department Lead only)"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-slate-600" />
                    <span>{item.name}</span>
                  </div>
                  <Lock className="h-3.5 w-3.5 text-slate-600" />
                </div>
              );
            }

            return (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                    isActive
                      ? item.highlight
                        ? 'border border-purple-500/40 bg-purple-500/15 text-purple-300 shadow-sm'
                        : 'border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 shadow-sm'
                      : item.highlight
                      ? 'text-purple-400 hover:bg-purple-950/30 hover:text-purple-300 border border-transparent'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </div>
                {item.highlight && (
                  <span className="flex h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Enterprise Governance Section */}
        <div className="mt-8">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Enterprise Governance
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 mt-1 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Department</span>
              </span>
              <span className="font-semibold text-slate-200">{user?.department}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 pt-1.5 border-t border-slate-800">
              <span>RBAC Tier</span>
              <Badge label={user?.role || 'Analyst'} variant="role" size="sm" />
            </div>
            <div className="flex items-center justify-between text-slate-400 pt-1.5 border-t border-slate-800 text-[11px]">
              <span>Audit Hash</span>
              <span className="font-mono text-[10px] text-slate-400">SHA256-OK</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-300">NexusAI Platform</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">v2.5 PROD</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Deterministic Zod-enforced schema pipeline. Multi-department impact auditing enabled.
        </p>
      </div>
    </aside>
  );
};
