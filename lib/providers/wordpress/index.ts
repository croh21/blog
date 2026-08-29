export interface WordPressPostPayload {
  title: string;
  content: string;
  excerpt?: string;
  status: "draft" | "publish" | "future";
  slug?: string;
  categories?: number[];
  tags?: number[];
  date?: string;
}

export interface WordPressPostResponse {
  id: number;
  link: string;
  status: string;
}

export interface WordPressProvider {
  name: string;
  isConnected(): boolean;
  createPost(payload: WordPressPostPayload): Promise<WordPressPostResponse>;
  updatePost(id: number, payload: Partial<WordPressPostPayload>): Promise<WordPressPostResponse>;
  publishPost(id: number): Promise<WordPressPostResponse>;
  schedulePost(id: number, scheduledAt: string): Promise<WordPressPostResponse>;
  uploadImage(file: Blob, filename: string): Promise<{ id: number; source_url: string }>;
}

export class WordPressAdapter implements WordPressProvider {
  name = "WordPress REST API";
  private siteId = process.env.WP_SITE_ID || process.env.WORDPRESS_SITE_ID;
  private token = process.env.WP_ACCESS_TOKEN || process.env.WORDPRESS_ACCESS_TOKEN;
  private url = process.env.WP_URL || process.env.WORDPRESS_URL;
  private username = process.env.WP_USERNAME || process.env.WORDPRESS_USERNAME;
  private appPassword = process.env.WP_APP_PASSWORD || process.env.WORDPRESS_APP_PASSWORD;

  isConnected(): boolean {
    return Boolean((this.siteId && this.token) || (this.url && this.username && this.appPassword));
  }

  async createPost(payload: WordPressPostPayload): Promise<WordPressPostResponse> {
    // 1. WordPress.com OAuth Bearer Token 방식 (현재 계정)
    if (this.siteId && this.token) {
      const res = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${this.siteId}/posts/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          title: payload.title,
          content: payload.content,
          excerpt: payload.excerpt || "",
          status: payload.status,
          slug: payload.slug,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(`WordPress.com API Error: ${data.message || data.error || res.statusText}`);
      }

      return {
        id: data.ID,
        link: data.URL || data.short_URL,
        status: data.status,
      };
    }

    // 2. 자체 호스팅 WordPress Application Passwords 방식
    if (this.url && this.username && this.appPassword) {
      const authHeader = Buffer.from(`${this.username}:${this.appPassword}`).toString("base64");
      const res = await fetch(`${this.url.replace(/\/$/, "")}/wp-json/wp/v2/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`WordPress API Error: ${res.statusText}`);
      }

      const data = await res.json();
      return {
        id: data.id,
        link: data.link,
        status: data.status,
      };
    }

    // 미연동 시 mock
    console.log("[Mock WordPress] Creating post:", payload.title);
    return {
      id: Math.floor(Math.random() * 10000) + 100,
      link: `https://hanabird2.wordpress.com/${payload.slug || "post"}`,
      status: payload.status,
    };
  }

  async updatePost(id: number, payload: Partial<WordPressPostPayload>): Promise<WordPressPostResponse> {
    return this.createPost({ title: "Updated", content: "", status: "draft", ...payload });
  }

  async publishPost(id: number): Promise<WordPressPostResponse> {
    return { id, link: `https://hanabird2.wordpress.com/p/${id}`, status: "publish" };
  }

  async schedulePost(id: number, scheduledAt: string): Promise<WordPressPostResponse> {
    return { id, link: `https://hanabird2.wordpress.com/p/${id}`, status: "future" };
  }

  async uploadImage(file: Blob, filename: string): Promise<{ id: number; source_url: string }> {
    return { id: 101, source_url: `https://hanabird2.wordpress.com/wp-content/uploads/sample.jpg` };
  }
}

export const wpProvider = new WordPressAdapter();

