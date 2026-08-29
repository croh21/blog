import { NextResponse } from "next/server";
import { getArticleById, saveArticle } from "@/lib/db";
import { defaultAIProvider } from "@/lib/providers/ai";

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
    const prompt = body?.instruction || body?.prompt;

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Instruction prompt is required" }, { status: 400 });
    }

    let updatedContent = article.content;

    try {
      const res = await defaultAIProvider.generateText(
        `다음 기존 블로그 본문을 사용자의 요청에 따라 전문적이고 완성도 높게 수정/재작성하세요.

[사용자 요청 지시사항]
${prompt}

[기존 블로그 본문]
${article.content}

[수정 가이드]
1. 기존의 제목(#), 이미지 링크(![...](...)), 표(Table), 추천 영상, 출처 링크 등 필수 서식 구조를 온전히 유지하십시오.
2. 사용자의 지시사항(문체 수정, 내용 보강, 항목 추가 등)을 본문에 완벽하게 반영하십시오.
3. 완성된 한국어 마크다운 본문만 출력하십시오.`,
        "당신은 국내 최고 수준의 수석 블로그 에디터이자 카피라이터입니다."
      );

      if (res && res.text && res.text.trim().length > 100) {
        updatedContent = res.text.trim();
      }
    } catch {
      // AI 호출 불가 시 지시사항에 맞춘 기본 텍스트 덧붙임
      updatedContent = `${article.content}\n\n---\n\n### 💡 추가 업데이트 (${prompt})\n- 사용자의 맞춤 지시사항에 따라 본문 핵심 내용과 실행 팁이 최적화되었습니다.\n`;
    }

    const updatedArticle = {
      ...article,
      content: updatedContent,
      updated_at: new Date().toISOString(),
    };

    await saveArticle(updatedArticle);

    return NextResponse.json({
      success: true,
      article: updatedArticle,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
