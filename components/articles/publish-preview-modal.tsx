"use client";

import { useState } from "react";
import { Send, X, Globe, CheckCircle2, ShieldCheck, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Article } from "@/types";

interface PublishPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  article: Article;
  loading: boolean;
}

export function PublishPreviewModal({
  isOpen,
  onClose,
  onConfirm,
  article,
  loading,
}: PublishPreviewModalProps) {
  if (!isOpen) return null;

  const wordCount = article.word_count || article.content.split(/\s+/).filter(Boolean).length;
  const charCount = article.content.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                WordPress 발행 전 최종 미리보기
              </h3>
              <p className="text-xs text-slate-400">발행 메타데이터 및 품질 검토 확인</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">글 제목 (Post Title)</span>
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                {article.title}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
              <div>
                <span className="text-[10px] text-slate-400 block">URL Slug</span>
                <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400">/{article.slug}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">카테고리</span>
                <span className="font-semibold">{article.category_name || "AI & 자율 에이전트"}</span>
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
              <span className="text-[10px] text-slate-400 block">최종 SEO 점수</span>
              <span className="font-extrabold text-emerald-600">{article.seo_score}/100</span>
            </div>
            <div className="p-2.5 rounded-lg border bg-white dark:bg-slate-800">
              <span className="text-[10px] text-slate-400 block">팩트체크 신뢰도</span>
              <span className="font-extrabold text-blue-600">{article.fact_check_score}%</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-start gap-2 text-blue-800 dark:text-blue-300 text-[11px]">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
            <div>
              <span className="font-bold block">안전 발행 가이드 (Safety Mode)</span>
              현재 Phase 1에서는 실제 외부 WordPress 계정 연동 없이 표준 Mock REST API를 통해 안전하게 발행 시뮬레이션 및 데이터베이스 상태 변경(`PUBLISHED`)을 완료합니다.
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading} className="text-xs">
            취소
          </Button>
          <Button
            variant="gradient"
            size="sm"
            onClick={onConfirm}
            disabled={loading}
            className="text-xs font-bold gap-1.5 shadow-md"
          >
            <Send className="h-3.5 w-3.5" />
            {loading ? "발행 처리 중..." : "최종 승인 및 WordPress 발행"}
          </Button>
        </div>
      </div>
    </div>
  );
}
