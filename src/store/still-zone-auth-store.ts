// Still Zone - Authentication and Trial State Store (Zustand)
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { supabase, type StillZoneUser } from '@/lib/still-zone-supabase';
import type { Session } from '@supabase/supabase-js';

interface StillZoneAuthState {
  user: StillZoneUser | null;
  session: Session | null;
  isLoading: boolean;
  trialDaysRemaining: number | null;
  isTrialActive: boolean;
  isSubscribed: boolean;
  
  // Actions
  setUser: (user: StillZoneUser | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  checkTrialStatus: () => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useStillZoneAuth = create<StillZoneAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      trialDaysRemaining: null,
      isTrialActive: false,
      isSubscribed: false,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),

      checkTrialStatus: async () => {
        const { user } = get();
        if (!user) {
          set({ trialDaysRemaining: null, isTrialActive: false, isSubscribed: false });
          return;
        }

        const isSubscribed = user.subscription_status === 'active';
        const isTrialActive = user.trial_active && !isSubscribed;

        if (isTrialActive && user.trial_end_date) {
          const endDate = new Date(user.trial_end_date);
          const now = new Date();
          const diffTime = endDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          set({
            trialDaysRemaining: diffDays > 0 ? diffDays : 0,
            isTrialActive: diffDays > 0,
            isSubscribed,
          });
        } else {
          set({
            trialDaysRemaining: null,
            isTrialActive: false,
            isSubscribed,
          });
        }
      },

      signOut: async () => {
        const { isSupabaseConfigured } = await import('@/lib/still-zone-supabase');
        if (isSupabaseConfigured) {
          await supabase.auth.signOut();
        }
        set({
          user: null,
          session: null,
          trialDaysRemaining: null,
          isTrialActive: false,
          isSubscribed: false,
        });
      },

      initializeAuth: async () => {
        set({ isLoading: true });
        
        try {
          // Check if Supabase is configured
          const { isSupabaseConfigured } = await import('@/lib/still-zone-supabase');
          
          if (!isSupabaseConfigured) {
            // Demo mode - no auth
            set({ user: null, session: null, isLoading: false });
            return;
          }

          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // Fetch user data from database
            const { data: userData, error } = await supabase
              .from('still_zone_users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error && error.code !== 'PGRST116') {
              console.error('Still Zone: Error fetching user data', error);
            }

            if (userData) {
              set({ user: userData as StillZoneUser, session });
              await get().checkTrialStatus();
            } else {
              // Create user record if it doesn't exist
              const newUser: Partial<StillZoneUser> = {
                id: session.user.id,
                email: session.user.email || '',
                trial_start_date: new Date().toISOString(),
                trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                trial_active: true,
                subscription_status: 'none',
              };

              const { data: createdUser, error: createError } = await supabase
                .from('still_zone_users')
                .insert([newUser])
                .select()
                .single();

              if (createError) {
                console.error('Still Zone: Error creating user', createError);
              } else if (createdUser) {
                set({ user: createdUser as StillZoneUser, session });
                await get().checkTrialStatus();
              }
            }
          } else {
            set({ user: null, session: null });
          }
        } catch (error) {
          console.error('Still Zone: Auth initialization error', error);
          set({ user: null, session: null });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'still-zone-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
);

