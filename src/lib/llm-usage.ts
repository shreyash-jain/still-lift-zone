/**
 * LLM Usage Logging
 * Records one row in llm_usage_logs per LLM API call (tokens + cost).
 * Uses the service role key — NEVER import this in client-side code!
 */

import { getSupabaseAdmin } from '@/lib/razorpay/supabase-admin';

export type LlmUsageStatus = 'success' | 'error';

export interface LlmUsageInput {
    userId: string | null;
    provider: string;          // 'openai', 'anthropic', 'google', ...
    model: string;             // exact model id sent to the provider
    feature?: string;          // app feature that made the call, e.g. 'journal-insight'
    requestId?: string;        // provider's request id
    inputTokens: number;
    outputTokens: number;
    cachedInputTokens?: number;
    inputCostUsd: number;
    outputCostUsd: number;
    status?: LlmUsageStatus;
    errorMessage?: string;
    latencyMs?: number;
    metadata?: Record<string, unknown>;
}

/**
 * Insert a usage row. User email/name are filled from profiles by a DB trigger.
 *
 * Never throws: a logging failure must not break the user's request,
 * so it logs the error and returns false instead.
 */
export async function recordLlmUsage(usage: LlmUsageInput): Promise<boolean> {
    try {
        const { error } = await getSupabaseAdmin()
            .from('llm_usage_logs')
            .insert({
                user_id: usage.userId,
                provider: usage.provider,
                model: usage.model,
                feature: usage.feature ?? null,
                request_id: usage.requestId ?? null,
                input_tokens: usage.inputTokens,
                output_tokens: usage.outputTokens,
                cached_input_tokens: usage.cachedInputTokens ?? 0,
                input_cost_usd: usage.inputCostUsd,
                output_cost_usd: usage.outputCostUsd,
                status: usage.status ?? 'success',
                error_message: usage.errorMessage ?? null,
                latency_ms: usage.latencyMs ?? null,
                metadata: usage.metadata ?? {},
            });

        if (error) {
            console.error('Failed to record LLM usage:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Failed to record LLM usage:', err);
        return false;
    }
}
