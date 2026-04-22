'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Eye, EyeOff, UserPlus, Mail, Lock, User, ArrowRight,
  CheckCircle2, BarChart3, Users2, TrendingUp,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/* ── Fake split bill preview shown in the right panel ── */
const FAKE_SPLIT = [
  { name: 'Rahul',  initials: 'R', share: '₹ 840', paid: true  },
  { name: 'Priya',  initials: 'P', share: '₹ 840', paid: false },
  { name: 'Aakash', initials: 'A', share: '₹ 840', paid: false },
];

const PERKS = [
  'Free forever — no credit card needed',
  'Import & export transactions as CSV',
  'Split bills & send WhatsApp reminders',
  'Monthly charts & spending insights',
];

export default function SignupPage() {
  const [form, setForm]               = useState({ name: '', email: '', password: '' });
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused]         = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push('/login');
      } else {
        const data = await res.json();
        setError(data.error || 'Signup failed');
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
        ? 'border-violet-500/60 bg-violet-500/[0.09] shadow-[0_0_0_3px_rgba(139,92,246,0.15),inset_0_1px_0_rgba(255,255,255,0.06)]'
        : 'border-white/[0.07] bg-white/[0.03] hover:border-white/[0.14] hover:bg-white/[0.05]'
    }`;

  const iconCls = (name: string) =>
    `shrink-0 transition-colors duration-200 ${focused === name ? 'text-violet-400' : 'text-gray-600'}`;

  return (
    <div className="relative min-h-screen flex flex-col bg-[#030307] text-white overflow-hidden">

      {/* ── Dot grid ── */}
      <div className="pointer-events-none absolute inset-0 auth-dot-grid" />

      {/* ── Animated blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob      absolute -top-48 -right-48 w-[700px] h-[700px] rounded-full bg-violet-600/20 blur-[160px]" />
        <div className="animate-blob-d2   absolute top-1/3 -left-32  w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[130px]" />
        <div className="animate-blob-d4   absolute -bottom-40 right-1/4 w-[450px] h-[450px] rounded-full bg-fuchsia-700/10 blur-[120px]" />
      </div>

      <Header />

      <main className="relative flex-1 flex items-center justify-center px-4 py-10 z-10">
        <div className="w-full max-w-5xl">

          {/* ── Outer shell with gradient border ── */}
          <div
            className="flex rounded-[28px] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.8)]"
            style={{
              background: 'linear-gradient(rgba(3,3,7,0.95), rgba(3,3,7,0.95)) padding-box, linear-gradient(135deg, rgba(139,92,246,0.6) 0%, rgba(99,102,241,0.2) 40%, rgba(168,85,247,0.35) 100%) border-box',
              border: '1px solid transparent',
            }}
          >

            {/* ════════════════════════════════
                LEFT PANEL — form
            ════════════════════════════════ */}
            <div className="flex-1 flex flex-col justify-center p-8 lg:p-12"
              style={{ background: 'rgba(255,255,255,0.015)' }}
            >
              {/* Icon + heading */}
              <div className="animate-fade-up mb-8">
                <div className="relative inline-flex items-center justify-center mb-5">
                  <div className="absolute inset-0 rounded-full bg-violet-500/30 blur-2xl scale-[2]" />
                  <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-500/25 to-indigo-600/25 shadow-[0_0_28px_rgba(139,92,246,0.45)]">
                    <UserPlus size={19} className="text-violet-300" />
                  </div>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight mb-1.5">Create an account</h1>
                <p className="text-sm text-gray-500">Start your financial journey — it&apos;s free</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Name */}
                <div className="animate-fade-up-d1">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-0.5">Full name</label>
                  <div className={inputCls('name')}>
                    <User size={15} className={iconCls('name')} />
                    <input
                      type="text" name="name" placeholder="John Doe"
                      onChange={handleChange}
                      onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                      required autoComplete="name"
                      className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 outline-none"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="animate-fade-up-d2">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-0.5">Email address</label>
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
                <div className="animate-fade-up-d3">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-0.5">Password</label>
                  <div className={inputCls('password')}>
                    <Lock size={15} className={iconCls('password')} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password" placeholder="Min. 8 characters"
                      onChange={handleChange}
                      onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                      required autoComplete="new-password"
                      className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 outline-none"
                    />
                    <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)}
                      className="shrink-0 text-gray-600 hover:text-gray-300 transition-colors duration-150 p-0.5 rounded">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-500/25 bg-red-500/[0.08] px-4 py-3">
                    <p className="text-xs text-red-400 text-center">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <div className="animate-fade-up-d4 pt-1">
                  <button
                    type="submit" disabled={loading}
                    className="group relative w-full overflow-hidden flex items-center justify-center gap-2 rounded-xl px-4 py-[13px] text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(180deg, #8b5cf6 0%, #7c3aed 100%)',
                      boxShadow: '0 1px 0 rgba(255,255,255,0.18) inset, 0 6px 28px rgba(139,92,246,0.5), 0 1px 4px rgba(0,0,0,0.4)',
                    }}
                  >
                    <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[800ms] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent skew-x-12" />
                    {loading ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span>Creating account…</span>
                      </>
                    ) : (
                      <>
                        <span>Create account</span>
                        <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-gray-700 mt-3">
                    By signing up you agree to our{' '}
                    <span className="text-gray-500 underline underline-offset-2 cursor-pointer hover:text-gray-400 transition-colors">Terms of Service</span>
                  </p>
                </div>
              </form>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[11px] text-gray-700 uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors duration-150">
                  Sign in →
                </Link>
              </p>
            </div>

            {/* ════════════════════════════════
                RIGHT PANEL — branding
            ════════════════════════════════ */}
            <div className="hidden lg:flex flex-col w-[46%] relative overflow-hidden p-10"
              style={{ background: 'linear-gradient(215deg, rgba(139,92,246,0.12) 0%, rgba(99,102,241,0.06) 50%, rgba(3,3,7,0) 100%)' }}
            >
              {/* Panel glows */}
              <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-violet-500/20 blur-[100px]" />
              <div className="pointer-events-none absolute bottom-0 left-0 w-56 h-56 rounded-full bg-indigo-600/12 blur-[70px]" />
              {/* Separator */}
              <div className="absolute top-8 bottom-8 left-0 w-px bg-gradient-to-b from-transparent via-white/[0.08] to-transparent" />

              <div className="relative flex flex-col h-full">
                {/* Logo ring + badge */}
                <div className="flex items-center gap-3 mb-7">
                  <div className="relative w-10 h-10">
                    <div className="animate-spin-slow absolute inset-0 rounded-full" style={{ border: '1px dashed rgba(139,92,246,0.4)' }} />
                    <div className="animate-spin-slow-r absolute inset-[4px] rounded-full" style={{ border: '1px solid rgba(99,102,241,0.25)' }} />
                    <div className="absolute inset-[9px] rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-[0_0_24px_rgba(139,92,246,0.7)]">
                      <BarChart3 size={11} className="text-white" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-violet-500/15 blur-lg" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/70">MyBudgetory</p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Free forever
                    </span>
                  </div>
                </div>

                {/* Headline */}
                <h2 className="text-gradient-violet text-[1.85rem] font-extrabold leading-none mb-3">
                  Everything you<br />need in one app.
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-xs">
                  Join thousands managing their money smarter.
                </p>

                {/* Perks */}
                <div className="space-y-2.5 mb-8">
                  {PERKS.map((perk) => (
                    <div key={perk} className="flex items-start gap-2.5">
                      <CheckCircle2 size={14} className="text-violet-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-400">{perk}</span>
                    </div>
                  ))}
                </div>

                {/* ── Floating Bill Split preview ── */}
                <div className="animate-float-d2 flex-1 flex items-end">
                  <div className="w-full rounded-2xl border border-white/[0.09] backdrop-blur-xl p-4 shadow-[0_16px_50px_rgba(0,0,0,0.5)]"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Users2 size={12} className="text-violet-400" />
                      <span className="text-[11px] font-medium text-gray-400">Dinner at XYZ</span>
                      <span className="ml-auto text-[10px] bg-violet-500/15 text-violet-400 border border-violet-500/20 rounded-full px-2 py-0.5 font-semibold">
                        ₹ 2,520 total
                      </span>
                    </div>

                    <div className="space-y-2">
                      {FAKE_SPLIT.map((p) => (
                        <div key={p.name} className={`flex items-center justify-between rounded-xl px-3 py-2 ${p.paid ? 'bg-emerald-500/[0.07] border border-emerald-500/15' : 'bg-white/[0.03] border border-white/[0.06]'}`}>
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${p.paid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-violet-500/20 text-violet-300'}`}>
                              {p.initials}
                            </div>
                            <span className="text-xs text-gray-300">{p.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-400">{p.share}</span>
                            <span className={`text-[9px] font-semibold rounded-full px-1.5 py-0.5 ${p.paid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700/60 text-gray-500'}`}>
                              {p.paid ? 'Paid' : 'Due'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.05]">
                      <TrendingUp size={11} className="text-emerald-400" />
                      <span className="text-[10px] text-gray-600">1 of 3 paid · ₹ 840 collected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
