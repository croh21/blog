"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { QualityGateResult } from "@/lib/scoring/quality-gate";

interface QualityGateBannerProps {
  qualityGate: QualityGateResult | null;
}

export function QualityGateBanner({ qualityGate }: QualityGateBannerProps) {
  const [expanded, setExpanded] = useState(false);

  if (!qualityGate) return null;

  const { passed, checklist, missingReasons } = qualityGate;

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 ${
        passed
          ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-100"
          : "bg-amber-50/90 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
              passed
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-amber-500 text-white shadow-sm"
            }`}
          >
            {passed ? (
              <ShieldCheck className="h-5 w-5" />
            ) : (
              <ShieldAlert className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">
                {passed
                  ? "승인 및 발행 품질 게이트 통과 (Quality Gate: Passed)"
                  : "발행 품질 게이트 미달 (조건 충족 필요)"}
              </span>
              <Badge variant={passed ? "success" : "warning"} className="text-[10px] font-bold">
                {checklist.filter((c) => c.passed).length} / {checklist.length} 충족
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {passed
                ? "최소 분량, SEO 75점 이상, 팩트체크 90% 이상, Tier 1~2 출처 2개 이상을 모두 충족하여 승인이 가능합니다."
                : `현재 ${missingReasons.length}개 기준 미달로 승인 및 WordPress 발행이 제한됩니다.`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-semibold flex items-center gap-1 self-end sm:self-center text-slate-700 dark:text-slate-200 hover:text-blue-600 py-1 px-2.5 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800"
        >
          {expanded ? "기준 접기" : "품질 기준 상세보기"}
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Checklist items */}
      {expanded && (
        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
          {checklist.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-lg border flex items-start justify-between gap-2 ${
                item.passed
                  ? "bg-white/80 dark:bg-slate-900/80 border-emerald-200 dark:border-emerald-900/60"
                  : "bg-white/80 dark:bg-slate-900/80 border-amber-300 dark:border-amber-800"
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 font-bold">
                  {item.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  )}
                  <span className="truncate">{item.name}</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                  {item.description}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`font-mono font-bold block ${
                    item.passed ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {item.currentValue}
                </span>
                <span className="text-[10px] text-slate-400">
                  (기준: {item.requiredValue})
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
