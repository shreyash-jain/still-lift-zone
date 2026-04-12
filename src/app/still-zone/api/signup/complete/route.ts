import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(supabaseUrl, serviceRoleKey);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, fullName, email, mobileNumber, password, selectedPlanId, selectedPlanKey } = body;

    if (!email || !fullName) {
      return NextResponse.json({ success: false, message: 'Name and email are required' }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    const now = new Date();

    let userId: string;
    let accessToken: string | undefined;
    let refreshToken: string | undefined;

    // ── Fetch plan details to check if it has a trial ──
    let planTrialDays = 0;
    let planDurationDays = 30;
    if (selectedPlanId) {
      const { data: planInfo } = await supabase.from('payment_plans')
        .select('trial_days, duration_days')
        .eq('id', selectedPlanId).single();
      if (planInfo) {
        planTrialDays = planInfo.trial_days || 0;
        planDurationDays = planInfo.duration_days || 30;
      }
    }

    const hasTrial = planTrialDays > 0;

    if (provider === 'email') {
      if (!password || password.length < 8) {
        return NextResponse.json({ success: false, message: 'Password must be at least 8 characters' }, { status: 400 });
      }

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { full_name: fullName, mobile_number: mobileNumber || '' },
      });

      if (authError) {
        console.error('[signup/complete] Auth error:', authError.message);
        if (authError.message?.includes('already')) {
          return NextResponse.json({ success: false, message: 'Account already exists.' }, { status: 409 });
        }
        return NextResponse.json({ success: false, message: authError.message }, { status: 500 });
      }
      userId = authData.user.id;

      // Wait for handle_new_user trigger to create profiles
      for (let i = 0; i < 5; i++) {
        const { data: p } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
        if (p) break;
        await new Promise(r => setTimeout(r, 500));
      }

      // If profiles still missing, create manually
      const { data: profileCheck } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
      if (!profileCheck) {
        await supabase.from('profiles').insert({ id: userId, full_name: fullName, email, provider: 'email' });
      }

      // Sign in to get tokens
      try {
        const anonSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
        const { data: signInData } = await anonSupabase.auth.signInWithPassword({ email, password });
        if (signInData?.session) {
          accessToken = signInData.session.access_token;
          refreshToken = signInData.session.refresh_token;
        }
      } catch (e) {
        console.error('[signup/complete] Sign-in error:', e);
      }
    } else {
      // Google
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const existingUser = users?.find(u => u.email === email);
      if (!existingUser) {
        return NextResponse.json({ success: false, message: 'Google account not found.' }, { status: 404 });
      }
      userId = existingUser.id;

      const { data: profileCheck } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
      if (!profileCheck) {
        await supabase.from('profiles').insert({ id: userId, full_name: fullName, email, provider: 'google' });
      } else {
        await supabase.from('profiles').update({ full_name: fullName }).eq('id', userId);
      }
    }

    // ── 1. Upsert still_zone_users — set trial ONLY if plan has trial ──
    const szData: Record<string, unknown> = {
      id: userId,
      email,
      full_name: fullName,
      mobile_number: mobileNumber || null,
      selected_plan_id: selectedPlanId || null,
      updated_at: now.toISOString(),
    };

    if (hasTrial) {
      const trialEnd = new Date(now.getTime() + planTrialDays * 24 * 60 * 60 * 1000);
      szData.trial_start_date = now.toISOString();
      szData.trial_end_date = trialEnd.toISOString();
      szData.trial_active = true;
      szData.subscription_status = 'none';
    } else {
      // No trial — subscription starts immediately after payment
      szData.trial_active = false;
      szData.trial_start_date = null;
      szData.trial_end_date = null;
      szData.subscription_status = 'none'; // Will be set to 'active' by verify-payment
    }

    const { error: szError } = await supabase.from('still_zone_users').upsert(szData, { onConflict: 'id' });
    if (szError) console.error('[signup/complete] still_zone_users error:', szError.message);

    // ── 2. Create user_plans ──
    if (selectedPlanId) {
      const { data: fkCheck } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();

      if (fkCheck) {
        await supabase.from('user_plans').delete().eq('user_id', userId).eq('status', 'pending');

        const periodEnd = hasTrial
          ? new Date(now.getTime() + planTrialDays * 24 * 60 * 60 * 1000)
          : new Date(now.getTime() + planDurationDays * 24 * 60 * 60 * 1000);

        const { error: planError } = await supabase.from('user_plans').insert({
          user_id: userId,
          plan_id: selectedPlanId,
          plan_key: selectedPlanKey || null,
          status: 'pending', // verify-payment sets to 'active' after payment
          subscription_start_date: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          amount_paid: 0,
          currency: 'INR',
          is_recurring: true,
        });

        if (planError) console.error('[signup/complete] user_plans error:', planError.message);
      }
    }

    // ── 3. Verify ──
    const { data: finalSz } = await supabase.from('still_zone_users').select('id, trial_active, subscription_status').eq('id', userId).maybeSingle();
    const { data: finalPlan } = await supabase.from('user_plans').select('id, status').eq('user_id', userId).maybeSingle();
    console.log('[signup/complete] Final:', { profile: true, szUser: finalSz, userPlan: finalPlan });

    return NextResponse.json({ success: true, userId, accessToken, refreshToken });
  } catch (e: unknown) {
    console.error('[signup/complete] Fatal:', e);
    return NextResponse.json({ success: false, message: (e as Error)?.message || 'Signup failed.' }, { status: 500 });
  }
}
