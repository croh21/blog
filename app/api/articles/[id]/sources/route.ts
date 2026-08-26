import { NextResponse } from "next/server";
import { attachSourceToArticle, detachSourceFromArticle, getSources } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { sourceId } = body;
    if (!sourceId) {
      return NextResponse.json({ error: "sourceId is required" }, { status: 400 });
    }
    await attachSourceToArticle(id, sourceId);
    const sources = await getSources(id);
    return NextResponse.json({ success: true, sources });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const sourceId = searchParams.get("sourceId");
    if (!sourceId) {
      return NextResponse.json({ error: "sourceId is required" }, { status: 400 });
    }
    await detachSourceFromArticle(id, sourceId);
    const sources = await getSources(id);
    return NextResponse.json({ success: true, sources });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
