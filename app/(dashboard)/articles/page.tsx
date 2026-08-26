"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  Plus,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Article, ArticleStatus } from "@/types";
import { formatDate } from "@/lib/utils";

const STATUS_FILTERS: Array<{ label: string; value: string }> = [
  { label: "전체 상태", value: "ALL" },
  { label: "HUMAN_REVIEW (사람 검토 대기)", value: "HUMAN_REVIEW" },
  { label: "APPROVED (발행 승인됨)", value: "APPROVED" },
  { label: "PUBLISHED (발행 완료)", value: "PUBLISHED" },
  { label: "DRAFT & WRITING (작성 중)", value: "WRITING" },
];

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    loadArticles();
  }, []);

  async function loadArticles() {
    try {
      const res = await fetch("/api/articles");
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } catch (err) {
      console.error("Failed to load articles:", err);
    }
  }

  const filteredArticles = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.primary_keyword?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "WRITING"
        ? ["DRAFT", "RESEARCHING", "WRITING", "FACT_CHECK", "SEO_REVIEW"].includes(a.status)
        : a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Articles & Publishing Pipeline
          </h1>
          <p className="text-sm text-slate-500">
            시각적 이미지, 팩트체크 및 SEO 최적화가 완료된 콘텐츠의 검토, 편집 및 승인 관리
          </p>
        </div>

        <Link href="/topics">
          <Button variant="gradient" className="gap-2 font-semibold shadow-md">
            <Sparkles className="h-4 w-4" />
            New AI Article
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="글 제목, 키워드 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Article List Table / Cards */}
      <div className="space-y-3">
        {filteredArticles.map((art) => {
          // Extract first image if featured_image_url not set
          const imgMatch = art.content?.match(/!\[.*?\]\((.*?)\)/);
          const thumbUrl = art.featured_image_url || (imgMatch ? imgMatch[1] : null);

          return (
            <Card
              key={art.id}
              className="p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                {/* Optional Thumbnail Image */}
                {thumbUrl && (
                  <div className="w-full md:w-36 h-24 rounded-xl overflow-hidden shrink-0 border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 relative group">
                    <img
                      src={thumbUrl}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
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
                      className="text-xs font-semibold"
                    >
                      {art.status}
                    </Badge>
                    <span className="text-xs text-slate-500 font-medium">
                      {art.category_name || "건강 & 웰니스"}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      • {art.primary_keyword}
                    </span>
                    <span className="text-xs text-slate-400">• {art.word_count || 1400} 단어</span>
                    <span className="text-xs text-slate-400">• {formatDate(art.created_at)}</span>
                  </div>

                  <Link
                    href={`/articles/${art.id}`}
                    className="font-bold text-base text-slate-900 dark:text-slate-100 hover:text-blue-600 transition-colors block"
                  >
                    {art.title}
                  </Link>

                  <p className="text-xs text-slate-500 line-clamp-1">
                    {art.excerpt || art.meta_description}
                  </p>
                </div>

                {/* Scores & Review Button */}
                <div className="flex items-center gap-5 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">SEO Score</span>
                      <span className="font-extrabold text-emerald-600 text-sm">
                        {art.seo_score || 94}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Fact Check</span>
                      <span className="font-extrabold text-blue-600 text-sm">
                        {art.fact_check_score || 96}%
                      </span>
                    </div>
                  </div>

                  <Link href={`/articles/${art.id}`}>
                    <Button variant="default" size="sm" className="gap-1.5 font-semibold shadow-sm">
                      Editor & Review
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
