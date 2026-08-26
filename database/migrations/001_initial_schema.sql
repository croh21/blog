-- =============================================================================
-- TrendPilot AI: Initial PostgreSQL Schema (Migration 001)
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'EDITOR', 'VIEWER')) DEFAULT 'EDITOR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TRENDS
CREATE TABLE IF NOT EXISTS trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    source_url TEXT NOT NULL,
    source_name TEXT NOT NULL,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    trend_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    search_growth DOUBLE PRECISION NOT NULL DEFAULT 0,
    search_volume DOUBLE PRECISION NOT NULL DEFAULT 0,
    competition_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    commercial_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    evergreen_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    social_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    opportunity_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('DISCOVERED', 'ANALYZED', 'SELECTED', 'REJECTED')) DEFAULT 'DISCOVERED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TOPICS
CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trend_id UUID REFERENCES trends(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    primary_keyword TEXT NOT NULL,
    secondary_keywords JSONB DEFAULT '[]'::jsonb,
    search_intent TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN (
        'NEWS_ANALYSIS', 'EXPLAINER', 'HOW_TO', 'COMPARISON', 
        'BUYING_GUIDE', 'TREND_REPORT', 'DATA_ANALYSIS', 
        'FORECAST', 'EVERGREEN', 'FAQ'
    )),
    estimated_traffic DOUBLE PRECISION NOT NULL DEFAULT 0,
    competition TEXT NOT NULL CHECK (competition IN ('LOW', 'MEDIUM', 'HIGH')),
    commercial_value DOUBLE PRECISION NOT NULL DEFAULT 0,
    evergreen_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    opportunity_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    why_this_topic TEXT NOT NULL,
    recommended_length INTEGER NOT NULL DEFAULT 2000,
    status TEXT NOT NULL CHECK (status IN ('PROPOSED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'DISMISSED')) DEFAULT 'PROPOSED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ARTICLES
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT DEFAULT '',
    content TEXT DEFAULT '',
    outline JSONB DEFAULT '[]'::jsonb,
    research_plan JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL CHECK (status IN (
        'DRAFT', 'RESEARCHING', 'WRITING', 'FACT_CHECK', 
        'SEO_REVIEW', 'HUMAN_REVIEW', 'APPROVED', 'SCHEDULED', 
        'PUBLISHED', 'UPDATE_REQUIRED'
    )) DEFAULT 'DRAFT',
    language TEXT NOT NULL DEFAULT 'ko',
    seo_title TEXT DEFAULT '',
    meta_description TEXT DEFAULT '',
    primary_keyword TEXT DEFAULT '',
    secondary_keywords JSONB DEFAULT '[]'::jsonb,
    word_count INTEGER DEFAULT 0,
    seo_score DOUBLE PRECISION DEFAULT 0,
    fact_check_score DOUBLE PRECISION DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- 6. SOURCES
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    publisher TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN (
        'OFFICIAL', 'GOVERNMENT', 'RESEARCH', 'NEWS', 
        'COMPANY', 'COMMUNITY', 'SOCIAL', 'OTHER'
    )),
    tier INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 4) DEFAULT 2,
    reliability_score DOUBLE PRECISION NOT NULL DEFAULT 70,
    published_at TIMESTAMPTZ,
    accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ARTICLE_SOURCES (Junction)
CREATE TABLE IF NOT EXISTS article_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    relevance_score DOUBLE PRECISION NOT NULL DEFAULT 80,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ARTICLE_CLAIMS (Fact Check)
CREATE TABLE IF NOT EXISTS article_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    claim TEXT NOT NULL,
    source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
    confidence DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    verification_status TEXT NOT NULL CHECK (verification_status IN (
        'VERIFIED', 'PARTIALLY_VERIFIED', 'UNVERIFIED', 'CONFLICTING'
    )) DEFAULT 'UNVERIFIED',
    category TEXT DEFAULT 'GENERAL',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. KEYWORDS
CREATE TABLE IF NOT EXISTS keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword TEXT UNIQUE NOT NULL,
    search_volume DOUBLE PRECISION NOT NULL DEFAULT 0,
    competition DOUBLE PRECISION NOT NULL DEFAULT 0,
    commercial_value DOUBLE PRECISION NOT NULL DEFAULT 0,
    trend DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. INTERNAL_LINKS
CREATE TABLE IF NOT EXISTS internal_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    target_article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    relevance_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    anchor_text TEXT NOT NULL,
    recommended_location TEXT,
    applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. PUBLISHING_QUEUE
CREATE TABLE IF NOT EXISTS publishing_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    published_at TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')) DEFAULT 'PENDING',
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. ANALYTICS
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    ctr DOUBLE PRECISION DEFAULT 0,
    average_position DOUBLE PRECISION DEFAULT 0,
    sessions INTEGER DEFAULT 0,
    engagement DOUBLE PRECISION DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. REVENUE
CREATE TABLE IF NOT EXISTS revenue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    pageviews INTEGER DEFAULT 0,
    estimated_revenue DOUBLE PRECISION DEFAULT 0,
    rpm DOUBLE PRECISION DEFAULT 0,
    ad_clicks INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. AI_USAGE (Cost Tracking)
CREATE TABLE IF NOT EXISTS ai_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    operation TEXT NOT NULL,
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    estimated_cost DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. SETTINGS
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trends_opportunity ON trends(opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_topics_opportunity ON topics(opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_claims_article ON article_claims(article_id);
CREATE INDEX IF NOT EXISTS idx_analytics_article_date ON analytics(article_id, date);
CREATE INDEX IF NOT EXISTS idx_revenue_article_date ON revenue(article_id, date);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON ai_usage(created_at);

-- Initial Categories Seed Data
INSERT INTO categories (id, name, slug, description) VALUES
    ('11111111-1111-1111-1111-111111111111', 'AI & Machine Learning', 'ai-ml', '최신 AI 모델, LLM, 자율 에이전트 및 머신러닝 동향'),
    ('22222222-2222-2222-2222-222222222222', 'Tech & Productivity', 'tech-productivity', '생산성 도구, SaaS 및 개발 기술 트렌드'),
    ('33333333-3333-3333-3333-333333333333', 'Digital Marketing & SEO', 'digital-marketing', '검색엔진 최적화 및 디지털 콘텐츠 수익화 전략'),
    ('44444444-4444-4444-4444-444444444444', 'Business & Finance', 'business-finance', '글로벌 테크 기업 실적 및 핀테크 시장 동향')
ON CONFLICT (slug) DO NOTHING;

-- Initial Settings Seed Data
INSERT INTO settings (key, value) VALUES
    ('scoring_weights', '{"searchGrowth": 0.20, "searchVolume": 0.15, "newsMomentum": 0.10, "socialInterest": 0.10, "commercialValue": 0.20, "evergreen": 0.15, "competition": 0.10}'::jsonb),
    ('ai_config', '{"defaultModel": "gpt-4o", "fastModel": "gpt-4o-mini", "temperature": 0.7, "maxTokens": 4000}'::jsonb)
ON CONFLICT (key) DO NOTHING;
