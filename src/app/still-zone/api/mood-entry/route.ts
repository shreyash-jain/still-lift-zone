export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getSupabase() {
    return createClient(supabaseUrl, supabaseServiceKey);
}

// Local date string (YYYY-MM-DD) — avoids UTC timezone shift
function toLocalDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
}

/**
 * POST /still-zone/api/mood-entry
 * Save a mood tracking entry for the user.
 * Body: { userId, moodKey, contextKey, timeKey, supportKey, audioKey? }
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, moodKey, contextKey, timeKey, supportKey, audioKey } = body;

        if (!userId || !moodKey || !contextKey || !timeKey || !supportKey) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Guard against literal "null" string values sent from client
        const isValid = (v: string) => v && v !== 'null' && v !== 'undefined';
        if (!isValid(moodKey) || !isValid(contextKey) || !isValid(timeKey) || !isValid(supportKey)) {
            return NextResponse.json({ error: 'Invalid field values — null strings not allowed' }, { status: 400 });
        }

        const supabase = getSupabase();

        // Date only (YYYY-MM-DD) for day-wise tracking — use local date, not UTC
        const today = toLocalDate(new Date());

        // Check if user already tracked today — upsert (one entry per day)
        const { data: existing } = await supabase
            .from('still_zone_mood_entries')
            .select('id')
            .eq('user_id', userId)
            .eq('entry_date', today)
            .maybeSingle();

        if (existing) {
            // Update today's entry
            const { error } = await supabase
                .from('still_zone_mood_entries')
                .update({
                    mood_key: moodKey,
                    context_key: contextKey,
                    time_key: timeKey,
                    support_key: supportKey,
                    audio_key: audioKey || null,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existing.id);

            if (error) {
                console.error('Error updating mood entry:', error);
                return NextResponse.json({ error: 'Failed to update mood entry' }, { status: 500 });
            }

            return NextResponse.json({ success: true, action: 'updated' });
        } else {
            // Insert new entry for today
            const { error } = await supabase
                .from('still_zone_mood_entries')
                .insert({
                    user_id: userId,
                    mood_key: moodKey,
                    context_key: contextKey,
                    time_key: timeKey,
                    support_key: supportKey,
                    audio_key: audioKey || null,
                    entry_date: today,
                    created_at: new Date().toISOString(),
                });

            if (error) {
                console.error('Error inserting mood entry:', error);
                return NextResponse.json({ error: 'Failed to save mood entry' }, { status: 500 });
            }

            return NextResponse.json({ success: true, action: 'created' });
        }
    } catch (err) {
        console.error('Mood entry API error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PATCH /still-zone/api/mood-entry
 * Update today's mood entry with actual session duration.
 * Body: { userId, sessionDurationSec }
 */
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { userId, sessionDurationSec } = body;

        if (!userId || typeof sessionDurationSec !== 'number') {
            return NextResponse.json({ error: 'Missing userId or sessionDurationSec' }, { status: 400 });
        }

        const supabase = getSupabase();
        const today = toLocalDate(new Date());

        // Find today's entry for this user
        const { data: existing } = await supabase
            .from('still_zone_mood_entries')
            .select('id, session_duration_sec')
            .eq('user_id', userId)
            .eq('entry_date', today)
            .maybeSingle();

        if (!existing) {
            return NextResponse.json({ error: 'No entry found for today' }, { status: 404 });
        }

        // Accumulate duration (in case of multiple sessions)
        const currentDuration = existing.session_duration_sec || 0;
        const newDuration = currentDuration + sessionDurationSec;

        const { error } = await supabase
            .from('still_zone_mood_entries')
            .update({
                session_duration_sec: newDuration,
                updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);

        if (error) {
            console.error('Error updating session duration:', error);
            return NextResponse.json({ error: 'Failed to update duration' }, { status: 500 });
        }

        return NextResponse.json({ success: true, totalDurationSec: newDuration });
    } catch (err) {
        console.error('PATCH mood entry error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * GET /still-zone/api/mood-entry?userId=xxx
 * Fetch mood entries + streak data for the user.
 * Returns: { entries, streak: { current, longest, startDate, dailyMap } }
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const supabase = getSupabase();

        // 1. Get user's subscription/enrollment start date from user_plans table
        //    Column: subscription_start_date (verified from Supabase)
        const { data: userPlan } = await supabase
            .from('user_plans')
            .select('subscription_start_date, created_at')
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('subscription_start_date', { ascending: false })
            .limit(1)
            .maybeSingle();

        // Fallback: if no active plan, try any plan, then profile created_at
        let startDateStr = userPlan?.subscription_start_date;
        if (!startDateStr) {
            const { data: anyPlan } = await supabase
                .from('user_plans')
                .select('subscription_start_date, created_at')
                .eq('user_id', userId)
                .order('subscription_start_date', { ascending: false })
                .limit(1)
                .maybeSingle();
            startDateStr = anyPlan?.subscription_start_date || anyPlan?.created_at;
        }
        if (!startDateStr) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('created_at')
                .eq('id', userId)
                .maybeSingle();
            startDateStr = profile?.created_at || new Date().toISOString();
        }

        const planStartDate = new Date(startDateStr);
        planStartDate.setHours(0, 0, 0, 0);

        // 2. Fetch all mood entries for this user from plan start date
        const { data: entries, error } = await supabase
            .from('still_zone_mood_entries')
            .select('*')
            .eq('user_id', userId)
            .gte('entry_date', toLocalDate(planStartDate))
            .order('entry_date', { ascending: true });

        if (error) {
            console.error('Error fetching mood entries:', error);
            return NextResponse.json({ error: 'Failed to fetch mood entries' }, { status: 500 });
        }

        // 3. Build a map of date → entry for quick lookup
        const entryMap: Record<string, {
            mood_key: string;
            context_key: string;
            time_key: string;
            support_key: string;
            audio_key: string | null;
        }> = {};

        (entries || []).forEach((entry: {
            entry_date: string;
            mood_key: string;
            context_key: string;
            time_key: string;
            support_key: string;
            audio_key: string | null;
        }) => {
            entryMap[entry.entry_date] = {
                mood_key: entry.mood_key,
                context_key: entry.context_key,
                time_key: entry.time_key,
                support_key: entry.support_key,
                audio_key: entry.audio_key,
            };
        });

        // 4. Build day-by-day data from plan start date to today
        const today = new Date();
        const todayStr = toLocalDate(today);
        const dailyData: {
            date: string;
            tracked: boolean;
            mood_key: string | null;
        }[] = [];

        const current = new Date(planStartDate);
        while (toLocalDate(current) <= todayStr) {
            const dateKey = toLocalDate(current);
            const entry = entryMap[dateKey];
            dailyData.push({
                date: dateKey,
                tracked: !!entry,
                mood_key: entry?.mood_key || null,
            });
            current.setDate(current.getDate() + 1);
        }

        // 5. Calculate streaks
        // Current streak = consecutive tracked days ending at today (or yesterday)
        let currentStreak = 0;
        for (let i = dailyData.length - 1; i >= 0; i--) {
            if (dailyData[i].tracked) {
                currentStreak++;
            } else {
                // If today is not tracked yet, skip today and check from yesterday
                if (i === dailyData.length - 1) {
                    continue; // give benefit of doubt — user might still track today
                }
                break;
            }
        }

        // Longest streak = longest consecutive run ever
        let longestStreak = 0;
        let tempStreak = 0;
        for (const day of dailyData) {
            if (day.tracked) {
                tempStreak++;
                if (tempStreak > longestStreak) longestStreak = tempStreak;
            } else {
                tempStreak = 0;
            }
        }

        // Total tracked days
        const totalTracked = dailyData.filter((d) => d.tracked).length;

        return NextResponse.json({
            entries: entries || [],
            dailyData,
            streak: {
                current: currentStreak,
                longest: longestStreak,
                totalTracked,
                totalDays: dailyData.length,
                startDate: toLocalDate(planStartDate),
            },
            // --- Streak reset logic (disabled for now, kept for future use) ---
            // resetStreak: To implement streak reset:
            //   1. Set currentStreak = 0 when a day is missed
            //   2. Uncomment the reset block below in the current streak calculation
            //   3. The longest streak remains unchanged
            // --- End disabled reset logic ---
        });
    } catch (err) {
        console.error('Mood entry GET error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
