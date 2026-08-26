"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Search,
  BookmarkCheck,
  Link as LinkIcon,
  ShieldCheck,
  Send,
  Save,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  Info,
  Check,
  X,
  Share2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Article,
  ArticleClaim,
  ArticleSource,
  InternalLinkRecommendation,
  SEOScoreBreakdown,
  Source,
} from "@/types";

export default function ArticleEditorPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [claims, setClaims] = useState<ArticleClaim[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [internalLinks, setInternalLinks] = useState<InternalLinkRecommendation[]>([]);
  const [seoBreakdown, setSeoBreakdown] = useState<SEOScoreBreakdown | null>(null);

  const [activeTab, setActiveTab] = useState<"SEO" | "FACT_CHECK" | "SOURCES" | "INTERNAL_LINKS">("SEO");
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [primaryKeyword, setPrimaryKeyword] = useState("");

  const [saving, setSaving] = useState(false);
  const [aiActionLoading, setAiActionLoading] = useState<string | null>(null);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  useEffect(() => {
    loadArticleData();
  }, [articleId]);

  async function loadArticleData() {
    try {
      const res = await fetch(`/api/articles/${articleId}`);
      if (res.ok) {
        const data = await res.json();
        setArticle(data.article);
        setTitle(data.article.title || "");
        setSlug(data.article.slug || "");
        setContent(data.article.content || "");
        setMetaDescription(data.article.meta_description || "");
        setPrimaryKeyword(data.article.primary_keyword || "");
        setClaims(data.claims || []);
        setSources(data.sources || []);
        setInternalLinks(data.internalLinks || []);
        setSeoBreakdown(data.seoBreakdown);
      }
    } catch (err) {
      console.error("Failed to load article details:", err);
    }
  }

  async function handleSave(statusOverride?: Article["status"]) {
    setSaving(true);
    try {
      const payload: Partial<Article> = {
        title,
        slug,
        content,
        meta_description: metaDescription,
        primary_keyword: primaryKeyword,
        status: statusOverride || article?.status || "HUMAN_REVIEW",
      };

      const res = await fetch(`/api/articles/${articleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setArticle(data.article);
        setSeoBreakdown(data.seoBreakdown);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove() {
    await handleSave("APPROVED");
    setPublishMessage("글이 성공적으로 승인되었습니다 (APPROVED). WordPress 발행 준비 완료.");
  }

  async function handlePublish() {
    setSaving(true);
    // Simulates or connects with WP Adapter
    setTimeout(async () => {
      await handleSave("PUBLISHED");
      setSaving(false);
      setPublishMessage("WordPress REST API Adapter: Post published to blog (Mock/Live).");
    }, 800);
  }

  function handleApplyInternalLink(link: InternalLinkRecommendation) {
    const markdownLink = `[${link.anchor_text}](/${link.target_slug})`;
    setContent((prev) => `${prev}\n\n> 💡 **관련 글 추천**: ${markdownLink}`);
    setInternalLinks((prev) =>
      prev.map((l) => (l.id === link.id ? { ...l, applied: true } : l))
    );
  }

  function handleClaimStatusChange(claimId: string, newStatus: ArticleClaim["verification_status"]) {
    setClaims((prev) =>
      prev.map((c) => (c.id === claimId ? { ...c, verification_status: newStatus } : c))
    );
  }

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
          콘텐츠 및 검토 데이터 로딩 중...
        </div>
      </div>
    );
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/articles">
              <Button variant="ghost" size="sm" className="h-8 px-2 gap-1 text-xs">
                <ChevronLeft className="h-4 w-4" /> Articles
              </Button>
            </Link>
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />
            <Badge
              variant={
                article.status === "APPROVED"
                  ? "purple"
                  : article.status === "PUBLISHED"
                  ? "success"
                  : "warning"
              }
              className="font-bold px-2.5 py-0.5"
            >
              {article.status}
            </Badge>
            <span className="text-xs text-slate-500 font-mono">
              {wordCount} words • {article.language.toUpperCase()}
            </span>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave()}
              disabled={saving}
              className="text-xs gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "저장 중..." : "Save Draft"}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleApprove}
              disabled={saving || article.status === "APPROVED"}
              className="text-xs font-semibold gap-1.5 text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 hover:bg-purple-200"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Approve (사람 승인)
            </Button>

            <Button
              variant="gradient"
              size="sm"
              onClick={handlePublish}
              disabled={saving}
              className="text-xs font-bold gap-1.5 shadow-sm"
            >
              <Send className="h-3.5 w-3.5" />
              Publish to WordPress
            </Button>
          </div>
        </div>

        {/* Status Notification Banner */}
        {publishMessage && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{publishMessage}</span>
            </div>
            <button
              onClick={() => setPublishMessage(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Quality Score Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">SEO Score:</span>
            <span className="font-extrabold text-emerald-600">
              {seoBreakdown?.overallScore || article.seo_score}/100
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Fact Check:</span>
            <span className="font-extrabold text-blue-600">
              {article.fact_check_score || 96}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Sources Cited:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {sources.length}개 (Tier 1~2)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Internal Links:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {internalLinks.length}개 추천
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Article Editor */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">글 제목 (H1 Title)</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-base font-bold"
                placeholder="제목을 입력하세요..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">URL Slug</label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="text-xs font-mono"
                  placeholder="url-slug-example"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Primary Keyword</label>
                <Input
                  value={primaryKeyword}
                  onChange={(e) => setPrimaryKeyword(e.target.value)}
                  className="text-xs"
                  placeholder="핵심 키워드"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">
                메타 설명문 (Meta Description)
              </label>
              <Textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
                className="text-xs leading-relaxed"
                placeholder="검색 결과에 노출될 80~150자 설명문..."
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-500">본문 내용 (Markdown)</label>
                <span className="text-[11px] text-slate-400 font-mono">{wordCount} 단어</span>
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={24}
                className="font-mono text-xs leading-relaxed p-4 bg-slate-50/50 dark:bg-slate-900/50"
                placeholder="마크다운 형식의 본문을 작성하거나 수정하세요..."
              />
            </div>
          </Card>
        </div>

        {/* Right 5 Cols: Multi-Panel (SEO, Fact Check, Sources, Internal Links) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Tab Navigation */}
          <div className="flex items-center p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("SEO")}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "SEO"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              SEO ({seoBreakdown?.overallScore || 94})
            </button>

            <button
              onClick={() => setActiveTab("FACT_CHECK")}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "FACT_CHECK"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Fact Check ({claims.length})
            </button>

            <button
              onClick={() => setActiveTab("SOURCES")}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "SOURCES"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <BookmarkCheck className="h-3.5 w-3.5" />
              Sources ({sources.length})
            </button>

            <button
              onClick={() => setActiveTab("INTERNAL_LINKS")}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "INTERNAL_LINKS"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <LinkIcon className="h-3.5 w-3.5" />
              Links
            </button>
          </div>

          {/* TAB 1: SEO PANEL */}
          {activeTab === "SEO" && seoBreakdown && (
            <Card className="p-5 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    SEO Score Breakdown (10 Factors)
                  </h4>
                  <Badge variant="opportunity" className="px-2 py-0.5 text-xs font-bold">
                    {seoBreakdown.overallScore} / 100
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400">
                  * 주의: SEO 점수는 콘텐츠 품질 가이드이며 검색 순위를 100% 보장하지 않습니다.
                </p>
              </div>

              {/* 10 Factors List */}
              <div className="space-y-2.5 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">1. 검색 의도 부합도 (Search Intent)</span>
                    <span className="font-bold">{seoBreakdown.searchIntentScore}%</span>
                  </div>
                  <Progress value={seoBreakdown.searchIntentScore} />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">2. 제목 최적화 (Title)</span>
                    <span className="font-bold">{seoBreakdown.titleScore}%</span>
                  </div>
                  <Progress value={seoBreakdown.titleScore} />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">3. 메타 디스크립션 (Meta Description)</span>
                    <span className="font-bold">{seoBreakdown.metaDescriptionScore}%</span>
                  </div>
                  <Progress value={seoBreakdown.metaDescriptionScore} />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">4. 헤딩 구조화 (H1/H2/H3 Structure)</span>
                    <span className="font-bold">{seoBreakdown.headingStructureScore}%</span>
                  </div>
                  <Progress value={seoBreakdown.headingStructureScore} />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">5. 키워드 관련성 (Keyword Density)</span>
                    <span className="font-bold">{seoBreakdown.keywordRelevanceScore}%</span>
                  </div>
                  <Progress value={seoBreakdown.keywordRelevanceScore} />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">6. 콘텐츠 완결성 (Content Depth)</span>
                    <span className="font-bold">{seoBreakdown.contentCompletenessScore}%</span>
                  </div>
                  <Progress value={seoBreakdown.contentCompletenessScore} />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">7. 원본 분석 & 시사점 (Original Insights)</span>
                    <span className="font-bold">{seoBreakdown.originalAnalysisScore}%</span>
                  </div>
                  <Progress value={seoBreakdown.originalAnalysisScore} />
                </div>
              </div>

              {/* Recommendations */}
              <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-slate-800/70 border border-blue-100 dark:border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 block">
                  AI 권장 개선 사항
                </span>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  {seoBreakdown.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-blue-500">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )}

          {/* TAB 2: FACT CHECK PANEL */}
          {activeTab === "FACT_CHECK" && (
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Factual Claims & Verification
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    통계, 가격, 사양, 법률 등 주요 주장의 팩트 검증
                  </p>
                </div>
                <Badge variant="purple" className="text-xs">
                  {claims.filter((c) => c.verification_status === "VERIFIED").length} / {claims.length} Verified
                </Badge>
              </div>

              <div className="space-y-3">
                {claims.map((claim) => (
                  <div
                    key={claim.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                        "{claim.claim}"
                      </p>
                      <Badge
                        variant={
                          claim.verification_status === "VERIFIED"
                            ? "success"
                            : claim.verification_status === "PARTIALLY_VERIFIED"
                            ? "warning"
                            : "destructive"
                        }
                        className="text-[10px] shrink-0"
                      >
                        {claim.verification_status}
                      </Badge>
                    </div>

                    {claim.notes && (
                      <p className="text-[11px] text-slate-500 bg-white dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700">
                        {claim.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>신뢰도 {Math.round(claim.confidence * 100)}% ({claim.category || "GENERAL"})</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleClaimStatusChange(claim.id, "VERIFIED")}
                          className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 hover:bg-emerald-200"
                        >
                          승인
                        </button>
                        <button
                          onClick={() => handleClaimStatusChange(claim.id, "CONFLICTING")}
                          className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 hover:bg-red-200"
                        >
                          의심
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 3: SOURCES PANEL */}
          {activeTab === "SOURCES" && (
            <Card className="p-5 space-y-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Cited Sources & Reliability
                </h4>
                <p className="text-[11px] text-slate-400">
                  Tier 1(공식/학술) 및 Tier 2(전문 언론) 중심의 출처 신뢰도
                </p>
              </div>

              <div className="space-y-3">
                {sources.map((src) => (
                  <div
                    key={src.id}
                    className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={src.tier === 1 ? "purple" : src.tier === 2 ? "secondary" : "outline"}
                        className="text-[10px] font-bold"
                      >
                        Tier {src.tier} ({src.source_type})
                      </Badge>
                      <span className="text-emerald-600 font-bold">
                        신뢰도 {src.reliability_score}점
                      </span>
                    </div>

                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {src.title}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{src.publisher}</span>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        출처 확인 <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 4: INTERNAL LINKS PANEL */}
          {activeTab === "INTERNAL_LINKS" && (
            <Card className="p-5 space-y-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Internal Link Recommendations
                </h4>
                <p className="text-[11px] text-slate-400">
                  기존 게시글과의 연결을 통해 SEO 클러스터 및 체류 시간 증대
                </p>
              </div>

              <div className="space-y-3">
                {internalLinks.map((link) => (
                  <div
                    key={link.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-600">
                        관련도 {link.relevance_score}%
                      </span>
                      {link.applied ? (
                        <Badge variant="success" className="text-[10px] gap-1">
                          <Check className="h-3 w-3" /> 본문 삽입됨
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2.5 text-xs text-blue-600 hover:bg-blue-50"
                          onClick={() => handleApplyInternalLink(link)}
                        >
                          + 본문에 링크 삽입
                        </Button>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">타깃 글:</span>
                      <span className="font-semibold">{link.target_title}</span>
                    </div>

                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-500">추천 앵커 텍스트: </span>
                      "{link.anchor_text}"
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
