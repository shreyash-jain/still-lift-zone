import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/super-admin/supabase';

export async function GET(request: Request) {
    try {
        const supabase = getAdminSupabase();

        // 1. Fetch Mood Entries for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

        const { data: entries, error: entriesError } = await supabase
            .from('still_zone_mood_entries')
            .select('user_id, mood_key, entry_date, created_at')
            .gte('entry_date', sevenDaysAgoStr);

        if (entriesError) throw entriesError;

        // Fetch Profiles to map user names
        const { data: profiles, error: pError } = await supabase
            .from('profiles')
            .select('id, full_name, email');

        if (pError) throw pError;

        const profileMap = new Map();
        (profiles || []).forEach(p => {
            profileMap.set(p.id, p);
        });

        interface DailyMood {
            date: string;
            totalCount: number;
        }
        interface UserTally {
            userId: string;
            fullName: string;
            email: string;
            latestMood: string | null;
            latestMoodDate: string | null;
            sevenDaySummary: Record<string, string>;
        }

        // Compute Graph 1 & 2 Data
        const moodCounts: Record<string, number> = {};
        const dailyMoods: Record<string, DailyMood> = {};
        const userTally: Record<string, UserTally> = {};

        // Generate 7 days labels
        const last7Dates: string[] = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dStr = d.toISOString().split('T')[0];
            last7Dates.push(dStr);
            dailyMoods[dStr] = { date: dStr, totalCount: 0 };
        }

        (entries || []).forEach(e => {
            if (!e.mood_key || e.mood_key === 'null') return;

            // Tally most used moods
            moodCounts[e.mood_key] = (moodCounts[e.mood_key] || 0) + 1;

            // Daily tracking
            if (dailyMoods[e.entry_date]) {
                dailyMoods[e.entry_date].totalCount++;
            }

            // User mapping
            if (!userTally[e.user_id]) {
                const p = profileMap.get(e.user_id) || {};
                userTally[e.user_id] = {
                    userId: e.user_id,
                    fullName: p.full_name || 'Anonymous',
                    email: p.email || 'N/A',
                    latestMood: null,
                    latestMoodDate: null,
                    sevenDaySummary: {}
                };
            }

            // Assign exactly the mood type for this date
            userTally[e.user_id].sevenDaySummary[e.entry_date] = e.mood_key;

            if (!userTally[e.user_id].latestMoodDate || new Date(e.created_at) > new Date(userTally[e.user_id].latestMoodDate || '')) {
                userTally[e.user_id].latestMood = e.mood_key;
                userTally[e.user_id].latestMoodDate = e.created_at;
            }
        });

        // Format Graph 1 (Trend Data)
        const trendData = last7Dates.map(dStr => dailyMoods[dStr]);

        // Format Graph 2 (Pie Chart)
        const mostUsedData = Object.entries(moodCounts)
            .map(([name, count]) => ({ name, value: count }))
            .sort((a, b) => b.value - a.value);

        // Format Graph 3 / Heatmap Data
        const userMoodsList = Object.values(userTally)
            .filter(u => u.latestMood) // Only show users who logged something
            .sort((a, b) => new Date(b.latestMoodDate || 0).getTime() - new Date(a.latestMoodDate || 0).getTime());

        return NextResponse.json({
            success: true,
            data: {
                dates: last7Dates,
                trendData,
                mostUsedData,
                userMoodsList
            }
        });
    } catch (error: unknown) {
        console.error('SuperAdmin Mood Analytics fetch error:', error);
        return NextResponse.json({
            success: false,
            message: ((error as Error)?.message) || "An error occurred fetching mood analytics."
        }, { status: 500 });
    }
}
