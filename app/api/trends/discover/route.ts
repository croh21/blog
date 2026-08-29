import { NextResponse } from "next/server";
import { trendProvider } from "@/lib/providers/trends";
import { saveTrends, getTrends } from "@/lib/db";

export async function POST() {
  try {
    const discovered = await trendProvider.discoverTrends();
    await saveTrends(discovered, true);
    const all = await getTrends();
    return NextResponse.json({ success: true, count: discovered.length, trends: all });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


export async function GET() {
  const trends = await getTrends();
  return NextResponse.json({ trends });
}
