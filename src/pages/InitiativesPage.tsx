import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, Initiative } from '../services/api.ts';
import { Badge } from '../components/common/Badge.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Layers,
  Search,
  Filter,
  PlusCircle,
  Calendar,
  DollarSign,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const InitiativesPage: React.FC = () => {
  const { user } = useAuth();
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [stage, setStage] = useState('ALL');
  const [myDeptOnly, setMyDeptOnly] = useState(false);

  const fetchInitiatives = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (department !== 'ALL') params.append('department', department);
      if (stage !== 'ALL') params.append('stage', stage);
      if (search.trim()) params.append('search', search.trim());
      if (myDeptOnly) params.append('my_dept', 'true');

      const res = await api.get(`/initiatives?${params.toString()}`);
      setInitiatives(res.data.initiatives || []);
    } catch (err) {
      console.error('Failed to load initiatives:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitiatives();
  }, [department, stage, myDeptOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInitiatives();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Layers className="h-6 w-6 text-cyan-400" />
            Enterprise Initiatives Repository
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Searchable catalog of organizational proposals, strategic memos, and automated risk audits
          </p>
        </div>

        <Link
          to="/initiatives/new"
          className="flex items-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-cyan-500/20 transition self-start md:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Initiative</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search initiatives by title, strategic keywords, or proposal content..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Filter className="h-3.5 w-3.5 text-cyan-400" />
              <span>Department:</span>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200 focus:outline-none"
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

            <div className="flex items-center gap-1.5 text-slate-400">
              <span>Stage:</span>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Stages</option>
                <option value="Draft">Draft</option>
                <option value="Under_Review">Under Review</option>
                <option value="Compliance_Pending">Compliance Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={myDeptOnly}
              onChange={(e) => setMyDeptOnly(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
            />
            <span>Affecting my department ({user?.department})</span>
          </label>
        </div>
      </div>

      {/* Initiatives Cards Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent mx-auto" />
          <p className="text-xs text-slate-400">Querying corporate vaults...</p>
        </div>
      ) : initiatives.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center">
          <Layers className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No initiatives match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, clearing filters, or submit a new enterprise proposal.
          </p>
          <div className="mt-4">
            <Link
              to="/initiatives/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Propose Initiative</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {initiatives.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Badge label={item.department} variant="dept" size="sm" />
                  <Badge label={item.current_stage} variant="stage" size="sm" />
                </div>

                <Link
                  to={`/initiatives/${item.id}`}
                  className="text-base font-bold text-slate-100 hover:text-cyan-400 transition line-clamp-1"
                >
                  {item.title}
                </Link>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>

                {/* AI Evaluation Pill if evaluated */}
                {item.overall_risk_score !== undefined && item.overall_risk_score !== null && (
                  <div className="mt-4 rounded-xl border border-slate-800/80 bg-slate-950/70 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-cyan-400" />
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-mono">Gemini Risk Score</div>
                        <div className="text-xs font-bold font-mono text-slate-200">
                          {item.overall_risk_score}/100
                        </div>
                      </div>
                    </div>
                    {item.executive_action_verdict && (
                      <Badge label={item.executive_action_verdict} variant="verdict" size="sm" />
                    )}
                  </div>
                )}

                {/* Impacted Stakeholders */}
                {item.impacted_departments && item.impacted_departments.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Stakeholders:</span>
                    {item.impacted_departments.map((d) => (
                      <span key={d} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {d.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-mono text-slate-300 font-semibold">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                    ${Number(item.budget).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Calendar className="h-3 w-3" />
                    {item.target_date}
                  </span>
                </div>

                <Link
                  to={`/initiatives/${item.id}`}
                  className="flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300 transition"
                >
                  <span>Deep-Dive</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
