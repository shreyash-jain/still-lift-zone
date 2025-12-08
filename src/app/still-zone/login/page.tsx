'use client';

// Still Zone - Premium Mobile-First Login (No Navbar)
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { supabase } from '@/lib/still-zone-supabase';
import { useStillZoneAuth } from '@/store/still-zone-auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function StillZoneLoginPage() {
  const router = useRouter();
  const { initializeAuth } = useStillZoneAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { isSupabaseConfigured } = await import('@/lib/still-zone-supabase');
      if (!isSupabaseConfigured) {
        setError('Supabase is not configured. Please set up your environment variables.');
        setIsLoading(false);
        return;
      }

      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) {
        setError(loginError.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        await initializeAuth();
        router.push('/still-zone/home');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleStartTrial = () => {
    // Navigate to signup or trial start page
    // Note: You may need to create /still-zone/signup route
    router.push('/still-zone/signup');
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden bg-gradient-to-b from-teal-50 via-cyan-50/30 to-teal-50/50">
      {/* Subtle background glows */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#004851]/20 blur-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6, scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-24 -right-16 w-[28rem] h-[28rem] rounded-full bg-[#006B7A]/15 blur-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5, scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

  {/* Stack container (mobile-first) - Premium spacing with consistent rhythm */}
    <div className="relative z-10 w-full max-w-[360px] md:max-w-[440px] lg:max-w-[520px] mx-auto flex flex-col items-center gap-10 lg:gap-6 px-6 py-12 sm:py-16 lg:py-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative w-[60px] h-[60px]">
            <Image
              src="/Logo stilllift new.svg"
              alt="Still Zone Logo"
              fill
              className="object-contain"
              priority
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.style.display = 'none';
                (t.parentElement as HTMLElement).innerHTML = '<div class=\'text-2xl font-bold bg-gradient-to-r from-[#004851] to-[#006B7A] bg-clip-text text-transparent\'>Still Zone</div>';
              }}
            />
          </div>
        </motion.div>

  {/* Headline + Subtext block (controls headline->subtext spacing separately) */}
    <div className="w-full flex flex-col items-center gap-8 lg:gap-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-center font-bold text-3xl sm:text-4xl text-gray-900"
          >
            Find your calm
            <br />
            <span className="bg-gradient-to-r from-[#004851] to-[#006B7A] bg-clip-text text-transparent">— in just a minute.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center text-gray-600 max-w-[300px] md:max-w-[420px] lg:max-w-[460px]"
          >
            Step into your personal guided space to breathe, refocus, and reset.
          </motion.p>
        </div>

        {/* Form - 36px gap from subtext */}
        <motion.form
          onSubmit={handleLogin}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full mt-9 lg:mt-6 flex flex-col gap-12 sm:gap-14 lg:gap-10"
        >
          {/* Email + Password container with 24px gap between fields */}
            <div className="flex flex-col gap-6">
            {/* Email field */}
              <div className="flex flex-col gap-2 mb-2">
              <Label htmlFor="email" className="text-gray-700">
                Email Address
              </Label>
               
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                autoComplete="email"
                className="h-12 rounded-xl bg-white/90 border-gray-200 focus:border-[#004851] focus:ring-[#004851]/20 pl-5 pr-4 py-3 placeholder:text-gray-400"
              />  
            </div>

            {/* Password field */}
              <div className="flex flex-col gap-2 mb-2">
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="password" className="text-gray-700">
                  Password
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
                className="h-12 rounded-xl bg-white/90 border-gray-200 focus:border-[#004851] focus:ring-[#004851]/20 pl-5 pr-4 py-3 placeholder:text-gray-400"
              />
              {/* Forgot password link - positioned slightly lower so it visually sits below label row */}
              <div className="flex justify-end mt-2">
                <Link
                  href="/forgot-password"
                  className="text-sm text-teal-700/80 hover:text-teal-700 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
            >
              {error}
            </motion.div>
          )}

          {/* Submit Button - 32px gap from password section, mt-8 above button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-2xl bg-white text-[#004851] border border-[#004851]/30 hover:bg-teal-50 font-medium shadow-sm transition-all py-4"
            size="lg"
          >
            {isLoading ? 'Signing In...' : 'Log In'}
          </Button>
        </motion.form>

        {/* Divider + Trial Button - 32px gap from Log In button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full mt-8 flex flex-col gap-6 sm:gap-8"
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-[11px] tracking-wide uppercase">
              <span className="px-2 bg-transparent text-gray-500">Or</span>
            </div>
          </div>
          <Button
            onClick={handleStartTrial}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#004851] to-[#006B7A] text-white font-medium hover:from-[#003A40] hover:to-[#005A66] shadow-lg shadow-[#004851]/20 transition-all py-4"
            size="lg"
            aria-label="Start 7 day free trial"
          >
            <Sparkles className="h-5 w-5 mr-2" aria-hidden="true" />
            Start 7 day free trial
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

