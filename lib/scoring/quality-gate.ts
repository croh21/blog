import { Article, ArticleClaim, Source } from "@/types";

export interface QualityCheckItem {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  currentValue: string | number;
  requiredValue: string | number;
}

export interface QualityGateResult {
  passed: boolean;
  checklist: QualityCheckItem[];
  missingReasons: string[];
}

/**
 * Validates an article against the 5 strict Quality Gates required for Human Approval and WordPress Publishing:
 * 1. Content completeness & minimum length (>= 600 words or >= 1,500 chars)
 * 2. SEO Score >= 75
 * 3. Fact Check Score >= 90%
 * 4. Critical Claims == 0 (Zero UNVERIFIED or CONFLICTING claims)
 * 5. Attached Tier 1~2 Sources >= 2
 */
export function evaluateQualityGate(
  article: Partial<Article>,
  claims: ArticleClaim[] = [],
  sources: Source[] = []
): QualityGateResult {
  const content = (article.content || "").trim();
  const wordCount = article.word_count || content.split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  const seoScore = article.seo_score || 0;
  const factCheckScore = article.fact_check_score || 0;

  // 1. Min content length check
  const isContentValid = content.length > 0 && (wordCount >= 600 || charCount >= 1500);

  // 2. SEO score >= 75
  const isSeoValid = seoScore >= 75;

  // 3. Fact check score >= 90%
  const isFactCheckValid = factCheckScore >= 90;

  // 4. Critical claims == 0 (No UNVERIFIED / CONFLICTING claims)
  const criticalClaimsCount = claims.filter(
    (c) => c.verification_status === "UNVERIFIED" || c.verification_status === "CONFLICTING"
  ).length;
  const isCriticalClaimsValid = criticalClaimsCount === 0;

  // 5. Tier 1~2 sources count >= 2
  const tier12SourcesCount = sources.filter((s) => s.tier === 1 || s.tier === 2).length;
  const isSourcesValid = tier12SourcesCount >= 2;

  const checklist: QualityCheckItem[] = [
    {
      id: "content_length",
      name: "본문 최소 분량 충족",
      description: "최소 600 단어(약 1,500자) 이상의 실전 본문 작성 필요",
      passed: isContentValid,
      currentValue: `${wordCount} 단어 (${charCount}자)`,
      requiredValue: "600 단어 이상",
    },
    {
      id: "seo_score",
      name: "SEO 종합 점수 75점 이상",
      description: "검색 의도, 메타데이터, 헤딩 구조화 충족 필요",
      passed: isSeoValid,
      currentValue: `${seoScore}점`,
      requiredValue: "75점 이상",
    },
    {
      id: "fact_check_score",
      name: "팩트체크 신뢰도 90% 이상",
      description: "주요 주장 검증 및 신뢰도 확보 필요",
      passed: isFactCheckValid,
      currentValue: `${factCheckScore}%`,
      requiredValue: "90% 이상",
    },
    {
      id: "critical_issues",
      name: "미확인/의심 주장(Critical Issue) 0건",
      description: "UNVERIFIED 또는 CONFLICTING 상태의 주장이 없어야 함",
      passed: isCriticalClaimsValid,
      currentValue: `${criticalClaimsCount}건`,
      requiredValue: "0건",
    },
    {
      id: "tier_sources",
      name: "Tier 1~2 신뢰 출처 최소 2개 이상",
      description: "정부, 학술, 공식 문서, 주요 전문 언론 출처 연결 필요",
      passed: isSourcesValid,
      currentValue: `${tier12SourcesCount}개`,
      requiredValue: "2개 이상",
    },
  ];

  const missingReasons: string[] = checklist
    .filter((item) => !item.passed)
    .map((item) => `${item.name} (${item.description})`);

  const passed = checklist.every((item) => item.passed);

  return {
    passed,
    checklist,
    missingReasons,
  };
}
