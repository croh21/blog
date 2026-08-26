"use client";

import { useState } from "react";
import { Send, X, Globe, CheckCircle2, ShieldCheck, FileText, AlertCircle, ExternalLink, Github, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Article } from "@/types";

interface PublishPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (platform: "GITHUB_BLOG" | "TISTORY" | "WORDPRESS", visibility: 0 | 3) => void;
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
  const [platform, setPlatform] = useState<"GITHUB_BLOG" | "TISTORY" | "WORDPRESS">("GITHUB_BLOG");
  const [visibility, setVisibility] = useState<0 | 3>(3); // 3: 공개, 0: 비공개

  if (!isOpen) return null;

  const wordCount = article.word_count || article.content.split(/\s+/).filter(Boolean).length;
  const charCount = article.content.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                블로그 자동 발행 전 최종 미리보기
              </h3>
              <p className="text-xs text-slate-400">발행 플랫폼 선택 및 콘텐츠 검토</p>
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
              {/* Option 1: GitHub / Vercel Blog */}
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
                <Badge variant="opportunity" className="text-[9px] px-1 py-0 font-semibold">
                  추천 • 무료 호스팅
                </Badge>
              </button>

              {/* Option 2: Tistory */}
              <button
                type="button"
                onClick={() => setPlatform("TISTORY")}
                className={`p-3 rounded-xl border flex flex-col items-start justify-between gap-1.5 transition-all text-left ${
                  platform === "TISTORY"
                    ? "bg-orange-50 dark:bg-orange-950/40 border-orange-400 text-orange-900 dark:text-orange-100 ring-2 ring-orange-400"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span className="w-4 h-4 rounded bg-orange-500 text-white flex items-center justify-center font-extrabold text-[10px]">T</span>
                    <span>티스토리</span>
                  </div>
                  {platform === "TISTORY" && <CheckCircle2 className="h-3.5 w-3.5 text-orange-600 shrink-0" />}
                </div>
                <span className="text-[10px] text-slate-400">카카오 API</span>
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
                  <span className="font-bold block">블로그 발행이 완료되었습니다!</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{publishedUrl}</span>
                </div>
              </div>
              <a
                href={publishedUrl}
                target="_blank"
                rel="noreferrer"
                className="font-bold underline flex items-center gap-1 text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-emerald-700 transition-colors"
              >
                발행글 보기 <ExternalLink className="h-3.5 w-3.5" />
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
            className="text-xs font-bold gap-1.5 shadow-md"
          >
            <Send className="h-3.5 w-3.5" />
            {loading ? "발행 처리 중..." : "최종 승인 및 블로그에 발행"}
          </Button>
        </div>
      </div>
    </div>
  );
}
