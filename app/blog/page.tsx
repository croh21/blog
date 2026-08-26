import Link from "next/link";
import { getArticles } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import {
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  Bookmark,
  Search,
  BookOpen,
} from "lucide-react";

export const metadata = {
  title: "TrendPilot Blog | 최신 건강 & 테크 인텔리전스",
  description: "과학적 연구 기반의 저속노화 식단, 영양 가이드 및 AI 테크 트렌드 심층 분석 블로그입니다.",
};

export default async function PublicBlogPage() {
  const allArticles = await getArticles();
  // Show published or approved articles on the public blog
  const articles = allArticles.filter(
    (a) => a.status === "PUBLISHED" || a.status === "APPROVED"
  );

  const featuredPost = articles[0];
  const regularPosts = articles.slice(1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Public Blog Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-md">
              TP
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              TrendPilot Insights
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-slate-500 hover:text-blue-600 font-medium">
              관리자 대시보드
            </Link>
            <Link href="/articles">
              <Button size="sm" variant="gradient" className="text-xs gap-1">
                <Sparkles className="h-3.5 w-3.5" /> AI 글 작성하기
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-blue-900/10 via-slate-50 to-slate-50 dark:from-blue-950/30 dark:via-slate-950 dark:to-slate-950 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <Badge variant="opportunity" className="px-3 py-1 font-bold text-xs">
            🌿 Scientific Wellness & AI Trends
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            건강한 삶과 스마트한 미래를 위한 지식 탐색
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            하버드 의대 등 공인된 연구 기반의 저속노화 식단, 수면 최적화, 맞춤 영양 솔루션과 차세대 AI 생산성 트렌드를 가장 깊이 있게 전해드립니다.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        {/* Featured Main Post */}
        {featuredPost && (
          <div className="relative group rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {featuredPost.featured_image_url && (
                <div className="lg:col-span-7 h-64 sm:h-80 lg:h-full relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={featuredPost.featured_image_url}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="purple" className="shadow-md">
                      Featured Post
                    </Badge>
                  </div>
                </div>
              )}

              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {featuredPost.category_name || "건강 & 웰니스"}
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">
                      {Math.ceil((featuredPost.word_count || 1400) / 250)}분 완독
                    </span>
                  </div>

                  <Link href={`/blog/${featuredPost.slug}`}>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors leading-snug">
                      {featuredPost.title}
                    </h2>
                  </Link>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {featuredPost.excerpt || featuredPost.meta_description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(featuredPost.created_at)}</span>
                  </div>

                  <Link href={`/blog/${featuredPost.slug}`}>
                    <Button variant="default" size="sm" className="gap-1 text-xs font-semibold">
                      글 읽기 <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular Posts Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-xl tracking-tight flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Latest Articles ({articles.length}편)
            </h3>
            <span className="text-xs text-slate-400">자체 호스팅 Vercel 블로그</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((art) => (
              <Card
                key={art.id}
                className="group flex flex-col justify-between overflow-hidden hover:shadow-lg transition-all duration-300 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                {art.featured_image_url && (
                  <div className="h-44 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={art.featured_image_url}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px]">
                        {art.category_name || "건강 & 웰니스"}
                      </Badge>
                      <span className="text-[11px] text-slate-400">
                        {Math.ceil((art.word_count || 1400) / 250)} min read
                      </span>
                    </div>

                    <Link href={`/blog/${art.slug}`}>
                      <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                        {art.title}
                      </h4>
                    </Link>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {art.excerpt || art.meta_description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      {formatDate(art.created_at)}
                    </span>
                    <Link
                      href={`/blog/${art.slug}`}
                      className="font-semibold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-1"
                    >
                      더 보기 <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 py-10 bg-white dark:bg-slate-900 text-center text-xs text-slate-400 space-y-2">
        <p>© 2026 TrendPilot AI • Powered by Next.js, GitHub & Vercel</p>
        <p>검증된 데이터와 과학적 팩트체크 기반 고품질 콘텐츠 엔진</p>
      </footer>
    </div>
  );
}
