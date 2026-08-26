import { NextResponse } from "next/server";
import { getArticleById, getClaims, getSources, getInternalLinks, saveArticle } from "@/lib/db";
import { evaluateQualityGate } from "@/lib/scoring/quality-gate";
import { evaluateArticleSEO } from "@/lib/scoring/seo-scorer";
import { calculateFactCheckScore } from "@/lib/scoring/reliability-scorer";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = await getArticleById(id);
    if (!article) {
      return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 });
    }

    const claims = await getClaims(id);
    const sources = await getSources(id);
    const internalLinks = await getInternalLinks(id);

    // Re-evaluate SEO and Fact check
    const seoBreakdown = evaluateArticleSEO(article, sources.length, internalLinks.length);
    const factCheckScore = calculateFactCheckScore(claims);
    article.seo_score = seoBreakdown.overallScore;
    article.fact_check_score = factCheckScore;

    // Strict Quality Gate Validation
    const qualityGate = evaluateQualityGate(article, claims, sources);
    if (!qualityGate.passed) {
      return NextResponse.json(
        {
          success: false,
          error: "품질 게이트 기준을 충족하지 못했습니다.",
          missingReasons: qualityGate.missingReasons,
          checklist: qualityGate.checklist,
        },
        { status: 422 }
      );
    }

    // Mark as APPROVED
    article.status = "APPROVED";
    article.updated_at = new Date().toISOString();
    await saveArticle(article);

    return NextResponse.json({
      success: true,
      message: "품질 게이트를 모두 통과하여 성공적으로 승인(APPROVED)되었습니다.",
      article,
      qualityGate,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
