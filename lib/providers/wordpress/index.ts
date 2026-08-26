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
  private url = process.env.WORDPRESS_URL;
  private username = process.env.WORDPRESS_USERNAME;
  private appPassword = process.env.WORDPRESS_APP_PASSWORD;

  isConnected(): boolean {
    return Boolean(this.url && this.username && this.appPassword);
  }

  async createPost(payload: WordPressPostPayload): Promise<WordPressPostResponse> {
    if (!this.isConnected()) {
      console.log("[Mock WordPress] Creating post:", payload.title);
      return {
        id: Math.floor(Math.random() * 10000) + 100,
        link: `${this.url || "https://example-blog.com"}/${payload.slug || "post"}`,
        status: payload.status,
      };
    }

    const authHeader = Buffer.from(`${this.username}:${this.appPassword}`).toString("base64");
    const res = await fetch(`${this.url}/wp-json/wp/v2/posts`, {
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

  async updatePost(id: number, payload: Partial<WordPressPostPayload>): Promise<WordPressPostResponse> {
    return this.createPost({ title: "Updated", content: "", status: "draft", ...payload });
  }

  async publishPost(id: number): Promise<WordPressPostResponse> {
    return { id, link: `https://example-blog.com/p/${id}`, status: "publish" };
  }

  async schedulePost(id: number, scheduledAt: string): Promise<WordPressPostResponse> {
    return { id, link: `https://example-blog.com/p/${id}`, status: "future" };
  }

  async uploadImage(file: Blob, filename: string): Promise<{ id: number; source_url: string }> {
    return { id: 101, source_url: `https://example-blog.com/wp-content/uploads/sample.jpg` };
  }
}

export const wpProvider = new WordPressAdapter();
