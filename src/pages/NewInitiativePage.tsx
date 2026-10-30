import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import {
  FilePlus,
  Sparkles,
  ArrowRight,
  Zap,
  Building2,
  DollarSign,
  Calendar,
  AlertCircle
} from 'lucide-react';

const DEPARTMENTS = [
  'Finance',
  'Engineering',
  'Human_Resources',
  'Legal_Compliance',
  'Operations',
  'Product_Strategy',
];

const INITIATIVE_TYPES = [
  { value: 'Strategic_Roadmap', label: 'Strategic Roadmap' },
  { value: 'Budget_Allocation', label: 'Budget Allocation' },
  { value: 'Policy_Update', label: 'Policy Update' },
  { value: 'Infrastructure_Change', label: 'Infrastructure Change' },
  { value: 'Vendor_Procurement', label: 'Vendor Procurement' },
];

const PRESETS = [
  {
    name: 'Zero-Trust Identity & Access Architecture',
    department: 'Engineering',
    initiative_type: 'Infrastructure_Change',
    budget: 850000,
    target_date: '2027-02-28',
    impacted: ['Operations', 'Legal_Compliance', 'Finance'],
    summary: 'Deprecate perimeter corporate VPNs in favor of context-aware BeyondCorp Zero-Trust network access with mandatory FIDO2 hardware security keys for all 4,200 employees.',
    content: 'Full strategic brief to remediate lateral movement vulnerabilities identified during external Red Team penetration testing. This project provisions Cloudflare Access, Okta Adaptive MFA, and automated Jamf/InTune device health attestation. Phase 1 targets engineers with production SSH and database bastion access. Phase 2 extends to corporate Slack, Jira, and Google Workspace. Requires capital expenditure for 5,000 YubiKey 5C NFC tokens, SSO enterprise license uplift, and 2 dedicated security engineers.',
  },
  {
    name: 'Automated Sales Tax Nexus & Global VAT Engine',
    department: 'Finance',
    initiative_type: 'Vendor_Procurement',
    budget: 420000,
    target_date: '2026-12-31',
    impacted: ['Engineering', 'Legal_Compliance', 'Operations'],
    summary: 'Implement real-time multi-jurisdiction sales tax calculations and automated VAT remittance across US states and EU member countries via Stripe Tax and Avalara.',
    content: 'Corporate tax compliance memo addressing multi-state economic nexus exposure following our crossing of South Dakota v. Wayfair thresholds in 14 new US states. Failure to automate tax withholding creates significant retroactive penalty liabilities under state audit. The system hooks into our billing microservice via webhooks, conducts real-time address validation, and produces monthly filing-ready audit export batches for our corporate tax advisory firm.',
  },
  {
    name: 'Mandatory AI Model Governance & Data Privacy Policy',
    department: 'Legal_Compliance',
    initiative_type: 'Policy_Update',
    budget: 180000,
    target_date: '2026-11-15',
    impacted: ['Engineering', 'Product_Strategy', 'Human_Resources'],
    summary: 'Establish strict enterprise acceptable-use boundaries, PII redlining rules, and model licensing guardrails for internal engineering and customer-facing AI features.',
    content: 'Corporate governance mandate conforming to the EU AI Act and California SB 1047 frameworks. Establishes a mandatory model risk registry, forbids ingestion of unanonymized customer confidential information into non-enterprise LLM APIs, and defines high-risk vs. minimal-risk operational tiers. Includes mandatory security training for all product managers and engineers prior to deploying generative AI features to production.',
  },
];

export const NewInitiativePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState(user?.department || 'Engineering');
  const [initiativeType, setInitiativeType] = useState('Strategic_Roadmap');
  const [budget, setBudget] = useState('500000');
  const [targetDate, setTargetDate] = useState('2027-03-31');
  const [impactedDepartments, setImpactedDepartments] = useState<string[]>(['Finance', 'Operations']);
  const [summary, setSummary] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleImpactedDept = (dept: string) => {
    if (impactedDepartments.includes(dept)) {
      setImpactedDepartments(impactedDepartments.filter((d) => d !== dept));
    } else {
      setImpactedDepartments([...impactedDepartments, dept]);
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setTitle(preset.name);
    setDepartment(preset.department);
    setInitiativeType(preset.initiative_type);
    setBudget(preset.budget.toString());
    setTargetDate(preset.target_date);
    setImpactedDepartments(preset.impacted);
    setSummary(preset.summary);
    setRawContent(preset.content);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (impactedDepartments.length === 0) {
      setError('Please select at least one impacted department stakeholder.');
      return;
    }

    if (summary.trim().length < 30) {
      setError('Executive summary must be at least 30 characters long.');
      return;
    }

    if (rawContent.trim().length < 50) {
      setError('Detailed proposal context must be at least 50 characters long.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        department,
        initiative_type: initiativeType,
        budget: parseFloat(budget) || 0,
        target_date: targetDate,
        impacted_departments: impactedDepartments,
        summary: summary.trim(),
        raw_content: rawContent.trim(),
      };

      const res = await api.post('/initiatives', payload);
      const initiativeId = res.data.initiative_id;

      // Navigate straight to the deep dive to see the synthesized AI evaluation
      navigate(`/initiatives/${initiativeId}`);
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.response?.data?.error || err.response?.data?.details?.[0]?.message || 'Failed to submit initiative proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
            <FilePlus className="h-5 w-5" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white">Ingest Enterprise Proposal</h1>
        </div>
        <p className="text-xs text-slate-400">
          Propose strategic initiatives, resource allocations, or policy updates for deterministic Gemini AI impact auditing
        </p>
      </div>

      {/* Quick Test Presets */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          <span>Quick Enterprise Test Templates</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => applyPreset(p)}
              className="text-left p-2.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-cyan-500/40 hover:bg-slate-900 transition text-xs"
            >
              <div className="font-semibold text-slate-200 truncate">{p.name}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{p.department} • ${p.budget.toLocaleString()}</div>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Initiative Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Project Titan: Multi-Region Hybrid Cloud Infrastructure Migration"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Row 1: Department, Type, Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Proposing Department <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Initiative Classification <span className="text-rose-400">*</span>
            </label>
            <select
              value={initiativeType}
              onChange={(e) => setInitiativeType(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
            >
              {INITIATIVE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Estimated Budget (USD) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
              <input
                type="number"
                min="0"
                step="1000"
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Target Date & Stakeholders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target Completion Date <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Impacted Stakeholder Departments <span className="text-rose-400">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {DEPARTMENTS.map((dept) => {
                const isSelected = impactedDepartments.includes(dept);
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => toggleImpactedDept(dept)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                      isSelected
                        ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {dept.replace('_', ' ')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Executive Summary (min 30 chars) <span className="text-rose-400">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="High-level operational overview summarizing objectives, resource demands, and target outcomes..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none resize-none"
          />
        </div>

        {/* Full Context / Proposal */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Detailed Proposal Context & Technical Rationale (min 50 chars) <span className="text-rose-400">*</span>
          </label>
          <textarea
            required
            rows={6}
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            placeholder="Provide technical specifications, vendor quotes, regulatory considerations, migration phasing, or risk trade-offs..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* AI Pipeline Notice & Submit Button */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>Submissions trigger automatic <strong>gemini-2.5-flash</strong> risk synthesis</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-6 py-3 text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                <span>Synthesizing Impact with Gemini...</span>
              </>
            ) : (
              <>
                <span>Submit & Dispatch AI Pipeline</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
