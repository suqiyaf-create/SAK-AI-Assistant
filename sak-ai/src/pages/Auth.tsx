import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../lib/auth';

export default function Auth() {
  const [params] = useSearchParams();
  const initialMode = params.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate('/app');
    } catch (e2: any) {
      setErr(e2?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl">
        <Link to="/"><Logo /></Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0B0F1A]">
        <div className="w-full max-w-sm space-y-8 animate-fade-up">
          <div className="space-y-2">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-slate-900 dark:text-white focus:outline-none">
              {mode === 'login' ? 'Sign in' : 'Create your account'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {mode === 'login'
                ? 'Welcome back to SAK AI.'
                : 'Join SAK AI — designed by Suqiya, a final year student.'}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-6" data-testid="auth-form">
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Name</label>
                <input
                  data-testid="name-input"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B29] px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  placeholder="Your name"
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
              <input
                data-testid="email-input"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B29] px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                placeholder="name@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
              <input
                data-testid="password-input"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B29] px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                placeholder="••••••••"
              />
            </div>

            {err && (
              <div data-testid="auth-error" className="rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 font-medium">
                {err}
              </div>
            )}

            <button
              data-testid="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full h-14 inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-700 hover:from-sky-400 hover:to-sky-600 px-5 text-base font-bold text-white transition-all disabled:opacity-60 shadow-xl shadow-sky-500/20 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (mode === 'login' ? 'Sign in' : 'Create account')}
            </button>
          </form>

          <button
            data-testid="auth-toggle-mode"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr(''); }}
            className="w-full text-center text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors"
          >
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </main>
    </div>
  );
}
