import React, { useState, useEffect } from 'react';
import { api, AuditLog } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { Badge } from '../components/common/Badge.tsx';
import {
  ShieldCheck,
  Lock,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Code,
  Calendar,
  UserCheck
} from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const { user, quickSwitchRole } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedMeta, setSelectedMeta] = useState<{ id: string; meta: any } | null>(null);

  const isAnalyst = user?.role === 'Analyst';

  const fetchLogs = async () => {
    if (isAnalyst) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '15' });
      if (actionFilter !== 'ALL') params.append('action_type', actionFilter);

      const res = await api.get(`/audit-logs?${params.toString()}`);
      setLogs(res.data.logs || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, user?.role]);

  if (isAnalyst) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Governance Access Restricted</h2>
        <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
          The enterprise compliance audit log contains cryptographic state transition trails and is strictly restricted to <strong>Admin</strong> and <strong>Department_Lead</strong> roles.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => quickSwitchRole('Admin')}
            className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-semibold text-slate-950 transition"
          >
            <span>Switch to Admin (Victoria Vance)</span>
          </button>
          <button
            onClick={() => quickSwitchRole('Department_Lead')}
            className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2.5 text-xs font-semibold text-blue-300 transition"
          >
            <span>Switch to Lead (Sarah Chen)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-cyan-400" />
            Compliance & Governance Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable, append-only cryptographic log recording every user action, state change, and AI evaluation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="h-3.5 w-3.5 text-cyan-400" />
            <span>Action Type:</span>
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Recorded Actions</option>
              <option value="INITIATIVE_CREATED">INITIATIVE_CREATED</option>
              <option value="AI_EVALUATION_COMPLETED">AI_EVALUATION_COMPLETED</option>
              <option value="STAGE_TRANSITIONED">STAGE_TRANSITIONED</option>
              <option value="AI_EVALUATION_RE_RUN">AI_EVALUATION_RE_RUN</option>
              <option value="INTELLIGENCE_QUERY">INTELLIGENCE_QUERY</option>
              <option value="USER_LOGIN">USER_LOGIN</option>
            </select>
          </div>

          <button
            onClick={fetchLogs}
            className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700"
            title="Refresh logs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent mx-auto" />
            <p className="text-xs text-slate-400">Querying immutable audit chain...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No audit logs match current filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4 text-right">Payload Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/60 transition">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-cyan-400 text-[11px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                        {log.action_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div>
                        <div className="font-semibold text-slate-200">{log.actor_name || 'System Worker'}</div>
                        <div className="text-[10px] text-slate-500">
                          {log.actor_department ? `${log.actor_department} • ${log.actor_role}` : 'Automated Daemon'}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-slate-300 capitalize">{log.entity_type}</div>
                      <div className="font-mono text-[10px] text-slate-500 truncate max-w-[120px]">
                        {log.entity_id}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.ip_address}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedMeta({ id: log.id, meta: log.metadata })}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition"
                      >
                        <Code className="h-3 w-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/60 border-t border-slate-800 text-xs text-slate-400">
          <span>Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="p-1 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="p-1 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metadata Modal */}
      {selectedMeta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Code className="h-4 w-4 text-cyan-400" />
                Audit Record Metadata
              </h3>
              <button
                onClick={() => setSelectedMeta(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white text-xs"
              >
                Close
              </button>
            </div>
            <pre className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-cyan-300 overflow-x-auto max-h-80">
              {JSON.stringify(selectedMeta.meta, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
