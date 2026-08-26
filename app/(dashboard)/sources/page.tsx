"use client";

import { useState, useEffect } from "react";
import { BookmarkCheck, Shield, Plus, ExternalLink, Trash2, Edit3, Filter, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Source, SourceTier, SourceType } from "@/types";
import { formatDate } from "@/lib/utils";

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedTier, setSelectedTier] = useState<number | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [publisher, setPublisher] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("OFFICIAL");
  const [tier, setTier] = useState<SourceTier>(1);

  useEffect(() => {
    loadSources();
  }, []);

  async function loadSources() {
    setLoading(true);
    try {
      const res = await fetch("/api/sources");
      if (res.ok) {
        const data = await res.json();
        setSources(data.sources || []);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditingSource(null);
    setTitle("");
    setUrl("");
    setPublisher("");
    setSourceType("OFFICIAL");
    setTier(1);
    setShowModal(true);
  }

  function handleOpenEdit(src: Source) {
    setEditingSource(src);
    setTitle(src.title);
    setUrl(src.url);
    setPublisher(src.publisher);
    setSourceType(src.source_type);
    setTier(src.tier);
    setShowModal(true);
  }

  async function handleSaveSource(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !url) return;

    try {
      const method = editingSource ? "PUT" : "POST";
      const payload = {
        ...(editingSource ? { id: editingSource.id } : {}),
        title,
        url,
        publisher: publisher || "공식 기관",
        source_type: sourceType,
        tier,
      };

      const res = await fetch("/api/sources", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        await loadSources();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteSource(id: string) {
    if (!confirm("이 출처를 정말 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/sources?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await loadSources();
      }
    } catch (err) {
      console.error(err);
    }
  }

  const filteredSources = sources.filter((s) => {
    const matchesTier = selectedTier === "ALL" || s.tier === selectedTier;
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.publisher.toLowerCase().includes(search.toLowerCase()) ||
      s.url.toLowerCase().includes(search.toLowerCase());
    return matchesTier && matchesSearch;
  });

  const tier1Count = sources.filter((s) => s.tier === 1).length;
  const tier2Count = sources.filter((s) => s.tier === 2).length;
  const tier3Count = sources.filter((s) => s.tier === 3).length;
  const tier4Count = sources.filter((s) => s.tier === 4).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <BookmarkCheck className="h-6 w-6 text-blue-600" />
            Source Registry & Tier Reliability Management
          </h1>
          <p className="text-sm text-slate-500">
            Tier 1(정부/학술/공식문서)부터 Tier 4(미확인)까지 출처의 신뢰성 등급 및 인용 데이터 관리
          </p>
        </div>

        <Button onClick={handleOpenCreate} variant="gradient" className="gap-2 font-semibold shadow-md">
          <Plus className="h-4 w-4" />
          신규 출처 등록
        </Button>
      </div>

      {/* Tier Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card
          onClick={() => setSelectedTier(selectedTier === 1 ? "ALL" : 1)}
          className={`p-4 border-l-4 border-l-purple-500 cursor-pointer transition-all ${
            selectedTier === 1 ? "ring-2 ring-purple-500 bg-purple-50/40" : ""
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500">Tier 1: 공식 / 학술</span>
            <Badge variant="purple">{tier1Count}개</Badge>
          </div>
          <div className="text-2xl font-bold mt-1">95점+ 신뢰도</div>
          <p className="text-[11px] text-slate-400 mt-1">정부 기관, 원 연구, 기업 공식 발표</p>
        </Card>

        <Card
          onClick={() => setSelectedTier(selectedTier === 2 ? "ALL" : 2)}
          className={`p-4 border-l-4 border-l-blue-500 cursor-pointer transition-all ${
            selectedTier === 2 ? "ring-2 ring-blue-500 bg-blue-50/40" : ""
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500">Tier 2: 주요 전문 언론</span>
            <Badge variant="secondary">{tier2Count}개</Badge>
          </div>
          <div className="text-2xl font-bold mt-1">80~94점 신뢰도</div>
          <p className="text-[11px] text-slate-400 mt-1">Search Engine Land, TechCrunch 등</p>
        </Card>

        <Card
          onClick={() => setSelectedTier(selectedTier === 3 ? "ALL" : 3)}
          className={`p-4 border-l-4 border-l-amber-500 cursor-pointer transition-all ${
            selectedTier === 3 ? "ring-2 ring-amber-500 bg-amber-50/40" : ""
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500">Tier 3: 커뮤니티 & 블로그</span>
            <Badge variant="warning">{tier3Count}개</Badge>
          </div>
          <div className="text-2xl font-bold mt-1">50~79점 신뢰도</div>
          <p className="text-[11px] text-slate-400 mt-1">추가 교차 검증 필요</p>
        </Card>

        <Card
          onClick={() => setSelectedTier(selectedTier === 4 ? "ALL" : 4)}
          className={`p-4 border-l-4 border-l-red-500 cursor-pointer transition-all ${
            selectedTier === 4 ? "ring-2 ring-red-500 bg-red-50/40" : ""
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500">Tier 4: 미확인 출처</span>
            <Badge variant="destructive">{tier4Count}개</Badge>
          </div>
          <div className="text-2xl font-bold mt-1">&lt; 50점 신뢰도</div>
          <p className="text-[11px] text-slate-400 mt-1">중요 사실 주장 인용 불가</p>
        </Card>
      </div>

      {/* Filter */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="출처 제목, 발행처, URL 검색..."
              className="text-xs"
            />
          </div>
          <div>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
              className="flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
            >
              <option value="ALL">전체 등급 (All Tiers)</option>
              <option value={1}>Tier 1 (공식/학술)</option>
              <option value={2}>Tier 2 (전문 언론)</option>
              <option value={3}>Tier 3 (커뮤니티)</option>
              <option value={4}>Tier 4 (미확인)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Sources List */}
      <div className="space-y-3">
        {filteredSources.map((src) => (
          <Card key={src.id} className="p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant={src.tier === 1 ? "purple" : src.tier === 2 ? "secondary" : "outline"}>
                    Tier {src.tier} • {src.source_type}
                  </Badge>
                  <span className="text-xs font-bold text-emerald-600">
                    신뢰도 {src.reliability_score}점
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">
                  {src.title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>발행처: {src.publisher}</span>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    링크 방문 <ExternalLink className="h-3 w-3" />
                  </a>
                  <span>등록일: {formatDate(src.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => handleOpenEdit(src)} className="h-8 px-2.5 text-xs gap-1">
                  <Edit3 className="h-3.5 w-3.5" /> 수정
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteSource(src.id)}
                  className="h-8 px-2.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> 삭제
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal for Add / Edit Source */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingSource ? "출처 정보 수정" : "새로운 신뢰 출처 등록"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSource} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-500">출처명 / 논문 제목 *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: Anthropic MCP Protocol Specification"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-500">URL *</label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-500">발행처 / 기관</label>
                <Input
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  placeholder="예: Anthropic / TechCrunch"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500">출처 유형 (Type)</label>
                  <select
                    value={sourceType}
                    onChange={(e) => {
                      const type = e.target.value as SourceType;
                      setSourceType(type);
                      setTier(type === "OFFICIAL" || type === "RESEARCH" || type === "GOVERNMENT" ? 1 : 2);
                    }}
                    className="flex h-9 w-full rounded-lg border bg-white dark:bg-slate-900 px-3 py-1 text-xs"
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
                  <label className="font-semibold text-slate-500">신뢰도 등급 (Tier)</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(parseInt(e.target.value) as SourceTier)}
                    className="flex h-9 w-full rounded-lg border bg-white dark:bg-slate-900 px-3 py-1 text-xs"
                  >
                    <option value={1}>Tier 1 (공식/학술 95점+)</option>
                    <option value={2}>Tier 2 (전문 언론 80점+)</option>
                    <option value={3}>Tier 3 (블로그/커뮤니티 55점)</option>
                    <option value={4}>Tier 4 (기타 미확인 30점)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)}>
                  취소
                </Button>
                <Button type="submit" variant="gradient" size="sm">
                  {editingSource ? "수정 완료" : "등록"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
