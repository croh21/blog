import { NextResponse } from "next/server";
import { trendProvider } from "@/lib/providers/trends";
import { saveTrends, getTrends } from "@/lib/db";

export async function POST(req: Request) {
  try {
    let category: string | undefined = undefined;
    try {
      const body = await req.json();
      if (body?.category) category = body.category;
    } catch {
      // ignore json parse error on empty body
    }

    const discovered = await trendProvider.discoverTrends(category);
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
