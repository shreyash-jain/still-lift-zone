export const runtime = 'experimental-edge';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/super-admin/supabase';

export async function GET(request: NextRequest) {
    try {
        const supabase = getAdminSupabase();
        const { searchParams } = new URL(request.url);

        const page = Math.max(1, Number(searchParams.get('page')) || 1);
        const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 10));
        const search = searchParams.get('search')?.trim() || '';
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        // 1. Count total profiles (with optional search filter)
        let countQuery = supabase.from('profiles').select('id', { count: 'exact', head: true });
        if (search) {
            countQuery = countQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
        }
        const { count: totalCount, error: countError } = await countQuery;
        if (countError) throw countError;

        // 2. Fetch paginated profiles
        let profileQuery = supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })
            .range(from, to);
        if (search) {
            profileQuery = profileQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
        }
        const { data: profiles, error: pError } = await profileQuery;
        if (pError) throw pError;

        // 2. Fetch User Plans (to determine accurate subscription tier)
        const { data: plans, error: plansError } = await supabase
            .from('user_plans')
            .select('user_id, status, current_period_end, plan_key')
            .in('status', ['active', 'trialing']);

        if (plansError) throw plansError;

        const activePlansMap = new Map();
        (plans || []).forEach(p => {
            activePlansMap.set(p.user_id, p);
        });

        // 3. Fetch mood entries only for the paginated users
        const userIds = (profiles || []).map(p => p.id);
        const { data: entries, error: eError } = userIds.length > 0
            ? await supabase
                .from('still_zone_mood_entries')
                .select('user_id, time_key, support_key, entry_date, mood_key, updated_at, created_at')
                .in('user_id', userIds)
            : { data: [], error: null };

        if (eError) throw eError;

        const fifteenMinsAgo = new Date(Date.now() - 15 * 60000);

        // Group entries by user
        const userStatsMap = new Map();
        (entries || []).forEach(e => {
            const userId = e.user_id;
            if (!userStatsMap.has(userId)) {
                userStatsMap.set(userId, {
                    totalSessions: 0,
                    totalTimeSecs: 0,
                    tools: {} as Record<string, number>,
                    lastActive: null as Date | null,
                    dailyActivity: [] as { date: string; tracked: boolean }[],
                    trackedDates: new Set<string>(),
                    moodByDate: {} as Record<string, string>,
                });
            }

            const stats = userStatsMap.get(userId);
            stats.totalSessions++;

            if (e.time_key && e.time_key !== 'null') {
                const match = e.time_key.toString().match(/(\d+)min/);
                if (match && match[1]) {
                    const mins = parseInt(match[1]);
                    if (!isNaN(mins)) {
                        stats.totalTimeSecs += (mins * 60);
                    }
                }
            }

            if (e.support_key && e.support_key !== 'null') {
                stats.tools[e.support_key] = (stats.tools[e.support_key] || 0) + 1;
            }

            const activityTime = new Date(e.updated_at || e.created_at);
            if (!stats.lastActive || activityTime > stats.lastActive) {
                stats.lastActive = activityTime;
            }

            // Store ALL tracked dates and moods (no date restriction)
            if (e.entry_date) {
                stats.trackedDates.add(e.entry_date);
                if (e.mood_key) {
                    stats.moodByDate[e.entry_date] = e.mood_key;
                }
            }
        });

        // Map data to the requested output format
        const members = (profiles || []).map(p => {
            const plan = activePlansMap.get(p.id);
            const stats = userStatsMap.get(p.id) || {
                totalSessions: 0,
                totalTimeSecs: 0,
                tools: {},
                lastActive: null,
                trackedDates: new Set(),
            };

            // Calculate 'Currently Active'
            const lastSignIn = p.last_sign_in ? new Date(p.last_sign_in) : null;
            const mostRecentActivity = stats.lastActive && lastSignIn
                ? (stats.lastActive > lastSignIn ? stats.lastActive : lastSignIn)
                : (stats.lastActive || lastSignIn);

            const isCurrentlyActive = mostRecentActivity ? mostRecentActivity >= fifteenMinsAgo : false;

            // Generate full activity chart from join date to today
            // Use local date formatting to avoid UTC timezone shift
            const toLocal = (d: Date) => {
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                return `${y}-${m}-${dd}`;
            };
            const dailyActivityChart = [];
            const today = new Date();
            const todayStr = toLocal(today);
            const joinDateStr = p.created_at ? p.created_at.split('T')[0] : todayStr;
            const startDate = new Date(joinDateStr + 'T00:00:00');
            const cursor = new Date(startDate);
            while (toLocal(cursor) <= todayStr) {
                const dStr = toLocal(cursor);
                dailyActivityChart.push({
                    date: dStr,
                    tracked: stats.trackedDates.has(dStr),
                    mood: stats.moodByDate?.[dStr] || null,
                });
                cursor.setDate(cursor.getDate() + 1);
            }

            // Map Tools Used Map to array
            const toolsUsedArray = Object.entries(stats.tools).map(([name, count]) => ({
                name,
                count: count as number
            })).sort((a, b) => b.count - a.count);

            const avgSessionDurationMins = stats.totalSessions > 0
                ? Math.round((stats.totalTimeSecs / stats.totalSessions) / 60)
                : 0;

            const totalTimeSpentMins = Math.round(stats.totalTimeSecs / 60);

            // Determine Account Status logic (example)
            // Determine Account Status from profiles.account_status or default Active
            const accountStatus: string = (p as Record<string, unknown>).account_status as string || 'Active';

            // Subscription Plan String mapped directly from plan_key
            let subscriptionPlan = 'Free';
            if (plan) {
                if (plan.plan_key === 'monthly') subscriptionPlan = 'Mindful';
                else if (plan.plan_key === 'yearly') subscriptionPlan = 'Serenity';
                else if (plan.plan_key === 'founder') subscriptionPlan = 'Founder';
                else subscriptionPlan = 'Pro';
            }

            return {
                id: p.id,
                fullName: p.full_name || 'Anonymous User',
                email: p.email || '-',
                avatarUrl: p.avatar_url || null,
                joinDate: p.created_at,
                lastLogin: p.last_sign_in,
                accountStatus,
                subscriptionPlan,
                billingEnd: plan?.current_period_end || null,
                provider: p.provider || 'unknown',
                isCurrentlyActive,
                totalTimeSpentMins,
                totalSessions: stats.totalSessions,
                avgSessionDurationMins,
                toolsUsed: toolsUsedArray,
                dailyActivityChart,
            };
        });

        const total = totalCount || 0;
        return NextResponse.json({
            success: true,
            data: members,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error: unknown) {
        console.error('SuperAdmin Members fetch error:', error);
        return NextResponse.json({
            success: false,
            message: ((error as Error)?.message) || "An error occurred fetching members list."
        }, { status: 500 });
    }
}
