import { AIUsageLog } from "@/types";
import { nanoid } from "nanoid";
import { saveAIUsage } from "@/lib/db";

// Pricing per 1M tokens in USD
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 2.5, output: 10.0 },
  "gpt-4o-mini": { input: 0.15, output: 0.60 },
  "claude-3-7-sonnet": { input: 3.0, output: 15.0 },
  "claude-3-5-sonnet": { input: 3.0, output: 15.0 },
  "deepseek-chat": { input: 0.14, output: 0.28 },
};

export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING["gpt-4o-mini"];
  const cost =
    (inputTokens / 1_000_000) * pricing.input +
    (outputTokens / 1_000_000) * pricing.output;
  return Math.round(cost * 100000) / 100000;
}

export async function logAIUsage(params: {
  provider: string;
  model: string;
  operation: string;
  inputTokens: number;
  outputTokens: number;
  userId?: string;
}): Promise<AIUsageLog> {
  const cost = estimateCost(params.model, params.inputTokens, params.outputTokens);
  const log: AIUsageLog = {
    id: nanoid(),
    user_id: params.userId,
    provider: params.provider,
    model: params.model,
    operation: params.operation,
    input_tokens: params.inputTokens,
    output_tokens: params.outputTokens,
    estimated_cost: cost,
    created_at: new Date().toISOString(),
  };

  try {
    await saveAIUsage(log);
  } catch (err) {
    console.error("Failed to persist AI usage log:", err);
  }

  return log;
}
