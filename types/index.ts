export type UserRole = "ADMIN" | "EDITOR" | "VIEWER";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
}

export type TrendStatus = "DISCOVERED" | "ANALYZED" | "SELECTED" | "REJECTED";

export interface Trend {
  id: string;
  title: string;
  description: string;
  category_id?: string | null;
  category_name?: string;
  source_url: string;
  source_name: string;
  published_at: string;
  collected_at: string;
  trend_score: number;       // 0~100
  search_growth: number;     // 0~100 (%)
  search_volume: number;     // 0~100
  competition_score: number; // 0~100
  commercial_score: number;  // 0~100
  evergreen_score: number;   // 0~100
  social_score: number;      // 0~100
  opportunity_score: number; // Computed 0~100
  status: TrendStatus;
  created_at: string;
}

export type ContentType =
  | "NEWS_ANALYSIS"
  | "EXPLAINER"
  | "HOW_TO"
  | "COMPARISON"
  | "BUYING_GUIDE"
  | "TREND_REPORT"
  | "DATA_ANALYSIS"
  | "FORECAST"
  | "EVERGREEN"
  | "FAQ";

export type TopicStatus = "PROPOSED" | "APPROVED" | "IN_PROGRESS" | "COMPLETED" | "DISMISSED";

export interface Topic {
  id: string;
  trend_id?: string | null;
  title: string;
  primary_keyword: string;
  secondary_keywords: string[];
  search_intent: string;
  content_type: ContentType;
  estimated_traffic: number;
  competition: "LOW" | "MEDIUM" | "HIGH";
  commercial_value: number;
  evergreen_score: number;
  opportunity_score: number;
  why_this_topic: string;
  recommended_length: number;
  status: TopicStatus;
  created_at: string;
}

export type ArticleStatus =
  | "DRAFT"
  | "RESEARCHING"
  | "WRITING"
  | "FACT_CHECK"
  | "SEO_REVIEW"
  | "HUMAN_REVIEW"
  | "APPROVED"
  | "SCHEDULED"
  | "PUBLISHED"
  | "UPDATE_REQUIRED";

export interface ArticleOutlineSection {
  heading: string;
  level: number; // 1, 2, 3
  description: string;
  keyPoints?: string[];
}

export interface ResearchPlan {
  coreQuestions: string[];
  targetAudience: string;
  dataPointsNeeded: string[];
  differentiators: string[];
}

export interface Article {
  id: string;
  topic_id?: string | null;
  category_id?: string | null;
  category_name?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  outline?: ArticleOutlineSection[];
  research_plan?: ResearchPlan;
  status: ArticleStatus;
  language: string;
  seo_title: string;
  meta_description: string;
  primary_keyword: string;
  secondary_keywords: string[];
  word_count: number;
  seo_score: number;
  fact_check_score: number;
  source_score?: number;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
}

export type SourceType =
  | "OFFICIAL"
  | "GOVERNMENT"
  | "RESEARCH"
  | "NEWS"
  | "COMPANY"
  | "COMMUNITY"
  | "SOCIAL"
  | "OTHER";

export type SourceTier = 1 | 2 | 3 | 4;

export interface Source {
  id: string;
  title: string;
  url: string;
  publisher: string;
  source_type: SourceType;
  tier: SourceTier;
  reliability_score: number;
  published_at?: string;
  accessed_at: string;
  created_at: string;
}

export interface ArticleSource {
  id: string;
  article_id: string;
  source_id: string;
  source?: Source;
  relevance_score: number;
}

export type ClaimVerificationStatus =
  | "VERIFIED"
  | "PARTIALLY_VERIFIED"
  | "UNVERIFIED"
  | "CONFLICTING";

export interface ArticleClaim {
  id: string;
  article_id: string;
  claim: string;
  source_id?: string | null;
  source_name?: string;
  source_url?: string;
  confidence: number;
  verification_status: ClaimVerificationStatus;
  category?: "STATISTICS" | "PRICING" | "LEGAL" | "SPECS" | "GENERAL";
  notes?: string;
}

export interface InternalLinkRecommendation {
  id: string;
  source_article_id: string;
  target_article_id: string;
  target_title: string;
  target_slug: string;
  relevance_score: number;
  anchor_text: string;
  recommended_location: string;
  applied: boolean;
}

export interface SEOScoreBreakdown {
  overallScore: number;
  searchIntentScore: number;
  titleScore: number;
  metaDescriptionScore: number;
  headingStructureScore: number;
  keywordRelevanceScore: number;
  contentCompletenessScore: number;
  internalLinksScore: number;
  externalSourcesScore: number;
  readabilityScore: number;
  originalAnalysisScore: number;
  recommendations: string[];
}

export interface AIUsageLog {
  id: string;
  user_id?: string;
  provider: string;
  model: string;
  operation: string;
  input_tokens: number;
  output_tokens: number;
  estimated_cost: number;
  created_at: string;
}

export interface ScoringWeights {
  searchGrowth: number;    // 0.20
  searchVolume: number;    // 0.15
  newsMomentum: number;    // 0.10
  socialInterest: number;  // 0.10
  commercialValue: number; // 0.20
  evergreen: number;       // 0.15
  competition: number;     // 0.10 (reversed)
}
