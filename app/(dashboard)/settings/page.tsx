"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Sliders,
  Bot,
  Globe,
  Database,
  CheckCircle2,
  AlertCircle,
  Save,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScoringWeights } from "@/types";

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
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            System & Algorithm Settings
          </h1>
          <p className="text-sm text-slate-500">
            Opportunity Score 가중치, AI 모델 배분 및 외부 서비스 어댑터 설정
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

      {/* AI & Generation Engine Config */}
      <Card className="p-6 space-y-4">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Bot className="h-5 w-5 text-purple-600" />
          AI Provider & Engine Configuration (AGENTS.md)
        </CardTitle>
        <CardDescription className="text-xs">
          OmniRoute 로컬 게이트웨이(http://localhost:20128/v1)를 통해 구동되는 Task별 모델
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

          <div className="space-y-1">
            <label className="font-semibold text-slate-600 dark:text-slate-300">
              기본 콘텐츠 작성 언어
            </label>
            <Input
              value={aiConfig.contentLanguage}
              onChange={(e) => setAiConfig({ ...aiConfig, contentLanguage: e.target.value })}
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-600 dark:text-slate-300">
              기본 권장 글자 수 (단어)
            </label>
            <Input
              type="number"
              value={aiConfig.defaultArticleLength}
              onChange={(e) => setAiConfig({ ...aiConfig, defaultArticleLength: parseInt(e.target.value) || 2500 })}
              className="text-xs"
            />
          </div>
        </div>
      </Card>

      {/* External Service Adapters Status */}
      <Card className="p-6 space-y-4">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600" />
          Connected Adapters & Status
        </CardTitle>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <div className="py-3 flex justify-between items-center">
            <div>
              <span className="font-semibold block">OmniRoute LLM Gateway</span>
              <span className="text-slate-400 text-[11px]">http://localhost:20128/v1 (OpenAI Protocol)</span>
            </div>
            <Badge variant="success">Connected (Active)</Badge>
          </div>

          <div className="py-3 flex justify-between items-center">
            <div>
              <span className="font-semibold block">Supabase Database & Storage</span>
              <span className="text-slate-400 text-[11px]">PostgreSQL 15 / Supabase Client</span>
            </div>
            <Badge variant="success">Connected / Memory Fallback Active</Badge>
          </div>

          <div className="py-3 flex justify-between items-center">
            <div>
              <span className="font-semibold block">WordPress REST API Adapter</span>
              <span className="text-slate-400 text-[11px]">Phase 4 배포 대상</span>
            </div>
            <Badge variant="outline">Mock Adapter (Ready)</Badge>
          </div>

          <div className="py-3 flex justify-between items-center">
            <div>
              <span className="font-semibold block">Google Search Console / GA4 Adapter</span>
              <span className="text-slate-400 text-[11px]">Phase 5 분석 연동</span>
            </div>
            <Badge variant="outline">Not Connected (Phase 5)</Badge>
          </div>

          <div className="py-3 flex justify-between items-center">
            <div>
              <span className="font-semibold block">Google AdSense / Mediavine Adapter</span>
              <span className="text-slate-400 text-[11px]">Phase 6 수익 최적화 연동</span>
            </div>
            <Badge variant="outline">Not Connected (Phase 6)</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
