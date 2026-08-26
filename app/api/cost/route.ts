import { NextResponse } from "next/server";
import { getAIUsage, getArticles } from "@/lib/db";

export async function GET() {
  const logs = await getAIUsage();
  const articles = await getArticles();

  const totalCost = logs.reduce((sum, l) => sum + l.estimated_cost, 0);
  const totalInputTokens = logs.reduce((sum, l) => sum + l.input_tokens, 0);
  const totalOutputTokens = logs.reduce((sum, l) => sum + l.output_tokens, 0);
  const averageCostPerArticle = articles.length > 0 ? totalCost / articles.length : 0;

  // Cost by model
  const costByModel: Record<string, { cost: number; calls: number }> = {};
  for (const log of logs) {
    if (!costByModel[log.model]) {
      costByModel[log.model] = { cost: 0, calls: 0 };
    }
    costByModel[log.model].cost += log.estimated_cost;
    costByModel[log.model].calls += 1;
  }

  // Cost by operation
  const costByOperation: Record<string, { cost: number; calls: number }> = {};
  for (const log of logs) {
    if (!costByOperation[log.operation]) {
      costByOperation[log.operation] = { cost: 0, calls: 0 };
    }
    costByOperation[log.operation].cost += log.estimated_cost;
    costByOperation[log.operation].calls += 1;
  }

  return NextResponse.json({
    totalCost: Math.round(totalCost * 1000) / 1000,
    totalInputTokens,
    totalOutputTokens,
    totalCalls: logs.length,
    averageCostPerArticle: Math.round(averageCostPerArticle * 1000) / 1000,
    costByModel,
    costByOperation,
    recentLogs: logs.slice(0, 15),
  });
}
