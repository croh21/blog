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
  const charCount = content.length;

  const recommendations: string[] = [];

  // 1. Title Score (25~60 chars optimal, contains primary keyword)
  let titleScore = 50;
  if (title.length >= 20 && title.length <= 70) titleScore += 25;
  if (primaryKeyword && title.toLowerCase().includes(primaryKeyword)) titleScore += 25;
  if (titleScore < 80) recommendations.push("제목에 핵심 키워드를 포함하고 25~60자 내외로 조율하세요.");

  // 2. Meta Description Score (70~160 chars optimal, contains keyword)
  let metaDescriptionScore = 40;
  if (metaDescription.length >= 60 && metaDescription.length <= 170) metaDescriptionScore += 30;
  if (primaryKeyword && metaDescription.toLowerCase().includes(primaryKeyword)) metaDescriptionScore += 30;
  if (metaDescriptionScore < 80) recommendations.push("메타 설명문을 70~160자로 작성하고 핵심 키워드를 자연스럽게 배치하세요.");

  // 3. Heading Structure Score (Checks H1, H2, H3)
  let headingStructureScore = 40;
  const h1Count = (content.match(/^#\s+/gm) || []).length;
  const h2Count = (content.match(/^##\s+/gm) || []).length;
  const h3Count = (content.match(/^###\s+/gm) || []).length;
  if (h1Count >= 1 || title.length > 0) headingStructureScore += 20;
  if (h2Count >= 3) headingStructureScore += 25;
  if (h3Count >= 2) headingStructureScore += 15;
  if (h2Count < 3) recommendations.push("소제목(H2)을 최소 3개 이상 구성하여 글의 논리적 구조를 강화하세요.");

  // 4. Keyword Relevance & Density (0.8% ~ 3.0% density)
  let keywordRelevanceScore = 50;
  if (primaryKeyword && wordCount > 50) {
    const regex = new RegExp(primaryKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const matches = (content.match(regex) || []).length;
    const density = (matches / (wordCount || 1)) * 100;
    if (density >= 0.7 && density <= 3.2) {
      keywordRelevanceScore = 95;
    } else if (density > 0 && density < 0.7) {
      keywordRelevanceScore = 75;
      recommendations.push(`핵심 키워드("${primaryKeyword}") 출현 빈도가 다소 낮습니다. 주요 본문에 2~3회 추가 배치하세요.`);
    } else if (density > 3.2) {
      keywordRelevanceScore = 65;
      recommendations.push("키워드 밀도가 너무 높습니다(과도한 반복 지양).");
    }
  } else if (!primaryKeyword) {
    recommendations.push("주요 타깃 키워드(Primary Keyword)를 설정하세요.");
  }

  // 5. Content Completeness (Length & Section depth)
  let contentCompletenessScore = 40;
  if (wordCount >= 1200 || charCount >= 3000) contentCompletenessScore = 98;
  else if (wordCount >= 800 || charCount >= 2000) contentCompletenessScore = 88;
  else if (wordCount >= 600 || charCount >= 1500) contentCompletenessScore = 75;
  else recommendations.push("콘텐츠 분량이 600단어 미만입니다. 심층 비교 분석 및 구체적 사례를 보강하세요.");

  // 6. Search Intent Score
  let searchIntentScore = 70;
  const lowerContent = content.toLowerCase();
  const intentTerms = ["정의", "방법", "비교", "장단점", "전망", "핵심", "faq", "가이드", "결론", "추천", "사례", "원리"];
  const intentMatchCount = intentTerms.filter((term) => lowerContent.includes(term)).length;
  if (intentMatchCount >= 5) searchIntentScore = 98;
  else if (intentMatchCount >= 3) searchIntentScore = 85;

  // 7. Internal Links Score
  let internalLinksScore = 40;
  if (internalLinkCount >= 2) internalLinksScore = 95;
  else if (internalLinkCount === 1) internalLinksScore = 80;
  else recommendations.push("기존 관련 글과의 내부 링크(Internal Link)를 1개 이상 연결하세요.");

  // 8. External Sources Score
  let externalSourcesScore = 40;
  if (sourceCount >= 2) externalSourcesScore = 95;
  else if (sourceCount === 1) externalSourcesScore = 80;
  else recommendations.push("신뢰할 수 있는 외부 출처(Tier 1~2)를 최소 2개 이상 연결하세요.");

  // 9. Readability Score (Paragraph length, bullet points, tables, quotes)
  let readabilityScore = 60;
  const bulletCount = (content.match(/^[-*]\s+/gm) || []).length;
  const tableCount = (content.match(/\|.+\|/g) || []).length;
  const quoteCount = (content.match(/^>\s+/gm) || []).length;
  if (bulletCount >= 3) readabilityScore += 15;
  if (tableCount >= 2) readabilityScore += 15;
  if (quoteCount >= 1) readabilityScore += 10;
  readabilityScore = Math.min(100, readabilityScore);

  // 10. Original Analysis Score (Insights, Takeaways, Future outlook)
  let originalAnalysisScore = 70;
  if (lowerContent.includes("key takeaways") || lowerContent.includes("핵심 요약")) originalAnalysisScore += 15;
  if (lowerContent.includes("시사점") || lowerContent.includes("faq") || lowerContent.includes("질문")) originalAnalysisScore += 15;
  originalAnalysisScore = Math.min(100, originalAnalysisScore);

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
    recommendations: recommendations.length > 0 ? recommendations : ["모든 주요 SEO 및 가독성 기준을 완벽히 충족합니다!"],
  };
}
