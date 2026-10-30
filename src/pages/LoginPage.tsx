import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { Cpu, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setLoading(true);
    setError(null);
    try {
      await login(demoEmail, 'password123');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/25 mb-4">
          <Cpu className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">NexusAI Enterprise</h2>
        <p className="mt-1 text-xs text-slate-400">
          Deterministic AI Workflow & Cross-Departmental Knowledge Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
          {error && (
            <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Corporate Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@nexusai.corp"
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Enterprise Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-md shadow-cyan-500/20 transition disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign in to Platform'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* 1-Click Demo Profiles for Rapid Testing */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-cyan-400" />
              <span>1-Click Enterprise Test Profiles</span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@nexusai.corp')}
                className="w-full text-left p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-xs text-slate-300 transition flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-amber-300">👑 Victoria Vance (Admin)</div>
                  <div className="text-[10px] text-slate-400">Operations • Global overrides & audit access</div>
                </div>
                <span className="text-[11px] font-mono text-cyan-400">Use →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('sarah.chen@nexusai.corp')}
                className="w-full text-left p-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-xs text-slate-300 transition flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-blue-300">🛡️ Sarah Chen (Department Lead)</div>
                  <div className="text-[10px] text-slate-400">Engineering • Stage approvals for department</div>
                </div>
                <span className="text-[11px] font-mono text-cyan-400">Use →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('marcus.vance@nexusai.corp')}
                className="w-full text-left p-2.5 rounded-xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-xs text-slate-300 transition flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-200">📊 Marcus Vance (Analyst)</div>
                  <div className="text-[10px] text-slate-400">Finance • Ingestion & draft view permissions</div>
                </div>
                <span className="text-[11px] font-mono text-cyan-400">Use →</span>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-slate-500">
            Need a custom organizational account?{' '}
            <Link to="/register" className="font-semibold text-cyan-400 hover:underline">
              Register employee
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
