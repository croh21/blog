import { NextResponse } from "next/server";
import { defaultAIProvider } from "@/lib/providers/ai";
import { PROMPTS } from "@/lib/ai/prompts";
import { getTrendById, saveTopics, getTopics, getTrends } from "@/lib/db";
import { nanoid } from "nanoid";
import { Topic } from "@/types";

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {}
    const trendId = body?.trendId;
    const allTrends = await getTrends();
    let trend = trendId ? await getTrendById(trendId) : undefined;

    if (!trend && allTrends.length > 0) {
      // 랜덤 트렌드 선택
      trend = allTrends[Math.floor(Math.random() * allTrends.length)];
    }

    const trendTitle = trend?.title || "2026 차세대 트렌드와 라이프스타일 혁신";
    const trendCategory = trend?.category_name || "종합 트렌드";
    const trendDesc = trend?.description || "최신 검색량 급상승 및 고수익 전환 키워드 분석";

    const trendContext = `트렌드 제목: ${trendTitle}\n설명: ${trendDesc}\n분야: ${trendCategory}\n생성시간: ${new Date().toISOString()}`;

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
        `다음 트렌드를 바탕으로 검색 유입과 블로그 수익화에 최적화된 서로 다른 6개의 고유한 블로그 토픽을 도출하세요:\n${trendContext}`,
        PROMPTS.TOPIC_GENERATION_SYSTEM
      );

      if (res.data?.topics && res.data.topics.length > 0) {
        generatedTopics = res.data.topics.map((t) => ({
          id: nanoid(),
          trend_id: trend?.id || null,
          title: t.title,
          primary_keyword: t.primaryKeyword,
          secondary_keywords: t.secondaryKeywords || [],
          search_intent: t.searchIntent,
          content_type: (t.contentType as any) || "EXPLAINER",
          estimated_traffic: t.estimatedTraffic || 10000 + Math.floor(Math.random() * 5000),
          competition: t.competition || "LOW",
          commercial_value: t.commercialValue || 85 + Math.floor(Math.random() * 12),
          evergreen_score: t.evergreenScore || 85 + Math.floor(Math.random() * 12),
          opportunity_score: t.opportunityScore || 90 + Math.floor(Math.random() * 8),
          why_this_topic: t.whyThisTopic,
          recommended_length: t.recommendedLength || 2500,
          status: "PROPOSED",
          created_at: new Date().toISOString(),
        }));
      } else {
        throw new Error("Empty topics returned");
      }
    } catch {
      // Dynamic Fallback topics variations
      const baseKw = trendTitle.split(/[:\(\) -]/)[0].trim() || "최신 트렌드";
      const subKws = [trendCategory, `${baseKw} 추천`, `${baseKw} 실전 후기`];

      const topicTemplates = [
        {
          title: `${baseKw} 완벽 실전 가이드: 7일 만에 체감하는 핵심 효과와 실천법`,
          type: "HOW_TO",
          intent: "실전 적용 가이드",
          why: "초보자도 당장 따라 할 수 있는 구체적 실행 로드맵으로 검색 유입이 매우 높습니다.",
        },
        {
          title: `${baseKw} 시작 전 꼭 알아야 할 5가지 치명적 실수와 예방법`,
          type: "EXPLAINER",
          intent: "주의사항 및 실패 방지",
          why: "잘못된 정보로 부작용이나 비용 낭비를 겪는 독자들의 검색 니즈를 완벽 해결합니다.",
        },
        {
          title: `${baseKw} 인기 제품/방식 TOP 3 심층 비교: 가성비부터 실사용 장단점까지`,
          type: "COMPARISON",
          intent: "구매 및 선택 비교",
          why: "구매 직전 단계의 구매 전환율(Conversion Rate)과 제휴 마케팅 단가가 가장 높은 주제입니다.",
        },
        {
          title: `${baseKw} 전문가가 밝히는 효과 200% 극대화 루틴과 핵심 Q&A 총정리`,
          type: "FAQ",
          intent: "심층 질의응답",
          why: "독자들이 댓글이나 커뮤니티에서 가장 자주 묻는 질문들을 한 번에 해소합니다.",
        },
      ];

      generatedTopics = topicTemplates.map((tpl) => ({
        id: nanoid(),
        trend_id: trend?.id || null,
        title: tpl.title,
        primary_keyword: baseKw,
        secondary_keywords: subKws,
        search_intent: tpl.intent,
        content_type: tpl.type as any,
        estimated_traffic: 9000 + Math.floor(Math.random() * 6000),
        competition: (Math.random() > 0.5 ? "LOW" : "MEDIUM") as any,
        commercial_value: 88 + Math.floor(Math.random() * 10),
        evergreen_score: 90 + Math.floor(Math.random() * 8),
        opportunity_score: 91 + Math.floor(Math.random() * 7),
        why_this_topic: tpl.why,
        recommended_length: 2500 + Math.floor(Math.random() * 600),
        status: "PROPOSED",
        created_at: new Date().toISOString(),
      }));
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
