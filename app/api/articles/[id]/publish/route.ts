import { NextResponse } from "next/server";
import { getArticleById, getClaims, getSources, saveArticle } from "@/lib/db";
import { evaluateQualityGate } from "@/lib/scoring/quality-gate";
import { tistoryProvider } from "@/lib/providers/tistory";
import { wpProvider } from "@/lib/providers/wordpress";

function markdownToHTML(markdown: string): string {
  let html = markdown;

  // Images: ![alt](url) -> <img src="url" alt="alt" style="..." />
  html = html.replace(
    /!\[(.*?)\]\((.*?)\)/g,
    '<div style="text-align:center; margin: 24px 0;"><img src="$2" alt="$1" style="max-width:100%; border-radius:12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);" /></div>'
  );

  // Captions: *▲ text* -> <p style="...">▲ text</p>
  html = html.replace(
    /\*▲ (.*?)\*/g,
    '<p style="text-align:center; font-size:13px; color:#888; margin-top:-16px; margin-bottom:24px;">▲ $1</p>'
  );

  // Headings
  html = html.replace(/^# (.*$)/gim, '<h1 style="font-size:26px; font-weight:bold; margin:30px 0 15px 0;">$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="font-size:22px; font-weight:bold; border-bottom:2px solid #3b82f6; padding-bottom:8px; margin:35px 0 15px 0;">$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3 style="font-size:18px; font-weight:bold; color:#2563eb; margin:25px 0 10px 0;">$1</h3>');

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Blockquotes
  html = html.replace(
    /^> (.*$)/gim,
    '<blockquote style="border-left: 4px solid #3b82f6; background-color: #f0f7ff; padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0; color: #1e3a8a;">$1</blockquote>'
  );

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color:#2563eb; text-decoration:underline;">$1</a>');

  // Paragraph line breaks
  html = html.replace(/\n\n/g, "<br/><br/>");

  return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.8; color: #333;">${html}</div>`;
}

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

    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const platform = body?.platform || "TISTORY"; // "TISTORY" | "WORDPRESS"
    const visibility = body?.visibility ?? 3; // 3: 공개, 0: 비공개(초안)

    // Quality gate validation
    const claims = await getClaims(id);
    const sources = await getSources(id);
    const qualityGate = evaluateQualityGate(article, claims, sources);

    if (!qualityGate.passed) {
      return NextResponse.json(
        {
          success: false,
          error: "품질 게이트 기준 미달: 필수 조건을 충족해야 발행할 수 있습니다.",
          missingReasons: qualityGate.missingReasons,
          checklist: qualityGate.checklist,
        },
        { status: 422 }
      );
    }

    const htmlContent = markdownToHTML(article.content);
    let publishResult: any;

    if (platform === "TISTORY") {
      publishResult = await tistoryProvider.createPost({
        title: article.title,
        content: htmlContent,
        visibility: visibility,
        tag: [article.primary_keyword, ...(article.secondary_keywords || [])],
        slogan: article.slug,
      });
    } else {
      publishResult = await wpProvider.createPost({
        title: article.title,
        content: htmlContent,
        excerpt: article.excerpt || article.meta_description,
        status: visibility === 3 ? "publish" : "draft",
        slug: article.slug,
      });
    }

    // Update article status to PUBLISHED in persistent DB
    article.status = "PUBLISHED";
    article.published_at = new Date().toISOString();
    article.updated_at = new Date().toISOString();
    await saveArticle(article);

    return NextResponse.json({
      success: true,
      platform,
      publishResult,
      article,
      message: `${platform === "TISTORY" ? "티스토리(Tistory)" : "워드프레스(WordPress)"}에 성공적으로 발행되었습니다!`,
    });
  } catch (error: any) {
    console.error("Publish error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
