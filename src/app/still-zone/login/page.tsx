'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/still-zone-supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from "@/assets/images/stillzonelogo.svg"

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Step: Check if email exists using our new RPC function
      const { data: userExists, error: rpcError } = await supabase
        .rpc('check_email_exists', { email_address: email });

      if (rpcError) {
        console.error("RPC Error:", rpcError);
        toast.error("Something went wrong. Please try again.");
        setIsLoading(false);
        return;
      }

      // 2. Logic: If User DOES NOT exist, stop here.
      if (!userExists) {
        toast.error("Account not found. Please sign up first.");
        setIsLoading(false);
        return;
      }

      // Case C (Attempt): Proceed with login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Case B: Wrong Password (or other auth error)
        if (signInError.message.includes('Invalid login credentials')) {
          toast.error('Please enter the correct password.');
        } else {
          toast.error(signInError.message);
        }
        setIsLoading(false);
        return;
      }

      // Success
      toast.success('Successfully logged in');
      router.push('/still-zone/dashboard');

    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // For Google, we can't easily check existance BEFORE the popup without asking email first.
    // We will proceed with standard OAuth, but rely on the callback/backend to handle "New User" cases if possible,
    // OR we accept that for Google, "Sign In" might creating a user if Supabase is configured to allow it.
    // The user requirement "Before authenticating, check if email associated..." is hard client-side.
    // We'll implement the standard flow here.

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/still-zone/auth/callback?intent=login`,
        },
      });
      if (error) setError(error.message);
    } catch {
      setError('Could not initiate Google login');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-gradient-to-b from-teal-50 via-cyan-50/30 to-teal-50/50 lg:bg-none lg:bg-[#F9FAFB]">
      {/* Right Side - Visual (Displayed first on mobile via order-first) */}
      <div className="flex order-first lg:order-last w-full lg:w-1/2 bg-transparent lg:bg-gradient-to-b lg:from-teal-50 lg:via-cyan-50/30 lg:to-teal-50/50 items-center justify-center p-8 lg:p-12 min-h-[300px] lg:min-h-full">
        <div className="relative w-full h-full max-w-lg lg:aspect-square flex flex-col items-center justify-center text-center">
          {/* Content */}
          <div className="z-10 flex flex-col items-center gap-4 lg:gap-6">
            <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-full flex items-center justify-center z-20">
              <img src={Logo.src} alt="" />
            </div>
            <div className="space-y-2 lg:space-y-4 max-w-[340px] z-20 relative">
              <h1 className="text-2xl lg:text-4xl font-bold tracking-tight text-gray-900">
                Welcome back to
                <br />
                <span className="text-[#006B7A]">Still Zone.</span>
              </h1>
              <p className="text-gray-500 text-sm lg:text-lg leading-relaxed">
                Continue your journey to breathe, refocus, and reset.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-transparent lg:bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Sign in
            </h1>
            <p className="text-sm text-gray-500">
              Enter your email below to sign in to your account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-white/60"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {/* Forgot password link could go here */}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 bg-white/60 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer focus:outline-none bg-transparent border-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-[#006B7A] hover:bg-[#005561] text-white font-medium shadow-none transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 text-black ">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid gap-3">
            <Button
              variant="outline"
              className="h-11 bg-white/60"
              onClick={handleGoogleLogin}
              type="button"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </Button>
          </div>

          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/still-zone/signup"
              className="font-medium text-gray-900 hover:text-gray-700 underline underline-offset-4"
            >
              Sign up
            </Link>
          </p>
        </div >
      </div >

    </div >
  );
}
