import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { MetricCard } from '../components/dashboard/MetricCard.tsx';
import { RiskRadar } from '../components/dashboard/RiskRadar.tsx';
import { Badge } from '../components/common/Badge.tsx';
import {
  Activity,
  DollarSign,
  AlertTriangle,
  FileCheck,
  PlusCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/metrics/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent mx-auto" />
          <p className="text-xs text-slate-400">Aggregating cross-departmental intelligence...</p>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    total_initiatives: 5,
    active_workflows: 3,
    approved_count: 2,
    compliance_pending_count: 1,
    total_capital: 4810000,
    total_bottlenecks: 5,
    risk_index: { overall: 46, financial: 49, operational: 52, compliance: 47 }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Enterprise Orchestration Hub</h1>
            <Badge label={user?.department || 'Operations'} variant="dept" size="sm" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-agent impact synthesis and cross-functional governance pipelines
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/intelligence"
            className="flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-500/10 px-3.5 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>Query Knowledge Base</span>
          </Link>
          <Link
            to="/initiatives/new"
            className="flex items-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-cyan-500/20 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Propose Initiative</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Workflows"
          value={metrics.active_workflows}
          subtitle={`${metrics.compliance_pending_count} pending compliance sign-off`}
          icon={Activity}
          accentColor="cyan"
          badge={{ text: 'Stage Velocity', trend: 'up' }}
        />
        <MetricCard
          title="Total Capital Exposure"
          value={formatCurrency(metrics.total_capital)}
          subtitle="Allocated across all strategic pipelines"
          icon={DollarSign}
          accentColor="emerald"
          badge={{ text: 'Approved & Active', trend: 'neutral' }}
        />
        <MetricCard
          title="Identified Bottlenecks"
          value={metrics.total_bottlenecks}
          subtitle="Cross-team operational friction points"
          icon={AlertTriangle}
          accentColor="amber"
          badge={{ text: 'Action Required', trend: 'alert' }}
        />
        <MetricCard
          title="System Risk Index"
          value={`${metrics.risk_index.overall}/100`}
          subtitle="Weighted cross-departmental impact"
          icon={FileCheck}
          accentColor="purple"
          badge={{ text: metrics.risk_index.overall > 50 ? 'Moderate' : 'Low', trend: 'neutral' }}
        />
      </div>

      {/* AI Risk Radar Section */}
      <RiskRadar
        overall={metrics.risk_index.overall}
        financial={metrics.risk_index.financial}
        operational={metrics.risk_index.operational}
        compliance={metrics.risk_index.compliance}
      />

      {/* Two Column Section: Recent Initiatives & Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Initiatives (2 columns) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                Active Strategic Initiatives
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Automated evaluations and workflow progression</p>
            </div>
            <Link
              to="/initiatives"
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800">
            {(!data?.recentInitiatives || data.recentInitiatives.length === 0) ? (
              <p className="py-8 text-center text-xs text-slate-500">No initiatives submitted yet.</p>
            ) : (
              data.recentInitiatives.map((item: any) => (
                <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/50 px-2 rounded-lg transition">
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/initiatives/${item.id}`}
                      className="text-xs font-semibold text-slate-200 hover:text-cyan-400 transition block truncate"
                    >
                      {item.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <Badge label={item.department} variant="dept" size="sm" />
                      <span>•</span>
                      <span>Budget: <strong className="text-slate-300 font-mono">${Number(item.budget).toLocaleString()}</strong></span>
                      <span>•</span>
                      <span>By {item.author_name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase">AI Risk</div>
                      <div className="font-mono text-xs font-bold text-slate-300">
                        {item.overall_risk_score ? `${item.overall_risk_score}/100` : 'Pending'}
                      </div>
                    </div>
                    <Badge label={item.current_stage} variant="stage" size="sm" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Department Capital & Initiatives Breakdown (1 column) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Department Breakdown
              </h3>
              <span className="text-[11px] text-slate-500">Resource allocation</span>
            </div>

            <div className="space-y-3">
              {(data?.departmentDistribution || []).map((dept: any) => (
                <div key={dept.department} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <div className="flex items-center justify-between">
                    <Badge label={dept.department} variant="dept" size="sm" />
                    <span className="text-xs font-mono font-bold text-slate-200">
                      ${Number(dept.total_budget).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{dept.count} active initiatives</span>
                    <span className="text-slate-500">Pipeline Share</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Audit Snippet */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-cyan-400" />
                <span>Recent Audit Activity</span>
              </span>
              <Link to="/audit-log" className="text-cyan-400 hover:underline text-[11px]">
                Full Trail →
              </Link>
            </div>
            <div className="space-y-1.5 text-[11px]">
              {(data?.recentAudits || []).slice(0, 3).map((audit: any) => (
                <div key={audit.id} className="truncate text-slate-400">
                  <span className="font-mono text-cyan-400">{audit.action_type}</span> by{' '}
                  <span className="text-slate-300">{audit.actor_name || 'System'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
