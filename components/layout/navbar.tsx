"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, ShieldCheck, Flame, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavFindTrends = () => {
    router.push(`/trends?action=discover&t=${Date.now()}`);
  };

  const handleNavTopicGen = () => {
    router.push(`/topics?action=generate&t=${Date.now()}`);
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 py-1 text-slate-600 dark:text-slate-300 font-normal">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Human-in-the-Loop Safe Mode: Active</span>
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleNavTopicGen}
          className="gap-2 text-xs font-medium border-amber-300 dark:border-amber-700/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-700 dark:text-amber-300"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          Topic Generator
        </Button>

        <Button
          size="sm"
          variant="gradient"
          onClick={handleNavFindTrends}
          className="gap-1.5 text-xs font-semibold shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Flame className="h-3.5 w-3.5 fill-current text-white animate-bounce" />
          Find Trends
        </Button>

        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
          AD
        </div>
      </div>
    </header>
  );
}

