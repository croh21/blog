"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Sliders,
  Bot,
  Globe,
  CheckCircle2,
  Save,
  Clock,
  Coins,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScoringWeights, AIUsageLog } from "@/types";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";

export default function SettingsPage() {
  const [weights, setWeights] = useState<ScoringWeights>({
    searchGrowth: 0.20,
    searchVolume: 0.15,
    newsMomentum: 0.10,
    socialInterest: 0.10,
    commercialValue: 0.20,
    evergreen: 0.15,
    competition: 0.10,
  });

  const [aiConfig, setAiConfig] = useState({
    defaultModel: "gpt-4o",
    fastModel: "gpt-4o-mini",
    temperature: 0.7,
    contentLanguage: "ko",
    defaultArticleLength: 2500,
  });

  const [aiLogs, setAiLogs] = useState<AIUsageLog[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings?.scoring_weights) setWeights(d.settings.scoring_weights);
        if (d.settings?.ai_config) setAiConfig(d.settings.ai_config);
      })
      .catch(console.error);

    fetch("/api/cost")
      .then((r) => r.json())
      .then((d) => {
        if (d.recentLogs) setAiLogs(d.recentLogs);
      })
      .catch(console.error);
  }, []);

  async function handleSaveSettings() {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scoring_weights: weights,
          ai_config: aiConfig,
        }),
      });
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  const totalWeightPercent = Math.round(
    (weights.searchGrowth +
      weights.searchVolume +
      weights.newsMomentum +
      weights.socialInterest +
      weights.commercialValue +
      weights.evergreen +
      weights.competition) *
      100
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            시스템 설정 및 AI 비용 관리
          </h1>
          <p className="text-sm text-slate-500">
            기회지수 알고리즘 가중치, OmniRoute AI 게이트웨이 모델 및 실시간 호출 이력
          </p>
        </div>

        <Button
          onClick={handleSaveSettings}
          disabled={saving}
          variant="gradient"
          className="gap-2 font-semibold shadow-md"
        >
          <Save className="h-4 w-4" />
          {saving ? "저장 중..." : "설정 저장"}
        </Button>
      </div>

      {savedMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>모든 설정과 가중치가 시스템에 성공적으로 반영되었습니다.</span>
        </div>
      )}

      {/* Scoring Weights Setting */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sliders className="h-5 w-5 text-blue-600" />
              Trend Opportunity Score 가중치 설정
            </CardTitle>
            <CardDescription className="text-xs">
              트렌드와 토픽의 기회지수를 계산할 때 각 항목의 가중 비율을 조정합니다 (합계: {totalWeightPercent}%)
            </CardDescription>
          </div>
          <Badge variant={totalWeightPercent === 100 ? "success" : "warning"}>
            합계 {totalWeightPercent}%
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span>검색 증가율 (Search Growth)</span>
              <span>{Math.round(weights.searchGrowth * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.05"
              value={weights.searchGrowth}
              onChange={(e) => setWeights({ ...weights, searchGrowth: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span>검색량 (Search Volume)</span>
              <span>{Math.round(weights.searchVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.05"
              value={weights.searchVolume}
              onChange={(e) => setWeights({ ...weights, searchVolume: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span>상업적 가치 (Commercial Value)</span>
              <span>{Math.round(weights.commercialValue * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.05"
              value={weights.commercialValue}
              onChange={(e) => setWeights({ ...weights, commercialValue: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span>지속 가능성 (Evergreen Potential)</span>
              <span>{Math.round(weights.evergreen * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.05"
              value={weights.evergreen}
              onChange={(e) => setWeights({ ...weights, evergreen: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span>경쟁도 (Competition - 낮을수록 고득점)</span>
              <span>{Math.round(weights.competition * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.05"
              value={weights.competition}
              onChange={(e) => setWeights({ ...weights, competition: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span>뉴스 모멘텀 (News Momentum)</span>
              <span>{Math.round(weights.newsMomentum * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.05"
              value={weights.newsMomentum}
              onChange={(e) => setWeights({ ...weights, newsMomentum: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </Card>

      {/* AI Config */}
      <Card className="p-6 space-y-4">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Bot className="h-5 w-5 text-purple-600" />
          AI Provider & Engine Configuration (OmniRoute Gateway)
        </CardTitle>
        <CardDescription className="text-xs">
          OmniRoute 로컬 게이트웨이(http://localhost:20128/v1)를 통해 구동되는 모델 설정
        </CardDescription>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-600 dark:text-slate-300">
              본문 작성 메인 모델 (Default)
            </label>
            <Input
              value={aiConfig.defaultModel}
              onChange={(e) => setAiConfig({ ...aiConfig, defaultModel: e.target.value })}
              className="text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-600 dark:text-slate-300">
              트렌드/요약 경량 모델 (Fast)
            </label>
            <Input
              value={aiConfig.fastModel}
              onChange={(e) => setAiConfig({ ...aiConfig, fastModel: e.target.value })}
              className="text-xs font-mono"
            />
          </div>
        </div>
      </Card>

      {/* Naver Blog Integration Config */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-[#03C75A] text-white flex items-center justify-center font-black text-xs">N</span>
              네이버 블로그 (Naver Blog) 스마트에디터 연동 설정
            </CardTitle>
            <CardDescription className="text-xs">
              국내 1위 검색 포털 유입을 위한 네이버 스마트에디터 ONE 서식 최적화 및 계정 연결
            </CardDescription>
          </div>
          <Badge variant="opportunity" className="text-xs bg-emerald-600 text-white">
            SmartEditor ONE
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-600 dark:text-slate-300">
              네이버 블로그 아이디 (Naver ID)
            </label>
            <Input
              defaultValue={process.env.NEXT_PUBLIC_NAVER_BLOG_ID || ""}
              placeholder="예: your_naver_id (blog.naver.com/your_naver_id)"
              className="text-xs font-mono"
            />
            <p className="text-[10px] text-slate-400">네이버 블로그 글쓰기 에디터 자동 연결에 사용되는 네이버 ID입니다.</p>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-600 dark:text-slate-300">
              기본 발행 카테고리
            </label>
            <Input
              defaultValue="건강/의학"
              placeholder="예: 건강정보, 트렌드, IT리뷰"
              className="text-xs font-mono"
            />
            <p className="text-[10px] text-slate-400">네이버 블로그에 포스팅 시 적용할 기본 분류 카테고리입니다.</p>
          </div>
        </div>
      </Card>

      {/* AI Usage Logs History Table */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <History className="h-5 w-5 text-purple-600" />
              AI 호출 및 토큰 사용 이력 (AI Usage History)
            </CardTitle>
            <CardDescription className="text-xs">
              실제 호출된 작업, 모델, 토큰 수량 및 추정 비용 기록
            </CardDescription>
          </div>
          <Badge variant="purple" className="text-xs">
            {aiLogs.length}건 기록됨
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b text-slate-400 font-semibold bg-slate-50 dark:bg-slate-800/60">
              <tr>
                <th className="py-2.5 px-3">일시</th>
                <th className="py-2.5 px-3">작업 유형</th>
                <th className="py-2.5 px-3">모델</th>
                <th className="py-2.5 px-3 text-right">입력 토큰</th>
                <th className="py-2.5 px-3 text-right">출력 토큰</th>
                <th className="py-2.5 px-3 text-right">추정 비용</th>
                <th className="py-2.5 px-3 text-center">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {aiLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                    {new Date(log.created_at).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    {log.operation}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                    {log.model}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                    {formatNumber(log.input_tokens)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                    {formatNumber(log.output_tokens)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-600">
                    {formatCurrency(log.estimated_cost)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <Badge variant="success" className="text-[10px] px-1.5 py-0">
                      SUCCESS
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
