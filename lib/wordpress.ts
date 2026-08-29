import { Article } from "@/types";

export interface WordPressPublishResult {
  success: boolean;
  wpPostId?: number;
  wpPostUrl?: string;
  error?: string;
}

// 마크다운을 워드프레스 호환 HTML로 변환
export function markdownToHtml(md: string): string {
  if (!md) return "";

  let html = md
    .replace(/^#### (.*$)/gim, "<h4>$1</h4>")
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/gim, "<em>$1</em>")
    .replace(/!\[([^\]]*)\]\(([^\)]+)\)/gim, '<figure class="wp-block-image"><img src="$2" alt="$1" /><figcaption>$1</figcaption></figure>')
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^> (.*$)/gim, "<blockquote><p>$1</p></blockquote>")
    .replace(/^\s*[-*+] (.*$)/gim, "<li>$1</li>")
    .replace(/^\s*\d+\.\s+(.*$)/gim, "<li>$1</li>")
    .replace(/^---$/gim, "<hr />")
    .split(/\n\n+/)
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return "";
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<figure") ||
        trimmed.startsWith("<blockquote") ||
        trimmed.startsWith("<hr") ||
        trimmed.startsWith("<li>")
      ) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n\n");

  return html;
}

export async function publishArticleToWordPress(article: {
  title: string;
  content: string;
  excerpt?: string;
  slug?: string;
  tags?: string[];
  categories?: string[];
  featuredImageUrl?: string;
  status?: "publish" | "draft";
}): Promise<WordPressPublishResult> {
  const siteId = process.env.WP_SITE_ID;
  const token = process.env.WP_ACCESS_TOKEN;
  const defaultStatus = (process.env.WP_POST_STATUS as "publish" | "draft") || "publish";

  if (!siteId || !token) {
    console.warn("[WordPress] WP_SITE_ID 또는 WP_ACCESS_TOKEN 설정이 없습니다.");
    return {
      success: false,
      error: "WordPress 환경 설정(WP_SITE_ID, WP_ACCESS_TOKEN)이 누락되었습니다.",
    };
  }

  try {
    let postContent = markdownToHtml(article.content);

    if (article.featuredImageUrl && !postContent.includes(article.featuredImageUrl)) {
      postContent = `<figure class="wp-block-image size-large"><img src="${article.featuredImageUrl}" alt="${article.title}" /></figure>\n\n${postContent}`;
    }

    const payload: any = {
      title: article.title,
      content: postContent,
      excerpt: article.excerpt || "",
      status: article.status || defaultStatus,
    };

    if (article.tags && article.tags.length > 0) {
      payload.tags = article.tags.join(",");
    }

    if (article.categories && article.categories.length > 0) {
      payload.categories = article.categories.join(",");
    }

    const res = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${siteId}/posts/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      const errMsg = data.message || data.error || `HTTP error ${res.status}`;
      console.error("[WordPress API Error]", errMsg);
      return { success: false, error: errMsg };
    }

    return {
      success: true,
      wpPostId: data.ID,
      wpPostUrl: data.URL || data.short_URL,
    };
  } catch (error: any) {
    console.error("[WordPress Publish Exception]", error);
    return {
      success: false,
      error: error.message || "워드프레스 통신 중 오류가 발생했습니다.",
    };
  }
}
