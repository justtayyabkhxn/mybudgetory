'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus, Mail, Lock, User, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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

  const fieldClass = (name: string) =>
    `group flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200 ${
      focused === name
        ? 'border-violet-500/50 bg-violet-500/[0.08] shadow-[0_0_0_3px_rgba(139,92,246,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]'
        : 'border-white/[0.07] bg-white/[0.03] hover:border-white/[0.12]'
    }`;

  const iconClass = (name: string) =>
    `shrink-0 transition-colors duration-200 ${focused === name ? 'text-violet-400' : 'text-gray-600'}`;

  return (
    <div className="relative min-h-screen flex flex-col bg-[#060608] text-white overflow-hidden">

      {/* Background glow blobs */}
      <div className="pointer-events-none select-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute -bottom-40 -left-20 w-[480px] h-[480px] rounded-full bg-violet-500/15 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full bg-indigo-700/10 blur-[80px]" />
      </div>

      <Header />

      <main className="relative flex-1 flex items-center justify-center px-4 py-16 z-10">
        <div className="w-full max-w-sm">

          {/* Icon + heading */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center mb-5">
              <div className="absolute inset-0 rounded-full bg-violet-500/30 blur-xl scale-150" />
              <div className="relative flex items-center justify-center w-12 h-12 rounded-full border border-violet-400/40 bg-gradient-to-br from-violet-500/20 to-indigo-600/20 shadow-[0_0_24px_rgba(139,92,246,0.35)] backdrop-blur-sm">
                <UserPlus size={18} className="text-violet-300" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Create an account</h1>
            <p className="text-sm text-gray-500 mt-1.5">Start your journey today</p>
          </div>

          {/* Card */}
          <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl p-7 shadow-[0_8px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.07)]">

            {/* top-edge shine */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent rounded-full" />
            {/* inner glow */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-violet-500/[0.04] to-transparent" />

            <form onSubmit={handleSubmit} className="relative space-y-4">

              {/* Name */}
              <div className={fieldClass('name')}>
                <User size={16} className={iconClass('name')} />
                <input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  onChange={handleChange}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  required
                  autoComplete="name"
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 outline-none"
                />
              </div>

              {/* Email */}
              <div className={fieldClass('email')}>
                <Mail size={16} className={iconClass('email')} />
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
              <div className={fieldClass('password')}>
                <Lock size={16} className={iconClass('password')} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  required
                  autoComplete="new-password"
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

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <p className="text-xs text-red-400 text-center">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]
                  bg-gradient-to-b from-violet-500 to-violet-700
                  shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_4px_24px_rgba(139,92,246,0.4),0_1px_3px_rgba(0,0,0,0.4)]
                  hover:shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_6px_32px_rgba(139,92,246,0.55),0_1px_3px_rgba(0,0,0,0.4)]
                  hover:from-violet-400 hover:to-violet-600"
              >
                {/* shimmer sweep */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />

                {loading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create account
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

            {/* Login link */}
            <p className="text-center text-xs text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors duration-150">
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}