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
  Plus,
  Trash2,
  Lock,
  Wand2,
  Eye,
  Edit3,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { QualityGateBanner } from "@/components/articles/quality-gate-banner";
import { PublishPreviewModal } from "@/components/articles/publish-preview-modal";
import { SourceManageModal } from "@/components/articles/source-manage-modal";
import { MarkdownPreview } from "@/components/articles/markdown-preview";
import { NaverPasteHelper } from "@/components/articles/naver-paste-helper";
import {
  Article,
  ArticleClaim,
  InternalLinkRecommendation,
  SEOScoreBreakdown,
  Source,
} from "@/types";
import { QualityGateResult } from "@/lib/scoring/quality-gate";

export default function ArticleEditorPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [claims, setClaims] = useState<ArticleClaim[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [internalLinks, setInternalLinks] = useState<InternalLinkRecommendation[]>([]);
  const [seoBreakdown, setSeoBreakdown] = useState<SEOScoreBreakdown | null>(null);
  const [qualityGate, setQualityGate] = useState<QualityGateResult | null>(null);

  const [activeTab, setActiveTab] = useState<"SEO" | "FACT_CHECK" | "SOURCES" | "INTERNAL_LINKS">("SEO");
  const [viewMode, setViewMode] = useState<"EDIT" | "PREVIEW">("PREVIEW");
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [reanalyzingSeo, setReanalyzingSeo] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New claim modal state
  const [showAddClaim, setShowAddClaim] = useState(false);
  const [newClaimText, setNewClaimText] = useState("");
  const [newClaimCategory, setNewClaimCategory] = useState<"STATISTICS" | "PRICING" | "SPECS" | "LEGAL" | "GENERAL">("STATISTICS");

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
        setFeaturedImageUrl(data.article.featured_image_url || "");
        setClaims(data.claims || []);
        setSources(data.sources || []);
        setInternalLinks(data.internalLinks || []);
        setSeoBreakdown(data.seoBreakdown);
        setQualityGate(data.qualityGate);
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
        featured_image_url: featuredImageUrl,
        status: statusOverride || article?.status || "HUMAN_REVIEW",
      };

      const res = await fetch(`/api/articles/${articleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setArticle(data.article);
        setSeoBreakdown(data.seoBreakdown);
        setQualityGate(data.qualityGate);
        setNotification({ type: "success", text: "글 변경사항이 성공적으로 저장되었습니다." });
      } else {
        setNotification({ type: "error", text: data.error || "저장에 실패했습니다." });
      }
    } catch (err: any) {
      setNotification({ type: "error", text: err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setNotification(null), 4000);
    }
  }

  async function handleReanalyzeSeo() {
    setReanalyzingSeo(true);
    try {
      await handleSave();
      setNotification({ type: "success", text: "SEO 10대 요소 재분석이 완료되었습니다." });
    } finally {
      setReanalyzingSeo(false);
    }
  }

  async function handleApprove() {
    setApproving(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setArticle(data.article);
        setQualityGate(data.qualityGate);
        setNotification({ type: "success", text: "품질 게이트를 통과하여 승인(APPROVED)되었습니다!" });
      } else {
        setNotification({
          type: "error",
          text: `승인 실패: ${data.missingReasons?.join(", ") || data.error}`,
        });
      }
    } catch (err: any) {
      setNotification({ type: "error", text: err.message });
    } finally {
      setApproving(false);
      setTimeout(() => setNotification(null), 5000);
    }
  }

  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  async function handleConfirmPublish(platform: "GITHUB_BLOG" | "NAVER_BLOG" | "WORDPRESS" | "TISTORY" = "NAVER_BLOG", visibility: 0 | 3 = 3) {
    setPublishing(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, visibility }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setArticle(data.article);
        setPublishedUrl(data.publishResult?.url || data.publishResult?.link || null);
        setNotification({
          type: "success",
          text: data.message || "글이 성공적으로 발행되었습니다!",
        });
      } else {
        setNotification({ type: "error", text: data.error || "발행에 실패했습니다." });
      }
    } catch (err: any) {
      setNotification({ type: "error", text: err.message });
    } finally {
      setPublishing(false);
    }
  }

  async function handleMarkPublished() {
    await handleSave("PUBLISHED");
    setNotification({
      type: "success",
      text: "네이버 블로그 등록 완료로 상태가 변경되었습니다!",
    });
  }

  async function handleRegenerateArticle(mode: "FULL" | "SEO") {
    setRegenerating(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      if (res.ok) {
        await loadArticleData();
        setNotification({ type: "success", text: data.message });
      }
    } finally {
      setRegenerating(false);
    }
  }

  async function handleClaimStatusChange(claimId: string, newStatus: ArticleClaim["verification_status"]) {
    try {
      const res = await fetch(`/api/articles/${articleId}/claims`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: claimId, verification_status: newStatus }),
      });
      if (res.ok) {
        await loadArticleData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!newClaimText) return;

    try {
      const res = await fetch(`/api/articles/${articleId}/claims`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claim: newClaimText,
          category: newClaimCategory,
          verification_status: "VERIFIED",
          confidence: 0.95,
        }),
      });
      if (res.ok) {
        setNewClaimText("");
        setShowAddClaim(false);
        await loadArticleData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteClaim(claimId: string) {
    try {
      const res = await fetch(`/api/articles/${articleId}/claims?claimId=${claimId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadArticleData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  function handleApplyInternalLink(link: InternalLinkRecommendation) {
    const markdownLink = `[${link.anchor_text}](/${link.target_slug})`;
    setContent((prev) => `${prev}\n\n> 💡 **관련 콘텐츠 추천**: ${markdownLink}`);
    setInternalLinks((prev) =>
      prev.map((l) => (l.id === link.id ? { ...l, applied: true } : l))
    );
  }

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
          콘텐츠 및 품질 게이트 로딩 중...
        </div>
      </div>
    );
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const charCount = content.length;
  const isQualityPassed = qualityGate?.passed ?? false;

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/articles">
              <Button variant="ghost" size="sm" className="h-8 px-2 gap-1 text-xs">
                <ChevronLeft className="h-4 w-4" /> 글 목록
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
              {wordCount} 단어 (약 {charCount}자)
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRegenerateArticle("FULL")}
              disabled={regenerating}
              className="text-xs gap-1.5"
            >
              <Wand2 className="h-3.5 w-3.5 text-purple-600" />
              {regenerating ? "AI 작성 중..." : "AI 본문 재생성"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave()}
              disabled={saving}
              className="text-xs gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "저장 중..." : "임시 저장"}
            </Button>

            {/* Quality Gated Approval Button */}
            <div className="relative group">
              <Button
                variant={isQualityPassed ? "secondary" : "outline"}
                size="sm"
                onClick={handleApprove}
                disabled={!isQualityPassed || approving || article.status === "APPROVED"}
                className={`text-xs font-semibold gap-1.5 ${
                  isQualityPassed
                    ? "text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 hover:bg-purple-200"
                    : "opacity-50 cursor-not-allowed border-amber-300"
                }`}
              >
                {!isQualityPassed && <Lock className="h-3 w-3 text-amber-500" />}
                <CheckCircle2 className="h-3.5 w-3.5" />
                {approving ? "승인 검증 중..." : "Approve (사람 승인)"}
              </Button>
            </div>

            {/* Blog Publish Button */}
            <Button
              variant="gradient"
              size="sm"
              onClick={() => setPublishModalOpen(true)}
              disabled={!isQualityPassed}
              className={`text-xs font-bold gap-1.5 shadow-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 ${
                !isQualityPassed ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {!isQualityPassed && <Lock className="h-3 w-3 text-white/80" />}
              <Send className="h-3.5 w-3.5" />
              네이버 블로그 / 배포 발행
            </Button>
          </div>
        </div>

        {/* Notifications */}
        {notification && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-center justify-between animate-in fade-in ${
              notification.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 text-emerald-800 dark:text-emerald-300"
                : "bg-red-50 dark:bg-red-950/50 border-red-200 text-red-800 dark:text-red-300"
            }`}
          >
            <span>{notification.text}</span>
            <button onClick={() => setNotification(null)} className="text-slate-400">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Quality Gate Banner */}
        <QualityGateBanner qualityGate={qualityGate} />
      </div>

      {/* Naver Blog Quick Paste Helper */}
      <NaverPasteHelper article={{ ...article, title, content }} onMarkPublished={handleMarkPublished} />

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Article Editor / Visual Preview */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 space-y-4">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode("PREVIEW")}
                  className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    viewMode === "PREVIEW"
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" /> 실제 블로그 뷰 (이미지 렌더링)
                </button>
                <button
                  onClick={() => setViewMode("EDIT")}
                  className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    viewMode === "EDIT"
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Edit3 className="h-3.5 w-3.5" /> 마크다운 원본 편집
                </button>
              </div>

              <span className="text-[11px] text-slate-400 font-mono">
                {wordCount} 단어 ({charCount}자)
              </span>
            </div>

            {/* Title & Slug Form */}
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
                placeholder="검색 결과에 노출될 70~160자 설명문..."
              />
            </div>

            {/* View Mode: PREVIEW vs EDIT */}
            {viewMode === "PREVIEW" ? (
              <div className="p-4 sm:p-6 bg-slate-50/70 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 min-h-[500px]">
                <MarkdownPreview content={content} />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">본문 내용 (Markdown 원본)</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={26}
                  className="font-mono text-xs leading-relaxed p-4 bg-slate-50/50 dark:bg-slate-900/50"
                  placeholder="마크다운 형식의 본문을 작성하거나 수정하세요..."
                />
              </div>
            )}
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
              SEO ({seoBreakdown?.overallScore || article.seo_score})
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
              출처 ({sources.length})
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
              링크 ({internalLinks.length})
            </button>
          </div>

          {/* TAB 1: SEO PANEL */}
          {activeTab === "SEO" && seoBreakdown && (
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm">SEO 10대 요소 정밀 평가</h4>
                  <p className="text-[11px] text-slate-400">품질 기준: 75점 이상 필요</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleReanalyzeSeo}
                    disabled={reanalyzingSeo}
                    className="h-7 text-xs gap-1"
                  >
                    <RefreshCw className={`h-3 w-3 ${reanalyzingSeo ? "animate-spin" : ""}`} />
                    SEO 재분석
                  </Button>
                  <Badge variant="opportunity" className="px-2 py-0.5 text-xs font-bold">
                    {seoBreakdown.overallScore} / 100
                  </Badge>
                </div>
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
                    <span className="text-slate-600 dark:text-slate-300">3. 메타 디스크립션 (Meta)</span>
                    <span className="font-bold">{seoBreakdown.metaDescriptionScore}%</span>
                  </div>
                  <Progress value={seoBreakdown.metaDescriptionScore} />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">4. 헤딩 구조화 (H1/H2/H3)</span>
                    <span className="font-bold">{seoBreakdown.headingStructureScore}%</span>
                  </div>
                  <Progress value={seoBreakdown.headingStructureScore} />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">5. 키워드 관련성 (Density)</span>
                    <span className="font-bold">{seoBreakdown.keywordRelevanceScore}%</span>
                  </div>
                  <Progress value={seoBreakdown.keywordRelevanceScore} />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">6. 콘텐츠 완결성 (분량)</span>
                    <span className="font-bold">{seoBreakdown.contentCompletenessScore}%</span>
                  </div>
                  <Progress value={seoBreakdown.contentCompletenessScore} />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">7. 외부 출처 인용 (Sources)</span>
                    <span className="font-bold">{seoBreakdown.externalSourcesScore}%</span>
                  </div>
                  <Progress value={seoBreakdown.externalSourcesScore} />
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
                  <h4 className="font-bold text-sm">팩트체크 및 주장 검증</h4>
                  <p className="text-[11px] text-slate-400">품질 기준: 신뢰도 90% 이상 & 미검증 0건</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddClaim(!showAddClaim)}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="h-3 w-3" /> 주장 추가
                </Button>
              </div>

              {/* Add Claim Form */}
              {showAddClaim && (
                <form onSubmit={handleAddClaim} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border space-y-2 text-xs">
                  <Input
                    value={newClaimText}
                    onChange={(e) => setNewClaimText(e.target.value)}
                    placeholder="검증할 사실 주장 문장..."
                    className="text-xs"
                    required
                  />
                  <div className="flex justify-between items-center">
                    <select
                      value={newClaimCategory}
                      onChange={(e) => setNewClaimCategory(e.target.value as any)}
                      className="h-8 rounded border px-2 text-xs bg-white dark:bg-slate-900"
                    >
                      <option value="STATISTICS">통계/수치</option>
                      <option value="PRICING">가격/비용</option>
                      <option value="SPECS">기술 사양</option>
                      <option value="LEGAL">법률/정책</option>
                      <option value="GENERAL">일반 사실</option>
                    </select>
                    <div className="flex gap-1.5">
                      <Button type="button" size="sm" variant="ghost" onClick={() => setShowAddClaim(false)}>
                        취소
                      </Button>
                      <Button type="submit" size="sm" variant="gradient">
                        추가
                      </Button>
                    </div>
                  </div>
                </form>
              )}

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
                      <button
                        onClick={() => handleDeleteClaim(claim.id)}
                        className="text-slate-400 hover:text-red-500 p-0.5"
                        title="주장 삭제"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={
                            claim.verification_status === "VERIFIED"
                              ? "success"
                              : claim.verification_status === "PARTIALLY_VERIFIED"
                              ? "warning"
                              : "destructive"
                          }
                          className="text-[10px]"
                        >
                          {claim.verification_status}
                        </Badge>
                        <span className="text-slate-400">
                          {claim.category} • 신뢰도 {Math.round(claim.confidence * 100)}%
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleClaimStatusChange(claim.id, "VERIFIED")}
                          className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 hover:bg-emerald-200 text-[10px] font-bold"
                        >
                          승인 (VERIFIED)
                        </button>
                        <button
                          onClick={() => handleClaimStatusChange(claim.id, "UNVERIFIED")}
                          className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 hover:bg-amber-200 text-[10px]"
                        >
                          미검증
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
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm">연결된 출처 ({sources.length}개)</h4>
                  <p className="text-[11px] text-slate-400">품질 기준: Tier 1~2 출처 2개 이상 필수</p>
                </div>
                <Button
                  size="sm"
                  variant="gradient"
                  onClick={() => setSourceModalOpen(true)}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="h-3 w-3" /> 출처 관리 / 연결
                </Button>
              </div>

              <div className="space-y-2.5">
                {sources.map((src) => (
                  <div
                    key={src.id}
                    className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs bg-white dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={src.tier === 1 ? "purple" : src.tier === 2 ? "secondary" : "outline"}
                        className="text-[10px] font-bold"
                      >
                        Tier {src.tier} ({src.source_type})
                      </Badge>
                      <span className="text-emerald-600 font-bold text-[11px]">
                        신뢰도 {src.reliability_score}점
                      </span>
                    </div>

                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {src.title}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
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
                <h4 className="font-bold text-sm">내부 링크 추천 ({internalLinks.length}개)</h4>
                <p className="text-[11px] text-slate-400">SEO 클러스터 및 도메인 권위 향상</p>
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
                      <span className="text-[10px] text-slate-400 block">타깃 콘텐츠:</span>
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

      {/* Blog Publish Preview Modal */}
      <PublishPreviewModal
        isOpen={publishModalOpen}
        onClose={() => {
          setPublishModalOpen(false);
          setPublishedUrl(null);
        }}
        onConfirm={handleConfirmPublish}
        article={article}
        loading={publishing}
        publishedUrl={publishedUrl}
      />

      {/* Sources Management Modal */}
      <SourceManageModal
        isOpen={sourceModalOpen}
        onClose={() => setSourceModalOpen(false)}
        articleId={articleId}
        attachedSources={sources}
        onSourcesUpdated={loadArticleData}
      />
    </div>
  );
}
