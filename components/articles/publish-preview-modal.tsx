"use client";

import { useState } from "react";
import {
  Send,
  X,
  Globe,
  CheckCircle2,
  Copy,
  ExternalLink,
  Github,
  Check,
  FileText,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Article } from "@/types";

interface PublishPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (platform: "GITHUB_BLOG" | "NAVER_BLOG" | "WORDPRESS" | "TISTORY", visibility: 0 | 3) => void;
  article: Article;
  loading: boolean;
  publishedUrl?: string | null;
}

export function PublishPreviewModal({
  isOpen,
  onClose,
  onConfirm,
  article,
  loading,
  publishedUrl,
}: PublishPreviewModalProps) {
  const [platform, setPlatform] = useState<"GITHUB_BLOG" | "NAVER_BLOG" | "WORDPRESS">("NAVER_BLOG");
  const [visibility, setVisibility] = useState<0 | 3>(3); // 3: 공개, 0: 비공개
  const [copied, setCopied] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedTags, setCopiedTags] = useState(false);

  if (!isOpen) return null;

  const wordCount = article.word_count || article.content.split(/\s+/).filter(Boolean).length;
  const charCount = article.content.length;
  const tagsString = [article.primary_keyword, ...(article.secondary_keywords || [])]
    .filter(Boolean)
    .map((t) => `#${t}`)
    .join(" ");

  const naverId = process.env.NEXT_PUBLIC_NAVER_BLOG_ID || "myblog";
  const naverPostWriteUrl = `https://blog.naver.com/${naverId}/postwrite`;

  function convertMarkdownToHtml(md: string): string {
    let html = md
      // Image markdown: ![alt](url) -> <p><img src="url" alt="alt" style="max-width:100%; border-radius:8px;" /></p>
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<p><img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" /></p>')
      // Headers
      .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.25rem; font-weight: bold; margin-top: 24px; margin-bottom: 12px; color: #1e293b;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="font-size: 1.5rem; font-weight: bold; margin-top: 32px; margin-bottom: 16px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 style="font-size: 1.85rem; font-weight: 800; margin-bottom: 20px; color: #0f172a;">$1</h1>')
      // Bold & Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Unordered lists
      .replace(/^\s*-\s+(.*$)/gim, '<li style="margin-bottom: 6px; line-height: 1.6;">$1</li>')
      // Blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote style="border-left: 4px solid #3b82f6; padding-left: 16px; margin: 16px 0; color: #475569; background-color: #f8fafc; padding-top: 8px; padding-bottom: 8px;">$1</blockquote>')
      // Line breaks & paragraphs
      .replace(/\n\n/g, '</p><p style="margin-bottom: 16px; line-height: 1.75; font-size: 16px; color: #334155;">')
      .replace(/\n/g, '<br />');

    return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.75; color: #334155;"><p style="margin-bottom: 16px; line-height: 1.75; font-size: 16px;">${html}</p></div>`;
  }

  // HTML 클립보드 복사 (스마트에디터 ONE 붙여넣기용)
  const handleCopyRichContent = async () => {
    try {
      const htmlContent = convertMarkdownToHtml(article.content);
      const blobHtml = new Blob([htmlContent], { type: "text/html" });
      const blobPlain = new Blob([article.content], { type: "text/plain" });
      const data = [new ClipboardItem({ "text/html": blobHtml, "text/plain": blobPlain })];
      await navigator.clipboard.write(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      await navigator.clipboard.writeText(article.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };


  const handleCopyTitle = async () => {
    await navigator.clipboard.writeText(article.title);
    setCopiedTitle(true);
    setTimeout(() => setCopiedTitle(false), 2000);
  };

  const handleCopyTags = async () => {
    await navigator.clipboard.writeText(tagsString);
    setCopiedTags(true);
    setTimeout(() => setCopiedTags(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                블로그 발행 및 스마트에디터 연동
              </h3>
              <p className="text-xs text-slate-400">발행 플랫폼 선택 및 네이버 스마트에디터 ONE 서식 변환</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-4 text-xs">
          {/* Platform Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">발행 대상 플랫폼</label>
            <div className="grid grid-cols-3 gap-2">
              {/* Option 1: Naver Blog (Default Recommended) */}
              <button
                type="button"
                onClick={() => setPlatform("NAVER_BLOG")}
                className={`p-3 rounded-xl border flex flex-col items-start justify-between gap-1.5 transition-all text-left ${
                  platform === "NAVER_BLOG"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-[#03C75A] text-emerald-900 dark:text-emerald-100 ring-2 ring-[#03C75A]"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span className="w-4 h-4 rounded bg-[#03C75A] text-white flex items-center justify-center font-black text-[10px]">N</span>
                    <span>네이버 블로그</span>
                  </div>
                  {platform === "NAVER_BLOG" && <CheckCircle2 className="h-3.5 w-3.5 text-[#03C75A] shrink-0" />}
                </div>
                <Badge variant="opportunity" className="text-[9px] px-1 py-0 font-semibold bg-emerald-600 text-white">
                  국내 검색 1위 • 추천
                </Badge>
              </button>

              {/* Option 2: GitHub / Vercel Blog */}
              <button
                type="button"
                onClick={() => setPlatform("GITHUB_BLOG")}
                className={`p-3 rounded-xl border flex flex-col items-start justify-between gap-1.5 transition-all text-left ${
                  platform === "GITHUB_BLOG"
                    ? "bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Github className="h-4 w-4 text-slate-800 dark:text-white" />
                    <span>자체 깃허브/Vercel</span>
                  </div>
                  {platform === "GITHUB_BLOG" && <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                </div>
                <span className="text-[10px] text-slate-400">마크다운 직접 배포</span>
              </button>

              {/* Option 3: WordPress */}
              <button
                type="button"
                onClick={() => setPlatform("WORDPRESS")}
                className={`p-3 rounded-xl border flex flex-col items-start justify-between gap-1.5 transition-all text-left ${
                  platform === "WORDPRESS"
                    ? "bg-slate-100 dark:bg-slate-800 border-slate-400 text-slate-900 dark:text-slate-100 ring-2 ring-slate-400"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span className="w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center font-extrabold text-[10px]">W</span>
                    <span>워드프레스</span>
                  </div>
                  {platform === "WORDPRESS" && <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                </div>
                <span className="text-[10px] text-slate-400">REST API</span>
              </button>
            </div>
          </div>

          {/* WordPress Helper Tools & Status */}
          {platform === "WORDPRESS" && (
            <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5 text-xs">
                  <span className="w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center font-extrabold text-[10px]">W</span>
                  워드프레스 REST API 연결됨
                </span>
                <Badge className="bg-blue-600 text-white text-[10px]">hanabird2.wordpress.com</Badge>
              </div>
              <p className="text-[11px] text-blue-600 dark:text-blue-300">
                버튼을 누르면 <strong>hanabird2.wordpress.com</strong>에 HTML 서식, 이미지, 태그가 포함되어 즉시 발행됩니다.
              </p>
            </div>
          )}

          {/* Naver Blog Quick Helper Tools */}
          {platform === "NAVER_BLOG" && (
            <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
                  <Sparkles className="h-3.5 w-3.5 text-[#03C75A]" />
                  스마트에디터 ONE 원클릭 도구
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400">서식/이미지 자동 보정 완료</span>
              </div>


              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopyTitle}
                  className="h-8 text-[11px] gap-1 bg-white dark:bg-slate-800 border-emerald-200 hover:bg-emerald-50 text-emerald-800 dark:text-emerald-300"
                >
                  {copiedTitle ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  {copiedTitle ? "제목 복사됨" : "1. 제목 복사"}
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopyRichContent}
                  className="h-8 text-[11px] gap-1 bg-white dark:bg-slate-800 border-emerald-200 hover:bg-emerald-50 text-emerald-800 dark:text-emerald-300 font-bold"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <FileText className="h-3 w-3" />}
                  {copied ? "본문 복사완료!" : "2. 본문 서식 복사"}
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopyTags}
                  className="h-8 text-[11px] gap-1 bg-white dark:bg-slate-800 border-emerald-200 hover:bg-emerald-50 text-emerald-800 dark:text-emerald-300"
                >
                  {copiedTags ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  {copiedTags ? "태그 복사됨" : "3. 태그 복사"}
                </Button>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                <span>태그: <span className="font-mono text-emerald-700 dark:text-emerald-400">{tagsString || "#블로그 #포스팅"}</span></span>
                <a
                  href={naverPostWriteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#03C75A] font-bold flex items-center gap-1 hover:underline ml-2 shrink-0"
                >
                  네이버 글쓰기 열기 <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}

          {/* Article Info Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">글 제목 (Post Title)</span>
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                {article.title}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
              <div>
                <span className="text-[10px] text-slate-400 block">발행 URL 경로</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">/blog/{article.slug}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">카테고리</span>
                <span className="font-semibold">{article.category_name || "건강 & 웰니스"}</span>
              </div>
            </div>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-2.5 rounded-lg border bg-white dark:bg-slate-800">
              <span className="text-[10px] text-slate-400 block">콘텐츠 분량</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {wordCount} 단어 ({charCount}자)
              </span>
            </div>
            <div className="p-2.5 rounded-lg border bg-white dark:bg-slate-800">
              <span className="text-[10px] text-slate-400 block">SEO 점수</span>
              <span className="font-extrabold text-emerald-600">{article.seo_score}/100</span>
            </div>
            <div className="p-2.5 rounded-lg border bg-white dark:bg-slate-800">
              <span className="text-[10px] text-slate-400 block">팩트체크 신뢰도</span>
              <span className="font-extrabold text-blue-600">{article.fact_check_score}%</span>
            </div>
          </div>

          {/* Published Result link */}
          {publishedUrl && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold block">블로그 발행 처리가 완료되었습니다!</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{publishedUrl}</span>
                </div>
              </div>
              <a
                href={publishedUrl}
                target="_blank"
                rel="noreferrer"
                className="font-bold underline flex items-center gap-1 text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-emerald-700 transition-colors"
              >
                블로그 열기 <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading} className="text-xs">
            {publishedUrl ? "닫기" : "취소"}
          </Button>
          <Button
            variant="gradient"
            size="sm"
            onClick={() => onConfirm(platform, visibility)}
            disabled={loading}
            className="text-xs font-bold gap-1.5 shadow-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            <Send className="h-3.5 w-3.5" />
            {loading ? "발행 처리 중..." : platform === "NAVER_BLOG" ? "네이버 블로그 발행 및 서식 적용" : "최종 승인 및 블로그에 발행"}
          </Button>
        </div>
      </div>
    </div>
  );
}
