"use client";

import { useState, useEffect } from "react";
import { BookmarkCheck, Shield, Plus, ExternalLink, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Source } from "@/types";
import { formatDate } from "@/lib/utils";

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);

  useEffect(() => {
    fetch("/api/articles")
      .then((r) => r.json())
      .then(() => {
        // Mock / DB sources
        setSources([
          {
            id: "src-1",
            title: "Model Context Protocol Specification & Architecture",
            url: "https://modelcontextprotocol.io",
            publisher: "Anthropic / MCP Working Group",
            source_type: "OFFICIAL",
            tier: 1,
            reliability_score: 98,
            published_at: "2025-01-15T00:00:00Z",
            accessed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          },
          {
            id: "src-2",
            title: "State of AI Agents Report 2026",
            url: "https://research.techplatform.example/agents-2026",
            publisher: "AI Research Institute",
            source_type: "RESEARCH",
            tier: 1,
            reliability_score: 94,
            published_at: "2026-02-10T00:00:00Z",
            accessed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          },
          {
            id: "src-3",
            title: "The Shift from Search to Answer Engines: Market Overview",
            url: "https://searchengineland.com/aio-impact",
            publisher: "Search Engine Land",
            source_type: "NEWS",
            tier: 2,
            reliability_score: 85,
            published_at: "2026-02-18T00:00:00Z",
            accessed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          },
        ]);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <BookmarkCheck className="h-6 w-6 text-blue-600" />
            Source Registry & Tier Reliability Radar
          </h1>
          <p className="text-sm text-slate-500">
            Tier 1(정부/학술/공식문서)부터 Tier 4(미확인)까지 출처의 신뢰성 등급 관리
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-purple-500">
          <span className="text-xs font-semibold text-slate-500">Tier 1: 공식 / 학술</span>
          <div className="text-2xl font-bold mt-1">95점+ 신뢰도</div>
          <p className="text-[11px] text-slate-400 mt-1">정부 기관, 원 연구, 기업 공식 발표</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-blue-500">
          <span className="text-xs font-semibold text-slate-500">Tier 2: 주요 전문 언론</span>
          <div className="text-2xl font-bold mt-1">80~94점 신뢰도</div>
          <p className="text-[11px] text-slate-400 mt-1">Search Engine Land, TechCrunch 등</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500">
          <span className="text-xs font-semibold text-slate-500">Tier 3: 커뮤니티 & 블로그</span>
          <div className="text-2xl font-bold mt-1">50~79점 신뢰도</div>
          <p className="text-[11px] text-slate-400 mt-1">추가 교차 검증 필요</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500">
          <span className="text-xs font-semibold text-slate-500">Tier 4: 미확인 출처</span>
          <div className="text-2xl font-bold mt-1">&lt; 50점 신뢰도</div>
          <p className="text-[11px] text-slate-400 mt-1">중요 사실 주장 인용 불가</p>
        </Card>
      </div>

      <div className="space-y-3">
        {sources.map((src) => (
          <Card key={src.id} className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant={src.tier === 1 ? "purple" : "secondary"}>
                    Tier {src.tier} • {src.source_type}
                  </Badge>
                  <span className="text-xs font-bold text-emerald-600">
                    신뢰도 {src.reliability_score}점
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {src.title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>발행처: {src.publisher}</span>
                  <span>최근 접근: {formatDate(src.accessed_at)}</span>
                </div>
              </div>

              <a
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="shrink-0"
              >
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  출처 방문 <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
