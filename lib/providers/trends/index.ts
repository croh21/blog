import { Trend } from "@/types";
import { calculateOpportunityScore } from "@/lib/scoring/trend-scorer";
import { nanoid } from "nanoid";

export interface TrendProvider {
  name: string;
  discoverTrends(): Promise<Trend[]>;
}

export class DefaultTrendProvider implements TrendProvider {
  name = "Trend Discovery Engine";

  async discoverTrends(): Promise<Trend[]> {
    const rawCandidates: Array<Omit<Trend, "id" | "opportunity_score" | "created_at">> = [
      {
        title: "Claude 3.7 Sonnet & 하이브리드 추론 모델의 실전 업무 자동화",
        description: "즉각적인 답변과 심층 추론(Thinking)을 결합한 하이브리드 AI 모델의 도입으로 복잡한 코드 리팩토링 및 전략 기획이 자동화되고 있습니다.",
        category_name: "AI & 자율 에이전트",
        source_url: "https://anthropic.com/news/claude-3-7-sonnet",
        source_name: "Anthropic Official Announcement",
        published_at: new Date().toISOString(),
        collected_at: new Date().toISOString(),
        trend_score: 98,
        search_growth: 96,
        search_volume: 92,
        competition_score: 30, // low competition
        commercial_score: 95,
        evergreen_score: 85,
        social_score: 94,
        status: "SELECTED",
      },
      {
        title: "소형 온디바이스 SLM 모델과 웹 브라우저 내 로컬 AI 혁신",
        description: "WebGPU와 WebAssembly를 활용해 서버 비용 없이 브라우저 내에서 직접 구동되는 초경량 언어 모델(Small Language Model) 생태계가 급팽창하고 있습니다.",
        category_name: "생산성 & SaaS 테크",
        source_url: "https://web.dev/explore/ai",
        source_name: "Google Web Developers",
        published_at: new Date().toISOString(),
        collected_at: new Date().toISOString(),
        trend_score: 88,
        search_growth: 82,
        search_volume: 75,
        competition_score: 38,
        commercial_score: 84,
        evergreen_score: 90,
        social_score: 80,
        status: "DISCOVERED",
      },
      {
        title: "AI 에이전트 결제 표준(x402 & Agentic Commerce)의 시작",
        description: "인간의 직접 결제 대신 AI 에이전트가 API 및 토큰 기반으로 상품을 비교 구매하는 자율 상거래 표준 프로토콜이 공개되었습니다.",
        category_name: "AI & 자율 에이전트",
        source_url: "https://coinbase.com/developer-platform",
        source_name: "Agentic Commerce Protocol",
        published_at: new Date().toISOString(),
        collected_at: new Date().toISOString(),
        trend_score: 92,
        search_growth: 89,
        search_volume: 79,
        competition_score: 25,
        commercial_score: 98,
        evergreen_score: 88,
        social_score: 86,
        status: "DISCOVERED",
      },
      {
        title: "Next.js 15 & React 19 서버 컴포넌트 마이그레이션 모범 사례",
        description: "Async Request APIs, Partial Prerendering(PPR) 및 Server Actions 최적화를 통한 웹 퍼포먼스 및 Core Web Vitals 개선 사례 분석.",
        category_name: "생산성 & SaaS 테크",
        source_url: "https://nextjs.org/blog",
        source_name: "Vercel Next.js Team",
        published_at: new Date().toISOString(),
        collected_at: new Date().toISOString(),
        trend_score: 85,
        search_growth: 78,
        search_volume: 88,
        competition_score: 55,
        commercial_score: 75,
        evergreen_score: 92,
        social_score: 70,
        status: "DISCOVERED",
      },
      {
        title: "Perplexity & AI 검색 엔진 대상 Citation 인용 최적화 가이드",
        description: "기존 구글 백링크 중심 SEO에서 벗어나 LLM이 답변 생성 시 신뢰할 수 있는 출처로 채택하도록 구조화된 데이터를 제공하는 새로운 방법론.",
        category_name: "디지털 마케팅 & SEO",
        source_url: "https://searchengineland.com",
        source_name: "Search Marketing Daily",
        published_at: new Date().toISOString(),
        collected_at: new Date().toISOString(),
        trend_score: 94,
        search_growth: 95,
        search_volume: 84,
        competition_score: 40,
        commercial_score: 92,
        evergreen_score: 86,
        social_score: 90,
        status: "SELECTED",
      },
    ];

    return rawCandidates.map((c) => {
      const opportunity_score = calculateOpportunityScore(c);
      return {
        ...c,
        id: nanoid(),
        opportunity_score,
        created_at: new Date().toISOString(),
      };
    });
  }
}

export const trendProvider = new DefaultTrendProvider();
