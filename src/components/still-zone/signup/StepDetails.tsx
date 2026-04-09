'use client';

import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/still-zone-supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSignupFlowStore, type SignupProvider } from '@/store/signup-flow-store';

export function StepDetails() {
  const store = useSignupFlowStore();
  const isGoogle = store.provider === 'google';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checking, setChecking] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(store.email);
  const isMobileValid = !store.mobileNumber || /^\+?[\d\s-]{10,15}$/.test(store.mobileNumber); // optional — valid if empty or correct format
  const isPasswordValid = store.password.length >= 8;
  const passwordsMatch = store.password === store.confirmPassword;

  const canProceed = isGoogle
    ? !!(store.fullName.trim() && store.email.trim() && isMobileValid)
    : !!(store.fullName.trim() && isEmailValid && isMobileValid && isPasswordValid && passwordsMatch);

  const handleNext = async () => {
    if (!canProceed) return;
    store.setError(null);

    // For email signup, check if email already exists
    if (!isGoogle) {
      setChecking(true);
      try {
        const { data: exists, error: rpcErr } = await supabase.rpc('check_email_exists', {
          email_address: store.email,
        });
        if (rpcErr) throw rpcErr;
        if (exists) {
          toast.error('Account already exists with this email. Please sign in.');
          setChecking(false);
          return;
        }
      } catch {
        toast.error('Something went wrong. Please try again.');
        setChecking(false);
        return;
      }
      setChecking(false);
    }

    store.setStep(2);
  };

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isGoogle ? 'Complete Your Profile' : 'Create Your Account'}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {isGoogle ? 'Just add your mobile number to continue' : 'Fill in your details to get started'}
        </p>
      </div>

      {/* Full Name */}
      <div className="space-y-1.5">
        <Label htmlFor="fullName" className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name <span className="text-red-500">*</span></Label>
        <Input
          id="fullName"
          type="text"
          value={store.fullName}
          onChange={(e) => store.setDetails({ fullName: e.target.value })}
          placeholder="Your full name"
          readOnly={isGoogle && !!store.fullName}
          className={isGoogle && store.fullName ? 'bg-slate-50 dark:bg-slate-800/50' : ''}
        />
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email <span className="text-red-500">*</span></Label>
        <Input
          id="email"
          type="email"
          value={store.email}
          onChange={(e) => store.setDetails({ email: e.target.value })}
          placeholder="you@example.com"
          readOnly={isGoogle}
          className={isGoogle ? 'bg-slate-50 dark:bg-slate-800/50' : ''}
        />
        {store.email && !isEmailValid && !isGoogle && (
          <p className="text-xs text-red-500">Please enter a valid email address</p>
        )}
      </div>

      {/* Mobile Number */}
      <div className="space-y-1.5">
        <Label htmlFor="mobile" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Mobile Number <span className="text-xs text-slate-400">(optional)</span>
        </Label>
        <Input
          id="mobile"
          type="tel"
          value={store.mobileNumber}
          onChange={(e) => store.setDetails({ mobileNumber: e.target.value })}
          placeholder="+91 98765 43210"
        />
        {store.mobileNumber && !isMobileValid && (
          <p className="text-xs text-red-500">Please enter a valid mobile number (10+ digits)</p>
        )}
      </div>

      {/* Password fields — only for email signup */}
      {!isGoogle && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={store.password}
                onChange={(e) => store.setDetails({ password: e.target.value })}
                placeholder="Min. 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {store.password && !isPasswordValid && (
              <p className="text-xs text-red-500">Password must be at least 8 characters</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={store.confirmPassword}
                onChange={(e) => store.setDetails({ confirmPassword: e.target.value })}
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {store.confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-500">Passwords do not match</p>
            )}
          </div>
        </>
      )}

      {store.error && (
        <p className="text-sm text-red-500 text-center">{store.error}</p>
      )}

      <Button
        onClick={handleNext}
        disabled={!canProceed || checking}
        className="w-full h-12 text-base rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-50"
      >
        {checking ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue to Plan Selection'}
      </Button>
    </div>
  );
}
