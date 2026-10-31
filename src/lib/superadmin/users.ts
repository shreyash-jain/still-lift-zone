// Still Lift's answer to Voctex's operator console: its customers and the AI each
// one has used (docs/superadmin/CONTRACT.md, Part C, in the Voctex repo). The route
// reads the rows; this only shapes them, so it can be checked without a database.
//
// AI use comes from llm_usage_logs (scripts/create_llm_usage_logs_table.sql), which
// recordLlmUsage() (src/lib/llm-usage.ts) writes once per AI call. Until that table
// exists, usage is null: aiTracked is false and Voctex shows "not tracked".
// ⚠️ aiTracked: true claims EVERY AI call is recorded, so any new AI call must go
// through recordLlmUsage().

/** Must equal the slug Still Lift is registered under in Voctex, or Voctex refuses the answer. */
export const PRODUCT_SLUG = 'still-lift';
export const CONTRACT_VERSION = 1;
/** The contract's cap: the heaviest AI users first, then the newest, with the real count in total. */
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

/** One row of llm_usage_user_summary: a user's AI use, all time. Postgres sums can arrive as strings. */
export interface UsageRow {
    user_id: string;
    total_requests: number | string | null;
    total_tokens: number | string | null;
    total_cost_usd: number | string | null;
}

export interface AiUse {
    calls: number | null;
    tokens: number | null;
    costUsd: number | null;
}

export interface ProductUser {
    id: string;
    email: string | null;
    name: string | null;
    role: string | null;
    plan: string | null;
    joinedAt: string | null;
    lastActiveAt: string | null;
    ai: AiUse;
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

/** A count or amount from Postgres (bigint and numeric can arrive as strings), or null. */
function num(value: number | string | null | undefined): number | null {
    if (value === null || value === undefined || value === '') return null;
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n : null;
}

/** For a product that doesn't record AI calls: missing, not zero. */
const NOT_TRACKED: AiUse = { calls: null, tokens: null, costUsd: null };
/** Every AI call is recorded, so a user with no row really made none. */
const NO_AI_USE: AiUse = { calls: 0, tokens: 0, costUsd: 0 };

/** Each user's AI use, all time, from llm_usage_user_summary rows. */
export function aiUse(rows: UsageRow[]): Map<string, AiUse> {
    const byUser = new Map<string, AiUse>();
    for (const r of rows) {
        const cost = num(r.total_cost_usd) ?? 0;
        byUser.set(r.user_id, {
            calls: num(r.total_requests) ?? 0,
            tokens: num(r.total_tokens) ?? 0,
            costUsd: Math.round(cost * 1e6) / 1e6,
        });
    }
    return byUser;
}

export function toUsersAnswer(
    input: {
        total: number | null;
        profiles: ProfileRow[];
        plans: PlanRow[];
        lastSignIns: Map<string, string | null>;
        /** null until llm_usage_logs is set up, so AI use isn't tracked yet. */
        usage: UsageRow[] | null;
    },
    now: Date
): UsersAnswer {
    const plans = currentPlans(input.plans);
    const usage = input.usage ? aiUse(input.usage) : null;
    const users: ProductUser[] = input.profiles.map((p) => ({
        id: p.id,
        email: p.email ?? null,
        name: p.full_name ?? null,
        // Every account is a customer: the super admin is a separate login, not a profile.
        role: null,
        plan: planLabel(plans.get(p.id)),
        joinedAt: utc(p.created_at),
        // Supabase Auth's own sign-in time. profiles.last_sign_in is only set at sign-up.
        lastActiveAt: utc(input.lastSignIns.get(p.id) ?? null),
        ai: usage ? usage.get(p.id) ?? NO_AI_USE : NOT_TRACKED,
    }));
    // Heaviest AI users first, so they are the ones kept past the cap. The sort is
    // stable, so equals keep the order the profiles arrive in: newest first.
    if (usage) users.sort((a, b) => (b.ai.tokens ?? 0) - (a.ai.tokens ?? 0));
    return {
        product: PRODUCT_SLUG,
        contractVersion: CONTRACT_VERSION,
        generatedAt: now.toISOString(),
        aiTracked: usage !== null,
        total: typeof input.total === 'number' ? input.total : input.profiles.length,
        users: users.slice(0, MAX_USERS),
    };
}
