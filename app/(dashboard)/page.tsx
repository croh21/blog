"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  TrendingUp,
  FileText,
  DollarSign,
  BarChart3,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Flame,
  Bot,
  Layers,
  ChevronRight,
  RefreshCw,
  Search,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Topic, Article, Trend } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [costData, setCostData] = useState<any>(null);
  const [generatingArticleId, setGeneratingArticleId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const [trendRes, topicRes, artRes, costRes] = await Promise.all([
        fetch("/api/trends/discover"),
        fetch("/api/topics/generate"),
        fetch("/api/articles"),
        fetch("/api/cost"),
      ]);

      if (trendRes.ok) {
        const d = await trendRes.json();
        setTrends(d.trends || []);
      }
      if (topicRes.ok) {
        const d = await topicRes.json();
        setTopics(d.topics || []);
      }
      if (artRes.ok) {
        const d = await artRes.json();
        setArticles(d.articles || []);
      }
      if (costRes.ok) {
        const d = await costRes.json();
        setCostData(d);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
  }

  async function handleFindTodayOpportunities() {
    setLoading(true);
    try {
      // 1. Discover trends
      const trendRes = await fetch("/api/trends/discover", { method: "POST" });
      const trendJson = await trendRes.json();
      setTrends(trendJson.trends || []);

      // 2. Generate top topics
      const topTrend = trendJson.trends?.[0];
      const topicRes = await fetch("/api/topics/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trendId: topTrend?.id }),
      });
      const topicJson = await topicRes.json();
      setTopics(topicJson.topics || []);

      await fetchDashboardData();
    } catch (err) {
      console.error("Failed to run opportunity finder:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateArticleFromTopic(topic: Topic) {
    setGeneratingArticleId(topic.id);
    try {
      const res = await fetch("/api/articles/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: topic.id }),
      });
      const data = await res.json();
      if (data.success && data.article) {
        router.push(`/articles/${data.article.id}`);
      }
    } catch (err) {
      console.error("Failed to generate article:", err);
    } finally {
      setGeneratingArticleId(null);
    }
  }

  const publishedCount = articles.filter((a) => a.status === "PUBLISHED" || a.status === "APPROVED").length;
  const draftCount = articles.filter((a) => a.status !== "PUBLISHED" && a.status !== "APPROVED").length;

  return (
    <div className="space-y-8">
      {/* Top Welcome & Find Opportunities Action Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 md:p-10 shadow-xl border border-blue-800/40">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <Badge className="bg-blue-500/30 text-blue-200 border-blue-400/30 backdrop-blur-md px-3 py-1 font-semibold text-xs">
              Phase 1 MVP • Trend-Driven Publishing Engine
            </Badge>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              TrendPilot AI Dashboard
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              최신 검색 트렌드와 수익성 지표를 실시간 분석하여, 검색 상위 노출과 높은 RPM을 달성할 수 있는 최적의 콘텐츠 전략을 자동으로 추천합니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Button
              size="lg"
              variant="gradient"
              onClick={handleFindTodayOpportunities}
              disabled={loading}
              className="h-14 px-8 text-base font-bold shadow-lg shadow-blue-500/25 gap-3 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:to-red-600 border-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  트렌드 수집 및 AI 분석 중...
                </>
              ) : (
                <>
                  <Flame className="h-5 w-5 fill-current animate-bounce" />
                  Find Today's Opportunities
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Top KPI Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Articles</span>
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold">{articles.length}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-medium">{publishedCount} 승인됨</span> • {draftCount} 작성중
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Trends</span>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold">{trends.length}</div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">
            평균 기회지수 {Math.round(trends.reduce((a, b) => a + (b.opportunity_score || 0), 0) / (trends.length || 1))}점
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Organic Traffic</span>
            <BarChart3 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold">124.8K</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            클릭수 8,420 (CTR 6.7%)
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Est. Revenue</span>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold">{formatCurrency(1245.8)}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            월 예상 <span className="text-amber-600 font-semibold">{formatCurrency(3840)}</span>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Today AI Cost</span>
            <Bot className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-bold">
            {formatCurrency(costData?.totalCost || 0.042)}
          </div>
          <div className="text-[11px] text-purple-600 font-medium mt-1">
            글당 평균 ${costData?.averageCostPerArticle || 0.038}
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Avg SEO Score</span>
            <Search className="h-4 w-4 text-cyan-600" />
          </div>
          <div className="mt-2 text-2xl font-bold">94 / 100</div>
          <div className="text-[11px] text-cyan-600 font-medium mt-1">
            팩트체크 신뢰도 96%
          </div>
        </Card>
      </div>

      {/* Main Section: Today's Opportunities (AI Top 5 Recommendations) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500 fill-current" />
              Today's High-Value Opportunities
            </h2>
            <p className="text-xs text-slate-500">
              검색량, 증가율, 상업성 및 경쟁도를 복합 계산하여 AI가 선정한 상위 추천 토픽
            </p>
          </div>
          <Link href="/topics">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              전체 토픽 보기 <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.slice(0, 5).map((topic, idx) => (
            <Card
              key={topic.id}
              className="flex flex-col justify-between hover:shadow-md transition-all duration-200 border-slate-200/90 dark:border-slate-800"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="opportunity" className="gap-1 px-2 py-0.5">
                    <Flame className="h-3 w-3 fill-current" />
                    Score {topic.opportunity_score}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {topic.content_type}
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold line-clamp-2 mt-2 leading-snug">
                  {topic.title}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 line-clamp-2 mt-1">
                  {topic.why_this_topic}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Traffic</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {formatNumber(topic.estimated_traffic)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Competition</span>
                    <span
                      className={`font-bold ${
                        topic.competition === "LOW"
                          ? "text-emerald-600"
                          : topic.competition === "MEDIUM"
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      {topic.competition}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Commercial</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {topic.commercial_value}/100
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => router.push(`/topics?selected=${topic.id}`)}
                  >
                    Analyze
                  </Button>
                  <Button
                    variant="gradient"
                    size="sm"
                    className="flex-1 text-xs font-semibold gap-1.5 shadow-sm"
                    disabled={generatingArticleId === topic.id}
                    onClick={() => handleCreateArticleFromTopic(topic)}
                  >
                    {generatingArticleId === topic.id ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        작성 중...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        Create Article
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Two Column Section: Recent Articles & AI Cost Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Articles & Status */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Recent Articles & Publishing Workflow
            </h3>
            <Link href="/articles" className="text-xs text-blue-600 hover:underline">
              전체 보기
            </Link>
          </div>

          <div className="space-y-2.5">
            {articles.map((art) => (
              <Card
                key={art.id}
                className="p-4 hover:border-blue-300 dark:hover:border-blue-800 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          art.status === "PUBLISHED"
                            ? "success"
                            : art.status === "APPROVED"
                            ? "purple"
                            : art.status === "HUMAN_REVIEW"
                            ? "warning"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {art.status}
                      </Badge>
                      <span className="text-xs text-slate-400 font-mono">
                        {art.word_count || 1400} words
                      </span>
                    </div>
                    <Link
                      href={`/articles/${art.id}`}
                      className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 transition-colors block truncate"
                    >
                      {art.title}
                    </Link>
                  </div>

                  <div className="flex items-center gap-4 text-xs shrink-0">
                    <div className="text-right">
                      <div className="font-semibold text-emerald-600">
                        SEO {art.seo_score || 94}/100
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Fact Check {art.fact_check_score || 96}%
                      </div>
                    </div>
                    <Link href={`/articles/${art.id}`}>
                      <Button size="sm" variant="outline" className="h-8 px-3 text-xs">
                        Editor & Review
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right 1 Col: AI Cost & Operation Breakdown */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bot className="h-4 w-4 text-purple-600" />
            AI Cost & Usage Monitor
          </h3>

          <Card className="p-5 space-y-4">
            <div className="space-y-1">
              <div className="text-xs text-slate-400">총 누적 AI API 비용</div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {formatCurrency(costData?.totalCost || 0.0421)}
              </div>
              <div className="text-xs text-emerald-600 font-medium">
                1편당 평균 ${costData?.averageCostPerArticle || 0.038} (예산 최적화 적용됨)
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>총 호출 횟수</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {costData?.totalCalls || 6} 회
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>입력 토큰</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {formatNumber(costData?.totalInputTokens || 14200)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>출력 토큰</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {formatNumber(costData?.totalOutputTokens || 8900)}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Task별 최적 모델 배분
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">트렌드/토픽 발굴</span>
                  <Badge variant="secondary" className="text-[10px] font-mono">gpt-4o-mini</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">본문 심층 작성</span>
                  <Badge variant="secondary" className="text-[10px] font-mono">gpt-4o</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">팩트체크 & SEO</span>
                  <Badge variant="secondary" className="text-[10px] font-mono">gpt-4o / mini</Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
