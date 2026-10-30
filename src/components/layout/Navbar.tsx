import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';
import { Badge } from '../common/Badge.tsx';
import {
  Sparkles,
  PlusCircle,
  LogOut,
  Cpu,
  ChevronDown,
  UserCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, quickSwitchRole } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Brand & AI Engine Indicator */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">NexusAI</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">ENTERPRISE</span>
            </div>
            <p className="text-[10px] text-slate-400">Deterministic Workflow Orchestrator</p>
          </div>
        </Link>

        {/* Gemini Engine Badge */}
        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400 flex items-center gap-1">
            Engine: <strong className="text-slate-200 font-mono">gemini-2.5-flash</strong>
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Role Switcher for Easy RBAC Testing */}
        <div className="relative">
          <button
            onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/90 px-2.5 py-1.5 text-xs text-slate-300 hover:border-slate-600 hover:text-white transition"
            title="Switch discrete enterprise roles to verify RBAC access permissions"
          >
            <UserCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden lg:inline text-slate-400">RBAC Role:</span>
            <span className="font-semibold text-slate-200">{user?.role?.replace('_', ' ')}</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {roleSwitcherOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50">
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1">
                Instant Role Verification
              </div>
              <button
                onClick={() => { quickSwitchRole('Admin'); setRoleSwitcherOpen(false); }}
                className={`w-full text-left p-2 rounded-lg text-xs flex flex-col gap-0.5 transition ${
                  user?.role === 'Admin' ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="font-semibold flex items-center justify-between">
                  <span>👑 Admin (Victoria Vance)</span>
                  {user?.role === 'Admin' && <span className="text-[10px] text-amber-400 font-mono">ACTIVE</span>}
                </div>
                <span className="text-[10px] text-slate-400">Global privileges, overrides & full audit</span>
              </button>
              <button
                onClick={() => { quickSwitchRole('Department_Lead'); setRoleSwitcherOpen(false); }}
                className={`w-full text-left p-2 rounded-lg text-xs flex flex-col gap-0.5 mt-1 transition ${
                  user?.role === 'Department_Lead' ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="font-semibold flex items-center justify-between">
                  <span>🛡️ Dept Lead (Sarah Chen)</span>
                  {user?.role === 'Department_Lead' && <span className="text-[10px] text-blue-400 font-mono">ACTIVE</span>}
                </div>
                <span className="text-[10px] text-slate-400">Approvals & stage transitions for Dept</span>
              </button>
              <button
                onClick={() => { quickSwitchRole('Analyst'); setRoleSwitcherOpen(false); }}
                className={`w-full text-left p-2 rounded-lg text-xs flex flex-col gap-0.5 mt-1 transition ${
                  user?.role === 'Analyst' ? 'bg-slate-700/40 border border-slate-600 text-slate-200' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="font-semibold flex items-center justify-between">
                  <span>📊 Analyst (Marcus Vance)</span>
                  {user?.role === 'Analyst' && <span className="text-[10px] text-slate-400 font-mono">ACTIVE</span>}
                </div>
                <span className="text-[10px] text-slate-400">Read & draft only; restricted governance</span>
              </button>
            </div>
          )}
        </div>

        {/* Intelligence CTA */}
        <Link
          to="/intelligence"
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-300 hover:bg-purple-500/20 transition"
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          <span>Ask NexusAI</span>
        </Link>

        {/* New Initiative CTA */}
        <Link
          to="/initiatives/new"
          className="flex items-center gap-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-cyan-500/20 transition"
        >
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">New Initiative</span>
        </Link>

        {/* User Menu */}
        <div className="relative pl-2 border-l border-slate-800">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-900 transition"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="hidden xl:block text-left text-xs">
              <div className="font-semibold text-slate-200 truncate max-w-[120px]">{user?.full_name}</div>
              <div className="text-[10px] text-slate-400">{user?.department}</div>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50">
              <div className="p-2 border-b border-slate-800">
                <div className="font-semibold text-xs text-slate-200">{user?.full_name}</div>
                <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                <div className="mt-2 flex gap-1.5">
                  <Badge label={user?.role || 'Analyst'} variant="role" size="sm" />
                  <Badge label={user?.department || 'Operations'} variant="dept" size="sm" />
                </div>
              </div>

              <div className="mt-1 pt-1">
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
