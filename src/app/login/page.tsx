'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Eye, EyeOff, LogIn, Mail, Lock, ArrowRight,
  TrendingUp, Shield, Zap, BarChart3, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const FAKE_TXN = [
  { emoji: '🛒', label: 'Groceries',   amount: '-₹ 840',    color: 'text-rose-400'    },
  { emoji: '💼', label: 'Salary',      amount: '+₹ 42,000', color: 'text-emerald-400' },
  { emoji: '⚡', label: 'Electricity', amount: '-₹ 1,240',  color: 'text-rose-400'    },
];

const FEATURES = [
  { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Real-time expense tracking'  },
  { icon: BarChart3,  color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',       label: 'Visual spending analytics'  },
  { icon: Shield,     color: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/20',   label: 'Secure & private data'      },
  { icon: Zap,        color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',     label: 'Instant bill splitting'     },
];

export default function LoginPage() {
  const [form, setForm]                 = useState({ email: '', password: '' });
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused]           = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res  = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        router.push('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (name: string) =>
    `flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200 ${
      focused === name
        ? 'border-indigo-500/60 bg-indigo-500/[0.09] shadow-[0_0_0_3px_rgba(99,102,241,0.15),inset_0_1px_0_rgba(255,255,255,0.06)]'
        : 'border-white/[0.07] bg-white/[0.03] hover:border-white/[0.14] hover:bg-white/[0.05]'
    }`;

  const iconCls = (name: string) =>
    `shrink-0 transition-colors duration-200 ${focused === name ? 'text-indigo-400' : 'text-gray-600'}`;

  return (
    <div className="relative min-h-screen flex flex-col bg-[#030307] text-white overflow-hidden">

      {/* Dot grid */}
      <div className="pointer-events-none absolute inset-0 auth-dot-grid opacity-100" />


      <Header />

      <main className="relative flex-1 flex items-center justify-center px-4 py-10 z-10">
        <div className="w-full max-w-5xl">

          {/* Outer shell with gradient border */}
          <div
            className="flex rounded-[28px] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.8)]"
            style={{
              background: 'linear-gradient(rgba(3,3,7,0.95), rgba(3,3,7,0.95)) padding-box, linear-gradient(135deg, rgba(99,102,241,0.6) 0%, rgba(139,92,246,0.2) 40%, rgba(59,130,246,0.3) 100%) border-box',
              border: '1px solid transparent',
            }}
          >

            {/* ── LEFT PANEL — branding ── */}
            <div
              className="hidden lg:flex flex-col w-[46%] relative overflow-hidden p-10"
              style={{ background: 'linear-gradient(145deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.06) 50%, rgba(3,3,7,0) 100%)' }}
            >
              {/* Vertical separator */}
              <div className="absolute top-8 bottom-8 right-0 w-px bg-gradient-to-b from-transparent via-white/[0.08] to-transparent" />

              <div className="relative flex flex-col h-full">
                {/* Logo mark with spinning rings */}
                <div className="relative w-16 h-16 mb-7">
                  <div className="animate-spin-slow absolute inset-0 rounded-full"
                    style={{ border: '1px dashed rgba(99,102,241,0.35)' }} />
                  <div className="animate-spin-slow-r absolute inset-[5px] rounded-full"
                    style={{ border: '1px solid rgba(139,92,246,0.25)' }} />
                  <div className="absolute inset-[11px] rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                    <BarChart3 size={16} className="text-white" />
                  </div>
                </div>

                <p className="text-xs font-semibold text-indigo-400 tracking-[0.2em] uppercase mb-3">
                  MyBudgetory
                </p>

                <h2 className="text-gradient-indigo text-[2rem] font-extrabold leading-none mb-3">
                  Take control<br />of your finances.
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-xs">
                  Track spending, visualise trends, and split bills — all in one beautiful app.
                </p>

                {/* Floating dashboard preview */}
                <div className="animate-float flex-1 flex items-center">
                  <div
                    className="w-full rounded-2xl border border-white/[0.09] backdrop-blur-xl p-4 shadow-[0_16px_50px_rgba(0,0,0,0.5)]"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-medium text-gray-400">March 2026</span>
                      <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5">
                        ▲ +12%
                      </span>
                    </div>

                    <p className="text-[10px] text-gray-600 mb-0.5">Net Balance</p>
                    <p className="text-xl font-extrabold text-white mb-3">₹ 24,800</p>

                    <div className="flex gap-2 mb-3">
                      <div className="flex-1 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/15 p-2.5">
                        <div className="flex items-center gap-1 mb-1">
                          <ArrowUpRight size={10} className="text-emerald-400" />
                          <span className="text-[9px] text-gray-500">Income</span>
                        </div>
                        <p className="text-xs font-bold text-emerald-400">₹ 42,000</p>
                      </div>
                      <div className="flex-1 rounded-xl bg-rose-500/[0.08] border border-rose-500/15 p-2.5">
                        <div className="flex items-center gap-1 mb-1">
                          <ArrowDownRight size={10} className="text-rose-400" />
                          <span className="text-[9px] text-gray-500">Expenses</span>
                        </div>
                        <p className="text-xs font-bold text-rose-400">₹ 17,200</p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {FAKE_TXN.map((t) => (
                        <div key={t.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{t.emoji}</span>
                            <span className="text-[11px] text-gray-400">{t.label}</span>
                          </div>
                          <span className={`text-[11px] font-semibold ${t.color}`}>{t.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Feature chips */}
                <div className="mt-6 grid grid-cols-2 gap-2">
                  {FEATURES.map(({ icon: Icon, color, bg, label }) => (
                    <div key={label} className={`flex items-center gap-2 rounded-xl border ${bg} px-2.5 py-2`}>
                      <Icon size={12} className={`${color} shrink-0`} />
                      <span className="text-[11px] text-gray-400 leading-none">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT PANEL — form ── */}
            <div
              className="flex-1 flex flex-col justify-center p-8 lg:p-12"
              style={{ background: 'rgba(255,255,255,0.015)' }}
            >
              {/* Top shine */}
              <div className="absolute top-0 right-[10%] left-[54%] h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent hidden lg:block" />

              {/* Icon + heading */}
              <div className="animate-fade-up mb-8">
                <div className="inline-flex items-center justify-center mb-5">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl border border-indigo-400/20 bg-indigo-500/[0.08]">
                    <LogIn size={19} className="text-indigo-300" />
                  </div>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight mb-1.5 text-white">
                  Welcome back
                </h1>
                <p className="text-sm text-gray-500">Sign in to your account to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Email */}
                <div className="animate-fade-up-d1">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-0.5">
                    Email address
                  </label>
                  <div className={inputCls('email')}>
                    <Mail size={15} className={iconCls('email')} />
                    <input
                      type="email" name="email" placeholder="you@example.com"
                      onChange={handleChange}
                      onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                      required autoComplete="email"
                      className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 outline-none"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="animate-fade-up-d2">
                  <div className="flex items-center justify-between mb-1.5 ml-0.5">
                    <label className="text-xs font-medium text-gray-500">Password</label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-gray-600 hover:text-indigo-400 transition-colors duration-150 hover:underline underline-offset-2"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className={inputCls('password')}>
                    <Lock size={15} className={iconCls('password')} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password" placeholder="••••••••"
                      onChange={handleChange}
                      onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                      required autoComplete="current-password"
                      className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 outline-none"
                    />
                    <button
                      type="button" tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="shrink-0 text-gray-600 hover:text-gray-300 transition-colors duration-150 p-0.5 rounded"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-500/25 bg-red-500/[0.08] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <p className="text-xs text-red-400 text-center">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <div className="animate-fade-up-d3 pt-1">
                  <button
                    type="submit" disabled={loading}
                    className="group relative w-full overflow-hidden flex items-center justify-center gap-2 rounded-xl px-4 py-[13px] text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)',
                      boxShadow: '0 1px 0 rgba(255,255,255,0.18) inset, 0 6px 28px rgba(99,102,241,0.5), 0 1px 4px rgba(0,0,0,0.4)',
                    }}
                  >
                    <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[800ms] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent skew-x-12" />
                    {loading ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span>Signing in…</span>
                      </>
                    ) : (
                      <>
                        <span>Sign in</span>
                        <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="animate-fade-up-d4">
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-[11px] text-gray-700 uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>

                <p className="text-center text-sm text-gray-500">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/signup"
                    className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors duration-150"
                  >
                    Create one free →
                  </Link>
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
