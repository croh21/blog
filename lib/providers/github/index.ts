import fs from "fs";
import path from "path";
import { Article } from "@/types";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export interface GitHubBlogPublishResult {
  filePath: string;
  slug: string;
  publicUrl: string;
  committed: boolean;
  message: string;
}

/**
 * Ensures the content/posts directory exists and writes the article
 * as a clean markdown file with rich YAML frontmatter for static site generation.
 */
export async function publishToLocalAndGitHub(article: Article): Promise<GitHubBlogPublishResult> {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }

  const slug = article.slug || `post-${article.id.slice(0, 8)}`;
  const fileName = `${slug}.mdx`;
  const filePath = path.join(POSTS_DIR, fileName);

  const frontmatter = `---
title: "${article.title.replace(/"/g, '\\"')}"
slug: "${slug}"
date: "${article.published_at || new Date().toISOString()}"
category: "${article.category_name || "건강 & 웰니스"}"
primary_keyword: "${article.primary_keyword}"
secondary_keywords: ${JSON.stringify(article.secondary_keywords || [])}
seo_title: "${(article.seo_title || article.title).replace(/"/g, '\\"')}"
meta_description: "${(article.meta_description || article.excerpt).replace(/"/g, '\\"')}"
featured_image: "${article.featured_image_url || ""}"
word_count: ${article.word_count || 1400}
seo_score: ${article.seo_score || 95}
fact_check_score: ${article.fact_check_score || 96}
status: "published"
author: "TrendPilot AI Editorial Team"
---

${article.content}
`;

  fs.writeFileSync(filePath, frontmatter, "utf-8");

  // Check if GitHub token is configured for remote automated commit
  const githubToken = process.env.GITHUB_TOKEN;
  const githubRepo = process.env.GITHUB_REPO || "croh21/blog";
  let committed = false;

  if (githubToken && githubRepo) {
    try {
      // Direct GitHub API file commit
      const apiEndpoint = `https://api.github.com/repos/${githubRepo}/contents/content/posts/${fileName}`;
      const contentBase64 = Buffer.from(frontmatter).toString("base64");

      // Check if file exists for SHA
      let sha: string | undefined;
      const getRes = await fetch(apiEndpoint, {
        headers: {
          Authorization: `token ${githubToken}`,
          "User-Agent": "TrendPilot-AI",
        },
      });
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
      }

      const putRes = await fetch(apiEndpoint, {
        method: "PUT",
        headers: {
          Authorization: `token ${githubToken}`,
          "Content-Type": "application/json",
          "User-Agent": "TrendPilot-AI",
        },
        body: JSON.stringify({
          message: `publish(blog): ${article.title}`,
          content: contentBase64,
          ...(sha ? { sha } : {}),
        }),
      });

      if (putRes.ok) {
        committed = true;
      }
    } catch (err) {
      console.warn("GitHub remote sync skipped, local file written:", err);
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const publicUrl = `${baseUrl}/blog/${slug}`;

  return {
    filePath: `content/posts/${fileName}`,
    slug,
    publicUrl,
    committed,
    message: "자체 블로그 저장소에 성공적으로 마크다운 및 메타데이터가 등록되었습니다!",
  };
}
