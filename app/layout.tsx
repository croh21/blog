import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrendPilot AI — AI Trend Intelligence & Blog Monetization",
  description: "최신 트렌드 발굴부터 고수익 토픽 선정, 팩트 기반 AI 리서치 및 SEO 글 작성, WordPress 승인 발행까지 지원하는 올인원 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full font-sans antialiased bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
