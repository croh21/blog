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
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";


function TrendsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [trends, setTrends] = useState<Trend[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [minScore, setMinScore] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [generatingTopicId, setGeneratingTopicId] = useState<string | null>(null);


  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "discover") {
      handleDiscoverTrends();
    } else {
      loadTrends();
    }
  }, [searchParams]);

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

  const CATEGORIES = [
    { id: "ALL", label: "⚡ 전체 종합", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
    { id: "여행 & 관광", label: "✈️ 여행 & 관광", color: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-sky-200" },
    { id: "맛집 & 요리", label: "🍳 맛집 & 요리", color: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200" },
    { id: "AI & 테크", label: "💻 AI & 테크", color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200" },
    { id: "재테크 & 금융", label: "💰 재테크 & 금융", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200" },
    { id: "건강 & 웰니스", label: "🌿 건강 & 웰니스", color: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200" },
    { id: "자기계발 & 라이프", label: "📚 자기계발", color: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200" },
  ];

  async function handleDiscoverTrends(categoryOverride?: string) {
    const targetCat = categoryOverride !== undefined ? categoryOverride : selectedCategory;
    setLoading(true);
    try {
      const res = await fetch("/api/trends/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: targetCat !== "ALL" ? targetCat : undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        setTrends(data.trends || []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCategoryTabClick(catId: string) {
    setSelectedCategory(catId);
    await handleDiscoverTrends(catId);
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
    if (!t) return false;
    const titleStr = (t.title || "").toLowerCase();
    const descStr = (t.description || "").toLowerCase();
    const searchStr = (search || "").toLowerCase();
    const matchesSearch = !searchStr || titleStr.includes(searchStr) || descStr.includes(searchStr);
    const matchesCat = selectedCategory === "ALL" || t.category_name === selectedCategory;
    const matchesScore = (t.opportunity_score ?? 0) >= minScore;
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
            원하는 카테고리를 선택하여 AI 및 실시간 검색량 기반의 맞춤 핫 트렌드를 즉시 발굴하세요.
          </p>
        </div>

        <Button
          onClick={() => handleDiscoverTrends()}
          disabled={loading}
          variant="gradient"
          className="gap-2 font-semibold shadow-md"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              {selectedCategory === "ALL" ? "전체 트렌드 발굴 중..." : `${selectedCategory} 트렌드 발굴 중...`}
            </>
          ) : (
            <>
              <Flame className="h-4 w-4 fill-current" />
              {selectedCategory === "ALL" ? "Discover Fresh Trends" : `[${selectedCategory}] 트렌드 집중 발굴`}
            </>
          )}
        </Button>
      </div>

      {/* Category Quick Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryTabClick(cat.id)}
              disabled={loading}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm scale-105"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
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
              <option value="ALL">전체 카테고리 (All Categories)</option>
              <option value="여행 & 관광">여행 & 관광 (제주/캠핑/해외)</option>
              <option value="맛집 & 요리">맛집 & 요리 (레시피/홈카페/노포)</option>
              <option value="건강 & 웰니스">건강 & 웰니스 (저속노화/영양/수면)</option>
              <option value="AI & 테크">AI & 테크 (Claude/MCP/자동화)</option>
              <option value="재테크 & 금융">재테크 & 금융 (절세/ETF/청약)</option>
              <option value="디지털 마케팅">디지털 마케팅 & 블로그 수익화</option>
              <option value="자기계발 & 라이프">자기계발 & 라이프 (루틴/노션/습관)</option>
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

export default function TrendsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">트렌드 로딩 중...</div>}>
      <TrendsContent />
    </Suspense>
  );
}

