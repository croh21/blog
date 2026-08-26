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
        title: "저속노화(Slow Aging) 식단과 혈당 스파이크 방지 가이드",
        description: "정제 탄수화물을 줄이고 통곡물과 채소 위주의 식단으로 혈당 변동성을 줄여 신체 활력과 노화 속도를 늦추는 라이프스타일이 20~40대 사이에서 급확산 중입니다.",
        category_name: "건강 & 웰니스",
        source_url: "https://health.harvard.edu/staying-healthy",
        source_name: "Harvard Health Publishing",
        published_at: new Date().toISOString(),
        collected_at: new Date().toISOString(),
        trend_score: 98,
        search_growth: 97,
        search_volume: 95,
        competition_score: 28, // 낮은 경쟁도 -> 높은 기회
        commercial_score: 94,
        evergreen_score: 96,
        social_score: 95,
        status: "SELECTED",
      },
      {
        title: "수면의 질을 200% 높이는 마그네슘 형태별(글리시네이트/트레온산) 복용법",
        description: "단순 멜라토닌 대신 뇌 장벽을 통과하는 마그네슘 트레온산염 및 흡수율 높은 글리시네이트를 활용한 렘수면 및 딥슬립 최적화 요법.",
        category_name: "건강 & 웰니스",
        source_url: "https://nih.gov/sleep-research",
        source_name: "National Institutes of Health (NIH)",
        published_at: new Date().toISOString(),
        collected_at: new Date().toISOString(),
        trend_score: 95,
        search_growth: 92,
        search_volume: 89,
        competition_score: 32,
        commercial_score: 96,
        evergreen_score: 94,
        social_score: 91,
        status: "SELECTED",
      },
      {
        title: "간헐적 단식(16:8)과 오토파지(자가포식) 활성화 실전 루틴",
        description: "공복 16시간 동안 손상된 세포가 스스로 정화되는 오토파지 메커니즘을 극대화하고 근손실 없이 체지방을 감량하는 과학적 식사 타이밍.",
        category_name: "건강 & 웰니스",
        source_url: "https://mayoclinic.org/intermittent-fasting",
        source_name: "Mayo Clinic Health Insights",
        published_at: new Date().toISOString(),
        collected_at: new Date().toISOString(),
        trend_score: 93,
        search_growth: 88,
        search_volume: 94,
        competition_score: 35,
        commercial_score: 90,
        evergreen_score: 98,
        social_score: 89,
        status: "SELECTED",
      },
      {
        title: "코르티솔 낮추는 아슈와간다 & 어댑토젠 허브의 스트레스 완화 효능",
        description: "만성 피로와 번아웃을 겪는 현대인을 위한 부신 피로 개선 및 스트레스 호르몬(코르티솔) 균형 영양 솔루션.",
        category_name: "건강 & 웰니스",
        source_url: "https://examine.com/supplements/ashwagandha",
        source_name: "Examine Research Database",
        published_at: new Date().toISOString(),
        collected_at: new Date().toISOString(),
        trend_score: 90,
        search_growth: 86,
        search_volume: 82,
        competition_score: 30,
        commercial_score: 92,
        evergreen_score: 91,
        social_score: 88,
        status: "DISCOVERED",
      },
      {
        title: "스마트 반지 & 연속 혈당 측정기(CGM)를 활용한 개인 맞춤 바이오해킹",
        description: "당뇨 환자뿐 아니라 일반인의 에너지 레벨 유지와 다이어트를 위한 실시간 혈당 모니터링 및 웨어러블 헬스 데이터 분석.",
        category_name: "건강 & 웰니스",
        source_url: "https://cdc.gov/diabetes-prevention",
        source_name: "질병관리청 / CDC Research",
        published_at: new Date().toISOString(),
        collected_at: new Date().toISOString(),
        trend_score: 92,
        search_growth: 94,
        search_volume: 85,
        competition_score: 25,
        commercial_score: 95,
        evergreen_score: 89,
        social_score: 92,
        status: "DISCOVERED",
      },
      {
        title: "Claude 3.7 Sonnet & 하이브리드 추론 모델의 실전 업무 자동화",
        description: "즉각적인 답변과 심층 추론(Thinking)을 결합한 하이브리드 AI 모델의 도입으로 복잡한 업무가 자동화되고 있습니다.",
        category_name: "AI & 테크",
        source_url: "https://anthropic.com/news/claude-3-7-sonnet",
        source_name: "Anthropic Official Announcement",
        published_at: new Date().toISOString(),
        collected_at: new Date().toISOString(),
        trend_score: 94,
        search_growth: 92,
        search_volume: 88,
        competition_score: 40,
        commercial_score: 90,
        evergreen_score: 82,
        social_score: 90,
        status: "DISCOVERED",
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
