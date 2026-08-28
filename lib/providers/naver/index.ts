export interface NaverBlogPostPayload {
  title: string;
  content: string;
  tags?: string[];
  category?: string;
  slug?: string;
}

export interface NaverBlogPostResponse {
  id: string | number;
  url: string;
  naverWriteUrl: string;
  status: string;
  formattedHtml: string;
}

export interface NaverBlogProvider {
  name: string;
  isConnected(): boolean;
  createPost(payload: NaverBlogPostPayload): Promise<NaverBlogPostResponse>;
}

/**
 * 마크다운을 네이버 블로그 스마트에디터 ONE에 최적화된 리치 서식 HTML로 변환합니다.
 * 사용자가 클립보드 복사 후 네이버 에디터에 Ctrl+V 시 완벽한 서식이 적용됩니다.
 */
export function markdownToNaverHTML(markdown: string): string {
  let html = markdown;

  // 1. 이미지: ![alt](url) -> 네이버 블로그 중앙 정렬 이미지 + 캡션 스타일
  html = html.replace(
    /!\[(.*?)\]\((.*?)\)/g,
    '<div align="center" style="text-align:center; margin: 28px 0;">' +
      '<img src="$2" alt="$1" style="max-width:100%; border-radius:8px; box-shadow: 0 4px 14px rgba(0,0,0,0.08); display:inline-block;" />' +
      '<p style="font-size:13px; color:#8e8e8e; margin-top:8px; line-height:1.4;">$1</p>' +
    '</div>'
  );

  // 2. 캡션 기호: *▲ text* -> 중앙 회색 캡션
  html = html.replace(
    /\*▲ (.*?)\*/g,
    '<p align="center" style="text-align:center; font-size:12px; color:#999; margin-top:-14px; margin-bottom:20px;">▲ $1</p>'
  );

  // 3. 소제목 헤딩 (네이버 블로그 스마트에디터 최적화 디자인)
  html = html.replace(
    /^# (.*$)/gim,
    '<h1 style="font-size:24px; font-weight:800; color:#111111; margin:36px 0 16px 0; line-height:1.4; letter-spacing:-0.5px;">$1</h1>'
  );
  html = html.replace(
    /^## (.*$)/gim,
    '<h2 style="font-size:20px; font-weight:700; color:#03c75a; border-left:4px solid #03c75a; padding-left:12px; margin:32px 0 14px 0; line-height:1.4; letter-spacing:-0.3px;">$1</h2>'
  );
  html = html.replace(
    /^### (.*$)/gim,
    '<h3 style="font-size:17px; font-weight:700; color:#1f2937; margin:24px 0 10px 0;">✔ $1</h3>'
  );

  // 4. 볼드 & 형광펜 강조 (스마트에디터 ONE에서 가장 시각적 효과가 뛰어난 네이버 그린 형광펜)
  html = html.replace(
    /\*\*(.*?)\*\*/g,
    '<span style="background-color: #dcfce7; font-weight: bold; color: #111827; padding: 2px 5px; border-radius: 3px;">$1</span>'
  );
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 5. 인용구 / 팁 박스 (네이버 스마트에디터 인용구 카드 스타일)
  html = html.replace(
    /^> (.*$)/gim,
    '<div style="border-left: 4px solid #03c75a; background-color: #f4faf6; padding: 14px 18px; margin: 20px 0; border-radius: 0 8px 8px 0; color: #166534; font-size:14.5px; line-height:1.7;">$1</div>'
  );

  // 6. 하이퍼링크
  html = html.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#03c75a; font-weight:bold; text-decoration:underline;">$1</a>'
  );

  // 7. 리스트 아이템
  html = html.replace(
    /^- (.*$)/gim,
    '<p style="margin: 6px 0; padding-left: 16px; text-indent: -16px; font-size: 15px; color: #333333; line-height: 1.8;">• $1</p>'
  );
  html = html.replace(
    /^\d+\. (.*$)/gim,
    '<p style="margin: 6px 0; padding-left: 16px; text-indent: -16px; font-size: 15px; color: #333333; line-height: 1.8;">$1</p>'
  );

  // 8. 문단 및 줄바꿈 처리
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return "";
      // 이미 블록 태그(<div, <h1, <h2, <h3, <p, <blockquote)로 시작하면 그대로
      if (/^<(div|h1|h2|h3|p|blockquote)/i.test(trimmed)) {
        return trimmed;
      }
      return `<p style="font-size: 15.5px; line-height: 1.85; color: #2d3748; margin: 0 0 16px 0; word-break: keep-all;">${trimmed.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");

  return (
    '<div style="font-family: -apple-system, BlinkMacSystemFont, \'NanumSquare\', \'Apple SD Gothic Neo\', \'Malgun Gothic\', sans-serif; font-size: 15.5px; line-height: 1.85; color: #2d3748; max-width: 720px; margin: 0 auto; word-break: keep-all;">' +
    html +
    '</div>'
  );
}

export class NaverBlogAdapter implements NaverBlogProvider {
  name = "Naver Blog";
  private naverId = process.env.NEXT_PUBLIC_NAVER_BLOG_ID || process.env.NAVER_BLOG_ID || "myblog";

  isConnected(): boolean {
    return Boolean(this.naverId && this.naverId !== "myblog");
  }

  async createPost(payload: NaverBlogPostPayload): Promise<NaverBlogPostResponse> {
    const formattedHtml = markdownToNaverHTML(payload.content);
    const postSlug = payload.slug || Math.random().toString(36).substring(2, 9);
    const naverWriteUrl = `https://blog.naver.com/${this.naverId}/postwrite`;
    const previewBlogUrl = `https://blog.naver.com/${this.naverId}`;

    return {
      id: postSlug,
      url: previewBlogUrl,
      naverWriteUrl,
      status: "READY_FOR_SMART_EDITOR",
      formattedHtml,
    };
  }
}

export const naverBlogProvider = new NaverBlogAdapter();
