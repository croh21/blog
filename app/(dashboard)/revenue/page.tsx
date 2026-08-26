"use client";

import { DollarSign, TrendingUp, AlertCircle, Percent, Eye, MousePointer } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function RevenuePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-amber-500" />
            Ad Revenue & RPM Monetization Engine
          </h1>
          <p className="text-sm text-slate-500">
            Google AdSense, Mediavine 및 제휴 마케팅 수익 지표 분석
          </p>
        </div>

        <Badge variant="warning" className="gap-1.5 px-3 py-1 font-semibold text-xs">
          <AlertCircle className="h-3.5 w-3.5" />
          Adapter Status: Mock / Demo Data (Phase 6 준비됨)
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <span className="text-xs text-slate-400 font-semibold">Today Est. Revenue</span>
          <div className="text-3xl font-extrabold text-amber-600 mt-1">
            {formatCurrency(1245.8)}
          </div>
          <span className="text-xs text-emerald-600 font-medium">전주 동기 대비 +18.4%</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-slate-400 font-semibold">Monthly Projected</span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            {formatCurrency(3840.0)}
          </div>
          <span className="text-xs text-slate-400 font-medium">목표 달성률 114%</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-slate-400 font-semibold">Average RPM</span>
          <div className="text-3xl font-extrabold text-blue-600 mt-1">
            $14.80
          </div>
          <span className="text-xs text-slate-400">1,000 페이지뷰당 수익</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-slate-400 font-semibold">Ad Click-Throughs</span>
          <div className="text-3xl font-extrabold text-purple-600 mt-1">
            3,290
          </div>
          <span className="text-xs text-purple-600 font-medium">광고 CTR 3.91%</span>
        </Card>
      </div>
    </div>
  );
}
