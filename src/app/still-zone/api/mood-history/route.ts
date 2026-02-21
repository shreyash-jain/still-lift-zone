import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Timezone-safe date formatter — always returns YYYY-MM-DD in local time
function toLocalDateStr(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Get user's enrollment/purchase date from user_plans
        //    This is the ONLY start date — no hardcoded days window
        const { data: userPlan } = await supabase
            .from('user_plans')
            .select('subscription_start_date')
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('subscription_start_date', { ascending: true })
            .limit(1)
            .maybeSingle();

        // Fallback: try any plan if no active one found
        let planStartDateStr = userPlan?.subscription_start_date;
        if (!planStartDateStr) {
            const { data: anyPlan } = await supabase
                .from('user_plans')
                .select('subscription_start_date')
                .eq('user_id', userId)
                .order('subscription_start_date', { ascending: true })
                .limit(1)
                .maybeSingle();
            planStartDateStr = anyPlan?.subscription_start_date;
        }

        // If no plan found at all, fall back to profile created_at
        if (!planStartDateStr) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('created_at')
                .eq('id', userId)
                .maybeSingle();
            planStartDateStr = profile?.created_at?.split('T')[0];
        }

        // Start date = enrollment date. Always. Never hardcoded.
        const startDate = planStartDateStr ? new Date(planStartDateStr) : new Date();
        startDate.setHours(0, 0, 0, 0);

        // 3. Fetch mood data from still_zone_mood_entries
        const { data: entries, error } = await supabase
            .from('still_zone_mood_entries')
            .select('mood_key, time_key, entry_date')
            .eq('user_id', userId)
            .gte('entry_date', toLocalDateStr(startDate))
            .order('entry_date', { ascending: true });

        if (error) {
            console.error('Error fetching mood history:', error);
            return NextResponse.json({ error: 'Failed to fetch mood history' }, { status: 500 });
        }

        // Sanitize helper — DB sometimes stores literal string "null" instead of NULL
        const sanitize = (val: string | null | undefined): string | null => {
            if (!val || val === 'null' || val === 'undefined' || val.trim() === '') return null;
            return val.trim();
        };

        // 4. Map entries for quick lookup
        const entryMap: Record<string, { mood_key: string; time_key: string | null }> = {};
        (entries || []).forEach((e: { mood_key: string; time_key: string | null; entry_date: string }) => {
            const moodKey = sanitize(e.mood_key);
            if (moodKey) {  // Only store entry if it has a valid mood
                entryMap[e.entry_date] = { mood_key: moodKey, time_key: sanitize(e.time_key) };
            }
        });

        // 5. Build full dailyData array from startDate to today (inclusive)
        const dailyData = [];
        const current = new Date(startDate);
        const todayStr = toLocalDateStr(new Date());

        let currentStr = toLocalDateStr(current);
        while (currentStr <= todayStr) {
            const dateKey = currentStr;
            const entry = entryMap[dateKey];
            const moodKey = sanitize(entry?.mood_key ?? null);
            const timeKey = sanitize(entry?.time_key ?? null);

            dailyData.push({
                date: dateKey,
                mood_type: moodKey,
                time_key: timeKey,
                tracked: !!entry && !!moodKey,  // only tracked if has a valid mood
                sessions: (!!entry && !!moodKey) ? 1 : 0,
            });

            current.setDate(current.getDate() + 1);
            currentStr = toLocalDateStr(current);
        }

        // 6. Calculate summary stats
        const trackedDays = dailyData.filter(d => d.tracked);
        const moodCounts: Record<string, number> = {};
        trackedDays.forEach(d => {
            if (d.mood_type) {
                moodCounts[d.mood_type] = (moodCounts[d.mood_type] || 0) + 1;
            }
        });

        // Find most frequent mood
        let mostFrequentMood = '';
        let maxCount = 0;
        Object.entries(moodCounts).forEach(([mood, count]) => {
            if (count > maxCount) {
                mostFrequentMood = mood;
                maxCount = count;
            }
        });

        // Calculate best streak (best run ever)
        // Note: fetch ALL entries for true all-time best streak
        const { data: allEntries } = await supabase
            .from('still_zone_mood_entries')
            .select('entry_date')
            .eq('user_id', userId)
            .order('entry_date', { ascending: true });

        const allTrackedDates = new Set((allEntries || []).map(e => e.entry_date));

        let bestStreak = 0;
        let bestStreakStart = '';
        let bestStreakEnd = '';
        let tempStreak = 0;
        let tempStreakStart = '';

        // Sort dates to calculate streak accurately
        const sortedDates = Array.from(allTrackedDates).sort();

        if (sortedDates.length > 0) {
            tempStreak = 1;
            tempStreakStart = sortedDates[0];
            bestStreak = 1;
            bestStreakStart = sortedDates[0];
            bestStreakEnd = sortedDates[0];

            for (let i = 1; i < sortedDates.length; i++) {
                const prevDate = new Date(sortedDates[i - 1]);
                const currDate = new Date(sortedDates[i]);
                const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24);

                if (diffDays === 1) {
                    tempStreak++;
                    if (tempStreak > bestStreak) {
                        bestStreak = tempStreak;
                        bestStreakStart = tempStreakStart;
                        bestStreakEnd = sortedDates[i];
                    }
                } else {
                    tempStreak = 1;
                    tempStreakStart = sortedDates[i];
                }
            }
        }

        // Current streak
        let currentStreak = 0;
        const checkDate = new Date();
        checkDate.setHours(0, 0, 0, 0);

        // Check today
        if (allTrackedDates.has(toLocalDateStr(checkDate))) {
            currentStreak = 1;
            checkDate.setDate(checkDate.getDate() - 1);
            while (allTrackedDates.has(toLocalDateStr(checkDate))) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            }
        } else {
            // Give benefit of doubt for today — check yesterday
            checkDate.setDate(checkDate.getDate() - 1);
            while (allTrackedDates.has(toLocalDateStr(checkDate))) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            }
        }

        return NextResponse.json({
            dailyData,
            summary: {
                totalDaysTracked: allTrackedDates.size,
                totalDays: dailyData.length, // This is relative to the view window
                mostFrequentMood,
                mostFrequentMoodCount: maxCount,
                moodDistribution: moodCounts,
                bestStreak,
                bestStreakStart,
                bestStreakEnd,
                currentStreak,
            },
        });
    } catch (err) {
        console.error('Mood history API error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
