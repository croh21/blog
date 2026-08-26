"use client";

import { Search, ShieldAlert, CheckCircle2, FileText, Layers } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SEOOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <Search className="h-6 w-6 text-cyan-600" />
          SEO & AEO Intelligence Engine
        </h1>
        <p className="text-sm text-slate-500">
          검색 의도, 메타데이터, 헤딩 계층, AEO 인용 최적화 및 내부 링크 10대 평가 기준
        </p>
      </div>

      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">SEO 점수에 대한 안내</span>
          TrendPilot의 SEO Score(0~100)는 최신 검색엔진 및 AI 답변 엔진(AEO)의 가이드라인에 맞춘 품질 지표입니다. 높은 점수가 특정 키워드의 1위 순위를 무조건 보장하는 것은 아니며, 독자 중심의 실질적 가치와 차별화가 핵심입니다.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 1. Search Intent & Title Optimization
          </CardTitle>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            사용자가 검색창에 입력하는 실제 의도(정보, 비교, 실무 해결)를 분석하고, 25~60자의 제목에 핵심 키워드와 후킹 요소를 결합합니다.
          </p>
        </Card>

        <Card className="p-5">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 2. Heading Structure (H1, H2, H3)
          </CardTitle>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            H1은 단일 메인 타이틀, H2는 3개 이상의 논리적 서브섹션, H3은 세부 실무 내용으로 구성하여 검색 크롤러와 독자의 스캔 가독성을 높입니다.
          </p>
        </Card>

        <Card className="p-5">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 3. Fact Citation & AEO Grounding
          </CardTitle>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Perplexity, ChatGPT Search 등 차세대 답변 엔진이 신뢰할 수 있도록 Tier 1 공식 백서 및 연구 출처를 명시하여 인용 확률을 극대화합니다.
          </p>
        </Card>

        <Card className="p-5">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 4. Topic Clustering & Internal Linking
          </CardTitle>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Pillar 글을 중심으로 Cluster 글 간의 내부 링크를 자동으로 연결하여 블로그 전체의 도메인 권위(Authority)를 높입니다.
          </p>
        </Card>
      </div>
    </div>
  );
}
