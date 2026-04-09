export const runtime = 'experimental-edge';

import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/super-admin/supabase';

export async function GET() {
    const trace: string[] = [];
    try {
        trace.push("setup");
        const supabase = getAdminSupabase();

        // Local date helper — avoids UTC timezone shift
        const toLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

        // 1. Daily Active Users (DAU) - Tracked mood entries today
        trace.push("dau_query");
        const todayStr = toLocal(new Date());

        const { data: dauData, error: dauError } = await supabase
            .from('still_zone_mood_entries')
            .select('*')
            .gte('entry_date', todayStr);

        if (dauError) { trace.push("dau_error: " + JSON.stringify(dauError)); throw dauError; }

        // Unique users today
        trace.push("dau_count");
        const uniqueDauUsers = new Set((dauData || []).map((d: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => d.user_id));
        const dauCount = uniqueDauUsers.size;

        // 2. Average Time Spent - calculate via still_zone_mood_entries time_keys
        trace.push("stats_query");
        const { data: moodEntries, error: statsError } = await supabase
            .from('still_zone_mood_entries')
            .select('*');

        if (statsError) { trace.push("stats_error: " + JSON.stringify(statsError)); throw statsError; }

        trace.push("stats_calc");
        let totalOverallTimeSecs = 0;
        let entriesWithDuration = 0;
        const toolUsageMap: Record<string, number> = {};

        // 5. Currently Active Users (Real-time indicator mock, based on last 15 mins)
        const fifteenMinsAgo = new Date(Date.now() - 15 * 60000);
        let currentlyActiveCount = 0;

        (moodEntries || []).forEach((entry: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
            // Time spent parsing from time_key ('1min', '5min', etc)
            if (entry.time_key && entry.time_key !== 'null') {
                const match = entry.time_key.toString().match(/(\d+)min/);
                if (match && match[1]) {
                    const mins = parseInt(match[1]);
                    if (!isNaN(mins)) {
                        totalOverallTimeSecs += (mins * 60);
                        entriesWithDuration++;
                    }
                }
            }

            // Tools Usage parsing support_key
            if (entry.support_key && entry.support_key !== 'null') {
                toolUsageMap[entry.support_key] = (toolUsageMap[entry.support_key] || 0) + 1;
            }

            // Currently active based on updated_at
            const lastActive = entry.updated_at || entry.created_at;
            if (lastActive) {
                const updatedTime = new Date(lastActive);
                if (updatedTime >= fifteenMinsAgo) {
                    currentlyActiveCount++;
                }
            }
        });

        const avgTimeSpentSeconds = entriesWithDuration > 0 ? Math.round(totalOverallTimeSecs / entriesWithDuration) : 0;
        const avgTimeSpentMinutes = Math.max(0, Math.round(avgTimeSpentSeconds / 60));

        // 3. Tools Used
        trace.push("tools_map");
        const toolsUsed = Object.entries(toolUsageMap).map(([name, count]) => ({
            name,
            count
        })).sort((a, b) => b.count - a.count);

        // 4. Subscription Plan - Active subscribers vs Free/Trial from user_plans
        trace.push("sub_query");
        const { data: subscriberData, error: subError } = await supabase
            .from('user_plans')
            .select('user_id')
            .eq('status', 'active');

        if (subError) { trace.push("subError: " + JSON.stringify(subError)); throw subError; }
        const uniqueSubscribers = new Set((subscriberData || []).map(d => d.user_id));
        const subscriberCount = uniqueSubscribers.size;

        trace.push("total_users_query");
        const { data: totalUsersData, error: usersError } = await supabase
            .from('profiles')
            .select('id');

        if (usersError) { trace.push("usersError: " + JSON.stringify(usersError)); throw usersError; }

        trace.push("recent_users_query");
        const { data: recentUsers, error: recentUsersError } = await supabase
            .from('profiles')
            .select('id, full_name, email, last_sign_in, provider')
            .order('last_sign_in', { ascending: false })
            .limit(10);

        if (recentUsersError) { trace.push("recentUsersError: " + JSON.stringify(recentUsersError)); throw recentUsersError; }

        // Map is_subscription_active for the recent logins list
        const mappedRecentUsers = (recentUsers || []).map(u => ({
            ...u,
            is_subscription_active: uniqueSubscribers.has(u.id)
        }));

        // Build aggregate mood daily data for the graph (last 30 days)
        trace.push("mood_daily");
        const moodByDate: Record<string, { count: number; moods: Record<string, number> }> = {};
        (moodEntries || []).forEach((entry: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
            const dateStr = entry.entry_date;
            if (!dateStr) return;
            if (!moodByDate[dateStr]) moodByDate[dateStr] = { count: 0, moods: {} };
            moodByDate[dateStr].count++;
            if (entry.mood_key) {
                moodByDate[dateStr].moods[entry.mood_key] = (moodByDate[dateStr].moods[entry.mood_key] || 0) + 1;
            }
        });

        // Generate last 30 days for the graph
        const moodDailyData = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dStr = toLocal(d);
            const dayData = moodByDate[dStr];
            if (dayData) {
                // Pick most frequent mood of the day
                const topMood = Object.entries(dayData.moods).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
                moodDailyData.push({ date: dStr, mood_type: topMood, time_key: null, tracked: true, sessions: dayData.count });
            } else {
                moodDailyData.push({ date: dStr, mood_type: null, time_key: null, tracked: false, sessions: 0 });
            }
        }

        // Compute mood summary
        const trackedDays = moodDailyData.filter(d => d.tracked);
        const moodCounts: Record<string, number> = {};
        trackedDays.forEach(d => { if (d.mood_type) moodCounts[d.mood_type] = (moodCounts[d.mood_type] || 0) + 1; });
        const mostFrequentMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
        let currentStreak = 0;
        for (let i = moodDailyData.length - 1; i >= 0; i--) {
            if (moodDailyData[i].tracked) currentStreak++;
            else break;
        }
        let bestStreak = 0, tempStreak = 0;
        moodDailyData.forEach(d => { if (d.tracked) { tempStreak++; bestStreak = Math.max(bestStreak, tempStreak); } else tempStreak = 0; });

        const moodSummary = {
            totalDaysTracked: trackedDays.length,
            totalDays: 30,
            mostFrequentMood,
            mostFrequentMoodCount: moodCounts[mostFrequentMood] || 0,
            moodDistribution: moodCounts,
            bestStreak,
            bestStreakStart: '',
            bestStreakEnd: '',
            currentStreak,
        };

        trace.push("success");
        return NextResponse.json({
            success: true,
            data: {
                dau: dauCount || 0,
                avgTimeSpentMinutes,
                toolsUsed,
                subscriptions: {
                    active: subscriberCount || 0,
                    total: totalUsersData?.length || 0,
                },
                currentlyActive: currentlyActiveCount || 0,
                recentLogins: mappedRecentUsers || [],
                moodDailyData,
                moodSummary,
            }
        });
    } catch (error: unknown) {
        console.error('SuperAdmin Dashboard fetch error:', error);
        return NextResponse.json({ success: false, trace, message: ((error as Error)?.message) || "Unknown error" }, { status: 500 });
    }
}
