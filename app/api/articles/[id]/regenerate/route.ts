import { NextResponse } from "next/server";
import { getArticleById, getTopicById, saveArticle, getSources, getInternalLinks } from "@/lib/db";
import { defaultAIProvider } from "@/lib/providers/ai";
import { PROMPTS } from "@/lib/ai/prompts";
import { evaluateArticleSEO } from "@/lib/scoring/seo-scorer";

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

    const body = await req.json();
    const mode = body.mode || "FULL"; // "FULL" | "SEO" | "EXPAND"

    if (mode === "SEO") {
      // Regenerate SEO title & Meta description & outline enhancements
      const res = await defaultAIProvider.generateJSON<{
        seoTitle: string;
        metaDescription: string;
        primaryKeyword: string;
        secondaryKeywords: string[];
      }>(
        `제목: ${article.title}\n핵심키워드: ${article.primary_keyword}\n본문 발췌:\n${article.content.slice(0, 2000)}`,
        PROMPTS.SEO_OPTIMIZATION_SYSTEM
      );

      article.seo_title = res.data.seoTitle || article.seo_title;
      article.meta_description = res.data.metaDescription || article.meta_description;
      if (res.data.primaryKeyword) article.primary_keyword = res.data.primaryKeyword;
      if (res.data.secondaryKeywords) article.secondary_keywords = res.data.secondaryKeywords;
    } else {
      // Full AI Content Regeneration
      const topic = article.topic_id ? await getTopicById(article.topic_id) : undefined;
      const res = await defaultAIProvider.generateText(
        `제목: ${article.title}\n핵심 키워드: ${article.primary_keyword}\n선정 배경: ${article.excerpt}\n목차 구조: ${JSON.stringify(article.outline || [])}`,
        PROMPTS.ARTICLE_WRITING_SYSTEM
      );

      if (res.text && res.text.length > 300) {
        article.content = res.text;
      }
    }

    article.word_count = article.content.split(/\s+/).filter(Boolean).length;
    article.updated_at = new Date().toISOString();

    const sources = await getSources(id);
    const internalLinks = await getInternalLinks(id);
    const seoBreakdown = evaluateArticleSEO(article, sources.length, internalLinks.length);
    article.seo_score = seoBreakdown.overallScore;

    await saveArticle(article);

    return NextResponse.json({
      success: true,
      article,
      seoBreakdown,
      message: mode === "SEO" ? "SEO 메타데이터가 성공적으로 재생성되었습니다." : "AI 본문이 성공적으로 재생성되었습니다.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
