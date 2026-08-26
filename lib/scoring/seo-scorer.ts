import { Article, SEOScoreBreakdown } from "@/types";

/**
 * Evaluates an article against 10 SEO and content quality factors (0~100 each).
 * Computes overall SEO score and actionable recommendations.
 */
export function evaluateArticleSEO(
  article: Partial<Article>,
  sourceCount: number = 0,
  internalLinkCount: number = 0
): SEOScoreBreakdown {
  const title = (article.title || "").trim();
  const content = (article.content || "").trim();
  const metaDescription = (article.meta_description || "").trim();
  const primaryKeyword = (article.primary_keyword || "").trim().toLowerCase();
  const wordCount = article.word_count || content.split(/\s+/).filter(Boolean).length;

  const recommendations: string[] = [];

  // 1. Title Score (40~60 chars optimal, contains primary keyword)
  let titleScore = 60;
  if (title.length >= 25 && title.length <= 65) titleScore += 20;
  if (primaryKeyword && title.toLowerCase().includes(primaryKeyword)) titleScore += 20;
  if (titleScore < 80) recommendations.push("제목(Title)에 핵심 키워드를 포함하고 25~60자 내외로 조율하세요.");

  // 2. Meta Description Score (80~160 chars optimal, contains keyword)
  let metaDescriptionScore = 50;
  if (metaDescription.length >= 70 && metaDescription.length <= 165) metaDescriptionScore += 30;
  if (primaryKeyword && metaDescription.toLowerCase().includes(primaryKeyword)) metaDescriptionScore += 20;
  if (metaDescriptionScore < 80) recommendations.push("메타 설명문을 80~160자로 작성하고 핵심 키워드를 자연스럽게 포함하세요.");

  // 3. Heading Structure Score (Checks H1, H2, H3)
  let headingStructureScore = 60;
  const h2Count = (content.match(/^##\s+/gm) || []).length;
  const h3Count = (content.match(/^###\s+/gm) || []).length;
  if (h2Count >= 3) headingStructureScore += 25;
  if (h3Count >= 2) headingStructureScore += 15;
  if (h2Count < 3) recommendations.push("H2(소제목)를 최소 3개 이상 구성하여 글의 논리적 구조를 강화하세요.");

  // 4. Keyword Relevance & Density (1% ~ 2.5% density)
  let keywordRelevanceScore = 60;
  if (primaryKeyword && wordCount > 100) {
    const regex = new RegExp(primaryKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const matches = (content.match(regex) || []).length;
    const density = (matches / (wordCount || 1)) * 100;
    if (density >= 0.8 && density <= 3.0) {
      keywordRelevanceScore = 95;
    } else if (density > 0 && density < 0.8) {
      keywordRelevanceScore = 75;
      recommendations.push("핵심 키워드 출현 빈도가 다소 낮습니다. 주요 섹션에 자연스럽게 배치하세요.");
    } else if (density > 3.0) {
      keywordRelevanceScore = 65;
      recommendations.push("키워드 밀도가 너무 높습니다(과도한 키워드 반복 지양).");
    }
  }

  // 5. Content Completeness (Length & Section depth)
  let contentCompletenessScore = 50;
  if (wordCount >= 1500) contentCompletenessScore = 95;
  else if (wordCount >= 1000) contentCompletenessScore = 85;
  else if (wordCount >= 600) contentCompletenessScore = 70;
  else recommendations.push("콘텐츠 분량이 다소 부족합니다. 심층 정보와 사례를 보강하세요.");

  // 6. Search Intent Score
  let searchIntentScore = 85;
  const lowerContent = content.toLowerCase();
  const intentTerms = ["정의", "방법", "비교", "장단점", "전망", "핵심", "faq", "가이드", "결론"];
  const intentMatchCount = intentTerms.filter((term) => lowerContent.includes(term)).length;
  if (intentMatchCount >= 4) searchIntentScore = 95;

  // 7. Internal Links Score
  let internalLinksScore = 50;
  if (internalLinkCount >= 3) internalLinksScore = 95;
  else if (internalLinkCount >= 1) internalLinksScore = 80;
  else recommendations.push("기존 관련 글과의 내부 링크(Internal Link)를 최소 2개 이상 연결하세요.");

  // 8. External Sources Score
  let externalSourcesScore = 50;
  if (sourceCount >= 3) externalSourcesScore = 95;
  else if (sourceCount >= 1) externalSourcesScore = 80;
  else recommendations.push("신뢰도 높은 공공/전문 출처(Tier 1~2) 링크를 인용하여 전문성을 높이세요.");

  // 9. Readability Score (Paragraph length, bullet points, formatting)
  let readabilityScore = 70;
  const bulletCount = (content.match(/^[-*]\s+/gm) || []).length;
  const tableCount = (content.match(/\|.+\|/g) || []).length;
  if (bulletCount >= 3) readabilityScore += 15;
  if (tableCount >= 2) readabilityScore += 15;

  // 10. Original Analysis Score (Insights, Takeaways, Future outlook)
  let originalAnalysisScore = 80;
  if (lowerContent.includes("key takeaways") || lowerContent.includes("핵심 요약") || lowerContent.includes("시사점")) {
    originalAnalysisScore += 15;
  }

  const scores = [
    titleScore,
    metaDescriptionScore,
    headingStructureScore,
    keywordRelevanceScore,
    contentCompletenessScore,
    searchIntentScore,
    internalLinksScore,
    externalSourcesScore,
    readabilityScore,
    originalAnalysisScore,
  ];

  const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  return {
    overallScore,
    titleScore,
    metaDescriptionScore,
    headingStructureScore,
    keywordRelevanceScore,
    contentCompletenessScore,
    searchIntentScore,
    internalLinksScore,
    externalSourcesScore,
    readabilityScore,
    originalAnalysisScore,
    recommendations: recommendations.length > 0 ? recommendations : ["SEO 최적화 상태가 매우 우수합니다!"],
  };
}
