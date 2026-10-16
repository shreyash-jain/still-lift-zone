import { createHash, timingSafeEqual } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { MAX_USERS, toUsersAnswer, type PlanRow, type ProfileRow } from '@/lib/superadmin/users';

// For Voctex's operator console, where Still Lift is one product: Still Lift's
// customers and their plans (src/lib/superadmin/users.ts). Voctex's server calls
// it when an operator opens Still Lift's page, and shows the list without storing it.
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

/** The request carries Voctex's key, compared in constant time. */
function hasKey(request: Request, key: string): boolean {
    const given = /^Bearer\s+(\S+)$/i.exec(request.headers.get('authorization')?.trim() ?? '')?.[1];
    if (!given) return false;
    const digest = (s: string) => createHash('sha256').update(s).digest();
    return timingSafeEqual(digest(given), digest(key));
}

type Page<T> = PromiseLike<{ data: T[] | null; error: { message: string } | null }>;

/** Reads page after page until a short page or `max` rows. */
async function readAll<T>(page: (from: number, to: number) => Page<T>, max: number): Promise<T[]> {
    const rows: T[] = [];
    for (let from = 0; from < max; from += PAGE) {
        const { data, error } = await page(from, Math.min(from + PAGE, max) - 1);
        if (error) throw new Error(error.message);
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

        // Newest customers first (there is no AI use to rank by), the same order as the members list.
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

        return Response.json(toUsersAnswer({ total: count, profiles, plans, lastSignIns }, new Date()), { headers: NO_STORE });
    } catch (e) {
        console.error('Users list for Voctex failed:', e instanceof Error ? e.message : e);
        return fail(500, 'The users list could not be read. Please try again.');
    }
}
