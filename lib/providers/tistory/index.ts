export interface TistoryPostPayload {
  title: string;
  content: string;
  visibility?: 0 | 1 | 3; // 0: 비공개(초안), 1: 보호, 3: 공개(발행)
  category?: number;
  tag?: string[];
  slogan?: string;
}

export interface TistoryPostResponse {
  id: string | number;
  url: string;
  status: string;
}

export interface TistoryProvider {
  name: string;
  isConnected(): boolean;
  createPost(payload: TistoryPostPayload): Promise<TistoryPostResponse>;
}

export class TistoryAdapter implements TistoryProvider {
  name = "Tistory Open API";
  private blogName = process.env.TISTORY_BLOG_NAME;
  private accessToken = process.env.TISTORY_ACCESS_TOKEN;

  isConnected(): boolean {
    return Boolean(this.blogName && this.accessToken);
  }

  async createPost(payload: TistoryPostPayload): Promise<TistoryPostResponse> {
    if (!this.isConnected()) {
      console.log("[Mock Tistory] Creating post:", payload.title);
      const fakeId = Math.floor(Math.random() * 1000) + 1;
      return {
        id: fakeId,
        url: `https://${this.blogName || "my-blog"}.tistory.com/${fakeId}`,
        status: payload.visibility === 3 ? "공개 발행 (Public)" : "비공개 초안 (Draft)",
      };
    }

    const params = new URLSearchParams();
    params.append("access_token", this.accessToken!);
    params.append("output", "json");
    params.append("blogName", this.blogName!);
    params.append("title", payload.title);
    params.append("content", payload.content);
    params.append("visibility", String(payload.visibility ?? 3));

    if (payload.tag && payload.tag.length > 0) {
      params.append("tag", payload.tag.join(", "));
    }
    if (payload.slogan) {
      params.append("slogan", payload.slogan);
    }
    if (payload.category) {
      params.append("category", String(payload.category));
    }

    const res = await fetch("https://www.tistory.com/apis/post/write", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Tistory API Error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    if (data.tistory?.status !== "200") {
      throw new Error(data.tistory?.error_message || "Tistory post write failed");
    }

    return {
      id: data.tistory.postId,
      url: data.tistory.url,
      status: "PUBLISHED",
    };
  }
}

export const tistoryProvider = new TistoryAdapter();
