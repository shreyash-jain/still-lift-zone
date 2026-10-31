import { createHash, timingSafeEqual } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { MAX_USERS, toUsersAnswer, type PlanRow, type ProfileRow, type UsageRow } from '@/lib/superadmin/users';

// For Voctex's operator console, where Still Lift is one product: Still Lift's
// customers, their plans and their AI use (src/lib/superadmin/users.ts). Voctex's server
// calls it when an operator opens Still Lift's page, and shows the list without storing it.
//
//   GET /api/superadmin/v1/users
//   Authorization: Bearer <SUPERADMIN_SUMMARY_KEY>
//
// The key is the only way in (src/middleware.ts doesn't cover /api). As the
// contract asks, it behaves as if it does not exist (404) until the key is set,
// and it never redirects.

const NO_STORE = { 'Cache-Control': 'no-store' };
const fail = (status: number, error: string) => Response.json({ error }, { status, headers: NO_STORE });

/** The contract's floor. A shorter key is treated as not set rather than trusted. */
const MIN_KEY_LENGTH = 32;
/** Supabase's API returns at most 1,000 rows per request, and listUsers at most 1,000 per page. */
const PAGE = 1000;
/** Ids per `.in()` request, short enough for the request's address. */
const IDS_PER_REQUEST = 100;
/** What Supabase's API answers for a table or view that doesn't exist (newer, then older versions). */
const MISSING_TABLE = new Set(['PGRST205', '42P01']);

/** The request carries Voctex's key, compared in constant time. */
function hasKey(request: Request, key: string): boolean {
    const given = /^Bearer\s+(\S+)$/i.exec(request.headers.get('authorization')?.trim() ?? '')?.[1];
    if (!given) return false;
    const digest = (s: string) => createHash('sha256').update(s).digest();
    return timingSafeEqual(digest(given), digest(key));
}

type Page<T> = PromiseLike<{ data: T[] | null; error: { message: string; code?: string } | null }>;

/** Reads page after page until a short page or `max` rows. A failure keeps Supabase's error code. */
async function readAll<T>(page: (from: number, to: number) => Page<T>, max: number): Promise<T[]> {
    const rows: T[] = [];
    for (let from = 0; from < max; from += PAGE) {
        const { data, error } = await page(from, Math.min(from + PAGE, max) - 1);
        if (error) throw Object.assign(new Error(error.message), { code: error.code });
        rows.push(...(data ?? []));
        if (!data || data.length < PAGE) break;
    }
    return rows;
}

export async function GET(request: Request) {
    const key = process.env.SUPERADMIN_SUMMARY_KEY?.trim();
    if (!key || key.length < MIN_KEY_LENGTH) {
        if (key) console.error('SUPERADMIN_SUMMARY_KEY is shorter than 32 characters, so /api/superadmin is off.');
        return new Response(null, { status: 404, headers: NO_STORE });
    }
    if (!hasKey(request, key)) return fail(401, 'Missing or wrong key.');

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return fail(503, 'The users list is not set up: it needs SUPABASE_SERVICE_ROLE_KEY.');
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    try {
        const { count, error: countError } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
        if (countError) throw new Error(countError.message);

        // Each customer's AI use, heaviest first, from the llm_usage_user_summary view.
        // null until scripts/create_llm_usage_logs_table.sql has been run: AI then reads
        // "not tracked". Rows of deleted accounts (user_id cleared) aren't customers.
        let usage: UsageRow[] | null;
        try {
            usage = await readAll<UsageRow>(
                (from, to) =>
                    supabase
                        .from('llm_usage_user_summary')
                        .select('user_id, total_requests, total_tokens, total_cost_usd')
                        .not('user_id', 'is', null)
                        .order('total_tokens', { ascending: false })
                        .order('user_id', { ascending: true })
                        .range(from, to),
                MAX_USERS
            );
        } catch (e) {
            if (!MISSING_TABLE.has((e as { code?: string }).code ?? '')) throw e;
            usage = null;
        }

        // Newest customers first, the same order as the members list.
        const profiles = await readAll<ProfileRow>(
            (from, to) =>
                supabase
                    .from('profiles')
                    .select('id, email, full_name, created_at')
                    .order('created_at', { ascending: false })
                    .order('id', { ascending: true })
                    .range(from, to),
            MAX_USERS
        );

        // With more customers than the cap, a heavy AI user can be older than the newest
        // MAX_USERS. Read those few too, so the heaviest are the ones listed.
        const listed = new Set(profiles.map((p) => p.id));
        const unlisted = (usage ?? []).map((u) => u.user_id).filter((id) => !listed.has(id));
        for (let i = 0; i < unlisted.length; i += IDS_PER_REQUEST) {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, email, full_name, created_at')
                .in('id', unlisted.slice(i, i + IDS_PER_REQUEST));
            if (error) throw new Error(error.message);
            profiles.push(...(data ?? []));
        }

        const plans = await readAll<PlanRow>(
            (from, to) =>
                supabase
                    .from('user_plans')
                    .select('user_id, status, plan_key, created_at')
                    .in('status', ['active', 'trial', 'pending'])
                    .order('created_at', { ascending: false })
                    .range(from, to),
            10 * PAGE
        );

        const lastSignIns = new Map<string, string | null>();
        for (let page = 1; page <= Math.ceil(MAX_USERS / PAGE); page++) {
            const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: PAGE });
            if (error) throw new Error(error.message);
            for (const u of data.users) lastSignIns.set(u.id, u.last_sign_in_at ?? null);
            if (data.users.length < PAGE) break;
        }

        return Response.json(toUsersAnswer({ total: count, profiles, plans, lastSignIns, usage }, new Date()), { headers: NO_STORE });
    } catch (e) {
        console.error('Users list for Voctex failed:', e instanceof Error ? e.message : e);
        return fail(500, 'The users list could not be read. Please try again.');
    }
}
