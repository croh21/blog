import { NextResponse } from "next/server";
import { getArticleById, saveArticle } from "@/lib/db";
import { publishArticleToWordPress } from "@/lib/wordpress";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = await getArticleById(id);

    if (!article) {
      return NextResponse.json(
        { success: false, error: "기사를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const result = await publishArticleToWordPress({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || article.meta_description,
      slug: article.slug,
      tags: article.secondary_keywords || [article.primary_keyword].filter(Boolean),
      categories: ["블로그", "건강/라이프"],
      featuredImageUrl: article.featured_image_url,
      status: "publish",
    });

    if (result.success) {
      article.status = "PUBLISHED";
      article.published_at = new Date().toISOString();
      await saveArticle(article);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("WordPress publish route error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
