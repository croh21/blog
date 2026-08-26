"use client";

import { useState, useEffect } from "react";
import { Plus, X, BookmarkCheck, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Source, SourceTier, SourceType } from "@/types";

interface SourceManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleId: string;
  attachedSources: Source[];
  onSourcesUpdated: () => void;
}

export function SourceManageModal({
  isOpen,
  onClose,
  articleId,
  attachedSources,
  onSourcesUpdated,
}: SourceManageModalProps) {
  const [allSources, setAllSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // New source form state
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newPublisher, setNewPublisher] = useState("");
  const [newSourceType, setNewSourceType] = useState<SourceType>("OFFICIAL");
  const [newTier, setNewTier] = useState<SourceTier>(1);

  useEffect(() => {
    if (isOpen) {
      loadAllSources();
    }
  }, [isOpen]);

  async function loadAllSources() {
    try {
      const res = await fetch("/api/sources");
      if (res.ok) {
        const data = await res.json();
        setAllSources(data.sources || []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggleSource(source: Source) {
    const isAttached = attachedSources.some((s) => s.id === source.id);
    try {
      if (isAttached) {
        await fetch(`/api/articles/${articleId}/sources?sourceId=${source.id}`, {
          method: "DELETE",
        });
      } else {
        await fetch(`/api/articles/${articleId}/sources`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sourceId: source.id }),
        });
      }
      onSourcesUpdated();
    } catch (err) {
      console.error("Failed to toggle source:", err);
    }
  }

  async function handleCreateSource(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle || !newUrl) return;

    setLoading(true);
    try {
      // 1. Create source
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          url: newUrl,
          publisher: newPublisher || "공식 문서",
          source_type: newSourceType,
          tier: newTier,
        }),
      });
      const data = await res.json();

      if (data.success && data.source) {
        // 2. Attach to article
        await fetch(`/api/articles/${articleId}/sources`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sourceId: data.source.id }),
        });

        // Reset form
        setNewTitle("");
        setNewUrl("");
        setNewPublisher("");
        setShowCreateForm(false);
        await loadAllSources();
        onSourcesUpdated();
      }
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookmarkCheck className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-base">글 출처(Sources) 연결 및 관리</h3>
              <p className="text-xs text-slate-400">품질 게이트: Tier 1~2 출처 2개 이상 필요</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              출처 레지스트리 목록 ({allSources.length}개)
            </span>
            <Button
              size="sm"
              variant={showCreateForm ? "secondary" : "outline"}
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="text-xs gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              {showCreateForm ? "목록으로" : "신규 출처 등록"}
            </Button>
          </div>

          {/* Create New Source Form */}
          {showCreateForm && (
            <form onSubmit={handleCreateSource} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="font-bold text-sm block">새로운 신뢰 출처 등록</span>
              
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500">출처명 / 논문 제목 *</label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: Anthropic Model Context Protocol Whitepaper"
                  className="text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500">URL 링크 *</label>
                  <Input
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://..."
                    className="text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500">발행처 / 기관</label>
                  <Input
                    value={newPublisher}
                    onChange={(e) => setNewPublisher(e.target.value)}
                    placeholder="예: Anthropic / TechCrunch"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500">출처 유형 (Type)</label>
                  <select
                    value={newSourceType}
                    onChange={(e) => {
                      const type = e.target.value as SourceType;
                      setNewSourceType(type);
                      setNewTier(type === "OFFICIAL" || type === "RESEARCH" || type === "GOVERNMENT" ? 1 : 2);
                    }}
                    className="flex h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="OFFICIAL">OFFICIAL (공식 백서/문서)</option>
                    <option value="RESEARCH">RESEARCH (학술 연구/리포트)</option>
                    <option value="GOVERNMENT">GOVERNMENT (정부 정책/통계)</option>
                    <option value="NEWS">NEWS (전문 테크 언론)</option>
                    <option value="COMPANY">COMPANY (기업 발표)</option>
                    <option value="COMMUNITY">COMMUNITY (커뮤니티/블로그)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500">신뢰도 등급 (Tier)</label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(parseInt(e.target.value) as SourceTier)}
                    className="flex h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value={1}>Tier 1 (공식/학술 95점+)</option>
                    <option value={2}>Tier 2 (전문 언론 80점+)</option>
                    <option value={3}>Tier 3 (블로그/커뮤니티 55점)</option>
                    <option value={4}>Tier 4 (기타 미확인 30점)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateForm(false)}>
                  취소
                </Button>
                <Button type="submit" variant="gradient" size="sm" disabled={loading}>
                  {loading ? "저장 중..." : "출처 등록 및 글에 연결"}
                </Button>
              </div>
            </form>
          )}

          {/* Sources List */}
          <div className="space-y-2">
            {allSources.map((src) => {
              const isAttached = attachedSources.some((s) => s.id === src.id);
              return (
                <div
                  key={src.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                    isAttached
                      ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800"
                      : "bg-slate-50/40 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800"
                  }`}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge
                        variant={src.tier === 1 ? "purple" : src.tier === 2 ? "secondary" : "outline"}
                        className="text-[10px]"
                      >
                        Tier {src.tier} • {src.source_type}
                      </Badge>
                      <span className="font-bold text-emerald-600 text-[11px]">
                        신뢰도 {src.reliability_score}점
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {src.title}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {src.publisher} • <a href={src.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{src.url}</a>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isAttached ? "default" : "outline"}
                    onClick={() => handleToggleSource(src)}
                    className="shrink-0 h-8 px-3 text-xs gap-1"
                  >
                    {isAttached ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> 연결됨
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" /> 연결
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Button variant="default" size="sm" onClick={onClose}>
            완료
          </Button>
        </div>
      </div>
    </div>
  );
}
