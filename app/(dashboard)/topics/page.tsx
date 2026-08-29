"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  Search,
  Flame,
  FileText,
  Clock,
  Layers,
  BarChart,
  HelpCircle,
  RefreshCw,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Topic } from "@/types";
import { formatNumber } from "@/lib/utils";

function TopicsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "generate") {
      handleGenerateMoreTopics();
    } else {
      loadTopics();
    }
  }, [searchParams]);


  async function loadTopics() {
    try {
      const res = await fetch("/api/topics/generate");
      if (res.ok) {
        const data = await res.json();
        setTopics(data.topics || []);
      }
    } catch (err) {
      console.error("Failed to load topics:", err);
    }
  }

  async function handleGenerateMoreTopics() {
    setLoading(true);
    try {
      const res = await fetch("/api/topics/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const data = await res.json();
        setTopics(data.topics || []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateArticle(topic: Topic) {
    setGeneratingId(topic.id);
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
    } finally {
      setGeneratingId(null);
    }
  }

  const filteredTopics = topics.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.primary_keyword.toLowerCase().includes(search.toLowerCase()) ||
      t.why_this_topic.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === "ALL" || t.content_type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500" />
            High-Value Topic Ideas & Intent Mapping
          </h1>
          <p className="text-sm text-slate-500">
            검색 가능성, 상업적 RPM, 콘텐츠 차별화 여지 및 검색 의도를 정밀 매핑한 주제 목록
          </p>
        </div>

        <Button
          onClick={handleGenerateMoreTopics}
          disabled={loading}
          variant="gradient"
          className="gap-2 font-semibold shadow-md"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              AI 토픽 10선 생성 중...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate 10 Topic Ideas
            </>
          )}
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="주제명, 핵심 키워드, 선정 이유 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">전체 콘텐츠 유형 (Content Type)</option>
              <option value="EXPLAINER">EXPLAINER (개념 설명)</option>
              <option value="HOW_TO">HOW_TO (실전 튜토리얼)</option>
              <option value="COMPARISON">COMPARISON (심층 비교 분석)</option>
              <option value="TREND_REPORT">TREND_REPORT (트렌드 리포트)</option>
              <option value="BUYING_GUIDE">BUYING_GUIDE (구매 가이드)</option>
              <option value="EVERGREEN">EVERGREEN (항구적 콘텐츠)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Topic Cards List */}
      <div className="space-y-4">
        {filteredTopics.map((topic) => (
          <Card
            key={topic.id}
            className="p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 shadow-sm"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="opportunity" className="gap-1 px-2.5 py-0.5">
                    <Flame className="h-3 w-3 fill-current" />
                    Score {topic.opportunity_score}
                  </Badge>
                  <Badge variant="secondary" className="text-xs font-mono font-bold">
                    {topic.content_type}
                  </Badge>
                  <Badge variant="outline" className="text-xs text-blue-700 dark:text-blue-300 border-blue-200">
                    Primary: {topic.primary_keyword}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    권장 분량: 약 {topic.recommended_length}자
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {topic.title}
                  </h3>
                  <div className="mt-1.5 p-3 rounded-lg bg-blue-50/60 dark:bg-slate-800/60 border border-blue-100/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">
                      Why this topic?
                    </span>
                    <span>{topic.why_this_topic}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-500">연관 키워드:</span>
                  {topic.secondary_keywords?.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats & Actions on Right */}
              <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-2 rounded bg-slate-50 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-400 block">Traffic</span>
                    <span className="font-bold">{formatNumber(topic.estimated_traffic)}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-50 dark:bg-slate-800">
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
                  <div className="p-2 rounded bg-slate-50 dark:bg-slate-800">
                    <span className="text-[10px] text-slate-400 block">Commercial</span>
                    <span className="font-bold text-blue-600">{topic.commercial_value}/100</span>
                  </div>
                </div>

                <Button
                  variant="gradient"
                  size="default"
                  className="gap-2 font-semibold shadow-md min-w-[160px]"
                  disabled={generatingId === topic.id}
                  onClick={() => handleCreateArticle(topic)}
                >
                  {generatingId === topic.id ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      9단계 파이프라인 생성 중...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Create Article
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function TopicsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading topics...</div>}>
      <TopicsContent />
    </Suspense>
  );
}
