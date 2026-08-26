import { NextResponse } from "next/server";
import { getArticles } from "@/lib/db";

export async function GET() {
  const articles = await getArticles();
  return NextResponse.json({ articles });
}
