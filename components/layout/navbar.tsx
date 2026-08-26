"use client";

import Link from "next/link";
import { Sparkles, Bell, HelpCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 py-1 text-slate-600 dark:text-slate-300 font-normal">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Human-in-the-Loop Safe Mode: Active</span>
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/topics">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Topic Generator
          </Button>
        </Link>
        <Link href="/trends">
          <Button size="sm" variant="gradient" className="gap-1.5 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            Find Trends
          </Button>
        </Link>
        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
          AD
        </div>
      </div>
    </header>
  );
}
