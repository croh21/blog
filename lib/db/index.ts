import {
  Article,
  ArticleClaim,
  ArticleSource,
  Category,
  InternalLinkRecommendation,
  ScoringWeights,
  Source,
  Topic,
  Trend,
  AIUsageLog,
} from "@/types";
import { nanoid } from "nanoid";
import { DEFAULT_SCORING_WEIGHTS } from "@/lib/scoring/trend-scorer";
import { loadDataFromFile, saveDataToFile } from "./storage";

interface DatabaseSchema {
  categories: Category[];
  trends: Trend[];
  topics: Topic[];
  sources: Source[];
  articles: Article[];
  articleClaims: ArticleClaim[];
  articleSources: ArticleSource[];
  internalLinks: InternalLinkRecommendation[];
  aiUsageLogs: AIUsageLog[];
  settings: Record<string, any>;
}

const INITIAL_SEED_DATA: DatabaseSchema = {
  categories: [
    {
      id: "cat-health",
      name: "건강 & 웰니스",
      slug: "health-wellness",
      description: "저속노화(슬로우에이징), 혈당 관리, 수면 최적화 및 맞춤 영양 가이드",
      status: "ACTIVE",
      created_at: new Date().toISOString(),
    },
    {
      id: "cat-1",
      name: "AI & 생산성 테크",
      slug: "ai-tech",
      description: "업무 자동화, 차세대 AI 도구 및 스마트 라이프스타일",
      status: "ACTIVE",
      created_at: new Date().toISOString(),
    },
    {
      id: "cat-3",
      name: "디지털 마케팅 & 수익화",
      slug: "marketing-seo",
      description: "검색 최적화 및 블로그 트래픽 수익화 전략",
      status: "ACTIVE",
      created_at: new Date().toISOString(),
    },
  ],

  trends: [
    {
      id: "trend-1",
      title: "AI 에이전트 워크플로우 자동화 및 MCP 프로토콜 급부상",
      description: "Model Context Protocol(MCP)을 활용한 로컬 도구 연동 및 다중 에이전트 오케스트레이션이 기업 업무 환경을 재편하고 있습니다.",
      category_id: "cat-1",
      category_name: "AI & 자율 에이전트",
      source_url: "https://modelcontextprotocol.io",
      source_name: "Anthropic Tech Whitepaper",
      published_at: new Date().toISOString(),
      collected_at: new Date().toISOString(),
      trend_score: 96,
      search_growth: 92,
      search_volume: 85,
      competition_score: 35,
      commercial_score: 90,
      evergreen_score: 88,
      social_score: 82,
      opportunity_score: 93.4,
      status: "SELECTED",
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "trend-2",
      title: "Google AI Overviews와 블로그 검색 유입의 변화",
      description: "구글의 생성형 검색 결과(SGE/AIO) 도입으로 기존 단순 정보성 키워드의 CTR이 감소하고 심층 비교 분석 및 인용 중심 콘텐츠가 주목받고 있습니다.",
      category_id: "cat-3",
      category_name: "디지털 마케팅 & SEO",
      source_url: "https://searchengineland.com",
      source_name: "Search Engine Land",
      published_at: new Date().toISOString(),
      collected_at: new Date().toISOString(),
      trend_score: 89,
      search_growth: 84,
      search_volume: 78,
      competition_score: 45,
      commercial_score: 85,
      evergreen_score: 82,
      social_score: 75,
      opportunity_score: 88.2,
      status: "SELECTED",
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "trend-3",
      title: "차세대 로컬 오픈소스 LLM(DeepSeek / Llama 3.3) 기업 도입 가속화",
      description: "클라우드 비용 절감과 데이터 프라이버시를 위한 온프레미스 경량 고성능 LLM 모델 구축 사례가 급증하고 있습니다.",
      category_id: "cat-1",
      category_name: "AI & 자율 에이전트",
      source_url: "https://huggingface.co",
      source_name: "Hugging Face Research",
      published_at: new Date().toISOString(),
      collected_at: new Date().toISOString(),
      trend_score: 91,
      search_growth: 88,
      search_volume: 80,
      competition_score: 50,
      commercial_score: 82,
      evergreen_score: 85,
      social_score: 89,
      opportunity_score: 86.8,
      status: "DISCOVERED",
      created_at: new Date(Date.now() - 10800000).toISOString(),
    },
  ],

  topics: [
    {
      id: "topic-1",
      trend_id: "trend-1",
      title: "MCP(Model Context Protocol) 완벽 가이드: AI 에이전트와 도구를 연결하는 표준 프로토콜",
      primary_keyword: "MCP 프로토콜",
      secondary_keywords: ["Model Context Protocol", "AI 에이전트 도구 연동", "MCP 서버 구축", "Anthropic MCP"],
      search_intent: "정보 탐색 및 실무 튜토리얼 (Explainer + How-To)",
      content_type: "EXPLAINER",
      estimated_traffic: 12500,
      competition: "LOW",
      commercial_value: 92,
      evergreen_score: 90,
      opportunity_score: 94.2,
      why_this_topic: "최근 개발자와 테크 기획자 사이에서 검색 관심도가 187% 폭증했으나, 한글로 작성된 실전 구축 가이드 및 아키텍처 비교 자료가 희소하여 상위 랭킹 선점이 매우 유리합니다.",
      recommended_length: 2800,
      status: "APPROVED",
      created_at: new Date(Date.now() - 3000000).toISOString(),
    },
    {
      id: "topic-2",
      trend_id: "trend-1",
      title: "AI 에이전트 vs 기존 챗봇: 비즈니스 생산성을 10배 높이는 실전 차이점 분석",
      primary_keyword: "AI 에이전트 vs 챗봇",
      secondary_keywords: ["자율 AI 에이전트", "업무 자동화", "생성형 AI 비교", "LLM 에이전트 활용"],
      search_intent: "상업적 비교 분석 (Comparison)",
      content_type: "COMPARISON",
      estimated_traffic: 9800,
      competition: "MEDIUM",
      commercial_value: 95,
      evergreen_score: 88,
      opportunity_score: 91.5,
      why_this_topic: "기업 도입 결정권자들이 단순 대화형 챗봇에서 능동적 실행 에이전트로 전환하는 과정에서 ROI 비교 콘텐츠에 대한 상업적 가치가 매우 높습니다.",
      recommended_length: 2500,
      status: "PROPOSED",
      created_at: new Date(Date.now() - 2500000).toISOString(),
    },
  ],

  sources: [
    {
      id: "src-1",
      title: "Model Context Protocol Specification & Architecture",
      url: "https://modelcontextprotocol.io/introduction",
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
  ],

  articles: [
    {
      id: "art-1",
      topic_id: "topic-1",
      category_id: "cat-1",
      category_name: "AI & 자율 에이전트",
      title: "MCP(Model Context Protocol) 완벽 가이드: AI 에이전트 연결 표준과 실전 활용",
      slug: "mcp-model-context-protocol-guide",
      excerpt: "Anthropic이 오픈소스로 공개한 MCP(Model Context Protocol)의 핵심 아키텍처와 로컬 도구 연동 방법을 심층 분석합니다.",
      content: `# MCP(Model Context Protocol) 완벽 가이드: AI 에이전트 연결 표준과 실전 활용

## 핵심 요약 (Key Takeaways)
- **개념**: MCP는 LLM(언어 모델)과 로컬/원격 데이터 소스 및 도구(Tools)를 안전하고 표준화된 방식으로 연결하는 오픈 프로토콜입니다.
- **배경**: 기존의 커스텀 API 통합 방식의 파편화를 해결하고 플러그 앤 플레이 방식의 생태계를 구축합니다.
- **주요 구성요소**: Host Application(Claude Desktop, IDE), Client, 그리고 Server(DB, Git, Local Files).

---

## 1. What Happened? (무엇이 변화하고 있는가)
인공지능 모델이 단순한 텍스트 생성을 넘어 사용자의 실제 컴퓨터 환경과 시스템 도구를 조작하는 '자율 에이전트(Autonomous Agent)'로 진화하면서, 각 시스템 간 연결 규격의 표준화가 시급한 과제로 떠올랐습니다. 

Anthropic은 이를 해결하기 위해 **Model Context Protocol(MCP)**을 오픈소스로 발표하였으며, 이는 USB-C 포트가 다양한 전자기기의 연결 표준이 된 것처럼 AI 생태계의 유니버설 커넥터 역할을 수행하고 있습니다.

## 2. Why It Matters (왜 중요한가)
기존의 함수 호출(Function Calling)이나 개별 플러그인 방식은 LLM 모델마다 형식이 다르고 유지보수 비용이 높았습니다. MCP를 도입하면:
1. **단일 구현으로 다중 클라이언트 지원**: 한 번 작성한 MCP 서버는 모든 MCP 호환 클라이언트에서 즉시 작동합니다.
2. **보안과 격리**: 사용자의 명시적 승인 하에 로컬 자원에 접근하여 보안 리스크를 최소화합니다.
3. **확장성**: 데이터베이스, 로컬 파일시스템, Git 저장소 등을 손쉽게 AI 컨텍스트로 주입할 수 있습니다.

## 3. 핵심 아키텍처와 작동 원리
MCP는 클라이언트-서버 구조로 동작합니다.
- **Host**: 사용자가 상호작용하는 UI (예: IDE, AI Assistant)
- **Client**: Host 내부에서 서버와의 연결 상태와 권한을 중계하는 프로토콜 클라이언트
- **Server**: 특정 도구나 데이터(예: PostgreSQL, GitHub API, 파일 시스템)를 표준 프로토콜로 노출하는 경량 프로그램

## 4. 자주 묻는 질문 (FAQ)
### Q1. MCP는 특정 AI 모델(Claude 등)에만 종속되나요?
아닙니다. MCP는 오픈 프로토콜 규격으로 OpenAI, 오픈소스 LLM 등 모든 모델과 런타임에서 사용할 수 있습니다.

### Q2. 기존 API와 무엇이 다른가요?
기존 API가 시스템 간의 원시 데이터 교환이라면, MCP는 AI 모델이 이해하기 쉬운 형태(리소스, 프롬프트, 도구)로 컨텍스트를 규격화하여 제공합니다.

---

## 5. 참고 출처 (Sources)
- [Anthropic Model Context Protocol Specification](https://modelcontextprotocol.io) (Tier 1 공식 표준 문서)
- [AI Research Institute 2026 Agent Report](https://research.techplatform.example) (Tier 1 연구 보고서)
`,
      status: "HUMAN_REVIEW",
      language: "ko",
      seo_title: "MCP(Model Context Protocol) 완벽 가이드 | AI 에이전트 표준",
      meta_description: "MCP(Model Context Protocol)의 개념, 아키텍처, 기존 API와의 차이점 및 실전 활용법을 총정리한 완벽 가이드입니다.",
      primary_keyword: "MCP 프로토콜",
      secondary_keywords: ["Model Context Protocol", "AI 에이전트 도구 연동", "Anthropic MCP"],
      word_count: 1450,
      seo_score: 94,
      fact_check_score: 96,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      published_at: null,
    },
  ],

  articleClaims: [
    {
      id: "clm-1",
      article_id: "art-1",
      claim: "MCP는 Anthropic에 의해 2024년 말 오픈소스로 최초 공개된 프로토콜이다.",
      source_id: "src-1",
      source_name: "Anthropic MCP Docs",
      source_url: "https://modelcontextprotocol.io",
      confidence: 0.98,
      verification_status: "VERIFIED",
      category: "GENERAL",
      notes: "공식 깃허브 및 릴리즈 노트 확인 완료",
    },
    {
      id: "clm-2",
      article_id: "art-1",
      claim: "MCP는 Host, Client, Server의 3계층 아키텍처로 도구 및 리소스를 격리 실행한다.",
      source_id: "src-1",
      source_name: "Anthropic MCP Docs",
      source_url: "https://modelcontextprotocol.io",
      confidence: 0.95,
      verification_status: "VERIFIED",
      category: "SPECS",
      notes: "공식 아키텍처 사양 일치",
    },
  ],

  articleSources: [
    {
      id: "as-1",
      article_id: "art-1",
      source_id: "src-1",
      relevance_score: 95,
    },
    {
      id: "as-2",
      article_id: "art-1",
      source_id: "src-2",
      relevance_score: 88,
    },
  ],

  internalLinks: [
    {
      id: "il-1",
      source_article_id: "art-1",
      target_article_id: "art-1",
      target_title: "AI 에이전트 vs 기존 챗봇 비교 분석",
      target_slug: "ai-agent-vs-chatbot-comparison",
      relevance_score: 92,
      anchor_text: "AI 에이전트의 자율 실행 개념과 작동 방식",
      recommended_location: "섹션 1(What Happened)의 '자율 에이전트' 문맥",
      applied: false,
    },
  ],

  aiUsageLogs: [
    {
      id: "usage-1",
      provider: "omniroute",
      model: "gpt-4o",
      operation: "ARTICLE_GENERATION",
      input_tokens: 3840,
      output_tokens: 2150,
      estimated_cost: 0.0311,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "usage-2",
      provider: "omniroute",
      model: "gpt-4o",
      operation: "FACT_CHECK",
      input_tokens: 1820,
      output_tokens: 650,
      estimated_cost: 0.011,
      created_at: new Date(Date.now() - 86000000).toISOString(),
    },
  ],

  settings: {
    scoring_weights: DEFAULT_SCORING_WEIGHTS,
    ai_config: {
      defaultModel: "gpt-4o",
      fastModel: "gpt-4o-mini",
      temperature: 0.7,
      contentLanguage: "ko",
      defaultArticleLength: 2500,
    },
  },
};

// Singleton in-memory store backed by file persistence
class PersistentDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = loadDataFromFile<DatabaseSchema>(INITIAL_SEED_DATA);
  }

  private persist() {
    saveDataToFile(this.data);
  }

  get trends(): Trend[] {
    return this.data.trends;
  }
  get topics(): Topic[] {
    return this.data.topics;
  }
  get articles(): Article[] {
    return this.data.articles;
  }
  get sources(): Source[] {
    return this.data.sources;
  }
  get articleSources(): ArticleSource[] {
    return this.data.articleSources;
  }
  get articleClaims(): ArticleClaim[] {
    return this.data.articleClaims;
  }
  get internalLinks(): InternalLinkRecommendation[] {
    return this.data.internalLinks;
  }
  get aiUsageLogs(): AIUsageLog[] {
    return this.data.aiUsageLogs;
  }
  get settings(): Record<string, any> {
    return this.data.settings;
  }

  sync() {
    this.persist();
  }
}

export const dbInstance = new PersistentDatabase();

// Unified Database Access Functions
export async function getTrends(): Promise<Trend[]> {
  return [...dbInstance.trends].sort((a, b) => b.opportunity_score - a.opportunity_score);
}

export async function getTrendById(id: string): Promise<Trend | undefined> {
  return dbInstance.trends.find((t) => t.id === id);
}

export async function saveTrends(newTrends: Trend[]): Promise<void> {
  for (const item of newTrends) {
    const idx = dbInstance.trends.findIndex((t) => t.id === item.id || t.title === item.title);
    if (idx >= 0) {
      dbInstance.trends[idx] = { ...dbInstance.trends[idx], ...item };
    } else {
      dbInstance.trends.unshift(item);
    }
  }
  dbInstance.sync();
}

export async function updateTrendStatus(id: string, status: Trend["status"]): Promise<void> {
  const trend = dbInstance.trends.find((t) => t.id === id);
  if (trend) {
    trend.status = status;
    dbInstance.sync();
  }
}

export async function getTopics(): Promise<Topic[]> {
  return [...dbInstance.topics].sort((a, b) => b.opportunity_score - a.opportunity_score);
}

export async function getTopicById(id: string): Promise<Topic | undefined> {
  return dbInstance.topics.find((t) => t.id === id);
}

export async function saveTopics(newTopics: Topic[]): Promise<void> {
  for (const item of newTopics) {
    const idx = dbInstance.topics.findIndex((t) => t.id === item.id || t.title === item.title);
    if (idx >= 0) {
      dbInstance.topics[idx] = { ...dbInstance.topics[idx], ...item };
    } else {
      dbInstance.topics.unshift(item);
    }
  }
  dbInstance.sync();
}

export async function getArticles(): Promise<Article[]> {
  return [...dbInstance.articles].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getArticleById(id: string): Promise<Article | undefined> {
  return dbInstance.articles.find((a) => a.id === id);
}

export async function saveArticle(article: Article): Promise<void> {
  const idx = dbInstance.articles.findIndex((a) => a.id === article.id);
  if (idx >= 0) {
    dbInstance.articles[idx] = { ...dbInstance.articles[idx], ...article, updated_at: new Date().toISOString() };
  } else {
    dbInstance.articles.unshift(article);
  }
  dbInstance.sync();
}

export async function getSources(articleId?: string): Promise<Source[]> {
  if (!articleId) return dbInstance.sources;
  const sourceIds = dbInstance.articleSources
    .filter((as) => as.article_id === articleId)
    .map((as) => as.source_id);
  return dbInstance.sources.filter((s) => sourceIds.includes(s.id));
}

export async function saveSource(source: Source): Promise<void> {
  const idx = dbInstance.sources.findIndex((s) => s.id === source.id);
  if (idx >= 0) {
    dbInstance.sources[idx] = { ...dbInstance.sources[idx], ...source };
  } else {
    dbInstance.sources.unshift(source);
  }
  dbInstance.sync();
}

export async function deleteSource(id: string): Promise<void> {
  const idx = dbInstance.sources.findIndex((s) => s.id === id);
  if (idx >= 0) {
    dbInstance.sources.splice(idx, 1);
    dbInstance.sync();
  }
}

export async function attachSourceToArticle(articleId: string, sourceId: string): Promise<void> {
  const exists = dbInstance.articleSources.some(
    (as) => as.article_id === articleId && as.source_id === sourceId
  );
  if (!exists) {
    dbInstance.articleSources.push({
      id: nanoid(),
      article_id: articleId,
      source_id: sourceId,
      relevance_score: 90,
    });
    dbInstance.sync();
  }
}

export async function detachSourceFromArticle(articleId: string, sourceId: string): Promise<void> {
  const idx = dbInstance.articleSources.findIndex(
    (as) => as.article_id === articleId && as.source_id === sourceId
  );
  if (idx >= 0) {
    dbInstance.articleSources.splice(idx, 1);
    dbInstance.sync();
  }
}

export async function getClaims(articleId?: string): Promise<ArticleClaim[]> {
  if (!articleId) return dbInstance.articleClaims;
  return dbInstance.articleClaims.filter((c) => c.article_id === articleId);
}

export async function saveClaims(claims: ArticleClaim[]): Promise<void> {
  for (const claim of claims) {
    const idx = dbInstance.articleClaims.findIndex((c) => c.id === claim.id);
    if (idx >= 0) dbInstance.articleClaims[idx] = claim;
    else dbInstance.articleClaims.unshift(claim);
  }
  dbInstance.sync();
}

export async function saveClaim(claim: ArticleClaim): Promise<void> {
  const idx = dbInstance.articleClaims.findIndex((c) => c.id === claim.id);
  if (idx >= 0) dbInstance.articleClaims[idx] = claim;
  else dbInstance.articleClaims.unshift(claim);
  dbInstance.sync();
}

export async function deleteClaim(id: string): Promise<void> {
  const idx = dbInstance.articleClaims.findIndex((c) => c.id === id);
  if (idx >= 0) {
    dbInstance.articleClaims.splice(idx, 1);
    dbInstance.sync();
  }
}

export async function updateClaimStatus(
  id: string,
  status: ArticleClaim["verification_status"]
): Promise<void> {
  const claim = dbInstance.articleClaims.find((c) => c.id === id);
  if (claim) {
    claim.verification_status = status;
    dbInstance.sync();
  }
}

export async function getInternalLinks(articleId?: string): Promise<InternalLinkRecommendation[]> {
  if (!articleId) return dbInstance.internalLinks;
  return dbInstance.internalLinks.filter((il) => il.source_article_id === articleId);
}

export async function saveInternalLinks(links: InternalLinkRecommendation[]): Promise<void> {
  for (const link of links) {
    const idx = dbInstance.internalLinks.findIndex((l) => l.id === link.id);
    if (idx >= 0) dbInstance.internalLinks[idx] = link;
    else dbInstance.internalLinks.unshift(link);
  }
  dbInstance.sync();
}

export async function getAIUsage(): Promise<AIUsageLog[]> {
  return [...dbInstance.aiUsageLogs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function saveAIUsage(log: AIUsageLog): Promise<void> {
  dbInstance.aiUsageLogs.unshift(log);
  dbInstance.sync();
}

export async function getSettings(): Promise<Record<string, any>> {
  return dbInstance.settings;
}

export async function updateSettings(key: string, value: any): Promise<void> {
  dbInstance.settings[key] = value;
  dbInstance.sync();
}
