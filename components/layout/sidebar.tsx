"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Sparkles,
  FileText,
  BookmarkCheck,
  Search,
  BarChart3,
  DollarSign,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Trends", href: "/trends", icon: TrendingUp },
  { label: "Topics", href: "/topics", icon: Sparkles },
  { label: "Articles", href: "/articles", icon: FileText },
  { label: "Sources", href: "/sources", icon: BookmarkCheck },
  { label: "SEO Engine", href: "/seo", icon: Search },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Revenue", href: "/revenue", icon: DollarSign },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
          <Zap className="h-5 w-5 fill-current" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            TrendPilot <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold">AI</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">Blog Monetization Platform</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Core Workflows
        </div>
        {NAV_ITEMS.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-semibold shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400")} />
              {item.label}
            </Link>
          );
        })}

        <div className="px-3 pt-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Intelligence & Tools
        </div>
        {NAV_ITEMS.slice(4).map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-semibold shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Gateway & Environment Status Card */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">OmniRoute AI</span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">http://localhost:20128/v1</p>
        </div>
      </div>
    </aside>
  );
}
