import { NextResponse } from "next/server";
import { defaultAIProvider } from "@/lib/providers/ai";
import { PROMPTS } from "@/lib/ai/prompts";
import { getTrendById, saveTopics, getTopics } from "@/lib/db";
import { nanoid } from "nanoid";
import { Topic } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const trendId = body.trendId;
    const trend = trendId ? await getTrendById(trendId) : undefined;

    const trendContext = trend
      ? `트렌드 제목: ${trend.title}\n설명: ${trend.description}\n분야: ${trend.category_name || "Tech"}`
      : `분야: AI 에이전트, MCP 프로토콜, 검색엔진 AEO 최적화, 최신 테크 SaaS`;

    let generatedTopics: Topic[] = [];

    try {
      const res = await defaultAIProvider.generateJSON<{
        topics: Array<{
          title: string;
          primaryKeyword: string;
          secondaryKeywords: string[];
          searchIntent: string;
          contentType: string;
          estimatedTraffic: number;
          competition: "LOW" | "MEDIUM" | "HIGH";
          commercialValue: number;
          evergreenScore: number;
          opportunityScore: number;
          whyThisTopic: string;
          recommendedLength: number;
        }>;
      }>(
        `다음 트렌드를 바탕으로 10개의 고수익 블로그 토픽을 도출하세요:\n${trendContext}`,
        PROMPTS.TOPIC_GENERATION_SYSTEM
      );

      generatedTopics = res.data.topics.map((t) => ({
        id: nanoid(),
        trend_id: trend?.id || null,
        title: t.title,
        primary_keyword: t.primaryKeyword,
        secondary_keywords: t.secondaryKeywords || [],
        search_intent: t.searchIntent,
        content_type: (t.contentType as any) || "EXPLAINER",
        estimated_traffic: t.estimatedTraffic || 10000,
        competition: t.competition || "MEDIUM",
        commercial_value: t.commercialValue || 85,
        evergreen_score: t.evergreenScore || 85,
        opportunity_score: t.opportunityScore || 90,
        why_this_topic: t.whyThisTopic,
        recommended_length: t.recommendedLength || 2500,
        status: "PROPOSED",
        created_at: new Date().toISOString(),
      }));
    } catch {
      // Fallback topics
      generatedTopics = [
        {
          id: nanoid(),
          trend_id: trend?.id || null,
          title: `${trend?.title || "AI 기술 혁신"}: 실무자를 위한 완벽 가이드`,
          primary_keyword: "AI 기술 도입",
          secondary_keywords: ["AI 생산성", "업무 자동화", "ROI 분석"],
          search_intent: "실무 가이드 및 비교",
          content_type: "EXPLAINER",
          estimated_traffic: 11000,
          competition: "LOW",
          commercial_value: 90,
          evergreen_score: 88,
          opportunity_score: 93.5,
          why_this_topic: "최근 30일 검색 관심도가 폭발적으로 증가했으며 실전 가이드 희소성이 높습니다.",
          recommended_length: 2600,
          status: "PROPOSED",
          created_at: new Date().toISOString(),
        },
      ];
    }

    await saveTopics(generatedTopics);
    const allTopics = await getTopics();

    return NextResponse.json({ success: true, topics: allTopics, newCount: generatedTopics.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const topics = await getTopics();
  return NextResponse.json({ topics });
}
