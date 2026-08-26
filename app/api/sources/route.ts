import { NextResponse } from "next/server";
import { getSources, saveSource, deleteSource } from "@/lib/db";
import { determineSourceTier, calculateSourceReliabilityScore } from "@/lib/scoring/reliability-scorer";
import { nanoid } from "nanoid";
import { Source } from "@/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const articleId = searchParams.get("articleId") || undefined;
  const sources = await getSources(articleId);
  return NextResponse.json({ sources });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const tier = body.tier || determineSourceTier(body.source_type || "OTHER");
    const reliability_score = body.reliability_score || calculateSourceReliabilityScore(tier, Boolean(body.published_at));

    const newSource: Source = {
      id: body.id || nanoid(),
      title: body.title || "Untitled Source",
      url: body.url || "",
      publisher: body.publisher || "Unknown",
      source_type: body.source_type || "OTHER",
      tier,
      reliability_score,
      published_at: body.published_at || new Date().toISOString(),
      accessed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    await saveSource(newSource);
    const all = await getSources();
    return NextResponse.json({ success: true, source: newSource, sources: all });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Source ID is required" }, { status: 400 });
    }
    await saveSource(body);
    const all = await getSources();
    return NextResponse.json({ success: true, source: body, sources: all });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Source ID is required" }, { status: 400 });
    }
    await deleteSource(id);
    const all = await getSources();
    return NextResponse.json({ success: true, sources: all });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
