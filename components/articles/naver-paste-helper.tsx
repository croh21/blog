"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  FileText,
  Tag,
  Heading,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Article } from "@/types";
import { markdownToNaverHTML } from "@/lib/providers/naver";

interface NaverPasteHelperProps {
  article: Article;
  onMarkPublished?: () => void;
}

export function NaverPasteHelper({ article, onMarkPublished }: NaverPasteHelperProps) {
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [copiedTags, setCopiedTags] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isExpanded, setIsExpanded] = useState(true);

  const naverId = process.env.NEXT_PUBLIC_NAVER_BLOG_ID || "myblog";
  const naverWriteUrl = `https://blog.naver.com/${naverId}/postwrite`;

  const tagsList = [
    article.primary_keyword,
    ...(article.secondary_keywords || []),
  ].filter(Boolean);

  const tagsText = tagsList.map((t) => `#${t.replace(/\s+/g, "_")}`).join(" ");

  // 1. 제목 복사
  const handleCopyTitle = async () => {
    try {
      await navigator.clipboard.writeText(article.title);
      setCopiedTitle(true);
      setActiveStep(2);
      setTimeout(() => setCopiedTitle(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // 2. 스마트에디터 ONE 호환 HTML 리치 서식 복사
  const handleCopyContent = async () => {
    try {
      const richHtml = markdownToNaverHTML(article.content);
      const textFallback = article.content;

      if (typeof window !== "undefined" && window.ClipboardItem) {
        const htmlBlob = new Blob([richHtml], { type: "text/html" });
        const textBlob = new Blob([textFallback], { type: "text/plain" });
        const clipboardItem = new ClipboardItem({
          "text/html": htmlBlob,
          "text/plain": textBlob,
        });
        await navigator.clipboard.write([clipboardItem]);
      } else {
        await navigator.clipboard.writeText(textFallback);
      }

      setCopiedContent(true);
      setActiveStep(3);
      setTimeout(() => setCopiedContent(false), 2500);
    } catch (e) {
      console.error("Rich copy failed, fallback to plain text:", e);
      await navigator.clipboard.writeText(article.content);
      setCopiedContent(true);
      setActiveStep(3);
      setTimeout(() => setCopiedContent(false), 2500);
    }
  };

  // 3. 태그 복사
  const handleCopyTags = async () => {
    try {
      await navigator.clipboard.writeText(tagsText || `#${article.primary_keyword || "블로그"}`);
      setCopiedTags(true);
      setActiveStep(4);
      setTimeout(() => setCopiedTags(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#03C75A] text-white flex items-center justify-center font-black text-xs shadow-sm">
            N
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                네이버 블로그 초간편 원클릭 포스팅 도구
              </h3>
              <Badge className="bg-[#03C75A] hover:bg-[#03C75A]/90 text-white text-[10px] px-1.5 py-0">
                스마트에디터 ONE
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              클릭 한번으로 서식(색상·인용구·강조) 그대로 복사하고 네이버 글쓰기에 붙여넣기만 하세요!
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          title={isExpanded ? "도구 접기" : "도구 펼치기"}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Step Workflow Action Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
            {/* Step 1: Title */}
            <div className={`p-2.5 rounded-lg border transition-all ${
              activeStep === 1
                ? "bg-white dark:bg-slate-800 border-[#03C75A] ring-2 ring-[#03C75A]/20 shadow-sm"
                : "bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Heading className="h-3 w-3 text-emerald-600" />
                  STEP 1. 제목
                </span>
                {copiedTitle && <Check className="h-3 w-3 text-emerald-600 animate-in fade-in" />}
              </div>
              <Button
                type="button"
                size="sm"
                variant={copiedTitle ? "secondary" : "outline"}
                onClick={handleCopyTitle}
                className={`w-full text-xs font-bold gap-1.5 h-8 ${
                  copiedTitle
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300"
                    : "border-slate-300 dark:border-slate-600 hover:border-emerald-500"
                }`}
              >
                {copiedTitle ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedTitle ? "제목 복사완료!" : "제목 원클릭 복사"}
              </Button>
            </div>

            {/* Step 2: Rich Content */}
            <div className={`p-2.5 rounded-lg border transition-all sm:col-span-1 ${
              activeStep === 2
                ? "bg-white dark:bg-slate-800 border-[#03C75A] ring-2 ring-[#03C75A]/20 shadow-sm"
                : "bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-[#03C75A]" />
                  STEP 2. 본문 서식
                </span>
                {copiedContent && <Check className="h-3 w-3 text-emerald-600 animate-in fade-in" />}
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleCopyContent}
                className={`w-full text-xs font-bold gap-1.5 h-8 shadow-sm ${
                  copiedContent
                    ? "bg-emerald-700 text-white"
                    : "bg-[#03C75A] hover:bg-[#02b350] text-white"
                }`}
              >
                {copiedContent ? <Check className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                {copiedContent ? "본문 서식 복사됨!" : "본문 리치서식 복사"}
              </Button>
            </div>

            {/* Step 3: Open Naver Write */}
            <div className={`p-2.5 rounded-lg border transition-all ${
              activeStep === 3
                ? "bg-white dark:bg-slate-800 border-[#03C75A] ring-2 ring-[#03C75A]/20 shadow-sm"
                : "bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <ExternalLink className="h-3 w-3 text-blue-600" />
                  STEP 3. 글쓰기
                </span>
              </div>
              <a
                href={naverWriteUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setActiveStep(4)}
                className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold h-8 rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                네이버 글쓰기 열기
              </a>
            </div>

            {/* Step 4: Tags */}
            <div className={`p-2.5 rounded-lg border transition-all ${
              activeStep === 4
                ? "bg-white dark:bg-slate-800 border-[#03C75A] ring-2 ring-[#03C75A]/20 shadow-sm"
                : "bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Tag className="h-3 w-3 text-purple-600" />
                  STEP 4. 태그
                </span>
                {copiedTags && <Check className="h-3 w-3 text-emerald-600 animate-in fade-in" />}
              </div>
              <Button
                type="button"
                size="sm"
                variant={copiedTags ? "secondary" : "outline"}
                onClick={handleCopyTags}
                className={`w-full text-xs font-bold gap-1.5 h-8 ${
                  copiedTags
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300"
                    : "border-slate-300 dark:border-slate-600 hover:border-purple-500"
                }`}
              >
                {copiedTags ? <Check className="h-3.5 w-3.5" /> : <Tag className="h-3.5 w-3.5" />}
                {copiedTags ? "태그 복사완료!" : "태그 일괄 복사"}
              </Button>
            </div>
          </div>

          {/* Practical Copy & Paste Instruction Tip */}
          <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-lg border border-emerald-100 dark:border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-[11px]">
                💡
              </span>
              <span className="leading-tight">
                <strong>붙여넣기 팁:</strong> <span className="text-emerald-700 dark:text-emerald-400 font-semibold">[본문 리치서식 복사]</span> 클릭 후, 네이버 스마트에디터 본문에서 <strong>Ctrl + V</strong>를 누르면 색상, 인용구 박스, 형광펜 효과가 그대로 들어갑니다.
              </span>
            </div>

            {onMarkPublished && article.status !== "PUBLISHED" && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onMarkPublished}
                className="text-[11px] h-7 px-2.5 font-semibold text-slate-600 hover:text-emerald-600 border-dashed shrink-0"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                네이버 등록 완료 표시
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
