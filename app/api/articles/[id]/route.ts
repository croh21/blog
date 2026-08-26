import { NextResponse } from "next/server";
import {
  getArticleById,
  saveArticle,
  getClaims,
  getSources,
  getInternalLinks,
} from "@/lib/db";
import { evaluateArticleSEO } from "@/lib/scoring/seo-scorer";
import { evaluateQualityGate } from "@/lib/scoring/quality-gate";
import { calculateFactCheckScore } from "@/lib/scoring/reliability-scorer";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const claims = await getClaims(id);
  const sources = await getSources(id);
  const internalLinks = await getInternalLinks(id);

  // Recalculate SEO and Fact Check scores
  const seoBreakdown = evaluateArticleSEO(article, sources.length, internalLinks.length);
  const factCheckScore = calculateFactCheckScore(claims);
  article.seo_score = seoBreakdown.overallScore;
  article.fact_check_score = factCheckScore;

  const qualityGate = evaluateQualityGate(article, claims, sources);

  return NextResponse.json({
    article,
    claims,
    sources,
    internalLinks,
    seoBreakdown,
    qualityGate,
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await getArticleById(id);
    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const body = await req.json();
    const updated = {
      ...existing,
      ...body,
      word_count: body.content !== undefined
        ? body.content.split(/\s+/).filter(Boolean).length
        : existing.word_count,
      updated_at: new Date().toISOString(),
    };

    const sources = await getSources(id);
    const internalLinks = await getInternalLinks(id);
    const claims = await getClaims(id);

    const seoBreakdown = evaluateArticleSEO(updated, sources.length, internalLinks.length);
    updated.seo_score = seoBreakdown.overallScore;
    updated.fact_check_score = calculateFactCheckScore(claims);

    const qualityGate = evaluateQualityGate(updated, claims, sources);

    // If client attempts to approve or publish via PUT, enforce quality gate
    if (body.status === "APPROVED" || body.status === "PUBLISHED") {
      if (!qualityGate.passed) {
        return NextResponse.json(
          {
            success: false,
            error: "품질 게이트 미달: 필수 조건을 충족해야 승인 또는 발행이 가능합니다.",
            missingReasons: qualityGate.missingReasons,
            checklist: qualityGate.checklist,
          },
          { status: 422 }
        );
      }
    }

    await saveArticle(updated);

    return NextResponse.json({
      success: true,
      article: updated,
      seoBreakdown,
      qualityGate,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
