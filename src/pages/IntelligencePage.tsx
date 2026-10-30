import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.ts';
import { Badge } from '../components/common/Badge.tsx';
import {
  Sparkles,
  Send,
  Building2,
  FileText,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  cited_initiatives?: Array<{
    id: string;
    title: string;
    department: string;
    stage: string;
    budget: number;
    risk_score: number;
  }>;
  confidence_rating?: 'High' | 'Medium' | 'Low';
  recommended_followups?: string[];
  timestamp: string;
}

const SAMPLE_PROMPTS = [
  'What are the major compliance bottlenecks across Engineering and Legal?',
  'Summarize all high-friction cross-departmental dependencies impacting Finance.',
  'Which strategic initiatives have capital budgets exceeding $1,000,000?',
  'What mitigations are proposed for global remote employee tax liability?',
];

export const IntelligencePage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [departmentScope, setDepartmentScope] = useState('ALL');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        `Welcome to the **NexusAI Enterprise Knowledge Assistant**.\n\nI have direct contextual indexing across all corporate strategic initiatives, executive risk evaluations, and cross-departmental dependencies.\n\nYou can ask about operational bottlenecks, capital allocation trade-offs, compliance exposures, or cross-functional dependency friction.`,
      confidence_rating: 'High',
      recommended_followups: [
        'What are the primary operational risks in Project Titan?',
        'Which approved initiatives are currently in progress?'
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (questionText: string) => {
    if (!questionText.trim() || loading) return;

    const userMsg: Message = {
      role: 'user',
      content: questionText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.post('/intelligence/query', {
        query: questionText.trim(),
        department_scope: departmentScope,
      });

      const assistantMsg: Message = {
        role: 'assistant',
        content: res.data.answer,
        cited_initiatives: res.data.cited_initiatives || [],
        confidence_rating: res.data.confidence_rating || 'High',
        recommended_followups: res.data.recommended_followups || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        role: 'assistant',
        content: `**Query Processing Error:** ${err.response?.data?.error || 'Unable to synthesize response from enterprise vault.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(query);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <Sparkles className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">Cross-Departmental Knowledge Assistant</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Citation-backed enterprise semantic intelligence powered by Gemini 2.5 Flash
          </p>
        </div>

        {/* Scope selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Context Scope:</span>
          <select
            value={departmentScope}
            onChange={(e) => setDepartmentScope(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">Entire Enterprise (Global)</option>
            <option value="Finance">Finance Vault</option>
            <option value="Engineering">Engineering Vault</option>
            <option value="Human_Resources">Human Resources Vault</option>
            <option value="Legal_Compliance">Legal & Compliance Vault</option>
            <option value="Operations">Operations Vault</option>
            <option value="Product_Strategy">Product Strategy Vault</option>
          </select>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {SAMPLE_PROMPTS.map((promptText, i) => (
          <button
            key={i}
            onClick={() => handleSend(promptText)}
            className="rounded-xl border border-slate-800 bg-slate-900/60 hover:border-purple-500/40 hover:bg-slate-900 px-3 py-1.5 text-xs text-slate-300 transition text-left"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-6 space-y-6 min-h-[480px] max-h-[640px] overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-3xl rounded-2xl p-4 sm:p-5 text-xs leading-relaxed space-y-3 ${
                msg.role === 'user'
                  ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-100 rounded-br-sm'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-bl-sm'
              }`}
            >
              {/* Header inside assistant message */}
              {msg.role === 'assistant' && (
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-[11px]">
                  <span className="font-semibold text-purple-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    NexusAI Enterprise Intelligence
                  </span>
                  {msg.confidence_rating && (
                    <span className="text-slate-400 flex items-center gap-1 font-mono">
                      Confidence: <strong className="text-emerald-400">{msg.confidence_rating}</strong>
                    </span>
                  )}
                </div>
              )}

              {/* Message Content */}
              <div className="whitespace-pre-wrap font-sans text-xs space-y-2">
                {msg.content}
              </div>

              {/* Direct Cited Initiatives Cards */}
              {msg.cited_initiatives && msg.cited_initiatives.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <FileText className="h-3 w-3 text-cyan-400" />
                    <span>Cited Enterprise Records ({msg.cited_initiatives.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.cited_initiatives.map((ci) => (
                      <Link
                        key={ci.id}
                        to={`/initiatives/${ci.id}`}
                        className="rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 hover:border-cyan-500/40 hover:bg-slate-850 transition block"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <Badge label={ci.department} variant="dept" size="sm" />
                          <Badge label={ci.stage} variant="stage" size="sm" />
                        </div>
                        <div className="font-semibold text-slate-200 text-xs truncate">{ci.title}</div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>${Number(ci.budget).toLocaleString()}</span>
                          <span className="text-cyan-400 flex items-center gap-0.5">
                            Inspect <ExternalLink className="h-2.5 w-2.5" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Follow-up Chips */}
              {msg.recommended_followups && msg.recommended_followups.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
                  <div className="text-[10px] text-slate-400 font-medium">Recommended Follow-up Inquiries:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.recommended_followups.map((followup, fi) => (
                      <button
                        key={fi}
                        onClick={() => handleSend(followup)}
                        className="rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 px-2 py-1 text-[11px] text-purple-300 transition text-left"
                      >
                        {followup}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[10px] text-slate-500 text-right">{msg.timestamp}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-purple-400 p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 w-fit">
            <Sparkles className="h-4 w-4 animate-spin" />
            <span>Scanning departmental vaults and synthesizing citations...</span>
          </div>
        )}
      </div>

      {/* Query Input Bar */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask an enterprise question across initiatives, risk factors, or policies..."
          disabled={loading}
          className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-5 py-3 text-xs font-semibold text-slate-950 shadow-md shadow-cyan-500/20 disabled:opacity-50 transition"
        >
          <span>Ask</span>
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
