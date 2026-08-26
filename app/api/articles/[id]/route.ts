import { NextResponse } from "next/server";
import {
  getArticleById,
  saveArticle,
  getClaims,
  getSources,
  getInternalLinks,
} from "@/lib/db";
import { evaluateArticleSEO } from "@/lib/scoring/seo-scorer";

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
  const seoBreakdown = evaluateArticleSEO(article, sources.length, internalLinks.length);

  return NextResponse.json({
    article,
    claims,
    sources,
    internalLinks,
    seoBreakdown,
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
      word_count: body.content
        ? body.content.split(/\s+/).filter(Boolean).length
        : existing.word_count,
      updated_at: new Date().toISOString(),
    };

    // Re-evaluate SEO and fact check scores
    const sources = await getSources(id);
    const internalLinks = await getInternalLinks(id);
    const seoBreakdown = evaluateArticleSEO(updated, sources.length, internalLinks.length);
    updated.seo_score = seoBreakdown.overallScore;

    await saveArticle(updated);

    return NextResponse.json({ success: true, article: updated, seoBreakdown });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
