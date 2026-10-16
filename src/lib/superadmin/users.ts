// Still Lift's answer to Voctex's operator console: its customers (docs/superadmin/
// CONTRACT.md, Part C, in the Voctex repo). The route reads the rows; this only
// shapes them, so it can be checked without a database.
//
// Still Lift makes no AI calls (no AI provider anywhere in the app), so there is
// no AI use to report: aiTracked is false and Voctex shows "not tracked". If an AI
// feature is added, record each call per user first, then report it here.

/** Must equal the slug Still Lift is registered under in Voctex, or Voctex refuses the answer. */
export const PRODUCT_SLUG = 'still-lift';
export const CONTRACT_VERSION = 1;
/** The contract's cap: the newest customers first, with the real count in total. */
export const MAX_USERS = 5000;

export interface ProfileRow {
    id: string;
    email: string | null;
    full_name: string | null;
    created_at: string | null;
}

export interface PlanRow {
    user_id: string;
    status: string | null;
    plan_key: string | null;
    created_at: string | null;
}

export interface ProductUser {
    id: string;
    email: string | null;
    name: string | null;
    role: string | null;
    plan: string | null;
    joinedAt: string | null;
    lastActiveAt: string | null;
}

export interface UsersAnswer {
    product: string;
    contractVersion: number;
    generatedAt: string;
    aiTracked: boolean;
    total: number | null;
    users: ProductUser[];
}

/** The plan names the super-admin members list shows (super-admin-stillzone/api/members). */
const PLAN_NAMES: Record<string, string> = { monthly: 'Mindful', yearly: 'Serenity', founder: 'Founder' };

/** The plan statuses that count as having a plan, best first. */
const STATUS_RANK: Record<string, number> = { active: 3, trial: 2, pending: 1 };

/** ISO-8601 in UTC ("…Z"), or null for a missing or unreadable time. */
export function utc(value: string | null | undefined): string | null {
    if (!value) return null;
    const t = Date.parse(value);
    return Number.isNaN(t) ? null : new Date(t).toISOString();
}

/** Each user's current plan: an active one over a trial over a pending payment, then the newest. */
export function currentPlans(rows: PlanRow[]): Map<string, PlanRow> {
    const best = new Map<string, PlanRow>();
    for (const row of rows) {
        const rank = STATUS_RANK[row.status ?? ''] ?? 0;
        if (!rank) continue;
        const held = best.get(row.user_id);
        const heldRank = held ? STATUS_RANK[held.status ?? ''] ?? 0 : 0;
        const newer = held ? (Date.parse(row.created_at ?? '') || 0) > (Date.parse(held.created_at ?? '') || 0) : true;
        if (!held || rank > heldRank || (rank === heldRank && newer)) best.set(row.user_id, row);
    }
    return best;
}

/** "Mindful", "Serenity (trial)", "Founder (payment pending)", or "Free" with no plan. */
export function planLabel(row: PlanRow | undefined): string {
    if (!row) return 'Free';
    const name = PLAN_NAMES[row.plan_key ?? ''] ?? 'Pro';
    if (row.status === 'trial') return `${name} (trial)`;
    if (row.status === 'pending') return `${name} (payment pending)`;
    return name;
}

export function toUsersAnswer(
    input: { total: number | null; profiles: ProfileRow[]; plans: PlanRow[]; lastSignIns: Map<string, string | null> },
    now: Date
): UsersAnswer {
    const plans = currentPlans(input.plans);
    return {
        product: PRODUCT_SLUG,
        contractVersion: CONTRACT_VERSION,
        generatedAt: now.toISOString(),
        aiTracked: false,
        total: typeof input.total === 'number' ? input.total : input.profiles.length,
        users: input.profiles.slice(0, MAX_USERS).map((p) => ({
            id: p.id,
            email: p.email ?? null,
            name: p.full_name ?? null,
            // Every account is a customer: the super admin is a separate login, not a profile.
            role: null,
            plan: planLabel(plans.get(p.id)),
            joinedAt: utc(p.created_at),
            // Supabase Auth's own sign-in time. profiles.last_sign_in is only set at sign-up.
            lastActiveAt: utc(input.lastSignIns.get(p.id) ?? null),
        })),
    };
}
