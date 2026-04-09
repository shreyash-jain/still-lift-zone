import { create } from 'zustand';

export type SignupStep = 1 | 2 | 3 | 4;
export type SignupProvider = 'email' | 'google';

interface SignupFlowState {
  currentStep: SignupStep;
  provider: SignupProvider;

  // Step 1 data
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;

  // Google OAuth data (prefilled from callback)
  avatarUrl: string;

  // Step 2 data
  selectedPlanId: string;
  selectedPlanKey: string;

  // Status
  isSubmitting: boolean;
  error: string | null;

  // Actions
  setStep: (step: SignupStep) => void;
  setProvider: (provider: SignupProvider) => void;
  setDetails: (data: Partial<Pick<SignupFlowState, 'fullName' | 'email' | 'mobileNumber' | 'password' | 'confirmPassword' | 'avatarUrl'>>) => void;
  setSelectedPlan: (planId: string, planKey: string) => void;
  setSubmitting: (v: boolean) => void;
  setError: (err: string | null) => void;
  prefillGoogle: (data: { fullName: string; email: string; avatarUrl: string }) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 1 as SignupStep,
  provider: 'email' as SignupProvider,
  fullName: '',
  email: '',
  mobileNumber: '',
  password: '',
  confirmPassword: '',
  avatarUrl: '',
  selectedPlanId: '',
  selectedPlanKey: '',
  isSubmitting: false,
  error: null as string | null,
};

export const useSignupFlowStore = create<SignupFlowState>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step, error: null }),
  setProvider: (provider) => set({ provider }),
  setDetails: (data) => set((s) => ({ ...s, ...data })),
  setSelectedPlan: (planId, planKey) => set({ selectedPlanId: planId, selectedPlanKey: planKey }),
  setSubmitting: (v) => set({ isSubmitting: v }),
  setError: (err) => set({ error: err }),
  prefillGoogle: (data) => set({
    provider: 'google',
    fullName: data.fullName,
    email: data.email,
    avatarUrl: data.avatarUrl,
  }),
  reset: () => set(initialState),
}));
