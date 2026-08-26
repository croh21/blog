"use client";

import { BarChart3, TrendingUp, Users, MousePointer, Search, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-emerald-600" />
            Organic Search & Traffic Analytics
          </h1>
          <p className="text-sm text-slate-500">
            Google Search Console 및 Google Analytics 연동 어댑터
          </p>
        </div>

        <Badge variant="warning" className="gap-1.5 px-3 py-1 font-semibold text-xs">
          <AlertCircle className="h-3.5 w-3.5" />
          Adapter Status: Mock / Demo Data (Phase 5 준비됨)
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <span className="text-xs text-slate-400 font-semibold">Total Impressions</span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            124,800
          </div>
          <span className="text-xs text-emerald-600 font-medium">전월 대비 +32.4%</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-slate-400 font-semibold">Total Clicks</span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            8,420
          </div>
          <span className="text-xs text-emerald-600 font-medium">전월 대비 +28.1%</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-slate-400 font-semibold">Average CTR</span>
          <div className="text-3xl font-extrabold text-blue-600 mt-1">
            6.74%
          </div>
          <span className="text-xs text-slate-400">업계 평균(3.2%) 상회</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-slate-400 font-semibold">Average Position</span>
          <div className="text-3xl font-extrabold text-purple-600 mt-1">
            3.4위
          </div>
          <span className="text-xs text-purple-600 font-medium">상위 1페이지 노출</span>
        </Card>
      </div>

      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-base font-bold">Top Performing Search Queries</CardTitle>
          <CardDescription className="text-xs">
            실제 유입을 이끈 주요 검색어 및 클릭 전환율
          </CardDescription>
        </CardHeader>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <div className="py-3 flex justify-between items-center">
            <span className="font-semibold">MCP 프로토콜 구축 가이드</span>
            <span className="text-slate-500">클릭 3,420 • CTR 8.2% • 평균 1.8위</span>
          </div>
          <div className="py-3 flex justify-between items-center">
            <span className="font-semibold">AI 에이전트 vs 챗봇 차이점</span>
            <span className="text-slate-500">클릭 2,180 • CTR 6.9% • 평균 2.4위</span>
          </div>
          <div className="py-3 flex justify-between items-center">
            <span className="font-semibold">2026 AI Overviews SEO 최적화</span>
            <span className="text-slate-500">클릭 1,940 • CTR 5.8% • 평균 3.1위</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
