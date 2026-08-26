"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Search,
  Filter,
  Flame,
  Sparkles,
  ExternalLink,
  Ban,
  ArrowUpRight,
  RefreshCw,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trend } from "@/types";
import { formatDate } from "@/lib/utils";

export default function TrendsPage() {
  const router = useRouter();
  const [trends, setTrends] = useState<Trend[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [minScore, setMinScore] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [generatingTopicId, setGeneratingTopicId] = useState<string | null>(null);

  useEffect(() => {
    loadTrends();
  }, []);

  async function loadTrends() {
    try {
      const res = await fetch("/api/trends/discover");
      if (res.ok) {
        const data = await res.json();
        setTrends(data.trends || []);
      }
    } catch (err) {
      console.error("Failed to load trends:", err);
    }
  }

  async function handleDiscoverTrends() {
    setLoading(true);
    try {
      const res = await fetch("/api/trends/discover", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setTrends(data.trends || []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTopics(trend: Trend) {
    setGeneratingTopicId(trend.id);
    try {
      const res = await fetch("/api/topics/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trendId: trend.id }),
      });
      if (res.ok) {
        router.push(`/topics?trendId=${trend.id}`);
      }
    } finally {
      setGeneratingTopicId(null);
    }
  }

  function handleReject(id: string) {
    setTrends((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "REJECTED" as const } : t))
    );
  }

  const filteredTrends = trends.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      selectedCategory === "ALL" || t.category_name === selectedCategory;
    const matchesScore = t.opportunity_score >= minScore;
    return matchesSearch && matchesCat && matchesScore;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            Trend Discovery & Opportunity Radar
          </h1>
          <p className="text-sm text-slate-500">
            글로벌 검색량, 뉴스 모멘텀, 소셜 반응 및 상업적 가치를 종합 분석한 실시간 트렌드
          </p>
        </div>

        <Button
          onClick={handleDiscoverTrends}
          disabled={loading}
          variant="gradient"
          className="gap-2 font-semibold shadow-md"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              트렌드 수집 중...
            </>
          ) : (
            <>
              <Flame className="h-4 w-4 fill-current" />
              Discover Fresh Trends
            </>
          )}
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 bg-white dark:bg-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="트렌드 키워드, 기술명, 설명 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">전체 카테고리</option>
              <option value="건강 & 웰니스">건강 & 웰니스 (저속노화/영양/수면)</option>
              <option value="AI & 생산성 테크">AI & 생산성 테크</option>
              <option value="디지털 마케팅 & 수익화">디지털 마케팅 & 수익화</option>
            </select>
          </div>

          <div>
            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value={0}>최소 기회지수: 전체</option>
              <option value={80}>기회지수 80점 이상</option>
              <option value={90}>기회지수 90점 이상 (강력 추천)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Trend Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTrends.map((trend) => (
          <Card
            key={trend.id}
            className={`flex flex-col justify-between transition-all duration-200 ${
              trend.status === "REJECTED" ? "opacity-40 grayscale" : "hover:border-blue-300 dark:hover:border-blue-700"
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="opportunity" className="gap-1 px-2.5 py-0.5">
                    <Flame className="h-3 w-3 fill-current" />
                    Opportunity {trend.opportunity_score}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {trend.category_name || "Tech & AI"}
                  </Badge>
                  <Badge
                    variant={trend.status === "SELECTED" ? "success" : "outline"}
                    className="text-[10px]"
                  >
                    {trend.status}
                  </Badge>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">
                  {formatDate(trend.collected_at)}
                </span>
              </div>

              <CardTitle className="text-base font-bold mt-2.5 leading-snug">
                {trend.title}
              </CardTitle>
              <CardDescription className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {trend.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0 space-y-4">
              {/* Factor Score Radar Row */}
              <div className="grid grid-cols-5 gap-1.5 py-2 px-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Growth</span>
                  <span className="font-bold text-emerald-600">+{trend.search_growth}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Volume</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{trend.search_volume}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Commercial</span>
                  <span className="font-bold text-blue-600">{trend.commercial_score}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Evergreen</span>
                  <span className="font-bold text-purple-600">{trend.evergreen_score}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Competition</span>
                  <span className="font-bold text-amber-600">{trend.competition_score}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 truncate max-w-[220px]">
                  출처: {trend.source_name}
                </span>
                <a
                  href={trend.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline text-[11px]"
                >
                  원본 링크 <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="gradient"
                  size="sm"
                  className="flex-1 text-xs font-semibold gap-1.5"
                  disabled={generatingTopicId === trend.id || trend.status === "REJECTED"}
                  onClick={() => handleCreateTopics(trend)}
                >
                  {generatingTopicId === trend.id ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      10대 토픽 도출 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      Create Topics
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs text-red-500 hover:text-red-700"
                  onClick={() => handleReject(trend.id)}
                  title="트렌드 제외"
                >
                  <Ban className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
