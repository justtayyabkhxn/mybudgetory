'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, LogIn, Mail, Lock, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
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

  return (
    <div className="relative min-h-screen flex flex-col bg-[#060608] text-white overflow-hidden">

      {/* ── Background glow blobs ── */}
      <div className="pointer-events-none select-none absolute inset-0 overflow-hidden">
        {/* top-left violet */}
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-indigo-600/20 blur-[120px]" />
        {/* bottom-right violet */}
        <div className="absolute -bottom-40 -right-20 w-[480px] h-[480px] rounded-full bg-indigo-500/15 blur-[100px]" />
        {/* centre subtle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full bg-violet-700/10 blur-[80px]" />
      </div>

      <Header />

      <main className="relative flex-1 flex items-center justify-center px-4 py-16 z-10">
        <div className="w-full max-w-sm">

          {/* ── Icon + heading ── */}
          <div className="text-center mb-8">
            {/* glowing icon ring */}
            <div className="relative inline-flex items-center justify-center mb-5">
              <div className="absolute inset-0 rounded-full bg-indigo-500/30 blur-xl scale-150" />
              <div className="relative flex items-center justify-center w-12 h-12 rounded-full border border-indigo-400/40 bg-gradient-to-br from-indigo-500/20 to-violet-600/20 shadow-[0_0_24px_rgba(99,102,241,0.35)] backdrop-blur-sm">
                <LogIn size={18} className="text-indigo-300" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-1.5">Sign in to your account to continue</p>
          </div>

          {/* ── Card ── */}
          <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl p-7 shadow-[0_8px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.07)]">

            {/* shiny top-edge highlight */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent rounded-full" />
            {/* subtle inner glow */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-indigo-500/[0.04] to-transparent" />

            <form onSubmit={handleSubmit} className="relative space-y-4">

              {/* Email */}
              <div className={`group flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200 ${
                focused === 'email'
                  ? 'border-indigo-500/50 bg-indigo-500/[0.08] shadow-[0_0_0_3px_rgba(99,102,241,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]'
                  : 'border-white/[0.07] bg-white/[0.03] hover:border-white/[0.12]'
              }`}>
                <Mail size={16} className={`shrink-0 transition-colors duration-200 ${focused === 'email' ? 'text-indigo-400' : 'text-gray-600'}`} />
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  onChange={handleChange}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  required
                  autoComplete="email"
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 outline-none"
                />
              </div>

              {/* Password */}
              <div className={`group flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200 ${
                focused === 'password'
                  ? 'border-indigo-500/50 bg-indigo-500/[0.08] shadow-[0_0_0_3px_rgba(99,102,241,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]'
                  : 'border-white/[0.07] bg-white/[0.03] hover:border-white/[0.12]'
              }`}>
                <Lock size={16} className={`shrink-0 transition-colors duration-200 ${focused === 'password' ? 'text-indigo-400' : 'text-gray-600'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  required
                  autoComplete="current-password"
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="shrink-0 text-gray-600 hover:text-gray-300 transition-colors duration-150"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Forgot */}
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-indigo-400 transition-colors duration-150">
                  Forgot password?
                </Link>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <p className="text-xs text-red-400 text-center">{error}</p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]
                  bg-gradient-to-b from-indigo-500 to-indigo-700
                  shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_4px_24px_rgba(99,102,241,0.4),0_1px_3px_rgba(0,0,0,0.4)]
                  hover:shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_6px_32px_rgba(99,102,241,0.55),0_1px_3px_rgba(0,0,0,0.4)]
                  hover:from-indigo-400 hover:to-indigo-600"
              >
                {/* shimmer sweep */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />

                {loading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-xs text-gray-600 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* Sign up */}
            <p className="text-center text-xs text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-150">
                Create one
              </Link>
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}